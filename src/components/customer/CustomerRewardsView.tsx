'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Gift,
  CheckCircle2,
  Lock,
  Sparkles,
  Store,
  ArrowRight,
  Clock,
  QrCode,
  X,
  Ticket,
  Check,
  Timer,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, CustomerBusinessMembership, Reward, Business } from '@/types/database';

interface ActiveVoucher {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsRequired: number;
  businessName: string;
  code: string;
  createdAt: number;
  expiresAt: number; // timestamp
}

interface CustomerRewardsViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership | null;
  rewards: Reward[];
  business?: Business | null;
}

export function CustomerRewardsView({
  customer,
  activeMembership,
  rewards,
  business,
}: CustomerRewardsViewProps) {
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [activeTab, setActiveTab] = useState<'catalog' | 'vouchers'>('catalog');
  const [selectedVoucher, setSelectedVoucher] = useState<ActiveVoucher | null>(null);
  const [activeVouchers, setActiveVouchers] = useState<ActiveVoucher[]>([]);

  const isEnrolled = !!activeMembership && !!activeMembership.business_id && activeMembership.business_id !== 'default';
  const activeBusinessName = isEnrolled
    ? (business?.name || activeMembership?.business?.name || 'Commerce Partenaire')
    : (isAr ? 'حبيبنا • الجواز الموحد' : isFr ? 'Hbibna • Pass Universel' : 'Hbibna • Universal Pass');
  const pointsBalance = activeMembership?.points_balance || 0;

  // Load saved vouchers from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && customer?.id) {
      try {
        const key = `hbibna_vouchers_${customer.id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed: ActiveVoucher[] = JSON.parse(saved);
          // filter unexpired vouchers (within 24 hours)
          const now = Date.now();
          const valid = parsed.filter((v) => v.expiresAt > now);
          setActiveVouchers(valid);
        }
      } catch (e) {
        console.warn('Error reading vouchers:', e);
      }
    }
  }, [customer?.id]);

  // Persist vouchers to localStorage
  const saveVoucher = (voucher: ActiveVoucher) => {
    const updated = [voucher, ...activeVouchers.filter((v) => v.id !== voucher.id)];
    setActiveVouchers(updated);
    if (typeof window !== 'undefined' && customer?.id) {
      try {
        localStorage.setItem(`hbibna_vouchers_${customer.id}`, JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving voucher:', e);
      }
    }
  };

  const handleClaimReward = (reward: Reward) => {
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const voucherCode = `HB-VOUCHER-${reward.id.slice(0, 4).toUpperCase()}-${randomHex}`;
    const newVoucher: ActiveVoucher = {
      id: `vouch_${Date.now()}_${reward.id}`,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsRequired: reward.points_required,
      businessName: activeBusinessName,
      code: voucherCode,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours validity
    };

    saveVoucher(newVoucher);
    setSelectedVoucher(newVoucher);
  };

  // Split into Unlocked and Locked
  const unlockedRewards = rewards.filter((r) => pointsBalance >= r.points_required);
  const lockedRewards = rewards
    .filter((r) => pointsBalance < r.points_required)
    .sort((a, b) => a.points_required - b.points_required);

  if (!isEnrolled) {
    return (
      <div className="space-y-6 font-rounded max-w-2xl mx-auto text-center py-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center mx-auto shadow-[0_3px_0_#000]">
            <Gift className="w-8 h-8 text-black stroke-[2.5]" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-black">
              {isAr ? 'لا توجد مكافآت مفعلة بعد' : isFr ? 'Aucune récompense active' : 'No active perks yet'}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/70 max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'أنت لست منضماً إلى أي متجر بعد. تصفح دليل المتاجر الشريكة ومكافآتها، أو أظهر رمز QR عند الكاونتر لبدء كسب النقاط.'
                : isFr
                ? 'Vous n’avez pas encore rejoint de commerce partenaire. Découvrez notre catalogue public de récompenses ou présentez votre pass universel au comptoir !'
                : 'You have not joined any partner stores yet. Explore our perks catalog or show your universal QR at counter!'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/rewards-catalog"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_3px_0_#000] hover:bg-neutral-900 transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4 text-[#FFE600]" />
              <span>{isAr ? 'دليل مكافآت المتاجر' : isFr ? 'Découvrir le catalogue public' : 'Explore Perks Catalog'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
            </Link>
            <Link
              href="/customer/pass"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black text-xs font-black border-2 border-black shadow-[0_3px_0_#000] hover:bg-neutral-50 transition-all cursor-pointer"
            >
              <span>{isAr ? 'عرض بطاقتي' : isFr ? 'Mon Pass' : 'My Pass'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-rounded max-w-4xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="space-y-1 pb-4 border-b-2 border-black/15">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
            {t('customer.exclusivePerks')}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
            <Store className="w-3 h-3 stroke-[2.5]" />
            <span>{activeBusinessName}</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('customer.availableRewards')}
        </h1>
        <p className="text-sm text-black/70 font-bold">
          {t('customer.redeemAtCounter')} <span className="font-black text-black">{activeBusinessName}</span> {t('customer.forExclusivePerks')}
        </p>
      </div>

      {/* 2. Balance Summary Header */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FFE600] border-2 border-black shadow-[0_8px_0_#000] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-black/70 block">
            {activeBusinessName} • {t('customer.balance')}
          </span>
          <h2 className="text-base sm:text-lg font-black text-black">
            {customer?.name || (isAr ? 'العميل' : 'Client')}
          </h2>
        </div>
        <div className={isRtl ? 'text-left' : 'text-right'}>
          <span className="text-3xl sm:text-4xl font-black text-black font-mono">
            {pointsBalance.toLocaleString()}
          </span>
          <span className="text-xs font-black text-black uppercase"> {t('common.pts')}</span>
        </div>
      </div>

      {/* 3. Navigation Tabs: Catalog vs My Active Vouchers */}
      <div className="flex items-center gap-2 border-b-2 border-black/15 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-black text-[#FFE600] shadow-[0_3px_0_#000]'
              : 'bg-white text-black hover:bg-[#FFF9D2]'
          }`}
        >
          <Gift className="w-4 h-4 stroke-[2.5]" />
          <span>{isAr ? 'كتالوج المكافآت' : isFr ? 'Récompenses & Paliers' : 'Rewards & Perks'}</span>
          <span className="px-1.5 py-0.2 rounded-md bg-[#FFE600] text-black text-[10px] font-mono">
            {rewards.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black border-2 border-black transition-all cursor-pointer ${
            activeTab === 'vouchers'
              ? 'bg-black text-[#FFE600] shadow-[0_3px_0_#000]'
              : 'bg-white text-black hover:bg-[#FFF9D2]'
          }`}
        >
          <Ticket className="w-4 h-4 stroke-[2.5]" />
          <span>{isAr ? 'قسائمي المفعلة' : isFr ? 'Mes Bons Actifs' : 'My Active Vouchers'}</span>
          {activeVouchers.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-black border border-black animate-pulse">
              {activeVouchers.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB A: CATALOG & REWARDS */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Section 1: Unlocked Rewards (Ready to Claim) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-300 text-black text-[10px] font-black uppercase border border-black shadow-xs">
                {isAr ? 'متاحة الآن' : isFr ? 'Prêtes à l’échange' : 'Ready to Claim'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-black">
                {isAr ? 'المكافآت الجاهزة للاستبدال' : isFr ? 'Récompenses débloquées' : 'Unlocked Rewards'}
              </h2>
            </div>

            {unlockedRewards.length === 0 ? (
              <div className="p-6 rounded-3xl bg-neutral-50 border-2 border-dashed border-black/30 text-center space-y-1.5">
                <p className="text-xs font-black text-black/70">
                  {isAr ? 'ليس لديك ما يكفي من النقاط لاستبدال مكافأة حالياً.' : isFr ? 'Aucune récompense débloquée pour le moment.' : 'No unlocked rewards yet.'}
                </p>
                <p className="text-[11px] text-black/50 font-bold">
                  {isAr ? 'واصل جمع النقاط بتقديم بطاقتك عند كل عملية شراء!' : isFr ? 'Continuez à cumuler des points lors de vos passages en caisse !' : 'Keep collecting points on your visits!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="p-5 rounded-3xl bg-[#FFF9D2] border-2 border-black shadow-[0_6px_0_#000] flex flex-col justify-between space-y-3 text-start"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                          <Gift className="w-5 h-5 text-black stroke-[2.5]" />
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-300 text-black border border-black shadow-xs">
                          <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                          <span>{t('customer.ready')}</span>
                        </span>
                      </div>
                      <div>
                        <h3 className="font-black text-base text-black tracking-tight leading-snug">
                          {reward.name}
                        </h3>
                        <p className="text-xs font-black text-black/70 mt-0.5 font-mono">
                          {reward.points_required.toLocaleString()} {t('business.points')}
                        </p>
                      </div>
                      {reward.description && (
                        <p className="text-xs text-black/70 leading-relaxed font-semibold">
                          {reward.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleClaimReward(reward)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-black hover:bg-neutral-900 text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Ticket className="w-4 h-4 text-[#FFE600]" />
                      <span>{isAr ? 'توليد قسيمة الاستبدال (QR)' : isFr ? 'Générer mon bon d’échange' : 'Generate Voucher QR'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Locked Rewards Roadmap */}
          <div className="space-y-3 pt-4 border-t-2 border-black/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-200 text-black text-[10px] font-black uppercase border border-black shadow-xs">
                {isAr ? 'خريطة الأهداف' : isFr ? 'Paliers à venir' : 'Milestone Roadmap'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-black">
                {isAr ? 'المكافآت القادمة مع تقدم نقاطك' : isFr ? 'Feuille de route & Prochains cadeaux' : 'Upcoming Rewards Roadmap'}
              </h2>
            </div>

            {lockedRewards.length === 0 ? (
              <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-black text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-black text-emerald-900">
                  {isAr ? 'تهانينا! لقد فتحت جميع المكافآت المتاحة في هذا المتجر!' : isFr ? 'Félicitations ! Vous avez débloqué toutes les récompenses de ce commerce !' : 'Congratulations! You unlocked all available rewards!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lockedRewards.map((reward) => {
                  const pointsNeeded = reward.points_required - pointsBalance;
                  const percentage = Math.min(
                    100,
                    Math.round((pointsBalance / reward.points_required) * 100)
                  );

                  return (
                    <div
                      key={reward.id}
                      className="p-5 rounded-3xl bg-white border-2 border-black shadow-[0_6px_0_#000] space-y-3 text-start"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-neutral-100 border-2 border-black flex items-center justify-center shrink-0">
                            <Lock className="w-5 h-5 text-black/60 stroke-[2.5]" />
                          </div>
                          <div>
                            <h3 className="font-black text-base text-black">
                              {reward.name}
                            </h3>
                            <p className="text-xs font-black text-black/60">
                              {reward.points_required.toLocaleString()} {t('business.points')}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 rounded-xl shrink-0">
                          {isAr ? `باقي ${pointsNeeded} نقطة` : isFr ? `Plus que ${pointsNeeded} pts` : `${pointsNeeded} pts to go`}
                        </span>
                      </div>

                      {reward.description && (
                        <p className="text-xs text-black/70 font-semibold">
                          {reward.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-black/60">{t('customer.progress')}</span>
                          <span className="font-black text-black font-mono">{percentage}%</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[#FFF9D2] border-2 border-black overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full bg-[#FFE600] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB B: MY ACTIVE VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-4">
          {activeVouchers.length === 0 ? (
            <div className="p-10 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF9D2] border-2 border-black flex items-center justify-center mx-auto shadow-[0_2px_0_#000]">
                <Ticket className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <h3 className="text-base font-black text-black">
                {isAr ? 'لا توجد قسائم نشطة حالياً' : isFr ? 'Aucun bon d’échange actif pour le moment' : 'No active vouchers right now'}
              </h3>
              <p className="text-xs text-black/60 font-bold max-w-sm mx-auto">
                {isAr
                  ? 'عندما تصل إلى رصيد كافٍ وتختار استبدال مكافأة، ستظهر قسيمتك هنا جاهزة للمسح في الكاونتر.'
                  : isFr
                  ? 'Lorsque vous échangez une récompense débloquée, votre bon QR à présenter en caisse s’affiche ici.'
                  : 'When you claim an unlocked reward, your voucher QR ready for cashier scanning will appear here.'}
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FFE600] text-black text-xs font-black border-2 border-black shadow-[0_2px_0_#000] cursor-pointer"
              >
                <span>{isAr ? 'عرض المكافآت المتاحة' : isFr ? 'Voir les récompenses disponibles' : 'View Available Rewards'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="p-5 rounded-3xl bg-white border-2 border-black shadow-[0_6px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start hover:bg-[#FFF9D2]/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 border border-emerald-400 text-[10px] font-black uppercase">
                        {isAr ? 'قسيمة صالحة' : isFr ? 'Bon actif' : 'Active voucher'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-black/60">
                        {voucher.code}
                      </span>
                    </div>
                    <h3 className="font-black text-base text-black">
                      {voucher.rewardName}
                    </h3>
                    <p className="text-xs text-black/70 font-semibold flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        {isAr ? 'صالح لمدة 24 ساعة من تاريخ الإنشاء' : isFr ? 'Valide 24 heures après génération' : 'Valid 24 hours from creation'}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(voucher)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
                  >
                    <QrCode className="w-4 h-4 text-[#FFE600]" />
                    <span>{isAr ? 'إظهار الرمز في الكاونتر' : isFr ? 'Afficher le QR en caisse' : 'Show Voucher QR'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. MODAL: SINGLE-USE VOUCHER QR PASS */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setSelectedVoucher(null)}
          />

          <div className="relative w-full max-w-sm rounded-3xl bg-white border-2 border-black shadow-[0_12px_0_#000] p-6 text-center space-y-5 z-10 animate-in zoom-in-95 duration-150">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedVoucher(null)}
              className="absolute top-4 right-4 rtl:right-auto rtl:left-4 w-8 h-8 rounded-xl bg-neutral-100 hover:bg-neutral-200 border-2 border-black flex items-center justify-center text-black cursor-pointer shadow-xs"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Header */}
            <div className="space-y-1 pt-2">
              <span className="px-3 py-1 rounded-full bg-[#FFE600] text-black text-[10px] font-black uppercase border border-black shadow-xs inline-block">
                {isAr ? 'قسيمة استبدال فورية' : isFr ? 'Bon d’échange officiel' : 'Official Redemption Voucher'}
              </span>
              <h3 className="text-xl font-black text-black">
                {selectedVoucher.rewardName}
              </h3>
              <p className="text-xs text-black/70 font-bold">
                {selectedVoucher.businessName} • {selectedVoucher.pointsRequired} pts
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-[#FFF9D2] rounded-3xl border-2 border-black shadow-[0_4px_0_#000] flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-white rounded-2xl border-2 border-black shadow-xs">
                <QRCodeSVG
                  value={`hbibna:voucher:${selectedVoucher.code}`}
                  size={190}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>
              <span className="font-mono text-xs font-black text-black bg-white px-3 py-1 rounded-xl border border-black shadow-xs">
                {selectedVoucher.code}
              </span>
            </div>

            {/* Cashier Instruction Callout */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border-2 border-black text-xs font-bold text-black/80 flex items-start gap-2.5 text-start">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'أظهر هذا الرمز للكاشير عند الدفع. سيقوم بالمسح للتحقق من صحة القسيمة وخصم النقاط.'
                  : isFr
                  ? 'Présentez ce bon QR en caisse au moment de payer. Le commerçant valide et vous remet votre cadeau.'
                  : 'Present this QR code at checkout. The cashier will validate and hand over your reward.'}
              </span>
            </div>

            {/* Close action */}
            <button
              type="button"
              onClick={() => setSelectedVoucher(null)}
              className="w-full py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span>{isAr ? 'تم الاستلام / إغلاق' : isFr ? 'Fermer le bon' : 'Close Voucher'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
