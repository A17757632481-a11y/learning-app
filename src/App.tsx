import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { TranslatePage } from './pages/TranslatePage';
import { VocabPage } from './pages/VocabPage';
import { QuizPage } from './pages/QuizPage';
import { CodePage } from './pages/CodePage';
import { DailyPage } from './pages/DailyPage';
import { SentencePage } from './pages/SentencePage';
import { DictatePage } from './pages/DictatePage';
import { TermPage } from './pages/TermPage';
import { LearnPage } from './pages/LearnPage';
import { TermQuizPage } from './pages/TermQuizPage';
import { ProgramLearnPage } from './pages/ProgramLearnPage';
import { MemePage } from './pages/MemePage';
import { DeepQuizPage } from './pages/DeepQuizPage';
import { CodingBasicsPage } from './pages/CodingBasicsPage';
import { ReviewPage } from './pages/ReviewPage';
import { CheckInPage } from './pages/CheckInPage';
import { WrongQuestionsPage } from './pages/WrongQuestionsPage';
import { SmartReviewPage } from './pages/SmartReviewPage';
import { ChineseLearnPage } from './pages/ChineseLearnPage';
import { MathLearnPage } from './pages/MathLearnPage';
import { LoginPage } from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<TranslatePage />} />
          <Route path="vocab" element={<VocabPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="code" element={<CodePage />} />
          <Route path="daily" element={<DailyPage />} />
          <Route path="sentence" element={<SentencePage />} />
          <Route path="dictate" element={<DictatePage />} />
          <Route path="term" element={<TermPage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="term-quiz" element={<TermQuizPage />} />
          <Route path="program" element={<ProgramLearnPage />} />
          <Route path="meme" element={<MemePage />} />
          <Route path="deep-quiz" element={<DeepQuizPage />} />
          <Route path="coding-basics" element={<CodingBasicsPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="checkin" element={<CheckInPage />} />
          <Route path="wrong-questions" element={<WrongQuestionsPage />} />
          <Route path="smart-review" element={<SmartReviewPage />} />
          <Route path="chinese-learn" element={<ChineseLearnPage />} />
          <Route path="math-learn" element={<MathLearnPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
