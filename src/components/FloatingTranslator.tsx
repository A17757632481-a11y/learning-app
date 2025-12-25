import { useState, useRef, useEffect } from 'react';
import { translateService } from '../services/translateService';
import { ttsService } from '../services/ttsService';
import { vocabService } from '../services/vocabService';
import { reviewService } from '../services/reviewService';
import { checkInService } from '../services/checkInService';
import type { TranslationResult } from '../types';
import './FloatingTranslator.css';

export function FloatingTranslator() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
  const [windowPos, setWindowPos] = useState({ x: window.innerWidth - 420, y: 100 });
  const [windowSize, setWindowSize] = useState({ width: 380, height: 450 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragTarget, setDragTarget] = useState<'ball' | 'window'>('ball');
  const [resizeDir, setResizeDir] = useState('');
  const [fontSize, setFontSize] = useState(100);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  
  const dragStart = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ width: 0, height: 0 });

  // 弹出独立窗口
  const openPopupWindow = () => {
    const popupWidth = 400;
    const popupHeight = 500;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;
    
    const apiUrl = import.meta.env.VITE_AI_API_URL || 'https://api.openai.com/v1';
    const apiKey = import.meta.env.VITE_AI_API_KEY || '';
    const model = import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo';
    
    const popup = window.open(
      '',
      'translator',
      `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    if (popup) {
      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>快捷翻译</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
    .container { padding: 16px; }
    h1 { font-size: 18px; color: #667eea; margin-bottom: 16px; text-align: center; }
    .input-area { display: flex; gap: 8px; margin-bottom: 16px; }
    input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; }
    input:focus { outline: none; border-color: #667eea; }
    button { padding: 10px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 6px; cursor: pointer; }
    button:hover { opacity: 0.9; }
    .result { background: white; padding: 16px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .result h2 { font-size: 20px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .result .eng { color: #667eea; margin-right: 8px; }
    .result .phonetic { color: #888; font-family: monospace; }
    .result .add-vocab-btn { background: linear-gradient(135deg, #f093fb, #f5576c); color: white; border: none; border-radius: 4px; padding: 4px 12px; cursor: pointer; font-size: 14px; }
    .result .add-vocab-btn:hover { opacity: 0.9; transform: scale(1.05); }
    .section { margin-top: 12px; }
    .section label { font-size: 13px; color: #666; display: block; margin-bottom: 4px; }
    .section p { line-height: 1.6; }
    .loading { text-align: center; color: #999; padding: 40px; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚡ 快捷翻译</h1>
    <div class="input-area">
      <input type="text" id="word" placeholder="输入要翻译的词..." />
      <button id="translateBtn">翻译</button>
    </div>
    <div id="result"></div>
  </div>
  <script>
    var API_URL = "${apiUrl}";
    var API_KEY = "${apiKey}";
    var MODEL = "${model}";
    var currentResult = null;
    
    document.getElementById('word').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doTranslate();
    });
    document.getElementById('translateBtn').addEventListener('click', doTranslate);
    
    function addToVocab() {
      if (!currentResult) return;
      
      var wordData = {
        originalWord: currentResult.originalWord,
        plainExplanation: currentResult.plainExplanation,
        lifeAnalogy: currentResult.lifeAnalogy,
        essenceExplanation: currentResult.essenceExplanation,
        usageScenarios: currentResult.usageScenarios,
        englishWord: currentResult.englishWord,
        phonetic: currentResult.phonetic,
        timestamp: Date.now(),
        category: '其他'
      };
      
      // 保存到localStorage
      var vocab = JSON.parse(localStorage.getItem('vocab') || '[]');
      vocab.unshift(wordData);
      localStorage.setItem('vocab', JSON.stringify(vocab));
      
      // 创建复习计划
      var reviewPlans = JSON.parse(localStorage.getItem('review-plans') || '[]');
      var reviewPlan = {
        word: wordData,
        nextReviewDate: Date.now() + 86400000,
        reviewCount: 0,
        masteryLevel: 0,
        lastReviewDate: Date.now(),
        createdAt: Date.now()
      };
      reviewPlans.push(reviewPlan);
      localStorage.setItem('review-plans', JSON.stringify(reviewPlans));
      
      // 更新打卡数据
      var today = new Date().toDateString();
      var checkInData = JSON.parse(localStorage.getItem('checkin-data') || '{}');
      if (!checkInData[today]) {
        checkInData[today] = { wordsLearned: 0, questionsAnswered: 0, lessonsCompleted: 0 };
      }
      checkInData[today].wordsLearned = (checkInData[today].wordsLearned || 0) + 1;
      localStorage.setItem('checkin-data', JSON.stringify(checkInData));
      
      alert('✅ 已加入生词本！');
    }
    
    function doTranslate() {
      var word = document.getElementById('word').value.trim();
      if (!word) return;
      
      document.getElementById('result').innerHTML = '<div class="loading">翻译中...</div>';
      
      fetch(API_URL + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + API_KEY },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: '请将以下词汇翻译成通俗易懂的大白话解释。词汇：' + word + '。请按JSON格式返回(不要markdown)：{"originalWord":"原词","plainExplanation":"大白话解释","lifeAnalogy":"生活比喻","essenceExplanation":"本质","usageScenarios":["场景1"],"englishWord":"英文","phonetic":"音标"}' }],
          temperature: 0.7
        })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var content = data.choices[0].message.content;
        var match = content.match(/\\{[\\s\\S]*\\}/);
        if (match) {
          var json = JSON.parse(match[0]);
          currentResult = json;
          var html = '<div class="result">';
          html += '<h2>';
          html += '<span>' + json.originalWord + '</span>';
          html += '<span class="eng">' + json.englishWord + '</span>';
          html += '<span class="phonetic">' + json.phonetic + '</span>';
          html += '<button class="add-vocab-btn" onclick="addToVocab()" title="加入生词本">➕ 生词本</button>';
          html += '</h2>';
          html += '<div class="section"><label>💬 大白话</label><p>' + json.plainExplanation + '</p></div>';
          html += '<div class="section"><label>🎯 比喻</label><p>' + json.lifeAnalogy + '</p></div>';
          html += '<div class="section"><label>💡 本质</label><p>' + json.essenceExplanation + '</p></div>';
          if (json.usageScenarios && json.usageScenarios.length) {
            html += '<div class="section"><label>📍 场景</label><ul>';
            for (var i = 0; i < json.usageScenarios.length; i++) {
              html += '<li>' + json.usageScenarios[i] + '</li>';
            }
            html += '</ul></div>';
          }
          html += '</div>';
          document.getElementById('result').innerHTML = html;
        } else {
          document.getElementById('result').innerHTML = '<div class="loading">解析失败</div>';
        }
      })
      .catch(function(e) {
        document.getElementById('result').innerHTML = '<div class="loading">翻译失败: ' + e.message + '</div>';
      });
    }
  </script>
</body>
</html>`;
      
      popup.document.write(htmlContent);
      popup.document.close();
      setIsOpen(false);
    }
  };

  // 翻译
  const handleTranslate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await translateService.translate(input.trim());
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 播放英文发音
  const playAudio = () => {
    if (result?.englishWord) {
      ttsService.speak(result.englishWord, 'en');
    }
  };

  // 加入生词本
  const addToVocab = () => {
    if (!result) return;
    
    const wordData = {
      ...result,
      timestamp: Date.now(),
      category: '其他' as const,
    };
    
    vocabService.addWord(wordData);
    reviewService.createReviewPlan(wordData);
    checkInService.updateTodayProgress({ wordsLearned: 1 });
    alert('✅ 已加入生词本！');
  };

  // 拖拽悬浮球
  const handleBallMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragTarget('ball');
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  // 拖拽窗口
  const handleWindowMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('float-header')) {
      setIsDragging(true);
      setDragTarget('window');
      dragStart.current = { x: e.clientX - windowPos.x, y: e.clientY - windowPos.y };
    }
  };

  // 调整窗口大小
  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(dir);
    dragStart.current = { x: e.clientX, y: e.clientY };
    sizeStart.current = { width: windowSize.width, height: windowSize.height };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        if (dragTarget === 'ball') {
          setPosition({
            x: Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragStart.current.x)),
            y: Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragStart.current.y)),
          });
        } else {
          setWindowPos({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y,
          });
        }
      }
      if (isResizing) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        let newWidth = sizeStart.current.width;
        let newHeight = sizeStart.current.height;

        if (resizeDir.includes('e')) newWidth = Math.max(300, sizeStart.current.width + dx);
        if (resizeDir.includes('s')) newHeight = Math.max(300, sizeStart.current.height + dy);

        setWindowSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragTarget, resizeDir]);

  return (
    <>
      {/* 悬浮球 */}
      <div
        className="floating-ball"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleBallMouseDown}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
        title="快捷翻译"
      >
        📖
      </div>

      {/* 翻译窗口 */}
      {isOpen && (
        <div
          className="floating-window"
          style={{
            left: windowPos.x,
            top: windowPos.y,
            width: windowSize.width,
            height: windowSize.height,
          }}
          onMouseDown={handleWindowMouseDown}
        >
          <div className="float-header">
            <span>⚡ 快捷翻译</span>
            <div className="float-controls">
              <button onClick={() => setFontSize(Math.max(80, fontSize - 10))}>A-</button>
              <span>{fontSize}%</span>
              <button onClick={() => setFontSize(Math.min(150, fontSize + 10))}>A+</button>
              <button className="popup-btn" onClick={openPopupWindow} title="弹出独立窗口">⧉</button>
              <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
            </div>
          </div>

          <div className="float-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
              placeholder="输入要翻译的词..."
            />
            <button onClick={handleTranslate} disabled={loading}>
              {loading ? '...' : '译'}
            </button>
          </div>

          <div className="float-content" style={{ fontSize: `${fontSize}%` }}>
            {result && (
              <div className="float-result">
                <div className="result-head">
                  <strong>{result.originalWord}</strong>
                  <span className="eng">{result.englishWord}</span>
                  <span className="phonetic">{result.phonetic}</span>
                  <button className="play-btn" onClick={playAudio} title="播放发音">🔊</button>
                  <button className="add-vocab-btn" onClick={addToVocab} title="加入生词本">➕</button>
                </div>
                <div className="result-item">
                  <label>💬 大白话</label>
                  <p>{result.plainExplanation}</p>
                </div>
                <div className="result-item">
                  <label>🎯 比喻</label>
                  <p>{result.lifeAnalogy}</p>
                </div>
                <div className="result-item">
                  <label>💡 本质</label>
                  <p>{result.essenceExplanation}</p>
                </div>
                {result.usageScenarios.length > 0 && (
                  <div className="result-item">
                    <label>📍 场景</label>
                    <ul>
                      {result.usageScenarios.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {!result && !loading && (
              <div className="float-empty">输入词汇，按回车翻译</div>
            )}
            {loading && <div className="float-loading">翻译中...</div>}
          </div>

          {/* 调整大小手柄 */}
          <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
        </div>
      )}
    </>
  );
}
