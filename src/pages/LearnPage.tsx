import { useState } from 'react';
import './LearnPage.css';

interface Topic {
  id: string;
  title: string;
  description: string;
  keywords: string[];
}

interface Chapter {
  id: string;
  title: string;
  level: string;
  icon: string;
  topics: Topic[];
}

interface LessonContent {
  title: string;
  content: string;
  examples: string[];
  practice: string;
}

// 学习目录结构
const LEARNING_PATH: Chapter[] = [
  {
    id: 'basics',
    title: '入门基础',
    level: '零基础',
    icon: '🌱',
    topics: [
      { id: 'alphabet', title: '26个字母', description: '英文字母的读音和书写', keywords: ['字母', 'ABC', '发音'] },
      { id: 'numbers', title: '数字表达', description: '1-100数字的英文说法', keywords: ['数字', 'one', 'two'] },
      { id: 'greetings', title: '日常问候', description: 'Hello、Hi、How are you等', keywords: ['问候', '打招呼', 'hello'] },
      { id: 'self-intro', title: '自我介绍', description: '介绍自己的名字、年龄、职业', keywords: ['介绍', 'name', 'I am'] },
    ]
  },
  {
    id: 'daily',
    title: '日常会话',
    level: '初级',
    icon: '💬',
    topics: [
      { id: 'time', title: '时间表达', description: '几点了、星期几、日期怎么说', keywords: ['时间', 'what time', 'today'] },
      { id: 'shopping', title: '购物用语', description: '买东西时常用的对话', keywords: ['购物', 'how much', 'buy'] },
      { id: 'food', title: '点餐用语', description: '在餐厅怎么点菜', keywords: ['点餐', 'menu', 'order'] },
      { id: 'directions', title: '问路指路', description: '怎么问路和指路', keywords: ['问路', 'where', 'turn'] },
    ]
  },
  {
    id: 'grammar',
    title: '语法入门',
    level: '初级',
    icon: '📖',
    topics: [
      { id: 'tenses-basic', title: '时态基础', description: '过去、现在、将来时', keywords: ['时态', 'was', 'will'] },
      { id: 'sentence', title: '句子结构', description: '主语+谓语+宾语', keywords: ['句子', '主谓宾', 'subject'] },
      { id: 'questions', title: '疑问句', description: '怎么提问题', keywords: ['疑问', 'what', 'how'] },
      { id: 'negatives', title: '否定句', description: '怎么表达"不"', keywords: ['否定', 'not', "don't"] },
    ]
  },
  {
    id: 'programming',
    title: '编程英语',
    level: '中级',
    icon: '💻',
    topics: [
      { id: 'prog-basics', title: '编程基础词汇', description: 'function、variable、loop等', keywords: ['编程', 'function', 'code'] },
      { id: 'error-msg', title: '错误信息', description: '看懂常见报错信息', keywords: ['错误', 'error', 'exception'] },
      { id: 'docs', title: '读文档', description: '怎么读英文技术文档', keywords: ['文档', 'documentation', 'API'] },
      { id: 'comments', title: '代码注释', description: '怎么写英文注释', keywords: ['注释', 'comment', 'TODO'] },
    ]
  },
  {
    id: 'advanced',
    title: '进阶提升',
    level: '中高级',
    icon: '🚀',
    topics: [
      { id: 'idioms', title: '常用习语', description: '地道的英语表达方式', keywords: ['习语', 'idiom', 'expression'] },
      { id: 'writing', title: '邮件写作', description: '怎么写英文邮件', keywords: ['邮件', 'email', 'dear'] },
      { id: 'listening', title: '听力技巧', description: '提高听力的方法', keywords: ['听力', 'listen', 'understand'] },
      { id: 'speaking', title: '口语练习', description: '怎么练习口语', keywords: ['口语', 'speak', 'pronunciation'] },
    ]
  }
];

export function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState<string>('basics');

  const loadLesson = async (topic: Topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setLessonContent(null);

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
          model: model,
          messages: [
            {
              role: 'system',
              content: `你是一个英语老师，专门教零基础的中国学生学英语。
请用JSON格式返回课程内容：
{
  "title": "课程标题",
  "content": "详细讲解内容（用大白话，300字左右，要有趣易懂）",
  "examples": ["例句1（英文 - 中文）", "例句2", "例句3", "例句4", "例句5"],
  "practice": "一个简单的练习题或小任务"
}
只返回JSON，不要其他内容。`
            },
            {
              role: 'user',
              content: `请讲解：${topic.title} - ${topic.description}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        setLessonContent(JSON.parse(jsonMatch[0]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="learn-page">
      <div className="learn-sidebar">
        <h2>📚 学习路径</h2>
        <p className="sidebar-hint">从基础到进阶，一步步学</p>
        
        <div className="chapter-list">
          {LEARNING_PATH.map((chapter) => (
            <div key={chapter.id} className="chapter-item">
              <div 
                className={`chapter-header ${expandedChapter === chapter.id ? 'expanded' : ''}`}
                onClick={() => setExpandedChapter(expandedChapter === chapter.id ? '' : chapter.id)}
              >
                <span className="chapter-icon">{chapter.icon}</span>
                <span className="chapter-title">{chapter.title}</span>
                <span className="chapter-level">{chapter.level}</span>
                <span className="chapter-arrow">{expandedChapter === chapter.id ? '▼' : '▶'}</span>
              </div>
              
              {expandedChapter === chapter.id && (
                <div className="topic-list">
                  {chapter.topics.map((topic) => (
                    <div
                      key={topic.id}
                      className={`topic-item ${selectedTopic?.id === topic.id ? 'active' : ''}`}
                      onClick={() => loadLesson(topic)}
                    >
                      <span className="topic-title">{topic.title}</span>
                      <span className="topic-desc">{topic.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="learn-content">
        {!selectedTopic && (
          <div className="welcome-content">
            <h2>👋 欢迎来到学习中心</h2>
            <p>从左边选择一个主题开始学习吧！</p>
            <div className="quick-start">
              <h3>推荐学习顺序：</h3>
              <ol>
                <li>🌱 先从「入门基础」开始，打好基础</li>
                <li>💬 学会「日常会话」，能简单交流</li>
                <li>📖 了解「语法入门」，说得更准确</li>
                <li>💻 学习「编程英语」，看懂代码和文档</li>
                <li>🚀 最后「进阶提升」，更上一层楼</li>
              </ol>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>正在生成课程内容...</p>
          </div>
        )}

        {lessonContent && !loading && (
          <div className="lesson-content">
            <h2>{lessonContent.title}</h2>
            
            <div className="lesson-section">
              <h3>📝 详细讲解</h3>
              <div className="lesson-text">{lessonContent.content}</div>
            </div>

            <div className="lesson-section">
              <h3>💡 例句</h3>
              <ul className="example-list">
                {lessonContent.examples.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>

            <div className="lesson-section practice">
              <h3>✏️ 小练习</h3>
              <div className="practice-text">{lessonContent.practice}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
