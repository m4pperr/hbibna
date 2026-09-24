import Link from 'next/link';
import { getDashboardMetrics } from '@/actions/stats';
import { fetchBusinessData } from '@/lib/data-service';
import { DashboardQuickActions } from '@/components/business/DashboardQuickActions';
import { RecentActivityList } from '@/components/business/RecentActivityList';
import {
  Users,
  Sparkles,
  Gift,
  Receipt,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [metrics, data] = await Promise.all([
    getDashboardMetrics(),
    fetchBusinessData(),
  ]);

  // Determine greeting
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 18) {
    timeGreeting = 'Good afternoon';
  } else if (currentHour >= 18 || currentHour < 5) {
    timeGreeting = 'Good evening';
  }

  const businessDisplayName = metrics.businessName || data.business.name || 'Hbibna Business';

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191817] tracking-tight">
            {timeGreeting}, {businessDisplayName}
          </h1>
          <p className="text-xs sm:text-sm text-[#736B63]">
            Track loyalty members, issue points on counter purchases, and redeem rewards.
          </p>
        </div>

        {/* Quick Actions */}
        <DashboardQuickActions customers={data.customers} />
      </div>

      {/* 4 Core Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Customers */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft space-y-3 transition-all hover:border-[#DFC99F]/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#736B63]">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#191817] border border-[#E6DDCF] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#191817] tracking-tight">
              {metrics.totalCustomers.toLocaleString()}
            </span>
            <p className="text-[11px] text-[#736B63] mt-1 font-medium">Enrolled members</p>
          </div>
        </div>

        {/* Stat 2: Total Points Issued (Highlighted in Gold) */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border-2 border-[#DFC99F] shadow-soft space-y-3 relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B88E3E]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B88E3E]">
              Total Points Issued
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/70 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-[#B88E3E] tracking-tight">
                {metrics.totalPointsIssued.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[#B88E3E]">pts</span>
            </div>
            <p className="text-[11px] text-[#736B63] mt-1 font-medium">Awarded on purchases</p>
          </div>
        </div>

        {/* Stat 3: Total Points Redeemed */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft space-y-3 transition-all hover:border-[#DFC99F]/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#736B63]">
              Total Points Redeemed
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#191817] border border-[#E6DDCF] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-[#191817] tracking-tight">
                {metrics.totalPointsRedeemed.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-[#736B63]">pts</span>
            </div>
            <p className="text-[11px] text-[#736B63] mt-1 font-medium">Claimed by regulars</p>
          </div>
        </div>

        {/* Stat 4: Total Rewards */}
        <div className="p-6 rounded-3xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft space-y-3 transition-all hover:border-[#DFC99F]/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#736B63]">
              Total Rewards
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] text-[#191817] border border-[#E6DDCF] flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl sm:text-4xl font-black text-[#191817] tracking-tight">
              {metrics.totalRewards}
            </span>
            <p className="text-[11px] text-[#736B63] mt-1 font-medium">Available catalog items</p>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#191817] tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs text-[#736B63]">
              Live ledger of points earned and rewards redeemed across your counter.
            </p>
          </div>

          <Link
            href="/transactions"
            className="text-xs font-semibold text-[#B88E3E] hover:underline inline-flex items-center gap-1 transition-colors"
          >
            <span>View all transactions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Activity feed */}
        <RecentActivityList transactions={metrics.recentActivity} />
      </div>
    </div>
  );
}
