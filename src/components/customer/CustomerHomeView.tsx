'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Gift,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Store,
  Users,
  Share2,
  Copy,
  Check,
  MessageCircle,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CustomerLoyaltyCard } from '@/components/customer/CustomerLoyaltyCard';
import type {
  Customer,
  CustomerBusinessMembership,
  Reward,
  Transaction,
  Business,
  LoyaltyProgram,
  Referral,
} from '@/types/database';

interface CustomerHomeViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership;
  rewards: Reward[];
  transactions: Transaction[];
  business?: Business | null;
  loyalty?: LoyaltyProgram | null;
  referrals?: Referral[];
  activeQueryStr: string;
}

export function CustomerHomeView({
  customer,
  activeMembership,
  rewards,
  transactions,
  business,
  loyalty,
  referrals = [],
  activeQueryStr,
}: CustomerHomeViewProps) {
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const customerName = customer?.name || (isAr ? 'العميل' : 'Client');
  const activeBusinessName = business?.name || activeMembership.business?.name || 'Commerce Partenaire';
  const pointsBalance = activeMembership.points_balance;

  // Customer transactions for the active business
  const displayActivity = transactions.slice(0, 5);

  // Referral calculations & handlers
  const referralBonus = loyalty?.referral_bonus_points ?? 50;
  const refereeWelcomeBonus = loyalty?.referee_welcome_points ?? 25;
  const referralCode =
    customer?.referral_code ||
    (customer?.id ? 'HB-' + customer.id.replace(/-/g, '').slice(0, 6).toUpperCase() : 'VIP100');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${origin}/customer/join?ref=${referralCode}&b=${activeMembership.business_id}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const shareMessage = isAr
      ? `انضم إليّ في برنامج الولاء الخاص بـ ${activeBusinessName}! سجل الآن عبر هذا الرابط لتحصل على +${refereeWelcomeBonus} نقطة ترحيبية فورية: ${referralLink}`
      : isFr
      ? `Rejoins-moi sur le pass fidélité de ${activeBusinessName} ! Clique ici pour recevoir +${refereeWelcomeBonus} points cadeaux dès ton inscription : ${referralLink}`
      : `Join me on ${activeBusinessName}'s rewards pass! Tap here to get +${refereeWelcomeBonus} welcome points right away: ${referralLink}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  const friendsReferredCount = referrals.length;
  const totalReferralPointsWon = referrals.reduce((acc, r) => acc + (r.points_awarded || referralBonus), 0);

  return (
    <div className="space-y-8 font-rounded">
      {/* 1. PORTAL HEADER: Focused on Currently Selected Business */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {t('customer.myPass')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
              <Store className="w-3 h-3 stroke-[2.5]" />
              <span>{activeBusinessName}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {activeBusinessName}
          </h1>
          <p className="text-sm text-black/70 font-bold">
            {language === 'ar' ? (
              <>مرحباً بك، <span className="font-black text-black">{customerName}</span>. بطاقة مكافآتك نشطة وجاهزة للاستخدام عند الكاونتر.</>
            ) : language === 'fr' ? (
              <>Bienvenue, <span className="font-black text-black">{customerName}</span>. Votre pass fidélité est actif et prêt à l&apos;emploi en caisse.</>
            ) : (
              <>Welcome back, <span className="font-black text-black">{customerName}</span>. Your rewards pass is active and ready to use at checkout.</>
            )}
          </p>
        </div>

        <Link
          href={`/customer/qr${activeQueryStr}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black hover:bg-neutral-900 text-[#FFE600] text-xs font-black transition-all border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] shrink-0 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-[#FFE600] stroke-[2.5]" />
          <span>{t('customer.myQr')}</span>
        </Link>
      </div>

      {/* 2. ACTIVE DIGITAL LOYALTY CARD (3D CUTOUT PASS) */}
      <CustomerLoyaltyCard
        customer={customer}
        business={business}
        membership={activeMembership}
        activeQueryStr={activeQueryStr}
        showQrStub={true}
      />

      {/* 2b. AFFILIATION & REFERRAL SHOWCASE (SPOTLIGHT CARD) */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-black bg-gradient-to-br from-[#FFE600] via-[#FFF275] to-[#FFE600] p-6 sm:p-7 shadow-[0_8px_0_#000] space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider shadow-[0_2px_0_#000]">
              <Sparkles className="w-3.5 h-3.5 fill-[#FFE600]" />
              <span>{isAr ? 'برنامج الإحالة الحصري' : isFr ? 'Programme d’Affiliation Exclusif' : 'Exclusive Referral Program'}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white text-black border border-black text-xs font-black">
              +{referralBonus} {t('common.pts')} / {isAr ? 'صديق' : isFr ? 'ami' : 'friend'}
            </span>
          </div>

          <Link
            href={`/customer/referral${activeQueryStr}`}
            className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000] shrink-0"
          >
            <span>{isAr ? 'لوحة تحكم الإحالة' : isFr ? 'Espace Parrainage complet' : 'Referral Hub'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 stroke-[2.5]" />
          </Link>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight">
            {isAr
              ? `ادعُ أصدقاءك واكسب +${referralBonus} نقطة مع كل صديق!`
              : isFr
              ? `Parrainez vos proches & Gagnez +${referralBonus} points par ami !`
              : `Invite your friends & Earn +${referralBonus} points per friend!`}
          </h2>
          <p className="text-xs sm:text-sm text-black/80 font-bold max-w-2xl">
            {isAr
              ? `شارك كود إحالتك أو رابطك الشخصي. صديقك يحصل فوراً على +${refereeWelcomeBonus} نقطة ترحيبية وأنت تحصل على +${referralBonus} نقطة بمجرد انضمامه!`
              : isFr
              ? `Partagez votre code ou votre lien. Votre ami reçoit immédiatement +${refereeWelcomeBonus} points de bienvenue, et vous empochez +${referralBonus} points !`
              : `Share your code or link. Your friend gets +${refereeWelcomeBonus} instant welcome points, and you get +${referralBonus} points!`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="flex items-center justify-between gap-3 bg-white px-4 py-2.5 rounded-2xl border-2 border-black shadow-[0_3px_0_#000]">
            <div className="text-start">
              <span className="text-[10px] uppercase font-black text-black/60 block leading-tight">
                {isAr ? 'كود إحالتك الشخصي' : isFr ? 'Votre Code Parrain' : 'Your Referral Code'}
              </span>
              <span className="font-mono text-base font-black text-black tracking-wider">
                {referralCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="p-2 rounded-xl bg-[#FFF9D2] hover:bg-[#FFE600] border-2 border-black text-black transition-all cursor-pointer shrink-0"
              title="Copier le code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4 stroke-[2.5]" />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-neutral-50 text-black text-xs font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>{isAr ? 'تم نسخ الرابط!' : isFr ? 'Lien copié !' : 'Link copied!'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                <span>{isAr ? 'نسخ رابط الدعوة' : isFr ? 'Copier le lien d’invitation' : 'Copy invite link'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 stroke-[2.5] fill-white" />
            <span>{isAr ? 'مشاركة عبر واتساب' : isFr ? 'Partager sur WhatsApp' : 'Share on WhatsApp'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t-2 border-black/15 text-xs font-black text-black">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 stroke-[2.5]" />
            <span>
              {friendsReferredCount}{' '}
              {isAr ? 'أصدقاء انضموا' : isFr ? 'amis parrainés' : 'friends referred'}
            </span>
          </div>
          <span className="text-black/30">•</span>
          <div className="flex items-center gap-1.5">
            <Gift className="w-4 h-4 stroke-[2.5]" />
            <span>
              +{totalReferralPointsWon}{' '}
              {isAr ? 'نقاط مكتسبة من الإحالة' : isFr ? 'points cumulés via parrainage' : 'points earned via referrals'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. YOUR REWARDS FOR THIS BUSINESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-black tracking-tight">
              {t('customer.availableRewards')}
            </h3>
            <p className="text-xs text-black/70 font-bold">
              {t('customer.exclusivePerks')}
            </p>
          </div>
          <Link
            href={`/customer/rewards${activeQueryStr}`}
            className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000]"
          >
            <span>{t('customer.viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 stroke-[2.5]" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const canAfford = pointsBalance >= reward.points_required;
            const pointsNeeded = reward.points_required - pointsBalance;

            return (
              <div
                key={reward.id}
                className={`p-5 rounded-3xl border-2 border-black bg-white shadow-[0_6px_0_#000] flex flex-col justify-between gap-4 transition-all hover:-translate-y-0.5 ${
                  canAfford
                    ? 'bg-[#FFF9D2]'
                    : 'opacity-90'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000] ${
                        canAfford
                          ? 'bg-[#FFE600] text-black'
                          : 'bg-white text-black'
                      }`}
                    >
                      <Gift className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    {canAfford ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-300 text-black border-2 border-black shadow-[0_2px_0_#000]">
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                        <span>{t('customer.ready')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-black border border-black">
                        <Lock className="w-3 h-3" />
                        <span>{pointsNeeded.toLocaleString()} {t('customer.ptsToGo')}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-base text-black tracking-tight">
                      {reward.name}
                    </h4>
                    <p className="text-xs font-black text-black/80 mt-0.5">
                      {reward.points_required.toLocaleString()} {t('business.points')}
                    </p>
                    {reward.description && (
                      <p className="text-xs text-black/70 mt-1 line-clamp-2 font-medium">
                        {reward.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVITY AT THIS BUSINESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-black tracking-tight">
              {t('customer.recentActivity')}
            </h3>
            <p className="text-xs text-black/70 font-bold">
              {t('customer.allTransactions')}
            </p>
          </div>
          <Link
            href={`/customer/activity${activeQueryStr}`}
            className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000]"
          >
            <span>{t('customer.history')}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 stroke-[2.5]" />
          </Link>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl shadow-[0_8px_0_#000] divide-y-2 divide-black/10 overflow-hidden font-bold">
          {displayActivity.length === 0 ? (
            <div className="p-8 text-center text-xs text-black/60 font-bold">
              {t('customer.noTransactions')}
            </div>
          ) : (
            displayActivity.map((act) => {
              const isEarn = act.points > 0;
              const title =
                act.description ||
                (act as any).title ||
                (isEarn ? t('customer.earnedPts') : t('customer.spentPts'));

              return (
                <div
                  key={act.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FFF9D2]/40 transition-colors"
                >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black shadow-[0_2px_0_#000] ${
                      isEarn
                        ? 'bg-emerald-300 text-black'
                        : 'bg-rose-300 text-black'
                    }`}
                  >
                    {isEarn ? (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <span className="font-black text-sm text-black block">
                      {title}
                    </span>
                    <span className="text-[11px] text-black/60 font-semibold">
                      {isEarn ? t('customer.earnedPts') : t('customer.spentPts')}
                    </span>
                  </div>
                </div>

                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <span
                    className={`text-sm font-black font-mono px-2.5 py-1 rounded-xl border border-black/20 ${
                      isEarn ? 'bg-amber-100 text-black' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {isEarn ? `+${act.points}` : act.points}
                  </span>
                  <span className="text-[10px] uppercase font-black text-black/60 block mt-0.5">
                    {t('business.points')}
                  </span>
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}
