const WRONG_QUESTIONS_KEY = 'wrong_questions';

export interface WrongQuestion {
  id: string;
  word: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  type: 'quiz' | 'dictate' | 'term' | 'deep'; // 题目类型
  timestamp: number;
  reviewCount: number; // 复习次数
  lastReviewTime?: number;
  mastered: boolean; // 是否已掌握
}

class WrongQuestionsService {
  /** 获取所有错题 */
  getAllWrongQuestions(): WrongQuestion[] {
    try {
      const data = localStorage.getItem(WRONG_QUESTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /** 保存错题 */
  private saveWrongQuestions(questions: WrongQuestion[]): void {
    try {
      localStorage.setItem(WRONG_QUESTIONS_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error('保存错题失败:', e);
    }
  }

  /** 添加错题 */
  addWrongQuestion(question: Omit<WrongQuestion, 'id' | 'timestamp' | 'reviewCount' | 'mastered'>): void {
    const questions = this.getAllWrongQuestions();
    
    // 检查是否已存在相同的错题（根据单词和题目类型）
    const existingIndex = questions.findIndex(
      q => q.word === question.word && q.type === question.type && !q.mastered
    );

    if (existingIndex !== -1) {
      // 如果已存在，更新错题信息
      questions[existingIndex] = {
        ...questions[existingIndex],
        question: question.question,
        userAnswer: question.userAnswer,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        timestamp: Date.now(),
      };
    } else {
      // 添加新错题
      const newQuestion: WrongQuestion = {
        ...question,
        id: `${question.type}_${question.word}_${Date.now()}`,
        timestamp: Date.now(),
        reviewCount: 0,
        mastered: false,
      };
      questions.push(newQuestion);
    }

    this.saveWrongQuestions(questions);
  }

  /** 标记错题为已掌握 */
  markAsMastered(questionId: string): void {
    const questions = this.getAllWrongQuestions();
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
      question.mastered = true;
      question.lastReviewTime = Date.now();
      this.saveWrongQuestions(questions);
    }
  }

  /** 增加复习次数 */
  incrementReviewCount(questionId: string): void {
    const questions = this.getAllWrongQuestions();
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
      question.reviewCount++;
      question.lastReviewTime = Date.now();
      this.saveWrongQuestions(questions);
    }
  }

  /** 删除错题 */
  deleteWrongQuestion(questionId: string): void {
    const questions = this.getAllWrongQuestions();
    const filtered = questions.filter(q => q.id !== questionId);
    this.saveWrongQuestions(filtered);
  }

  /** 获取未掌握的错题 */
  getUnmasteredQuestions(): WrongQuestion[] {
    return this.getAllWrongQuestions().filter(q => !q.mastered);
  }

  /** 获取已掌握的错题 */
  getMasteredQuestions(): WrongQuestion[] {
    return this.getAllWrongQuestions().filter(q => q.mastered);
  }

  /** 按类型获取错题 */
  getQuestionsByType(type: WrongQuestion['type']): WrongQuestion[] {
    return this.getAllWrongQuestions().filter(q => q.type === type && !q.mastered);
  }

  /** 获取统计数据 */
  getStats() {
    const all = this.getAllWrongQuestions();
    const unmastered = all.filter(q => !q.mastered);
    const mastered = all.filter(q => q.mastered);

    const byType = {
      quiz: all.filter(q => q.type === 'quiz' && !q.mastered).length,
      dictate: all.filter(q => q.type === 'dictate' && !q.mastered).length,
      term: all.filter(q => q.type === 'term' && !q.mastered).length,
      deep: all.filter(q => q.type === 'deep' && !q.mastered).length,
    };

    return {
      total: all.length,
      unmastered: unmastered.length,
      mastered: mastered.length,
      byType,
    };
  }

  /** 清空所有错题 */
  clearAll(): void {
    localStorage.removeItem(WRONG_QUESTIONS_KEY);
  }

  /** 清空已掌握的错题 */
  clearMastered(): void {
    const questions = this.getUnmasteredQuestions();
    this.saveWrongQuestions(questions);
  }
}

export const wrongQuestionsService = new WrongQuestionsService();
