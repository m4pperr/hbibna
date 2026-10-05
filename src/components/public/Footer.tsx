'use client';

import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { LanguageSelector } from '@/components/common/LanguageSelector';

interface PublicFooterProps {
  variant?: 'default' | 'friendly';
}

export function PublicFooter({ variant = 'friendly' }: PublicFooterProps) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const isFriendly = variant === 'friendly';

  if (isFriendly) {
    return (
      <footer className="relative bg-[#0F0F12] text-white pt-16 pb-12 overflow-hidden border-t-4 border-black font-rounded">
        {/* Giant Watermark */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none text-white/[0.04] font-black text-[9rem] sm:text-[14rem] tracking-tighter whitespace-nowrap leading-none"
          aria-hidden="true"
        >
          HBIBNA
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand info */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="inline-flex items-center gap-2">
                <HbibnaLogo size="lg" theme="dark" />
              </Link>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                {t('footer.description')}
              </p>
              <div className="pt-2">
                <LanguageSelector theme="dark" />
              </div>
            </div>

            {/* Business links */}
            <div>
              <h4 className="text-xs uppercase font-black tracking-wider text-[#FFE600] mb-4">
                {t('common.business')}
              </h4>
              <ul className="space-y-2.5 text-sm text-zinc-400 font-bold">
                <li>
                  <Link href="/signup" className="hover:text-white transition-colors">
                    {t('catalog.registerBusiness')}
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    {t('auth.businessTab')}
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-white transition-colors">
                    {t('nav.pricing')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer links */}
            <div>
              <h4 className="text-xs uppercase font-black tracking-wider text-[#FFE600] mb-4">
                {t('common.customer')}
              </h4>
              <ul className="space-y-2.5 text-sm text-zinc-400 font-bold">
                <li>
                  <Link href="/rewards-catalog" className="hover:text-white transition-colors">
                    {t('nav.rewardsCatalog')}
                  </Link>
                </li>
                <li>
                  <Link href="/customer" className="hover:text-white transition-colors">
                    {t('customer.myPass')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <p>© {new Date().getFullYear()} Hbibna Technologies. {t('footer.allRightsReserved')}</p>
            <div className="flex items-center gap-1.5 font-bold">
              <span>{t('footer.madeForAlgeria')}</span>
              <Heart className="w-3.5 h-3.5 text-[#E25B6C] fill-[#E25B6C]" />
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-[#E6DDCF] bg-[#F3ECE2]/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <HbibnaLogo size="md" />
            </Link>
            <p className="text-sm text-[#736B63] max-w-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="pt-2">
              <LanguageSelector theme="dark" />
            </div>
          </div>

          {/* Business links */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#191817] mb-3">
              {t('common.business')}
            </h4>
            <ul className="space-y-2 text-sm text-[#736B63]">
              <li>
                <Link href="/signup" className="hover:text-[#191817] transition-colors">
                  {t('catalog.registerBusiness')}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#191817] transition-colors">
                  {t('auth.businessTab')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#191817] transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer links */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#191817] mb-3">
              {t('common.customer')}
            </h4>
            <ul className="space-y-2 text-sm text-[#736B63]">
              <li>
                <Link href="/rewards-catalog" className="hover:text-[#191817] transition-colors">
                  {t('nav.rewardsCatalog')}
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-[#191817] transition-colors">
                  {t('customer.myPass')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E6DDCF]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736B63]">
          <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
          <div className="flex items-center gap-1.5">
            <span>{t('footer.madeForAlgeria')}</span>
            <Heart className="w-3.5 h-3.5 text-[#B88E3E] fill-[#B88E3E]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
