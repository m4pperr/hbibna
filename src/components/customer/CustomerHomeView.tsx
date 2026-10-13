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
import { RewardMilestoneGoal } from '@/components/customer/RewardMilestoneGoal';
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
  memberships?: CustomerBusinessMembership[];
  activeMembership: CustomerBusinessMembership | null;
  rewards: Reward[];
  transactions: Transaction[];
  business?: Business | null;
  loyalty?: LoyaltyProgram | null;
  referrals?: Referral[];
  activeQueryStr: string;
}

export function CustomerHomeView({
  customer,
  memberships = [],
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

  const isEnrolled = !!activeMembership && (memberships.length > 0 || !!business);
  const hasMultipleStores = memberships.length > 1;

  const customerName = customer?.name || (isAr ? 'العميل' : 'Client');
  const activeBusinessName = isEnrolled
    ? (business?.name || activeMembership?.business?.name || 'Commerce Partenaire')
    : (isAr ? 'حبيبنا • الجواز الموحد' : isFr ? 'Hbibna • Pass Universel' : 'Hbibna • Universal Pass');
  const pointsBalance = activeMembership?.points_balance || 0;

  // Customer transactions for the active business
  const displayActivity = transactions.slice(0, 5);

  // Referral calculations & handlers
  const referralBonus = loyalty?.referral_bonus_points ?? 50;
  const refereeWelcomeBonus = loyalty?.referee_welcome_points ?? 25;
  const referralCode =
    customer?.referral_code ||
    (customer?.id ? 'HB-' + customer.id.replace(/-/g, '').slice(0, 6).toUpperCase() : 'VIP100');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = activeMembership?.business_id
    ? `${origin}/customer/join?ref=${referralCode}&b=${activeMembership.business_id}`
    : `${origin}/customer/join?ref=${referralCode}`;

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
    <div className="space-y-5 sm:space-y-6 font-rounded">
      {/* 1. PORTAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {isEnrolled ? t('customer.myPass') : (isAr ? 'الجواز الموحد' : isFr ? 'Pass Universel' : 'Universal Pass')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
              {isEnrolled ? (
                <>
                  <Store className="w-3 h-3 stroke-[2.5]" />
                  <span>{activeBusinessName}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 stroke-[2.5]" />
                  <span>{isAr ? 'جواز رقمي رسمي' : isFr ? 'Pass Officiel Hbibna' : 'Official Hbibna Pass'}</span>
                </>
              )}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {activeBusinessName}
          </h1>
          <p className="text-sm text-black/70 font-bold">
            {isEnrolled ? (
              language === 'ar' ? (
                <>مرحباً بك، <span className="font-black text-black">{customerName}</span>. بطاقة مكافآتك نشطة وجاهزة للاستخدام عند الكاونتر.</>
              ) : language === 'fr' ? (
                <>Bienvenue, <span className="font-black text-black">{customerName}</span>. Votre pass fidélité est actif et prêt à l&apos;emploi en caisse.</>
              ) : (
                <>Welcome back, <span className="font-black text-black">{customerName}</span>. Your rewards pass is active and ready to use at checkout.</>
              )
            ) : (
              language === 'ar' ? (
                <>مرحباً بك، <span className="font-black text-black">{customerName}</span>. جوازك الرقمي الموحد جاهز للمسح لدى جميع المتاجر الشريكة.</>
              ) : language === 'fr' ? (
                <>Bienvenue, <span className="font-black text-black">{customerName}</span>. Votre pass fidélité universel est actif et prêt pour votre premier scan.</>
              ) : (
                <>Welcome, <span className="font-black text-black">{customerName}</span>. Your universal rewards pass is active and ready for your first scan.</>
              )
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

      {/* 2. ONBOARDING BANNER FOR UNENROLLED NEW CLIENTS (0 Enrollments) */}
      {!isEnrolled && (
        <div className="rounded-3xl border-2 border-black bg-gradient-to-br from-[#FFE600] via-[#FFF385] to-[#FFE600] p-6 sm:p-7 shadow-[0_8px_0_#000] space-y-4 text-start">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-[#FFE600] text-xs font-black uppercase tracking-wider shadow-[0_2px_0_#000]">
              <Sparkles className="w-3.5 h-3.5 fill-[#FFE600]" />
              <span>{isAr ? 'حساب جديد • انضمام فوري' : isFr ? 'Nouveau compte • Activation instantanée' : 'New Account • Instant Join'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-black border border-black text-[11px] font-black">
              0 {isAr ? 'متاجر منضمة' : isFr ? 'commerce rejoint' : 'stores joined'}
            </span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight">
              {isAr
                ? 'مرحباً بك في حبيبنا! لم تنضم بعد إلى أي برنامج ولاء.'
                : isFr
                ? 'Bienvenue sur Hbibna ! Vous n’avez pas encore rejoint de commerce.'
                : 'Welcome to Hbibna! You haven’t joined any loyalty programs yet.'}
            </h2>
            <p className="text-xs sm:text-sm text-black/80 font-bold max-w-2xl leading-relaxed">
              {isAr
                ? 'أظهر رمز الاستجابة السريعة (QR) الخاص بك في الأسفل لأي تاجر شريك عند الكاونتر أثناء الدفع. سيقوم التاجر بمسحه لتسجيلك فوراً في برنامجه وكسب أولى نقاط مكافآتك!'
                : isFr
                ? 'Présentez simplement votre QR code universel ci-dessous au comptoir de n’importe quel commerce partenaire lors de votre achat. Le commerçant le scannera pour vous inscrire instantanément et vous faire gagner vos premiers points !'
                : 'Show your universal QR code below at any participating store counter when paying. The cashier will scan it to instantly enroll you and award your first reward points!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/rewards-catalog"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_3px_0_#000] hover:bg-neutral-900 transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4 text-[#FFE600]" />
              <span>{isAr ? 'اكتشف المتاجر والهدايا' : isFr ? 'Découvrir les commerces partenaires' : 'Discover partner perks'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180 stroke-[2.5]" />
            </Link>

            <Link
              href={`/customer/qr${activeQueryStr}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-black text-xs font-black border-2 border-black shadow-[0_3px_0_#000] hover:bg-neutral-50 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{isAr ? 'عرض الباركود كبير' : isFr ? 'Afficher le QR plein écran' : 'Full screen QR'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* 3. MULTI-STORE SELECTOR CAROUSEL / TABS (If customer has 2+ active stores) */}
      {hasMultipleStores && (
        <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[0_4px_0_#000] space-y-2.5 text-start">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>{isAr ? 'بطاقات متاجرك النشطة :' : isFr ? 'Vos cartes de fidélité actives :' : 'Your active store passes:'}</span>
            </span>
            <span className="text-[10px] font-black text-black bg-[#FFE600] px-2.5 py-0.5 rounded-full border border-black shadow-xs">
              {memberships.length} {t('customer.myBusinesses')}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {memberships.map((m) => {
              const isSelected = m.business_id === activeMembership?.business_id;
              return (
                <Link
                  key={m.id}
                  href={`/customer?b=${m.business_id}${customer?.phone ? `&phone=${encodeURIComponent(customer.phone)}` : ''}`}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border-2 border-black text-xs font-black shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE600] shadow-[0_3px_0_#000] translate-y-[-1px]'
                      : 'bg-[#FFF9D2] hover:bg-white text-black/80 shadow-xs'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate max-w-[140px]">{m.business?.name || 'Commerce'}</span>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 bg-black text-[#FFE600] rounded-md font-bold">
                    {m.points_balance} pts
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. DIGITAL LOYALTY CARD (3D CUTOUT PASS OR UNIVERSAL HBIBNA PASS) */}
      <CustomerLoyaltyCard
        customer={customer}
        business={business}
        membership={activeMembership}
        activeQueryStr={activeQueryStr}
        showQrStub={true}
      />

      {/* 5. REWARD MILESTONE GOAL (Only shown when enrolled with rewards) */}
      {isEnrolled && rewards.length > 0 && (
        <RewardMilestoneGoal
          pointsBalance={pointsBalance}
          rewards={rewards}
          loyalty={loyalty}
          activeQueryStr={activeQueryStr}
        />
      )}

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

        {rewards.length === 0 ? (
          <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black shadow-[0_6px_0_#000] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center mx-auto shadow-xs">
              <Gift className="w-6 h-6 text-black" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-sm text-black">
                {isAr ? 'اكتشف الهدايا المتاحة في شبكة حبيبنا' : isFr ? 'Explorez les cadeaux du réseau Hbibna' : 'Explore gifts across Hbibna network'}
              </h4>
              <p className="text-xs text-black/70 font-bold max-w-sm mx-auto">
                {isAr
                  ? 'تصفح قائمة المتاجر الشريكة ومكافآتها الحصرية.'
                  : isFr
                  ? 'Consultez la liste des commerces partenaires et les cadeaux que vous pouvez débloquer.'
                  : 'Check out participating stores and rewards you can unlock.'}
              </p>
            </div>
            <Link
              href="/rewards-catalog"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_2px_0_#000]"
            >
              <span>{isAr ? 'دليل المكافآت' : isFr ? 'Voir le catalogue public' : 'Browse perks'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>
        ) : (
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
        )}
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
              {isAr
                ? 'لا توجد معاملات مسجلة بعد. سيظهر نشاطك هنا فور مسح بطاقتك عند الكاونتر.'
                : isFr
                ? 'Aucune transaction enregistrée pour le moment. Votre activité apparaîtra dès votre premier achat en caisse.'
                : 'No recorded activity yet. Your transactions will appear here once you scan at checkout.'}
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
