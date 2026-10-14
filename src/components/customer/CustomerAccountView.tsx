'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Phone,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Wallet,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Save,
  Store,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { updateCustomerProfile } from '@/actions/customers';
import { changePasswordAction } from '@/actions/auth';
import type { Customer, CustomerBusinessMembership, Business } from '@/types/database';

interface CustomerAccountViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership | null;
  business?: Business | null;
  activeQueryStr: string;
}

export function CustomerAccountView({
  customer,
  activeMembership,
  business,
  activeQueryStr,
}: CustomerAccountViewProps) {
  const { t, isRtl, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  // Profile Form State
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(
    customer?.phone ? (customer.phone.startsWith('+213') ? customer.phone.slice(4).trim() : customer.phone) : ''
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Referral & Share State
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const businessName =
    business?.name ||
    activeMembership?.business?.name ||
    (isAr ? 'حساب الحبيبنا العام' : 'Pass Hbibna Universel');

  const referralCode =
    customer?.referral_code ||
    (customer?.id ? 'HB-' + customer.id.replace(/-/g, '').slice(0, 6).toUpperCase() : 'VIP100');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hbibna.dz';
  const referralLink = activeMembership?.business_id
    ? `${origin}/customer/join?ref=${referralCode}&b=${activeMembership.business_id}`
    : `${origin}/customer/join?ref=${referralCode}`;

  const cleanFullPhone = phone.trim().startsWith('+213')
    ? phone.trim()
    : `+213${phone.trim().replace(/^0/, '')}`;

  // Wallet pass download URLs
  const appleWalletUrl = `/api/wallet/pass?phone=${encodeURIComponent(cleanFullPhone)}${
    activeMembership?.business_id ? `&b=${activeMembership.business_id}` : ''
  }`;
  const googleWalletUrl =
    activeMembership?.wallet_google_url ||
    customer?.wallet_google_url ||
    appleWalletUrl;

  // Handlers
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const formData = new FormData();
    formData.append('customerId', customer?.id || '');
    formData.append('name', name);
    formData.append('phone', cleanFullPhone);
    formData.append('email', email);

    try {
      const res = await updateCustomerProfile(formData);
      if (res.error) {
        setProfileMessage({ type: 'error', text: res.error });
      } else {
        setProfileMessage({
          type: 'success',
          text: isAr
            ? 'تم حفظ بيانات الحساب بنجاح!'
            : isFr
            ? 'Vos informations ont été mises à jour avec succès !'
            : 'Profile updated successfully!',
        });
      }
    } catch {
      setProfileMessage({
        type: 'error',
        text: isAr ? 'حدث خطأ أثناء الحفظ.' : 'Une erreur est survenue lors de la sauvegarde.',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: isAr ? 'كلمتا المرور غير متطابقتين.' : 'Les nouveaux mots de passe ne correspondent pas.',
      });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordMessage(null);

    const formData = new FormData();
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('confirmPassword', confirmPassword);

    try {
      const res = await changePasswordAction(formData);
      if (res.error) {
        setPasswordMessage({ type: 'error', text: res.error });
      } else {
        setPasswordMessage({
          type: 'success',
          text: isAr
            ? 'تم تغيير كلمة المرور بنجاح!'
            : isFr
            ? 'Votre mot de passe a été modifié avec succès !'
            : 'Password updated successfully!',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordMessage({
        type: 'error',
        text: isAr ? 'حدث خطأ أثناء تعديل كلمة المرور.' : 'Erreur lors de la modification du mot de passe.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
      ? `انضم إلى بطاقة الولاء الخاصة بـ ${businessName}! انقر على الرابط لتسجيل حسابك وكسب مكافآتك: ${referralLink}`
      : isFr
      ? `Rejoins mon programme de fidélité chez ${businessName} ! Clique ici pour obtenir tes points de bienvenue : ${referralLink}`
      : `Join me on ${businessName}'s rewards pass! Tap here to get your welcome points: ${referralLink}`;

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6 font-rounded max-w-3xl mx-auto pb-12">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-black/15">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
              {t('customer.account')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
              <Store className="w-3 h-3 stroke-[2.5]" />
              <span>{businessName}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {isAr ? 'إعدادات الحساب والملف الشخصي' : isFr ? 'Mon Compte & Paramètres' : 'Account & Settings'}
          </h1>
          <p className="text-sm text-black/70 font-bold">
            {isAr
              ? 'إدارة معلوماتك الشخصية، ومحفظة الهاتف الذكي، ومشاركة رابط الإحالة.'
              : isFr
              ? 'Gérez vos coordonnées, synchronisez votre pass sur Apple/Google Wallet et sécurisez votre accès.'
              : 'Manage your contact details, sync with Apple/Google Wallet, and secure your access.'}
          </p>
        </div>

        <Link
          href={`/customer/pass${activeQueryStr}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white text-black text-xs font-black border-2 border-black shadow-[0_2px_0_#000] hover:bg-neutral-50 active:translate-y-0.5 transition-all self-start sm:self-auto shrink-0"
        >
          <span>{isAr ? 'عرض بطاقتي' : isFr ? 'Voir mon pass' : 'View pass'}</span>
        </Link>
      </div>

      {/* 2. Mobile Wallet Sync Banner */}
      <div className="p-6 rounded-3xl bg-black text-white border-2 border-black shadow-[0_8px_0_#FFE600] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE600] text-black flex items-center justify-center border-2 border-black">
              <Wallet className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {isAr ? 'المحفظة الذكية على الهاتف' : isFr ? 'Pass Apple & Google Wallet' : 'Mobile Wallet Sync'}
              </h2>
              <p className="text-xs text-neutral-300 font-bold">
                {isAr
                  ? 'احفظ بطاقتك في هاتفك للوصول السريع بدون إنترنت بنقرة واحدة.'
                  : isFr
                  ? 'Ajoutez votre pass directement sur votre smartphone pour un accès instantané en caisse.'
                  : 'Add your digital pass to your smartphone for instant offline access at checkout.'}
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#FFE600] text-black text-[10px] font-black uppercase">
            1-Click Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Apple Wallet Button */}
          <a
            href={appleWalletUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black border-2 border-white/20 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <span className="text-base"></span>
            <span>{isAr ? 'إضافة إلى Apple Wallet (.pkpass)' : isFr ? 'Ajouter à Apple Wallet (.pkpass)' : 'Add to Apple Wallet (.pkpass)'}</span>
          </a>

          {/* Google Wallet Button */}
          <a
            href={googleWalletUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black border-2 border-black shadow-[0_2px_0_#fff] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Wallet className="w-4 h-4 stroke-[2.5]" />
            <span>{isAr ? 'حفظ في Google Wallet' : isFr ? 'Enregistrer dans Google Wallet' : 'Save to Google Wallet'}</span>
          </a>
        </div>
      </div>

      {/* 3. Profile Management Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-5">
        <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-3">
          <div className="w-9 h-9 rounded-xl bg-[#FFF9D2] border-2 border-black text-black flex items-center justify-center shadow-[0_2px_0_#000]">
            <User className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              {isAr ? 'الملف الشخصي والبيانات' : isFr ? 'Informations personnelles' : 'Personal Profile'}
            </h2>
            <p className="text-xs text-black/60 font-bold">
              {isAr ? 'تعديل اسمك ورقم هاتفك المستخدم للتعريف في الكاونتر' : isFr ? 'Nom et numéro de téléphone identifiant votre compte en caisse' : 'Name and phone identifying your pass at checkout'}
            </p>
          </div>
        </div>

        {profileMessage && (
          <div
            className={`p-3.5 rounded-2xl border-2 border-black text-xs font-black flex items-center gap-2 ${
              profileMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
                : 'bg-rose-100 text-rose-900 border-rose-500'
            }`}
          >
            {profileMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{profileMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-black text-black uppercase tracking-wide">
                {isAr ? 'الاسم الكامل :' : isFr ? 'Nom complet :' : 'Full Name:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Karim Benali"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-neutral-50 text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-black text-black uppercase tracking-wide">
                {isAr ? 'البريد الإلكتروني :' : isFr ? 'Adresse e-mail :' : 'Email Address:'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="karim@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-neutral-50 text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Phone with Country Code (+213) */}
          <div className="space-y-1.5 text-start">
            <label className="block text-xs font-black text-black uppercase tracking-wide">
              {isAr ? 'رقم الهاتف (التعريف بالمتجر) :' : isFr ? 'Numéro de téléphone (Identifiant caisse) :' : 'Phone Number (Checkout ID):'}
            </label>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-black bg-[#FFE600] text-black text-xs font-black shrink-0 shadow-[0_2px_0_#000]">
                <span>🇩🇿</span>
                <span>+213</span>
              </div>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="550 12 34 56"
                className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-black bg-neutral-50 text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-all font-mono"
              />
            </div>
            <p className="text-[11px] text-black/60 font-semibold">
              {isAr
                ? 'الصيغة الدولية الرسمية: يتم حفظ رقمك بتنسيق 213+ للتعرف التلقائي عند الكاونتر.'
                : isFr
                ? 'Format international officiel : normalisé automatiquement en +213 pour la détection en caisse.'
                : 'Official international format: automatically formatted as +213 for counter detection.'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2 text-end">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_#000] transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isUpdatingProfile
                  ? isAr ? 'جارٍ الحفظ...' : 'Sauvegarde en cours...'
                  : isAr ? 'حفظ التعديلات' : isFr ? 'Enregistrer les modifications' : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Referral & Share Link Widget */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#FFF9D2] border-2 border-black shadow-[0_8px_0_#000] space-y-4 text-start">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-[#FFE600] flex items-center justify-center">
              <Share2 className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-black text-black">
                {isAr ? 'رابط الإحالة ومكافأة الأصدقاء' : isFr ? 'Lien de parrainage personnel' : 'Referral Link & Rewards'}
              </h3>
              <p className="text-xs text-black/70 font-bold">
                {isAr
                  ? 'شارك رابطك الخاص عبر واتساب واكسب نقاطاً إضافية مع كل صديق ينضم'
                  : isFr
                  ? 'Invitez vos proches via WhatsApp et recevez des points cadeaux à chaque inscription'
                  : 'Share your personal invite link on WhatsApp to earn bonus points'}
              </p>
            </div>
          </div>
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-[#FFE600] border border-black shadow-xs">
            {referralCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-black bg-white text-xs font-mono font-bold text-black truncate shadow-inner">
            {referralLink}
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-black text-xs font-black border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
          >
            {copiedLink ? (
              <span className="text-emerald-700 flex items-center gap-1 font-black">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                {isAr ? 'منسوخ' : 'Copié'}
              </span>
            ) : (
              <span>{isAr ? 'نسخ الرابط' : 'Copier'}</span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
        >
          <MessageCircle className="w-4 h-4 fill-white stroke-[2.5]" />
          <span>{isAr ? 'دعوة الأصدقاء عبر واتساب' : isFr ? 'Inviter mes amis sur WhatsApp' : 'Invite Friends on WhatsApp'}</span>
        </button>
      </div>

      {/* 5. Security & Change Password Form */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] space-y-5">
        <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 border-2 border-black text-rose-800 flex items-center justify-center shadow-[0_2px_0_#000]">
            <Shield className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              {isAr ? 'الأمان وتغيير كلمة المرور' : isFr ? 'Sécurité & Mot de passe' : 'Security & Password'}
            </h2>
            <p className="text-xs text-black/60 font-bold">
              {isAr ? 'حماية حسابك برمز سري قوي' : isFr ? 'Modifiez votre mot de passe pour sécuriser l’accès à votre pass' : 'Change password to keep your account safe'}
            </p>
          </div>
        </div>

        {passwordMessage && (
          <div
            className={`p-3.5 rounded-2xl border-2 border-black text-xs font-black flex items-center gap-2 ${
              passwordMessage.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-500'
                : 'bg-rose-100 text-rose-900 border-rose-500'
            }`}
          >
            {passwordMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5 text-start">
            <label className="block text-xs font-black text-black uppercase tracking-wide">
              {isAr ? 'كلمة المرور الحالية :' : isFr ? 'Mot de passe actuel :' : 'Current Password:'}
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-neutral-50 text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-all pr-11 rtl:pr-3.5 rtl:pl-11"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-black/50 hover:text-black cursor-pointer"
                aria-label={showCurrentPass ? 'Masquer' : 'Afficher'}
              >
                {showCurrentPass ? <Eye className="w-4 h-4 stroke-[2.5]" /> : <EyeOff className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* New Password */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-black text-black uppercase tracking-wide">
                {isAr ? 'كلمة المرور الجديدة :' : isFr ? 'Nouveau mot de passe :' : 'New Password:'}
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-neutral-50 text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-all pr-11 rtl:pr-3.5 rtl:pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-black/50 hover:text-black cursor-pointer"
                  aria-label={showNewPass ? 'Masquer' : 'Afficher'}
                >
                  {showNewPass ? <Eye className="w-4 h-4 stroke-[2.5]" /> : <EyeOff className="w-4 h-4 stroke-[2.5]" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5 text-start">
              <label className="block text-xs font-black text-black uppercase tracking-wide">
                {isAr ? 'تأكيد كلمة المرور الجديدة :' : isFr ? 'Confirmer le mot de passe :' : 'Confirm New Password:'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-black bg-neutral-50 text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#FFE600] transition-all pr-11 rtl:pr-3.5 rtl:pl-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-black/50 hover:text-black cursor-pointer"
                  aria-label={showConfirmPass ? 'Masquer' : 'Afficher'}
                >
                  {showConfirmPass ? <Eye className="w-4 h-4 stroke-[2.5]" /> : <EyeOff className="w-4 h-4 stroke-[2.5]" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 text-end">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_1px_0_#000] transition-all cursor-pointer disabled:opacity-50"
            >
              <Lock className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isUpdatingPassword
                  ? isAr ? 'جارٍ التحديث...' : 'Modification en cours...'
                  : isAr ? 'تحديث كلمة المرور' : isFr ? 'Mettre à jour le mot de passe' : 'Update Password'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
