import { useState, useEffect } from 'react';
import { vocabService } from '../services/vocabService';
import { ttsService } from '../services/ttsService';
import { TranslationCard } from '../components/TranslationCard';
import type { TranslationResult, VocabCategory } from '../types';
import { VOCAB_CATEGORIES } from '../types';
import './VocabPage.css';

export function VocabPage() {
  const [words, setWords] = useState<TranslationResult[]>([]);
  const [selectedWord, setSelectedWord] = useState<TranslationResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VocabCategory | 'all'>('all');
  const [categoryStats, setCategoryStats] = useState<Record<VocabCategory, number>>({} as Record<VocabCategory, number>);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    setWords(vocabService.getAllWords());
    setCategoryStats(vocabService.getCategoryStats());
  };

  // 根据选中的分类筛选词汇
  const filteredWords = selectedCategory === 'all' 
    ? words 
    : words.filter(w => w.category === selectedCategory);

  const handleSelectWord = (word: TranslationResult) => {
    setSelectedWord(word);
  };

  const handleRemoveWord = (originalWord: string) => {
    vocabService.removeWord(originalWord);
    loadWords();
    if (selectedWord?.originalWord === originalWord) {
      setSelectedWord(null);
    }
  };

  const handlePlayAudio = () => {
    if (selectedWord?.englishWord) {
      ttsService.speak(selectedWord.englishWord);
    }
  };

  const handleCategorySelect = (category: VocabCategory | 'all') => {
    setSelectedCategory(category);
    setSelectedWord(null);
  };

  return (
    <div className="vocab-page">
      <div className="vocab-header">
        <h2>📚 我的生词本</h2>
        <span className="word-count">共 {words.length} 个词汇</span>
      </div>

      {/* 分类标签栏 */}
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategorySelect('all')}
        >
          全部 ({words.length})
        </button>
        {VOCAB_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategorySelect(cat)}
          >
            {cat} ({categoryStats[cat] || 0})
          </button>
        ))}
      </div>

      {words.length === 0 ? (
        <div className="empty-state">
          <p>📝 生词本还是空的</p>
          <p className="hint">去翻译页面查询词汇，点击"收藏"添加到生词本</p>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="empty-state">
          <p>📂 该分类暂无词汇</p>
          <p className="hint">试试其他分类，或添加更多词汇</p>
        </div>
      ) : (
        <div className="vocab-content">
          <div className="word-list">
            {filteredWords.map((word) => (
              <div
                key={word.originalWord}
                className={`word-item ${selectedWord?.originalWord === word.originalWord ? 'selected' : ''}`}
                onClick={() => handleSelectWord(word)}
              >
                <div className="word-info">
                  <span className="word-text">{word.originalWord}</span>
                  <span className="word-english">{word.englishWord}</span>
                </div>
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveWord(word.originalWord);
                  }}
                  title="从生词本移除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="word-detail">
            {selectedWord ? (
              <TranslationCard
                result={selectedWord}
                onAddToVocab={() => {}}
                onPlayAudio={handlePlayAudio}
                isInVocab={true}
              />
            ) : (
              <div className="select-hint">
                <p>👈 点击左侧词汇查看详情</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
