import type { TranslationResult, VocabCategory } from '../types';
import { VOCAB_CATEGORIES } from '../types';

const STORAGE_KEY = 'vocab_book';

/**
 * 从 localStorage 加载生词本数据
 * 处理向后兼容：旧数据没有 category 字段时默认为"其他"
 */
function loadFromStorage(): TranslationResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const words = JSON.parse(data) as TranslationResult[];
      // 向后兼容：为没有 category 的旧数据添加默认分类
      return words.map(w => ({
        ...w,
        category: w.category || '其他'
      }));
    }
  } catch (e) {
    console.error('加载生词本失败:', e);
  }
  return [];
}

/**
 * 保存生词本数据到 localStorage
 */
function saveToStorage(words: TranslationResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (e) {
    console.error('保存生词本失败:', e);
  }
}

/**
 * 生词本服务
 * 管理用户收藏的词汇，使用 localStorage 持久化
 */
export const vocabService = {
  /**
   * 添加词汇到生词本
   * @returns true 如果添加成功，false 如果词汇已存在
   */
  addWord(result: TranslationResult): boolean {
    const words = loadFromStorage();
    
    // 检查是否已存在（通过原词判断）
    if (words.some(w => w.originalWord === result.originalWord)) {
      return false;
    }
    
    words.push(result);
    saveToStorage(words);
    return true;
  },

  /**
   * 从生词本移除词汇
   */
  removeWord(word: string): void {
    const words = loadFromStorage();
    const filtered = words.filter(w => w.originalWord !== word);
    saveToStorage(filtered);
  },

  /**
   * 获取所有生词
   */
  getAllWords(): TranslationResult[] {
    return loadFromStorage();
  },

  /**
   * 获取生词数量
   */
  getWordCount(): number {
    return loadFromStorage().length;
  },

  /**
   * 检查词汇是否在生词本中
   */
  hasWord(word: string): boolean {
    const words = loadFromStorage();
    return words.some(w => w.originalWord === word);
  },

  /**
   * 清空生词本（用于测试）
   */
  clear(): void {
    saveToStorage([]);
  },

  /**
   * 按分类获取词汇
   */
  getWordsByCategory(category: VocabCategory): TranslationResult[] {
    const words = loadFromStorage();
    return words.filter(w => w.category === category);
  },

  /**
   * 获取各分类的词汇数量统计
   */
  getCategoryStats(): Record<VocabCategory, number> {
    const words = loadFromStorage();
    const stats = {} as Record<VocabCategory, number>;
    
    // 初始化所有分类为 0
    for (const cat of VOCAB_CATEGORIES) {
      stats[cat] = 0;
    }
    
    // 统计各分类数量
    for (const word of words) {
      const category = word.category || '其他';
      if (stats[category] !== undefined) {
        stats[category]++;
      } else {
        stats['其他']++;
      }
    }
    
    return stats;
  }
};
