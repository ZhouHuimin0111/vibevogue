/**
 * Smart Wardrobe Dashboard Component
 * Provides data visualization for wardrobe analytics
 */

import type { WardrobeItem, GarmentCategory } from '../types';
import './WardrobeDashboard.css';

interface WardrobeStats {
  totalItems: number;
  categoryBreakdown: Record<GarmentCategory, number>;
  topUtilized: WardrobeItem[];
}

interface WardrobeDashboardProps {
  stats: WardrobeStats;
}

const CATEGORY_COLORS: Record<GarmentCategory, string> = {
  'Top': '#E8B4B8',
  'Bottom': '#A8D5BA',
  'Dress': '#DDA0DD',
  'Shoes': '#F4A460',
  'Outerwear': '#B8C4D4',
  'Accessory': '#D4AF37',
};

const CATEGORY_ICONS: Record<GarmentCategory, React.ReactNode> = {
  'Top': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L8 6H4v14h16V6h-4L12 2z" />
    </svg>
  ),
  'Bottom': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2h12l-1 20H7L6 2z" />
    </svg>
  ),
  'Dress': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L8 6v4l-4 10h16l-4-10V6l-4-4z" />
    </svg>
  ),
  'Shoes': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 18h16v2H4v-2zM6 14l2-8h8l2 8" />
    </svg>
  ),
  'Outerwear': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L6 6v4L2 14v6h20v-6l-4-4V6l-6-4z" />
    </svg>
  ),
  'Accessory': (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
};

export function WardrobeDashboard({ stats }: WardrobeDashboardProps) {
  const { totalItems, categoryBreakdown, topUtilized } = stats;

  const categories = Object.entries(categoryBreakdown).filter(([_, count]) => count > 0);
  const totalCategorized = categories.reduce((sum, [_, count]) => sum + count, 0);

  const circumference = 2 * Math.PI * 45;
  let accumulatedOffset = 0;

  return (
    <div className="wardrobe-dashboard">
      <div className="wardrobe-dashboard__header">
        <h3 className="wardrobe-dashboard__title">衣橱统计</h3>
        <span className="wardrobe-dashboard__total">{totalItems} 件单品</span>
      </div>

      <div className="wardrobe-dashboard__content">
        {/* Category Donut Chart */}
        <div className="wardrobe-dashboard__chart">
          <div className="wardrobe-dashboard__donut">
            <svg viewBox="0 0 100 100">
              {totalCategorized > 0 ? (
                <>
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.1)"
                    strokeWidth="12"
                  />
                  {categories.map(([category, count]) => {
                    const percentage = count / totalCategorized;
                    const strokeDasharray = `${percentage * circumference} ${circumference}`;
                    const strokeDashoffset = -accumulatedOffset;
                    accumulatedOffset += percentage * circumference;

                    return (
                      <circle
                        key={category}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={CATEGORY_COLORS[category as GarmentCategory]}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="wardrobe-dashboard__arc"
                      />
                    );
                  })}
                </>
              ) : (
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(212, 175, 55, 0.2)"
                  strokeWidth="12"
                  strokeDasharray={`${circumference * 0.25} ${circumference}`}
                />
              )}
            </svg>
            <div className="wardrobe-dashboard__donut-center">
              <span className="wardrobe-dashboard__donut-value">{totalItems}</span>
              <span className="wardrobe-dashboard__donut-label">总件数</span>
            </div>
          </div>

          <div className="wardrobe-dashboard__legend">
            {categories.map(([category, count]) => (
              <div key={category} className="wardrobe-dashboard__legend-item">
                <span
                  className="wardrobe-dashboard__legend-color"
                  style={{ backgroundColor: CATEGORY_COLORS[category as GarmentCategory] }}
                />
                <span className="wardrobe-dashboard__legend-icon">
                  {CATEGORY_ICONS[category as GarmentCategory]}
                </span>
                <span className="wardrobe-dashboard__legend-name">
                  {category === 'Top' ? '上衣' :
                   category === 'Bottom' ? '下装' :
                   category === 'Dress' ? '连衣裙' :
                   category === 'Shoes' ? '鞋子' :
                   category === 'Outerwear' ? '外套' : '配饰'}
                </span>
                <span className="wardrobe-dashboard__legend-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Utilized Items */}
        {topUtilized.length > 0 && (
          <div className="wardrobe-dashboard__top">
            <h4 className="wardrobe-dashboard__top-title">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              人气单品 Top 3
            </h4>
            <div className="wardrobe-dashboard__top-list">
              {topUtilized.map((item, index) => (
                <div key={item.id} className="wardrobe-dashboard__top-item">
                  <span className={`wardrobe-dashboard__top-rank wardrobe-dashboard__top-rank--${index + 1}`}>
                    {index + 1}
                  </span>
                  <div className="wardrobe-dashboard__top-image">
                    <img src={item.imageData} alt={item.name} />
                  </div>
                  <div className="wardrobe-dashboard__top-info">
                    <span className="wardrobe-dashboard__top-name">{item.name}</span>
                    <span className="wardrobe-dashboard__top-uses">
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      {item.utilizationCount} 次使用
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
