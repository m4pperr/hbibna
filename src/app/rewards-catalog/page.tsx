import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { getPublicRewardsCatalog } from '@/lib/data-service';
import { RewardsCatalogClient } from '@/components/public/RewardsCatalogClient';
import { Gift, Sparkles, Store, ShieldCheck, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Public Rewards Catalog — Hbibna',
  description:
    'Discover partner businesses and exclusive loyalty rewards available across the Hbibna customer loyalty network.',
};

export default async function RewardsCatalogPage() {
  const catalogItems = await getPublicRewardsCatalog();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#191817] flex flex-col font-sans selection:bg-[#B88E3E]/20 selection:text-[#191817]">
      <PublicNavbar />

      <main className="flex-1 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#B88E3E]/30 text-[#8C6B28] text-xs font-semibold mb-4 shadow-sm">
            <Gift className="w-3.5 h-3.5 text-[#B88E3E]" />
            <span>Public Merchant Directory</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#191817] leading-tight mb-4">
            Partner Businesses & <br className="hidden sm:inline" />
            <span className="text-[#B88E3E]">Rewards Catalog</span>
          </h1>

          <p className="text-base sm:text-lg text-[#5C554E] leading-relaxed max-w-2xl mx-auto mb-6">
            Browse participating merchants and see the rewards waiting for you. Collect points on your favorite purchases and redeem treats, discounts, and perks.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#8C827A]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#B88E3E]" />
              <span>Public Directory Only</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#B88E3E]" />
              <span>{catalogItems.length} Active Partners</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#B88E3E]" />
              <span>Zero App Download Needed</span>
            </div>
          </div>
        </div>

        {/* Client Interactive Search & Catalog */}
        <RewardsCatalogClient initialItems={catalogItems} />

        {/* Business Callout Banner */}
        <div className="mt-16 bg-white rounded-3xl border border-[#EBE6DE] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B88E3E] uppercase tracking-wider mb-2">
                <Store className="w-3.5 h-3.5" />
                For Business Owners
              </div>
              <h2 className="text-2xl font-bold text-[#191817] mb-2">
                Want your business featured in the rewards catalog?
              </h2>
              <p className="text-sm text-[#5C554E] leading-relaxed">
                Launch your branded digital loyalty program in under 5 minutes. Retain your best customers with transparent, automated rewards.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/signup"
                className="px-6 py-3.5 rounded-xl bg-[#B88E3E] hover:bg-[#9A742E] text-white font-semibold text-sm transition-colors text-center shadow-sm flex items-center justify-center gap-2"
              >
                <span>Register Your Business</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/pricing"
                className="px-6 py-3.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE1] text-[#191817] border border-[#EBE6DE] font-semibold text-sm transition-colors text-center"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
