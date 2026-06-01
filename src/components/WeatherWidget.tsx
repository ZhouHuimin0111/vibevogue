/**
 * Weather Widget Component
 * Displays current weather conditions with temperature, humidity, UV index
 */

import type { WeatherType } from './WeatherEffects';
import './WeatherWidget.css';

interface WeatherData {
  temperature: number;
  humidity: number;
  uvIndex: number;
  description: string;
  windSpeed: number;
}

interface WeatherWidgetProps {
  weather: WeatherType;
  onWeatherChange: (weather: WeatherType) => void;
  compact?: boolean;
}

const weatherData: Record<WeatherType, WeatherData> = {
  sunny: {
    temperature: 26,
    humidity: 45,
    uvIndex: 8,
    description: '晴朗',
    windSpeed: 12,
  },
  rainy: {
    temperature: 18,
    humidity: 85,
    uvIndex: 2,
    description: '小雨',
    windSpeed: 20,
  },
  cloudy: {
    temperature: 22,
    humidity: 60,
    uvIndex: 4,
    description: '多云',
    windSpeed: 15,
  },
  clear: {
    temperature: 24,
    humidity: 50,
    uvIndex: 6,
    description: '晴',
    windSpeed: 10,
  },
};

export function WeatherWidget({ weather, onWeatherChange, compact = false }: WeatherWidgetProps) {
  const data = weatherData[weather];

  if (compact) {
    return (
      <div className="weather-widget weather-widget--compact">
        <div className="weather-widget__compact-icons">
          {(['sunny', 'cloudy', 'rainy'] as WeatherType[]).map((w) => (
            <button
              key={w}
              className={`weather-widget__compact-button ${weather === w ? 'weather-widget__compact-button--active' : ''}`}
              onClick={() => onWeatherChange(w)}
              title={w}
            >
              <WeatherIcon type={w} size={18} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="weather-widget">
      <div className="weather-widget__current">
        <div className="weather-widget__icon">
          <WeatherIcon type={weather} />
        </div>
        <div className="weather-widget__info">
          <span className="weather-widget__temp">{data.temperature}°C</span>
          <span className="weather-widget__desc">{data.description}</span>
        </div>
      </div>

      <div className="weather-widget__details">
        <div className="weather-widget__detail">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <div className="weather-widget__detail-info">
            <span className="weather-widget__detail-label">湿度</span>
            <span className="weather-widget__detail-value">{data.humidity}%</span>
          </div>
          <div className="weather-widget__detail-bar">
            <div className="weather-widget__detail-fill" style={{ width: `${data.humidity}%` }} />
          </div>
        </div>

        <div className="weather-widget__detail">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <div className="weather-widget__detail-info">
            <span className="weather-widget__detail-label">紫外线</span>
            <span className="weather-widget__detail-value">{data.uvIndex}</span>
          </div>
          <div className="weather-widget__detail-bar">
            <div className={`weather-widget__detail-fill weather-widget__detail-fill--uv ${getUVClass(data.uvIndex)}`} style={{ width: `${(data.uvIndex / 11) * 100}%` }} />
          </div>
        </div>

        <div className="weather-widget__detail">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
          </svg>
          <div className="weather-widget__detail-info">
            <span className="weather-widget__detail-label">风速</span>
            <span className="weather-widget__detail-value">{data.windSpeed} km/h</span>
          </div>
        </div>
      </div>

      <div className="weather-widget__selector">
        <span className="weather-widget__selector-label">天气模式</span>
        <div className="weather-widget__buttons">
          {(['sunny', 'cloudy', 'rainy'] as WeatherType[]).map((w) => (
            <button
              key={w}
              className={`weather-widget__button ${weather === w ? 'weather-widget__button--active' : ''}`}
              onClick={() => onWeatherChange(w)}
            >
              <WeatherIcon type={w} size={16} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WeatherIcon({ type, size = 24 }: { type: WeatherType; size?: number }) {
  const iconSize = { width: size, height: size };

  switch (type) {
    case 'sunny':
      return (
        <svg viewBox="0 0 24 24" style={iconSize} fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'rainy':
      return (
        <svg viewBox="0 0 24 24" style={iconSize} fill="currentColor">
          <path d="M16 13V7a4 4 0 0 0-8 0v6" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M12 13v4" stroke="currentColor" strokeWidth="2" />
          <path d="M8 17l-1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 17l-1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 17l-1 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'cloudy':
      return (
        <svg viewBox="0 0 24 24" style={iconSize} fill="currentColor">
          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'clear':
    default:
      return (
        <svg viewBox="0 0 24 24" style={iconSize} fill="currentColor">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="4" fill="currentColor" />
        </svg>
      );
  }
}

function getUVClass(uvIndex: number): string {
  if (uvIndex <= 2) return 'weather-widget__detail-fill--low';
  if (uvIndex <= 5) return 'weather-widget__detail-fill--moderate';
  if (uvIndex <= 7) return 'weather-widget__detail-fill--high';
  if (uvIndex <= 10) return 'weather-widget__detail-fill--very-high';
  return 'weather-widget__detail-fill--extreme';
}
