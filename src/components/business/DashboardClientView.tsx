'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardQuickActions } from '@/components/business/DashboardQuickActions';
import { RecentActivityList } from '@/components/business/RecentActivityList';
import {
  Users,
  Sparkles,
  Gift,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, Transaction } from '@/types/database';

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
}: {
  metrics: DashboardMetrics;
  customers: Customer[];
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

  const businessDisplayName = metrics.businessName || 'Hbibna Business';

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
        <DashboardQuickActions customers={customers} />
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Customers */}
        <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_0_#000] text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black/70">
              {t('business.totalCustomers')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-black tracking-tight font-mono">
              {metrics.totalCustomers.toLocaleString()}
            </span>
            <p className="text-xs text-black/70 mt-1 font-bold">{t('business.enrolledMembers')}</p>
          </div>
        </div>

        {/* Stat 2: Total Points Issued (Highlighted in Black & Gold) */}
        <div className="p-6 rounded-3xl bg-black text-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_0_#000] text-start relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#FFE600]">
              {t('business.pointsIssued')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
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
        <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_0_#000] text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black/70">
              {t('business.redeem')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Receipt className="w-4 h-4" />
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
        <div className="p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-3 transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_0_#000] text-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-black/70">
              {t('business.activeRewards')}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Gift className="w-4 h-4" />
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
