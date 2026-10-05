'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Mail,
  CheckCircle2,
  Lock,
  Store,
  User,
  Phone,
  Sparkles,
  Gift,
} from 'lucide-react';
import { signUpBusiness, signUpCustomer, type AuthActionResult } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function SignUpContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'customer' || searchParams.get('tab') === 'client'
    ? 'customer'
    : 'business';

  const [activeTab, setActiveTab] = useState<'business' | 'customer'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationNeeded, setVerificationNeeded] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const handleBusinessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res: AuthActionResult = await signUpBusiness(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else if (res?.requiresEmailVerification && res.email) {
        setVerificationNeeded(res.email);
        setLoading(false);
      }
    } catch {
      // Handled if server redirected
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res: AuthActionResult = await signUpCustomer(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch {
      // Handled if server redirected to customer portal
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {verificationNeeded ? (
        /* Email confirmation notice (Business) */
        <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-10 shadow-[0_12px_0_#000] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              {t('auth.confirmEmailTitle')}
            </h2>
            <p className="text-sm text-black/80 font-medium leading-relaxed">
              {t('auth.confirmEmailDesc')}{' '}
              <span className="font-black text-black">{verificationNeeded}</span>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black text-xs text-black/80 text-start space-y-1.5 font-medium shadow-xs">
            <p className="font-black text-black flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('auth.nextStep')}</span>
            </p>
            <p>{t('auth.nextStepDesc')}</p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all"
          >
            {t('auth.proceedToSignIn')}
          </Link>
        </div>
      ) : (
        /* Signup Card */
        <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-10 shadow-[0_12px_0_#000] space-y-6">
          {/* Header Title & Subtitle */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {activeTab === 'business'
                ? t('auth.startLoyalty')
                : t('auth.clientSignupTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-black/75 font-medium max-w-sm mx-auto">
              {activeTab === 'business'
                ? t('auth.startLoyaltyDesc')
                : t('auth.clientSignupDesc')}
            </p>
          </div>

          {/* Dual-tab switch: Business vs Client */}
          <div className="grid grid-cols-2 p-1.5 bg-black/5 rounded-2xl border-2 border-black">
            <button
              type="button"
              onClick={() => {
                setActiveTab('business');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'business'
                  ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>{t('auth.businessPortal')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                  : 'text-black/70 hover:text-black'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('auth.clientPortal')}</span>
            </button>
          </div>

          {/* Tab Banner */}
          {activeTab === 'business' ? (
            /* Information Banner for Business (No Price Displayed) */
            <div className="p-3.5 rounded-2xl bg-[#FFF9D2] border-2 border-black flex items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 text-start">
                <div className="w-8 h-8 rounded-xl bg-black text-[#FFE600] flex items-center justify-center shrink-0 border border-black shadow-xs">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-black block leading-tight">
                    {t('auth.businessAccountTitle')}
                  </span>
                  <p className="text-[11px] text-black/70 font-semibold mt-0.5 leading-tight">
                    {t('auth.businessAccountSubtitle')}
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full bg-black text-[#FFE600] text-[9px] font-black uppercase font-mono shrink-0">
                PRO
              </span>
            </div>
          ) : (
            /* Free & Instant Banner for Clients */
            <div className="p-3.5 rounded-2xl bg-[#FFF9D2] border-2 border-black flex items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2.5 text-start">
                <div className="w-8 h-8 rounded-xl bg-black text-[#FFE600] flex items-center justify-center shrink-0 border border-black shadow-xs">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-black block leading-tight">
                    {t('auth.clientBadgeHighlight')}
                  </span>
                  <p className="text-[11px] text-black/70 font-semibold mt-0.5 leading-tight">
                    {t('auth.clientBadgeDesc')}
                  </p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full bg-[#111111] text-[#FFE600] text-[9px] font-black uppercase font-mono shrink-0">
                {isAr ? 'مجاني' : isFr ? 'GRATUIT' : 'FREE'}
              </span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-800 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {activeTab === 'business' ? (
            /* =============================================================
               BUSINESS SIGNUP FORM
               ============================================================= */
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.businessName')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="businessName"
                    required
                    placeholder={t('auth.businessNamePlaceholder')}
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Owner Name */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.ownerName')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="ownerName"
                    required
                    placeholder={t('auth.ownerNamePlaceholder')}
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Business Email */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.businessEmail')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="contact@cafedar.com"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.password')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{loading ? t('auth.creatingAccount') : t('auth.createAccountButton')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
              </button>
            </form>
          ) : (
            /* =============================================================
               CLIENT / CUSTOMER SIGNUP FORM
               ============================================================= */
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.clientFullName')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={t('auth.clientFullNamePlaceholder')}
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.clientPhone')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder={t('auth.clientPhonePlaceholder')}
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.clientPassword')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder={t('auth.clientPasswordPlaceholder')}
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Email Address (Optional - No star, no 'optional' label text) */}
              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.clientEmailOptional')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    placeholder="sarah@example.com"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-[#FFE600] font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{loading ? t('auth.creatingAccount') : t('auth.createClientPassButton')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
              </button>
            </form>
          )}

          {/* Security note */}
          <div className="pt-2 flex items-center justify-center gap-2 text-center text-xs font-bold text-black/75">
            <ShieldCheck className="w-4 h-4 text-black shrink-0" />
            <span>
              {activeTab === 'business'
                ? t('business.tenantSecurityDesc')
                : t('auth.clientSecurityNotice')}
            </span>
          </div>

          {/* Already have an account */}
          <div className="pt-3 border-t-2 border-black/10 text-center text-xs font-bold text-black/80">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link
              href={activeTab === 'customer' ? '/login?tab=customer' : '/login'}
              className="font-black text-black underline hover:text-zinc-800"
            >
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignUpPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFDE59] font-rounded selection:bg-black selection:text-[#FFDE59]">
      {/* Top minimal header */}
      <header className="px-6 py-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <HbibnaLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <p className="hidden sm:block text-xs font-bold text-black/80">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href="/login" className="font-black text-black underline hover:text-zinc-800">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-[0_12px_0_#000] text-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-black text-sm text-black">Chargement...</p>
            </div>
          }
        >
          <SignUpContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-bold text-black/70 border-t-2 border-black/10">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
