import { useState, useEffect } from 'react';
import { reviewService, ReviewItem } from '../services/reviewService';
import { vocabService } from '../services/vocabService';
import { ttsService } from '../services/ttsService';
import { checkInService } from '../services/checkInService';
import type { TranslationResult } from '../types';
import './SmartReviewPage.css';

type ReviewMode = 'today' | 'upcoming' | 'all';

export function SmartReviewPage() {
  const [mode, setMode] = useState<ReviewMode>('today');
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState(reviewService.getStats());
  const [calendar, setCalendar] = useState(reviewService.getReviewCalendar());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    // 初始化复习计划
    reviewService.initializeReviewPlans();
    loadData();
  }, [mode]);

  const loadData = () => {
    let items: ReviewItem[];
    
    switch (mode) {
      case 'today':
        items = reviewService.getTodayReviewWords();
        break;
      case 'upcoming':
        items = reviewService.getUpcomingReviewWords();
        break;
      case 'all':
        items = reviewService.getAllReviewItems();
        break;
    }
    
    setReviewItems(items);
    setStats(reviewService.getStats());
    setCalendar(reviewService.getReviewCalendar());
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
  };

  const startReview = () => {
    if (reviewItems.length === 0) return;
    setIsReviewing(true);
    setCurrentIndex(0);
    setShowAnswer(false);
    setUserAnswer('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAnswer(true);
  };

  const handleCorrect = () => {
    const currentItem = reviewItems[currentIndex];
    reviewService.recordReview(currentItem.wordId, true);
    checkInService.updateTodayProgress({ questionsAnswered: 1 });
    nextWord();
  };

  const handleWrong = () => {
    const currentItem = reviewItems[currentIndex];
    reviewService.recordReview(currentItem.wordId, false);
    checkInService.updateTodayProgress({ questionsAnswered: 1 });
    nextWord();
  };

  const nextWord = () => {
    if (currentIndex < reviewItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setUserAnswer('');
    } else {
      // 复习完成
      setIsReviewing(false);
      loadData();
      alert('🎉 今日复习完成！继续保持！');
    }
  };

  const playWord = (word: string) => {
    ttsService.speak(word);
  };

  const getWordDetails = (word: string): TranslationResult | null => {
    return vocabService.getAllWords().find(w => w.englishWord === word) || null;
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    return `${Math.floor(days / 30)}个月前`;
  };

  const formatNextReview = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return '需要复习';
    if (days === 0) return '今天';
    if (days === 1) return '明天';
    if (days < 7) return `${days}天后`;
    if (days < 30) return `${Math.floor(days / 7)}周后`;
    return `${Math.floor(days / 30)}个月后`;
  };

  const currentItem = isReviewing && reviewItems[currentIndex] ? reviewItems[currentIndex] : null;
  const currentWord = currentItem ? getWordDetails(currentItem.word) : null;

  return (
    <div className="smart-review-page">
      <div className="page-header">
        <h1>🧠 智能复习</h1>
        <p className="subtitle">基于艾宾浩斯遗忘曲线，科学记忆</p>
      </div>

      {!isReviewing ? (
        <>
          {/* 统计卡片 */}
          <div className="stats-cards">
            <div className="stat-card today">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.todayReview}</div>
                <div className="stat-label">今日待复习</div>
              </div>
            </div>
            <div className="stat-card upcoming">
              <div className="stat-icon">⏰</div>
              <div className="stat-info">
                <div className="stat-value">{stats.upcomingReview}</div>
                <div className="stat-label">即将到期（3天内）</div>
              </div>
            </div>
            <div className="stat-card total">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">总复习单词</div>
              </div>
            </div>
            <div className="stat-card accuracy">
              <div className="stat-icon">🎯</div>
              <div className="stat-info">
                <div className="stat-value">{stats.accuracy}%</div>
                <div className="stat-label">平均正确率</div>
              </div>
            </div>
          </div>

          {/* 掌握程度分布 */}
          <div className="mastery-distribution">
            <h3>📊 掌握程度分布</h3>
            <div className="mastery-bars">
              <div className="mastery-bar">
                <div className="bar-label">
                  <span>🌱 初学</span>
                  <span>{stats.byMastery.beginner}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill beginner"
                    style={{ width: `${(stats.byMastery.beginner / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="mastery-bar">
                <div className="bar-label">
                  <span>🌿 熟悉</span>
                  <span>{stats.byMastery.intermediate}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill intermediate"
                    style={{ width: `${(stats.byMastery.intermediate / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="mastery-bar">
                <div className="bar-label">
                  <span>🌳 掌握</span>
                  <span>{stats.byMastery.advanced}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill advanced"
                    style={{ width: `${(stats.byMastery.advanced / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 复习日历 */}
          <div className="review-calendar">
            <h3>📆 未来30天复习计划</h3>
            <div className="calendar-grid">
              {calendar.map((day, index) => {
                const date = new Date(day.date);
                const isToday = day.date === new Date().toISOString().split('T')[0];
                
                return (
                  <div
                    key={index}
                    className={`calendar-day ${day.count > 0 ? 'has-review' : ''} ${isToday ? 'today' : ''}`}
                    title={`${day.date}\n${day.count}个单词需要复习`}
                  >
                    <div className="day-number">{date.getDate()}</div>
                    {day.count > 0 && <div className="day-count">{day.count}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 模式选择 */}
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'today' ? 'active' : ''}`}
              onClick={() => setMode('today')}
            >
              📅 今日复习 ({stats.todayReview})
            </button>
            <button
              className={`mode-btn ${mode === 'upcoming' ? 'active' : ''}`}
              onClick={() => setMode('upcoming')}
            >
              ⏰ 即将到期 ({stats.upcomingReview})
            </button>
            <button
              className={`mode-btn ${mode === 'all' ? 'active' : ''}`}
              onClick={() => setMode('all')}
            >
              📚 全部单词 ({stats.total})
            </button>
          </div>

          {/* 开始复习按钮 */}
          {reviewItems.length > 0 && (
            <div className="start-review-section">
              <button className="start-review-btn" onClick={startReview}>
                🚀 开始复习 ({reviewItems.length}个单词)
              </button>
            </div>
          )}

          {/* 单词列表 */}
          {reviewItems.length > 0 ? (
            <div className="words-list">
              {reviewItems.map((item) => {
                const wordDetails = getWordDetails(item.word);
                return (
                  <div key={item.wordId} className="word-card">
                    <div className="word-header">
                      <span className="word-text" onClick={() => playWord(item.word)}>
                        {item.word} 🔊
                      </span>
                      <span 
                        className="mastery-badge"
                        style={{ backgroundColor: reviewService.getMasteryColor(item.masteryLevel) }}
                      >
                        {reviewService.getMasteryLabel(item.masteryLevel)}
                      </span>
                    </div>
                    
                    {wordDetails && (
                      <div className="word-meaning">{wordDetails.plainExplanation}</div>
                    )}
                    
                    <div className="word-stats">
                      <span>复习 {item.reviewCount} 次</span>
                      <span>✓ {item.correctCount} / ✗ {item.wrongCount}</span>
                      <span>上次：{formatDate(item.lastReviewTime)}</span>
                      <span className="next-review">
                        下次：{formatNextReview(item.nextReviewTime)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <p>
                {mode === 'today' && '太棒了！今天没有需要复习的单词'}
                {mode === 'upcoming' && '未来3天内没有需要复习的单词'}
                {mode === 'all' && '还没有添加单词到复习计划'}
              </p>
              <p className="hint">
                {mode === 'all' 
                  ? '去生词本添加一些单词吧！'
                  : '继续保持，明天再来！'}
              </p>
            </div>
          )}
        </>
      ) : (
        /* 复习模式 */
        <div className="review-mode">
          <div className="review-progress">
            <div className="progress-text">
              {currentIndex + 1} / {reviewItems.length}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentIndex + 1) / reviewItems.length) * 100}%` }}
              />
            </div>
          </div>

          {currentItem && currentWord && (
            <div className="review-card">
              <div className="review-word">
                <h2>{currentItem.word}</h2>
                <button className="play-btn" onClick={() => playWord(currentItem.word)}>
                  🔊 发音
                </button>
              </div>

              <div className="review-info">
                <span 
                  className="mastery-badge"
                  style={{ backgroundColor: reviewService.getMasteryColor(currentItem.masteryLevel) }}
                >
                  {reviewService.getMasteryLabel(currentItem.masteryLevel)}
                </span>
                <span>复习 {currentItem.reviewCount} 次</span>
              </div>

              {!showAnswer ? (
                <form onSubmit={handleSubmit} className="review-form">
                  <p className="review-hint">回忆一下这个单词的意思...</p>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="输入你记得的意思..."
                    className="review-input"
                    rows={3}
                  />
                  <button type="submit" className="show-answer-btn">
                    查看答案
                  </button>
                </form>
              ) : (
                <div className="answer-section">
                  <div className="word-details">
                    <div className="detail-item">
                      <strong>音标：</strong>
                      <span>{currentWord.phonetic}</span>
                    </div>
                    <div className="detail-item">
                      <strong>释义：</strong>
                      <span>{currentWord.plainExplanation}</span>
                    </div>
                    <div className="detail-item">
                      <strong>本质：</strong>
                      <span>{currentWord.essenceExplanation}</span>
                    </div>
                    {currentWord.lifeAnalogy && (
                      <div className="detail-item">
                        <strong>类比：</strong>
                        <span>{currentWord.lifeAnalogy}</span>
                      </div>
                    )}
                  </div>

                  <div className="review-actions">
                    <button className="wrong-btn" onClick={handleWrong}>
                      ❌ 没记住
                    </button>
                    <button className="correct-btn" onClick={handleCorrect}>
                      ✅ 记住了
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
