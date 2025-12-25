import { useState, useEffect } from 'react';
import { wrongQuestionsService, WrongQuestion } from '../services/wrongQuestionsService';
import { ttsService } from '../services/ttsService';
import './WrongQuestionsPage.css';

type FilterType = 'all' | 'quiz' | 'dictate' | 'term' | 'deep';
type ViewMode = 'unmastered' | 'mastered';

export function WrongQuestionsPage() {
  const [questions, setQuestions] = useState<WrongQuestion[]>([]);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('unmastered');
  const [stats, setStats] = useState(wrongQuestionsService.getStats());
  const [selectedQuestion, setSelectedQuestion] = useState<WrongQuestion | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [filterType, viewMode]);

  const loadQuestions = () => {
    let allQuestions: WrongQuestion[];
    
    if (viewMode === 'unmastered') {
      allQuestions = wrongQuestionsService.getUnmasteredQuestions();
    } else {
      allQuestions = wrongQuestionsService.getMasteredQuestions();
    }

    if (filterType !== 'all') {
      allQuestions = allQuestions.filter(q => q.type === filterType);
    }

    // 按时间倒序排列
    allQuestions.sort((a, b) => b.timestamp - a.timestamp);
    
    setQuestions(allQuestions);
    setStats(wrongQuestionsService.getStats());
  };

  const handleMarkAsMastered = (questionId: string) => {
    wrongQuestionsService.markAsMastered(questionId);
    loadQuestions();
    setSelectedQuestion(null);
  };

  const handleDelete = (questionId: string) => {
    if (confirm('确定要删除这道错题吗？')) {
      wrongQuestionsService.deleteWrongQuestion(questionId);
      loadQuestions();
      setSelectedQuestion(null);
    }
  };

  const handleReview = (question: WrongQuestion) => {
    wrongQuestionsService.incrementReviewCount(question.id);
    setSelectedQuestion(question);
    loadQuestions();
  };

  const handleClearMastered = () => {
    if (confirm('确定要清空所有已掌握的错题吗？')) {
      wrongQuestionsService.clearMastered();
      loadQuestions();
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有错题吗？此操作不可恢复！')) {
      wrongQuestionsService.clearAll();
      loadQuestions();
    }
  };

  const playWord = (word: string) => {
    ttsService.speak(word);
  };

  const getTypeLabel = (type: WrongQuestion['type']) => {
    const labels = {
      quiz: '📝 做题',
      dictate: '🎧 听写',
      term: '💻 术语',
      deep: '🧠 深度',
    };
    return labels[type];
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  return (
    <div className="wrong-questions-page">
      <div className="page-header">
        <h1>📕 错题本</h1>
        <p className="subtitle">针对性复习，快速提升</p>
      </div>

      {/* 统计卡片 */}
      <div className="stats-cards">
        <div className="stat-card total">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">总错题数</div>
          </div>
        </div>
        <div className="stat-card unmastered">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <div className="stat-value">{stats.unmastered}</div>
            <div className="stat-label">待掌握</div>
          </div>
        </div>
        <div className="stat-card mastered">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <div className="stat-value">{stats.mastered}</div>
            <div className="stat-label">已掌握</div>
          </div>
        </div>
        <div className="stat-card by-type">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <div className="stat-breakdown">
              <span>做题: {stats.byType.quiz}</span>
              <span>听写: {stats.byType.dictate}</span>
              <span>术语: {stats.byType.term}</span>
              <span>深度: {stats.byType.deep}</span>
            </div>
            <div className="stat-label">分类统计</div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="filters">
        <div className="view-mode-selector">
          <button
            className={`mode-btn ${viewMode === 'unmastered' ? 'active' : ''}`}
            onClick={() => setViewMode('unmastered')}
          >
            ❌ 待掌握 ({stats.unmastered})
          </button>
          <button
            className={`mode-btn ${viewMode === 'mastered' ? 'active' : ''}`}
            onClick={() => setViewMode('mastered')}
          >
            ✅ 已掌握 ({stats.mastered})
          </button>
        </div>

        <div className="type-filters">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          <button
            className={`filter-btn ${filterType === 'quiz' ? 'active' : ''}`}
            onClick={() => setFilterType('quiz')}
          >
            📝 做题
          </button>
          <button
            className={`filter-btn ${filterType === 'dictate' ? 'active' : ''}`}
            onClick={() => setFilterType('dictate')}
          >
            🎧 听写
          </button>
          <button
            className={`filter-btn ${filterType === 'term' ? 'active' : ''}`}
            onClick={() => setFilterType('term')}
          >
            💻 术语
          </button>
          <button
            className={`filter-btn ${filterType === 'deep' ? 'active' : ''}`}
            onClick={() => setFilterType('deep')}
          >
            🧠 深度
          </button>
        </div>

        <div className="action-buttons">
          {viewMode === 'mastered' && stats.mastered > 0 && (
            <button className="clear-btn" onClick={handleClearMastered}>
              清空已掌握
            </button>
          )}
          {stats.total > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              清空全部
            </button>
          )}
        </div>
      </div>

      {/* 错题列表 */}
      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            {viewMode === 'unmastered' ? '🎉' : '📚'}
          </div>
          <p>
            {viewMode === 'unmastered'
              ? '太棒了！暂时没有待掌握的错题'
              : '还没有已掌握的错题'}
          </p>
          <p className="hint">
            {viewMode === 'unmastered'
              ? '继续保持，加油学习！'
              : '复习错题并标记为已掌握后会显示在这里'}
          </p>
        </div>
      ) : (
        <div className="questions-list">
          {questions.map((question) => (
            <div key={question.id} className="question-card">
              <div className="question-header">
                <span className="question-type">{getTypeLabel(question.type)}</span>
                <span className="question-word" onClick={() => playWord(question.word)}>
                  {question.word} 🔊
                </span>
                <span className="question-date">{formatDate(question.timestamp)}</span>
              </div>

              <div className="question-content">
                <div className="question-text">{question.question}</div>
                
                <div className="answer-section">
                  <div className="user-answer wrong">
                    <span className="label">你的答案：</span>
                    <span className="value">{question.userAnswer || '未作答'}</span>
                  </div>
                  <div className="correct-answer">
                    <span className="label">正确答案：</span>
                    <span className="value">{question.correctAnswer}</span>
                  </div>
                </div>

                {question.explanation && (
                  <div className="explanation">
                    <span className="label">💡 解析：</span>
                    <span className="text">{question.explanation}</span>
                  </div>
                )}

                <div className="question-meta">
                  <span className="review-count">复习 {question.reviewCount} 次</span>
                  {question.lastReviewTime && (
                    <span className="last-review">
                      上次复习：{formatDate(question.lastReviewTime)}
                    </span>
                  )}
                </div>
              </div>

              <div className="question-actions">
                <button
                  className="review-btn"
                  onClick={() => handleReview(question)}
                >
                  📖 复习
                </button>
                {!question.mastered && (
                  <button
                    className="master-btn"
                    onClick={() => handleMarkAsMastered(question.id)}
                  >
                    ✅ 已掌握
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(question.id)}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedQuestion && (
        <div className="modal-overlay" onClick={() => setSelectedQuestion(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>错题详情</h3>
              <button className="close-btn" onClick={() => setSelectedQuestion(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-word">
                <span className="word-text">{selectedQuestion.word}</span>
                <button className="play-btn" onClick={() => playWord(selectedQuestion.word)}>
                  🔊 发音
                </button>
              </div>
              <div className="detail-question">
                <strong>题目：</strong>
                <p>{selectedQuestion.question}</p>
              </div>
              <div className="detail-answers">
                <div className="detail-answer wrong">
                  <strong>你的答案：</strong>
                  <p>{selectedQuestion.userAnswer || '未作答'}</p>
                </div>
                <div className="detail-answer correct">
                  <strong>正确答案：</strong>
                  <p>{selectedQuestion.correctAnswer}</p>
                </div>
              </div>
              {selectedQuestion.explanation && (
                <div className="detail-explanation">
                  <strong>💡 解析：</strong>
                  <p>{selectedQuestion.explanation}</p>
                </div>
              )}
              <div className="detail-meta">
                <p>复习次数：{selectedQuestion.reviewCount} 次</p>
                <p>添加时间：{new Date(selectedQuestion.timestamp).toLocaleString()}</p>
                {selectedQuestion.lastReviewTime && (
                  <p>上次复习：{new Date(selectedQuestion.lastReviewTime).toLocaleString()}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {!selectedQuestion.mastered && (
                <button
                  className="modal-master-btn"
                  onClick={() => handleMarkAsMastered(selectedQuestion.id)}
                >
                  ✅ 标记为已掌握
                </button>
              )}
              <button
                className="modal-close-btn"
                onClick={() => setSelectedQuestion(null)}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
