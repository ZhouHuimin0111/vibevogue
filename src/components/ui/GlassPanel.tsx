import { type ReactNode, type CSSProperties } from 'react';
import './GlassPanel.css';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: 'frosted' | 'solid' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export function GlassPanel({
  children,
  className = '',
  style,
  variant = 'frosted',
  padding = 'md',
  hover = false,
  onClick,
}: GlassPanelProps) {
  const classes = [
    'glass-panel',
    `glass-panel--${variant}`,
    `glass-panel--padding-${padding}`,
    hover ? 'glass-panel--hover' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} onClick={onClick} role={onClick ? 'button' : undefined}>
      {children}
    </div>
  );
}
