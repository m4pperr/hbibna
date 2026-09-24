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
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-start">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191817] tracking-tight">
            {t('business.rewardsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#736B63]">
            {t('business.rewardsSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setRedeemingReward(initialRewards[0] || null)}
            disabled={initialRewards.length === 0 || customers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#191817] text-xs font-semibold border border-[#E6DDCF] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-[#B88E3E]" />
            <span>{t('business.quickRedeem')}</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-bold shadow-soft transition-all cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>{t('business.createReward')}</span>
          </button>
        </div>
      </div>

      {/* Rewards Grid */}
      {initialRewards.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-12 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center mx-auto">
            <Gift className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-[#191817] text-lg">{t('customer.noRewards')}</h3>
            <p className="text-xs text-[#736B63] max-w-sm mx-auto">
              {language === 'ar'
                ? 'أضف أول مكافأة لمتجرك لتحفيز عملائك على تكرار الزيارة وكسب النقاط.'
                : 'Add your first reward, like a free beverage or order discount, to start delighting your regulars.'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B88E3E] text-white text-xs font-bold hover:bg-[#A37B30] shadow-soft transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('business.createReward')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialRewards.map((reward) => (
            <div
              key={reward.id}
              className={`p-6 sm:p-7 rounded-3xl bg-[#FFFFFF] border shadow-card flex flex-col justify-between space-y-5 transition-all hover:border-[#DFC99F] ${
                reward.is_active ? 'border-[#E6DDCF]' : 'border-zinc-200 opacity-60'
              }`}
            >
              {/* Top info */}
              <div className="space-y-3.5 text-start">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center shrink-0 shadow-xs">
                    <Gift className="w-5 h-5" />
                  </div>

                  {/* Points requirement badge in gold */}
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/70 shadow-xs font-mono">
                    {reward.points_required.toLocaleString()} {t('common.pts')}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-[#191817] text-lg leading-snug">
                    {reward.name}
                  </h3>
                  {reward.description && (
                    <p className="text-xs text-[#736B63] mt-1 leading-relaxed">
                      {reward.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-[#E6DDCF] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingReward(reward)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-[#E6DDCF] transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{t('common.edit')}</span>
                  </button>

                  <button
                    onClick={() => handleToggle(reward.id, reward.is_active)}
                    className="text-xs font-medium text-[#736B63] hover:text-[#191817] hover:underline px-1.5 py-1 transition-colors cursor-pointer"
                  >
                    {reward.is_active ? (language === 'ar' ? 'إيقاف' : 'Pause') : (language === 'ar' ? 'تفعيل' : 'Activate')}
                  </button>
                </div>

                <button
                  onClick={() => setRedeemingReward(reward)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-bold shadow-soft transition-all cursor-pointer active:scale-[0.98]"
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
