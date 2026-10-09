'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Gift,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Store,
  UserCheck,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type {
  Customer,
  CustomerBusinessMembership,
  Business,
  LoyaltyProgram,
  Referral,
} from '@/types/database';

interface CustomerReferralViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership;
  business?: Business | null;
  loyalty?: LoyaltyProgram | null;
  referrals?: Referral[];
  activeQueryStr: string;
}

export function CustomerReferralView({
  customer,
  activeMembership,
  business,
  loyalty,
  referrals = [],
  activeQueryStr,
}: CustomerReferralViewProps) {
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const businessName = business?.name || activeMembership.business?.name || 'Commerce Partenaire';
  const referralBonus = loyalty?.referral_bonus_points ?? 50;
  const refereeWelcomeBonus = loyalty?.referee_welcome_points ?? 25;
  const referralCode =
    customer?.referral_code ||
    (customer?.id ? 'HB-' + customer.id.replace(/-/g, '').slice(0, 6).toUpperCase() : 'VIP100');

  const referralUrl = `${origin || 'https://hbibna.dz'}/customer/join?ref=${referralCode}&b=${activeMembership.business_id}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralUrl);
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
      ? `انضم إليّ في برنامج الولاء الخاص بـ ${businessName}! سجل الآن عبر هذا الرابط لتحصل على +${refereeWelcomeBonus} نقطة ترحيبية فورية: ${referralUrl}`
      : isFr
      ? `Rejoins-moi sur le pass fidélité de ${businessName} ! Clique ici pour recevoir +${refereeWelcomeBonus} points cadeaux dès ton inscription : ${referralUrl}`
      : `Join me on ${businessName}'s rewards pass! Tap here to get +${refereeWelcomeBonus} welcome points right away: ${referralUrl}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  const totalPointsEarned = referrals.reduce((acc, r) => acc + (r.points_awarded || referralBonus), 0);

  return (
    <div className="space-y-8 font-rounded max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {isAr ? 'برنامج الشراكة' : isFr ? 'Affiliation & Ambassadeur' : 'Referral Hub'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
              <Store className="w-3 h-3 stroke-[2.5]" />
              <span>{businessName}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {isAr ? 'برنامج الإحالة والمكافآت' : isFr ? 'Programme de Parrainage & Affiliation' : 'Customer Referral Program'}
          </h1>
          <p className="text-sm text-black/70 font-bold">
            {isAr
              ? `شارك حبك لـ ${businessName} مع أصدقائك واكسب نقاطاً إضافية في كل مرة ينضم فيها شخص جديد!`
              : isFr
              ? `Invitez vos proches chez ${businessName}. Chaque filleul inscrit vous rapporte des points fidélité gratuits !`
              : `Share ${businessName} with friends and earn bonus points every time someone signs up!`}
          </p>
        </div>

        <Link
          href={`/customer${activeQueryStr}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-black text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_#000] transition-all shrink-0 self-start sm:self-auto"
        >
          <span>{isAr ? 'العودة لبطاقتي' : isFr ? 'Retour à mon pass' : 'Back to pass'}</span>
        </Link>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Points Earned */}
        <div className="p-5 rounded-3xl border-2 border-black bg-[#FFE600] shadow-[0_6px_0_#000] space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {isAr ? 'النقاط المكتسبة من الإحالة' : isFr ? 'Points gagnés via parrainage' : 'Referral Points Earned'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-black text-[#FFE600] flex items-center justify-center border border-black shadow-[0_2px_0_#000]">
              <Gift className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-black font-mono tracking-tight">
              +{totalPointsEarned}
            </span>
            <span className="text-xs font-black text-black uppercase">{t('common.pts')}</span>
          </div>
          <p className="text-[11px] text-black/75 font-semibold">
            {isAr ? 'تُضاف فورياً إلى رصيدك الكلي' : isFr ? 'Crédités instantanément sur votre solde' : 'Added directly to your balance'}
          </p>
        </div>

        {/* Metric 2: Successful Referrals */}
        <div className="p-5 rounded-3xl border-2 border-black bg-white shadow-[0_6px_0_#000] space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {isAr ? 'الأصدقاء المسجلون' : isFr ? 'Filleuls inscrits' : 'Referred Friends'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-300 text-black flex items-center justify-center border-2 border-black shadow-[0_2px_0_#000]">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-black font-mono tracking-tight">
              {referrals.length}
            </span>
            <span className="text-xs font-black text-black">
              {isAr ? 'شخص' : isFr ? 'personnes' : 'friends'}
            </span>
          </div>
          <p className="text-[11px] text-black/60 font-semibold">
            {isAr ? 'انضموا عبر رابطك الشخصي' : isFr ? 'Ont rejoint via votre invitation' : 'Joined via your personal link'}
          </p>
        </div>

        {/* Metric 3: Bonus Rule */}
        <div className="p-5 rounded-3xl border-2 border-black bg-[#FFF9D2] shadow-[0_6px_0_#000] space-y-2 text-start">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {isAr ? 'المكافأة لكل صديق' : isFr ? 'Gain par ami invité' : 'Reward per Friend'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center border border-black shadow-[0_2px_0_#000]">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-black font-mono tracking-tight">
              +{referralBonus}
            </span>
            <span className="text-xs font-black text-black uppercase">
              {t('common.pts')} / {isAr ? 'صديق' : isFr ? 'ami' : 'friend'}
            </span>
          </div>
          <p className="text-[11px] text-black/70 font-semibold">
            {isAr
              ? `صديقك يربح أيضاً +${refereeWelcomeBonus} نقطة ترحيبية`
              : isFr
              ? `Votre ami gagne +${refereeWelcomeBonus} pts de bienvenue`
              : `Your friend also gets +${refereeWelcomeBonus} welcome pts`}
          </p>
        </div>
      </div>

      {/* 3. Main Sharing Section: QR Code + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Share Hub (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl border-2 border-black bg-white shadow-[0_8px_0_#000] space-y-6 text-start">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFE600] text-black border border-black text-xs font-black">
              <Share2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'طرق المشاركة السريعة' : isFr ? 'Partagez en 1 clic' : 'Share Instantly'}</span>
            </div>
            <h2 className="text-xl font-black text-black tracking-tight">
              {isAr ? 'شارك رابطك الشخصي الآن' : isFr ? 'Votre lien & code d’affiliation' : 'Your Affiliate Link & Code'}
            </h2>
            <p className="text-xs text-black/70 font-bold">
              {isAr
                ? 'أرسل الرابط في محادثة واتساب أو انسخ كود إحالتك ليقدمه صديقك عند الكاونتر.'
                : isFr
                ? 'Envoyez le lien sur WhatsApp ou donnez votre code pour que votre ami le donne en caisse.'
                : 'Send the link on WhatsApp or share your code for your friend to enter at checkout.'}
            </p>
          </div>

          {/* Code Box */}
          <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-black text-black/60 block">
                {isAr ? 'كود الإحالة الخاص بك' : isFr ? 'Code de parrainage' : 'Referral Code'}
              </span>
              <span className="font-mono text-2xl font-black text-black tracking-widest">
                {referralCode}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black text-[#FFE600] text-xs font-black border border-black shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  <span>{isAr ? 'تم النسخ!' : isFr ? 'Copié !' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{isAr ? 'نسخ الكود' : isFr ? 'Copier' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          {/* Invitation Link Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-black uppercase tracking-wide">
              {isAr ? 'رابط الانضمام المباشر :' : isFr ? 'Lien d’invitation direct :' : 'Direct Invitation Link:'}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-2xl border-2 border-black bg-neutral-50 text-xs font-mono font-bold text-black truncate shadow-inner">
                {referralUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-100 text-black text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-black">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    {isAr ? 'منسوخ' : isFr ? 'Copié' : 'Copied'}
                  </span>
                ) : (
                  <span>{isAr ? 'نسخ الرابط' : isFr ? 'Copier le lien' : 'Copy link'}</span>
                )}
              </button>
            </div>
          </div>

          {/* WhatsApp Primary Action */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black border-2 border-black shadow-[0_5px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-[2.5]" />
            <span>{isAr ? 'مشاركة الدعوة عبر واتساب' : isFr ? 'Inviter mes amis sur WhatsApp' : 'Invite Friends on WhatsApp'}</span>
          </button>
        </div>

        {/* Right: In-Person Scan QR Code (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl border-2 border-black bg-[#FFE600] shadow-[0_8px_0_#000] flex flex-col items-center justify-center text-center space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-black text-[#FFE600] inline-block shadow-[0_2px_0_#000]">
              {isAr ? 'مسح مباشر' : isFr ? 'Scan en face-à-face' : 'In-Person Scan'}
            </span>
            <h3 className="text-lg font-black text-black">
              {isAr ? 'امسح للانضمام فوراً' : isFr ? 'Faites scanner votre pass' : 'Scan to join instantly'}
            </h3>
            <p className="text-xs text-black/75 font-bold">
              {isAr
                ? 'دع صديقك يمسح هذا الكود بكاميرا هاتفه للانضمام وتفعيل نقاطه الترحيبية مباشرة.'
                : isFr
                ? 'Votre ami scanne ce QR code avec son smartphone pour rejoindre immédiatement le programme.'
                : 'Your friend scans this QR code with their camera to join and unlock points instantly.'}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-4 bg-white rounded-3xl border-2 border-black shadow-[0_6px_0_#000] flex items-center justify-center">
            <QRCodeSVG
              value={referralUrl}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-black text-black/70">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAr ? 'كود إحالة موثوق ومحمي' : isFr ? 'Lien de parrainage certifié' : 'Verified affiliate pass'}</span>
          </div>
        </div>
      </div>

      {/* 4. How It Works (3 Steps Explainer) */}
      <div className="p-6 sm:p-8 rounded-3xl border-2 border-black bg-white shadow-[0_8px_0_#000] space-y-5 text-start">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-black tracking-tight">
            {isAr ? 'كيف يعمل برنامج الإحالة؟' : isFr ? 'Comment fonctionne le parrainage ?' : 'How does referral work?'}
          </h3>
          <p className="text-xs text-black/70 font-semibold">
            {isAr ? 'ثلاث خطوات بسيطة لمضاعفة نقاطك ومكافآتك' : isFr ? 'Trois étapes simples pour cumuler des points gratuits' : 'Three simple steps to multiply your points'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border-2 border-black bg-[#FFF9D2] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FFE600] flex items-center justify-center text-xs font-black shadow-[0_2px_0_#000]">
              1
            </div>
            <h4 className="font-black text-sm text-black">
              {isAr ? 'شارك الرابط أو الكود' : isFr ? 'Partagez votre lien' : 'Share your link'}
            </h4>
            <p className="text-xs text-black/70 font-medium leading-relaxed">
              {isAr
                ? 'أرسل كودك أو رابطك الخاص إلى أصدقائك أو أفراد عائلتك عبر واتساب أو شبكات التواصل.'
                : isFr
                ? 'Envoyez votre lien ou votre code personnel à vos proches par message ou WhatsApp.'
                : 'Send your personalized code or link to friends and family via WhatsApp or message.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-black bg-[#FFF9D2] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FFE600] flex items-center justify-center text-xs font-black shadow-[0_2px_0_#000]">
              2
            </div>
            <h4 className="font-black text-sm text-black">
              {isAr ? 'صديقك ينضم ويربح' : isFr ? 'Votre ami s’inscrit' : 'Your friend joins'}
            </h4>
            <p className="text-xs text-black/70 font-medium leading-relaxed">
              {isAr
                ? `ينشئ صديقك بطاقته في ثوانٍ، ويحصل فوراً على +${refereeWelcomeBonus} نقطة ترحيبية مجانية!`
                : isFr
                ? `Votre ami active son pass fidélité en 5 secondes et reçoit immédiatement +${refereeWelcomeBonus} points cadeaux !`
                : `Your friend activates their pass in seconds and gets +${refereeWelcomeBonus} free welcome points right away!`}
            </p>
          </div>

          <div className="p-4 rounded-2xl border-2 border-black bg-[#FFE600] space-y-2">
            <div className="w-8 h-8 rounded-xl bg-black text-[#FFE600] flex items-center justify-center text-xs font-black shadow-[0_2px_0_#000]">
              3
            </div>
            <h4 className="font-black text-sm text-black">
              {isAr ? 'أنت تكسب النقاط تلقائياً' : isFr ? 'Vous gagnez vos points' : 'You get points'}
            </h4>
            <p className="text-xs text-black/75 font-medium leading-relaxed">
              {isAr
                ? `يتم إضافة +${referralBonus} نقطة في بطاقتك مباشرة، لتستبدلها بمشروبات ومكافآت مجانية!`
                : isFr
                ? `Vous recevez automatiquement +${referralBonus} points sur votre pass pour débloquer vos récompenses !`
                : `You automatically receive +${referralBonus} points on your pass to unlock free perks and rewards!`}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Referrals Ledger List */}
      <div className="space-y-4 text-start">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl text-black tracking-tight">
              {isAr ? 'سجل الأصدقاء المحالين' : isFr ? 'Historique de vos parrainages' : 'Your Referral History'}
            </h3>
            <p className="text-xs text-black/70 font-bold">
              {isAr ? 'قائمة بجميع من انضموا عبر دعوتك' : isFr ? 'Toutes les personnes ayant rejoint grâce à vous' : 'Everyone who joined using your referral link'}
            </p>
          </div>
          <span className="text-xs font-black text-black bg-white px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000]">
            {referrals.length} {isAr ? 'مسجلين' : isFr ? 'filleuls' : 'referrals'}
          </span>
        </div>

        <div className="bg-white border-2 border-black rounded-3xl shadow-[0_8px_0_#000] divide-y-2 divide-black/10 overflow-hidden font-bold">
          {referrals.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF9D2] border-2 border-black text-black flex items-center justify-center mx-auto shadow-[0_2px_0_#000]">
                <Users className="w-6 h-6 stroke-[2.5]" />
              </div>
              <p className="font-black text-sm text-black">
                {isAr ? 'لم ينضم أي صديق بعد' : isFr ? 'Aucun ami parrainé pour le moment' : 'No friends referred yet'}
              </p>
              <p className="text-xs text-black/60 font-medium max-w-sm mx-auto">
                {isAr
                  ? 'كن أول من يدعو أصدقاءه وابدأ بجمع النقاط المجانية الآن بمشاركة الرابط عبر واتساب!'
                  : isFr
                  ? 'Partagez votre lien sur WhatsApp pour commencer à cumuler vos points gratuits dès aujourd’hui !'
                  : 'Share your link on WhatsApp to start earning free loyalty points today!'}
              </p>
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all cursor-pointer mt-2"
              >
                <MessageCircle className="w-4 h-4 fill-white stroke-[2.5]" />
                <span>{isAr ? 'إرسال أول دعوة' : isFr ? 'Envoyer ma première invitation' : 'Send first invite'}</span>
              </button>
            </div>
          ) : (
            referrals.map((ref) => {
              const referredName = (ref as any).referred?.name || (isAr ? 'صديق جديد' : 'Nouvel ami');
              const dateStr = new Date(ref.created_at).toLocaleDateString(
                isAr ? 'ar-DZ' : isFr ? 'fr-DZ' : 'en-US',
                { year: 'numeric', month: 'short', day: 'numeric' }
              );

              return (
                <div
                  key={ref.id}
                  className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FFF9D2]/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-300 border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                      <UserCheck className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="font-black text-sm text-black block">
                        {referredName}
                      </span>
                      <span className="text-[11px] text-black/60 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 inline" />
                        <span>{dateStr}</span>
                      </span>
                    </div>
                  </div>

                  <div className={isRtl ? 'text-left' : 'text-right'}>
                    <span className="text-sm font-black font-mono px-3 py-1 rounded-xl bg-[#FFE600] text-black border border-black shadow-[0_1px_0_#000]">
                      +{ref.points_awarded || referralBonus} pts
                    </span>
                    <span className="text-[10px] uppercase font-black text-emerald-700 block mt-0.5">
                      {isAr ? 'تم التأكيد' : isFr ? 'Confirmé' : 'Credited'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
