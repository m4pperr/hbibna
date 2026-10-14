'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id: string;
    passId?: string;
    global_pass_id?: string;
    name?: string;
  } | null;
  passId?: string;
  customerName?: string;
  businessName?: string;
}

/**
 * QRCodeModal Component
 * Prominently displays the authenticated user's QR code bound directly to currentUser.passId
 */
export function QRCodeModal({
  isOpen,
  onClose,
  currentUser,
  passId,
  customerName,
  businessName,
}: QRCodeModalProps) {
  const { isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  if (!isOpen) return null;

  const effectivePassId =
    currentUser?.id ||
    currentUser?.passId ||
    currentUser?.global_pass_id ||
    passId ||
    '';

  const qrPayload = effectivePassId ? `HB-USER-${effectivePassId}` : 'HB-USER-GUEST';
  if (typeof window !== 'undefined') {
    console.log("GENERATED QR PAYLOAD:", currentUser?.id || currentUser?.passId || effectivePassId);
  }
  const displayName = currentUser?.name || customerName || (isAr ? 'العميل' : 'Client');
  const displayStore = businessName || (isAr ? 'حبيبنا • الجواز الموحد' : 'Pass Hbibna Universel');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-sm rounded-3xl bg-white border-2 border-black shadow-[0_12px_0_#000] p-6 text-center space-y-5 z-10 animate-in zoom-in-95 duration-150 font-rounded">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black flex items-center justify-center text-black cursor-pointer shadow-xs"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        <div className="space-y-1 pt-2">
          <span className="px-3 py-1 rounded-full bg-[#FFE600] text-black text-[10px] font-black uppercase border border-black shadow-xs inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 stroke-[2.5]" />
            <span>{isAr ? 'رمز الكاونتر الموحد' : isFr ? 'QR Code Caisse Rapide' : 'Counter QR Pass'}</span>
          </span>
          <h3 className="text-xl font-black text-black">
            {displayName}
          </h3>
          <p className="text-xs text-black/70 font-bold">
            {displayStore}
          </p>
        </div>

        {/* High-Contrast Large QR Container */}
        <div className="p-4 bg-[#FFF9D2] rounded-3xl border-2 border-black shadow-[0_4px_0_#000] flex flex-col items-center justify-center space-y-3">
          <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-xs">
            <QRCodeSVG
              value={qrPayload}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>
          <span className="font-mono text-xs font-black text-black bg-white px-3 py-1 rounded-xl border border-black shadow-xs">
            {effectivePassId ? `HB-${effectivePassId.replace(/-/g, '').slice(0, 6).toUpperCase()}-DZ` : 'HB-PASS-DZ'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-neutral-50 border-2 border-black text-xs font-bold text-black/80 flex items-start gap-2.5 text-start">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            {isAr
              ? 'أظهر هذا الرمز للكاشير عند الكاونتر لتسجيل زيارتك أو الانضمام تلقائياً.'
              : isFr
              ? 'Présentez ce QR code en caisse pour enregistrer vos points ou rejoindre automatiquement le commerce.'
              : 'Show this QR code at checkout counter to collect points or join automatically.'}
          </span>
        </div>
      </div>
    </div>
  );
}
