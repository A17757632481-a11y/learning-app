import type { TranslationResult } from '../types';
import { DraggablePanel } from './DraggablePanel';
import './TranslationCard.css';

interface TranslationCardProps {
  result: TranslationResult;
  onAddToVocab: () => void;
  onPlayAudio: () => void;
  isInVocab: boolean;
}

export function TranslationCard({ result, onAddToVocab, onPlayAudio, isInVocab }: TranslationCardProps) {
  return (
    <DraggablePanel title={`翻译结果 - ${result.originalWord}`} defaultWidth={450} defaultHeight={400}>
      <div className="translation-card">
        <div className="card-header">
          <h2 className="original-word">{result.originalWord}</h2>
          <div className="card-actions">
            <button 
              className="action-btn play-btn" 
              onClick={onPlayAudio}
              title="播放发音"
            >
              🔊
            </button>
            <button 
              className={`action-btn vocab-btn ${isInVocab ? 'in-vocab' : ''}`}
              onClick={onAddToVocab}
              disabled={isInVocab}
              title={isInVocab ? '已在生词本' : '加入生词本'}
            >
              {isInVocab ? '✓ 已收藏' : '+ 收藏'}
            </button>
          </div>
        </div>

        <div className="english-info">
          <span className="english-word">{result.englishWord}</span>
          <span className="phonetic">{result.phonetic}</span>
        </div>

        <div className="card-section">
          <h3>💬 大白话解释</h3>
          <p>{result.plainExplanation}</p>
        </div>

        <div className="card-section">
          <h3>🎯 比喻</h3>
          <p>{result.lifeAnalogy}</p>
        </div>

        <div className="card-section">
          <h3>💡 本质</h3>
          <p>{result.essenceExplanation}</p>
        </div>

        {result.usageScenarios.length > 0 && (
          <div className="card-section">
            <h3>📍 应用场景</h3>
            <ul className="scenarios-list">
              {result.usageScenarios.map((scenario, index) => (
                <li key={index}>{scenario}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DraggablePanel>
  );
}
