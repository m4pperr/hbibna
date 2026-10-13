'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardQuickActions } from '@/components/business/DashboardQuickActions';
import { RecentActivityList } from '@/components/business/RecentActivityList';
import { WelcomeGuide } from '@/components/business/WelcomeGuide';
import { DashboardActivityChart } from '@/components/business/DashboardActivityChart';
import {
  Users,
  Sparkles,
  Gift,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, Transaction, Business } from '@/types/database';

interface DashboardMetrics {
  totalCustomers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalRewards: number;
  businessName?: string;
  recentActivity: Transaction[];
}

export function DashboardClientView({
  metrics,
  customers,
  business,
  transactions,
  hasConfiguredLoyalty = true,
  hasRewards = true,
  hasCustomers = true,
  hasTransactions = false,
}: {
  metrics: DashboardMetrics;
  customers: Customer[];
  business?: Business;
  transactions?: Transaction[];
  hasConfiguredLoyalty?: boolean;
  hasRewards?: boolean;
  hasCustomers?: boolean;
  hasTransactions?: boolean;
}) {
  const { t } = useLanguage();

  // Determine greeting
  const currentHour = new Date().getHours();
  let timeGreeting = t('business.goodMorning');
  if (currentHour >= 12 && currentHour < 18) {
    timeGreeting = t('business.goodAfternoon');
  } else if (currentHour >= 18 || currentHour < 5) {
    timeGreeting = t('business.goodEvening');
  }

  const businessDisplayName = business?.name || metrics.businessName || 'Hbibna Business';

  return (
    <div className="space-y-8 font-rounded">
      {/* Top Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-2">
        <div className="space-y-1 text-start">
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            {timeGreeting}, {businessDisplayName}
          </h1>
          <p className="text-xs sm:text-sm text-black/75 font-semibold">
            {t('business.dashboardSubtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <DashboardQuickActions
          customers={customers}
          businessName={businessDisplayName}
          businessId={business?.id}
        />
      </div>

      {/* Welcome & Onboarding Guide */}
      <WelcomeGuide
        hasConfiguredLoyalty={hasConfiguredLoyalty}
        hasRewards={hasRewards}
        hasCustomers={hasCustomers}
        hasTransactions={hasTransactions}
      />

      {/* 4 Core Statistics Cards (Neo-Brutalist Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Customers */}
        <div className="relative p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#000] text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black/70 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-[0_1px_0_#000]" />
              <span>{t('business.totalCustomers')}</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] transition-transform group-hover:rotate-6">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-black tracking-tight font-mono">
              {metrics.totalCustomers.toLocaleString()}
            </span>
            <p className="text-xs text-black/70 mt-1 font-bold">{t('business.enrolledMembers')}</p>
          </div>
        </div>

        {/* Stat 2: Total Points Issued (Black & Gold VIP Hologram Card) */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-black via-zinc-950 to-neutral-900 text-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#000] text-start overflow-hidden">
          {/* Subtle Guilloche Hatch Lines */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFE600_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <span className="text-xs font-black uppercase tracking-wider text-[#FFE600] flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFE600] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFE600]" />
              </span>
              <span>{t('business.pointsIssued')}</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Sparkles className="w-4 h-4 fill-black stroke-[2.5]" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-[#FFE600] tracking-tight font-mono">
                {metrics.totalPointsIssued.toLocaleString()}
              </span>
              <span className="text-xs font-black text-[#FFE600]">{t('common.pts')}</span>
            </div>
            <p className="text-xs text-zinc-300 mt-1 font-bold">{t('business.awardPoints')}</p>
          </div>
        </div>

        {/* Stat 3: Total Points Redeemed */}
        <div className="relative p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#000] text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black/70 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-[0_1px_0_#000]" />
              <span>{t('business.redeem')}</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Receipt className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-black tracking-tight font-mono">
                {metrics.totalPointsRedeemed.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-black/70">{t('common.pts')}</span>
            </div>
            <p className="text-xs text-black/70 mt-1 font-bold">{t('business.quickRedeem')}</p>
          </div>
        </div>

        {/* Stat 4: Total Rewards */}
        <div className="relative p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#000] text-start">

          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black/70 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 inline-block shadow-[0_1px_0_#000]" />
              <span>{t('business.activeRewards')}</span>
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Gift className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-black tracking-tight font-mono">
              {metrics.totalRewards}
            </span>
            <p className="text-xs text-black/70 mt-1 font-bold">{t('business.rewardsTitle')}</p>
          </div>
        </div>
      </div>

      {/* Activity Chart: Weekly flow of points */}
      <DashboardActivityChart transactions={transactions || metrics.recentActivity} />

      {/* Main Content: Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-start">
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              {t('business.recentActivity')}
            </h2>
            <p className="text-xs sm:text-sm text-black/75 font-semibold">
              {t('business.transactionsSubtitle')}
            </p>
          </div>

          <Link
            href="/transactions"
            className="px-4 py-2 rounded-full bg-black text-[#FFE600] font-black text-xs border-2 border-black shadow-[0_3px_0_#000] hover:scale-105 transition-all inline-flex items-center gap-1.5"
          >
            <span>{t('business.viewAllTransactions')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {/* Activity feed */}
        <RecentActivityList transactions={metrics.recentActivity} />
      </div>
    </div>
  );
}
