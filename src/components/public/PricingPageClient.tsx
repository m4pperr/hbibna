'use client';

import React from 'react';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { PricingCards } from '@/components/public/PricingCards';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function PricingPageClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <PublicNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-14">
            <span className="text-xs uppercase tracking-wider font-bold text-[#B88E3E]">
              {t('pricing.badge')}
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#191817] tracking-tight">
              {t('pricing.title')}
            </h1>
            <p className="text-base text-[#736B63] max-w-lg mx-auto">
              {t('pricing.desc')}
            </p>
          </div>

          {/* Interactive Pricing Cards */}
          <PricingCards />

          {/* FAQ snippet */}
          <div className="mt-16 space-y-6">
            <h3 className="text-lg font-bold text-[#191817] text-center">
              {t('pricing.faqTitle')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] space-y-1.5 text-start">
                <h4 className="text-sm font-semibold text-[#191817]">
                  {t('pricing.faq1Q')}
                </h4>
                <p className="text-xs text-[#736B63]">
                  {t('pricing.faq1A')}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] space-y-1.5 text-start">
                <h4 className="text-sm font-semibold text-[#191817]">
                  {t('pricing.faq2Q')}
                </h4>
                <p className="text-xs text-[#736B63]">
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
