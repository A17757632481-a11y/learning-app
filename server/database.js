const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.db');
let db = null;

// 初始化数据库
async function initDatabase() {
  const SQL = await initSqlJs();
  
  // 尝试加载现有数据库
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS user_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      data_key TEXT NOT NULL,
      data_value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, data_key)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_data_key ON user_data(user_id, data_key)`);

  // 保存数据库
  saveDatabase();
  
  console.log('Database initialized successfully');
}

// 保存数据库到文件
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

// 用户相关操作
const userQueries = {
  create: (username, email, password) => {
    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid() as id');
    return { lastInsertRowid: result[0].values[0][0] };
  },
  
  findByEmail: (email) => {
    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const row = result[0].values[0];
    return {
      id: row[0],
      username: row[1],
      email: row[2],
      password: row[3],
      created_at: row[4],
      updated_at: row[5]
    };
  },
  
  findByUsername: (username) => {
    const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const row = result[0].values[0];
    return {
      id: row[0],
      username: row[1],
      email: row[2],
      password: row[3],
      created_at: row[4],
      updated_at: row[5]
    };
  },
  
  findById: (id) => {
    const result = db.exec('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const row = result[0].values[0];
    return {
      id: row[0],
      username: row[1],
      email: row[2],
      created_at: row[3]
    };
  }
};

// 数据同步相关操作
const dataQueries = {
  upsert: (userId, dataKey, dataValue) => {
    db.run(`
      INSERT INTO user_data (user_id, data_key, data_value, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, data_key) 
      DO UPDATE SET data_value = excluded.data_value, updated_at = CURRENT_TIMESTAMP
    `, [userId, dataKey, dataValue]);
    saveDatabase();
  },
  
  getAll: (userId) => {
    const result = db.exec('SELECT data_key, data_value, updated_at FROM user_data WHERE user_id = ?', [userId]);
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
      data_key: row[0],
      data_value: row[1],
      updated_at: row[2]
    }));
  },
  
  getByKey: (userId, dataKey) => {
    const result = db.exec('SELECT data_value, updated_at FROM user_data WHERE user_id = ? AND data_key = ?', [userId, dataKey]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const row = result[0].values[0];
    return {
      data_value: row[0],
      updated_at: row[1]
    };
  },
  
  deleteByKey: (userId, dataKey) => {
    db.run('DELETE FROM user_data WHERE user_id = ? AND data_key = ?', [userId, dataKey]);
    saveDatabase();
  },
  
  deleteAll: (userId) => {
    db.run('DELETE FROM user_data WHERE user_id = ?', [userId]);
    saveDatabase();
  },
  
  db: { transaction: (fn) => fn }
};

module.exports = {
  db,
  initDatabase,
  userQueries,
  dataQueries,
  saveDatabase
};
