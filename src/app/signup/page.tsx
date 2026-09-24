'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, AlertCircle, Mail, CheckCircle2, Lock, Store, User } from 'lucide-react';
import { signUpBusiness, type AuthActionResult } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationNeeded, setVerificationNeeded] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
            {t('auth.alreadyHaveAccount')}{' '}
            <Link href="/login" className="font-semibold text-[#B88E3E] hover:underline">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {verificationNeeded ? (
            /* Email confirmation notice */
            <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-5 sm:p-10 shadow-card text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#191817]">
                  {t('auth.confirmEmailTitle')}
                </h2>
                <p className="text-sm text-[#736B63] leading-relaxed">
                  {t('auth.confirmEmailDesc')}{' '}
                  <span className="font-semibold text-[#191817]">{verificationNeeded}</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF] text-xs text-[#736B63] text-start space-y-1.5">
                <p className="font-semibold text-[#191817] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('auth.nextStep')}</span>
                </p>
                <p>{t('auth.nextStepDesc')}</p>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-semibold shadow-soft transition-colors"
              >
                {t('auth.proceedToSignIn')}
              </Link>
            </div>
          ) : (
            /* Signup Card */
            <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-5 sm:p-10 shadow-card space-y-5 sm:space-y-7">
              {/* Header Title & Subtitle */}
              <div className="space-y-2 text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191817] tracking-tight">
                  {t('auth.startLoyalty')}
                </h1>
                <p className="text-xs sm:text-sm text-[#736B63] max-w-sm mx-auto">
                  {t('auth.startLoyaltyDesc')}
                </p>
              </div>

              {/* Price Banner */}
              <div className="p-3.5 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F]/70 flex items-center justify-between text-xs">
                <div className="text-start">
                  <span className="font-bold text-[#191817]">{t('pricing.planName')}</span>
                  <p className="text-[11px] text-[#736B63]">{t('auth.allFeaturesIncluded')}</p>
                </div>
                <div className="ltr:text-right rtl:text-left">
                  <span className="font-extrabold text-sm text-[#191817]">9,800 {t('common.da')}</span>
                  <span className="text-[10px] text-[#736B63]"> {t('pricing.perMonth')}</span>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#191817] mb-1.5 text-start">
                    {t('auth.businessName')}
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="businessName"
                      required
                      placeholder="e.g. Café Dar El Beida"
                      className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                    />
                  </div>
                </div>

                {/* Owner Name */}
                <div>
                  <label className="block text-xs font-semibold text-[#191817] mb-1.5 text-start">
                    {t('auth.ownerName')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="e.g. Karim B."
                      className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                    />
                  </div>
                </div>

                {/* Business Email */}
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
                      placeholder="contact@cafedar.com"
                      className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#191817] mb-1.5 text-start">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <span>{loading ? t('auth.creatingAccount') : t('home.startFree')}</span>
                  <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                </button>
              </form>

              {/* Security note */}
              <div className="pt-2 flex items-center justify-center gap-2 text-center text-xs text-[#736B63]">
                <ShieldCheck className="w-4 h-4 text-[#B88E3E]" />
                <span>{t('business.tenantSecurityDesc')}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#736B63] border-t border-[#E6DDCF]">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
