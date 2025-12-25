import { useState, useEffect } from 'react';
import { checkInService } from '../services/checkInService';
import type { StudyStats, Achievement } from '../services/checkInService';
import './CheckInPage.css';

export function CheckInPage() {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHasCheckedIn(checkInService.hasCheckedInToday());
    setStats(checkInService.getStats());
    setAchievements(checkInService.getAchievements());
    setCalendarData(checkInService.getCalendarData());
  };

  const handleCheckIn = () => {
    const success = checkInService.checkIn();
    if (success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      loadData();
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
  };

  const getExpProgress = (): number => {
    if (!stats) return 0;
    const currentLevelExp = (stats.level - 1) * 100;
    const nextLevelExp = stats.level * 100;
    const progress = ((stats.exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (!stats) {
    return <div className="checkin-page">加载中...</div>;
  }

  return (
    <div className="checkin-page">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div key={i} className="confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`,
              backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c'][Math.floor(Math.random() * 4)]
            }} />
          ))}
        </div>
      )}

      <div className="checkin-header">
        <h1>📅 学习打卡</h1>
        <p className="subtitle">坚持每天学习，见证自己的成长</p>
      </div>

      {/* 打卡按钮 */}
      <div className="checkin-card">
        <div className="checkin-status">
          {hasCheckedIn ? (
            <>
              <div className="checkin-icon success">✓</div>
              <h2>今日已打卡</h2>
              <p>继续保持，加油！</p>
            </>
          ) : (
            <>
              <div className="checkin-icon pending">📝</div>
              <h2>今日未打卡</h2>
              <button className="checkin-btn" onClick={handleCheckIn}>
                立即打卡
              </button>
            </>
          )}
        </div>

        <div className="streak-info">
          <div className="streak-item">
            <span className="streak-icon">🔥</span>
            <span className="streak-number">{stats.currentStreak}</span>
            <span className="streak-label">连续天数</span>
          </div>
          <div className="streak-item">
            <span className="streak-icon">🏆</span>
            <span className="streak-number">{stats.longestStreak}</span>
            <span className="streak-label">最长记录</span>
          </div>
          <div className="streak-item">
            <span className="streak-icon">📚</span>
            <span className="streak-number">{stats.totalDays}</span>
            <span className="streak-label">累计天数</span>
          </div>
        </div>
      </div>

      {/* 等级与经验 */}
      <div className="level-card">
        <div className="level-header">
          <div className="level-badge">
            <span className="level-icon">⭐</span>
            <span className="level-text">Lv.{stats.level}</span>
          </div>
          <div className="exp-text">
            {stats.exp % 100} / 100 EXP
          </div>
        </div>
        <div className="exp-bar">
          <div className="exp-fill" style={{ width: `${getExpProgress()}%` }} />
        </div>
        <p className="level-hint">继续学习获得经验值，升级解锁更多成就！</p>
      </div>

      {/* 学习统计 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-value">{formatTime(stats.totalStudyMinutes)}</div>
          <div className="stat-label">累计学习时长</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-value">{stats.totalWords}</div>
          <div className="stat-label">学习词汇数</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✏️</div>
          <div className="stat-value">{stats.totalQuestions}</div>
          <div className="stat-label">完成题目数</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.totalLessons}</div>
          <div className="stat-label">完成课程数</div>
        </div>
      </div>

      {/* 成就系统 */}
      <div className="achievements-section">
        <h2>🏆 成就徽章</h2>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-name">{achievement.name}</div>
              <div className="achievement-desc">{achievement.description}</div>
              {achievement.unlocked && (
                <div className="achievement-badge">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 打卡日历 */}
      <div className="calendar-section">
        <h2>📆 打卡日历（最近90天）</h2>
        <div className="calendar-grid">
          {calendarData.map((day, index) => {
            const isToday = day.date === new Date().toISOString().split('T')[0];
            
            return (
              <div
                key={index}
                className={`calendar-day ${day.hasCheckedIn ? 'checked' : ''} ${isToday ? 'today' : ''}`}
                title={`${day.date}${day.hasCheckedIn ? '\n已打卡' : '\n未打卡'}`}
              >
                <div className="day-dot" />
              </div>
            );
          })}
        </div>
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-dot checked" />
            <span>已打卡</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" />
            <span>未打卡</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot today" />
            <span>今天</span>
          </div>
        </div>
      </div>
    </div>
  );
}
