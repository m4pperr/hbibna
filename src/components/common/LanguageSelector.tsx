'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Languages } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'pill' | 'minimal' | 'full' | 'compact';
}

export function LanguageSelector({
  className = '',
  variant = 'pill',
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] border border-[#E6DDCF] transition-all cursor-pointer ${className}`}
        aria-label="Change language"
      >
        <Languages className="w-3.5 h-3.5 text-[#B88E3E]" />
        <span>{language === 'en' ? 'العربية' : 'English'}</span>
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Select language"
      className={`inline-flex items-center p-0.5 rounded-xl bg-[#F3ECE2] border border-[#E6DDCF] select-none text-xs font-bold ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-[#FFFFFF] text-[#191817] shadow-xs font-black'
            : 'text-[#736B63] hover:text-[#191817]'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>

      <span className="text-[#DFC99F] text-[10px] px-0.5">|</span>

      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-sans ${
          language === 'ar'
            ? 'bg-[#FFFFFF] text-[#191817] shadow-xs font-black'
            : 'text-[#736B63] hover:text-[#191817]'
        }`}
        aria-pressed={language === 'ar'}
      >
        العربية
      </button>
    </div>
  );
}
