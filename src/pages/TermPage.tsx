import { useState } from 'react';
import './TermPage.css';

interface TermResult {
  term: string;
  pronunciation: string;
  translation: string;
  explanation: string;
  example: string;
  analogy: string;
}

// 常用编程术语列表
const COMMON_TERMS = [
  'function', 'variable', 'array', 'object', 'class',
  'loop', 'if/else', 'string', 'boolean', 'integer',
  'parameter', 'return', 'import', 'export', 'module',
  'API', 'callback', 'promise', 'async/await', 'DOM',
  'bug', 'debug', 'compile', 'runtime', 'syntax'
];

export function TermPage() {
  const [term, setTerm] = useState('');
  const [result, setResult] = useState<TermResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const explainTerm = async (termToExplain: string) => {
    if (!termToExplain.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
      const apiKey = import.meta.env.VITE_AI_API_KEY || '';
      const model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';

      if (!apiKey) {
        throw new Error('请配置 AI API Key');
      }

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: `你是一个编程术语解释专家，专门用大白话给零基础的人解释编程概念。
请用JSON格式返回，包含以下字段：
{
  "term": "术语原文",
  "pronunciation": "音标或发音提示",
  "translation": "中文翻译（2-3个字）",
  "explanation": "大白话解释（用生活中的例子，让完全不懂编程的人也能理解，100字以内）",
  "example": "一个简单的代码示例（带注释）",
  "analogy": "生活类比（用一句话把这个概念比喻成生活中的东西）"
}
只返回JSON，不要其他内容。`
            },
            {
              role: 'user',
              content: `请解释编程术语：${termToExplain}`
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error('API请求失败');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      // 解析JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setResult(parsed);
      } else {
        throw new Error('解析失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '解释失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    explainTerm(term);
  };

  return (
    <div className="term-page">
      <div className="term-container">
        <h2>📚 编程术语大白话</h2>
        <p className="term-subtitle">输入任何编程术语，用最简单的话解释给你听</p>

        <form onSubmit={handleSubmit} className="term-form">
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="输入术语，如：function、variable、API..."
            className="term-input"
          />
          <button type="submit" disabled={loading || !term.trim()} className="term-btn">
            {loading ? '解释中...' : '解释'}
          </button>
        </form>

        <div className="common-terms">
          <span className="common-label">常用术语：</span>
          <div className="term-tags">
            {COMMON_TERMS.map((t) => (
              <button
                key={t}
                className="term-tag"
                onClick={() => {
                  setTerm(t);
                  explainTerm(t);
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="term-error">{error}</div>}

        {result && (
          <div className="term-result">
            <div className="result-header">
              <span className="result-term">{result.term}</span>
              <span className="result-pron">{result.pronunciation}</span>
              <span className="result-trans">{result.translation}</span>
            </div>

            <div className="result-section">
              <div className="section-title">💡 大白话解释</div>
              <div className="section-content">{result.explanation}</div>
            </div>

            <div className="result-section">
              <div className="section-title">🎯 生活类比</div>
              <div className="section-content analogy">{result.analogy}</div>
            </div>

            <div className="result-section">
              <div className="section-title">📝 代码示例</div>
              <pre className="code-example">{result.example}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
