'use client';

import { useState } from 'react';
import { X, Receipt, CheckCircle2, AlertCircle, Sparkles, User } from 'lucide-react';
import { recordPurchase, type RecordPurchaseResult } from '@/actions/transactions';
import { calculateLoyaltyPoints } from '@/lib/loyalty-engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, LoyaltyProgram } from '@/types/database';

interface RecordPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  defaultCustomerId?: string;
  loyaltyRule?: LoyaltyProgram | null;
}

export function RecordPurchaseModal({
  isOpen,
  onClose,
  customers,
  defaultCustomerId,
  loyaltyRule,
}: RecordPurchaseModalProps) {
  const { t, language } = useLanguage();
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    defaultCustomerId || (customers[0]?.id ?? '')
  );
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    pointsAwarded: number;
    newBalance: number;
    customerName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Informational preview calculation based on saved loyalty rules
  const rule = loyaltyRule || {
    rule_type: 'per_currency',
    points_per_currency: 1,
    currency_unit: 100,
    points_per_purchase: 10,
  };

  const parsedAmount = Math.max(0, parseFloat(amount) || 0);
  const previewCalculation = calculateLoyaltyPoints(rule, parsedAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(language === 'ar' ? 'يرجى إدخال مبلغ صحيح أكبر من 0 د.ج.' : 'Please enter a valid purchase amount in DA greater than 0.');
      setLoading(false);
      return;
    }

    if (!selectedCustomerId) {
      setError(language === 'ar' ? 'يرجى اختيار العميل.' : 'Please select a customer.');
      setLoading(false);
      return;
    }

    try {
      const res: RecordPurchaseResult = await recordPurchase({
        customerId: selectedCustomerId,
        amount: numAmount,
        description: description.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.success && res.pointsAwarded !== undefined) {
        setResult({
          pointsAwarded: res.pointsAwarded,
          newBalance: res.newBalance || 0,
          customerName: res.customerName || selectedCustomer?.name || 'Customer',
        });
        setLoading(false);
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
              <Receipt className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-start">
              <h3 className="font-bold text-[#191817] text-base leading-tight truncate">
                {t('modals.recordPurchaseTitle')}
              </h3>
              <p className="text-[11px] text-[#736B63] truncate">
                {t('modals.recordPurchaseDesc')}
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

        {/* Content */}
        {result ? (
          /* Success State */
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#191817] text-xl">
                {language === 'ar' ? 'تمت إضافة النقاط بنجاح!' : 'Points Awarded!'}
              </h4>
              <p className="text-sm text-[#736B63]">
                {language === 'ar' ? 'تمت إضافة ' : 'Credited '}
                <span className="font-bold text-[#B88E3E] font-mono">
                  +{result.pointsAwarded} {t('common.pts')}
                </span>{' '}
                {language === 'ar' ? 'إلى حساب ' : 'to '}
                <span className="font-semibold text-[#191817]">{result.customerName}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F] space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#736B63]">
                {t('customer.pointsBalance')}
              </span>
              <p className="text-3xl font-black text-[#B88E3E] font-mono">
                {result.newBalance.toLocaleString()}{' '}
                <span className="text-sm font-bold text-[#B88E3E]">{t('common.pts')}</span>
              </p>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setAmount('');
                setDescription('');
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-[#B88E3E] text-white text-xs font-semibold hover:bg-[#A37B30] shadow-soft transition-colors cursor-pointer"
            >
              {t('common.confirm')}
            </button>
          </div>
        ) : customers.length === 0 ? (
          /* Empty State if no customers registered yet */
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#736B63] border border-[#E6DDCF] flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-[#191817] text-base">{t('catalog.noResults')}</h4>
              <p className="text-xs text-[#736B63]">
                {language === 'ar' ? 'يجب تسجيل عميل واحد على الأقل قبل تسجيل المشتريات.' : 'You need to enroll at least one customer before recording purchases.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-[#B88E3E] text-white text-xs font-semibold hover:bg-[#A37B30] transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-start">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Customer */}
            <div>
              <label className="block text-xs font-bold text-[#191817] mb-1.5">
                {t('modals.selectCustomer')} <span className="text-[#B88E3E]">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E] font-medium"
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) — {c.points_balance} {t('common.pts')}
                  </option>
                ))}
              </select>
            </div>

            {/* Purchase Amount */}
            <div>
              <label className="block text-xs font-bold text-[#191817] mb-1.5">
                {t('modals.purchaseAmountDa')} <span className="text-[#B88E3E]">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full ltr:pl-3.5 ltr:pr-10 rtl:pr-3.5 rtl:pl-10 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                  required
                />
                <span className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#736B63]">
                  {t('common.da')}
                </span>
              </div>
            </div>

            {/* Dynamic Calculation Output */}
            <div className="p-3.5 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F]/70 flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs">
              <span className="text-[#736B63]">{t('modals.pointsToAward')}:</span>
              <div className="flex items-center gap-1.5 font-bold text-[#B88E3E]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === 'ar'
                    ? `سيكسب العميل ${previewCalculation.points} نقطة.`
                    : `Customer will earn ${previewCalculation.points} points.`}
                </span>
              </div>
            </div>

            {/* Note / Receipt Ref (Optional) */}
            <div>
              <label className="block text-xs font-bold text-[#191817] mb-1.5">
                {language === 'ar' ? 'ملاحظة (اختياري)' : 'Note / Description (optional)'}
              </label>
              <input
                type="text"
                placeholder={language === 'ar' ? 'مثال: طلب الصندوق، طاولة 3، فاتورة #102' : 'e.g. Counter order, Table 3, or Invoice #102'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
              />
            </div>

            {/* Action buttons */}
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
                {loading ? t('modals.recording') : t('modals.recordAndAward')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
