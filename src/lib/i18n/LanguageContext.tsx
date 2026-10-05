'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { en } from './translations/en';
import { ar } from './translations/ar';
import { fr } from './translations/fr';

export type Language = 'en' | 'ar' | 'fr';
export type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, typeof en> = { en, ar, fr };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = 'en',
}: {
  children: React.ReactNode;
  initialLanguage?: Language;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  const direction: Direction = language === 'ar' ? 'rtl' : 'ltr';
  const isRtl = language === 'ar';

  // Apply attributes to <html>
  const applyHtmlAttributes = useCallback((lang: Language) => {
    if (typeof document !== 'undefined') {
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
      if (lang === 'ar') {
        document.documentElement.classList.add('rtl');
        document.documentElement.classList.remove('ltr');
      } else {
        document.documentElement.classList.add('ltr');
        document.documentElement.classList.remove('rtl');
      }
    }
  }, []);

  // Update language and persist
  const setLanguage = useCallback(
    (newLang: Language) => {
      setLanguageState(newLang);
      applyHtmlAttributes(newLang);

      try {
        localStorage.setItem('hbibna_lang', newLang);
        // Set cookie with 1 year expiry
        document.cookie = `hbibna_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Storage might be restricted
      }

      // Refresh server components to pick up new cookie without full reload
      startTransition(() => {
        router.refresh();
      });
    },
    [applyHtmlAttributes, router]
  );

  const toggleLanguage = useCallback(() => {
    const nextLang: Record<Language, Language> = {
      en: 'fr',
      fr: 'ar',
      ar: 'en',
    };
    setLanguage(nextLang[language]);
  }, [language, setLanguage]);

  // Sync on mount if localStorage has preference different from initial
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hbibna_lang') as Language | null;
      if (stored && (stored === 'en' || stored === 'ar' || stored === 'fr') && stored !== language) {
        setLanguageState(stored);
        applyHtmlAttributes(stored);
      } else {
        applyHtmlAttributes(language);
      }
    } catch {
      applyHtmlAttributes(language);
    }
  }, []); // Run once on mount

  // Translation helper: resolves dot-notated keys (e.g. "common.save", "nav.home")
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value: any = translations[language];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Fallback to English
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let fallbackValue: any = translations.en;
          for (const fb of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fb in fallbackValue) {
              fallbackValue = fallbackValue[fb];
            } else {
              fallbackValue = undefined;
              break;
            }
          }
          value = fallbackValue ?? key;
          break;
        }
      }

      if (typeof value !== 'string') {
        return key;
      }

      if (params) {
        return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
          return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramVal));
        }, value);
      }

      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        direction,
        isRtl,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
