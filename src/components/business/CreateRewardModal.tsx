'use client';

import { useState } from 'react';
import { X, Gift, AlertCircle } from 'lucide-react';
import { createReward } from '@/actions/rewards';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CreateRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRewardModal({ isOpen, onClose }: CreateRewardModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsRequired, setPointsRequired] = useState('50');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const res = await createReward(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setName('');
        setDescription('');
        setPointsRequired('50');
        onClose();
      }
    } catch {
      setError(t('common.error'));
    } finally {
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
            <div className="min-w-0 text-start">
              <h3 className="font-black text-black text-base truncate">
                {t('modals.createRewardTitle')}
              </h3>
              <p className="text-[11px] text-black/70 font-bold truncate">
                {t('modals.createRewardDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black bg-white hover:bg-[#FFF9D2] border-2 border-black p-1.5 rounded-xl shadow-[0_2px_0_#000] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-start">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-100 border-2 border-black text-rose-950 text-xs font-bold flex items-center gap-2.5 shadow-[0_2px_0_#000]">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              {t('modals.rewardName')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('modals.rewardNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black focus:outline-none focus:bg-white shadow-[0_2px_0_#000]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              {t('modals.rewardDescription')}
            </label>
            <textarea
              rows={2}
              placeholder={t('modals.rewardDescriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black focus:outline-none focus:bg-white shadow-[0_2px_0_#000] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-black uppercase tracking-wider mb-1.5">
              {t('modals.pointsCost')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder={t('modals.pointsCostPlaceholder')}
              value={pointsRequired}
              onChange={(e) => setPointsRequired(e.target.value)}
              className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-black text-black focus:outline-none focus:bg-white shadow-[0_2px_0_#000]"
              required
            />
          </div>

          <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-black text-black bg-white hover:bg-neutral-100 border-2 border-black rounded-2xl shadow-[0_2px_0_#000] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-black text-[#FFE600] bg-black hover:bg-neutral-800 border-2 border-black rounded-2xl shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] disabled:opacity-50 transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
