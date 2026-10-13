'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { updatePassword } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { PasswordInput } from '@/components/common/PasswordInput';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
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
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
                <CheckCircle2 className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-2xl font-black text-black">
                {t('auth.resetSuccessTitle')}
              </h2>
              <p className="text-xs sm:text-sm text-black/75 font-bold">
                {t('auth.resetSuccessDesc')}
              </p>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-black hover:bg-zinc-800 text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000]"
                >
                  Accéder à mon espace
                </Link>
              </div>
            </div>
          ) : (
            <>
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
              <PasswordInput
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-1.5 text-start">
                {t('auth.confirmPassword')} <span className="text-rose-500 font-black">*</span>
              </label>
              <PasswordInput
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
              />
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
          </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-bold text-black/70 border-t-2 border-black/10">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
