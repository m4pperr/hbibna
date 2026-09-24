'use client';

import { useState } from 'react';
import { X, Gift, AlertCircle } from 'lucide-react';
import { createReward } from '@/actions/rewards';

interface CreateRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRewardModal({ isOpen, onClose }: CreateRewardModalProps) {
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
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-card">
        <div className="px-4 sm:px-6 py-4 border-b border-[#E6DDCF] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FBF6EB] text-[#B88E3E] flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[#191817] text-base truncate">New Loyalty Reward</h3>
              <p className="text-[11px] text-[#736B63] truncate">Define what customers can redeem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#736B63] hover:text-[#191817] p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1.5">
              Reward Name <span className="text-[#B88E3E]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 500 DA Discount or Free Specialty Drink"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1.5">
              Description <span className="font-normal text-[#736B63]">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Valid on any hot beverage. Non-transferable."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1.5">
              Points Required to Redeem <span className="text-[#B88E3E]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                value={pointsRequired}
                onChange={(e) => setPointsRequired(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#B88E3E]">
                points
              </span>
            </div>
          </div>

          <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] rounded-xl transition-colors min-h-[44px] flex items-center justify-center border border-[#E6DDCF] sm:border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#B88E3E] hover:bg-[#A37B30] rounded-xl shadow-soft disabled:opacity-50 transition-colors min-h-[44px] flex items-center justify-center"
            >
              {loading ? 'Creating...' : 'Create Reward'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
