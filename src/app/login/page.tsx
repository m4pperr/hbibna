'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Store, User, AlertCircle, Mail, Lock, Phone } from 'lucide-react';
import { signInBusiness, type AuthActionResult } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'business' | 'customer'>('business');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

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

  const handleCustomerLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) {
      setError(t('auth.enterPhonePrompt'));
      return;
    }
    router.push(`/customer?phone=${encodeURIComponent(customerPhone.trim())}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5]">
      {/* Top minimal header */}
      <header className="px-6 py-5 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <HbibnaLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <p className="hidden sm:block text-xs text-[#736B63]">
            {t('auth.newBusiness')}{' '}
            <Link href="/signup" className="font-semibold text-[#B88E3E] hover:underline">
              {t('auth.registerNow')}
            </Link>
          </p>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-5 sm:p-10 shadow-card space-y-5 sm:space-y-7">
          {/* Header Title */}
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191817] tracking-tight">
              {t('auth.welcomeBack')}
            </h1>
            <p className="text-xs text-[#736B63]">
              {t('auth.welcomeBackDesc')}
            </p>
          </div>

          {/* Dual-tab switch */}
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] rounded-xl border border-[#E6DDCF]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('business');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'business'
                  ? 'bg-[#FFFFFF] text-[#191817] shadow-xs font-bold'
                  : 'text-[#736B63] hover:text-[#191817]'
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
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-[#FFFFFF] text-[#191817] shadow-xs font-bold'
                  : 'text-[#736B63] hover:text-[#191817]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('auth.customerPass')}</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'business' ? (
            /* Business Login Form */
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#191817] mb-1.5 text-start">
                  {t('auth.businessEmail')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="owner@mybusiness.com"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#191817]">
                    {t('auth.password')}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-medium text-[#B88E3E] hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{loading ? t('auth.signingIn') : t('auth.signInButton')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>
          ) : (
            /* Customer Pass Lookup */
            <form onSubmit={handleCustomerLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#191817] mb-1.5 text-start">
                  {t('auth.customerPhoneTitle')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    placeholder="0550 12 34 56"
                    className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                  />
                </div>
                <p className="text-[11px] text-[#736B63] mt-1.5 text-start">
                  {t('auth.phoneHelper')}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('auth.accessPassButton')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-[#E6DDCF] text-center text-xs text-[#736B63]">
            {t('auth.dontHaveAccount')}{' '}
            <Link href="/signup" className="font-semibold text-[#B88E3E] hover:underline">
              {t('auth.registerNow')}
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#736B63] border-t border-[#E6DDCF]">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
