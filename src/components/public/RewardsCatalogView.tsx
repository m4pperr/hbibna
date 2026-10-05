'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Sparkles, Store, ShieldCheck, ArrowRight } from 'lucide-react';
import { RewardsCatalogClient } from '@/components/public/RewardsCatalogClient';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { PublicBusinessCatalogItem } from '@/lib/data-service';

export function RewardsCatalogView({ catalogItems }: { catalogItems: PublicBusinessCatalogItem[] }) {
  const { t } = useLanguage();

  return (
    <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full font-rounded">
      {/* Header Hero */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-black mb-4 border-2 border-black shadow-[0_3px_0_#000]">
          <Gift className="w-3.5 h-3.5 text-[#FFE600]" />
          <span>{t('catalog.badge')}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-tight mb-4">
          {t('catalog.title')}{' '}
          <span className="bg-black text-[#FFE600] px-3 py-0.5 rounded-xl border-2 border-black inline-block mt-1">
            {t('catalog.titleHighlight')}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-black/85 font-medium leading-relaxed max-w-2xl mx-auto mb-6">
          {t('catalog.desc')}
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-black font-bold bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full border-2 border-black shadow-[0_4px_0_#000]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('catalog.directoryOnly')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Store className="w-4 h-4 text-black" />
            <span>{catalogItems.length} {t('catalog.activePartners')}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('catalog.zeroDownload')}</span>
          </div>
        </div>
      </div>

      {/* Client Interactive Search & Catalog */}
      <RewardsCatalogClient initialItems={catalogItems} />

      {/* Business Callout Banner */}
      <div className="mt-16 bg-white rounded-[2.5rem] border-2 border-black p-6 sm:p-10 shadow-[0_12px_0_#000] relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl text-start space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDE59] border-2 border-black text-black text-xs font-black uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>{t('catalog.forBusinessOwners')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              {t('catalog.featuredInCatalog')}
            </h2>
            <p className="text-sm text-black/80 font-medium leading-relaxed">
              {t('catalog.featuredInCatalogDesc')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-1 active:scale-95 transition-all text-center flex items-center justify-center gap-2"
            >
              <span>{t('catalog.registerBusiness')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3.5 rounded-2xl bg-[#FFE600] hover:bg-yellow-400 text-black border-2 border-black font-black text-sm shadow-[0_4px_0_#000] hover:translate-x-1 active:scale-95 transition-all text-center"
            >
              {t('catalog.viewPlans')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
