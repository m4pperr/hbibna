'use client';

import { useState } from 'react';
import { X, Receipt, CheckCircle2, AlertCircle, Sparkles, User, CloudOff } from 'lucide-react';
import { recordPurchase, type RecordPurchaseResult } from '@/actions/transactions';
import { calculateLoyaltyPoints } from '@/lib/loyalty-engine';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, LoyaltyProgram } from '@/types/database';
import {
  enqueueOfflineTransaction,
  updateLocalCustomerBalance,
  generateClientTransactionId,
} from '@/lib/offline/db';

interface RecordPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  defaultCustomerId?: string;
  businessId?: string;
  loyaltyRule?: LoyaltyProgram | null;
}

export function RecordPurchaseModal({
  isOpen,
  onClose,
  customers,
  defaultCustomerId,
  businessId = 'biz-default-1',
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
    isOffline?: boolean;
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
      setError(
        language === 'ar'
          ? 'يرجى إدخال مبلغ صحيح أكبر من 0 د.ج.'
          : language === 'fr'
          ? 'Veuillez saisir un montant d\'achat valide supérieur à 0 DA.'
          : 'Please enter a valid purchase amount in DA greater than 0.'
      );
      setLoading(false);
      return;
    }

    if (!selectedCustomerId) {
      setError(
        language === 'ar'
          ? 'يرجى اختيار العميل.'
          : language === 'fr'
          ? 'Veuillez sélectionner un client.'
          : 'Please select a customer.'
      );
      setLoading(false);
      return;
    }

    const bizId = businessId || 'biz-default-1';
    const clientTxId = generateClientTransactionId();
    const calculated = calculateLoyaltyPoints(rule, numAmount);
    const pointsToAward = calculated.points;

    // Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        await enqueueOfflineTransaction({
          clientTxId,
          businessId: bizId,
          customerId: selectedCustomerId,
          customerName: selectedCustomer?.name,
          customerPhone: selectedCustomer?.phone,
          amount: numAmount,
          points: pointsToAward,
          transactionType: 'earn',
          description:
            description.trim() ||
            (language === 'ar'
              ? 'شراء دون اتصال'
              : language === 'fr'
              ? 'Achat hors ligne'
              : 'Offline Purchase'),
          createdAt: new Date().toISOString(),
        });

        const newBalance = (selectedCustomer?.points_balance || 0) + pointsToAward;
        await updateLocalCustomerBalance(bizId, selectedCustomerId, newBalance);

        setResult({
          pointsAwarded: pointsToAward,
          newBalance,
          customerName: selectedCustomer?.name || 'Customer',
          isOffline: true,
        });
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed to save offline purchase:', err);
        setError(
          language === 'ar'
            ? 'خطأ أثناء الحفظ المحلي بدون إنترنت.'
            : language === 'fr'
            ? 'Erreur lors de la sauvegarde locale hors ligne.'
            : 'Error saving local offline purchase.'
        );
        setLoading(false);
        return;
      }
    }

    // Online submission with duplicate protection
    try {
      const res: RecordPurchaseResult = await recordPurchase({
        customerId: selectedCustomerId,
        amount: numAmount,
        clientTxId,
        description: description.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.success && res.pointsAwarded !== undefined) {
        const finalBalance = res.newBalance || ((selectedCustomer?.points_balance || 0) + res.pointsAwarded);
        await updateLocalCustomerBalance(bizId, selectedCustomerId, finalBalance).catch(() => {});

        setResult({
          pointsAwarded: res.pointsAwarded,
          newBalance: finalBalance,
          customerName: res.customerName || selectedCustomer?.name || 'Customer',
          isOffline: false,
        });
        setLoading(false);
      }
    } catch {
      // Network drop: fallback to offline queue!
      try {
        await enqueueOfflineTransaction({
          clientTxId,
          businessId: bizId,
          customerId: selectedCustomerId,
          customerName: selectedCustomer?.name,
          customerPhone: selectedCustomer?.phone,
          amount: numAmount,
          points: pointsToAward,
          transactionType: 'earn',
          description: description.trim() || 'Achat hors ligne (connexion perdue)',
          createdAt: new Date().toISOString(),
        });

        const newBalance = (selectedCustomer?.points_balance || 0) + pointsToAward;
        await updateLocalCustomerBalance(bizId, selectedCustomerId, newBalance);

        setResult({
          pointsAwarded: pointsToAward,
          newBalance,
          customerName: selectedCustomer?.name || 'Customer',
          isOffline: true,
        });
        setLoading(false);
      } catch {
        setError(t('common.error'));
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-rounded">
      <div className="bg-white border-2 border-black rounded-[2.5rem] w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-[0_12px_0_#000]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b-2 border-black flex items-center justify-between bg-[#FFE600]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Receipt className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 text-start">
              <h3 className="font-black text-black text-base leading-tight truncate">
                {t('modals.recordPurchaseTitle')}
              </h3>
              <p className="text-[11px] text-black/70 font-bold truncate">
                {t('modals.recordPurchaseDesc')}
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

        {/* Content */}
        {result ? (
          /* Success State */
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-300 text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-black text-2xl">
                {language === 'ar' ? 'تمت إضافة النقاط بنجاح!' : language === 'fr' ? 'Points attribués avec succès !' : 'Points Awarded!'}
              </h4>
              <p className="text-sm text-black/70 font-bold">
                {language === 'ar' ? (
                  <>تمت إضافة <span className="font-black text-black font-mono">+{result.pointsAwarded} {t('common.pts')}</span> إلى حساب <span className="font-black text-black">{result.customerName}</span>.</>
                ) : language === 'fr' ? (
                  <>Crédité de <span className="font-black text-black font-mono">+{result.pointsAwarded} {t('common.pts')}</span> sur le compte de <span className="font-black text-black">{result.customerName}</span>.</>
                ) : (
                  <>Credited <span className="font-black text-black font-mono">+{result.pointsAwarded} {t('common.pts')}</span> to <span className="font-black text-black">{result.customerName}</span>.</>
                )}
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#FFE600] border-2 border-black shadow-[0_4px_0_#000] space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-black/70">
                {t('customer.pointsBalance')}
              </span>
              <p className="text-4xl font-black text-black font-mono">
                {result.newBalance.toLocaleString()}{' '}
                <span className="text-base font-black text-black">{t('common.pts')}</span>
              </p>
            </div>

            {/* Offline notice */}
            {result.isOffline && (
              <div className="p-3 rounded-2xl bg-[#FC851D]/15 border-2 border-black text-black text-xs font-black flex items-center justify-center gap-2 shadow-[0_2px_0_#000] animate-in fade-in">
                <CloudOff className="w-4 h-4 stroke-[2.5] text-[#FC851D] shrink-0" />
                <span className="leading-tight">
                  {language === 'ar'
                    ? 'تم الحفظ محلياً — ستتم المزامنة تلقائياً عند عودة الإنترنت'
                    : language === 'fr'
                    ? 'Enregistré hors ligne — synchronisation automatique dès le retour d\'internet'
                    : 'Saved offline — will sync automatically when back online'}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setResult(null);
                setAmount('');
                setDescription('');
                onClose();
              }}
              className="w-full py-3.5 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-colors cursor-pointer"
            >
              {t('common.confirm')}
            </button>
          </div>
        ) : customers.length === 0 ? (
          /* Empty State if no customers registered yet */
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF9D2] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_3px_0_#000]">
              <User className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-black text-lg">{t('catalog.noResults')}</h4>
              <p className="text-xs text-black/70 font-bold">
                {language === 'ar'
                  ? 'يجب تسجيل عميل واحد على الأقل قبل تسجيل المشتريات.'
                  : language === 'fr'
                  ? 'Vous devez enregistrer au moins un client avant d\'enregistrer des achats.'
                  : 'You need to enroll at least one customer before recording purchases.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000]"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-start">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-300 border-2 border-black text-black text-xs font-black flex items-center gap-2.5 shadow-[0_3px_0_#000]">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Customer */}
            <div>
              <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
                {t('modals.selectCustomer')} <span className="text-red-600">*</span>
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm text-black font-black focus:outline-none shadow-[0_3px_0_#000]"
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
              <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
                {t('modals.purchaseAmountDa')} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="2500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full ltr:pl-4 ltr:pr-12 rtl:pr-4 rtl:pl-12 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-base text-black font-black placeholder:text-black/40 focus:bg-white focus:outline-none shadow-[0_3px_0_#000]"
                  required
                />
                <span className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-xs font-black text-black">
                  {t('common.da')}
                </span>
              </div>
            </div>

            {/* Dynamic Calculation Output */}
            <div className="p-4 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_3px_0_#000] flex flex-col xs:flex-row xs:items-center justify-between gap-1 text-xs">
              <span className="text-black/70 font-bold">{t('modals.pointsToAward')}:</span>
              <div className="flex items-center gap-1.5 font-black text-black text-sm">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {language === 'ar'
                    ? `سيكسب العميل ${previewCalculation.points} نقطة.`
                    : language === 'fr'
                    ? `Le client gagnera ${previewCalculation.points} points.`
                    : `Customer will earn ${previewCalculation.points} points.`}
                </span>
              </div>
            </div>

            {/* Note / Receipt Ref (Optional) */}
            <div>
              <label className="block text-xs font-black text-black/70 mb-1.5">
                {language === 'ar' ? 'ملاحظة (اختياري)' : language === 'fr' ? 'Note / Description (facultatif)' : 'Note / Description (optional)'}
              </label>
              <input
                type="text"
                placeholder={
                  language === 'ar'
                    ? 'مثال: طلب الصندوق، طاولة 3، فاتورة #102'
                    : language === 'fr'
                    ? 'Ex : Commande comptoir, Table 3, ou Facture #102'
                    : 'e.g. Counter order, Table 3, or Invoice #102'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-black bg-white text-sm text-black font-bold focus:outline-none"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-black text-black bg-white hover:bg-[#FFF9D2] rounded-2xl border-2 border-black shadow-[0_2px_0_#000] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-xs font-black text-[#FFE600] bg-black hover:bg-neutral-900 rounded-2xl border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] disabled:opacity-50 transition-all cursor-pointer min-h-[44px] flex items-center justify-center"
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
