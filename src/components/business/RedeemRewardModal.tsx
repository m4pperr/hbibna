'use client';

import { useState } from 'react';
import { X, Gift, CheckCircle2, AlertCircle, ArrowRight, User } from 'lucide-react';
import { redeemRewardAction, type RedemptionActionResult } from '@/actions/rewards';
import type { Customer, Reward } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RedeemRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  customers?: Customer[];
  reward?: Reward;
  rewards: Reward[];
}

export function RedeemRewardModal({
  isOpen,
  onClose,
  customer: initialCustomer,
  customers = [],
  reward: initialReward,
  rewards = [],
}: RedeemRewardModalProps) {
  const { t, language } = useLanguage();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomer?.id || (customers[0]?.id ?? '')
  );
  const [selectedRewardId, setSelectedRewardId] = useState<string>(
    initialReward?.id || (rewards[0]?.id ?? '')
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RedemptionActionResult | null>(null);

  if (!isOpen) return null;

  // Active customer and reward references
  const currentCustomer =
    initialCustomer || customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const currentReward =
    initialReward || rewards.find((r) => r.id === selectedRewardId) || rewards[0];

  const customerName = currentCustomer?.name || t('business.customer');
  const currentBalance = currentCustomer?.points_balance || 0;
  const rewardName = currentReward?.name || t('business.reward');
  const costPoints = currentReward?.points_required || 0;
  const remainingPoints = currentBalance - costPoints;
  const hasEnoughPoints = currentBalance >= costPoints;

  const handleConfirmRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentCustomer?.id || !currentReward?.id) {
      setError(
        language === 'ar'
          ? 'يرجى اختيار العميل والمكافأة.'
          : language === 'fr'
          ? 'Veuillez sélectionner un client et une récompense.'
          : 'Please select both a customer and a reward.'
      );
      return;
    }

    if (!hasEnoughPoints) {
      setError(
        language === 'ar'
          ? 'رصيد النقاط غير كافٍ لاستبدال هذه المكافأة.'
          : language === 'fr'
          ? 'Solde de points insuffisant pour cette récompense.'
          : 'Not enough points to redeem this reward.'
      );
      return;
    }

    setLoading(true);

    try {
      const res: RedemptionActionResult = await redeemRewardAction({
        customerId: currentCustomer.id,
        rewardId: currentReward.id,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.success) {
        setResult(res);
        setLoading(false);
      }
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-rounded">
      <div className="bg-white border-2 border-black rounded-[2.5rem] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-[0_12px_0_#000]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b-2 border-black flex items-center justify-between bg-[#FFE600]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Gift className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-black text-base leading-tight truncate">
                {t('modals.redeemRewardTitle')}
              </h3>
              <p className="text-[11px] text-black/70 font-bold truncate">
                {t('modals.redeemRewardDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black bg-white hover:bg-[#FFF9D2] border-2 border-black p-1.5 rounded-xl shadow-[0_2px_0_#000] transition-colors cursor-pointer shrink-0"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        {result ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-300 text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-black text-2xl">
                {t('modals.redemptionSuccess')}
              </h4>
              <p className="text-sm text-black/70 font-bold">
                {result.rewardName} • <span className="font-black text-black">{result.customerName}</span>
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-[#FFF9D2] border-2 border-black space-y-1 shadow-[0_4px_0_#000]">
              <span className="text-xs text-black/70 font-bold uppercase tracking-wider">{t('modals.remainingBalance')}:</span>
              <p className="text-3xl font-black text-black">
                {result.newBalance?.toLocaleString()}{' '}
                <span className="text-sm font-bold text-black/70">{t('common.pts')}</span>
              </p>
            </div>

            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-black text-[#FFE600] border-2 border-black text-xs font-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer min-h-[44px]"
            >
              {t('common.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmRedemption} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-100 border-2 border-black text-rose-950 text-xs font-bold flex items-center gap-2.5 shadow-[0_2px_0_#000]">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Customer Selector (if multiple customers available) */}
            {!initialCustomer && customers.length > 0 && (
              <div>
                <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                  {t('modals.selectCustomer')}
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black focus:outline-none focus:bg-white shadow-[0_2px_0_#000]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.points_balance} {t('common.pts')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reward Selector (if multiple rewards available) */}
            {!initialReward && rewards.length > 0 && (
              <div>
                <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
                  {t('modals.selectReward')}
                </label>
                <select
                  value={selectedRewardId}
                  onChange={(e) => setSelectedRewardId(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black focus:outline-none focus:bg-white shadow-[0_2px_0_#000]"
                >
                  {rewards.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.points_required} {t('common.pts')})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exact User Requested Breakdown */}
            <div className="p-4 sm:p-5 rounded-3xl bg-[#FFF9D2] border-2 border-black space-y-3 sm:space-y-4 shadow-[0_4px_0_#000]">
              {/* Customer Name */}
              <div>
                <span className="text-[11px] uppercase tracking-wider font-black text-black/70">
                  {t('business.customer')}
                </span>
                <p className="text-base font-black text-black mt-0.5">
                  {customerName}
                </p>
              </div>

              {/* Current balance */}
              <div className="pt-2 border-t-2 border-black/20 flex items-center justify-between">
                <span className="text-xs font-bold text-black/70">{t('customer.balance')}:</span>
                <span className="text-sm font-black text-black">
                  {currentBalance.toLocaleString()} {t('business.points')}
                </span>
              </div>

              {/* Reward & Cost */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-black/70">{t('business.reward')}:</span>
                  <p className="text-xs font-black text-black">{rewardName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-black/70">{t('modals.pointsCost')}:</span>
                  <p className="text-xs font-black text-black">
                    {costPoints.toLocaleString()} {t('business.points')}
                  </p>
                </div>
              </div>

              {/* Remaining */}
              <div className="pt-3 border-t-2 border-black/20 flex items-center justify-between">
                <span className="text-xs font-black text-black">{t('modals.remainingPoints')}:</span>
                <span
                  className={`text-base font-black ${
                    hasEnoughPoints ? 'text-black' : 'text-rose-600'
                  }`}
                >
                  {remainingPoints.toLocaleString()} {t('business.points')}
                </span>
              </div>

              {/* Insufficient points warning */}
              {!hasEnoughPoints && (
                <div className="pt-2 text-center text-xs font-black text-rose-600 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 stroke-[2.5]" />
                  <span>{t('modals.insufficientPoints')}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-black text-black bg-white hover:bg-neutral-100 border-2 border-black rounded-2xl shadow-[0_2px_0_#000] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                {t('common.cancel')}
              </button>

              <button
                type="submit"
                disabled={loading || !hasEnoughPoints || !currentReward}
                className="px-6 py-2.5 text-xs font-black text-[#FFE600] bg-black hover:bg-neutral-800 border-2 border-black rounded-2xl shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] disabled:opacity-50 transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                {loading ? t('modals.redeeming') : t('common.confirm')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
