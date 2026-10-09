'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Gift,
  ArrowRight,
  Store,
  User,
  Phone,
  Tag,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Users,
} from 'lucide-react';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { joinWithReferral, type JoinWithReferralResult } from '@/actions/referrals';
import type { Business, LoyaltyProgram, Customer } from '@/types/database';

interface CustomerJoinViewProps {
  business: Business;
  loyalty: LoyaltyProgram;
  referrer: Customer | null;
  initialReferralCode: string;
}

export function CustomerJoinView({
  business,
  loyalty,
  referrer,
  initialReferralCode,
}: CustomerJoinViewProps) {
  const router = useRouter();
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<JoinWithReferralResult | null>(null);

  const welcomePoints = loyalty?.referee_welcome_points ?? 25;
  const referrerBonus = loyalty?.referral_bonus_points ?? 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError(
        isAr
          ? 'يرجى إدخال اسمك ورقم هاتفك.'
          : isFr
          ? 'Veuillez saisir votre nom et numéro de téléphone.'
          : 'Please enter your name and phone number.'
      );
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('businessId', business.id);
    if (referralCode.trim()) {
      formData.append('referralCode', referralCode.trim());
    }

    startTransition(async () => {
      try {
        const res = await joinWithReferral(formData);
        if (res.error) {
          setError(res.error);
        } else if (res.success && res.customer) {
          setSuccess(res);

          // Confetti celebration
          try {
            const confetti = (await import('canvas-confetti')).default;
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#FFE600', '#000000', '#10B981'],
            });
          } catch {}

          // Redirect to their digital pass after celebration
          setTimeout(() => {
            const dest = `/customer?phone=${encodeURIComponent(res.customer!.phone)}&b=${business.id}`;
            router.push(dest);
          }, 1800);
        }
      } catch (err: any) {
        setError(err?.message || t('common.error'));
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FFF9D2] flex flex-col justify-center items-center p-4 sm:p-6 font-rounded">
      <div className="w-full max-w-md space-y-6">
        {/* Top Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            <HbibnaLogo size="md" />
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-8 shadow-[0_12px_0_#000] space-y-6 text-start">
          {/* Business Banner */}
          <div className="p-4 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_3px_0_#000] flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Store className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-black/70 block">
                {isAr ? 'برنامج الولاء الرسمي' : isFr ? 'Pass Fidélité Officiel' : 'Official Rewards Program'}
              </span>
              <h2 className="text-base font-black text-black truncate leading-tight">
                {business.name}
              </h2>
            </div>
          </div>

          {/* Invitation Highlight Box */}
          <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black space-y-2 text-start">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-black border border-black uppercase tracking-wider inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{isAr ? 'هدية ترحيبية' : isFr ? 'Cadeau de bienvenue' : 'Welcome gift'}</span>
              </span>
              {referrer && (
                <span className="text-xs font-black text-black/80 truncate">
                  {isAr ? `دعوة من ${referrer.name}` : isFr ? `Invité(e) par ${referrer.name}` : `Invited by ${referrer.name}`}
                </span>
              )}
            </div>

            <h3 className="font-black text-lg text-black leading-tight">
              {referrer
                ? isAr
                  ? `انضم الآن واربح +${welcomePoints} نقطة مجانية فوراً!`
                  : isFr
                  ? `Rejoignez via votre ami(e) et gagnez +${welcomePoints} points gratuits !`
                  : `Join through your friend and unlock +${welcomePoints} free points!`
                : isAr
                ? 'انضم لبرنامج الولاء وابدأ بجمع المكافآت!'
                : isFr
                ? 'Activez votre pass fidélité en quelques secondes !'
                : 'Activate your rewards pass in seconds!'}
            </h3>

            <p className="text-xs text-black/70 font-semibold leading-relaxed">
              {isAr
                ? `لا استمارات طويلة ولا تنزيل تطبيقات. احصل على بطاقتك الرقمية فوراً وابدأ بالاستفادة من هدايا ${business.name}.`
                : isFr
                ? `Aucune application à télécharger. Accédez instantanément à votre pass digital et profitez des cadeaux de ${business.name}.`
                : `No app downloads required. Access your digital pass instantly and start collecting perks at ${business.name}.`}
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 border-2 border-emerald-500 rounded-2xl animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-400 border-2 border-black flex items-center justify-center mx-auto shadow-[0_3px_0_#000]">
                <CheckCircle2 className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
              <h4 className="font-black text-xl text-black">
                {isAr ? 'أهلاً بك معنا!' : isFr ? 'Bienvenue parmi nous !' : 'Welcome aboard!'}
              </h4>
              <p className="text-xs text-black/80 font-bold">
                {success.pointsEarned && success.pointsEarned > 0 ? (
                  <>
                    {isAr
                      ? `تمت إضافة +${success.pointsEarned} نقطة ترحيبية إلى بطاقتك بنجاح!`
                      : isFr
                      ? `Vos +${success.pointsEarned} points de bienvenue ont été crédités sur votre pass !`
                      : `Your +${success.pointsEarned} welcome points are ready on your pass!`}
                  </>
                ) : (
                  <>
                    {isAr
                      ? 'تم تفعيل بطاقتك الرقمية بنجاح.'
                      : isFr
                      ? 'Votre pass fidélité est activé avec succès.'
                      : 'Your rewards pass is activated successfully.'}
                  </>
                )}
              </p>
              <div className="text-[11px] font-black text-black/60 pt-1 animate-pulse">
                {isAr ? 'جاري فتح بطاقتك...' : isFr ? 'Ouverture de votre pass digital...' : 'Opening your pass...'}
              </div>
            </div>
          ) : (
            /* Enrollment Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-100 border-2 border-rose-500 text-rose-900 text-xs font-black flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-black uppercase tracking-wide">
                  {isAr ? 'الاسم الكامل :' : isFr ? 'Votre nom complet :' : 'Your Full Name:'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-black/50 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder={isAr ? 'سارة بن علي' : 'Sarah Benali'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2]/60 focus:bg-white text-sm font-black text-black placeholder-black/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-black uppercase tracking-wide">
                  {isAr ? 'رقم الهاتف :' : isFr ? 'Numéro de téléphone :' : 'Phone Number:'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-black/50 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="0555 12 34 56"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2]/60 focus:bg-white text-sm font-mono font-black text-black placeholder-black/40 shadow-inner focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* Referral Code (Prefilled / Optional) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-black uppercase tracking-wide">
                    {isAr ? 'كود الإحالة (الراعي) :' : isFr ? 'Code de parrainage :' : 'Referral Code:'}
                  </label>
                  <span className="text-[10px] font-bold text-black/60">
                    {referrer ? (
                      <span className="text-emerald-700 font-black">
                        ✓ {referrer.name} (+{welcomePoints} pts)
                      </span>
                    ) : (
                      t('common.or') + ' ' + (isAr ? 'اختياري' : isFr ? 'optionnel' : 'optional')
                    )}
                  </span>
                </div>
                <div className="relative">
                  <Tag className="w-4 h-4 text-black/50 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="HB-XXXXXX"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-3 rounded-2xl border-2 border-black bg-white text-sm font-mono font-black text-black uppercase tracking-wider placeholder-black/30 shadow-[0_2px_0_#000] focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 rounded-2xl bg-black hover:bg-neutral-900 text-[#FFE600] font-black text-sm border-2 border-black shadow-[0_5px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <span>
                  {isPending
                    ? t('common.loading')
                    : isAr
                    ? `تفعيل بطاقتي والحصول على +${welcomePoints} نقطة`
                    : isFr
                    ? `Activer mon pass & Récupérer +${welcomePoints} pts`
                    : `Activate Pass & Claim +${welcomePoints} pts`}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-black text-black/60 pt-2 border-t border-black/10">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAr ? 'بياناتك محفوظة بأمان وفق معايير Hbibna' : isFr ? 'Données sécurisées • Pass 100% digital' : '100% digital & secure'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
