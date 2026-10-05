'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { updatePassword } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setSuccess] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      const formData = new FormData();
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      const res = await updatePassword(formData);
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFDE59] font-rounded selection:bg-black selection:text-[#FFDE59]">
      {/* Top minimal header */}
      <header className="px-6 py-6 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <HbibnaLogo size="md" />
        </Link>
        <LanguageSelector />
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-10 shadow-[0_12px_0_#000] space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-3xl font-black text-black tracking-tight">
              {t('auth.resetPasswordTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-black/75 font-medium">
              {t('auth.chooseSecurePassword')}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-800 text-xs font-bold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-black mb-1.5 text-start">
                {t('auth.newPassword')} <span className="text-rose-500 font-black">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              className="w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? t('auth.updatingPassword') : t('auth.savePasswordAndContinue')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#FFE600]" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-bold text-black/70 border-t-2 border-black/10">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
