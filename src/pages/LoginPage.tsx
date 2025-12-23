import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';
import './LoginPage.css';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 登录
        await authService.login(email, password);
        
        // 询问是否下载服务器数据
        const shouldDownload = window.confirm(
          '检测到服务器有备份数据，是否下载并合并？\n' +
          '选择"确定"：下载服务器数据并与本地数据合并\n' +
          '选择"取消"：保留本地数据并上传到服务器'
        );

        if (shouldDownload) {
          await syncService.mergeData();
        } else {
          await syncService.uploadAll();
        }

        // 启动自动同步
        syncService.startAutoSync();
        
        alert('登录成功！');
        navigate('/');
      } else {
        // 注册
        if (password.length < 6) {
          setError('密码长度至少为6位');
          return;
        }

        await authService.register(username, email, password);
        
        // 上传本地数据到服务器
        await syncService.uploadAll();
        
        // 启动自动同步
        syncService.startAutoSync();
        
        alert('注册成功！');
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>⚡ 英语觉醒系统 ⚡</h1>
          <p>{isLogin ? '登录账号，同步学习进度' : '注册账号，开启学习之旅'}</p>
        </div>

        <div className="login-tabs">
          <button
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
          >
            登录
          </button>
          <button
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
          >
            注册
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div className="form-group">
            <label>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? '请输入密码' : '请输入密码（至少6位）'}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '处理中...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="login-footer">
          <p>💡 提示：登录后数据会自动同步到云端</p>
          <button
            className="skip-btn"
            onClick={() => navigate('/')}
          >
            暂时跳过，稍后登录
          </button>
        </div>
      </div>
    </div>
  );
}
