/**
 * 词汇分类类型
 */
export type VocabCategory = 
  | '日常生活'
  | '工作职场'
  | '科技数码'
  | '情感表达'
  | '学术教育'
  | '其他';

/**
 * 所有分类列表
 */
export const VOCAB_CATEGORIES: VocabCategory[] = [
  '日常生活',
  '工作职场',
  '科技数码',
  '情感表达',
  '学术教育',
  '其他'
];

/**
 * 翻译结果数据模型
 * 存储在 localStorage 中的词汇数据结构
 */
export interface TranslationResult {
  /** 用户输入的原词 */
  originalWord: string;
  /** 通俗易懂的大白话解释 */
  plainExplanation: string;
  /** 生活中的比喻 */
  lifeAnalogy: string;
  /** 本质是什么 */
  essenceExplanation: string;
  /** 出现场景列表 */
  usageScenarios: string[];
  /** 英文单词/短语 */
  englishWord: string;
  /** 音标 */
  phonetic: string;
  /** 添加时间戳 */
  timestamp: number;
  /** 词汇分类 */
  category: VocabCategory;
}

/**
 * 做题题目数据模型
 */
export interface QuizQuestion {
  /** 题目唯一标识 */
  id: string;
  /** 场景描述或比喻（用于出题） */
  scenario: string;
  /** 正确答案 */
  correctAnswer: string;
  /** 完整翻译结果 */
  fullResult: TranslationResult;
}

/**
 * 翻译服务接口
 */
export interface TranslateService {
  translate(word: string): Promise<TranslationResult>;
}

/**
 * 生词本服务接口
 */
export interface VocabService {
  addWord(result: TranslationResult): boolean;
  removeWord(word: string): void;
  getAllWords(): TranslationResult[];
  getWordCount(): number;
  hasWord(word: string): boolean;
}

/**
 * 做题服务接口
 */
export interface QuizService {
  generateQuestion(): QuizQuestion | null;
  checkAnswer(questionId: string, userAnswer: string): boolean;
}

/**
 * 语音服务接口
 */
export interface TTSService {
  speak(text: string): void;
  stop(): void;
  isSupported(): boolean;
}

/**
 * 翻译结果卡片组件属性
 */
export interface TranslationCardProps {
  result: TranslationResult;
  onAddToVocab: () => void;
  onPlayAudio: () => void;
  isInVocab: boolean;
}

/**
 * 做题卡片组件属性
 */
export interface QuizCardProps {
  question: QuizQuestion;
  onSubmit: (answer: string) => void;
  onNext: () => void;
}
