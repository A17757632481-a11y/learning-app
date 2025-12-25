import { useState } from 'react';
import { checkInService } from '../services/checkInService';
import { wrongQuestionsService } from '../services/wrongQuestionsService';
import './TermQuizPage.css';

interface Question {
  term: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

// 题目类型
const QUIZ_TYPES = [
  { id: 'meaning', name: '术语含义', desc: '选择术语的正确解释' },
  { id: 'scenario', name: '场景应用', desc: '根据场景选择正确术语' },
  { id: 'analogy', name: '生活类比', desc: '选择最贴切的比喻' },
  { id: 'code', name: '代码理解', desc: '看代码选择术语' },
];

// 难度级别
const LEVELS = [
  { id: 'basic', name: '入门', terms: ['variable', 'function', 'loop', 'if/else', 'array'] },
  { id: 'medium', name: '进阶', terms: ['class', 'object', 'API', 'callback', 'promise'] },
  { id: 'advanced', name: '高级', terms: ['async/await', 'closure', 'prototype', 'recursion', 'middleware'] },
];

export function TermQuizPage() {
  const [level, setLevel] = useState('basic');
  const [quizType, setQuizType] = useState('meaning');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  // 生成题目
  const generateQuiz = async () => {
    setLoading(true);
    setStarted(true);
    setQuestions([]);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setSelected(null);
    setShowAnswer(false);

    const selectedLevel = LEVELS.find(l => l.id === level);
    const terms = selectedLevel?.terms.join(', ') || '';
    const typeInfo = QUIZ_TYPES.find(t => t.id === quizType);

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
              content: `你是一个编程教育专家，专门出计算机术语相关的选择题。
请根据以下术语生成5道${typeInfo?.name}类型的选择题。
术语列表：${terms}

题目类型说明：
- 术语含义：问某个术语是什么意思
- 场景应用：给一个编程场景，问应该用什么术语/概念
- 生活类比：问某个术语最像生活中的什么
- 代码理解：给一段简单代码，问涉及什么概念

请用JSON数组格式返回，每道题包含：
{
  "term": "涉及的术语",
  "question": "题目内容",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "answer": 0, // 正确答案索引(0-3)
  "explanation": "解释为什么这个答案正确，用大白话说"
}

要求：
1. 题目要通俗易懂，适合零基础学习者
2. 选项要有迷惑性但不要太难
3. 解释要用大白话，让人恍然大悟
4. 只返回JSON数组，不要其他内容`
            },
            {
              role: 'user',
              content: `请生成5道${typeInfo?.name}类型的题目`
            }
          ],
          temperature: 0.8,
          max_tokens: 2000
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setQuestions(parsed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 选择答案
  const handleSelect = (index: number) => {
    if (showAnswer) return;
    setSelected(index);
  };

  // 确认答案
  const confirmAnswer = () => {
    if (selected === null) return;
    setShowAnswer(true);
    const isCorrect = selected === questions[currentIndex].answer;
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    // 如果答错了，记录到错题本
    if (!isCorrect) {
      const currentQ = questions[currentIndex];
      wrongQuestionsService.addWrongQuestion({
        word: currentQ.term,
        question: currentQ.question,
        userAnswer: currentQ.options[selected],
        correctAnswer: currentQ.options[currentQ.answer],
        explanation: currentQ.explanation,
        type: 'term',
      });
    }
    
    // 更新打卡数据：答了一道题
    checkInService.updateTodayProgress({ questionsAnswered: 1 });
  };

  // 下一题
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  };

  const currentQ = questions[currentIndex];
  const isFinished = showAnswer && currentIndex === questions.length - 1;

  return (
    <div className="term-quiz-page">
      <div className="quiz-container">
        <h2>💻 计算机术语测试</h2>
        <p className="quiz-subtitle">通过做题加深对编程术语的理解</p>

        {!started && (
          <div className="quiz-setup">
            <div className="setup-section">
              <label>选择难度：</label>
              <div className="option-group">
                {LEVELS.map(l => (
                  <button
                    key={l.id}
                    className={`option-btn ${level === l.id ? 'active' : ''}`}
                    onClick={() => setLevel(l.id)}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="setup-section">
              <label>题目类型：</label>
              <div className="option-group">
                {QUIZ_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`option-btn ${quizType === t.id ? 'active' : ''}`}
                    onClick={() => setQuizType(t.id)}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
              <p className="type-desc">{QUIZ_TYPES.find(t => t.id === quizType)?.desc}</p>
            </div>

            <button className="start-btn" onClick={generateQuiz}>
              开始测试
            </button>
          </div>
        )}

        {loading && (
          <div className="quiz-loading">
            <div className="spinner"></div>
            <p>正在生成题目...</p>
          </div>
        )}

        {started && !loading && questions.length > 0 && (
          <div className="quiz-content">
            <div className="quiz-progress">
              <span>第 {currentIndex + 1} / {questions.length} 题</span>
              <span className="score">正确: {score.correct} / {score.total}</span>
            </div>

            <div className="quiz-term">📌 {currentQ.term}</div>

            <div className="quiz-question">{currentQ.question}</div>

            <div className="quiz-options">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  className={`quiz-option ${selected === i ? 'selected' : ''} ${
                    showAnswer ? (i === currentQ.answer ? 'correct' : selected === i ? 'wrong' : '') : ''
                  }`}
                  onClick={() => handleSelect(i)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                  {opt}
                </button>
              ))}
            </div>

            {showAnswer && (
              <div className="quiz-explanation">
                <div className={`result-badge ${selected === currentQ.answer ? 'correct' : 'wrong'}`}>
                  {selected === currentQ.answer ? '✓ 正确！' : '✗ 错误'}
                </div>
                <p>{currentQ.explanation}</p>
              </div>
            )}

            <div className="quiz-actions">
              {!showAnswer ? (
                <button 
                  className="action-btn confirm" 
                  onClick={confirmAnswer}
                  disabled={selected === null}
                >
                  确认答案
                </button>
              ) : isFinished ? (
                <div className="final-score">
                  <h3>测试完成！</h3>
                  <p>得分：{score.correct} / {score.total}</p>
                  <button className="action-btn" onClick={() => setStarted(false)}>
                    重新开始
                  </button>
                </div>
              ) : (
                <button className="action-btn next" onClick={nextQuestion}>
                  下一题 →
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
