'use client';

import Link from 'next/link';
import {
  Sparkles,
  Gift,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CustomerLoyaltyCard } from '@/components/customer/CustomerLoyaltyCard';
import type {
  Customer,
  CustomerBusinessMembership,
  Reward,
  Transaction,
  Business,
} from '@/types/database';

interface CustomerHomeViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership;
  rewards: Reward[];
  transactions: Transaction[];
  business?: Business | null;
  activeQueryStr: string;
}

export function CustomerHomeView({
  customer,
  activeMembership,
  rewards,
  transactions,
  business,
  activeQueryStr,
}: CustomerHomeViewProps) {
  const { t, isRtl, language } = useLanguage();

  const customerName = customer?.name || 'Sarah Benali';
  const activeBusinessName = business?.name || activeMembership.business?.name || 'Commerce Partenaire';
  const pointsBalance = activeMembership.points_balance;

  // Customer transactions for the active business
  const displayActivity =
    transactions.length > 0
      ? transactions.slice(0, 5)
      : [
          { id: '1', points: 25, type: 'earn', description: 'Purchase' },
          { id: '2', points: 50, type: 'earn', description: 'Purchase' },
          { id: '3', points: -500, type: 'redeem', description: 'Reward Redeemed' },
        ];

  return (
    <div className="space-y-8 font-rounded">
      {/* 1. PORTAL HEADER: Focused on Currently Selected Business */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {t('customer.myPass')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
              <Store className="w-3 h-3 stroke-[2.5]" />
              <span>{activeBusinessName}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {activeBusinessName}
          </h1>
          <p className="text-sm text-black/70 font-bold">
            {language === 'ar' ? (
              <>مرحباً بك، <span className="font-black text-black">{customerName}</span>. بطاقة مكافآتك نشطة وجاهزة للاستخدام عند الكاونتر.</>
            ) : language === 'fr' ? (
              <>Bienvenue, <span className="font-black text-black">{customerName}</span>. Votre pass fidélité est actif et prêt à l&apos;emploi en caisse.</>
            ) : (
              <>Welcome back, <span className="font-black text-black">{customerName}</span>. Your rewards pass is active and ready to use at checkout.</>
            )}
          </p>
        </div>

        <Link
          href={`/customer/qr${activeQueryStr}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black hover:bg-neutral-900 text-[#FFE600] text-xs font-black transition-all border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] shrink-0 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-[#FFE600] stroke-[2.5]" />
          <span>{t('customer.myQr')}</span>
        </Link>
      </div>

      {/* 2. ACTIVE DIGITAL LOYALTY CARD (3D CUTOUT PASS) */}
      <CustomerLoyaltyCard
        customer={customer}
        business={business}
        membership={activeMembership}
        activeQueryStr={activeQueryStr}
        showQrStub={true}
      />

      {/* 3. YOUR REWARDS FOR THIS BUSINESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-black tracking-tight">
              {t('customer.availableRewards')}
            </h3>
            <p className="text-xs text-black/70 font-bold">
              {t('customer.exclusivePerks')}
            </p>
          </div>
          <Link
            href={`/customer/rewards${activeQueryStr}`}
            className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000]"
          >
            <span>{t('customer.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 stroke-[2.5]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const canAfford = pointsBalance >= reward.points_required;
            const pointsNeeded = reward.points_required - pointsBalance;

            return (
              <div
                key={reward.id}
                className={`p-5 rounded-3xl border-2 border-black bg-white shadow-[0_6px_0_#000] flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 ${
                  canAfford
                    ? 'bg-[#FFF9D2]'
                    : 'opacity-90'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000] ${
                        canAfford
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-white text-black'
                      }`}
                    >
                      <Gift className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    {canAfford ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-300 text-black border-2 border-black shadow-[0_2px_0_#000]">
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                        <span>{t('customer.ready')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-black border border-black">
                        <Lock className="w-3 h-3" />
                        <span>{pointsNeeded.toLocaleString()} {t('customer.ptsToGo')}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-base text-black tracking-tight">
                      {reward.name}
                    </h4>
                    <p className="text-xs font-black text-black/80 mt-0.5">
                      {reward.points_required.toLocaleString()} {t('business.points')}
                    </p>
                    {reward.description && (
                      <p className="text-xs text-black/70 mt-1 line-clamp-2 font-medium">
                        {reward.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVITY AT THIS BUSINESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-black tracking-tight">
              {t('customer.recentActivity')}
            </h3>
            <p className="text-xs text-black/70 font-bold">
              {t('customer.allTransactions')}
            </p>
          </div>
          <Link
            href={`/customer/activity${activeQueryStr}`}
            className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000]"
          >
            <span>{t('customer.history')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 stroke-[2.5]" />
          </Link>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl shadow-[0_8px_0_#000] divide-y-2 divide-black/10 overflow-hidden font-bold">
          {displayActivity.map((act) => {
            const isEarn = act.points > 0;
            const title =
              act.description ||
              (act as any).title ||
              (isEarn ? t('customer.earnedPts') : t('customer.spentPts'));

            return (
              <div
                key={act.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FFF9D2]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black shadow-[0_2px_0_#000] ${
                      isEarn
                        ? 'bg-emerald-300 text-black'
                        : 'bg-rose-300 text-black'
                    }`}
                  >
                    {isEarn ? (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <span className="font-black text-sm text-black block">
                      {title}
                    </span>
                    <span className="text-[11px] text-black/60 font-semibold">
                      {isEarn ? t('customer.earnedPts') : t('customer.spentPts')}
                    </span>
                  </div>
                </div>

                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <span
                    className={`text-sm font-black font-mono px-2.5 py-1 rounded-xl border border-black/20 ${
                      isEarn ? 'bg-amber-100 text-black' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {isEarn ? `+${act.points}` : act.points}
                  </span>
                  <span className="text-[10px] uppercase font-black text-black/60 block mt-0.5">
                    {t('business.points')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
