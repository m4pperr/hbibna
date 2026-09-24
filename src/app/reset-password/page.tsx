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
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF8F5]">
      {/* Top minimal header */}
      <header className="px-6 py-5 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <HbibnaLogo size="md" />
        </Link>
        <LanguageSelector />
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-8 sm:p-10 shadow-card space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-extrabold text-[#191817] tracking-tight">
              {t('auth.resetPasswordTitle')}
            </h1>
            <p className="text-xs text-[#736B63]">
              {t('auth.chooseSecurePassword')}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#191817] mb-1.5 text-start">
                {t('auth.newPassword')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#191817] mb-1.5 text-start">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? t('auth.updatingPassword') : t('auth.savePasswordAndContinue')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#736B63] border-t border-[#E6DDCF]">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
