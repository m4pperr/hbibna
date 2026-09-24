import React from 'react';

interface HbibnaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export function HbibnaLogo({
  size = 'md',
  showBadge = true,
  className = '',
  theme = 'light',
}: HbibnaLogoProps) {
  const sizeMap = {
    sm: {
      text: 'text-base',
      box: 'w-7 h-7',
      hText: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      text: 'text-xl',
      box: 'w-8 h-8',
      hText: 'text-sm',
      gap: 'gap-2.5',
    },
    lg: {
      text: 'text-2xl',
      box: 'w-10 h-10',
      hText: 'text-base',
      gap: 'gap-3',
    },
    xl: {
      text: 'text-3xl',
      box: 'w-12 h-12',
      hText: 'text-xl',
      gap: 'gap-3.5',
    },
  };

  const currentSize = sizeMap[size];
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {/* Minimal Elegant Emblem */}
      {showBadge && (
        <div
          className={`${currentSize.box} rounded-xl ${
            isDark
              ? 'bg-[#FFFFFF] text-[#191817]'
              : 'bg-[#191817] text-[#FAF8F5]'
          } border border-[#DFC99F]/40 shadow-xs flex items-center justify-center font-black tracking-tight shrink-0 transition-transform group-hover:scale-105`}
        >
          <span className={`${currentSize.hText} font-black text-[#DFC99F]`}>H</span>
        </div>
      )}

      {/* Elegant Wordmark */}
      <span
        className={`font-black tracking-tight ${currentSize.text} ${
          isDark ? 'text-[#FAF8F5]' : 'text-[#191817]'
        } flex items-baseline`}
      >
        <span>Hb</span>
        <span className="relative">
          ı
          <span
            className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B88E3E]"
            aria-hidden="true"
          />
        </span>
        <span>bna</span>
      </span>
    </div>
  );
}
