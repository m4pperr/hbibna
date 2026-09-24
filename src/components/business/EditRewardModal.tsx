'use client';

import { useState } from 'react';
import { X, Gift, AlertCircle, Trash2 } from 'lucide-react';
import { updateReward, deleteReward, type RewardActionResult } from '@/actions/rewards';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Reward } from '@/types/database';

interface EditRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward;
}

export function EditRewardModal({ isOpen, onClose, reward }: EditRewardModalProps) {
  const { t, language } = useLanguage();
  const [name, setName] = useState(reward.name);
  const [description, setDescription] = useState(reward.description || '');
  const [pointsRequired, setPointsRequired] = useState(String(reward.points_required));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('pointsRequired', pointsRequired);

    try {
      const res: RewardActionResult = await updateReward(reward.id, formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        onClose();
      }
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const res: RewardActionResult = await deleteReward(reward.id);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        onClose();
      }
    } catch {
      setError(t('common.error'));
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
            <div className="min-w-0 text-start">
              <h3 className="font-bold text-[#191817] text-base leading-tight truncate">
                {t('modals.editRewardTitle')}
              </h3>
              <p className="text-[11px] text-[#736B63] truncate">
                {t('modals.editRewardDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#736B63] hover:text-[#191817] p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-start">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#191817] mb-1.5">
              {t('modals.rewardName')} <span className="text-[#B88E3E]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191817] mb-1.5">
              {t('modals.rewardDescription')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191817] mb-1.5">
              {t('modals.pointsCost')} <span className="text-[#B88E3E]">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
              required
            />
          </div>

          {/* Delete section */}
          <div className="pt-3 border-t border-[#E6DDCF]">
            {confirmDelete ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                <p className="text-xs text-rose-800 font-medium">
                  {t('modals.deleteRewardConfirm')}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {t('common.confirm')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E6DDCF] text-xs font-semibold text-[#736B63] hover:text-[#191817] transition-colors cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('modals.deleteReward')}</span>
              </button>
            )}
          </div>

          {/* Footer buttons */}
          <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center border border-[#E6DDCF] sm:border-transparent"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-[#B88E3E] hover:bg-[#A37B30] rounded-xl shadow-soft disabled:opacity-50 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
