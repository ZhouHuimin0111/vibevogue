import './MuchaLoader.css';

interface MuchaLoaderProps {
  message?: string;
}

export function MuchaLoader({ message = '正在生成穿搭效果...' }: MuchaLoaderProps) {
  return (
    <div className="mucha-loader">
      <div className="mucha-container">
        <svg
          className="mucha-svg"
          viewBox="0 0 300 400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffb6c1" />
              <stop offset="50%" stopColor="#ff69b4" />
              <stop offset="100%" stopColor="#db7093" />
            </linearGradient>
            <linearGradient id="goldPinkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffdab9" />
              <stop offset="50%" stopColor="#ffb6c1" />
              <stop offset="100%" stopColor="#ffc0cb" />
            </linearGradient>
            <radialGradient id="glowPink" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffb6c1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff69b4" stopOpacity="0" />
            </radialGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background decorative frame */}
          <rect
            x="20"
            y="20"
            width="260"
            height="360"
            rx="130"
            ry="130"
            fill="none"
            stroke="url(#pinkGradient)"
            strokeWidth="1"
            opacity="0.3"
            className="frame-rect"
          />

          {/* Central woman silhouette (Mucha style) */}
          <g className="mucha-figure">
            {/* Hair flowing */}
            <path
              className="hair hair-1"
              d="M150,60 Q180,80 190,120 Q200,160 185,200 Q170,180 175,140 Q180,100 150,80 Z"
              fill="url(#pinkGradient)"
              opacity="0.7"
            />
            <path
              className="hair hair-2"
              d="M150,60 Q120,80 110,120 Q100,160 115,200 Q130,180 125,140 Q120,100 150,80 Z"
              fill="url(#pinkGradient)"
              opacity="0.7"
            />

            {/* Face */}
            <ellipse
              className="face"
              cx="150"
              cy="100"
              rx="35"
              ry="45"
              fill="#ffe4e1"
              stroke="url(#pinkGradient)"
              strokeWidth="1.5"
            />

            {/* Eyes */}
            <ellipse className="eye eye-left" cx="138" cy="95" rx="5" ry="3" fill="#db7093" />
            <ellipse className="eye eye-right" cx="162" cy="95" rx="5" ry="3" fill="#db7093" />

            {/* Lips */}
            <path
              className="lips"
              d="M143,115 Q150,120 157,115"
              fill="none"
              stroke="#db7093"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Neck */}
            <path
              className="neck"
              d="M140,140 L140,170 Q150,175 160,170 L160,140"
              fill="#ffe4e1"
              stroke="url(#pinkGradient)"
              strokeWidth="1"
            />

            {/* Flowing dress/bodice */}
            <path
              className="bodice"
              d="M120,170 Q100,200 90,250 Q80,300 100,350 L200,350 Q220,300 210,250 Q200,200 180,170 Q165,175 150,175 Q135,175 120,170 Z"
              fill="url(#goldPinkGradient)"
              opacity="0.8"
            />

            {/* Decorative floral elements on dress */}
            <g className="dress-flowers">
              <circle className="flower flower-1" cx="130" cy="220" r="8" fill="#ff69b4" opacity="0.6" />
              <circle className="flower flower-2" cx="170" cy="240" r="10" fill="#ffb6c1" opacity="0.6" />
              <circle className="flower flower-3" cx="150" cy="280" r="12" fill="#db7093" opacity="0.6" />
              <circle className="flower flower-4" cx="120" cy="300" r="6" fill="#ffc0cb" opacity="0.6" />
              <circle className="flower flower-5" cx="180" cy="310" r="7" fill="#ff69b4" opacity="0.6" />
            </g>
          </g>

          {/* Floating decorative elements */}
          <g className="floating-elements">
            {/* Left side vines */}
            <path
              className="vine vine-left-1"
              d="M30,150 Q50,140 55,160 Q60,180 40,190 Q20,200 30,220"
              fill="none"
              stroke="url(#pinkGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <circle className="berry berry-1" cx="45" cy="175" r="4" fill="#ff69b4" opacity="0.7" />

            {/* Right side vines */}
            <path
              className="vine vine-right-1"
              d="M270,150 Q250,140 245,160 Q240,180 260,190 Q280,200 270,220"
              fill="none"
              stroke="url(#pinkGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <circle className="berry berry-2" cx="255" cy="175" r="4" fill="#ff69b4" opacity="0.7" />

            {/* Top corner ornaments */}
            <path
              className="corner-ornament top-left"
              d="M50,30 Q60,40 50,50 Q40,40 50,30"
              fill="url(#pinkGradient)"
              opacity="0.5"
            />
            <path
              className="corner-ornament top-right"
              d="M250,30 Q240,40 250,50 Q260,40 250,30"
              fill="url(#pinkGradient)"
              opacity="0.5"
            />

            {/* Stars/sparkles */}
            <g className="sparkles">
              <path
                className="sparkle sparkle-1"
                d="M80,80 L82,86 L88,88 L82,90 L80,96 L78,90 L72,88 L78,86 Z"
                fill="#ff69b4"
                opacity="0.8"
              />
              <path
                className="sparkle sparkle-2"
                d="M220,120 L222,126 L228,128 L222,130 L220,136 L218,130 L212,128 L218,126 Z"
                fill="#ffb6c1"
                opacity="0.8"
              />
              <path
                className="sparkle sparkle-3"
                d="M60,280 L61,284 L65,285 L61,286 L60,290 L59,286 L55,285 L59,284 Z"
                fill="#db7093"
                opacity="0.8"
              />
              <path
                className="sparkle sparkle-4"
                d="M240,260 L241,264 L245,265 L241,266 L240,270 L239,266 L235,265 L239,264 Z"
                fill="#ffc0cb"
                opacity="0.8"
              />
            </g>
          </g>

          {/* Glowing aura behind figure */}
          <ellipse
            className="aura"
            cx="150"
            cy="200"
            rx="80"
            ry="150"
            fill="url(#glowPink)"
            opacity="0.3"
          />
        </svg>

        <div className="mucha-text">
          <p className="loading-message">{message}</p>
          <div className="loading-hearts">
            <svg className="heart heart-1" viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="#ff69b4"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <svg className="heart heart-2" viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="#ff69b4"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
            <svg className="heart heart-3" viewBox="0 0 24 24" width="16" height="16">
              <path
                fill="#ff69b4"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
