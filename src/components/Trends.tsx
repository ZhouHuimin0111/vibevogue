/**
 * Trends Component
 * Social media-inspired fashion trend feed
 */

import { useState } from 'react';
import './Trends.css';

interface TrendsProps {
  wardrobeItems?: import('../types').WardrobeItem[];
  onMatchToWardrobe?: (style: string) => void;
}

// Mock trend data
const MOCK_TRENDS = [
  {
    id: 1,
    title: '静谧蓝春日',
    category: '色彩趋势',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=500&fit=crop',
    description: '低饱和度的静谧蓝成为本季主打色，搭配米白与浅灰，营造清新春日氛围',
    tags: ['蓝色系', '清新', '通勤'],
    likes: 2340,
    matchStyle: 'Minimalist',
  },
  {
    id: 2,
    title: '法式复古风',
    category: '风格趋势',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop',
    description: '方领、泡泡袖、碎花元素持续流行，打造浪漫法式田园风',
    tags: ['法式', '复古', '碎花'],
    likes: 1890,
    matchStyle: 'Romantic',
  },
  {
    id: 3,
    title: '极简主义回归',
    category: '风格趋势',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
    description: 'Less is more，利落剪裁与纯色搭配，诠释现代都市美学',
    tags: ['极简', '都市', '利落'],
    likes: 3210,
    matchStyle: 'Minimalist',
  },
  {
    id: 4,
    title: '焦糖色系',
    category: '色彩趋势',
    image: 'https://images.unsplash.com/photo-1485968579169-a6b39a8e3da5?w=400&h=550&fit=crop',
    description: '温暖的焦糖色席卷时尚圈，从奶茶色到摩卡色，营造秋冬慵懒氛围',
    tags: ['焦糖色', '暖调', '秋冬'],
    likes: 2560,
    matchStyle: 'Classic',
  },
  {
    id: 5,
    title: '蝴蝶结元素',
    category: '细节趋势',
    image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=480&fit=crop',
    description: '大尺寸蝴蝶结点缀成为本季亮点，无论是领口还是背部设计都吸睛十足',
    tags: ['蝴蝶结', '女性化', '精致'],
    likes: 1780,
    matchStyle: 'Romantic',
  },
  {
    id: 6,
    title: '缎面材质',
    category: '材质趋势',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=520&fit=crop',
    description: '缎面、丝绸等光泽感材质成为主流，在灯光下流转优雅光泽',
    tags: ['缎面', '光泽', '优雅'],
    likes: 2120,
    matchStyle: 'Formal',
  },
  {
    id: 7,
    title: '职场优雅',
    category: '场合趋势',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=580&fit=crop',
    description: '西装套装新演绎，Oversize剪裁搭配收腰设计，刚柔并济',
    tags: ['职场', '西装', '干练'],
    likes: 2980,
    matchStyle: 'Formal',
  },
  {
    id: 8,
    title: '波点回潮',
    category: '图案趋势',
    image: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aeab?w=400&h=490&fit=crop',
    description: '经典波点元素强势回归，大波点张扬个性，小波点优雅复古',
    tags: ['波点', '复古', '经典'],
    likes: 1650,
    matchStyle: 'Vintage',
  },
];

export function Trends({ onMatchToWardrobe }: TrendsProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const categories = ['all', '色彩趋势', '风格趋势', '材质趋势', '场合趋势', '图案趋势', '细节趋势'];

  const filteredTrends = activeFilter === 'all'
    ? MOCK_TRENDS
    : MOCK_TRENDS.filter(t => t.category === activeFilter);

  const handleMatchToWardrobe = (style: string) => {
    onMatchToWardrobe?.(style);
  };

  return (
    <div className="trends">
      <div className="trends__header">
        <h2 className="trends__title">流行趋势</h2>
        <p className="trends__subtitle">探索当季时尚灵感</p>
      </div>

      <div className="trends__filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`trends__filter ${activeFilter === cat ? 'trends__filter--active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      <div className="trends__grid">
        {filteredTrends.map((trend) => (
          <div
            key={trend.id}
            className={`trends__card ${expandedCard === trend.id ? 'trends__card--expanded' : ''}`}
            onClick={() => setExpandedCard(expandedCard === trend.id ? null : trend.id)}
          >
            <div className="trends__card-image">
              <img src={trend.image} alt={trend.title} />
              <div className="trends__card-overlay">
                <span className="trends__card-category">{trend.category}</span>
              </div>
            </div>

            <div className="trends__card-content">
              <h3 className="trends__card-title">{trend.title}</h3>
              <p className="trends__card-description">{trend.description}</p>

              <div className="trends__card-tags">
                {trend.tags.map((tag) => (
                  <span key={tag} className="trends__card-tag">{tag}</span>
                ))}
              </div>

              <div className="trends__card-footer">
                <div className="trends__card-likes">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{trend.likes}</span>
                </div>

                <button
                  className="trends__card-match"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMatchToWardrobe(trend.tags.join(','));
                  }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  匹配衣橱
                </button>
              </div>
            </div>

            <div className="trends__card-frame trends__card-frame--tl" />
            <div className="trends__card-frame trends__card-frame--tr" />
            <div className="trends__card-frame trends__card-frame--bl" />
            <div className="trends__card-frame trends__card-frame--br" />
          </div>
        ))}
      </div>
    </div>
  );
}
