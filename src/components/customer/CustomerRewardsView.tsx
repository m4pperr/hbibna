'use client';

import { Gift, CheckCircle2, Lock, Sparkles, Store } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, CustomerBusinessMembership, Reward, Business } from '@/types/database';

interface CustomerRewardsViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership;
  rewards: Reward[];
  business?: Business | null;
}

export function CustomerRewardsView({
  customer,
  activeMembership,
  rewards,
  business,
}: CustomerRewardsViewProps) {
  const { t, isRtl } = useLanguage();

  const activeBusinessName = business?.name || activeMembership.business?.name || 'Commerce Partenaire';
  const pointsBalance = activeMembership.points_balance;

  return (
    <div className="space-y-6 font-rounded">
      {/* Page Title */}
      <div className="space-y-1 pb-4 border-b-2 border-black/15">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
            {t('customer.exclusivePerks')}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
            <Store className="w-3 h-3 stroke-[2.5]" />
            <span>{activeBusinessName}</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('customer.availableRewards')}
        </h1>
        <p className="text-sm text-black/70 font-bold">
          {t('customer.redeemAtCounter')} <span className="font-black text-black">{activeBusinessName}</span> {t('customer.forExclusivePerks')}
        </p>
      </div>

      {/* Balance Summary Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FFE600] border-2 border-black shadow-[0_8px_0_#000] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-black/70 block">
            {activeBusinessName} • {t('customer.balance')}
          </span>
          <h2 className="text-base sm:text-lg font-black text-black">
            {customer?.name || 'Sarah Benali'}
          </h2>
        </div>
        <div className={isRtl ? 'text-left' : 'text-right'}>
          <span className="text-3xl sm:text-4xl font-black text-black font-mono">
            {pointsBalance.toLocaleString()}
          </span>
          <span className="text-xs font-black text-black uppercase"> {t('common.pts')}</span>
        </div>
      </div>

      {/* Rewards Catalog */}
      <div className="space-y-4">
        {rewards.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border-2 border-black text-sm text-black/60 font-bold shadow-[0_6px_0_#000]">
            {t('customer.noRewards')}
          </div>
        ) : (
          rewards.map((reward) => {
            const isUnlocked = pointsBalance >= reward.points_required;
            const pointsNeeded = reward.points_required - pointsBalance;
            const percentage = Math.min(
              100,
              Math.round((pointsBalance / reward.points_required) * 100)
            );

            return (
              <div
                key={reward.id}
                className={`p-6 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-4 transition-all ${
                  isUnlocked ? 'bg-[#FFF9D2]' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000] ${
                        isUnlocked
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-white text-black'
                      }`}
                    >
                      <Gift className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-black tracking-tight">
                        {reward.name}
                      </h3>
                      <p className="text-xs font-black text-black/70 mt-0.5">
                        {reward.points_required.toLocaleString()} {t('business.points')}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-emerald-300 text-black border-2 border-black shadow-[0_2px_0_#000]">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{t('customer.ready')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-white text-black border-2 border-black shadow-[0_2px_0_#000]">
                        <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{pointsNeeded.toLocaleString()} {t('customer.ptsToGo')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {reward.description && (
                  <p className="text-xs text-black/70 leading-relaxed font-semibold">
                    {reward.description}
                  </p>
                )}

                {/* Progress bar towards this reward */}
                <div className="space-y-1.5 pt-2 border-t-2 border-black/10">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-black/60">{t('customer.progress')}</span>
                    <span className="font-black text-black">
                      {isUnlocked ? `100% (${t('customer.ready')})` : `${percentage}%`}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#FFF9D2] border-2 border-black overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isUnlocked ? 'bg-black' : 'bg-[#FFE600]'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Redemption Note */}
      <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000] flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-black stroke-[2.5] shrink-0 mt-0.5" />
        <div className="text-xs text-black leading-relaxed font-bold">
          <span className="font-black">{t('customer.howToClaim')} </span>
          {t('customer.howToClaimStep')} ({activeBusinessName})
        </div>
      </div>
    </div>
  );
}
