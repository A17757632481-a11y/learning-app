import { useState } from 'react';
import { ttsService } from '../services/ttsService';
import './SentencePage.css';

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
};

interface WordAnnotation {
  word: string;
  meaning: string;
  type: string; // 词性
}

interface SentenceResult {
  original: string;
  translation: string;
  words: WordAnnotation[];
}

export function SentencePage() {
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<SentenceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!sentence.trim() || loading) return;

    setLoading(true);
    setResult(null);

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
              content: `你是一个英语老师，帮助零基础学生理解英文句子。
请对句子进行逐词翻译和标注。

返回 JSON 格式（不要 markdown 代码块）：
{
  "original": "原句",
  "translation": "整句中文翻译",
  "words": [
    {"word": "单词", "meaning": "中文意思", "type": "词性(如:名词/动词/形容词等)"}
  ]
}

注意：
1. words 数组按句子中单词出现顺序排列
2. 每个单词都要标注，包括 a/the/is 等小词
3. meaning 要简短，1-3个字
4. type 用中文表示词性`,
            },
            {
              role: 'user',
              content: sentence.trim(),
            },
          ],
          temperature: 0.3,
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '';
      
      // 清理 markdown
      if (content.startsWith('```')) {
        content = content.replace(/```json?\n?/g, '').replace(/```/g, '');
      }
      
      const parsed = JSON.parse(content.trim());
      setResult(parsed);
    } catch (e) {
      console.error('翻译失败:', e);
    } finally {
      setLoading(false);
    }
  };

  const playSentence = () => {
    if (result?.original) {
      ttsService.speak(result.original);
    }
  };

  const playWord = (word: string) => {
    ttsService.speak(word);
  };

  return (
    <div className="sentence-page">
      <div className="sentence-header">
        <h2>📝 句子逐词翻译</h2>
        <p className="subtitle">输入英文句子，每个词都标注中文含义</p>
      </div>

      <div className="input-section">
        <textarea
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="输入英文句子，例如：I love learning English every day."
          className="sentence-input"
        />
        <button 
          className="translate-btn"
          onClick={handleTranslate}
          disabled={loading || !sentence.trim()}
        >
          {loading ? '翻译中...' : '🔍 逐词翻译'}
        </button>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>AI 正在分析句子...</p>
        </div>
      )}

      {result && !loading && (
        <div className="result-section">
          {/* 整句翻译 */}
          <div className="full-translation">
            <div className="original-sentence">
              <span>{result.original}</span>
              <button className="play-btn" onClick={playSentence}>🔊</button>
            </div>
            <div className="translated-sentence">
              {result.translation}
            </div>
          </div>

          {/* 逐词标注 */}
          <div className="words-annotation">
            <h4>逐词解析</h4>
            <div className="words-grid">
              {result.words.map((w, i) => (
                <div key={i} className="word-item" onClick={() => playWord(w.word)}>
                  <div className="word-english">{w.word}</div>
                  <div className="word-chinese">{w.meaning}</div>
                  <div className="word-type">{w.type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 带标注的句子 */}
          <div className="annotated-sentence">
            <h4>标注视图</h4>
            <div className="sentence-with-annotation">
              {result.words.map((w, i) => (
                <span key={i} className="annotated-word">
                  <span className="eng">{w.word}</span>
                  <span className="chn">({w.meaning})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="empty-state">
          <p>👆 输入英文句子后点击"逐词翻译"</p>
          <p className="hint">适合学习阅读理解、分析句子结构</p>
        </div>
      )}
    </div>
  );
}
