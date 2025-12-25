import type { QuizQuestion, TranslationResult } from '../types';
import { vocabService } from './vocabService';

// 存储当前题目，用于答案验证
const currentQuestions = new Map<string, QuizQuestion>();

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 从翻译结果生成题目场景描述
 * 使用比喻或场景来出题，不直接显示原词
 */
function generateScenario(result: TranslationResult): string {
  // 优先使用生活比喻
  if (result.lifeAnalogy && result.lifeAnalogy.trim()) {
    return `想一想：${result.lifeAnalogy}`;
  }
  
  // 其次使用应用场景
  if (result.usageScenarios && result.usageScenarios.length > 0) {
    const scenario = result.usageScenarios[Math.floor(Math.random() * result.usageScenarios.length)];
    return `在这个场景中会用到什么词？${scenario}`;
  }
  
  // 最后使用本质说明
  if (result.essenceExplanation && result.essenceExplanation.trim()) {
    return `本质上是：${result.essenceExplanation}，这是什么词？`;
  }
  
  // 兜底：使用大白话解释
  return `这个词的意思是：${result.plainExplanation}`;
}

/**
 * 做题服务
 * 从生词本生成练习题目
 */
export const quizService = {
  /**
   * 从生词本随机抽取词汇生成题目
   * @returns 题目对象，如果生词本为空则返回 null
   */
  generateQuestion(): QuizQuestion | null {
    const words = vocabService.getAllWords();
    
    if (words.length === 0) {
      return null;
    }
    
    // 随机选择一个词汇
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    
    const question: QuizQuestion = {
      id: generateId(),
      scenario: generateScenario(selectedWord),
      correctAnswer: selectedWord.originalWord,
      fullResult: selectedWord,
    };
    
    // 存储题目用于后续验证
    currentQuestions.set(question.id, question);
    
    return question;
  },

  /**
   * 检查用户答案是否正确
   * 忽略大小写和首尾空格
   */
  checkAnswer(questionId: string, userAnswer: string): boolean {
    const question = currentQuestions.get(questionId);
    
    if (!question) {
      return false;
    }
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = question.correctAnswer.trim().toLowerCase();
    
    return normalizedUserAnswer === normalizedCorrectAnswer;
  },

  /**
   * 获取题目（用于测试）
   */
  getQuestion(questionId: string): QuizQuestion | undefined {
    return currentQuestions.get(questionId);
  },

  /**
   * 清除所有题目（用于测试）
   */
  clearQuestions(): void {
    currentQuestions.clear();
  }
};
