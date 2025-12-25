import { useState, useEffect } from 'react';
import { vocabService } from '../services/vocabService';
import { ttsService } from '../services/ttsService';
import { checkInService } from '../services/checkInService';
import { wrongQuestionsService } from '../services/wrongQuestionsService';
import type { TranslationResult } from '../types';
import './DictatePage.css';

export function DictatePage() {
  const [words, setWords] = useState<TranslationResult[]>([]);
  const [currentWord, setCurrentWord] = useState<TranslationResult | null>(null);
  const [userInput, setUserInput] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [hintLevel, setHintLevel] = useState(0); // 0: 无提示, 1: 首字母, 2: 一半字母

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    const allWords = vocabService.getAllWords();
    setWords(allWords);
    if (allWords.length > 0) {
      pickRandomWord(allWords);
    }
  };

  const pickRandomWord = (wordList: TranslationResult[]) => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    setCurrentWord(wordList[randomIndex]);
    setUserInput('');
    setShowAnswer(false);
    setResult(null);
    setHintLevel(0);
  };

  const playWord = () => {
    if (currentWord?.englishWord) {
      ttsService.speak(currentWord.englishWord);
    }
  };

  const playWordSlow = () => {
    if (currentWord?.englishWord && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(currentWord.englishWord);
      utterance.lang = 'en-US';
      utterance.rate = 0.5; // 慢速
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkAnswer = () => {
    if (!currentWord) return;
    
    const correct = userInput.trim().toLowerCase() === currentWord.englishWord.toLowerCase();
    setResult(correct ? 'correct' : 'wrong');
    setShowAnswer(true);
    
    if (correct) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      
      // 记录错题
      wrongQuestionsService.addWrongQuestion({
        word: currentWord.englishWord,
        question: `听写单词：${currentWord.plainExplanation}`,
        userAnswer: userInput.trim(),
        correctAnswer: currentWord.englishWord,
        explanation: `音标：${currentWord.phonetic}`,
        type: 'dictate',
      });
    }
    
    // 更新打卡数据：答了一道题
    checkInService.updateTodayProgress({ questionsAnswered: 1 });
  };

  const nextWord = () => {
    if (words.length > 0) {
      pickRandomWord(words);
    }
  };

  const getHint = () => {
    if (!currentWord) return '';
    const word = currentWord.englishWord;
    
    if (hintLevel === 0) {
      // 首字母提示
      setHintLevel(1);
      return word[0] + '_'.repeat(word.length - 1);
    } else if (hintLevel === 1) {
      // 一半字母提示
      setHintLevel(2);
      return word.split('').map((c, i) => i % 2 === 0 ? c : '_').join('');
    }
    return '';
  };

  const renderHint = () => {
    if (!currentWord || hintLevel === 0) return null;
    const word = currentWord.englishWord;
    
    if (hintLevel === 1) {
      return word[0] + ' _ '.repeat(word.length - 1);
    } else if (hintLevel === 2) {
      return word.split('').map((c, i) => i % 2 === 0 ? c : '_').join(' ');
    }
    return null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showAnswer) {
        nextWord();
      } else {
        checkAnswer();
      }
    }
  };

  if (words.length === 0) {
    return (
      <div className="dictate-page">
        <div className="dictate-header">
          <h2>🎧 听写模式</h2>
        </div>
        <div className="empty-state">
          <p>📝 生词本还是空的</p>
          <p className="hint">先去翻译页面添加一些单词到生词本吧</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dictate-page">
      <div className="dictate-header">
        <h2>🎧 听写模式</h2>
        <div className="score-board">
          <span className="correct">✓ {score.correct}</span>
          <span className="wrong">✗ {score.wrong}</span>
        </div>
      </div>

      {currentWord && (
        <div className="dictate-card">
          {/* 中文提示 */}
          <div className="word-hint">
            <span className="meaning">{currentWord.plainExplanation}</span>
          </div>

          {/* 播放按钮 */}
          <div className="play-buttons">
            <button className="play-btn large" onClick={playWord}>
              🔊 播放
            </button>
            <button className="play-btn" onClick={playWordSlow}>
              🐢 慢速
            </button>
            <button 
              className="hint-btn" 
              onClick={getHint}
              disabled={hintLevel >= 2}
            >
              💡 提示
            </button>
          </div>

          {/* 字母提示 */}
          {hintLevel > 0 && (
            <div className="letter-hint">
              {renderHint()}
            </div>
          )}

          {/* 输入框 */}
          <div className="input-area">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入你听到的单词..."
              className={`dictate-input ${result === 'correct' ? 'correct' : result === 'wrong' ? 'wrong' : ''}`}
              disabled={showAnswer}
              autoFocus
            />
          </div>

          {/* 结果显示 */}
          {showAnswer && (
            <div className={`result-display ${result}`}>
              {result === 'correct' ? (
                <div className="correct-result">
                  <span className="icon">🎉</span>
                  <span>正确！</span>
                </div>
              ) : (
                <div className="wrong-result">
                  <span className="icon">😅</span>
                  <div className="answer-compare">
                    <div>你的答案：<span className="user-answer">{userInput || '(空)'}</span></div>
                    <div>正确答案：<span className="correct-answer">{currentWord.englishWord}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="action-buttons">
            {!showAnswer ? (
              <button 
                className="check-btn"
                onClick={checkAnswer}
                disabled={!userInput.trim()}
              >
                确认
              </button>
            ) : (
              <button className="next-btn" onClick={nextWord}>
                下一个 →
              </button>
            )}
          </div>
        </div>
      )}

      <div className="tips">
        <p>💡 按 Enter 键快速确认或下一个</p>
      </div>
    </div>
  );
}
