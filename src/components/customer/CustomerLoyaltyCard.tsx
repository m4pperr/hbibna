'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Sparkles,
  QrCode,
  Wifi,
  CheckCircle2,
  Star,
  ShieldCheck,
  ArrowRight,
  Store,
  Smartphone,
  Check,
  Gift,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { generateDynamicQrToken, QR_ROTATION_INTERVAL_SECONDS } from '@/lib/qr-security';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { getOrCreateCustomerWallet } from '@/actions/wallet';
import { PhoneInput } from '@/components/common/PhoneInput';
import { normalizePhoneNumber } from '@/lib/phone';
import type { Customer, Business, CustomerBusinessMembership } from '@/types/database';

interface CustomerLoyaltyCardProps {
  customer: Customer | null;
  business?: Business | null;
  membership?: CustomerBusinessMembership | null;
  pointsBalance?: number;
  activeQueryStr?: string;
  showQrStub?: boolean;
}

export function CustomerLoyaltyCard({
  customer,
  business,
  membership,
  pointsBalance: overridePoints,
  activeQueryStr = '',
  showQrStub = true,
}: CustomerLoyaltyCardProps) {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const initialSerial =
    membership?.wallet_serial_number || customer?.wallet_serial_number;
  const initialShareUrl =
    membership?.wallet_share_url || customer?.wallet_share_url;
  const initialGoogleUrl =
    membership?.wallet_google_url || customer?.wallet_google_url;

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [walletAdded, setWalletAdded] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [walletData, setWalletData] = useState<{
    shareUrl?: string;
    googleSaveUrl?: string;
    applePassUrl?: string;
  } | null>(() => {
    if (initialSerial || initialShareUrl) {
      return {
        shareUrl: initialShareUrl || (initialSerial ? `https://pass.walletwallet.dev/p/${initialSerial}` : undefined),
        googleSaveUrl: initialGoogleUrl || undefined,
        applePassUrl: initialSerial ? `https://api.walletwallet.dev/p/${initialSerial}/apple.pkpass` : undefined,
      };
    }
    return null;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const effectivePhone =
    customer?.phone ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('phone') || ''
      : '') ||
    phoneInput;

  const customerName = customer?.name || (isAr ? 'العميل' : 'Client');
  const activeBusinessName =
    business?.name || membership?.business?.name || (isAr ? 'المتجر الشريك' : 'Commerce Partenaire');
  const points =
    overridePoints !== undefined
      ? overridePoints
      : membership?.points_balance !== undefined
      ? membership.points_balance
      : customer?.points_balance || 0;

  // Tier visual configuration
  const tierConfig =
    points >= 1500
      ? {
          tier: isAr ? 'بطاقة النخبة VIP' : isFr ? 'Pass Élite VIP' : 'VIP Elite Pass',
          badge: 'ELITE VIP',
          frameBg: '#1A1A1A',
          accentGrad: 'from-[#38BDF8] via-[#818CF8] to-[#C084FC]',
        }
      : points >= 500
      ? {
          tier: isAr ? 'بطاقة بريفيليدج' : isFr ? 'Pass Privilège' : 'Privilege Pass',
          badge: 'PRIVILÈGE',
          frameBg: '#E25B6C',
          accentGrad: 'from-[#F43F5E] via-[#FB7185] to-[#FBBF24]',
        }
      : {
          tier: isAr ? 'بطاقة ذهبية VIP' : isFr ? 'Pass Or VIP' : 'Gold VIP Pass',
          badge: 'VIP GOLD',
          frameBg: '#EEC044',
          accentGrad: 'from-[#4ADE80] via-[#F472B6] to-[#EEC044]',
        };

  // Next reward & target points calculation for maximum customer clarity
  const nextTierTarget =
    points >= 1500 ? 2500 : points >= 500 ? 1500 : 500;

  const pointsRemaining = Math.max(0, nextTierTarget - points);

  const progressPercent = Math.min(100, Math.round((points / nextTierTarget) * 100));

  const nextRewardTitle =
    points >= 1500
      ? isAr
        ? 'هدية حصرية VIP & تجربة خاصة'
        : isFr
        ? 'Cadeau VIP Élite & Boisson'
        : 'Exclusive VIP Gift & Beverage'
      : points >= 500
      ? isAr
        ? 'هدية حصرية أو مشروب مجاني'
        : isFr
        ? 'Cadeau Privilège ou Boisson Offerte'
        : 'Free Gift or Beverage'
      : isAr
      ? 'خصم 20% على طلبك القادم'
      : isFr
      ? 'Remise 20% sur la commande'
      : '20% Off Next Order';

  // Dynamic Ephemeral Anti-Fraud QR Token (Rotates every 60s)
  const [dynamicQrToken, setDynamicQrToken] = useState<string>(() => {
    return customer?.id
      ? `hbibna:c:${customer.id}`
      : 'hbibna:c:demo_user';
  });
  const [secondsLeft, setSecondsLeft] = useState<number>(QR_ROTATION_INTERVAL_SECONDS);

  const renewToken = () => {
    if (!customer?.id) return;
    const generated = generateDynamicQrToken(customer.id);
    setDynamicQrToken(generated.token);
    setSecondsLeft(QR_ROTATION_INTERVAL_SECONDS);
  };

  useEffect(() => {
    if (!customer?.id) return;

    renewToken();

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          renewToken();
          return QR_ROTATION_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [customer?.id]);

  const customerIdDisplay = customer?.id
    ? `HB-${customer.id.slice(0, 4).toUpperCase()}-DZ`
    : 'HB-8821-DZ';

  // 3D Tilt handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: (y / rect.height) * -12,
      y: (x / rect.width) * 12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleAddToWallet = async (phoneOverride?: string | React.MouseEvent) => {
    setShowWalletModal(true);
    setWalletAdded(true);
    const rawPhone = (typeof phoneOverride === 'string' ? phoneOverride : null) || effectivePhone;
    const phoneToUse = rawPhone ? normalizePhoneNumber(rawPhone) : '';
    if (!walletData && phoneToUse) {
      setWalletLoading(true);
      try {
        const res = await getOrCreateCustomerWallet(
          phoneToUse,
          membership?.business_id || business?.id
        );
        if (res?.configured && (res.shareUrl || res.applePassUrl)) {
          setWalletData({
            shareUrl: res.shareUrl,
            googleSaveUrl: res.googleSaveUrl,
            applePassUrl: res.applePassUrl,
          });
        }
      } catch (err) {
        console.warn('Wallet fetch error:', err);
      } finally {
        setWalletLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto font-rounded flex flex-col items-center">
      {/* 1. MICRO LIVE NOTIFICATION */}
      <div className="mb-3.5 z-20">
        <div className="px-4 py-1.5 rounded-full bg-[#111111] text-[#FFE600] border-2 border-[#111111] shadow-[0_3px_0_#000] text-xs font-black flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {isAr
              ? '✨ بطاقة ولاء رقمية نشطة • جاهزة للمسح في ثانية واحدة'
              : isFr
              ? '✨ Pass fidélité actif • Prêt pour le scan en caisse'
              : '✨ Active Loyalty Pass • Ready for 1.2s counter scan'}
          </span>
        </div>
      </div>

      {/* 2. LE PASS 3D DÉCOUPÉ (PHYGITAL CARD) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          backgroundColor: tierConfig.frameBg,
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="relative w-full rounded-[2.2rem] p-2.5 sm:p-3 border-[3px] border-[#111111] shadow-[0_10px_0_#111111] select-none transition-shadow group"
      >
        {/* ==============================================================
            SURFACE INTÉRIEURE DE LA CARTE (SMARTPASS INSERT)
            ============================================================== */}
        <div className="relative w-full rounded-[1.6rem] bg-[#FAF8F5] border-[2.5px] border-[#111111] p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-inner text-[#111111] text-start">
          {/* Dynamic Holographic Foil Overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-[1.6rem] transition-opacity duration-300 mix-blend-color-dodge overflow-hidden"
            style={{
              opacity: isHovered ? 0.65 : 0.2,
              background: `linear-gradient(${115 + tilt.y * 3.5}deg, rgba(255,255,255,0) 0%, rgba(255,230,0,0.2) 30%, rgba(226,91,108,0.25) 50%, rgba(56,189,248,0.25) 70%, rgba(255,255,255,0) 100%)`,
              backgroundPosition: `${50 + tilt.y * 2}% ${50 + tilt.x * 2}%`,
            }}
          />

          {/* Reflet shimmer iridescent */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full duration-1000 transition-transform pointer-events-none" />

          {/* 4 Coins de rétention noirs */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-black pointer-events-none" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-black pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-black pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-black pointer-events-none" />

          {/* 1. EN-TÊTE : Logo Hbibna officiel + Commerce & Télémétrie */}
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/hbibna-icon-trimmed.png"
                alt="Hbibna"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#E25B6C]">
                    PASS FIDÉLITÉ
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-black/30" />
                  <span className="text-[9px] font-mono text-zinc-500 font-bold">LIVE</span>
                </div>
                <h3 className="font-black text-sm sm:text-base text-[#111111] leading-tight truncate">
                  {activeBusinessName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#111111] text-[#FFE600] text-[9px] font-black font-mono shadow-xs">
                <Wifi className="w-3 h-3 rotate-90" />
                <span>NFC</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#FFE600] text-[#111111] border border-black/20 text-[9px] font-black uppercase font-mono">
                {tierConfig.badge}
              </span>
            </div>
          </div>

          {/* 2. CENTRE : PROCHAINE RÉCOMPENSE & JAUGE DE PROGRESSION BIEN VISIBLE */}
          <div className="relative z-10 my-3 py-2.5 px-3.5 rounded-2xl bg-white/90 backdrop-blur-xs border-2 border-[#111111] shadow-[0_3px_0_#111111] space-y-2">
            {/* Ligne 1 : Prochaine récompense à gauche, Solde de points à droite */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`relative w-8 h-8 rounded-lg border border-[#111111] flex items-center justify-center bg-gradient-to-r ${tierConfig.accentGrad} shadow-xs shrink-0`}
                >
                  <Gift className="w-4 h-4 text-[#111111] stroke-[2.5]" />
                </div>
                <div className="min-w-0 text-start">
                  <span className="text-[9px] uppercase font-black tracking-widest text-[#E25B6C] block leading-none">
                    {isAr ? 'المكافأة القادمة' : isFr ? 'Prochaine récompense' : 'Next Reward'}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-[#111111] truncate mt-0.5 leading-tight">
                    {nextRewardTitle}
                  </div>
                </div>
              </div>

              {/* Solde de points en grand */}
              <div className="text-end shrink-0 pl-1">
                <div className="text-[8px] font-mono font-bold text-zinc-500 uppercase leading-none mb-0.5">
                  {isAr ? 'الرصيد' : isFr ? 'Solde' : 'Balance'}
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight leading-none">
                  {points.toLocaleString()} <span className="text-xs text-[#E25B6C]">PTS</span>
                </div>
              </div>
            </div>

            {/* Ligne 2 : Jauge de progression bien visible pour le client */}
            <div className="space-y-1 pt-0.5">
              <div className="w-full h-2.5 rounded-full bg-zinc-200 border border-[#111111] p-0.5 overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700 shadow-xs"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor:
                      tierConfig.frameBg === '#1A1A1A' ? '#111111' : tierConfig.frameBg,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-zinc-600">
                <span>
                  {pointsRemaining > 0
                    ? isAr
                      ? `${progressPercent}% نحو المكافأة القادمة (${pointsRemaining} نقطة متبقية)`
                      : isFr
                      ? `${progressPercent}% vers la prochaine récompense (${pointsRemaining} pts restants)`
                      : `${progressPercent}% to next reward (${pointsRemaining} pts left)`
                    : isAr
                    ? '✨ 100% جاهزة للاستبدال !'
                    : isFr
                    ? '✨ 100% Prête à débloquer !'
                    : '✨ 100% Ready to unlock!'}
                </span>
                <span className="font-black text-[#111111] px-1.5 py-0.5 rounded bg-black/5">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. BAS DE CARTE : Titulaire, Identifiant & Étoiles */}
          <div className="relative z-10 pt-1 flex items-end justify-between gap-2">
            <div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase font-bold">
                {isAr ? 'حامل الجواز' : isFr ? 'Titulaire du pass' : 'Passholder'}
              </div>
              <div className="text-sm font-black text-[#111111] leading-tight">
                {customerName}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 font-bold mt-0.5">
                ID: {customerIdDisplay}
              </div>
            </div>

            {/* Étoiles & Statut membre */}
            <div className="flex flex-col items-end shrink-0">
              <div className="flex items-center gap-0.5 text-[#EEC044] mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
              </div>
              <span className="text-[9px] font-mono font-bold text-zinc-500">
                {isAr ? 'عضوية نشطة وموثقة' : isFr ? 'Membre actif vérifié' : 'Active verified member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EN-DESSOUS : LE BON DÉTACHABLE POUR LE SCAN AU COMPTOIR */}
      {showQrStub && (
        <div className="w-full mt-5 bg-[#FAF8F5] border-[2.5px] border-[#111111] rounded-3xl p-5 sm:p-6 text-center shadow-[0_6px_0_#111111] relative overflow-hidden space-y-4">
          {/* Ligne de perforation style ticket détachable */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#111111]/25">
            <div className="text-start">
              <span className="text-[10px] uppercase font-black text-[#E25B6C] tracking-wider block">
                {isAr ? 'الباركود الشخصي' : isFr ? 'Pass Caisse Rapide' : 'Counter Checkout'}
              </span>
              <h4 className="text-sm font-black text-[#111111]">
                {isAr ? 'امسح عند الكاونتر' : isFr ? 'Scannez lors du passage en caisse' : 'Scan at checkout counter'}
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black font-mono">
              ● 1.2s SCAN
            </span>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center gap-3">
            <div className="p-3.5 bg-white border-2 border-[#111111] rounded-2xl inline-flex items-center justify-center shadow-[0_3px_0_#111111] mx-auto relative group">
              <QRCodeSVG
                value={dynamicQrToken}
                size={160}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#111111"
                aria-label={t('customer.myQr')}
                className="w-36 h-36 sm:w-40 sm:h-40"
              />
            </div>

            {/* Rotating Anti-Fraud Countdown Bar */}
            <div className="w-full max-w-[220px] space-y-1.5">
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden border border-black/20 p-0.5">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-linear shadow-xs"
                  style={{
                    width: `${Math.max(4, (secondsLeft / QR_ROTATION_INTERVAL_SECONDS) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-black text-black/80 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {isAr
                      ? `يتجدد خلال ${secondsLeft} ثانية`
                      : isFr
                      ? `Renouvelé dans ${secondsLeft}s`
                      : `Refreshes in ${secondsLeft}s`}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={renewToken}
                  className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-black/60 hover:text-black p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                  title={isAr ? 'تحديث الرمز فوراً' : 'Actualiser maintenant'}
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isAr ? 'تحديث' : 'Actualiser'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111] text-[#FFE600] text-[10px] font-mono font-black shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{customerIdDisplay}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-bold block mx-auto">
              <Lock className="w-3 h-3 stroke-[2.5]" />
              <span>
                {isAr
                  ? 'حماية ضد لقطات الشاشة والاحتيال (رمز ديناميكي)'
                  : isFr
                  ? 'Protection anti-capture d\'écran active (Jeton dynamique)'
                  : 'Active anti-screenshot protection (Dynamic token)'}
              </span>
            </div>
          </div>

          {/* 4. ACTIONS : ENREGISTRER LE PASS SUR LE TÉLÉPHONE */}
          <div className="pt-3 border-t-2 border-dashed border-[#111111]/25 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleAddToWallet}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all cursor-pointer border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_#000] ${
                walletAdded
                  ? 'bg-emerald-600 text-white border-emerald-800'
                  : 'bg-black hover:bg-neutral-900 text-white'
              }`}
            >
              {walletAdded ? (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{isAr ? 'تم فتح خيارات الحفظ !' : isFr ? 'Pass prêt à enregistrer !' : 'Pass ready to save!'}</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 stroke-[2.5]" />
                  <span>{isAr ? '📲 حفظ في الهاتف (Wallet & الشاشة)' : isFr ? '📲 Enregistrer sur Téléphone (Wallet / Écran)' : '📲 Save to Phone (Wallet / Home Screen)'}</span>
                </>
              )}
            </button>

            <Link
              href={`/customer/qr${activeQueryStr}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-black bg-white hover:bg-zinc-100 text-[#111111] border-2 border-black shadow-[0_2px_0_#000]"
            >
              <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isAr ? 'تكبير الرمز' : isFr ? 'Plein écran' : 'Fullscreen'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* 5. MODAL GUIDE : INSTALLATION DU PASS SUR IPHONE / SMARTPHONE */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm max-h-[92vh] overflow-y-auto bg-[#FAF8F5] border-[2.5px] border-[#111111] rounded-[2rem] p-6 shadow-[0_12px_0_#111111] space-y-4 text-start font-rounded text-[#111111]">
            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#111111] font-black cursor-pointer"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#111111] flex items-center justify-center text-white shadow-xs">
                <Smartphone className="w-5 h-5 text-[#FFE600]" />
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">
                  {isAr ? 'حفظ البطاقة على هاتفك' : isFr ? 'Ajouter à l’écran d’accueil' : 'Save Pass to Phone'}
                </h3>
                <p className="text-[11px] font-bold text-zinc-500">
                  {isAr ? 'بطاقة رقمية فورية 100% بدون تطبيق' : isFr ? 'Pass Web PWA • Zéro téléchargement requis' : '100% App-Free Instant Pass'}
                </p>
              </div>
            </div>

            {/* 1. SECTIONS NATIVES APPLE & GOOGLE WALLET */}
            <div className="space-y-2.5">
              <p className="text-xs font-black text-[#111111] uppercase tracking-wider">
                {isAr ? '⚡ الإضافة المباشرة إلى المحفظة :' : isFr ? '⚡ Intégration Native Wallet :' : '⚡ Native Wallet Pass :'}
              </p>

              {!effectivePhone && !walletData && (
                <div className="p-3.5 rounded-2xl bg-white border-2 border-black space-y-2.5 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#111111]" />
                    <p className="text-xs font-black text-black">
                      {isAr
                        ? 'أدخل رقم هاتفك لتفعيل بطاقة المحفظة :'
                        : 'Entrez votre numéro pour générer le Pass Wallet :'}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                      <PhoneInput
                        value={phoneInput}
                        onChange={setPhoneInput}
                        placeholder="550 12 34 56"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (phoneInput.trim()) {
                          handleAddToWallet(phoneInput.trim());
                        }
                      }}
                      className="px-5 py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black cursor-pointer border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 hover:bg-black/90 shrink-0"
                    >
                      {isAr ? 'تأكيد' : 'Valider'}
                    </button>
                  </div>
                </div>
              )}

              {walletLoading ? (
                <div className="p-4 rounded-2xl bg-white border-2 border-black flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-black text-black">
                    {isAr ? 'جاري تحضير بطاقتك الرقمية...' : isFr ? 'Génération de votre Pass Wallet...' : 'Generating your Wallet pass...'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* BOUTON APPLE WALLET (iOS Safari .pkpass - SANS ATTRIBUT DOWNLOAD POUR DÉCLENCHER PASSKIT DIRECTEMENT) */}
                  <a
                    href={
                      walletData?.applePassUrl ||
                      (effectivePhone
                        ? `/api/wallet/pass?phone=${encodeURIComponent(effectivePhone)}${membership?.business_id ? `&b=${membership.business_id}` : ''}`
                        : `/api/wallet/pass${customer?.id ? `?c=${encodeURIComponent(customer.id)}` : ''}`)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-neutral-900 text-white font-black text-xs border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 flex items-center justify-between transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🍏</span>
                      <div className="text-start leading-tight">
                        <p className="font-black text-xs text-white">
                          {isAr ? 'إضافة إلى Apple Wallet' : isFr ? 'Ajouter à Apple Wallet' : 'Add to Apple Wallet'}
                        </p>
                        <p className="text-[10px] text-white/70 font-medium">
                          {isFr ? 'Ouvre directement l’app Cartes sur iPhone' : isAr ? 'يفتح تطبيق المحفظة على آيفون' : 'Opens Apple Wallet on iPhone'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#FFE600] group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                  </a>

                  {/* BOUTON GOOGLE WALLET (Android) */}
                  {walletData?.googleSaveUrl && (
                    <a
                      href={walletData.googleSaveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-50 text-black font-black text-xs border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 flex items-center justify-between transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">🤖</span>
                        <div className="text-start leading-tight">
                          <p className="font-black text-xs text-black">
                            {isAr ? 'حفظ في Google Wallet' : isFr ? 'Ajouter à Google Wallet' : 'Save to Google Wallet'}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-medium">Google Pay & Wallet pour Android</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                    </a>
                  )}

                  {/* LIEN UNIVERSEL WALLET (Page intelligente avec QR code pour PC et détection mobile) */}
                  {walletData?.shareUrl && (
                    <a
                      href={walletData.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-[#FFE600] hover:bg-[#ffe01b] text-black font-black text-[11px] border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span className="text-start">
                        {isAr
                          ? '📲 صفحة التثبيت الشاملة (كافة الأجهزة + QR للمكتب)'
                          : isFr
                          ? '📲 Page d’installation universelle (Tous appareils + QR)'
                          : '📲 Universal Pass Page (All devices + Desktop QR)'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 shrink-0 ms-2" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Note d'explication PWA / Écran d'accueil */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300/80 text-[11px] text-amber-900 leading-snug space-y-1">
              <p className="font-black flex items-center gap-1.5 text-amber-950">
                <span>📲 Alternative : Écran d’accueil (PWA) :</span>
              </p>
              <p className="text-[10.5px]">
                {isFr
                  ? 'Pour ajouter ce pass directement sous forme d’icône sur votre écran d’accueil :'
                  : isAr
                  ? 'لحفظ بطاقتك كأيقونة تطبيق على الشاشة الرئيسية :'
                  : 'To save this pass as an icon on your home screen:'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border-2 border-[#111111] space-y-2.5 shadow-2xs text-[11px]">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#FFE600] border border-black/30 text-black text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                <p className="font-bold leading-tight">
                  {isAr
                    ? 'في متصفحك (Safari أو Chrome)، اضغط على زر المشاركة ⎋ أو القائمة ⋮'
                    : isFr
                    ? 'Dans Safari ou Chrome, touchez Partager ⎋ (ou ⋮)'
                    : 'In Safari or Chrome, tap Share ⎋ (or ⋮)'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-[#FFE600] border border-black/30 text-black text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <p className="font-bold leading-tight">
                  {isAr
                    ? 'اختر "إضافة إلى الشاشة الرئيسية" 📲'
                    : isFr
                    ? 'Choisissez « Sur l’écran d’accueil » 📲'
                    : 'Tap “Add to Home Screen” 📲'}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({
                      title: `${activeBusinessName} — Pass Fidélité`,
                      text: `Mon Pass Fidélité ${activeBusinessName}`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(window.location.href);
                    alert(isAr ? 'تم نسخ رابط البطاقة !' : isFr ? 'Lien du Pass copié !' : 'Pass link copied!');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#111111] hover:bg-neutral-900 text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5"
              >
                <span>{isAr ? 'مشاركة أو نسخ رابط البطاقة' : isFr ? 'Partager / Enregistrer maintenant' : 'Share / Save Pass Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWalletModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-[#111111] text-xs font-black border-2 border-black cursor-pointer text-center"
              >
                {isAr ? 'فهمت، إغلاق' : isFr ? 'Compris, fermer' : 'Got it, close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
