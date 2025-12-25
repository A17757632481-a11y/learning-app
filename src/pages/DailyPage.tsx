import { useState, useEffect } from 'react';
import { vocabService } from '../services/vocabService';
import { ttsService } from '../services/ttsService';
import { checkInService } from '../services/checkInService';
import { reviewService } from '../services/reviewService';
import type { VocabCategory } from '../types';
import './DailyPage.css';

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
};

interface DailyWord {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  tip: string;
}

const STORAGE_KEY_PREFIX = 'daily_words';
const DATE_KEY_PREFIX = 'daily_words_date';
const ADDED_WORDS_KEY = 'daily_words_added'; // 记录已加入生词本的单词

export function DailyPage() {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'common' | 'tech' | 'business'>('common');
  const [addedWords, setAddedWords] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(ADDED_WORDS_KEY);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const categories = {
    common: '日常常用',
    tech: '编程技术',
    business: '职场商务',
  };

  useEffect(() => {
    loadTodayWords();
  }, [category]); // 当类别改变时重新加载

  const getStorageKey = () => `${STORAGE_KEY_PREFIX}_${category}`;
  const getDateKey = () => `${DATE_KEY_PREFIX}_${category}`;

  const loadTodayWords = () => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(getDateKey());
    const savedWords = localStorage.getItem(getStorageKey());

    if (savedDate === today && savedWords) {
      const parsed = JSON.parse(savedWords);
      // 过滤掉已加入生词本的单词
      const filtered = parsed.filter((w: DailyWord) => !addedWords.has(w.word.toLowerCase()));
      setWords(filtered);
    } else {
      setWords([]);
    }
  };

  const generateWords = async () => {
    setLoading(true);
    setWords([]);

    const prompts = {
      common: '推荐5个日常生活中最常用的英语单词，适合零基础学习者',
      tech: '推荐5个编程和技术领域最常见的英语单词，适合零基础程序员',
      business: '推荐5个职场和商务中最常用的英语单词，适合职场新人',
    };

    // 获取生词本中的所有单词
    const vocabWords = vocabService.getAllWords().map(w => w.englishWord.toLowerCase());
    const excludeList = [...vocabWords, ...Array.from(addedWords)];

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
              role: 'system',
              content: `你是一个英语老师。请${prompts[category]}。

${excludeList.length > 0 ? `注意：不要推荐这些单词（用户已经学过）：${excludeList.join(', ')}` : ''}

返回 JSON 数组格式（不要 markdown 代码块）：
[
  {
    "word": "单词",
    "phonetic": "音标",
    "meaning": "中文意思（简短）",
    "example": "一个简单的例句",
    "tip": "记忆技巧或使用场景（一句话）"
  }
]

要求：
1. 每次推荐不同的单词
2. 单词要实用、常见
3. 避免推荐已学过的单词`,
            },
            {
              role: 'user',
              content: `请推荐今日单词（${new Date().toLocaleDateString()}）`,
            },
          ],
          temperature: 0.9, // 提高随机性，避免重复
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '[]';
      
      // 清理可能的 markdown
      if (content.startsWith('```')) {
        content = content.replace(/```json?\n?/g, '').replace(/```/g, '');
      }
      
      const parsed = JSON.parse(content.trim());
      
      // 再次过滤，确保不包含已学单词
      const filtered = parsed.filter((w: DailyWord) => 
        !excludeList.includes(w.word.toLowerCase())
      );
      
      setWords(filtered);

      // 保存到本地（按类别分开存储）
      const today = new Date().toDateString();
      localStorage.setItem(getDateKey(), today);
      localStorage.setItem(getStorageKey(), JSON.stringify(filtered));
    } catch (e) {
      console.error('获取每日单词失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const playWord = (word: string) => {
    ttsService.speak(word);
  };

  const addToVocab = (word: DailyWord, index: number) => {
    const categoryMap: Record<string, VocabCategory> = {
      tech: '科技数码',
      business: '工作职场',
      common: '日常生活',
    };
    
    const wordData = {
      originalWord: word.word,
      plainExplanation: word.meaning,
      lifeAnalogy: word.tip,
      essenceExplanation: word.meaning,
      usageScenarios: [word.example],
      englishWord: word.word,
      phonetic: word.phonetic,
      timestamp: Date.now(),
      category: categoryMap[category],
    };
    
    vocabService.addWord(wordData);
    
    // 更新打卡数据：学习了一个词汇
    checkInService.updateTodayProgress({ wordsLearned: 1 });
    
    // 创建复习计划
    reviewService.createReviewPlan(wordData);
    
    // 记录已加入的单词
    const newAddedWords = new Set(addedWords);
    newAddedWords.add(word.word.toLowerCase());
    setAddedWords(newAddedWords);
    localStorage.setItem(ADDED_WORDS_KEY, JSON.stringify([...newAddedWords]));
    
    // 从当前列表中移除这个单词
    setWords(prev => prev.filter((_, i) => i !== index));
  };

  const clearAddedWords = () => {
    if (confirm('确定要清除已学单词记录吗？清除后，之前学过的单词可能会再次出现在推荐中。')) {
      setAddedWords(new Set());
      localStorage.removeItem(ADDED_WORDS_KEY);
      loadTodayWords(); // 重新加载今日单词
    }
  };

  return (
    <div className="daily-page">
      <div className="daily-header">
        <h2>📅 每日单词</h2>
        <p className="subtitle">每天学几个，积少成多</p>
        {addedWords.size > 0 && (
          <p className="stats-hint">
            已学习 {addedWords.size} 个单词 
            <button className="clear-stats-btn" onClick={clearAddedWords}>
              清除记录
            </button>
          </p>
        )}
      </div>

      <div className="category-selector">
        {(Object.keys(categories) as Array<keyof typeof categories>).map((key) => (
          <button
            key={key}
            className={`category-btn ${category === key ? 'active' : ''}`}
            onClick={() => setCategory(key)}
          >
            {categories[key]}
          </button>
        ))}
        <button 
          className="generate-btn"
          onClick={generateWords}
          disabled={loading}
        >
          {loading ? '生成中...' : '🔄 获取今日单词'}
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>AI 正在挑选适合你的单词...</p>
        </div>
      ) : words.length > 0 ? (
        <div className="words-list">
          {words.map((word, index) => (
            <div key={index} className="word-card">
              <div className="word-main">
                <span className="word-text">{word.word}</span>
                <span className="word-phonetic">{word.phonetic}</span>
                <button className="play-btn" onClick={() => playWord(word.word)}>🔊</button>
              </div>
              <div className="word-meaning">{word.meaning}</div>
              <div className="word-example">📝 {word.example}</div>
              <div className="word-tip">💡 {word.tip}</div>
              <button 
                className="add-vocab-btn"
                onClick={() => addToVocab(word, index)}
              >
                + 加入生词本
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>👆 选择类别后点击"获取今日单词"</p>
          <p className="hint">AI 会根据你的选择推荐适合的单词</p>
        </div>
      )}
    </div>
  );
}
