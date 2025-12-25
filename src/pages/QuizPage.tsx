import { useState, useEffect } from 'react';
import { quizService } from '../services/quizService';
import { vocabService } from '../services/vocabService';
import { ttsService } from '../services/ttsService';
import { checkInService } from '../services/checkInService';
import { wrongQuestionsService } from '../services/wrongQuestionsService';
import { QuizCard } from '../components/QuizCard';
import type { QuizQuestion } from '../types';
import './QuizPage.css';

export function QuizPage() {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = () => {
    const wordCount = vocabService.getWordCount();
    if (wordCount === 0) {
      setIsEmpty(true);
      setQuestion(null);
      return;
    }

    setIsEmpty(false);
    const newQuestion = quizService.generateQuestion();
    setQuestion(newQuestion);
  };

  const handleSubmit = (answer: string): boolean => {
    if (!question) return false;
    const isCorrect = quizService.checkAnswer(question.id, answer);
    
    // 如果答错了，记录到错题本
    if (!isCorrect) {
      wrongQuestionsService.addWrongQuestion({
        word: question.fullResult.englishWord,
        question: question.scenario,
        userAnswer: answer,
        correctAnswer: question.fullResult.englishWord,
        explanation: question.fullResult.plainExplanation,
        type: 'quiz',
      });
    }
    
    // 更新打卡数据：答了一道题
    checkInService.updateTodayProgress({ questionsAnswered: 1 });
    return isCorrect;
  };

  const handleNext = () => {
    loadQuestion();
  };

  const handlePlayAudio = () => {
    if (question?.fullResult.englishWord) {
      ttsService.speak(question.fullResult.englishWord);
    }
  };

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h2>📝 做题练习</h2>
        <span className="vocab-count">生词本: {vocabService.getWordCount()} 词</span>
      </div>

      {isEmpty ? (
        <div className="empty-state">
          <p>📚 生词本还是空的</p>
          <p className="hint">先去翻译页面添加一些词汇到生词本，再来做题吧！</p>
        </div>
      ) : question ? (
        <QuizCard
          question={question}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onPlayAudio={handlePlayAudio}
        />
      ) : (
        <div className="loading">
          <p>加载题目中...</p>
        </div>
      )}
    </div>
  );
}
