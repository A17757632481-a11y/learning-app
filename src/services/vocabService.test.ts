import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { vocabService } from './vocabService';
import type { TranslationResult, VocabCategory } from '../types';
import { VOCAB_CATEGORIES } from '../types';

// 生成随机分类
const categoryArb = fc.constantFrom(...VOCAB_CATEGORIES);

// 生成随机 TranslationResult 的 Arbitrary
const translationResultArb = fc.record({
  originalWord: fc.string({ minLength: 1, maxLength: 50 }),
  plainExplanation: fc.string({ minLength: 1 }),
  lifeAnalogy: fc.string({ minLength: 1 }),
  essenceExplanation: fc.string({ minLength: 1 }),
  usageScenarios: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
  englishWord: fc.string({ minLength: 1 }),
  phonetic: fc.string(),
  timestamp: fc.integer({ min: 0 }),
  category: categoryArb,
});

// 生成唯一原词的 TranslationResult 数组
const uniqueTranslationResultsArb = fc
  .array(translationResultArb, { minLength: 1, maxLength: 10 })
  .map(results => {
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.originalWord)) return false;
      seen.add(r.originalWord);
      return true;
    });
  })
  .filter(arr => arr.length > 0);

describe('VocabService', () => {
  beforeEach(() => {
    localStorage.clear();
    vocabService.clear();
  });

  /**
   * Property 1: 生词本添加后可检索
   * *For any* 翻译结果，如果将其添加到生词本，则通过 getAllWords() 应能检索到该词汇，且 hasWord() 返回 true。
   * **Validates: Requirements 3.2, 3.5**
   */
  it('Property 1: 添加的词汇可以通过 getAllWords 和 hasWord 检索到', () => {
    fc.assert(
      fc.property(translationResultArb, (result: TranslationResult) => {
        vocabService.clear();
        
        vocabService.addWord(result);
        
        const allWords = vocabService.getAllWords();
        const found = allWords.some(w => w.originalWord === result.originalWord);
        const hasIt = vocabService.hasWord(result.originalWord);
        
        return found && hasIt;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: 生词本数量一致性
   * *For any* 生词本操作序列，getWordCount() 的返回值应始终等于 getAllWords().length。
   * **Validates: Requirements 3.3**
   */
  it('Property 2: getWordCount 始终等于 getAllWords().length', () => {
    fc.assert(
      fc.property(uniqueTranslationResultsArb, (results: TranslationResult[]) => {
        vocabService.clear();
        
        // 添加多个词汇
        for (const result of results) {
          vocabService.addWord(result);
        }
        
        const count = vocabService.getWordCount();
        const allWordsLength = vocabService.getAllWords().length;
        
        return count === allWordsLength;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: 重复添加幂等性
   * *For any* 已存在于生词本的词汇，再次添加不应增加生词本数量，且应返回 false。
   * **Validates: Requirements 3.7**
   */
  it('Property 6: 重复添加同一词汇不会增加数量', () => {
    fc.assert(
      fc.property(translationResultArb, (result: TranslationResult) => {
        vocabService.clear();
        
        // 第一次添加
        const firstAdd = vocabService.addWord(result);
        const countAfterFirst = vocabService.getWordCount();
        
        // 第二次添加同一词汇
        const secondAdd = vocabService.addWord(result);
        const countAfterSecond = vocabService.getWordCount();
        
        // 第一次应成功，第二次应失败，数量不变
        return firstAdd === true && secondAdd === false && countAfterFirst === countAfterSecond;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: 分类信息持久化 (Round-trip)
   * *For any* 带有有效分类的词汇，添加到生词本后再获取，其分类信息应该与原始分类完全一致。
   * **Validates: Requirements 1.2**
   * **Feature: vocab-auto-category, Property 1: 分类信息持久化**
   */
  it('Property 7: 分类信息在存储后保持不变', () => {
    fc.assert(
      fc.property(translationResultArb, (result: TranslationResult) => {
        vocabService.clear();
        
        vocabService.addWord(result);
        
        const allWords = vocabService.getAllWords();
        const found = allWords.find(w => w.originalWord === result.originalWord);
        
        return found !== undefined && found.category === result.category;
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: 分类筛选正确性
   * *For any* 词汇列表和任意分类，使用该分类筛选后的结果中，每个词汇的分类都应该等于筛选条件。
   * **Validates: Requirements 2.2**
   * **Feature: vocab-auto-category, Property 2: 分类筛选正确性**
   */
  it('Property 8: 按分类筛选的结果只包含该分类的词汇', () => {
    fc.assert(
      fc.property(
        uniqueTranslationResultsArb,
        categoryArb,
        (results: TranslationResult[], filterCategory: VocabCategory) => {
          vocabService.clear();
          
          // 添加所有词汇
          for (const result of results) {
            vocabService.addWord(result);
          }
          
          // 按分类筛选
          const filtered = vocabService.getWordsByCategory(filterCategory);
          
          // 验证筛选结果中每个词汇的分类都等于筛选条件
          return filtered.every(w => w.category === filterCategory);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: 分类统计一致性
   * *For any* 词汇列表，所有分类的词汇数量之和应该等于词汇总数。
   * **Validates: Requirements 2.4**
   * **Feature: vocab-auto-category, Property 3: 分类统计一致性**
   */
  it('Property 9: 各分类数量之和等于总词汇数', () => {
    fc.assert(
      fc.property(uniqueTranslationResultsArb, (results: TranslationResult[]) => {
        vocabService.clear();
        
        // 添加所有词汇
        for (const result of results) {
          vocabService.addWord(result);
        }
        
        const stats = vocabService.getCategoryStats();
        const totalFromStats = Object.values(stats).reduce((sum, count) => sum + count, 0);
        const totalCount = vocabService.getWordCount();
        
        return totalFromStats === totalCount;
      }),
      { numRuns: 100 }
    );
  });
});
