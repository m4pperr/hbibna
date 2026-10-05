'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, AlertCircle, ArrowRight, Store, User, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset, resetCustomerPassword, type AuthActionResult } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'customer' || searchParams.get('tab') === 'client'
    ? 'customer'
    : 'business';

  const [activeTab, setActiveTab] = useState<'business' | 'customer'>(initialTab);
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [customerSuccess, setCustomerSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleBusinessSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res: AuthActionResult = await requestPasswordReset(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success && res.email) {
        setSentEmail(res.email);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      const res: AuthActionResult = await resetCustomerPassword(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setCustomerSuccess(true);
      }
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Business Success Card */}
      {activeTab === 'business' && sentEmail ? (
        <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-10 shadow-[0_12px_0_#000] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
            <Mail className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              {t('auth.checkInbox')}
            </h2>
            <p className="text-sm text-black/80 font-medium leading-relaxed">
              {t('auth.checkInboxDesc')}{' '}
              <span className="font-black text-black">{sentEmail}</span>.
            </p>
          </div>

          <p className="text-xs text-black/70 font-semibold">
            {t('auth.checkInboxSub')}
          </p>

          <div className="pt-2">
            <Link
              href="/login?tab=business"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all"
            >
              {t('auth.returnToSignIn')}
            </Link>
          </div>
        </div>
      ) : activeTab === 'customer' && customerSuccess ? (
        /* Customer Success Card */
        <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-10 shadow-[0_12px_0_#000] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
            <CheckCircle2 className="w-8 h-8 text-black" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-black">
              {t('auth.resetSuccessTitle')}
            </h2>
            <p className="text-sm text-black/80 font-medium leading-relaxed">
              {t('auth.resetSuccessDesc')}
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/login?tab=customer"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all gap-2"
            >
              <span>{t('auth.goToClientLogin')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
            </Link>
          </div>
        </div>
      ) : (
        /* Main Reset Form Card with Dual-Tab Switcher */
        <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-10 shadow-[0_12px_0_#000] space-y-6">
          {/* Header Title */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl font-black text-black tracking-tight">
              {activeTab === 'business'
                ? t('auth.forgotPasswordTitle')
                : t('auth.forgotPasswordCustomerTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-black/75 font-medium max-w-xs mx-auto">
              {activeTab === 'business'
                ? t('auth.forgotPasswordDesc')
                : t('auth.forgotPasswordCustomerDesc')}
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
            /* Business Password Reset Form */
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? t('common.loading') : t('auth.sendResetLink')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
              </button>
            </form>
          ) : (
            /* Customer / Client Pass Password Reset Form */
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
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.newPassword')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1.5 text-start">
                  {t('auth.confirmPassword')} <span className="text-rose-500 font-black">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-[#FFE600] font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? t('common.loading') : t('auth.resetPasswordButton')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center">
            <Link
              href={activeTab === 'customer' ? '/login?tab=customer' : '/login?tab=business'}
              className="text-xs font-black text-black hover:underline transition-colors"
            >
              {t('auth.cancelAndReturn')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ForgotPasswordPage() {
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
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-black text-black hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{t('auth.backToSignIn')}</span>
          </Link>
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
          <ForgotPasswordContent />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-bold text-black/70 border-t-2 border-black/10">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
