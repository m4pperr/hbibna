'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PricingCardsProps {
  variant?: 'default' | 'friendly';
}

export function PricingCards({ variant = 'friendly' }: PricingCardsProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { t, isRtl, language } = useLanguage();

  const features = [
    t('pricing.feature1'),
    t('pricing.feature2'),
    t('pricing.feature3'),
    t('pricing.feature4'),
    t('pricing.feature5'),
    t('pricing.feature6'),
    t('pricing.feature7'),
    t('pricing.feature8'),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setBillingCycle((prev) => (prev === 'monthly' ? 'annual' : 'monthly'));
    }
  };

  return (
    <div className="space-y-8 max-w-xl mx-auto w-full px-2 sm:px-0 font-rounded">
      {/* BILLING TOGGLE (Segmented Control) */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Billing Cycle Selection"
          className="inline-flex items-center p-1.5 rounded-full bg-white border-2 border-black shadow-[0_4px_0_#000]"
        >
          {/* Monthly Button */}
          <button
            type="button"
            role="tab"
            id="tab-monthly"
            aria-selected={billingCycle === 'monthly'}
            aria-controls="pricing-card"
            tabIndex={billingCycle === 'monthly' ? 0 : -1}
            onClick={() => setBillingCycle('monthly')}
            onKeyDown={handleKeyDown}
            className={`px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[42px] focus:outline-none whitespace-nowrap ${
              billingCycle === 'monthly'
                ? 'bg-black text-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]'
                : 'text-black/70 hover:text-black'
            }`}
          >
            {t('pricing.monthlyBilling')}
          </button>

          {/* Annual Button */}
          <button
            type="button"
            role="tab"
            id="tab-annual"
            aria-selected={billingCycle === 'annual'}
            aria-controls="pricing-card"
            tabIndex={billingCycle === 'annual' ? 0 : -1}
            onClick={() => setBillingCycle('annual')}
            onKeyDown={handleKeyDown}
            className={`relative px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[42px] focus:outline-none whitespace-nowrap ${
              billingCycle === 'annual'
                ? 'bg-black text-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]'
                : 'text-black/70 hover:text-black'
            }`}
          >
            <span>{t('pricing.annualBilling')}</span>

            {/* Small diagonal / rotated promotional sticker badge */}
            <span
              className={`absolute -bottom-2 sm:-bottom-2.5 ${
                isRtl ? 'left-1 sm:left-2 rotate-[12deg]' : 'right-1 sm:right-2 -rotate-[12deg]'
              } px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#FFE600] text-black border border-black shadow-[0_2px_0_#000] whitespace-nowrap pointer-events-none select-none z-10`}
            >
              {t('pricing.saveTwoMonths')}
            </span>
          </button>
        </div>
      </div>

      {/* SINGLE MASTER PRICING CARD */}
      <div
        id="pricing-card"
        role="tabpanel"
        aria-labelledby={billingCycle === 'monthly' ? 'tab-monthly' : 'tab-annual'}
        className="rounded-[2.5rem] p-6 sm:p-9 bg-white border-2 border-black shadow-[0_10px_0_#000] text-start relative overflow-hidden transition-all"
      >
        <div className="absolute top-0 inset-x-0 h-2.5 bg-[#FFE600] border-b-2 border-black" />

        {/* Dynamic Card Content */}
        <div key={billingCycle} className="animate-fade-in space-y-6 pt-3">
          {/* Card Top: Small Label & Plan Title */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              {billingCycle === 'monthly' ? (
                <span className="text-[11px] uppercase font-black tracking-widest text-black/70">
                  {t('pricing.monthlyBilling')}
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-black tracking-widest text-black/70">
                    {t('pricing.annualBilling')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_1px_0_#000]">
                    {t('pricing.saveTwoMonths')}
                  </span>
                </div>
              )}

              <span className="px-3.5 py-1 rounded-full text-[11px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000]">
                {language === 'ar' ? '14 يوماً تجربة مجانية' : language === 'fr' ? '14 jours d’essai gratuit' : '14-day free trial'}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight mt-3">
              {t('pricing.planName')}
            </h3>

            <p className="text-xs sm:text-sm text-black/75 mt-1.5 leading-relaxed font-bold">
              {t('pricing.planDesc')}
            </p>
          </div>

          {/* Price Block */}
          {billingCycle === 'monthly' ? (
            <div className="p-5 rounded-3xl bg-[#FFF9D2] border-2 border-black shadow-[0_4px_0_#000]">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                  {t('pricing.priceMonthly')}
                </span>
                <span className="text-lg font-black text-black">
                  {t('pricing.currency')}
                </span>
                <span className="text-xs sm:text-sm text-black/70 font-bold ms-1">
                  {t('pricing.perMonth')}
                </span>
              </div>
              <p className="text-xs text-black/70 mt-2 font-bold">
                {t('pricing.billedMonthly')}
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-3xl bg-[#FFF9D2] border-2 border-black shadow-[0_4px_0_#000]">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                    {t('pricing.priceAnnual')}
                  </span>
                  <span className="text-lg font-black text-black">
                    {t('pricing.currency')}
                  </span>
                  <span className="text-xs sm:text-sm text-black/70 font-bold ms-1">
                    {t('pricing.perYear')}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-black text-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]">
                  {t('pricing.saveTwoMonths')}
                </span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t-2 border-black/10 flex items-center justify-between text-xs text-black/70 font-bold flex-wrap gap-1">
                <span className="font-black text-black">{t('pricing.billedAnnually')}</span>
              </div>
            </div>
          )}

          {/* Included Features */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-black text-black uppercase tracking-wider block">
              {t('common.features')}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-black font-bold">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-black text-[#FFE600] border border-black">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Get Started CTA Button */}
          <div className="pt-4 border-t-2 border-black/10">
            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-black text-sm transition-all bg-black hover:bg-neutral-800 text-[#FFE600] border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] min-h-[48px]"
            >
              <span>{t('pricing.getStarted')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
