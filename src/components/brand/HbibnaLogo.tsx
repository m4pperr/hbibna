import React from 'react';

interface HbibnaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  showWordmark?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export function HbibnaLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  theme = 'light',
}: HbibnaLogoProps) {
  const sizeMap = {
    sm: { iconSize: 26, textSize: 'text-lg sm:text-xl', dotSize: 'w-2 h-2' },
    md: { iconSize: 34, textSize: 'text-xl sm:text-2xl', dotSize: 'w-2.5 h-2.5' },
    lg: { iconSize: 44, textSize: 'text-2xl sm:text-3xl', dotSize: 'w-3 h-3' },
    xl: { iconSize: 54, textSize: 'text-3xl sm:text-4xl', dotSize: 'w-3.5 h-3.5' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-2 select-none group font-rounded ${className}`}>
      {/* 3D Stacked Ticket Brand Icon (High-Res 512px Asset) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/hbibna-icon-trimmed.png"
        alt="Hbibna Brand Icon"
        style={{ height: `${currentSize.iconSize}px`, width: 'auto' }}
        className="h-auto object-contain transition-transform duration-200 group-hover:scale-105 shrink-0"
      />

      {/* Crisp Ultra-Sharp Vector Wordmark + Signature Coral Dot */}
      {showWordmark && (
        <span
          className={`font-black tracking-tight flex items-baseline gap-1 leading-none transition-colors ${
            isDark ? 'text-white' : 'text-black'
          } ${currentSize.textSize}`}
        >
          <span>Hbibna</span>
          <span
            className={`rounded-full bg-[#E25B6C] inline-block shrink-0 shadow-[0_1px_0_rgba(0,0,0,0.3)] ${currentSize.dotSize}`}
          />
        </span>
      )}
    </div>
  );
}
