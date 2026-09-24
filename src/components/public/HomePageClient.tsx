'use client';

import React from 'react';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { FaqSection } from '@/components/public/FaqSection';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Gift,
  QrCode,
} from 'lucide-react';
import { PricingCards } from '@/components/public/PricingCards';
import { FeatureCarousel } from '@/components/public/FeatureCarousel';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function HomePageClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#191817] selection:bg-[#B88E3E]/20">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E6DDCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Hero Text Column */}
            <div className="lg:col-span-7 space-y-6 text-start">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBF6EB] border border-[#DFC99F]/70 text-[#B88E3E] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#B88E3E]" />
                <span>{t('home.badge')}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#191817] leading-[1.12]">
                {t('home.heroTitle')}{' '}
                <span className="text-[#B88E3E]">{t('home.heroTitleHighlight')}</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#736B63] max-w-xl leading-relaxed">
                {t('home.heroDesc')}
              </p>

              {/* Call to Actions: Primary & Secondary */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-bold text-sm shadow-soft transition-all active:scale-[0.98]"
                >
                  <span>{t('home.startFree')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </Link>

                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#191817] border border-[#E6DDCF] font-bold text-sm transition-colors"
                >
                  <span>{t('home.viewPricing')}</span>
                </Link>
              </div>

              {/* Key Trust Checkmarks */}
              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs font-medium text-[#736B63]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B88E3E]" />
                  <span>{t('home.noApps')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B88E3E]" />
                  <span>{t('home.multiDevice')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B88E3E]" />
                  <span>{t('home.isolatedData')}</span>
                </div>
              </div>
            </div>

            {/* Hero Visual: Polished Digital Loyalty Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm sm:max-w-md">
                {/* Subtle warm glow behind card */}
                <div className="absolute -inset-2 rounded-3xl bg-[#B88E3E]/15 blur-2xl pointer-events-none" />

                {/* Main Digital Loyalty Card Container */}
                <div className="relative rounded-3xl bg-gradient-to-br from-[#191817] via-[#24211D] to-[#191817] text-[#FAF8F5] p-6 sm:p-7 shadow-2xl border border-[#DFC99F]/30 space-y-6">
                  
                  {/* Card Header: Business & Customer */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B88E3E] to-[#DFC99F] flex items-center justify-center text-white shadow-soft">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#DFC99F] block leading-tight">
                          {t('home.cardBrand')}
                        </span>
                        <h4 className="font-extrabold text-sm text-white leading-tight mt-0.5">
                          {t('home.mockCafe')}
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B88E3E]/25 text-[#DFC99F] border border-[#DFC99F]/30">
                      {t('home.memberBadge')}
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <span className="text-xs text-[#FAF8F5]/70 font-medium block">
                      {t('common.customer')}
                    </span>
                    <p className="text-lg font-bold text-white tracking-tight">
                      {t('home.mockCustomer')}
                    </p>
                  </div>

                  {/* Large Points Balance */}
                  <div className="text-center py-2 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-5xl sm:text-6xl font-black text-[#DFC99F] tracking-tight leading-none font-mono">
                      1,250
                    </div>
                    <span className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-[#FAF8F5]/80">
                      {t('home.pointsLabel')}
                    </span>
                  </div>

                  {/* Rewards Preview on Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#DFC99F]">
                        {t('home.yourRewards')}
                      </span>
                      <span className="text-[11px] text-[#FAF8F5]/60">{t('home.unlockedRewards')}</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* Reward 1 */}
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-3.5 h-3.5 text-[#DFC99F]" />
                          <span className="font-bold text-white">{t('home.reward1')}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">
                          {t('home.reward1Status')}
                        </span>
                      </div>

                      {/* Reward 2 */}
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-3.5 h-3.5 text-[#DFC99F]" />
                          <span className="font-bold text-white">{t('home.reward2')}</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">
                          {t('home.reward2Status')}
                        </span>
                      </div>

                      {/* Reward 3 */}
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between opacity-75">
                        <div className="flex items-center gap-2">
                          <Gift className="w-3.5 h-3.5 text-[#DFC99F]/70" />
                          <span className="font-medium text-white/80">{t('home.reward3')}</span>
                        </div>
                        <span className="text-[11px] text-[#FAF8F5]/60">
                          {t('home.reward3Status')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[#FAF8F5]/60 text-[11px]">
                      {t('home.instantAccess')}
                    </span>
                    <div className="flex items-center gap-1.5 text-[#DFC99F] font-semibold text-xs">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{t('home.contactlessQr')}</span>
                    </div>
                  </div>
                </div>

                {/* Clean Floating Activity Tag */}
                <div className="hidden sm:flex absolute -bottom-5 ltr:-left-4 rtl:-right-4 bg-[#FFFFFF] border border-[#E6DDCF] shadow-card rounded-2xl px-4 py-2.5 items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FBF6EB] text-[#B88E3E] flex items-center justify-center font-bold text-xs">
                    +25
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191817]">{t('home.purchaseLabel')}</p>
                    <p className="text-[10px] text-[#736B63]">{t('home.orderAtCheckout')}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E6DDCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
              {t('home.stepFlowBadge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
              {t('home.stepFlowTitle')}
            </h2>
            <p className="text-sm text-[#736B63]">
              {t('home.stepFlowDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-4 hover:border-[#DFC99F] transition-all text-start">
              <span className="text-3xl font-black text-[#B88E3E] block font-mono">
                01
              </span>
              <h3 className="font-extrabold text-xl text-[#191817]">
                {t('home.step1TitleShort')}
              </h3>
              <p className="text-sm text-[#736B63] leading-relaxed">
                {t('home.step1DescShort')}
              </p>
              <div className="pt-2 text-xs text-[#736B63]/80 border-t border-[#E6DDCF]">
                {t('home.step1Sub')}
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-4 hover:border-[#DFC99F] transition-all text-start">
              <span className="text-3xl font-black text-[#B88E3E] block font-mono">
                02
              </span>
              <h3 className="font-extrabold text-xl text-[#191817]">
                {t('home.step2TitleShort')}
              </h3>
              <p className="text-sm text-[#736B63] leading-relaxed">
                {t('home.step2DescShort')}
              </p>
              <div className="pt-2 text-xs text-[#736B63]/80 border-t border-[#E6DDCF]">
                {t('home.step2Sub')}
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-4 hover:border-[#DFC99F] transition-all text-start">
              <span className="text-3xl font-black text-[#B88E3E] block font-mono">
                03
              </span>
              <h3 className="font-extrabold text-xl text-[#191817]">
                {t('home.step3TitleShort')}
              </h3>
              <p className="text-sm text-[#736B63] leading-relaxed">
                {t('home.step3DescShort')}
              </p>
              <div className="pt-2 text-xs text-[#736B63]/80 border-t border-[#E6DDCF]">
                {t('home.step3Sub')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 lg:py-28 bg-[#FAF8F5] border-b border-[#E6DDCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
              {t('home.featuresSectionBadge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
              {t('home.featuresSectionTitle')}
            </h2>
            <p className="text-sm text-[#736B63]">
              {t('home.featuresSectionDesc')}
            </p>
          </div>

          {/* Interactive Feature Card Carousel */}
          <FeatureCarousel />
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E6DDCF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
              {t('home.pricingSectionBadge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
              {t('home.pricingSectionTitle')}
            </h2>
            <p className="text-sm text-[#736B63] max-w-md mx-auto">
              {t('home.pricingSectionDesc')}
            </p>
          </div>

          {/* Interactive Pricing Cards */}
          <PricingCards />
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <FaqSection />

      {/* 6. FINAL CTA SECTION */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#191817] via-[#24211D] to-[#191817] text-white text-center relative overflow-hidden">
        {/* Subtle warm glow elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#B88E3E]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#DFC99F]/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#DFC99F] flex items-center justify-center mx-auto shadow-soft">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {t('home.ctaSubtitle')}{' '}
            <span className="text-[#DFC99F]">{t('home.ctaSubtitleHighlight')}</span>
          </h2>

          <p className="text-base text-[#FAF8F5]/80 max-w-xl mx-auto leading-relaxed">
            {t('home.ctaBottomDesc')}
          </p>

          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-bold text-sm shadow-gold transition-all active:scale-[0.98]"
            >
              <span>{t('home.startFree')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
