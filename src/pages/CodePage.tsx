import { useState } from 'react';
import './CodePage.css';

const API_CONFIG = {
  baseUrl: import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
};

export function CodePage() {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('auto');

  const languages = [
    { id: 'auto', name: '自动识别' },
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'c', name: 'C/C++' },
    { id: 'java', name: 'Java' },
    { id: 'assembly', name: '汇编' },
  ];

  const handleExplain = async () => {
    if (!code.trim() || loading) return;

    setLoading(true);
    setExplanation('');

    const langHint = language === 'auto' ? '' : `这是 ${language} 代码。`;

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
              content: `你是一个编程老师，专门帮助零基础学生理解代码。
请用最简单的大白话逐行解释代码，就像跟完全不懂编程的人说话一样。

要求：
1. 每行代码都要解释，格式为：代码 → 大白话解释
2. 解释要通俗易懂，避免专业术语
3. 如果有专业术语，要用括号补充说明
4. 最后总结这段代码整体在做什么`,
            },
            {
              role: 'user',
              content: `${langHint}请用大白话解释这段代码：

\`\`\`
${code}
\`\`\``,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || '解释失败，请重试';
      setExplanation(reply);
    } catch {
      setExplanation('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-page">
      <div className="code-header">
        <h2>💻 代码大白话解释</h2>
        <p className="subtitle">粘贴代码，AI 用大白话逐行解释</p>
      </div>

      <div className="code-content">
        <div className="code-input-section">
          <div className="section-header">
            <span>输入代码</span>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="在这里粘贴你想理解的代码..."
            className="code-textarea"
            spellCheck={false}
          />
          <button 
            className="explain-btn"
            onClick={handleExplain}
            disabled={loading || !code.trim()}
          >
            {loading ? '解释中...' : '🔍 解释代码'}
          </button>
        </div>

        <div className="explanation-section">
          <div className="section-header">
            <span>大白话解释</span>
          </div>
          <div className="explanation-content">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>AI 正在分析代码...</p>
              </div>
            ) : explanation ? (
              <div className="explanation-text">{explanation}</div>
            ) : (
              <div className="empty-state">
                <p>👈 粘贴代码后点击"解释代码"</p>
                <p className="hint">支持 Python、JavaScript、C/C++、Java、汇编等</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
