import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReviewPage.css';

interface Lesson {
  id: number;
  title: string;
  chapterTitle: string;
  chapterIcon: string;
  content: string;
  code?: string;
}

// 从CodingBasicsPage导入的章节数据（简化版）
const CHAPTER_DATA = [
  { id: 1, title: '第一章：编程思维入门', icon: '🧠' },
  { id: 2, title: '第二章：Python基础语法', icon: '🐍' },
  { id: 3, title: '第三章：网络基础知识', icon: '🌐' },
  { id: 4, title: '第四章：抓包工具与实战', icon: '🔍' },
  { id: 5, title: '第五章：Python网络编程', icon: '🐍' },
  { id: 6, title: '第六章：加密与签名', icon: '🔐' },
  { id: 7, title: '第七章：JavaScript逆向基础', icon: '🔬' },
  { id: 8, title: '第八章：APP抓包与逆向', icon: '📱' },
  { id: 9, title: '第九章：协议分析实战', icon: '⚙️' },
  { id: 10, title: '第十章：高级逆向技术', icon: '🚀' }
];

const LESSON_TITLES: { [key: number]: string } = {
  1: '什么是编程？',
  2: '为什么学Python？',
  3: '第一个Python程序',
  4: '变量：给数据起名字',
  5: '数据类型详解',
  6: 'HTTP协议是什么？',
  7: 'URL结构深度解析',
  8: 'JSON数据格式',
  9: '什么是抓包？',
  10: 'Chrome开发者工具实战',
  11: 'Fiddler抓包进阶',
  12: 'requests库入门',
  13: '请求头详解',
  14: 'Session会话管理',
  15: '加密基础概念',
  16: 'Base64编码',
  17: 'MD5哈希算法',
  18: 'AES加密解密',
  19: 'JavaScript基础',
  20: '浏览器调试技巧',
  21: 'JS代码混淆与还原',
  22: 'APP抓包原理',
  23: 'Fiddler抓取APP',
  24: 'SSL Pinning绕过',
  25: '协议分析流程',
  26: '参数签名破解',
  27: '编写协议脚本',
  28: 'Frida动态插桩',
  29: 'Android逆向入门',
  30: 'Native层逆向'
};

// 提取关键概念
const KEY_CONCEPTS: { [key: number]: string[] } = {
  1: ['编程', '二进制', '编程语言', '程序', '输入输出'],
  2: ['Python', '语法', '爬虫', '自动化', '数据分析'],
  3: ['print', 'Hello World', '注释', '变量'],
  4: ['变量', '数据存储', '命名规则', '赋值'],
  5: ['数据类型', '字符串', '整数', '浮点数', '列表', '字典'],
  6: ['HTTP', '请求', '响应', 'GET', 'POST', '状态码'],
  7: ['URL', '协议', '域名', '端口', '路径', '查询参数'],
  8: ['JSON', '键值对', '对象', '数组', 'json.loads', 'json.dumps'],
  9: ['抓包', '网络请求', 'Fiddler', 'Charles', 'Chrome开发者工具'],
  10: ['F12', 'Network', 'Headers', 'Payload', 'Response'],
  11: ['Fiddler', 'HTTPS解密', '代理', '证书'],
  12: ['requests', 'GET请求', 'POST请求', 'headers', 'params'],
  13: ['User-Agent', 'Cookie', 'Referer', 'Content-Type'],
  14: ['Session', 'Cookie管理', '登录状态', '会话'],
  15: ['加密', 'Base64', 'MD5', 'SHA', 'AES', 'RSA'],
  16: ['Base64', '编码', '解码', 'base64.b64encode'],
  17: ['MD5', '哈希', '签名', 'hashlib.md5'],
  18: ['AES', '对称加密', '密钥', 'IV', 'CBC模式'],
  19: ['JavaScript', 'JS语法', 'function', 'console.log', 'CryptoJS'],
  20: ['调试', '断点', 'Sources', 'Console', 'debugger'],
  21: ['代码混淆', '变量重命名', 'AST', '代码还原'],
  22: ['APP抓包', '代理配置', '证书安装', 'HTTPS'],
  23: ['Fiddler', '手机抓包', '远程连接', '证书信任'],
  24: ['SSL Pinning', '证书校验', 'Frida', 'JustTrustMe'],
  25: ['协议分析', '接口分析', '请求流程', '参数分析'],
  26: ['参数签名', 'sign', 'MD5签名', '时间戳', '密钥'],
  27: ['协议脚本', 'API封装', 'Session', '错误处理'],
  28: ['Frida', '动态插桩', 'Hook', 'frida-server'],
  29: ['APK', '反编译', 'jadx', 'dex2jar', 'smali'],
  30: ['Native', '.so文件', 'IDA', 'Ghidra', '汇编']
};

export function ReviewPage() {
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('completed-coding-lessons');
    if (saved) {
      setCompletedLessons(new Set(JSON.parse(saved)));
    }
  }, []);

  // 获取已完成的课程
  const getCompletedLessons = (): Lesson[] => {
    const lessons: Lesson[] = [];
    completedLessons.forEach(lessonId => {
      const chapterId = Math.ceil(lessonId / 3); // 简化的章节计算
      const chapter = CHAPTER_DATA.find(c => c.id === chapterId) || CHAPTER_DATA[0];
      
      lessons.push({
        id: lessonId,
        title: LESSON_TITLES[lessonId] || `课程 ${lessonId}`,
        chapterTitle: chapter.title,
        chapterIcon: chapter.icon,
        content: KEY_CONCEPTS[lessonId]?.join('、') || ''
      });
    });
    return lessons.sort((a, b) => a.id - b.id);
  };

  // 按章节分组
  const groupByChapter = (lessons: Lesson[]) => {
    const grouped: { [key: string]: Lesson[] } = {};
    lessons.forEach(lesson => {
      if (!grouped[lesson.chapterTitle]) {
        grouped[lesson.chapterTitle] = [];
      }
      grouped[lesson.chapterTitle].push(lesson);
    });
    return grouped;
  };

  // 获取所有关键概念
  const getAllConcepts = (): string[] => {
    const concepts = new Set<string>();
    completedLessons.forEach(lessonId => {
      KEY_CONCEPTS[lessonId]?.forEach(concept => concepts.add(concept));
    });
    return Array.from(concepts).sort();
  };

  // 搜索过滤
  const filterLessons = (lessons: Lesson[]) => {
    if (!searchTerm) return lessons;
    return lessons.filter(lesson => 
      lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const completedLessonsList = getCompletedLessons();
  const filteredLessons = filterLessons(completedLessonsList);
  const groupedLessons = groupByChapter(filteredLessons);
  const allConcepts = getAllConcepts();

  // 跳转到深度理解测试
  const goToDeepQuiz = (concept: string) => {
    navigate(`/deep-quiz?concept=${encodeURIComponent(concept)}`);
  };

  return (
    <div className="review-page">
      <div className="review-header">
        <h1>📚 学习复习中心</h1>
        <p className="review-subtitle">回顾已学内容，巩固知识点</p>
      </div>

      <div className="review-stats">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-number">{completedLessons.size}</div>
            <div className="stat-label">已完成课程</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <div className="stat-number">{allConcepts.length}</div>
            <div className="stat-label">掌握概念</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <div className="stat-number">{Object.keys(groupedLessons).length}</div>
            <div className="stat-label">学习章节</div>
          </div>
        </div>
      </div>

      {completedLessons.size === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>还没有完成任何课程</h3>
          <p>去"编程入门"页面学习并标记完成课程吧！</p>
          <button 
            className="goto-learn-btn"
            onClick={() => navigate('/coding-basics')}
          >
            开始学习
          </button>
        </div>
      ) : (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 搜索课程或概念..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="review-tabs">
            <button 
              className={`tab-btn ${!selectedChapter ? 'active' : ''}`}
              onClick={() => setSelectedChapter(null)}
            >
              📋 全部课程
            </button>
            <button 
              className={`tab-btn ${selectedChapter === -1 ? 'active' : ''}`}
              onClick={() => setSelectedChapter(-1)}
            >
              🎯 关键概念
            </button>
          </div>

          {selectedChapter === -1 ? (
            <div className="concepts-grid">
              <h3>已掌握的关键概念 ({allConcepts.length})</h3>
              <div className="concepts-list">
                {allConcepts.map((concept, i) => (
                  <div 
                    key={i} 
                    className="concept-tag"
                    onClick={() => goToDeepQuiz(concept)}
                    title="点击进入深度理解测试"
                  >
                    {concept}
                  </div>
                ))}
              </div>
              <p className="concepts-hint">💡 点击任意概念进入深度理解测试</p>
            </div>
          ) : (
            <div className="lessons-by-chapter">
              {Object.entries(groupedLessons).map(([chapterTitle, lessons]) => (
                <div key={chapterTitle} className="chapter-section">
                  <h3 className="chapter-title">
                    <span className="chapter-icon">
                      {lessons[0].chapterIcon}
                    </span>
                    {chapterTitle}
                    <span className="chapter-count">({lessons.length}节)</span>
                  </h3>
                  <div className="lessons-grid">
                    {lessons.map(lesson => (
                      <div key={lesson.id} className="lesson-card">
                        <div className="lesson-header">
                          <span className="lesson-number">#{lesson.id}</span>
                          <h4>{lesson.title}</h4>
                        </div>
                        <div className="lesson-concepts">
                          <span className="concepts-label">关键概念：</span>
                          <div className="concepts-tags">
                            {KEY_CONCEPTS[lesson.id]?.map((concept, i) => (
                              <span 
                                key={i} 
                                className="mini-concept-tag"
                                onClick={() => goToDeepQuiz(concept)}
                              >
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
