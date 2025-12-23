import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { backgroundService, PRESET_BACKGROUNDS } from '../services/backgroundService';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';
import { FloatingTranslator } from './FloatingTranslator';
import './Layout.css';

export function Layout() {
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showPracticeMenu, setShowPracticeMenu] = useState(false);
  const [showLearnMenu, setShowLearnMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [currentBg, setCurrentBg] = useState('');
  const [bgOpacity, setBgOpacity] = useState(() => {
    return backgroundService.getOpacity();
  });
  const [brightness, setBrightness] = useState(() => {
    return backgroundService.getBrightness();
  });
  const [eyeCareMode, setEyeCareMode] = useState(() => {
    return backgroundService.getEyeCareMode();
  });
  const [nightMode, setNightMode] = useState(() => {
    return backgroundService.getNightMode();
  });
  const [cardOpacity, setCardOpacity] = useState(() => {
    const saved = localStorage.getItem('app-card-opacity');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(authService.getUser());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const practiceMenuRef = useRef<HTMLDivElement>(null);
  const learnMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // 判断当前是否在练习相关页面
  const isPracticePage = ['/quiz', '/daily', '/dictate', '/term-quiz', '/deep-quiz', '/wrong-questions'].includes(location.pathname);
  // 判断当前是否在学习相关页面
  const isLearnPage = ['/term', '/learn', '/coding-basics', '/review', '/smart-review', '/chinese-learn', '/math-learn'].includes(location.pathname);
  // 判断当前是否在工具相关页面
  const isToolsPage = ['/', '/sentence', '/meme', '/checkin'].includes(location.pathname);

  useEffect(() => {
    backgroundService.init();
    setCurrentBg(backgroundService.getBackground());
    // 初始化卡片透明度
    const savedCardOpacity = localStorage.getItem('app-card-opacity');
    if (savedCardOpacity) {
      const opacity = parseFloat(savedCardOpacity);
      setCardOpacity(opacity);
      document.documentElement.style.setProperty('--card-opacity', opacity.toString());
    }

    // 如果已登录，启动自动同步
    if (authService.isAuthenticated()) {
      syncService.startAutoSync();
    }

    // 点击外部区域关闭所有菜单和面板（现在所有菜单都使用 hover 自动管理，不需要这个逻辑了）
    const handleClickOutside = (event: MouseEvent) => {
      // 可以在这里添加其他需要点击外部关闭的逻辑
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // 应用卡片透明度
    document.documentElement.style.setProperty('--card-opacity', cardOpacity.toString());
    localStorage.setItem('app-card-opacity', cardOpacity.toString());
  }, [cardOpacity]);

  const handleBgChange = (value: string) => {
    backgroundService.setBackground(value);
    setCurrentBg(value);
  };

  const handleOpacityChange = (opacity: number) => {
    backgroundService.setOpacity(opacity);
    setBgOpacity(opacity);
  };

  const handleBrightnessChange = (brightness: number) => {
    backgroundService.setBrightness(brightness);
    setBrightness(brightness);
  };

  const handleEyeCareModeToggle = () => {
    const newValue = !eyeCareMode;
    backgroundService.setEyeCareMode(newValue);
    setEyeCareMode(newValue);
  };

  const handleNightModeToggle = () => {
    const newValue = !nightMode;
    backgroundService.setNightMode(newValue);
    setNightMode(newValue);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await backgroundService.readImageFile(file);
      handleBgChange(base64);
    } catch (err) {
      alert(err instanceof Error ? err.message : '上传失败');
    }
    
    // 清空 input，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？本地数据会保留，下次登录可继续同步。')) {
      syncService.stopAutoSync();
      authService.logout();
      setCurrentUser(null);
      alert('已退出登录');
    }
  };

  const handleManualSync = async () => {
    try {
      await syncService.manualSync();
      alert('数据同步成功！');
    } catch (err) {
      alert(err instanceof Error ? err.message : '同步失败');
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <h1 className="logo">⚡ 英语觉醒系统 ⚡</h1>
        <nav className="nav">
          <div 
            className="nav-dropdown"
            ref={toolsMenuRef}
            onMouseEnter={() => setShowToolsMenu(true)}
            onMouseLeave={() => setShowToolsMenu(false)}
          >
            <span 
              className={`nav-link dropdown-trigger ${isToolsPage ? 'active' : ''}`}
            >
              🛠️ 工具 ▾
            </span>
            {showToolsMenu && (
              <div 
                className="dropdown-menu"
                style={{
                  left: toolsMenuRef.current ? `${toolsMenuRef.current.getBoundingClientRect().left + toolsMenuRef.current.offsetWidth / 2}px` : '50%'
                }}
              >
                <NavLink to="/" className="dropdown-item" onClick={() => setShowToolsMenu(false)}>
                  📖 翻译
                </NavLink>
                <NavLink to="/sentence" className="dropdown-item" onClick={() => setShowToolsMenu(false)}>
                  💬 句子
                </NavLink>
                <NavLink to="/meme" className="dropdown-item" onClick={() => setShowToolsMenu(false)}>
                  🔥 热梗
                </NavLink>
                <NavLink to="/checkin" className="dropdown-item" onClick={() => setShowToolsMenu(false)}>
                  📅 打卡
                </NavLink>
              </div>
            )}
          </div>
          <NavLink 
            to="/vocab" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            📚 生词本
          </NavLink>
          <div 
            className="nav-dropdown"
            ref={practiceMenuRef}
            onMouseEnter={() => setShowPracticeMenu(true)}
            onMouseLeave={() => setShowPracticeMenu(false)}
          >
            <span 
              className={`nav-link dropdown-trigger ${isPracticePage ? 'active' : ''}`}
            >
              ✏️ 练习 ▾
            </span>
            {showPracticeMenu && (
              <div 
                className="dropdown-menu"
                style={{
                  left: practiceMenuRef.current ? `${practiceMenuRef.current.getBoundingClientRect().left + practiceMenuRef.current.offsetWidth / 2}px` : '50%'
                }}
              >
                <NavLink to="/quiz" className="dropdown-item" onClick={() => setShowPracticeMenu(false)}>
                  📝 做题
                </NavLink>
                <NavLink to="/daily" className="dropdown-item" onClick={() => setShowPracticeMenu(false)}>
                  📅 每日单词
                </NavLink>
                <NavLink to="/dictate" className="dropdown-item" onClick={() => setShowPracticeMenu(false)}>
                  🎧 听写
                </NavLink>
                <NavLink to="/term-quiz" className="dropdown-item" onClick={() => setShowPracticeMenu(false)}>
                  💻 术语测试
                </NavLink>
                <NavLink to="/deep-quiz" className="dropdown-item" onClick={() => setShowPracticeMenu(false)}>
                  🧠 深度理解
                </NavLink>
                <NavLink to="/wrong-questions" className="dropdown-item" onClick={() => setShowPracticeMenu(false)}>
                  📕 错题本
                </NavLink>
              </div>
            )}
          </div>
          <NavLink 
            to="/code" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            💻 代码
          </NavLink>
          <div 
            className="nav-dropdown"
            ref={learnMenuRef}
            onMouseEnter={() => setShowLearnMenu(true)}
            onMouseLeave={() => setShowLearnMenu(false)}
          >
            <span 
              className={`nav-link dropdown-trigger ${isLearnPage ? 'active' : ''}`}
            >
              🎓 学习 ▾
            </span>
            {showLearnMenu && (
              <div 
                className="dropdown-menu"
                style={{
                  left: learnMenuRef.current ? `${learnMenuRef.current.getBoundingClientRect().left + learnMenuRef.current.offsetWidth / 2}px` : '50%'
                }}
              >
                <NavLink to="/term" className="dropdown-item" onClick={() => setShowLearnMenu(false)}>
                  📚 术语解释
                </NavLink>
                <NavLink to="/learn" className="dropdown-item" onClick={() => setShowLearnMenu(false)}>
                  🌱 英语学习
                </NavLink>
                <NavLink to="/coding-basics" className="dropdown-item" onClick={() => setShowLearnMenu(false)}>
                  🐍 编程入门
                </NavLink>
                <NavLink to="/review" className="dropdown-item" onClick={() => setShowLearnMenu(false)}>
                  📖 学习复习
                </NavLink>
                <NavLink to="/smart-review" className="dropdown-item" onClick={() => setShowLearnMenu(false)}>
                  🧠 智能复习
                </NavLink>
                <NavLink to="/chinese-learn" className="dropdown-item" onClick={() => setShowLearnMenu(false)}>
                  📝 语文学习
                </NavLink>
                <NavLink to="/math-learn" className="dropdown-item" onClick={() => setShowLearnMenu(false)}>
                  📊 数学学习
                </NavLink>
              </div>
            )}
          </div>
          {/* 用户菜单 */}
          <div 
            className="user-menu-wrapper"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            {currentUser ? (
              <>
                <button className="user-btn" title="用户中心">
                  👤 {currentUser.username}
                </button>
                {showUserMenu && (
                  <div className="user-menu">
                    <div className="user-info">
                      <div className="user-name">{currentUser.username}</div>
                      <div className="user-email">{currentUser.email}</div>
                    </div>
                    <button className="menu-item" onClick={handleManualSync}>
                      🔄 手动同步数据
                    </button>
                    <button className="menu-item logout" onClick={handleLogout}>
                      🚪 退出登录
                    </button>
                  </div>
                )}
              </>
            ) : (
              <NavLink to="/login" className="login-btn">
                🔐 登录/注册
              </NavLink>
            )}
          </div>
          <div 
            className="bg-picker-wrapper"
            onMouseEnter={() => setShowBgPicker(true)}
            onMouseLeave={() => setShowBgPicker(false)}
          >
            <button 
              className="bg-btn"
              title="更换背景"
            >
              🎨
            </button>
            {showBgPicker && (
              <div className="bg-picker">
                <div className="bg-picker-title">选择背景</div>
                <div className="bg-options">
                  {PRESET_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      className={`bg-option ${currentBg === bg.value ? 'active' : ''}`}
                      style={{ background: bg.value }}
                      onClick={() => handleBgChange(bg.value)}
                      title={bg.name}
                    />
                  ))}
                  {/* 自定义图片上传按钮 */}
                  <button
                    className="bg-option upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="上传自定义图片"
                  >
                    +
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <div className="bg-picker-hint">点击 + 上传图片（5MB内）</div>
                
                {/* 深浅程度调节 */}
                <div className="opacity-control">
                  <div className="opacity-label">
                    <span>背景深浅</span>
                    <span className="opacity-value">{Math.round(bgOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={bgOpacity}
                    onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
                    className="opacity-slider"
                  />
                </div>

                {/* 亮度调节 */}
                <div className="brightness-control">
                  <div className="brightness-label">
                    <span>屏幕亮度</span>
                    <span className="brightness-value">{Math.round(brightness * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={brightness}
                    onChange={(e) => handleBrightnessChange(parseFloat(e.target.value))}
                    className="brightness-slider"
                  />
                </div>

                {/* 护眼模式和夜间模式 */}
                <div className="mode-controls">
                  <button 
                    className={`mode-toggle-btn ${eyeCareMode ? 'active' : ''}`}
                    onClick={handleEyeCareModeToggle}
                  >
                    <span className="mode-icon">👁️</span>
                    <span className="mode-text">护眼</span>
                  </button>
                  <button 
                    className={`mode-toggle-btn ${nightMode ? 'active' : ''}`}
                    onClick={handleNightModeToggle}
                  >
                    <span className="mode-icon">🌙</span>
                    <span className="mode-text">夜间</span>
                  </button>
                </div>

                {/* 卡片透明度控制 */}
                <div className="card-opacity-control">
                  <div className="card-opacity-label">
                    <span>💳 卡片透明度</span>
                    <span className="card-opacity-value">{Math.round(cardOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={cardOpacity}
                    onChange={(e) => setCardOpacity(parseFloat(e.target.value))}
                    className="card-opacity-slider"
                  />
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="main fade-in-scale">
        <Outlet />
      </main>

      {/* 悬浮翻译球 */}
      <FloatingTranslator />
    </div>
  );
}
