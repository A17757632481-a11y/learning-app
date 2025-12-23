const CHECKIN_KEY = 'study_checkin_data';
const STATS_KEY = 'study_stats';

export interface CheckInData {
  date: string; // YYYY-MM-DD
  timestamp: number;
  studyMinutes: number; // 学习时长（分钟）
  wordsLearned: number; // 学习词汇数
  questionsAnswered: number; // 答题数
  lessonsCompleted: number; // 完成课程数
}

export interface StudyStats {
  totalDays: number; // 总学习天数
  currentStreak: number; // 当前连续天数
  longestStreak: number; // 最长连续天数
  totalStudyMinutes: number; // 总学习时长
  totalWords: number; // 总词汇量
  totalQuestions: number; // 总答题数
  totalLessons: number; // 总课程数
  level: number; // 等级
  exp: number; // 经验值
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

class CheckInService {
  /** 获取今天的日期字符串 */
  private getTodayString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }

  /** 获取所有打卡记录 */
  getCheckInHistory(): CheckInData[] {
    try {
      const data = localStorage.getItem(CHECKIN_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /** 获取统计数据 */
  getStats(): StudyStats {
    try {
      const data = localStorage.getItem(STATS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }

    // 默认统计数据
    return {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalStudyMinutes: 0,
      totalWords: 0,
      totalQuestions: 0,
      totalLessons: 0,
      level: 1,
      exp: 0,
    };
  }

  /** 保存统计数据 */
  private saveStats(stats: StudyStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('保存统计数据失败:', e);
    }
  }

  /** 保存打卡记录 */
  private saveCheckInHistory(history: CheckInData[]): void {
    try {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('保存打卡记录失败:', e);
    }
  }

  /** 检查今天是否已打卡 */
  hasCheckedInToday(): boolean {
    const today = this.getTodayString();
    const history = this.getCheckInHistory();
    return history.some(record => record.date === today);
  }

  /** 获取今天的打卡记录 */
  getTodayCheckIn(): CheckInData | null {
    const today = this.getTodayString();
    const history = this.getCheckInHistory();
    return history.find(record => record.date === today) || null;
  }

  /** 打卡 */
  checkIn(): boolean {
    if (this.hasCheckedInToday()) {
      return false; // 今天已经打卡过了
    }

    const today = this.getTodayString();
    const history = this.getCheckInHistory();
    
    // 添加今天的打卡记录
    const newRecord: CheckInData = {
      date: today,
      timestamp: Date.now(),
      studyMinutes: 0,
      wordsLearned: 0,
      questionsAnswered: 0,
      lessonsCompleted: 0,
    };
    
    history.push(newRecord);
    this.saveCheckInHistory(history);

    // 更新统计数据
    this.updateStats();

    return true;
  }

  /** 更新今天的学习数据 */
  updateTodayProgress(data: Partial<Omit<CheckInData, 'date' | 'timestamp'>>): void {
    const today = this.getTodayString();
    const history = this.getCheckInHistory();
    
    let todayRecord = history.find(record => record.date === today);
    
    if (!todayRecord) {
      // 如果今天还没打卡，先打卡
      this.checkIn();
      todayRecord = history.find(record => record.date === today);
    }

    if (todayRecord) {
      // 更新数据（累加）
      if (data.studyMinutes) todayRecord.studyMinutes += data.studyMinutes;
      if (data.wordsLearned) todayRecord.wordsLearned += data.wordsLearned;
      if (data.questionsAnswered) todayRecord.questionsAnswered += data.questionsAnswered;
      if (data.lessonsCompleted) todayRecord.lessonsCompleted += data.lessonsCompleted;
      
      this.saveCheckInHistory(history);
      this.updateStats();
    }
  }

  /** 更新统计数据 */
  private updateStats(): void {
    const history = this.getCheckInHistory();
    const stats = this.getStats();

    // 计算总天数
    stats.totalDays = history.length;

    // 计算连续天数
    const { current, longest } = this.calculateStreaks(history);
    stats.currentStreak = current;
    stats.longestStreak = Math.max(longest, stats.longestStreak);

    // 计算总数据
    stats.totalStudyMinutes = history.reduce((sum, r) => sum + r.studyMinutes, 0);
    stats.totalWords = history.reduce((sum, r) => sum + r.wordsLearned, 0);
    stats.totalQuestions = history.reduce((sum, r) => sum + r.questionsAnswered, 0);
    stats.totalLessons = history.reduce((sum, r) => sum + r.lessonsCompleted, 0);

    // 计算等级和经验值
    const totalExp = stats.totalDays * 10 + stats.totalWords * 2 + stats.totalQuestions * 5 + stats.totalLessons * 20;
    stats.exp = totalExp;
    stats.level = Math.floor(totalExp / 100) + 1;

    this.saveStats(stats);
  }

  /** 计算连续天数 */
  private calculateStreaks(history: CheckInData[]): { current: number; longest: number } {
    if (history.length === 0) {
      return { current: 0, longest: 0 };
    }

    // 按日期排序
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1].date);
      const currDate = new Date(sorted[i].date);
      
      // 计算日期差
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // 连续
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        // 中断
        tempStreak = 1;
      }
    }

    // 检查当前连续天数（从最后一天往前算）
    const today = this.getTodayString();
    const lastRecord = sorted[sorted.length - 1];
    
    if (lastRecord.date === today) {
      // 今天有打卡
      currentStreak = 1;
      for (let i = sorted.length - 2; i >= 0; i--) {
        const prevDate = new Date(sorted[i].date);
        const currDate = new Date(sorted[i + 1].date);
        const diffTime = currDate.getTime() - prevDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      // 今天没打卡，检查是否是昨天
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      if (lastRecord.date === yesterdayString) {
        currentStreak = 1;
        for (let i = sorted.length - 2; i >= 0; i--) {
          const prevDate = new Date(sorted[i].date);
          const currDate = new Date(sorted[i + 1].date);
          const diffTime = currDate.getTime() - prevDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      } else {
        currentStreak = 0; // 断签了
      }
    }

    return { current: currentStreak, longest: longestStreak };
  }

  /** 获取成就列表 */
  getAchievements(): Achievement[] {
    const stats = this.getStats();
    
    const achievements: Achievement[] = [
      {
        id: 'first_day',
        name: '初来乍到',
        description: '完成第一天学习',
        icon: '🎯',
        unlocked: stats.totalDays >= 1,
      },
      {
        id: 'week_warrior',
        name: '一周战士',
        description: '连续学习7天',
        icon: '🔥',
        unlocked: stats.currentStreak >= 7,
      },
      {
        id: 'month_master',
        name: '月度大师',
        description: '连续学习30天',
        icon: '👑',
        unlocked: stats.currentStreak >= 30,
      },
      {
        id: 'vocab_100',
        name: '词汇新手',
        description: '学习100个词汇',
        icon: '📚',
        unlocked: stats.totalWords >= 100,
      },
      {
        id: 'vocab_500',
        name: '词汇达人',
        description: '学习500个词汇',
        icon: '📖',
        unlocked: stats.totalWords >= 500,
      },
      {
        id: 'quiz_100',
        name: '答题新手',
        description: '完成100道题目',
        icon: '✏️',
        unlocked: stats.totalQuestions >= 100,
      },
      {
        id: 'quiz_500',
        name: '答题达人',
        description: '完成500道题目',
        icon: '✍️',
        unlocked: stats.totalQuestions >= 500,
      },
      {
        id: 'time_10h',
        name: '时间投资者',
        description: '累计学习10小时',
        icon: '⏰',
        unlocked: stats.totalStudyMinutes >= 600,
      },
      {
        id: 'level_5',
        name: '等级达人',
        description: '达到5级',
        icon: '⭐',
        unlocked: stats.level >= 5,
      },
      {
        id: 'level_10',
        name: '学习大师',
        description: '达到10级',
        icon: '🌟',
        unlocked: stats.level >= 10,
      },
    ];

    return achievements;
  }

  /** 获取打卡日历数据（最近90天） */
  getCalendarData(): { date: string; hasCheckedIn: boolean; data?: CheckInData }[] {
    const history = this.getCheckInHistory();
    const calendar: { date: string; hasCheckedIn: boolean; data?: CheckInData }[] = [];
    
    // 生成最近90天的日期
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const record = history.find(r => r.date === dateString);
      calendar.push({
        date: dateString,
        hasCheckedIn: !!record,
        data: record,
      });
    }

    return calendar;
  }
}

export const checkInService = new CheckInService();
