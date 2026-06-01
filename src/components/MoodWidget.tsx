/**
 * Mood Widget Component
 * Displays weather info and mood input
 */

import { useState, useEffect } from 'react';
import type { WeatherType } from '../types';
import './MoodWidget.css';

interface MoodWidgetProps {
  weather: WeatherType;
  onMoodChange?: (mood: string) => void;
}

const WEATHER_ICONS: Record<WeatherType, React.ReactNode> = {
  sunny: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  cloudy: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  rainy: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M16 13V7a4 4 0 0 0-8 0v6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 13v4M8 17l-1 4M12 17l-1 4M16 17l-1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  clear: (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  ),
};

const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  clear: '晴朗',
};

const MOOD_KEY = 'vibevogue_daily_mood';

export function MoodWidget({ weather, onMoodChange }: MoodWidgetProps) {
  const [mood, setMood] = useState('');
  const [temperature, setTemperature] = useState(24);

  useEffect(() => {
    const savedMood = localStorage.getItem(MOOD_KEY);
    if (savedMood) {
      setMood(savedMood);
    }

    // Simulate temperature based on weather
    const temps: Record<WeatherType, number> = {
      sunny: 26,
      cloudy: 22,
      rainy: 18,
      clear: 24,
    };
    setTemperature(temps[weather]);
  }, [weather]);

  const handleMoodChange = (value: string) => {
    setMood(value);
    localStorage.setItem(MOOD_KEY, value);
    onMoodChange?.(value);
  };

  return (
    <div className="mood-widget">
      <div className="mood-widget__weather">
        <span className="mood-widget__icon">{WEATHER_ICONS[weather]}</span>
        <span className="mood-widget__temp">{temperature}°C</span>
        <span className="mood-widget__label">{WEATHER_LABELS[weather]}</span>
      </div>

      <div className="mood-widget__divider" />

      <div className="mood-widget__mood">
        <label className="mood-widget__label-input">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
          心情
        </label>
        <input
          type="text"
          className="mood-widget__input"
          placeholder="今日心情..."
          value={mood}
          onChange={(e) => handleMoodChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export function getMoodFromStorage(): string {
  return localStorage.getItem(MOOD_KEY) || '';
}
