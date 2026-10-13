'use client';

import Link from 'next/link';
import { CustomerLoyaltyCard } from '@/components/customer/CustomerLoyaltyCard';
import { Store, ArrowLeft, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, CustomerBusinessMembership, Business } from '@/types/database';

interface CustomerQrViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership | null;
  business?: Business | null;
}

export function CustomerQrView({
  customer,
  activeMembership,
  business,
}: CustomerQrViewProps) {
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const isGlobalPass = !business && (!activeMembership || !activeMembership.business_id);
  const activeBusinessName = isGlobalPass
    ? (isAr ? 'حبيبنا • الجواز الموحد' : isFr ? 'Hbibna • Pass Universel' : 'Hbibna • Universal Pass')
    : (business?.name || activeMembership?.business?.name || 'Commerce Partenaire');
  const activeQueryStr = business?.id ? `?b=${business.id}` : '';

  return (
    <div className="space-y-6 max-w-md mx-auto font-rounded text-center">
      {/* 1. Header with Store Badge & Back Link */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b-2 border-black/15">
        <Link
          href={`/customer${activeQueryStr}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-black shadow-[0_2px_0_#000] text-xs font-black text-black hover:bg-neutral-100 active:translate-y-0.5 transition-all"
        >
          {isRtl ? <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" /> : <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />}
          <span>{isAr ? 'الرجوع للرئيسية' : isFr ? 'Retour' : 'Back'}</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600] border-2 border-black shadow-[0_2px_0_#000] text-xs font-black text-black">
          {isGlobalPass ? <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" /> : <Store className="w-3.5 h-3.5 stroke-[2.5]" />}
          <span className="truncate max-w-[150px]">{activeBusinessName}</span>
        </div>
      </div>

      {/* 2. Title & Scanning Prompt */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#E25B6C]">
          {isGlobalPass
            ? (isAr ? 'جواز رقمي موحد' : isFr ? 'Pass Universel Phygital' : 'Universal Phygital Pass')
            : (isAr ? 'بطاقة الولاء الرقمية الرسمية' : isFr ? 'Pass Phygital Officiel' : 'Official Phygital Pass')}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('customer.myQr')}
        </h1>
        <p className="text-xs text-black/70 font-bold max-w-xs mx-auto">
          {isGlobalPass
            ? (isAr
                ? 'أظهر هذا الرمز عند الكاونتر لدى أي متجر شريك للانضمام وكسب النقاط'
                : isFr
                ? 'Présentez ce QR au comptoir de n’importe quel commerce partenaire pour activer vos points.'
                : 'Show this QR code at any participating store counter to earn points.')
            : `${t('customer.qrPresentInstruction')} (${activeBusinessName})`}
        </p>
      </div>

      {/* 3. The 3D Cutout Phygital Pass + Scannable QR Stub */}
      <CustomerLoyaltyCard
        customer={customer}
        business={business}
        membership={activeMembership}
        activeQueryStr={activeQueryStr}
        showQrStub={true}
      />

      {/* 4. Helpful Security & Fast Checkout Callout */}
      <div className={`p-4 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_4px_0_#000] ${isRtl ? 'text-right' : 'text-left'} flex items-start gap-3`}>
        <Sparkles className="w-4 h-4 text-black stroke-[2.5] shrink-0 mt-0.5" />
        <div className="text-xs text-black leading-relaxed font-bold">
          <span className="font-black">{t('customer.fastCheckout')} </span>
          {t('customer.fastCheckoutTip')}
        </div>
      </div>
    </div>
  );
}
