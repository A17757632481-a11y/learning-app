import { useState } from 'react';
import type { QuizQuestion } from '../types';
import { TranslationCard } from './TranslationCard';
import './QuizCard.css';

interface QuizCardProps {
  question: QuizQuestion;
  onSubmit: (answer: string) => boolean;
  onNext: () => void;
  onPlayAudio: () => void;
}

export function QuizCard({ question, onSubmit, onNext, onPlayAudio }: QuizCardProps) {
  const [answer, setAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    const correct = onSubmit(answer);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    setAnswer('');
    setIsCorrect(null);
    setShowResult(false);
    onNext();
  };

  return (
    <div className="quiz-card">
      <div className="quiz-question">
        <h2>🤔 猜猜这是什么词？</h2>
        <p className="scenario">{question.scenario}</p>
      </div>

      {!showResult ? (
        <form onSubmit={handleSubmit} className="quiz-form">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="输入你的答案..."
            className="quiz-input"
            autoFocus
          />
          <button type="submit" className="quiz-submit" disabled={!answer.trim()}>
            提交答案
          </button>
        </form>
      ) : (
        <div className="quiz-result">
          {isCorrect ? (
            <div className="result-correct">
              <span className="result-icon">🎉</span>
              <span>太棒了！回答正确！</span>
            </div>
          ) : (
            <div className="result-wrong">
              <span className="result-icon">😅</span>
              <span>答错了，正确答案是：<strong>{question.correctAnswer}</strong></span>
            </div>
          )}

          <div className="result-detail">
            <h3>📖 详细解释</h3>
            <TranslationCard
              result={question.fullResult}
              onAddToVocab={() => {}}
              onPlayAudio={onPlayAudio}
              isInVocab={true}
            />
          </div>

          <button onClick={handleNext} className="next-btn">
            下一题 →
          </button>
        </div>
      )}
    </div>
  );
}
