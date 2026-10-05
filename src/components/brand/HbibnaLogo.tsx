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
  showBadge = true,
  showWordmark = true,
  className = '',
  theme = 'light',
}: HbibnaLogoProps) {
  const sizeMap = {
    sm: { height: 28 },
    md: { height: 36 },
    lg: { height: 46 },
    xl: { height: 56 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (!showWordmark) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/hbibna-icon-trimmed.png"
          alt="Hbibna Brand Icon"
          style={{ height: `${currentSize.height}px`, width: 'auto' }}
          className="h-auto object-contain transition-transform group-hover:scale-105"
        />
      </div>
    );
  }

  const logoSrc = theme === 'dark'
    ? '/assets/hbibna-full-logo-white.png'
    : '/assets/hbibna-full-logo.png';

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        alt="Hbibna Logo"
        style={{ height: `${currentSize.height}px`, width: 'auto' }}
        className="h-auto object-contain transition-transform group-hover:scale-105"
      />
    </div>
  );
}
