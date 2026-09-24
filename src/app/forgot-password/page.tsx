'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { requestPasswordReset } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await requestPasswordReset(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success && res.email) {
        setSentEmail(res.email);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
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

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#736B63] hover:text-[#191817] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {sentEmail ? (
            <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-8 sm:p-10 shadow-card text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#191817]">Check your inbox</h2>
                <p className="text-sm text-[#736B63] leading-relaxed">
                  We sent a password reset link to{' '}
                  <span className="font-semibold text-[#191817]">{sentEmail}</span>.
                </p>
              </div>

              <p className="text-xs text-[#736B63]">
                Click the link in the email to choose a new password. If you don&apos;t see it, check your spam folder.
              </p>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-semibold shadow-soft transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-8 sm:p-10 shadow-card space-y-6">
              <div className="space-y-1.5 text-center">
                <h1 className="text-2xl font-extrabold text-[#191817] tracking-tight">
                  Reset your password
                </h1>
                <p className="text-xs text-[#736B63] max-w-xs mx-auto">
                  Enter your registered business email and we&apos;ll send you a link to reset your password.
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
                  <label className="block text-xs font-semibold text-[#191817] mb-1.5">
                    Business Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="owner@mybusiness.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-semibold text-sm shadow-soft transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#736B63] hover:text-[#191817] transition-colors"
                >
                  Cancel and return to sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-[#736B63] border-t border-[#E6DDCF]">
        <p>© {new Date().getFullYear()} Hbibna. All rights reserved.</p>
      </footer>
    </div>
  );
}
