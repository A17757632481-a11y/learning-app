import type { TranslationResult, VocabCategory } from '../types';
import { VOCAB_CATEGORIES } from '../types';

// AI API 配置 - 用户需要配置自己的 API
const API_CONFIG = {
  // 默认使用 OpenAI 兼容的 API 格式
  baseUrl: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
};

/**
 * 构造翻译 prompt
 */
function buildPrompt(word: string): string {
  return `你是一个大白话翻译专家。请将以下词汇翻译成通俗易懂的大白话解释。

词汇：${word}

请按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "originalWord": "原词",
  "plainExplanation": "用最简单的话解释这个词是什么意思",
  "lifeAnalogy": "用一个生活中的比喻来说明",
  "essenceExplanation": "这个词的本质是什么",
  "usageScenarios": ["场景1", "场景2", "场景3"],
  "englishWord": "对应的英文单词或短语",
  "phonetic": "英文音标",
  "category": "从以下分类中选择最合适的一个：日常生活、工作职场、科技数码、情感表达、学术教育、其他"
}

要求：
1. 解释要通俗易懂，像跟朋友聊天一样
2. 比喻要生动形象，贴近日常生活
3. 场景要具体，让人一看就知道什么时候用
4. 如果输入是中文，提供对应英文；如果输入是英文，提供中文解释`;
}

/**
 * 验证并返回有效的分类
 */
function validateCategory(category: string | undefined): VocabCategory {
  if (category && VOCAB_CATEGORIES.includes(category as VocabCategory)) {
    return category as VocabCategory;
  }
  return '其他';
}

/**
 * 解析 AI 响应为 TranslationResult
 */
function parseResponse(responseText: string, originalWord: string): TranslationResult {
  try {
    // 尝试清理可能的 markdown 代码块
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText);
    
    return {
      originalWord: parsed.originalWord || originalWord,
      plainExplanation: parsed.plainExplanation || '',
      lifeAnalogy: parsed.lifeAnalogy || '',
      essenceExplanation: parsed.essenceExplanation || '',
      usageScenarios: Array.isArray(parsed.usageScenarios) ? parsed.usageScenarios : [],
      englishWord: parsed.englishWord || '',
      phonetic: parsed.phonetic || '',
      timestamp: Date.now(),
      category: validateCategory(parsed.category),
    };
  } catch (e) {
    console.error('解析翻译结果失败:', e);
    throw new Error('翻译结果解析失败，请重试');
  }
}

/**
 * 翻译服务
 * 调用 AI API 获取大白话翻译结果
 */
export const translateService = {
  /**
   * 拆解句子中的词语并解释
   */
  async breakdownSentence(sentence: string): Promise<Array<{word: string, explanation: string}>> {
    if (!API_CONFIG.apiKey) {
      throw new Error('请配置 AI API Key');
    }

    const prompt = `请拆解以下句子中的关键词语，并简要解释每个词语的含义。

句子：${sentence}

请按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
[
  {"word": "词语1", "explanation": "简短解释"},
  {"word": "词语2", "explanation": "简短解释"}
]

要求：
1. 只提取关键词语（名词、动词、形容词等），不要包含虚词
2. 解释要简洁明了，一句话说清楚
3. 如果是英文句子，提取英文单词并用中文解释
4. 如果是中文句子，提取中文词语并解释`;

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('AI 返回内容为空');
      }

      // 清理可能的 markdown 代码块
      let cleanText = content.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.slice(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.slice(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.slice(0, -3);
      }
      cleanText = cleanText.trim();

      const parsed = JSON.parse(cleanText);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('句子拆解错误:', error);
      return [];
    }
  },

  /**
   * 翻译词汇
   */
  async translate(word: string): Promise<TranslationResult> {
    if (!word.trim()) {
      throw new Error('请输入要翻译的词汇');
    }

    if (!API_CONFIG.apiKey) {
      throw new Error('请配置 AI API Key（在 .env 文件中设置 VITE_AI_API_KEY）');
    }

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: API_CONFIG.model,
          messages: [
            {
              role: 'user',
              content: buildPrompt(word.trim()),
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('AI 返回内容为空');
      }

      return parseResponse(content, word.trim());
    } catch (error) {
      console.error('翻译错误:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('网络连接失败，可能是：1) 网络问题 2) API 地址错误 3) 跨域被阻止');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('翻译请求失败，请检查网络连接');
    }
  },

  /**
   * 检查 API 是否已配置
   */
  isConfigured(): boolean {
    return !!API_CONFIG.apiKey;
  },
};
