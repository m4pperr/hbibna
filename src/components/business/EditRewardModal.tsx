'use client';

import { useState } from 'react';
import { X, Gift, AlertCircle, Trash2 } from 'lucide-react';
import { updateReward, deleteReward, type RewardActionResult } from '@/actions/rewards';
import type { Reward } from '@/types/database';

interface EditRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward;
}

export function EditRewardModal({ isOpen, onClose, reward }: EditRewardModalProps) {
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
      setError('Failed to update reward.');
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
      setError('Failed to delete reward.');
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
              <h3 className="font-bold text-[#191817] text-base leading-tight truncate">Edit Reward</h3>
              <p className="text-[11px] text-[#736B63] truncate">Update reward details or points cost</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#736B63] hover:text-[#191817] p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#191817] mb-1.5">
              Reward Name <span className="text-[#B88E3E]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191817] mb-1.5">
              Description <span className="font-normal text-[#736B63]">(optional)</span>
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
              Points Required <span className="text-[#B88E3E]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                required
                value={pointsRequired}
                onChange={(e) => setPointsRequired(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#B88E3E]">
                points
              </span>
            </div>
          </div>

          {/* Delete confirmation section */}
          {confirmDelete ? (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
              <p className="text-xs font-bold text-rose-800">
                Are you sure you want to delete this reward?
              </p>
              <p className="text-[11px] text-rose-600">
                This action cannot be undone. Existing redemption history will be preserved.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer min-h-[36px]"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-xs font-medium text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer min-h-[36px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete reward</span>
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-[#E6DDCF] grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center border border-[#E6DDCF] sm:border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#B88E3E] hover:bg-[#A37B30] rounded-xl shadow-soft disabled:opacity-50 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
