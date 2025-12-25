# 英语学习系统 - 后端服务器

## 功能特性

- ✅ 用户注册/登录（JWT认证）
- ✅ 学习数据云端同步
- ✅ 自动备份（每5分钟）
- ✅ SQLite数据库（无需额外配置）
- ✅ 支持多用户数据隔离

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```
PORT=3001
JWT_SECRET=your-secret-key-change-this-in-production
DATABASE_PATH=./database.db
```

**重要：** 生产环境请务必修改 `JWT_SECRET` 为一个强随机字符串！

### 3. 启动服务器

开发模式（自动重启）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务器将在 `http://localhost:3001` 启动

## API接口文档

### 认证相关

#### 注册
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "email": "email@example.com",
  "password": "密码（至少6位）"
}
```

#### 登录
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "email@example.com",
  "password": "密码"
}
```

#### 获取当前用户信息
```
GET /api/auth/me
Authorization: Bearer <token>
```

### 数据同步相关

#### 上传所有数据
```
POST /api/sync/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": {
    "vocab-words": [...],
    "review-words": [...],
    ...
  }
}
```

#### 下载所有数据
```
GET /api/sync/download
Authorization: Bearer <token>
```

#### 同步单个数据项
```
POST /api/sync/item
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "vocab-words",
  "value": [...]
}
```

#### 删除单个数据项
```
DELETE /api/sync/item/:key
Authorization: Bearer <token>
```

#### 清空所有数据
```
DELETE /api/sync/all
Authorization: Bearer <token>
```

## 数据库结构

### users 表
- id: 用户ID（主键）
- username: 用户名（唯一）
- email: 邮箱（唯一）
- password: 加密密码
- created_at: 创建时间
- updated_at: 更新时间

### user_data 表
- id: 数据ID（主键）
- user_id: 用户ID（外键）
- data_key: 数据键名
- data_value: 数据值（JSON字符串）
- updated_at: 更新时间

## 部署建议

### 本地部署
1. 确保Node.js已安装（v14+）
2. 按照上述步骤安装和启动
3. 数据库文件会自动创建在 `server/database.db`

### 云服务器部署
1. 使用PM2管理进程：
```bash
npm install -g pm2
pm2 start server.js --name english-learning-api
pm2 save
pm2 startup
```

2. 使用Nginx反向代理：
```nginx
location /api {
    proxy_pass http://localhost:3001/api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### 安全建议
- ✅ 修改默认的JWT_SECRET
- ✅ 使用HTTPS（生产环境）
- ✅ 定期备份数据库文件
- ✅ 限制API请求频率
- ✅ 使用环境变量管理敏感信息

## 故障排查

### 端口被占用
修改 `.env` 中的 `PORT` 配置

### 数据库锁定
确保只有一个服务器实例在运行

### JWT验证失败
检查token是否过期，重新登录获取新token

## 技术栈

- Node.js + Express
- better-sqlite3（SQLite数据库）
- jsonwebtoken（JWT认证）
- bcryptjs（密码加密）
- cors（跨域支持）
