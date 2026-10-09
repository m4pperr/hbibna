'use client';

import { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, Phone, Mail, User, Tag } from 'lucide-react';
import { createCustomer, type CreateCustomerResult } from '@/actions/customers';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ isOpen, onClose }: AddCustomerModalProps) {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCustomer, setSuccessCustomer] = useState<{ name: string; phone: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('email', email);
    if (referralCode.trim()) {
      formData.append('referral_code', referralCode.trim());
    }

    try {
      const res: CreateCustomerResult = await createCustomer(formData);
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccessCustomer({ name, phone });
        setTimeout(() => {
          onClose();
          setSuccessCustomer(null);
          setName('');
          setPhone('');
          setEmail('');
        }, 1400);
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
              <UserPlus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0 text-start">
              <h3 className="font-black text-black text-base leading-tight truncate">
                {t('modals.addCustomerTitle')}
              </h3>
              <p className="text-[11px] text-black/70 font-bold truncate">
                {t('modals.addCustomerDesc')}
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
        {successCustomer ? (
          <div className="p-6 sm:p-8 text-center space-y-3 overflow-y-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-300 text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="font-black text-black text-2xl">
              {language === 'ar' ? 'تم تسجيل العميل بنجاح!' : language === 'fr' ? 'Client inscrit avec succès !' : 'Customer Enrolled!'}
            </h4>
            <p className="text-sm text-black/70 font-bold">
              <span className="font-black text-black">{successCustomer.name}</span>{' '}
              {language === 'ar'
                ? 'تمت إضافته إلى برنامج الولاء برصيد 0 نقطة.'
                : language === 'fr'
                ? 'a été ajouté à votre programme avec 0 point.'
                : 'has been added to your loyalty program with 0 points.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-start">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-300 border-2 border-black text-black text-xs font-black flex items-center gap-2.5 shadow-[0_3px_0_#000]">
                <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
                {t('modals.fullName')} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-black/50 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'سارة بن علي' : 'Sarah Benali'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm text-black font-black placeholder:text-black/40 focus:bg-white focus:outline-none shadow-[0_3px_0_#000]"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
                {t('modals.phoneNumber')} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-black/50 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="0550 12 34 56"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm text-black font-black placeholder:text-black/40 focus:bg-white focus:outline-none shadow-[0_3px_0_#000] dir-ltr text-start"
                  required
                />
              </div>
              <p className="text-[11px] text-black/60 mt-1 font-semibold">
                {language === 'ar'
                  ? 'يُستخدم للتعرف على العميل وبطاقتهم الرقمية.'
                  : language === 'fr'
                  ? 'Utilisé pour identifier le client et retrouver sa carte de fidélité.'
                  : 'Used to identify the customer and look up their loyalty card.'}
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
                {t('modals.emailOptional')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-black/50 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm text-black font-bold placeholder:text-black/40 focus:bg-white focus:outline-none shadow-[0_3px_0_#000]"
                />
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-black uppercase tracking-wide">
                  {language === 'ar' ? 'كود الإحالة (اختياري)' : language === 'fr' ? 'Code de parrainage (optionnel)' : 'Referral Code (Optional)'}
                </label>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                  {language === 'ar' ? '+نقاط للطرفين' : language === 'fr' ? '+Points pour les deux' : '+Bonus Points'}
                </span>
              </div>
              <div className="relative">
                <Tag className="w-4 h-4 text-black/50 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="HB-XXXXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm text-black font-mono font-black uppercase tracking-wider placeholder:text-black/40 focus:bg-white focus:outline-none shadow-[0_3px_0_#000]"
                />
              </div>
              <p className="text-[11px] text-black/60 mt-1 font-semibold">
                {language === 'ar'
                  ? 'إذا تم إدخاله، يحصل الصديق والمُحيل على نقاط مكافأة فورية.'
                  : language === 'fr'
                  ? 'Si renseigné, le parrain et le nouveau client reçoivent des points bonus.'
                  : 'If provided, both the referrer and new customer earn bonus points.'}
              </p>
            </div>

            {/* Zero Points Starting Notice */}
            <div className="p-3.5 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-between text-xs font-black">
              <span className="text-black/80">
                {language === 'ar'
                  ? 'رصيد النقاط الأولي:'
                  : language === 'fr'
                  ? 'Solde initial de points :'
                  : 'Starting Points Balance:'}
              </span>
              <span className="font-mono text-sm text-black bg-white px-2 py-0.5 rounded-lg border border-black">
                {referralCode.trim() ? '+25 (Bonus)' : '0'} {t('common.pts')}
              </span>
            </div>

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
                {loading ? t('modals.savingCustomer') : t('modals.enrollCustomer')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
