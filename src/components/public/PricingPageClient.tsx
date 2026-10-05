'use client';

import React from 'react';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { PricingCards } from '@/components/public/PricingCards';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function PricingPageClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FFDE59] font-rounded selection:bg-black selection:text-[#FFDE59]">
      <PublicNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-14">
            <span className="inline-block px-4 py-1.5 rounded-full bg-black text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[0_3px_0_#000]">
              {t('pricing.badge')}
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tight">
              {t('pricing.title')}
            </h1>
            <p className="text-base sm:text-lg text-black/80 font-medium max-w-lg mx-auto">
              {t('pricing.desc')}
            </p>
          </div>

          {/* Interactive Pricing Cards */}
          <PricingCards />

          {/* FAQ snippet */}
          <div className="mt-16 space-y-6">
            <h3 className="text-2xl font-black text-black text-center">
              {t('pricing.faqTitle')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-2 text-start">
                <h4 className="text-base font-black text-black">
                  {t('pricing.faq1Q')}
                </h4>
                <p className="text-sm text-black/75 font-medium leading-relaxed">
                  {t('pricing.faq1A')}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-2 text-start">
                <h4 className="text-base font-black text-black">
                  {t('pricing.faq2Q')}
                </h4>
                <p className="text-sm text-black/75 font-medium leading-relaxed">
                  {t('pricing.faq2A')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
