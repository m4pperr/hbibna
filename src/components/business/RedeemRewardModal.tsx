'use client';

import { useState } from 'react';
import { X, Gift, CheckCircle2, AlertCircle, ArrowRight, User } from 'lucide-react';
import { redeemRewardAction, type RedemptionActionResult } from '@/actions/rewards';
import type { Customer, Reward } from '@/types/database';

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

  const customerName = currentCustomer?.name || 'Customer';
  const currentBalance = currentCustomer?.points_balance || 0;
  const rewardName = currentReward?.name || 'Reward';
  const costPoints = currentReward?.points_required || 0;
  const remainingPoints = currentBalance - costPoints;
  const hasEnoughPoints = currentBalance >= costPoints;

  const handleConfirmRedemption = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentCustomer?.id || !currentReward?.id) {
      setError('Please select both a customer and a reward.');
      return;
    }

    if (!hasEnoughPoints) {
      setError('Not enough points to redeem this reward.');
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
      setError('An error occurred while confirming reward redemption.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-card">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-[#E6DDCF] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-[#191817] text-base leading-tight truncate">Redeem Reward</h3>
              <p className="text-[11px] text-[#736B63] truncate">Counter gift redemption</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#736B63] hover:text-[#191817] p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {result ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 text-center space-y-5 overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#191817] text-xl">Redemption Successful!</h4>
              <p className="text-sm text-[#736B63]">
                Redeemed <span className="font-bold text-[#191817]">{result.rewardName}</span> for{' '}
                <span className="font-semibold text-[#191817]">{result.customerName}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-1">
              <span className="text-xs text-[#736B63]">Remaining Points Balance:</span>
              <p className="text-3xl font-black text-[#B88E3E]">
                {result.newBalance?.toLocaleString()}{' '}
                <span className="text-sm font-bold text-[#B88E3E]">pts</span>
              </p>
            </div>

            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-[#B88E3E] text-white text-xs font-semibold hover:bg-[#A37B30] shadow-soft transition-colors cursor-pointer min-h-[44px]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirmRedemption} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Customer Selector (if multiple customers available) */}
            {!initialCustomer && customers.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#191817] mb-1.5">
                  Select Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.points_balance} pts)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reward Selector (if multiple rewards available) */}
            {!initialReward && rewards.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-[#191817] mb-1.5">
                  Select Reward
                </label>
                <select
                  value={selectedRewardId}
                  onChange={(e) => setSelectedRewardId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                >
                  {rewards.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.points_required} pts)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Exact User Requested Breakdown */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F] space-y-3 sm:space-y-4">
              {/* Customer Name */}
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#736B63]">
                  Customer
                </span>
                <p className="text-base font-extrabold text-[#191817] mt-0.5">
                  {customerName}
                </p>
              </div>

              {/* Current balance */}
              <div className="pt-2 border-t border-[#DFC99F]/50 flex items-center justify-between">
                <span className="text-xs font-medium text-[#736B63]">Current balance:</span>
                <span className="text-sm font-bold text-[#191817]">
                  {currentBalance.toLocaleString()} points
                </span>
              </div>

              {/* Reward & Cost */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-[#736B63]">Reward:</span>
                  <p className="text-xs font-bold text-[#191817]">{rewardName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-[#736B63]">Cost:</span>
                  <p className="text-xs font-bold text-[#B88E3E]">
                    {costPoints.toLocaleString()} points
                  </p>
                </div>
              </div>

              {/* Remaining */}
              <div className="pt-3 border-t border-[#DFC99F]/70 flex items-center justify-between">
                <span className="text-xs font-bold text-[#191817]">Remaining:</span>
                <span
                  className={`text-base font-black ${
                    hasEnoughPoints ? 'text-[#B88E3E]' : 'text-rose-600'
                  }`}
                >
                  {remainingPoints.toLocaleString()} points
                </span>
              </div>

              {/* Insufficient points warning */}
              {!hasEnoughPoints && (
                <div className="pt-2 text-center text-xs font-bold text-rose-600 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Not enough points to redeem this reward.</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center border border-[#E6DDCF] sm:border-transparent"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading || !hasEnoughPoints || !currentReward}
                className="px-6 py-2.5 text-xs font-bold text-white bg-[#B88E3E] hover:bg-[#A37B30] rounded-xl shadow-soft disabled:opacity-50 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                {loading ? 'Redeeming...' : 'Confirm'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
