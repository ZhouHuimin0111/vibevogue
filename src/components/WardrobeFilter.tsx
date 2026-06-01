/**
 * Wardrobe Filter Component
 * Filter and sort wardrobe items by various criteria
 */

import type { GarmentCategory, Season } from '../types';
import './WardrobeFilter.css';

interface WardrobeFilterProps {
  selectedCategory: GarmentCategory | 'all';
  selectedSeason: Season | 'all';
  sortBy: 'newest' | 'oldest' | 'most-used' | 'name';
  onCategoryChange: (category: GarmentCategory | 'all') => void;
  onSeasonChange: (season: Season | 'all') => void;
  onSortChange: (sort: 'newest' | 'oldest' | 'most-used' | 'name') => void;
}

const CATEGORIES: { value: GarmentCategory | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'Top', label: '上衣' },
  { value: 'Bottom', label: '下装' },
  { value: 'Dress', label: '连衣裙' },
  { value: 'Shoes', label: '鞋子' },
  { value: 'Outerwear', label: '外套' },
  { value: 'Accessory', label: '配饰' },
];

const SEASONS: { value: Season | 'all'; label: string }[] = [
  { value: 'all', label: '全部季节' },
  { value: 'Spring', label: '春季' },
  { value: 'Summer', label: '夏季' },
  { value: 'Autumn', label: '秋季' },
  { value: 'Winter', label: '冬季' },
];

const SORT_OPTIONS: { value: 'newest' | 'oldest' | 'most-used' | 'name'; label: string }[] = [
  { value: 'newest', label: '最新添加' },
  { value: 'oldest', label: '最早添加' },
  { value: 'most-used', label: '使用次数' },
  { value: 'name', label: '名称排序' },
];

export function WardrobeFilter({
  selectedCategory,
  selectedSeason,
  sortBy,
  onCategoryChange,
  onSeasonChange,
  onSortChange,
}: WardrobeFilterProps) {
  return (
    <div className="wardrobe-filter">
      <div className="wardrobe-filter__group">
        <label className="wardrobe-filter__label">分类</label>
        <div className="wardrobe-filter__tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className={`wardrobe-filter__tab ${selectedCategory === cat.value ? 'wardrobe-filter__tab--active' : ''}`}
              onClick={() => onCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="wardrobe-filter__row">
        <div className="wardrobe-filter__group wardrobe-filter__group--inline">
          <label className="wardrobe-filter__label">季节</label>
          <select
            className="wardrobe-filter__select"
            value={selectedSeason}
            onChange={(e) => onSeasonChange(e.target.value as Season | 'all')}
          >
            {SEASONS.map((season) => (
              <option key={season.value} value={season.value}>
                {season.label}
              </option>
            ))}
          </select>
        </div>

        <div className="wardrobe-filter__group wardrobe-filter__group--inline">
          <label className="wardrobe-filter__label">排序</label>
          <select
            className="wardrobe-filter__select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'newest' | 'oldest' | 'most-used' | 'name')}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
