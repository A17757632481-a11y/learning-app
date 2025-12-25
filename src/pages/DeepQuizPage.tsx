import { useState, useEffect } from 'react';
import { vocabService } from '../services/vocabService';
import { checkInService } from '../services/checkInService';
import { wrongQuestionsService } from '../services/wrongQuestionsService';
import type { TranslationResult } from '../types';
import './DeepQuizPage.css';

interface DeepQuestion {
  word: string;
  question: string;
  type: 'fill' | 'match' | 'analyze';
  content: string;
  answer: string;
  explanation: string;
  hints: string[];
  difficulty: string;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG = {
  easy: {
    label: '🌱 入门',
    desc: '基础概念认知',
    prompt: `出一道【入门级】题目，要求：
- 只考察最基本的概念定义
- 给出简单直观的例子
- 答案是直接的是非判断或简单选择
- 适合刚接触这个概念的初学者`
  },
  medium: {
    label: '🌿 进阶',
    desc: '理解组成部分',
    prompt: `出一道【进阶级】题目，要求：
- 考察概念的组成部分和结构
- 需要学生能识别和区分各个部分
- 给出实际例子让学生分析
- 适合已经了解基本概念的学习者`
  },
  hard: {
    label: '🌳 深度',
    desc: '实际应用分析',
    prompt: `出一道【深度级】题目，要求：
- 考察概念在实际场景中的应用
- 需要综合分析和判断
- 可能涉及多个相关概念的联系
- 需要解释为什么这样设计或使用
- 适合想要深入理解的学习者`
  }
};

export function DeepQuizPage() {
  const [vocabList, setVocabList] = useState<TranslationResult[]>([]);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [question, setQuestion] = useState<DeepQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  useEffect(() => {
    setVocabList(vocabService.getAllWords());
    
    // 从复习页面接收概念参数
    const urlParams = new URLSearchParams(window.location.search);
    const concept = urlParams.get('concept');
    if (concept) {
      setSelectedWord(concept);
      setTimeout(() => generateQuestion(concept), 100);
    }
  }, []);

  // 生成深度理解题
  const generateQuestion = async (word?: string) => {
    const targetWord = word || selectedWord;
    if (!targetWord) return;

    setLoading(true);
    setQuestion(null);
    setUserAnswer('');
    setShowAnswer(false);
    setShowHint(false);
    setHintIndex(0);

    const diffConfig = DIFFICULTY_CONFIG[difficulty];

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
              content: `你是一个编程教育专家，专门出深度理解题来验证学生是否真正理解了某个概念。

请根据词语"${targetWord}"${diffConfig.prompt}

题目类型可以是：
1. 填空题(fill) - 给出实际例子，让学生填写各部分的名称
2. 匹配题(match) - 给出多个组成部分，让学生匹配
3. 分析题(analyze) - 给出一个实际案例，让学生分析

用JSON格式返回：
{
  "word": "词语",
  "question": "题目描述",
  "type": "fill/match/analyze",
  "content": "题目内容（如果是URL就给一个真实URL例子，如果是代码就给代码片段）",
  "answer": "标准答案（详细列出各部分）",
  "explanation": "详细解释为什么是这个答案",
  "hints": ["提示1", "提示2", "提示3"],
  "difficulty": "${difficulty}"
}

入门级示例（如果词语是URL）：
{
  "word": "URL",
  "question": "URL是什么的缩写？它的主要作用是什么？",
  "type": "fill",
  "content": "URL = ______ Resource Locator",
  "answer": "Uniform（统一资源定位符），用于在互联网上定位和访问资源",
  "explanation": "URL是Uniform Resource Locator的缩写，中文叫统一资源定位符。就像现实中的地址一样，URL是网络上资源的地址，告诉浏览器去哪里找到你想要的网页或文件。",
  "hints": ["U代表Uniform（统一的）", "想想它的作用是定位资源"],
  "difficulty": "easy"
}

进阶级示例（如果词语是URL）：
{
  "word": "URL",
  "question": "请分析下面这个URL的各个组成部分",
  "type": "analyze",
  "content": "https://www.example.com:8080/path/to/page?name=test&id=123#section1",
  "answer": "协议(https) + 域名(www.example.com) + 端口(8080) + 路径(/path/to/page) + 查询参数(?name=test&id=123) + 锚点(#section1)",
  "explanation": "URL由多个部分组成：1.协议(https://)决定如何传输数据；2.域名是网站地址；3.端口号指定服务器端口；4.路径指向具体资源；5.查询参数传递额外信息；6.锚点定位页面位置",
  "hints": ["先找://分隔协议", "冒号后面的数字是端口", "问号后面是查询参数"],
  "difficulty": "medium"
}

深度级示例（如果词语是URL）：
{
  "word": "URL",
  "question": "分析以下两个URL的区别，并解释为什么第二个更安全",
  "type": "analyze",
  "content": "URL1: http://bank.com/login?user=admin&pass=123\\nURL2: https://bank.com/login",
  "answer": "1. URL1使用http明文传输，密码暴露在URL中；URL2使用https加密传输，且不在URL中传递敏感信息。2. URL1的查询参数会被浏览器历史记录保存，存在安全隐患。",
  "explanation": "这道题考察URL安全性：1.http vs https的区别（加密）；2.GET参数暴露在URL中的风险；3.敏感信息不应通过URL传递。实际开发中，登录等敏感操作应使用POST请求+HTTPS。",
  "hints": ["注意协议的区别", "想想URL会被保存在哪些地方", "敏感信息放在URL里有什么风险"],
  "difficulty": "hard"
}

只返回JSON，不要其他内容。`
            },
            {
              role: 'user',
              content: `请为"${targetWord}"出一道${diffConfig.label}难度的深度理解题`
            }
          ],
          temperature: 0.8,
          max_tokens: 1000
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        setQuestion(JSON.parse(jsonMatch[0]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 显示下一个提示
  const showNextHint = () => {
    if (question && hintIndex < question.hints.length) {
      setShowHint(true);
      setHintIndex(prev => Math.min(prev + 1, question.hints.length));
    }
  };

  // 随机选词
  const randomWord = () => {
    if (vocabList.length > 0) {
      const randomItem = vocabList[Math.floor(Math.random() * vocabList.length)];
      setSelectedWord(randomItem.englishWord || randomItem.originalWord);
      generateQuestion(randomItem.englishWord || randomItem.originalWord);
    }
  };

  return (
    <div className="deep-quiz-page">
      <div className="quiz-container">
        <h2>🧠 深度理解测试</h2>
        <p className="quiz-subtitle">验证你是否真正理解了这些概念</p>

        {/* 难度选择 */}
        <div className="difficulty-selector">
          <span className="difficulty-label">难度级别：</span>
          <div className="difficulty-options">
            {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => (
              <button
                key={level}
                className={`difficulty-btn ${difficulty === level ? 'active' : ''}`}
                onClick={() => setDifficulty(level)}
              >
                <span className="diff-icon">{DIFFICULTY_CONFIG[level].label}</span>
                <span className="diff-desc">{DIFFICULTY_CONFIG[level].desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="word-selector">
          <div className="selector-row">
            <select 
              value={selectedWord} 
              onChange={(e) => setSelectedWord(e.target.value)}
              className="word-select"
            >
              <option value="">选择生词本中的词语...</option>
              {vocabList.map((item, i) => (
                <option key={i} value={item.englishWord || item.originalWord}>
                  {item.englishWord || item.originalWord} - {item.originalWord}
                </option>
              ))}
            </select>
            <button 
              className="random-btn"
              onClick={randomWord}
              disabled={vocabList.length === 0}
            >
              🎲 随机
            </button>
          </div>
          
          <div className="manual-input">
            <input
              type="text"
              value={selectedWord}
              onChange={(e) => setSelectedWord(e.target.value)}
              placeholder="或直接输入词语，如：URL、API、function..."
            />
            <button 
              className="generate-btn"
              onClick={() => generateQuestion()}
              disabled={!selectedWord || loading}
            >
              {loading ? '生成中...' : '出题'}
            </button>
          </div>

          {vocabList.length === 0 && (
            <p className="empty-hint">💡 生词本为空，可以直接输入词语出题</p>
          )}
        </div>

        {loading && (
          <div className="quiz-loading">
            <div className="spinner"></div>
            <p>正在生成题目...</p>
          </div>
        )}

        {question && !loading && (
          <div className="question-card">
            <div className="question-header">
              <span className="question-word">📌 {question.word}</span>
              <div className="question-tags">
                <span className={`difficulty-tag diff-${difficulty}`}>
                  {DIFFICULTY_CONFIG[difficulty].label}
                </span>
                <span className={`question-type type-${question.type}`}>
                  {question.type === 'fill' ? '填空题' : question.type === 'match' ? '匹配题' : '分析题'}
                </span>
              </div>
            </div>

            <div className="question-text">{question.question}</div>

            <div className="question-content">
              <pre>{question.content}</pre>
            </div>

            <div className="answer-area">
              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="在这里写下你的答案..."
                rows={4}
              />
            </div>

            <div className="question-actions">
              {!showAnswer && (
                <>
                  <button 
                    className="hint-btn"
                    onClick={showNextHint}
                    disabled={hintIndex >= question.hints.length}
                  >
                    💡 提示 ({hintIndex}/{question.hints.length})
                  </button>
                  <button 
                    className="check-btn"
                    onClick={() => {
                      setShowAnswer(true);
                      // 更新打卡数据：答了一道题
                      checkInService.updateTodayProgress({ questionsAnswered: 1 });
                    }}
                  >
                    查看答案
                  </button>
                </>
              )}
            </div>

            {showHint && hintIndex > 0 && (
              <div className="hints-area">
                <h4>💡 提示</h4>
                <ul>
                  {question.hints.slice(0, hintIndex).map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {showAnswer && (
              <div className="answer-reveal">
                <div className="correct-answer">
                  <h4>✅ 标准答案</h4>
                  <p>{question.answer}</p>
                </div>
                <div className="explanation">
                  <h4>📖 详细解释</h4>
                  <p>{question.explanation}</p>
                </div>
                <div className="answer-actions">
                  <button 
                    className="wrong-btn"
                    onClick={() => {
                      wrongQuestionsService.addWrongQuestion({
                        word: selectedWord,
                        question: question.question,
                        userAnswer: userAnswer || '未作答',
                        correctAnswer: question.answer,
                        explanation: question.explanation,
                        type: 'deep',
                      });
                      alert('已添加到错题本！');
                    }}
                  >
                    ❌ 我答错了
                  </button>
                  <button 
                    className="next-btn"
                    onClick={() => generateQuestion()}
                  >
                    再来一题
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
