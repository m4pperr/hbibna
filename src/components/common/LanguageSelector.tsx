'use client';

import React from 'react';
import { useLanguage, type Language } from '@/lib/i18n/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'pill' | 'minimal' | 'full' | 'compact' | 'dark';
  theme?: 'light' | 'dark';
}

const LANGUAGES: { code: Language; label: string; ariaLabel: string }[] = [
  { code: 'en', label: 'EN', ariaLabel: 'English' },
  { code: 'fr', label: 'FR', ariaLabel: 'Français' },
  { code: 'ar', label: 'AR', ariaLabel: 'العربية (Arabic)' },
];

export function LanguageSelector({
  className = '',
  variant = 'pill',
  theme = 'light',
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const isDark = theme === 'dark' || variant === 'dark';

  if (isDark) {
    return (
      <div
        role="group"
        aria-label="Select language"
        className={`inline-flex items-center p-1 rounded-full bg-white/5 border border-white/15 select-none text-xs font-bold gap-1 shadow-inner backdrop-blur-xs ${className}`}
      >
        {LANGUAGES.map(({ code, label, ariaLabel }) => {
          const isActive = language === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLanguage(code)}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer text-xs font-bold ${
                isActive
                  ? 'bg-[#111111] text-[#FFE600] border border-[#FFE600]/40 shadow-xs font-black ring-1 ring-[#FFE600]/25'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
              }`}
              aria-pressed={isActive}
              aria-label={ariaLabel}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Select language"
      className={`inline-flex items-center p-0.5 rounded-full bg-black/5 border border-black/10 select-none text-[11px] font-bold text-[#111111]/70 ${className}`}
    >
      {LANGUAGES.map(({ code, label, ariaLabel }) => {
        const isActive = language === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
              isActive
                ? 'bg-[#111111] text-[#FFE600] shadow-xs font-black'
                : 'text-[#111111]/70 hover:text-[#111111] hover:bg-black/5'
            }`}
            aria-pressed={isActive}
            aria-label={ariaLabel}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
