import { type CSSProperties, type ReactNode } from 'react';
import './ImageFrame.css';

interface ImageFrameProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: 'art-nouveau' | 'classic' | 'minimal';
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'video';
  showGrain?: boolean;
  decorative?: boolean;
}

export function ImageFrame({
  children,
  className = '',
  style,
  variant = 'art-nouveau',
  aspectRatio = 'square',
  showGrain = true,
  decorative = true,
}: ImageFrameProps) {
  const classes = [
    'image-frame',
    `image-frame--${variant}`,
    `image-frame--${aspectRatio}`,
    showGrain ? 'image-frame--grain' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {decorative && variant === 'art-nouveau' && (
        <div className="image-frame__decorations">
          <svg
            className="image-frame__corner image-frame__corner--tl"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M5,55 Q5,5 55,5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="10" cy="10" r="3" fill="currentColor" />
            <path
              d="M15,25 Q25,15 35,25 Q25,35 15,25"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
          <svg
            className="image-frame__corner image-frame__corner--tr"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M55,55 Q55,5 5,5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="50" cy="10" r="3" fill="currentColor" />
            <path
              d="M45,25 Q35,15 25,25 Q35,35 45,25"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
          <svg
            className="image-frame__corner image-frame__corner--bl"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M5,5 Q5,55 55,55"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="10" cy="50" r="3" fill="currentColor" />
            <path
              d="M15,35 Q25,45 35,35 Q25,25 15,35"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
          <svg
            className="image-frame__corner image-frame__corner--br"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M55,5 Q55,55 5,55"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <circle cx="50" cy="50" r="3" fill="currentColor" />
            <path
              d="M45,35 Q35,45 25,35 Q35,25 45,35"
              fill="currentColor"
              opacity="0.6"
            />
          </svg>
        </div>
      )}

      <div className="image-frame__inner">
        <div className="image-frame__content">{children}</div>
        {showGrain && <div className="image-frame__grain" />}
      </div>
    </div>
  );
}
