'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight, User, Sparkles, QrCode } from 'lucide-react';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface PublicNavbarProps {
  variant?: 'default' | 'friendly';
}

export function PublicNavbar({ variant = 'friendly' }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  return (
    <div className="fixed top-2 sm:top-3 left-0 right-0 z-50 flex flex-col items-center px-3 sm:px-4 pointer-events-none font-rounded">
      <header className="max-w-[1280px] w-full pointer-events-auto">
        {/* =========================================================================
            LE PASS CAPSULE PERFORÉ (AUTHENTIC 3-LAYER VIP TICKET NAVBAR)
            Embodying Hbibna's 3-Layer Brand Identity:
            1. Cream Surface (#FAF8F5)
            2. Coral Pink Offset Edge (#E25B6C)
            3. Matte Black Base (#111111)
            ========================================================================= */}
        <div className="relative px-3.5 sm:px-5 lg:px-6 py-2 flex items-center justify-between gap-2 sm:gap-3 bg-[#FAF8F5] rounded-full border-[2.5px] border-[#111111] shadow-[0_4px_0_#E25B6C,0_8px_0_#111111] transition-all">
          {/* Lateral Ticket Notches (Cutout perforations at the capsule extremities) */}
          <div
            className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#EEC044] border-r-[2.5px] border-[#111111] z-20 pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#EEC044] border-l-[2.5px] border-[#111111] z-20 pointer-events-none"
            aria-hidden="true"
          />

          {/* =====================================================================
              1. BRAND LOCKUP: 3D Stacked Ticket Icon + Wordmark
              ===================================================================== */}
          <div className="flex items-center gap-2 shrink-0 ps-0.5">
            <Link href="/" className="flex items-center gap-2 group select-none">
              {/* 3D Stacked Ticket Icon from brand asset */}
              <div className="relative w-8 h-8 sm:w-8.5 sm:h-8.5 flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/hbibna-icon-trimmed.png"
                  alt="Hbibna Icon"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                />
              </div>

              {/* Wordmark with signature Coral Dot */}
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/hbibna-wordmark-screen.png"
                  alt="Hbibna"
                  className="h-5 sm:h-5.5 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Perforated vertical tear divider */}
            <div className="hidden lg:block h-6 border-r-2 border-dashed border-[#111111]/25 ms-1.5" />
          </div>

          {/* =====================================================================
              2. DESKTOP NAVIGATION LINKS (Creative Ticket Micro-States)
              ===================================================================== */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-[12.5px] xl:text-[13px] font-black text-[#111111]">
            <Link
              href="/#loyalty-loop"
              className="relative group px-2 xl:px-2.5 py-1.5 rounded-full whitespace-nowrap text-[#111111]/80 hover:text-[#111111] hover:bg-black/5 transition-all flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E25B6C] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>{isAr ? 'حلقة الولاء' : isFr ? 'La Boucle' : 'Loyalty Loop'}</span>
            </Link>

            <Link
              href="/#demo-simulator"
              className="relative group px-2 xl:px-2.5 py-1.5 rounded-full whitespace-nowrap text-[#111111]/80 hover:text-[#111111] hover:bg-black/5 transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E25B6C] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>{isAr ? 'المحاكي' : isFr ? 'Simulateur' : 'Simulator'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#FFE600] text-[#111111] text-[8px] font-black border border-black/30 font-mono shadow-2xs">
                LIVE
              </span>
            </Link>

            <Link
              href="/#features"
              className="relative group px-2 xl:px-2.5 py-1.5 rounded-full whitespace-nowrap text-[#111111]/80 hover:text-[#111111] hover:bg-black/5 transition-all flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E25B6C] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>{t('nav.features')}</span>
            </Link>

            <Link
              href="/rewards-catalog"
              className="relative group px-2 xl:px-2.5 py-1.5 rounded-full whitespace-nowrap text-[#111111]/80 hover:text-[#111111] hover:bg-black/5 transition-all flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E25B6C] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>{isAr ? 'المكافآت' : isFr ? 'Récompenses' : 'Rewards'}</span>
            </Link>

            <Link
              href="/#pricing"
              className="relative group px-2 xl:px-2.5 py-1.5 rounded-full whitespace-nowrap text-[#111111]/80 hover:text-[#111111] hover:bg-black/5 transition-all flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E25B6C] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>{t('nav.pricing')}</span>
            </Link>

            <Link
              href="/#faq"
              className="relative group px-2 xl:px-2.5 py-1.5 rounded-full whitespace-nowrap text-[#111111]/80 hover:text-[#111111] hover:bg-black/5 transition-all flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E25B6C] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span>{t('nav.faq')}</span>
            </Link>
          </nav>

          {/* =====================================================================
              3. ACTION GROUP: Perforated Divider + Language + VIP Ticket Voucher CTA
              ===================================================================== */}
          <div className="hidden sm:flex items-center gap-1.5 xl:gap-2 shrink-0 pe-1">
            {/* Perforated vertical tear-off divider */}
            <div className="h-6 border-r-2 border-dashed border-[#111111]/25 mx-0.5" />

            {/* Language Selector Punch-card */}
            <LanguageSelector className="scale-85 origin-center" />

            {/* Connexion Button */}
            <Link
              href="/login"
              className="whitespace-nowrap text-xs font-black text-[#111111]/85 hover:text-[#111111] hover:bg-black/5 px-2 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{t('nav.login')}</span>
            </Link>

            {/* =================================================================
                LE TICKET VOUCHER CTA (Bouton Pass VIP avec micro perforation)
                ================================================================= */}
            <Link
              href="/signup"
              className="relative inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-black text-xs transition-all bg-[#111111] hover:bg-[#E25B6C] text-[#FFE600] hover:text-white border-2 border-[#111111] shadow-[0_3px_0_#111111] hover:shadow-[0_4px_0_#111111] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[0_1px_0_#111111] whitespace-nowrap group cursor-pointer overflow-hidden shrink-0"
            >
              {/* Internal micro perforation line */}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{isFr ? 'Commencer' : isAr ? 'ابدأ الآن' : 'Get Started'}</span>
                <span className="h-3.5 border-r border-dashed border-white/30" />
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>

          {/* =====================================================================
              4. MOBILE ACTIONS: Language Selector + Hamburger
              ===================================================================== */}
          <div className="flex lg:hidden items-center gap-1.5">
            <LanguageSelector className="scale-80 origin-center" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-[#111111] text-white hover:bg-[#E25B6C] transition-all border border-[#111111] shadow-xs cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* =====================================================================
            5. MOBILE MENU DROPDOWN (Ticket Voucher Card)
            ===================================================================== */}
        {mobileMenuOpen && (
          <div className="mt-2.5 lg:hidden rounded-[2rem] bg-[#FAF8F5] border-[2.5px] border-[#111111] shadow-[0_5px_0_#E25B6C,0_9px_0_#111111] p-5 space-y-4 animate-in slide-in-from-top-2 duration-150 relative overflow-hidden font-rounded">
            {/* Lateral notches on mobile card */}
            <span className="absolute -left-2.5 top-1/3 w-4 h-4 rounded-full bg-[#EEC044] border-r-2 border-[#111111]" />
            <span className="absolute -right-2.5 top-1/3 w-4 h-4 rounded-full bg-[#EEC044] border-l-2 border-[#111111]" />

            <nav className="flex flex-col space-y-1 text-sm font-black text-[#111111]">
              <Link
                href="/#loyalty-loop"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-[#FFE600] flex items-center justify-between transition-colors"
              >
                <span>{isAr ? 'حلقة الولاء' : isFr ? 'La Boucle de fidélité' : 'Loyalty Loop'}</span>
                <span className="text-xs font-mono text-zinc-400">01</span>
              </Link>
              <Link
                href="/#demo-simulator"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-[#FFE600] flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{isAr ? 'المحاكي المباشر' : isFr ? 'Simulateur interactif' : 'Live Demo'}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#111111] text-[#FFE600] text-[8px] font-mono">LIVE</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">02</span>
              </Link>
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-[#FFE600] flex items-center justify-between transition-colors"
              >
                <span>{t('nav.features')}</span>
                <span className="text-xs font-mono text-zinc-400">03</span>
              </Link>
              <Link
                href="/rewards-catalog"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-[#FFE600] flex items-center justify-between transition-colors"
              >
                <span>{isAr ? 'دليل المكافآت' : isFr ? 'Catalogue des récompenses' : 'Rewards Catalog'}</span>
                <span className="text-xs font-mono text-zinc-400">04</span>
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-[#FFE600] flex items-center justify-between transition-colors"
              >
                <span>{t('nav.pricing')}</span>
                <span className="text-xs font-mono text-zinc-400">05</span>
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl hover:bg-[#FFE600] flex items-center justify-between transition-colors"
              >
                <span>{t('nav.faq')}</span>
                <span className="text-xs font-mono text-zinc-400">06</span>
              </Link>
            </nav>

            <div className="pt-3 border-t-2 border-dashed border-[#111111]/20 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full border-2 border-[#111111] text-xs font-black text-[#111111] bg-white hover:bg-zinc-100 shadow-[0_2px_0_#111111] flex items-center justify-center gap-2"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav.login')}</span>
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-full bg-[#111111] hover:bg-[#E25B6C] text-xs font-black text-[#FFE600] hover:text-white border-2 border-[#111111] shadow-[0_3px_0_#111111] flex items-center justify-center gap-2 transition-colors"
              >
                <span>{t('nav.startWithHbibna')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
