'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Store, User, AlertCircle, Mail, Lock, Phone } from 'lucide-react';
import { signInBusiness, signInCustomer, type AuthActionResult } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function LoginContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'customer' || searchParams.get('tab') === 'client'
    ? 'customer'
    : 'business';

  const [activeTab, setActiveTab] = useState<'business' | 'customer'>(initialTab);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();

  const handleBusinessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res: AuthActionResult = await signInBusiness(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch {
      // Server redirect handled automatically
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res: AuthActionResult = await signInCustomer(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch {
      // Server redirect handled automatically
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-10 shadow-[0_12px_0_#000] space-y-6">
      {/* Header Title */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-3xl font-black text-black tracking-tight">
          {t('auth.welcomeBack')}
        </h1>
        <p className="text-xs sm:text-sm text-black/75 font-medium">
          {activeTab === 'business'
            ? t('auth.welcomeBackDesc')
            : language === 'ar'
            ? 'أدخل رقم هاتفك وكلمة المرور للوصول إلى بطاقتك ونقاطك.'
            : language === 'fr'
            ? 'Entrez votre numéro de téléphone et votre mot de passe pour accéder à votre pass.'
            : 'Enter your phone number and password to access your loyalty pass.'}
        </p>
      </div>

      {/* Dual-tab switch */}
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

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-800 text-xs font-bold flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'business' ? (
        /* Business Login Form */
        <form onSubmit={handleBusinessSubmit} className="space-y-4">
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
                placeholder="owner@mybusiness.com"
                className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black text-black">
                {t('auth.password')} <span className="text-rose-500 font-black">*</span>
              </label>
              <Link
                href="/forgot-password?tab=business"
                className="text-[11px] font-black text-black hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? t('auth.signingIn') : t('auth.signInButton')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
          </button>
        </form>
      ) : (
        /* Customer / Client Pass Login Form with Password */
        <form onSubmit={handleCustomerSubmit} className="space-y-4">
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
                placeholder="0550 12 34 56"
                className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black text-black">
                {t('auth.clientPassword')} <span className="text-rose-500 font-black">*</span>
              </label>
              <Link
                href="/forgot-password?tab=customer"
                className="text-[11px] font-black text-black hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-[#FFE600] font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
          >
            <span>{loading ? t('auth.signingIn') : t('auth.accessPassButton')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
          </button>
        </form>
      )}

      {/* Footer note */}
      <div className="pt-4 border-t-2 border-black/10 text-center text-xs font-bold text-black/80">
        {t('auth.dontHaveAccount')}{' '}
        <Link
          href={activeTab === 'customer' ? '/signup?tab=customer' : '/signup'}
          className="font-black text-black underline hover:text-zinc-800"
        >
          {t('auth.registerNow')}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
            {t('auth.newBusiness')}{' '}
            <Link href="/signup" className="font-black text-black underline hover:text-zinc-800">
              {t('auth.registerNow')}
            </Link>
          </p>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] p-10 shadow-[0_12px_0_#000] text-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-black text-sm text-black">Chargement...</p>
            </div>
          }
        >
          <LoginContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-bold text-black/70 border-t-2 border-black/10">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
