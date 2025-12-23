import { useState } from 'react';
import './MemePage.css';

interface Meme {
  title: string;
  origin: string;
  meaning: string;
  usage: string;
  example: string;
  englishVersion: string;
}

export function MemePage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('all');

  const categories = [
    { id: 'all', name: '全部热梗' },
    { id: 'internet', name: '网络流行' },
    { id: 'game', name: '游戏圈' },
    { id: 'work', name: '打工人' },
    { id: 'student', name: '学生党' },
  ];

  const generateMemes = async () => {
    setLoading(true);
    setMemes([]);

    try {
      const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
      const apiKey = import.meta.env.VITE_AI_API_KEY || '';
      const model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';

      const categoryText = category === 'all' ? '各类' : categories.find(c => c.id === category)?.name;

      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `你是一个网络文化专家，熟悉中国互联网上的各种流行语和热梗。
请生成5个${categoryText}网络热梗，用JSON数组格式返回：
[
  {
    "title": "热梗名称",
    "origin": "来源出处（简短说明从哪来的）",
    "meaning": "含义解释（用大白话说这个梗是什么意思）",
    "usage": "使用场景（什么时候用这个梗）",
    "example": "使用示例（一句话展示怎么用）",
    "englishVersion": "英文翻译或对应的英文表达"
  }
]
要求：
1. 选择真实流行的网络热梗
2. 解释要通俗易懂
3. 示例要生动有趣
4. 只返回JSON数组，不要其他内容`
            },
            {
              role: 'user',
              content: `请生成5个${categoryText}网络热梗`
            }
          ],
          temperature: 0.9,
          max_tokens: 1500
        })
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        setMemes(JSON.parse(jsonMatch[0]));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meme-page">
      <div className="meme-container">
        <div className="meme-header">
          <h2>🔥 网络热梗大全</h2>
          <p>了解最新网络流行语，学习地道表达</p>
        </div>

        <div className="meme-controls">
          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <button 
            className="generate-btn"
            onClick={generateMemes}
            disabled={loading}
          >
            {loading ? '生成中...' : '🎲 生成热梗'}
          </button>
        </div>

        {loading && (
          <div className="meme-loading">
            <div className="spinner"></div>
            <p>正在搜集热梗...</p>
          </div>
        )}

        {memes.length > 0 && !loading && (
          <div className="meme-list">
            {memes.map((meme, index) => (
              <div key={index} className="meme-card">
                <div className="meme-title">
                  <span className="meme-index">#{index + 1}</span>
                  {meme.title}
                </div>
                
                <div className="meme-section">
                  <label>📍 来源</label>
                  <p>{meme.origin}</p>
                </div>

                <div className="meme-section">
                  <label>💡 含义</label>
                  <p>{meme.meaning}</p>
                </div>

                <div className="meme-section">
                  <label>🎯 使用场景</label>
                  <p>{meme.usage}</p>
                </div>

                <div className="meme-section example">
                  <label>💬 示例</label>
                  <p>"{meme.example}"</p>
                </div>

                <div className="meme-section english">
                  <label>🌍 英文表达</label>
                  <p>{meme.englishVersion}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && memes.length === 0 && (
          <div className="meme-empty">
            <p>👆 点击上方按钮生成热梗</p>
          </div>
        )}
      </div>
    </div>
  );
}
