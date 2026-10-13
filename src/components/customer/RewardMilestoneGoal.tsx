'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Gift, Sparkles, CheckCircle2, ArrowRight, Zap, Target } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Reward, LoyaltyProgram } from '@/types/database';

interface RewardMilestoneGoalProps {
  pointsBalance: number;
  rewards: Reward[];
  loyalty?: LoyaltyProgram | null;
  activeQueryStr?: string;
}

export function RewardMilestoneGoal({
  pointsBalance,
  rewards = [],
  loyalty,
  activeQueryStr = '',
}: RewardMilestoneGoalProps) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  // Sort active rewards ascending by points
  const activeRewards = useMemo(() => {
    return [...rewards]
      .filter((r) => r.is_active !== false)
      .sort((a, b) => a.points_required - b.points_required);
  }, [rewards]);

  // Find accessible reward or next target
  const { unlockedReward, nextTargetReward, pointsNeeded, progressPct, estimateText } = useMemo(() => {
    if (activeRewards.length === 0) {
      return {
        unlockedReward: null,
        nextTargetReward: null,
        pointsNeeded: 0,
        progressPct: 0,
        estimateText: null,
      };
    }

    // Check if any reward is already unlocked
    const unlocked = [...activeRewards].reverse().find((r) => pointsBalance >= r.points_required);
    // Next reward to unlock
    const nextTarget = activeRewards.find((r) => r.points_required > pointsBalance);

    if (!nextTarget) {
      // Reached all available rewards!
      return {
        unlockedReward: unlocked || activeRewards[0],
        nextTargetReward: null,
        pointsNeeded: 0,
        progressPct: 100,
        estimateText: null,
      };
    }

    const diff = Math.max(0, nextTarget.points_required - pointsBalance);
    const pct = Math.min(100, Math.max(8, Math.round((pointsBalance / nextTarget.points_required) * 100)));

    // Calculate Dinars or Visits estimate based on business loyalty rule
    let estimate: string | null = null;
    if (loyalty) {
      if (loyalty.rule_type === 'per_currency' && loyalty.points_per_currency > 0) {
        const daEstimated = Math.ceil((diff / loyalty.points_per_currency) * (loyalty.currency_unit || 100));
        estimate = isAr
          ? `حوالي ${daEstimated.toLocaleString()} دج مشتريات`
          : isFr
          ? `environ ${daEstimated.toLocaleString()} DA d'achats`
          : `approx. ${daEstimated.toLocaleString()} DA spend`;
      } else if (loyalty.rule_type === 'per_purchase' && loyalty.points_per_purchase > 0) {
        const visits = Math.ceil(diff / loyalty.points_per_purchase);
        estimate = isAr
          ? `${visits} ${visits > 1 ? 'زيارات للكاونتر' : 'زيارة واحدة'}`
          : isFr
          ? `${visits} ${visits > 1 ? 'passages en caisse' : 'passage en caisse'}`
          : `${visits} ${visits > 1 ? 'store visits' : 'store visit'}`;
      }
    }

    return {
      unlockedReward: unlocked || null,
      nextTargetReward: nextTarget,
      pointsNeeded: diff,
      progressPct: pct,
      estimateText: estimate,
    };
  }, [activeRewards, pointsBalance, loyalty, isAr, isFr]);

  if (activeRewards.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-black rounded-3xl p-5 sm:p-6 shadow-[0_6px_0_#000] text-start font-rounded space-y-4 relative overflow-hidden">
      {/* CASE 1: Client has already unlocked a reward */}
      {unlockedReward && (!nextTargetReward || pointsBalance >= unlockedReward.points_required) ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
                <Sparkles className="w-4 h-4 text-black fill-black" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 block tracking-wider">
                  {isAr ? 'مكافأة جاهزة للاستبدال !' : 'Récompense disponible !'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-black">
                  {unlockedReward.name}
                </h3>
              </div>
            </div>

            <Link
              href={`/customer/rewards${activeQueryStr}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_3px_0_#000] hover:scale-105 transition-all"
            >
              <Gift className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isAr ? 'استلم هديتك' : 'Réclamer en caisse'}</span>
              <ArrowRight className="w-3 h-3 rtl:rotate-180" />
            </Link>
          </div>

          <div className="p-3 rounded-2xl bg-[#FFF9D2] border-2 border-black/20 flex items-center justify-between text-xs font-bold text-black/80">
            <span>
              {isAr
                ? `رصيدك الحالي (${pointsBalance} نقطة) يغطي تكلفة هذه الهدية بالكامل.`
                : `Votre solde actuel (${pointsBalance} pts) couvre totalement ce cadeau.`}
            </span>
            <span className="font-mono font-black text-black shrink-0">
              {unlockedReward.points_required} {t('common.pts')}
            </span>
          </div>
        </div>
      ) : null}

      {/* CASE 2: Client is progressing towards next target reward */}
      {nextTargetReward && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#FFF9D2] border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
                <Target className="w-4 h-4 text-black stroke-[2.5]" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-black/60 block tracking-wider">
                  {isAr ? 'هدفك القادم' : 'Prochain Palier'}
                </span>
                <h3 className="text-sm sm:text-base font-black text-black">
                  {nextTargetReward.name}
                </h3>
              </div>
            </div>

            <div className="text-start sm:text-end">
              <span className="text-xs font-black text-black">
                {isAr ? `متبقي ` : `Plus que `}
                <span className="font-mono text-sm font-black text-black bg-[#FFE600] px-1.5 py-0.5 rounded-md border border-black shadow-[0_1px_0_#000]">
                  {pointsNeeded} pts
                </span>
              </span>
              {estimateText && (
                <p className="text-[11px] font-bold text-black/60 mt-0.5">
                  ({estimateText})
                </p>
              )}
            </div>
          </div>

          {/* Neo-brutalist Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-4 w-full bg-[#FFF9D2] border-2 border-black rounded-full overflow-hidden p-0.5 shadow-inner relative">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-[#FFE600] border-r-2 border-black rounded-full transition-all duration-500 shadow-[0_1px_0_#000] relative"
              >
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,rgba(0,0,0,0.4)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.4)_75%,transparent_75%,transparent)] bg-[length:12px_12px]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-bold text-black/70 px-1 font-mono">
              <span>{pointsBalance} {t('common.pts')}</span>
              <span>{nextTargetReward.points_required} {t('common.pts')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
