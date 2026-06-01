/**
 * Weather Ambient Effects Component
 * Enhanced visual atmospheric effects based on weather conditions
 * Uses pure CSS animations for optimal performance
 */

import './WeatherEffects.css';

export type WeatherType = 'sunny' | 'rainy' | 'cloudy' | 'clear';

interface WeatherEffectsProps {
  weather: WeatherType;
}

export function WeatherEffects({ weather }: WeatherEffectsProps) {
  return (
    <div className={`weather-effects weather-effects--${weather}`}>
      {weather === 'sunny' && <SunnyEffects />}
      {weather === 'rainy' && <RainyEffects />}
      {weather === 'cloudy' && <CloudyEffects />}
    </div>
  );
}

/**
 * Sunny Effects - Enhanced Tyndall effect with larger gold light spots
 * Features amplified particle sizes with glow effects
 */
function SunnyEffects() {
  return (
    <div className="sunny-effects">
      <div className="light-rays">
        <div className="light-ray light-ray--1" />
        <div className="light-ray light-ray--2" />
        <div className="light-ray light-ray--3" />
        <div className="light-ray light-ray--4" />
        <div className="light-ray light-ray--5" />
      </div>
      <div className="floating-particles">
        <div className="particle particle--1" />
        <div className="particle particle--2" />
        <div className="particle particle--3" />
        <div className="particle particle--4" />
        <div className="particle particle--5" />
        <div className="particle particle--6" />
        <div className="particle particle--7" />
        <div className="particle particle--8" />
        <div className="particle particle--9" />
        <div className="particle particle--10" />
        <div className="particle particle--11" />
        <div className="particle particle--12" />
      </div>
    </div>
  );
}

/**
 * Rainy Effects - Enhanced with higher rain density and vignette overlay
 * Features darker color palette and immersive atmosphere
 */
function RainyEffects() {
  const raindrops = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: (i * 1.25) % 100,
    delay: (i * 0.05) % 3,
    duration: 0.6 + (i % 7) * 0.08,
    opacity: 0.4 + (i % 5) * 0.1,
  }));

  return (
    <div className="rainy-effects">
      <div className="rain-container">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className="raindrop"
            style={{
              left: `${drop.left}%`,
              animationDelay: `${drop.delay}s`,
              animationDuration: `${drop.duration}s`,
              opacity: drop.opacity,
              height: `${18 + (drop.id % 4) * 6}px`,
            }}
          />
        ))}
      </div>
      <div className="ripples">
        <div className="ripple ripple--1" />
        <div className="ripple ripple--2" />
        <div className="ripple ripple--3" />
        <div className="ripple ripple--4" />
        <div className="ripple ripple--5" />
        <div className="ripple ripple--6" />
        <div className="ripple ripple--7" />
      </div>
    </div>
  );
}

/**
 * Cloudy Effects - Soft diffused lighting
 */
function CloudyEffects() {
  return (
    <div className="cloudy-effects">
      <div className="cloud cloud--1" />
      <div className="cloud cloud--2" />
      <div className="cloud cloud--3" />
    </div>
  );
}
