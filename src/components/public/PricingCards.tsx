'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const { t } = useLanguage();

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
    <div className="space-y-8 max-w-xl mx-auto w-full px-2 sm:px-0">
      {/* 2. BILLING TOGGLE (Segmented Control) */}
      <div className="flex justify-center">
        <div
          role="tablist"
          aria-label="Billing Cycle Selection"
          className="inline-flex items-center p-1.5 bg-[#FAF8F5] border border-[#E6DDCF] rounded-2xl shadow-xs"
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
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[42px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA4EE] ${
              billingCycle === 'monthly'
                ? 'bg-[#6BA4EE] text-white shadow-soft font-extrabold'
                : 'text-[#736B63] hover:text-[#191817]'
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
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[42px] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA4EE] ${
              billingCycle === 'annual'
                ? 'bg-[#6BA4EE] text-white shadow-soft font-extrabold'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            <span>{t('pricing.annualBilling')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-[#FC851D] text-white shadow-xs'
                  : 'bg-[#FC851D]/15 text-[#FC851D] border border-[#FC851D]/30'
              }`}
            >
              {t('pricing.saveTwoMonths')}
            </span>
          </button>
        </div>
      </div>

      {/* 1. SINGLE PRICING CARD (Smooth inside transition) */}
      <div
        id="pricing-card"
        role="tabpanel"
        aria-labelledby={billingCycle === 'monthly' ? 'tab-monthly' : 'tab-annual'}
        className="rounded-3xl p-6 sm:p-9 bg-[#FFFFFF] border border-[#E6DDCF] shadow-card hover:border-[#DFC99F] transition-all relative overflow-hidden text-start"
      >
        {/* Dynamic Card Content with Subtle Fast Transition */}
        <div key={billingCycle} className="animate-fade-in space-y-6">
          {/* Card Top: Small Label & Plan Title */}
          <div>
            {billingCycle === 'monthly' ? (
              <span className="text-[11px] uppercase font-bold tracking-widest text-[#736B63] block">
                {t('pricing.monthlyBilling')}
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#0AA95A] block">
                  {t('pricing.annualBilling')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FC851D] text-white">
                  {t('pricing.saveTwoMonths')}
                </span>
              </div>
            )}

            <h3 className="text-2xl sm:text-3xl font-black text-[#191817] tracking-tight mt-1">
              {t('pricing.planName')}
            </h3>

            <p className="text-xs sm:text-sm text-[#736B63] mt-1.5 leading-relaxed">
              {t('pricing.planDesc')}
            </p>
          </div>

          {/* Price Block */}
          {billingCycle === 'monthly' ? (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF]">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl sm:text-5xl font-black text-[#191817] tracking-tight">
                  {t('pricing.priceMonthly')}
                </span>
                <span className="text-lg font-bold text-[#6BA4EE]">{t('pricing.currency')}</span>
                <span className="text-xs sm:text-sm text-[#736B63] font-medium ms-1">{t('pricing.perMonth')}</span>
              </div>
              <p className="text-xs text-[#736B63] mt-2 font-medium">
                {t('pricing.billedMonthly')}
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F]">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-[#0AA95A] tracking-tight">
                    {Number(t('pricing.priceAnnual')) * 12}
                  </span>
                  <span className="text-lg font-bold text-[#0AA95A]">{t('pricing.currency')}</span>
                  <span className="text-xs sm:text-sm text-[#736B63] font-medium ms-1">/ {t('common.annual')}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FC851D] text-white shadow-xs">
                  {t('pricing.saveTwoMonths')}
                </span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-[#DFC99F]/70 flex items-center justify-between text-xs text-[#736B63] flex-wrap gap-1">
                <span className="font-bold text-[#191817]">{t('pricing.billedAnnually')}</span>
              </div>
            </div>
          )}

          {/* Included Features */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-bold text-[#191817] uppercase tracking-wider block">
              {t('common.features') || 'Features'}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-[#191817]">
                  <div className="w-4 h-4 rounded-full bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/70 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span className="leading-snug">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Get Started CTA Button */}
          <div className="pt-4 border-t border-[#E6DDCF]">
            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 sm:py-4 rounded-xl font-bold text-sm bg-[#B88E3E] hover:bg-[#A37B30] text-white shadow-gold transition-all active:scale-[0.98] min-h-[48px]"
            >
              <span>{t('pricing.getStarted')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
