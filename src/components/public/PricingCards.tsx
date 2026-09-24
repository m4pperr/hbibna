'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  'Unlimited customers',
  'Custom points rules',
  'Rewards management',
  'Digital loyalty cards',
  'Customer directory',
  'Purchase & points tracking',
  'Customer activity history',
  'Business dashboard & analytics',
  'Contactless QR code scanner',
];

export function PricingCards() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleKeyDown = (e: React.KeyboardEvent, target: 'monthly' | 'annual') => {
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
            onKeyDown={(e) => handleKeyDown(e, 'monthly')}
            className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[42px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA4EE] ${
              billingCycle === 'monthly'
                ? 'bg-[#6BA4EE] text-white shadow-soft font-extrabold'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            Monthly
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
            onKeyDown={(e) => handleKeyDown(e, 'annual')}
            className={`px-3.5 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[42px] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6BA4EE] ${
              billingCycle === 'annual'
                ? 'bg-[#6BA4EE] text-white shadow-soft font-extrabold'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            <span>Annual</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-colors ${
                billingCycle === 'annual'
                  ? 'bg-[#FC851D] text-white shadow-xs'
                  : 'bg-[#FC851D]/15 text-[#FC851D] border border-[#FC851D]/30'
              }`}
            >
              2 months FREE
            </span>
          </button>
        </div>
      </div>

      {/* 1. SINGLE PRICING CARD (Smooth inside transition) */}
      <div
        id="pricing-card"
        role="tabpanel"
        aria-labelledby={billingCycle === 'monthly' ? 'tab-monthly' : 'tab-annual'}
        className="rounded-3xl p-6 sm:p-9 bg-[#FFFFFF] border border-[#E6DDCF] shadow-card hover:border-[#DFC99F] transition-all relative overflow-hidden text-left"
      >
        {/* Dynamic Card Content with Subtle Fast Transition */}
        <div key={billingCycle} className="animate-fade-in space-y-6">
          {/* Card Top: Small Label & Plan Title */}
          <div>
            {billingCycle === 'monthly' ? (
              <span className="text-[11px] uppercase font-bold tracking-widest text-[#736B63] block">
                MONTHLY SUBSCRIPTION
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-widest text-[#0AA95A] block">
                  ANNUAL SUBSCRIPTION
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FC851D] text-white">
                  2 MONTHS FREE
                </span>
              </div>
            )}

            <h3 className="text-2xl sm:text-3xl font-black text-[#191817] tracking-tight mt-1">
              {billingCycle === 'monthly' ? 'Monthly Plan' : 'Annual Plan'}
            </h3>

            <p className="text-xs sm:text-sm text-[#736B63] mt-1.5 leading-relaxed">
              {billingCycle === 'monthly'
                ? 'Flexible month-to-month loyalty system for your business.'
                : 'Everything your business needs for a full year of customer loyalty.'}
            </p>
          </div>

          {/* Price Block */}
          {billingCycle === 'monthly' ? (
            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF]">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-4xl sm:text-5xl font-black text-[#191817] tracking-tight">
                  9,800
                </span>
                <span className="text-lg font-bold text-[#6BA4EE]">DA</span>
                <span className="text-xs sm:text-sm text-[#736B63] font-medium ml-1">/ month</span>
              </div>
              <p className="text-xs text-[#736B63] mt-2 font-medium">
                Billed monthly • Cancel anytime
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F]">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-4xl sm:text-5xl font-black text-[#0AA95A] tracking-tight">
                    98,000
                  </span>
                  <span className="text-lg font-bold text-[#0AA95A]">DA</span>
                  <span className="text-xs sm:text-sm text-[#736B63] font-medium ml-1">/ year</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#FC851D] text-white shadow-xs">
                  2 MONTHS FREE
                </span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-[#DFC99F]/70 flex items-center justify-between text-xs text-[#736B63] flex-wrap gap-1">
                <span className="font-bold text-[#191817]">19,600 DA saved</span>
                <span>compared with monthly billing</span>
              </div>
            </div>
          )}

          {/* Included Features */}
          <div className="space-y-3 pt-1">
            <span className="text-xs font-bold text-[#191817] uppercase tracking-wider block">
              Includes:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-xs text-[#191817]">
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
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
