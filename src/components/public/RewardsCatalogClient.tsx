'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Gift, Store, Tag, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { PublicBusinessCatalogItem } from '@/lib/data-service';

interface RewardsCatalogClientProps {
  initialItems: PublicBusinessCatalogItem[];
}

export function RewardsCatalogClient({ initialItems }: RewardsCatalogClientProps) {
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
    <div className="w-full">
      {/* Search and Category Filter Controls */}
      <div className="bg-white rounded-2xl border border-[#EBE6DE] p-4 sm:p-6 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C827A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business, category, or reward (e.g. coffee, burger)..."
              className="w-full pl-11 pr-4 py-3 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-sm text-[#191817] placeholder-[#8C827A] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]/30 focus:border-[#B88E3E] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8C827A] hover:text-[#191817] font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Result summary indicator */}
          <div className="text-xs sm:text-sm text-[#8C827A] font-medium shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#191817] font-bold border border-[#EBE6DE]">
              {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
            </span>
            <span>•</span>
            <span>{totalRewardsCount} perks</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-[#F0EBE1] pb-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#191817] text-white shadow-sm'
                : 'bg-[#FAF8F5] text-[#5C554E] hover:bg-[#F2ECE1] border border-[#EBE6DE]'
            }`}
          >
            All Businesses ({initialItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#B88E3E] text-white shadow-sm'
                  : 'bg-[#FAF8F5] text-[#5C554E] hover:bg-[#F2ECE1] border border-[#EBE6DE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Businesses Grid */}
      {filteredBusinesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE6DE] p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#8C827A] flex items-center justify-center mx-auto mb-4 border border-[#EBE6DE]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#191817] mb-1">No rewards found</h3>
          <p className="text-sm text-[#5C554E] mb-6">
            We couldn't find any businesses or rewards matching "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#191817] border border-[#EBE6DE] rounded-xl text-xs font-semibold transition-colors"
          >
            Reset filters
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
                className="bg-white rounded-2xl border border-[#EBE6DE] hover:border-[#B88E3E]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 pb-4 border-b border-[#F4EFEA]">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-center text-[#B88E3E] font-bold text-sm shrink-0">
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
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C827A] uppercase tracking-wider">
                          <Tag className="w-3 h-3 text-[#B88E3E]" />
                          {biz.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-[#191817] text-base leading-tight truncate">
                        {biz.name}
                      </h3>
                      {biz.phone && (
                        <p className="text-xs text-[#8C827A] mt-0.5">{biz.phone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rewards list */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 mb-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8C827A] flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#B88E3E]" />
                      Available Perks ({biz.rewards.length})
                    </p>
                    <div className="space-y-2">
                      {biz.rewards.map((reward) => (
                        <div
                          key={reward.id}
                          className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EBE6DE] flex items-start justify-between gap-3 group/perk hover:border-[#D5C9B3] transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-[#191817] leading-snug">
                              {reward.name}
                            </h4>
                            {reward.description && (
                              <p className="text-[11px] text-[#5C554E] mt-0.5 line-clamp-2 leading-relaxed">
                                {reward.description}
                              </p>
                            )}
                          </div>
                          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full bg-[#B88E3E]/10 border border-[#B88E3E]/30 text-[#8C6B28] font-bold text-[11px]">
                            {reward.points_required.toLocaleString()} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer call to action */}
                  <div className="pt-3 border-t border-[#F4EFEA] flex items-center justify-between text-xs">
                    <span className="text-[#8C827A] inline-flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#B88E3E]" />
                      Active Rewards
                    </span>
                    <Link
                      href="/signup"
                      className="font-semibold text-[#B88E3E] hover:text-[#9A742E] inline-flex items-center gap-1 transition-colors"
                    >
                      Join Hbibna
                      <ArrowRight className="w-3 h-3" />
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
