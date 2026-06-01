/**
 * AI Recommendations Component
 * Displays personalized outfit recommendations based on user profile and weather
 */

import { useState } from 'react';
import type { WardrobeItem, AIRecommendationResult, OutfitRecommendation } from '../types';
import './AIRecommendations.css';

interface AIRecommendationsProps {
  recommendations: AIRecommendationResult;
  wardrobeItems: WardrobeItem[];
  onGenerateTryOn: (recommendation: OutfitRecommendation, images: { model?: string; garment?: string }) => void;
  isGenerating: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  top: '上衣',
  bottom: '下装',
  dress: '连衣裙',
  shoes: '鞋子',
  outerwear: '外套',
  accessory: '配饰',
};

export function AIRecommendations({
  recommendations,
  wardrobeItems,
  onGenerateTryOn,
  isGenerating,
}: AIRecommendationsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const getItemById = (id: number | null): WardrobeItem | undefined => {
    if (id === null) return undefined;
    return wardrobeItems.find((item) => item.id === id);
  };

  const handleTryOn = (rec: OutfitRecommendation, index: number) => {
    setActiveIndex(index);

    // Find garment image (prefer top, then dress, then bottom)
    const garmentId = rec.dress ?? rec.top ?? rec.bottom ?? rec.outerwear;
    const garmentItem = getItemById(garmentId);

    onGenerateTryOn(rec, {
      garment: garmentItem?.imageData,
    });
  };

  if (!recommendations.recommendations || recommendations.recommendations.length === 0) {
    return (
      <div className="ai-recommendations ai-recommendations--empty">
        <div className="ai-recommendations__empty-icon">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <p className="ai-recommendations__empty-title">暂无推荐</p>
        <p className="ai-recommendations__empty-hint">请完善个人特征设置以获取个性化推荐</p>
      </div>
    );
  }

  return (
    <div className="ai-recommendations">
      <div className="ai-recommendations__header">
        <h3 className="ai-recommendations__title">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          AI 穿搭推荐
        </h3>
        <span className="ai-recommendations__count">{recommendations.recommendations.length} 套方案</span>
      </div>

      <div className="ai-recommendations__list">
        {recommendations.recommendations.map((rec, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={index}
              className={`ai-recommendations__card ${isActive ? 'ai-recommendations__card--active' : ''}`}
            >
              <div className="ai-recommendations__card-header">
                <span className="ai-recommendations__card-number">方案 {index + 1}</span>
                <span className="ai-recommendations__card-score">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  匹配度 {95 - index * 5}%
                </span>
              </div>

              <div className="ai-recommendations__items">
                {(['top', 'bottom', 'dress', 'shoes', 'outerwear', 'accessory'] as const).map((slot) => {
                  const itemId = rec[slot];
                  const item = getItemById(itemId);

                  if (!itemId || !item) return null;

                  return (
                    <div key={slot} className="ai-recommendations__item">
                      <div className="ai-recommendations__item-image">
                        <img src={item.imageData} alt={item.name} />
                      </div>
                      <span className="ai-recommendations__item-label">{CATEGORY_LABELS[slot]}</span>
                    </div>
                  );
                })}
              </div>

              <div className="ai-recommendations__reason">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p>{rec.reason}</p>
              </div>

              <button
                className="ai-recommendations__tryon-btn"
                onClick={() => handleTryOn(rec, index)}
                disabled={isGenerating && isActive}
              >
                {isGenerating && isActive ? (
                  <>
                    <span className="ai-recommendations__spinner" />
                    生成中...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    生成试穿图
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
