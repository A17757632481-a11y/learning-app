import { useState } from 'react';
import './AskPage.css';

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

export function AskPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

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
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '网络错误，请重试' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="ask-page">
      <div className="ask-header">
        <h2>🤖 AI 问答</h2>
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
            <p>👋 有什么不懂的尽管问！</p>
            <p className="hint">选择上方模式，获得更专业的回答</p>
          </div>
        ) : (
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-content loading">思考中...</div>
              </div>
            )}
          </div>
        )}
      </div>

      <form className="ask-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          发送
        </button>
        {messages.length > 0 && (
          <button type="button" className="clear-btn" onClick={clearChat}>
            清空
          </button>
        )}
      </form>
    </div>
  );
}
