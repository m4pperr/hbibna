'use client';

import { useState } from 'react';
import { Gift, Plus, Edit2 } from 'lucide-react';
import { CreateRewardModal } from './CreateRewardModal';
import { EditRewardModal } from './EditRewardModal';
import { RedeemRewardModal } from './RedeemRewardModal';
import { toggleRewardStatus } from '@/actions/rewards';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Reward, Customer } from '@/types/database';

interface RewardListProps {
  initialRewards: Reward[];
  customers: Customer[];
}

export function RewardList({ initialRewards, customers }: RewardListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [redeemingReward, setRedeemingReward] = useState<Reward | null>(null);
  const { t, language } = useLanguage();

  const handleToggle = async (id: string, currentStatus: boolean) => {
    await toggleRewardStatus(id, !currentStatus);
  };

  return (
    <div className="space-y-6 font-rounded">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-start">
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
            {t('business.rewardsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-black/75 font-semibold">
            {t('business.rewardsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRedeemingReward(initialRewards[0] || null)}
            disabled={initialRewards.length === 0 || customers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFF9D2] text-black text-xs font-black border-2 border-black shadow-[0_3px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-black" />
            <span>{t('business.quickRedeem')}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFE600]" />
            <span>{t('business.createReward')}</span>
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      {initialRewards.length === 0 ? (
        <div className="bg-white border-2 border-black rounded-3xl p-12 text-center space-y-4 shadow-[0_8px_0_#000]">
          <div className="w-16 h-16 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
            <Gift className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-black text-xl">{t('customer.noRewards')}</h3>
            <p className="text-xs text-black/70 font-semibold max-w-sm mx-auto">
              {language === 'ar'
                ? 'أضف أول مكافأة لمتجرك لتحفيز عملائك على تكرار الزيارة وكسب النقاط.'
                : language === 'fr'
                ? 'Ajoutez votre première récompense, comme une boisson offerte ou une réduction, pour fidéliser vos clients réguliers.'
                : 'Add your first reward, like a free beverage or order discount, to start delighting your regulars.'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#FFE600]" />
            <span>{t('business.createReward')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialRewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-6 sm:p-7 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] flex flex-col justify-between space-y-5 transition-all hover:translate-y-[-2px] hover:shadow-[0_12px_0_#000] ${
                reward.is_active ? '' : 'opacity-60 bg-zinc-50'
              }`}
            >
              {/* Top info */}
              <div className="space-y-3.5 text-start">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                    <Gift className="w-6 h-6" />
                  </div>

                  {/* Points requirement badge */}
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-black text-[#FFE600] border border-black shadow-[0_2px_0_#000] font-mono">
                    {reward.points_required.toLocaleString()} {t('common.pts')}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-black text-xl leading-snug">
                    {reward.name}
                  </h3>
                  {reward.description && (
                    <p className="text-xs text-black/70 font-semibold mt-1.5 leading-relaxed">
                      {reward.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t-2 border-black/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingReward(reward)}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:bg-[#FFF9D2] px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('common.edit')}</span>
                  </button>

                  <button
                    onClick={() => handleToggle(reward.id, reward.is_active)}
                    className="text-xs font-black text-black/70 hover:text-black hover:underline px-1.5 py-1 transition-colors cursor-pointer"
                  >
                    {reward.is_active
                      ? language === 'ar'
                        ? 'إيقاف'
                        : language === 'fr'
                        ? 'Suspendre'
                        : 'Pause'
                      : language === 'ar'
                      ? 'تفعيل'
                      : language === 'fr'
                      ? 'Activer'
                      : 'Activate'}
                  </button>
                </div>

                <button
                  onClick={() => setRedeemingReward(reward)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#FFE600] hover:bg-yellow-400 text-black text-xs font-black border-2 border-black shadow-[0_2px_0_#000] transition-all cursor-pointer active:translate-y-0.5 active:shadow-none"
                >
                  <span>{t('business.redeem')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateRewardModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingReward && (
        <EditRewardModal
          isOpen={!!editingReward}
          onClose={() => setEditingReward(null)}
          reward={editingReward}
        />
      )}

      {redeemingReward && (
        <RedeemRewardModal
          isOpen={!!redeemingReward}
          onClose={() => setRedeemingReward(null)}
          reward={redeemingReward}
          rewards={initialRewards}
          customers={customers}
        />
      )}
    </div>
  );
}
