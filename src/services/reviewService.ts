import { vocabService } from './vocabService';
import type { TranslationResult } from '../types';

const REVIEW_SCHEDULE_KEY = 'review_schedule';

// 艾宾浩斯遗忘曲线复习间隔（天）
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];

export interface ReviewItem {
  wordId: string; // 单词的唯一标识
  word: string;
  addedTime: number; // 添加到生词本的时间
  lastReviewTime: number; // 上次复习时间
  nextReviewTime: number; // 下次复习时间
  reviewCount: number; // 复习次数
  masteryLevel: number; // 掌握程度 (0-6，对应REVIEW_INTERVALS的索引)
  correctCount: number; // 答对次数
  wrongCount: number; // 答错次数
}

class ReviewService {
  /** 获取所有复习计划 */
  getAllReviewItems(): ReviewItem[] {
    try {
      const data = localStorage.getItem(REVIEW_SCHEDULE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /** 保存复习计划 */
  private saveReviewItems(items: ReviewItem[]): void {
    try {
      localStorage.setItem(REVIEW_SCHEDULE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('保存复习计划失败:', e);
    }
  }

  /** 为新单词创建复习计划 */
  createReviewPlan(word: TranslationResult): void {
    const items = this.getAllReviewItems();
    
    // 检查是否已存在
    const existing = items.find(item => item.word === word.englishWord);
    if (existing) return;

    const now = Date.now();
    const newItem: ReviewItem = {
      wordId: `${word.englishWord}_${now}`,
      word: word.englishWord,
      addedTime: word.timestamp,
      lastReviewTime: now,
      nextReviewTime: now + REVIEW_INTERVALS[0] * 24 * 60 * 60 * 1000, // 1天后
      reviewCount: 0,
      masteryLevel: 0,
      correctCount: 0,
      wrongCount: 0,
    };

    items.push(newItem);
    this.saveReviewItems(items);
  }

  /** 批量创建复习计划（用于初始化） */
  initializeReviewPlans(): void {
    const allWords = vocabService.getAllWords();
    const existingItems = this.getAllReviewItems();
    const existingWords = new Set(existingItems.map(item => item.word));

    const newItems = allWords
      .filter(word => !existingWords.has(word.englishWord))
      .map(word => {
        return {
          wordId: `${word.englishWord}_${word.timestamp}`,
          word: word.englishWord,
          addedTime: word.timestamp,
          lastReviewTime: word.timestamp,
          nextReviewTime: word.timestamp + REVIEW_INTERVALS[0] * 24 * 60 * 60 * 1000,
          reviewCount: 0,
          masteryLevel: 0,
          correctCount: 0,
          wrongCount: 0,
        } as ReviewItem;
      });

    if (newItems.length > 0) {
      this.saveReviewItems([...existingItems, ...newItems]);
    }
  }

  /** 记录复习结果 */
  recordReview(wordId: string, isCorrect: boolean): void {
    const items = this.getAllReviewItems();
    const item = items.find(i => i.wordId === wordId);
    
    if (!item) return;

    const now = Date.now();
    item.lastReviewTime = now;
    item.reviewCount++;

    if (isCorrect) {
      item.correctCount++;
      // 答对了，提升掌握程度
      if (item.masteryLevel < REVIEW_INTERVALS.length - 1) {
        item.masteryLevel++;
      }
    } else {
      item.wrongCount++;
      // 答错了，降低掌握程度
      item.masteryLevel = Math.max(0, item.masteryLevel - 1);
    }

    // 计算下次复习时间
    const intervalDays = REVIEW_INTERVALS[item.masteryLevel];
    item.nextReviewTime = now + intervalDays * 24 * 60 * 60 * 1000;

    this.saveReviewItems(items);
  }

  /** 获取今天需要复习的单词 */
  getTodayReviewWords(): ReviewItem[] {
    const now = Date.now();
    return this.getAllReviewItems()
      .filter(item => item.nextReviewTime <= now)
      .sort((a, b) => a.nextReviewTime - b.nextReviewTime);
  }

  /** 获取即将到期的单词（未来3天内） */
  getUpcomingReviewWords(): ReviewItem[] {
    const now = Date.now();
    const threeDaysLater = now + 3 * 24 * 60 * 60 * 1000;
    
    return this.getAllReviewItems()
      .filter(item => item.nextReviewTime > now && item.nextReviewTime <= threeDaysLater)
      .sort((a, b) => a.nextReviewTime - b.nextReviewTime);
  }

  /** 获取统计数据 */
  getStats() {
    const items = this.getAllReviewItems();
    const now = Date.now();
    
    const todayReview = items.filter(item => item.nextReviewTime <= now).length;
    const upcomingReview = items.filter(item => {
      const threeDaysLater = now + 3 * 24 * 60 * 60 * 1000;
      return item.nextReviewTime > now && item.nextReviewTime <= threeDaysLater;
    }).length;

    // 按掌握程度分组
    const byMastery = {
      beginner: items.filter(i => i.masteryLevel <= 1).length, // 初学
      intermediate: items.filter(i => i.masteryLevel >= 2 && i.masteryLevel <= 4).length, // 中级
      advanced: items.filter(i => i.masteryLevel >= 5).length, // 高级
    };

    // 计算平均正确率
    const totalCorrect = items.reduce((sum, i) => sum + i.correctCount, 0);
    const totalWrong = items.reduce((sum, i) => sum + i.wrongCount, 0);
    const totalAttempts = totalCorrect + totalWrong;
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

    return {
      total: items.length,
      todayReview,
      upcomingReview,
      byMastery,
      accuracy,
      totalReviews: items.reduce((sum, i) => sum + i.reviewCount, 0),
    };
  }

  /** 获取单词的复习信息 */
  getWordReviewInfo(word: string): ReviewItem | null {
    return this.getAllReviewItems().find(item => item.word === word) || null;
  }

  /** 重置单词的复习进度 */
  resetWordProgress(wordId: string): void {
    const items = this.getAllReviewItems();
    const item = items.find(i => i.wordId === wordId);
    
    if (item) {
      const now = Date.now();
      item.masteryLevel = 0;
      item.reviewCount = 0;
      item.correctCount = 0;
      item.wrongCount = 0;
      item.lastReviewTime = now;
      item.nextReviewTime = now + REVIEW_INTERVALS[0] * 24 * 60 * 60 * 1000;
      this.saveReviewItems(items);
    }
  }

  /** 删除单词的复习计划 */
  deleteReviewPlan(wordId: string): void {
    const items = this.getAllReviewItems();
    const filtered = items.filter(i => i.wordId !== wordId);
    this.saveReviewItems(filtered);
  }

  /** 获取复习日历数据（未来30天） */
  getReviewCalendar(): { date: string; count: number }[] {
    const items = this.getAllReviewItems();
    const calendar: { date: string; count: number }[] = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      
      const dateString = date.toISOString().split('T')[0];
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const count = items.filter(item => {
        const reviewDate = new Date(item.nextReviewTime);
        return reviewDate >= date && reviewDate < nextDay;
      }).length;
      
      calendar.push({ date: dateString, count });
    }
    
    return calendar;
  }

  /** 获取掌握程度标签 */
  getMasteryLabel(level: number): string {
    if (level <= 1) return '初学';
    if (level <= 3) return '熟悉';
    if (level <= 5) return '掌握';
    return '精通';
  }

  /** 获取掌握程度颜色 */
  getMasteryColor(level: number): string {
    if (level <= 1) return '#ef5350';
    if (level <= 3) return '#ffa726';
    if (level <= 5) return '#66bb6a';
    return '#42a5f5';
  }
}

export const reviewService = new ReviewService();
