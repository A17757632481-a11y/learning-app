import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { quizService } from './quizService';
import { vocabService } from './vocabService';
import type { TranslationResult } from '../types';

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

describe('QuizService', () => {
  beforeEach(() => {
    localStorage.clear();
    vocabService.clear();
    quizService.clearQuestions();
  });

  /**
   * Property 4: 做题从生词本抽取
   * *For any* 生成的题目，其对应的词汇必须存在于当前生词本中。
   * **Validates: Requirements 4.1**
   */
  it('Property 4: 生成的题目词汇必须来自生词本', () => {
    fc.assert(
      fc.property(uniqueTranslationResultsArb, (results: TranslationResult[]) => {
        vocabService.clear();
        quizService.clearQuestions();
        
        // 添加词汇到生词本
        for (const result of results) {
          vocabService.addWord(result);
        }
        
        // 生成题目
        const question = quizService.generateQuestion();
        
        if (question === null) {
          // 如果生词本为空，应该返回 null
          return vocabService.getWordCount() === 0;
        }
        
        // 题目的正确答案必须在生词本中
        return vocabService.hasWord(question.correctAnswer);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 5: 答案判断一致性
   * *For any* 题目和用户答案，如果用户答案与正确答案匹配（忽略大小写和首尾空格），则判断为正确。
   * **Validates: Requirements 4.4**
   */
  it('Property 5: 答案判断忽略大小写和首尾空格', () => {
    fc.assert(
      fc.property(
        translationResultArb,
        fc.constantFrom('', ' ', '  ', '\t', '\n'), // 前缀空白
        fc.constantFrom('', ' ', '  ', '\t', '\n'), // 后缀空白
        fc.boolean(), // 是否转换大小写
        (result: TranslationResult, prefix: string, suffix: string, toggleCase: boolean) => {
          vocabService.clear();
          quizService.clearQuestions();
          
          // 添加词汇
          vocabService.addWord(result);
          
          // 生成题目
          const question = quizService.generateQuestion();
          
          if (question === null) {
            return false;
          }
          
          // 构造带空白和大小写变化的答案
          let answer = question.correctAnswer;
          if (toggleCase) {
            answer = answer.toUpperCase() === answer ? answer.toLowerCase() : answer.toUpperCase();
          }
          answer = prefix + answer + suffix;
          
          // 应该判断为正确
          return quizService.checkAnswer(question.id, answer);
        }
      ),
      { numRuns: 100 }
    );
  });
});
