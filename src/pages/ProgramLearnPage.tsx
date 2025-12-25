import { useState, useEffect } from 'react';
import './ProgramLearnPage.css';

interface Chapter {
  id: string;
  title: string;
  level: string;
  topics: string[];
}

interface LessonContent {
  title: string;
  content: string;
  keyPoints: string[];
  codeExample: string;
  exercise: string;
  expectedOutput: string;
}

// 课程目录
const CURRICULUM: Chapter[] = [
  {
    id: 'ch1',
    title: '第一章：编程入门',
    level: '入门',
    topics: ['什么是编程', '变量和数据类型', '输入和输出', '注释的作用']
  },
  {
    id: 'ch2', 
    title: '第二章：条件判断',
    level: '入门',
    topics: ['if语句', 'if-else语句', '多条件判断', '逻辑运算符']
  },
  {
    id: 'ch3',
    title: '第三章：循环结构',
    level: '基础',
    topics: ['for循环', 'while循环', '循环控制', '嵌套循环']
  },
  {
    id: 'ch4',
    title: '第四章：函数',
    level: '基础',
    topics: ['函数定义', '参数和返回值', '作用域', '内置函数']
  },
  {
    id: 'ch5',
    title: '第五章：数据结构',
    level: '进阶',
    topics: ['数组/列表', '字典/对象', '字符串操作', '数据转换']
  },
  {
    id: 'ch6',
    title: '第六章：面向对象',
    level: '进阶',
    topics: ['类和对象', '属性和方法', '继承', '封装']
  }
];

export function ProgramLearnPage() {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewMarks, setReviewMarks] = useState<string[]>(() => {
    const saved = localStorage.getItem('review-marks');
    return saved ? JSON.parse(saved) : [];
  });
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    const saved = localStorage.getItem('completed-topics');
    return saved ? JSON.parse(saved) : [];
  });
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  
  // 代码编辑器状态
  const [userCode, setUserCode] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // 保存进度
  useEffect(() => {
    localStorage.setItem('review-marks', JSON.stringify(reviewMarks));
  }, [reviewMarks]);

  useEffect(() => {
    localStorage.setItem('completed-topics', JSON.stringify(completedTopics));
  }, [completedTopics]);

  // 加载课程内容
  const loadLesson = async (chapterId: string, topic: string) => {
    setSelectedChapter(chapterId);
    setSelectedTopic(topic);
    setLoading(true);
    setLessonContent(null);
    setUserCode('');
    setCodeOutput('');

    const chapter = CURRICULUM.find(c => c.id === chapterId);

    try {
      const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
      const apiKey = import.meta.env.VITE_AI_API_KEY || '';
      const model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `你是一个编程教育专家，专门用大白话教零基础学生学编程。
请讲解：${chapter?.title} - ${topic}

用JSON格式返回：
{
  "title": "课程标题",
  "content": "详细讲解内容（用大白话，400字左右，要有趣易懂，多用生活比喻）",
  "keyPoints": ["要点1", "要点2", "要点3"],
  "codeExample": "一个简单的JavaScript代码示例（带详细注释）",
  "exercise": "一个简单的编程练习题（让学生写代码）",
  "expectedOutput": "练习题的预期输出结果"
}
只返回JSON，不要其他内容。`
            },
            {
              role: 'user',
              content: `请讲解：${topic}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setLessonContent(parsed);
        setUserCode(parsed.codeExample || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 运行代码
  const runCode = () => {
    setIsRunning(true);
    setCodeOutput('');
    
    try {
      // 捕获console.log输出
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
      };

      // 执行代码
      // eslint-disable-next-line no-new-func
      new Function(userCode)();
      
      console.log = originalLog;
      setCodeOutput(logs.join('\n') || '(无输出)');
    } catch (err) {
      setCodeOutput(`错误: ${err instanceof Error ? err.message : '代码执行失败'}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 标记复习
  const toggleReview = (topicKey: string) => {
    setReviewMarks(prev => 
      prev.includes(topicKey) 
        ? prev.filter(k => k !== topicKey)
        : [...prev, topicKey]
    );
  };

  // 标记完成
  const markComplete = (topicKey: string) => {
    if (!completedTopics.includes(topicKey)) {
      setCompletedTopics(prev => [...prev, topicKey]);
    }
  };

  // 生成章节总结
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const generateSummary = async (chapterId: string) => {
    const chapter = CURRICULUM.find(c => c.id === chapterId);
    if (!chapter) return;

    setLoadingSummary(true);
    setSummary('');

    try {
      const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
      const apiKey = import.meta.env.VITE_AI_API_KEY || '';
      const model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: `请为"${chapter.title}"生成一个复盘总结，包含以下主题：${chapter.topics.join('、')}。
要求：
1. 用大白话总结核心概念
2. 列出3-5个关键要点
3. 给出一个综合练习建议
4. 300字以内`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      const data = await response.json();
      setSummary(data.choices[0]?.message?.content || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
    }
  };

  // 计算章节进度
  const getChapterProgress = (chapter: Chapter) => {
    const completed = chapter.topics.filter(t => 
      completedTopics.includes(`${chapter.id}-${t}`)
    ).length;
    return Math.round((completed / chapter.topics.length) * 100);
  };

  return (
    <div className="program-learn-page">
      {/* 左侧目录 */}
      <div className="curriculum-sidebar">
        <div className="sidebar-header">
          <h2>📚 编程课程</h2>
          <label className="review-filter">
            <input 
              type="checkbox" 
              checked={showReviewOnly}
              onChange={(e) => setShowReviewOnly(e.target.checked)}
            />
            只看待复习
          </label>
        </div>

        <div className="chapter-list">
          {CURRICULUM.map(chapter => {
            const progress = getChapterProgress(chapter);
            const hasReview = chapter.topics.some(t => reviewMarks.includes(`${chapter.id}-${t}`));
            
            if (showReviewOnly && !hasReview) return null;

            return (
              <div key={chapter.id} className="chapter-item">
                <div 
                  className={`chapter-header ${selectedChapter === chapter.id ? 'active' : ''}`}
                  onClick={() => setSelectedChapter(selectedChapter === chapter.id ? null : chapter.id)}
                >
                  <div className="chapter-info">
                    <span className="chapter-title">{chapter.title}</span>
                    <span className={`chapter-level level-${chapter.level}`}>{chapter.level}</span>
                  </div>
                  <div className="chapter-progress">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span>{progress}%</span>
                  </div>
                </div>

                {selectedChapter === chapter.id && (
                  <div className="topic-list">
                    {chapter.topics.map(topic => {
                      const topicKey = `${chapter.id}-${topic}`;
                      const isCompleted = completedTopics.includes(topicKey);
                      const isMarkedReview = reviewMarks.includes(topicKey);
                      
                      if (showReviewOnly && !isMarkedReview) return null;

                      return (
                        <div 
                          key={topic}
                          className={`topic-item ${selectedTopic === topic ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                        >
                          <span 
                            className="topic-name"
                            onClick={() => loadLesson(chapter.id, topic)}
                          >
                            {isCompleted && '✓ '}{topic}
                          </span>
                          <button
                            className={`review-btn ${isMarkedReview ? 'marked' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleReview(topicKey); }}
                            title={isMarkedReview ? '取消复习标记' : '标记待复习'}
                          >
                            {isMarkedReview ? '🔖' : '📌'}
                          </button>
                        </div>
                      );
                    })}
                    <button 
                      className="summary-btn"
                      onClick={() => generateSummary(chapter.id)}
                    >
                      📋 章节总结
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 右侧内容 */}
      <div className="lesson-content">
        {!selectedTopic && !summary && (
          <div className="welcome-content">
            <h2>👋 欢迎来到编程学习中心</h2>
            <p>从左边选择一个主题开始学习吧！</p>
            <div className="stats">
              <div className="stat-item">
                <span className="stat-num">{completedTopics.length}</span>
                <span className="stat-label">已完成</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">{reviewMarks.length}</span>
                <span className="stat-label">待复习</span>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-content">
            <div className="spinner"></div>
            <p>正在加载课程...</p>
          </div>
        )}

        {loadingSummary && (
          <div className="loading-content">
            <div className="spinner"></div>
            <p>正在生成章节总结...</p>
          </div>
        )}

        {summary && !loadingSummary && (
          <div className="summary-content">
            <h2>📋 章节复盘总结</h2>
            <div className="summary-text">{summary}</div>
            <button className="close-summary" onClick={() => setSummary('')}>关闭</button>
          </div>
        )}

        {lessonContent && !loading && (
          <div className="lesson-detail">
            <h2>{lessonContent.title}</h2>
            
            <div className="lesson-section">
              <h3>📖 详细讲解</h3>
              <div className="lesson-text">{lessonContent.content}</div>
            </div>

            <div className="lesson-section">
              <h3>🎯 关键要点</h3>
              <ul className="key-points">
                {lessonContent.keyPoints.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>

            <div className="lesson-section">
              <h3>💻 代码示例</h3>
              <pre className="code-display">{lessonContent.codeExample}</pre>
            </div>

            <div className="lesson-section exercise-section">
              <h3>✏️ 动手练习</h3>
              <p className="exercise-desc">{lessonContent.exercise}</p>
              <p className="expected-output">预期输出：<code>{lessonContent.expectedOutput}</code></p>
              
              <div className="code-editor">
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="在这里写代码..."
                  spellCheck={false}
                />
                <button 
                  className="run-btn"
                  onClick={runCode}
                  disabled={isRunning}
                >
                  {isRunning ? '运行中...' : '▶ 运行代码'}
                </button>
              </div>

              {codeOutput && (
                <div className={`code-output ${codeOutput.startsWith('错误') ? 'error' : ''}`}>
                  <strong>输出结果：</strong>
                  <pre>{codeOutput}</pre>
                </div>
              )}
            </div>

            <div className="lesson-actions">
              <button 
                className="complete-btn"
                onClick={() => markComplete(`${selectedChapter}-${selectedTopic}`)}
                disabled={completedTopics.includes(`${selectedChapter}-${selectedTopic}`)}
              >
                {completedTopics.includes(`${selectedChapter}-${selectedTopic}`) ? '✓ 已完成' : '标记完成'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
