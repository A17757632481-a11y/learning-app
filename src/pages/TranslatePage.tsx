import { useState } from 'react';
import { translateService } from '../services/translateService';
import { vocabService } from '../services/vocabService';
import { ttsService } from '../services/ttsService';
import { checkInService } from '../services/checkInService';
import { reviewService } from '../services/reviewService';
import { TranslationCard } from '../components/TranslationCard';
import type { TranslationResult } from '../types';
import './TranslatePage.css';

// AI API 配置
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function TranslatePage() {
  // 翻译相关状态
  const [word, setWord] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInVocab, setIsInVocab] = useState(false);
  const [sentenceBreakdown, setSentenceBreakdown] = useState<Array<{word: string, explanation: string}>>([]);

  // AI 问答相关状态
  const [askInput, setAskInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [askLoading, setAskLoading] = useState(false);
  const [mode, setMode] = useState<'english' | 'code' | 'reverse' | 'general'>('general');

  const modePrompts = {
    english: '你是一个英语老师，专门帮助零基础学生学英语。用最简单的大白话解释，多举例子。',
    code: '你是一个编程老师，专门帮助零基础学生学编程。用最简单的大白话解释代码和概念，就像跟小学生说话一样。',
    reverse: '你是一个逆向工程老师，专门帮助零基础学生学习逆向分析。用大白话解释汇编指令、API函数、内存概念等。',
    general: '你是一个知识渊博的老师，用最简单的大白话回答问题，让零基础的人也能听懂。',
  };

  const modeNames = {
    english: '🔤 英语',
    code: '💻 编程',
    reverse: '🔧 逆向',
    general: '💬 通用',
  };

  // 判断是否为长句子（多个单词或中文句子）
  const isLongSentence = (text: string): boolean => {
    // 如果包含中文且长度大于5，或英文单词数大于3，认为是句子
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);
    if (hasChinese && text.length > 5) return true;
    
    const words = text.trim().split(/\s+/);
    return words.length > 3;
  };

  // 翻译提交
  const handleTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);
    setSentenceBreakdown([]);

    try {
      const trimmedWord = word.trim();
      
      // 如果是长句子，先拆解词语
      if (isLongSentence(trimmedWord)) {
        const breakdown = await translateService.breakdownSentence(trimmedWord);
        setSentenceBreakdown(breakdown);
      }
      
      // 然后进行整体翻译
      const translationResult = await translateService.translate(trimmedWord);
      setResult(translationResult);
      setIsInVocab(vocabService.hasWord(translationResult.originalWord));
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻译失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToVocab = () => {
    if (result && !isInVocab) {
      const added = vocabService.addWord(result);
      if (added) {
        setIsInVocab(true);
        // 更新打卡数据：学习了一个词汇
        checkInService.updateTodayProgress({ wordsLearned: 1 });
        // 创建复习计划
        reviewService.createReviewPlan(result);
      }
    }
  };

  const handlePlayAudio = () => {
    if (result?.englishWord) {
      ttsService.speak(result.englishWord);
    }
  };

  // AI 问答提交
  const handleAskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim() || askLoading) return;

    const userMessage = askInput.trim();
    setAskInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAskLoading(true);

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
            { role: 'system', content: modePrompts[mode] },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，没有获取到回答';
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请重试' }]);
    } finally {
      setAskLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="translate-page-combined">
      {/* 左侧：翻译区域 */}
      <div className="translate-section">
        <h3>📖 大白话翻译</h3>
        <form onSubmit={handleTranslateSubmit} className="search-form">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="输入要翻译的词汇..."
            className="search-input"
            disabled={loading}
          />
          <button type="submit" className="search-btn" disabled={loading || !word.trim()}>
            {loading ? '...' : '翻译'}
          </button>
        </form>

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>正在翻译...</p>
          </div>
        )}

        {sentenceBreakdown.length > 0 && !loading && (
          <div className="sentence-breakdown">
            <div className="breakdown-title">📝 句子拆解</div>
            {sentenceBreakdown.map((item, idx) => (
              <div key={idx} className="breakdown-item">
                <span className="breakdown-word">{item.word}</span>
                <span className="breakdown-explanation">{item.explanation}</span>
              </div>
            ))}
          </div>
        )}

        {result && !loading && (
          <TranslationCard
            result={result}
            onAddToVocab={handleAddToVocab}
            onPlayAudio={handlePlayAudio}
            isInVocab={isInVocab}
          />
        )}

        {!result && !loading && !error && (
          <div className="empty-state">
            <p>🔍 输入词汇获取大白话解释</p>
          </div>
        )}
      </div>

      {/* 右侧：AI 问答区域 */}
      <div className="ask-section">
        <div className="ask-header">
          <h3>🤖 AI 问答</h3>
          <div className="mode-selector">
            {(Object.keys(modeNames) as Array<keyof typeof modeNames>).map((key) => (
              <button
                key={key}
                className={`mode-btn ${mode === key ? 'active' : ''}`}
                onClick={() => setMode(key)}
              >
                {modeNames[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>👋 有问题尽管问！</p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={`message ${msg.role}`}>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              {askLoading && (
                <div className="message assistant">
                  <div className="message-content loading">思考中...</div>
                </div>
              )}
            </div>
          )}
        </div>

        <form className="ask-form" onSubmit={handleAskSubmit}>
          <input
            type="text"
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            placeholder="输入问题..."
            disabled={askLoading}
          />
          <button type="submit" disabled={askLoading || !askInput.trim()}>
            发送
          </button>
          {messages.length > 0 && (
            <button type="button" className="clear-btn" onClick={clearChat}>
              清空
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
