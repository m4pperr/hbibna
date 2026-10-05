'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Gift, Store, Tag, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { PublicBusinessCatalogItem } from '@/lib/data-service';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RewardsCatalogClientProps {
  initialItems: PublicBusinessCatalogItem[];
}

export function RewardsCatalogClient({ initialItems }: RewardsCatalogClientProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    initialItems.forEach((b) => {
      if (b.category) cats.add(b.category);
    });
    return Array.from(cats);
  }, [initialItems]);

  // Filter businesses and rewards
  const filteredBusinesses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return initialItems.filter((biz) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        biz.category.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      if (!q) return true;

      const matchesName = biz.name.toLowerCase().includes(q);
      const matchesCat = biz.category.toLowerCase().includes(q);
      const matchesReward = biz.rewards.some(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );

      return matchesName || matchesCat || matchesReward;
    });
  }, [initialItems, searchQuery, selectedCategory]);

  const totalRewardsCount = useMemo(() => {
    return filteredBusinesses.reduce((acc, b) => acc + b.rewards.length, 0);
  }, [filteredBusinesses]);

  return (
    <div className="w-full font-rounded">
      {/* Search and Category Filter Controls */}
      <div className="bg-white rounded-3xl border-2 border-black p-5 sm:p-7 shadow-[0_8px_0_#000] mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('catalog.searchPlaceholder')}
              className="w-full ltr:pl-12 ltr:pr-4 rtl:pr-12 rtl:pl-4 py-3.5 bg-[#FFF9D2] border-2 border-black rounded-2xl text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-xs text-black font-black hover:underline"
              >
                {t('common.close')}
              </button>
            )}
          </div>

          {/* Result summary indicator */}
          <div className="text-xs sm:text-sm text-black font-black shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FFDE59] text-black font-black border-2 border-black shadow-[0_2px_0_#000]">
              {filteredBusinesses.length === 1
                ? t('catalog.businessCount', { count: filteredBusinesses.length })
                : t('catalog.businessesCount', { count: filteredBusinesses.length })}
            </span>
            <span>•</span>
            <span className="px-3 py-1 rounded-full bg-black text-white font-black text-xs">
              {t('catalog.perksCount', { count: totalRewardsCount })}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t-2 border-black/10 pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-black transition-all shrink-0 border-2 border-black cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-black text-[#FFE600] shadow-[0_3px_0_#000]'
                : 'bg-white text-black hover:bg-[#FFF9D2] shadow-xs'
            }`}
          >
            {t('catalog.allBusinesses')} ({initialItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-black transition-all shrink-0 border-2 border-black cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-black text-[#FFE600] shadow-[0_3px_0_#000]'
                  : 'bg-white text-black hover:bg-[#FFF9D2] shadow-xs'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Businesses Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-black p-12 text-center max-w-lg mx-auto my-8 shadow-[0_8px_0_#000]">
          <div className="w-16 h-16 rounded-full bg-[#FFDE59] text-black flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[0_4px_0_#000]">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-black mb-1">{t('catalog.noRewardsFound')}</h3>
          <p className="text-sm text-black/75 font-medium mb-6">
            {t('catalog.noRewardsFoundDesc', { query: searchQuery })}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white border-2 border-black rounded-xl text-xs font-black shadow-[0_3px_0_#000] cursor-pointer"
          >
            {t('catalog.resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((biz) => {
            const initials = biz.name
              .split(' ')
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={biz.id}
                className="bg-white rounded-3xl border-2 border-black hover:shadow-[0_12px_0_#000] shadow-[0_8px_0_#000] transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 pb-4 border-b-2 border-black/10">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFDE59] border-2 border-black flex items-center justify-center text-black font-black text-sm shrink-0 shadow-[0_2px_0_#000]">
                      {biz.logo_url ? (
                        <img
                          src={biz.logo_url}
                          alt={biz.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-start">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-black uppercase tracking-wider bg-black/5 px-2 py-0.5 rounded-md border border-black/10">
                          <Tag className="w-3 h-3 text-black" />
                          {biz.category}
                        </span>
                      </div>
                      <h3 className="font-black text-black text-lg leading-tight truncate">
                        {biz.name}
                      </h3>
                      {biz.phone && (
                        <p className="text-xs text-black/60 font-semibold mt-0.5">{biz.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rewards list */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-black" />
                      <span>{t('catalog.availablePerks', { count: biz.rewards.length })}</span>
                    </p>
                    <div className="space-y-2">
                      {biz.rewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="bg-[#FFF9D2] rounded-2xl p-3 border-2 border-black flex items-start justify-between gap-3 group/perk transition-all shadow-[0_2px_0_#000]"
                        >
                          <div className="min-w-0 flex-1 text-start">
                            <h4 className="text-xs font-black text-black leading-snug">
                              {reward.name}
                            </h4>
                            {reward.description && (
                              <p className="text-[11px] text-black/70 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                                {reward.description}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-black border border-black text-[#FFE600] font-black text-[11px]">
                            {reward.points_required.toLocaleString()} {t('common.pts')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer call to action */}
                  <div className="pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs">
                    <span className="text-black font-bold inline-flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('common.active')}</span>
                    </span>
                    <Link
                      href="/signup"
                      className="font-black text-black hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      <span>{t('catalog.joinHbibna')}</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
