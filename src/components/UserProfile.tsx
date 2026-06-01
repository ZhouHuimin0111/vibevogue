/**
 * User Profile Component
 * Manages user skin tone and body shape preferences
 */

import { useState, useEffect } from 'react';
import type { UserProfile, SkinTone, BodyShape } from '../types';
import './UserProfile.css';

const SKIN_TONE_OPTIONS: { value: SkinTone; label: string; color: string }[] = [
  { value: 'fair', label: '白皙', color: '#FFE4C4' },
  { value: 'light', label: '浅色', color: '#F5DEB3' },
  { value: 'medium', label: '中等', color: '#D2B48C' },
  { value: 'tan', label: '偏深', color: '#C4A484' },
  { value: 'dark', label: '深色', color: '#8B7355' },
];

const BODY_SHAPE_OPTIONS: { value: BodyShape; label: string; description: string }[] = [
  { value: 'hourglass', label: '沙漏型', description: '肩胯同宽，腰部纤细' },
  { value: 'pear', label: '梨型', description: '肩窄胯宽，下身偏胖' },
  { value: 'apple', label: '苹果型', description: '肩宽胯窄，上身偏胖' },
  { value: 'rectangle', label: '直筒型', description: '肩胯同宽，曲线不明显' },
  { value: 'inverted-triangle', label: '倒三角', description: '肩宽胯窄，上身偏胖' },
];

interface UserProfileProps {
  onProfileChange?: (profile: UserProfile) => void;
}

const STORAGE_KEY = 'vibevogue_user_profile';

export function UserProfile({ onProfileChange }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile>({
    skinTone: 'medium',
    bodyShape: 'hourglass',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setTempProfile(parsed);
      } catch (e) {
        console.error('Failed to parse user profile:', e);
      }
    }
  }, []);

  const handleSave = () => {
    setProfile(tempProfile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tempProfile));
    onProfileChange?.(tempProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const getCurrentSkinTone = () => SKIN_TONE_OPTIONS.find(o => o.value === profile.skinTone);
  const getCurrentBodyShape = () => BODY_SHAPE_OPTIONS.find(o => o.value === profile.bodyShape);

  if (isEditing) {
    return (
      <div className="user-profile user-profile--editing">
        <div className="user-profile__section">
          <h4 className="user-profile__section-title">肤色</h4>
          <div className="user-profile__options">
            {SKIN_TONE_OPTIONS.map(option => (
              <button
                key={option.value}
                className={`user-profile__option ${tempProfile.skinTone === option.value ? 'user-profile__option--selected' : ''}`}
                onClick={() => setTempProfile({ ...tempProfile, skinTone: option.value })}
              >
                <span
                  className="user-profile__color-swatch"
                  style={{ backgroundColor: option.color }}
                />
                <span className="user-profile__option-label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="user-profile__section">
          <h4 className="user-profile__section-title">身型</h4>
          <div className="user-profile__options user-profile__options--body">
            {BODY_SHAPE_OPTIONS.map(option => (
              <button
                key={option.value}
                className={`user-profile__option user-profile__option--body ${tempProfile.bodyShape === option.value ? 'user-profile__option--selected' : ''}`}
                onClick={() => setTempProfile({ ...tempProfile, bodyShape: option.value })}
              >
                <span className="user-profile__option-label">{option.label}</span>
                <span className="user-profile__option-desc">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="user-profile__actions">
          <button className="user-profile__btn user-profile__btn--cancel" onClick={handleCancel}>
            取消
          </button>
          <button className="user-profile__btn user-profile__btn--save" onClick={handleSave}>
            保存设置
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="user-profile__header">
        <h4 className="user-profile__title">个人特征</h4>
        <button className="user-profile__edit" onClick={() => setIsEditing(true)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
      </div>

      <div className="user-profile__display">
        <div className="user-profile__item">
          <span className="user-profile__item-label">肤色</span>
          <span className="user-profile__item-value">
            <span
              className="user-profile__color-swatch"
              style={{ backgroundColor: getCurrentSkinTone()?.color }}
            />
            {getCurrentSkinTone()?.label}
          </span>
        </div>
        <div className="user-profile__item">
          <span className="user-profile__item-label">身型</span>
          <span className="user-profile__item-value">{getCurrentBodyShape()?.label}</span>
        </div>
      </div>
    </div>
  );
}

export function getUserProfile(): UserProfile {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { skinTone: 'medium', bodyShape: 'hourglass' };
    }
  }
  return { skinTone: 'medium', bodyShape: 'hourglass' };
}

export function getStylePersona(): string {
  return localStorage.getItem('vibevogue_style_persona') || '时尚达人';
}
