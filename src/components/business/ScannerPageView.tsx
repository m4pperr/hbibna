'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, QrCode, Sparkles, Store, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { ScanCustomerModal } from './ScanCustomerModal';
import type { Business, Customer, LoyaltyProgram } from '@/types/database';

interface ScannerPageViewProps {
  business?: Business | null;
  customers: Customer[];
  loyalty?: LoyaltyProgram | null;
}

export function ScannerPageView({ business, customers, loyalty }: ScannerPageViewProps) {
  const { isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [isScannerOpen, setIsScannerOpen] = useState(true);

  return (
    <div className="space-y-6 max-w-2xl mx-auto font-rounded py-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b-2 border-black/15">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-black shadow-[0_2px_0_#000] text-xs font-black text-black hover:bg-neutral-100 active:translate-y-0.5 transition-all"
        >
          {isRtl ? <ArrowRight className="w-4 h-4 stroke-[2.5]" /> : <ArrowLeft className="w-4 h-4 stroke-[2.5]" />}
          <span>{isAr ? 'العودة للوحة التحكم' : isFr ? 'Retour au tableau de bord' : 'Back to Dashboard'}</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600] border-2 border-black shadow-[0_2px_0_#000] text-xs font-black text-black">
          <Store className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{business?.name || 'Hbibna Business'}</span>
        </div>
      </div>

      {/* Hero Box */}
      <div className="rounded-3xl border-2 border-black bg-white p-6 sm:p-8 shadow-[0_8px_0_#000] text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_4px_0_#000] mx-auto flex items-center justify-center">
          <QrCode className="w-8 h-8 text-black stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-black text-[#FFE600] text-[10px] font-black uppercase tracking-wider shadow-xs inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 stroke-[2.5]" />
            <span>{isAr ? 'كاشير كاونتر' : isFr ? 'Caisse & Scanner' : 'Cashier Counter'}</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black">
            {isAr ? 'مسح رمز عميل حبيبنا' : isFr ? 'Scanner le Pass Client' : 'Scan Customer Pass'}
          </h1>
          <p className="text-xs sm:text-sm text-black/70 font-bold max-w-md mx-auto">
            {isAr
              ? 'امسح رمز الاستجابة السريعة (QR) أو باركود المحفظة للتعرف على العميل، منحه النقاط، أو تسجيله تلقائياً لأول مرة.'
              : isFr
              ? 'Scannez le QR code ou le pass portefeuille pour identifier le client, attribuer des points ou l’affilier automatiquement lors de sa 1ère visite.'
              : 'Scan customer QR or wallet pass to identify, award points, or auto-enroll existing Hbibna members.'}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#FFE600] text-black font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:bg-yellow-400 active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer"
          >
            <QrCode className="w-5 h-5 stroke-[2.5]" />
            <span>{isAr ? 'فتح الكاميرا والماسح' : isFr ? 'Lancer le Scanner' : 'Launch Scanner'}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-black text-xs font-bold text-black/80 flex items-start gap-3 text-start">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-black text-black">
              {isAr ? 'الانتساب التلقائي للعملاء' : isFr ? 'Affiliation Automatique' : 'Auto-Enrollment Guarantee'}
            </div>
            <div>
              {isAr
                ? 'أي عميل مسجل في حبيبنا سيتم ربطه تلقائياً بمتجرك فور مسح بطاقته، دون الحاجة لإعادة إدخال بياناته.'
                : isFr
                ? 'Tout client inscrit sur Hbibna sera automatiquement lié à votre commerce dès le premier scan, sans ressaisie manuelle.'
                : 'Any registered Hbibna member is automatically linked to your business upon first scan.'}
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      <ScanCustomerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        customers={customers}
        businessId={business?.id}
        loyaltyRule={loyalty}
      />
    </div>
  );
}
