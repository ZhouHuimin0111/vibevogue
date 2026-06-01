/**
 * Smart Upload Component
 * Handles garment image upload with manual form entry
 */

import { useState, useRef } from 'react';
import type { GarmentCategory, Season, StyleTag } from '../types';
import { addWardrobeItem } from '../db';
import './SmartUpload.css';

interface SmartUploadProps {
  onUploadComplete?: (itemId: number) => void;
  compact?: boolean;
}

const CATEGORIES: { value: GarmentCategory; label: string }[] = [
  { value: 'Top', label: '上衣' },
  { value: 'Bottom', label: '下装' },
  { value: 'Dress', label: '连衣裙' },
  { value: 'Shoes', label: '鞋子' },
  { value: 'Outerwear', label: '外套' },
  { value: 'Accessory', label: '配饰' },
];

const SEASONS: { value: Season; label: string }[] = [
  { value: 'Spring', label: '春季' },
  { value: 'Summer', label: '夏季' },
  { value: 'Autumn', label: '秋季' },
  { value: 'Winter', label: '冬季' },
];

const STYLE_TAGS: { value: StyleTag; label: string }[] = [
  { value: 'Minimalist', label: '极简' },
  { value: 'Vintage', label: '复古' },
  { value: 'Streetwear', label: '街头' },
  { value: 'Bohemian', label: '波西米亚' },
  { value: 'Formal', label: '正式' },
  { value: 'Casual', label: '休闲' },
  { value: 'Sporty', label: '运动' },
  { value: 'Romantic', label: '浪漫' },
  { value: 'Avant-garde', label: '前卫' },
  { value: 'Classic', label: '经典' },
];

export function SmartUpload({ onUploadComplete, compact = false }: SmartUploadProps) {
  const [imageData, setImageData] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Top' as GarmentCategory,
    mainColor: '',
    seasons: [] as Season[],
    styleTags: [] as StyleTag[],
  });
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setImageData(imageData);
      setError(null);
      // Auto-fill name from filename
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({
        ...prev,
        name: fileName || '未命名服装'
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!imageData || !formData.name.trim()) {
      setError('请填写服装名称');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const itemId = await addWardrobeItem(
        formData.name,
        imageData,
        formData.category,
        formData.mainColor || '#000000',
        formData.seasons.length > 0 ? formData.seasons : ['Spring', 'Summer', 'Autumn', 'Winter'],
        formData.styleTags.length > 0 ? formData.styleTags : ['Casual']
      );

      onUploadComplete?.(itemId);

      // Reset form
      setImageData(null);
      setFormData({
        name: '',
        category: 'Top',
        mainColor: '',
        seasons: [],
        styleTags: [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setImageData(null);
    setFormData({
      name: '',
      category: 'Top',
      mainColor: '',
      seasons: [],
      styleTags: [],
    });
    setError(null);
  };

  const toggleSeason = (season: Season) => {
    setFormData((prev) => ({
      ...prev,
      seasons: prev.seasons.includes(season)
        ? prev.seasons.filter((s) => s !== season)
        : [...prev.seasons, season],
    }));
  };

  const toggleStyleTag = (tag: StyleTag) => {
    setFormData((prev) => ({
      ...prev,
      styleTags: prev.styleTags.includes(tag)
        ? prev.styleTags.filter((t) => t !== tag)
        : [...prev.styleTags, tag],
    }));
  };

  if (!imageData) {
    return (
      <div className={`smart-upload ${compact ? 'smart-upload--compact' : ''}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden-input"
        />

        <button
          className="smart-upload__trigger"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="smart-upload__trigger-icon">
            <svg viewBox="0 0 24 24" width={compact ? 24 : 32} height={compact ? 24 : 32} fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <span className="smart-upload__trigger-text">{compact ? '上传服装' : '上传服装图片'}</span>
          {!compact && <span className="smart-upload__trigger-hint">点击选择本地图片</span>}
        </button>
      </div>
    );
  }

  return (
    <div className="smart-upload smart-upload--form">
      <div className="smart-upload__preview">
        <img src={imageData} alt="预览" />
        <button className="smart-upload__preview-change" onClick={() => fileInputRef.current?.click()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          更换
        </button>
      </div>

      <div className="smart-upload__form">
        <div className="smart-upload__field">
          <label className="smart-upload__label">服装名称 *</label>
          <input
            type="text"
            className="smart-upload__input"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="请输入服装名称"
          />
        </div>

        <div className="smart-upload__field">
          <label className="smart-upload__label">品类 *</label>
          <div className="smart-upload__tags">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`smart-upload__tag ${formData.category === cat.value ? 'smart-upload__tag--selected' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="smart-upload__field">
          <label className="smart-upload__label">主色调</label>
          <div className="smart-upload__color-input">
            <input
              type="color"
              value={formData.mainColor || '#000000'}
              onChange={(e) => setFormData((prev) => ({ ...prev, mainColor: e.target.value }))}
              className="smart-upload__color-picker"
            />
            <input
              type="text"
              className="smart-upload__input smart-upload__input--inline"
              value={formData.mainColor}
              onChange={(e) => setFormData((prev) => ({ ...prev, mainColor: e.target.value }))}
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="smart-upload__field">
          <label className="smart-upload__label">适合季节</label>
          <div className="smart-upload__tags">
            {SEASONS.map((season) => (
              <button
                key={season.value}
                type="button"
                className={`smart-upload__tag ${formData.seasons.includes(season.value) ? 'smart-upload__tag--selected' : ''}`}
                onClick={() => toggleSeason(season.value)}
              >
                {season.label}
              </button>
            ))}
          </div>
        </div>

        <div className="smart-upload__field">
          <label className="smart-upload__label">风格标签</label>
          <div className="smart-upload__tags">
            {STYLE_TAGS.map((tag) => (
              <button
                key={tag.value}
                type="button"
                className={`smart-upload__tag ${formData.styleTags.includes(tag.value) ? 'smart-upload__tag--selected' : ''}`}
                onClick={() => toggleStyleTag(tag.value)}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="smart-upload__error">{error}</div>}

        <div className="smart-upload__actions">
          <button
            type="button"
            className="smart-upload__btn smart-upload__btn--cancel"
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="smart-upload__btn smart-upload__btn--save"
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
          >
            {isSaving ? (
              <>
                <span className="smart-upload__spinner" />
                保存中...
              </>
            ) : (
              '保存到衣橱'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
