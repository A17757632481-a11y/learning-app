require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initDatabase, userQueries, dataQueries, saveDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 初始化数据库（异步）
let dbReady = false;
initDatabase().then(() => {
  dbReady = true;
  console.log('Database ready');
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

// 数据库就绪检查中间件
function checkDbReady(req, res, next) {
  if (!dbReady) {
    return res.status(503).json({ error: '数据库正在初始化，请稍后重试' });
  }
  next();
}

// JWT验证中间件
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '令牌无效或已过期' });
    }
    req.user = user;
    next();
  });
}

// ========== 认证相关API ==========

// 注册
app.post('/api/auth/register', checkDbReady, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证输入
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' });
    }

    // 检查用户是否已存在
    const existingUser = userQueries.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    const existingUsername = userQueries.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: '该用户名已被使用' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const result = userQueries.create(username, email, hashedPassword);
    const userId = result.lastInsertRowid;

    // 生成JWT
    const token = jwt.sign({ userId, username, email }, JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      message: '注册成功',
      token,
      user: { id: userId, username, email }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

// 登录
app.post('/api/auth/login', checkDbReady, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    // 查找用户
    const user = userQueries.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: '登录成功',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败，请稍后重试' });
  }
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, checkDbReady, (req, res) => {
  try {
    const user = userQueries.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// ========== 数据同步API ==========

// 同步所有数据到服务器
app.post('/api/sync/upload', authenticateToken, checkDbReady, (req, res) => {
  try {
    const { data } = req.body;
    const userId = req.user.userId;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: '数据格式不正确' });
    }

    // 批量插入/更新数据
    Object.entries(data).forEach(([key, value]) => {
      dataQueries.upsert(userId, key, JSON.stringify(value));
    });
    
    saveDatabase();

    res.json({ message: '数据同步成功', count: Object.keys(data).length });
  } catch (error) {
    console.error('Upload sync error:', error);
    res.status(500).json({ error: '数据同步失败' });
  }
});

// 从服务器下载所有数据
app.get('/api/sync/download', authenticateToken, checkDbReady, (req, res) => {
  try {
    const userId = req.user.userId;
    const rows = dataQueries.getAll(userId);

    const data = {};
    rows.forEach(row => {
      try {
        data[row.data_key] = JSON.parse(row.data_value);
      } catch {
        data[row.data_key] = row.data_value;
      }
    });

    res.json({ data, count: rows.length });
  } catch (error) {
    console.error('Download sync error:', error);
    res.status(500).json({ error: '获取数据失败' });
  }
});

// 同步单个数据项
app.post('/api/sync/item', authenticateToken, checkDbReady, (req, res) => {
  try {
    const { key, value } = req.body;
    const userId = req.user.userId;

    if (!key) {
      return res.status(400).json({ error: '数据键不能为空' });
    }

    dataQueries.upsert(userId, key, JSON.stringify(value));
    saveDatabase();

    res.json({ message: '数据项同步成功' });
  } catch (error) {
    console.error('Sync item error:', error);
    res.status(500).json({ error: '数据项同步失败' });
  }
});

// 删除单个数据项
app.delete('/api/sync/item/:key', authenticateToken, checkDbReady, (req, res) => {
  try {
    const { key } = req.params;
    const userId = req.user.userId;

    dataQueries.deleteByKey(userId, key);
    saveDatabase();

    res.json({ message: '数据项删除成功' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: '数据项删除失败' });
  }
});

// 清空所有数据
app.delete('/api/sync/all', authenticateToken, checkDbReady, (req, res) => {
  try {
    const userId = req.user.userId;
    dataQueries.deleteAll(userId);
    saveDatabase();

    res.json({ message: '所有数据已清空' });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ error: '清空数据失败' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - POST /api/auth/register`);
  console.log(`  - POST /api/auth/login`);
  console.log(`  - GET  /api/auth/me`);
  console.log(`  - POST /api/sync/upload`);
  console.log(`  - GET  /api/sync/download`);
  console.log(`  - POST /api/sync/item`);
  console.log(`  - DELETE /api/sync/item/:key`);
});
