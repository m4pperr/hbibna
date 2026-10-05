'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Check,
  ArrowRight,
  Sparkles,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Calendar,
  AlertCircle,
  HelpCircle,
  Receipt,
  Store,
} from 'lucide-react';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { activateBusinessSubscription } from '@/actions/subscription';

export default function ChoosePlanPage() {
  const router = useRouter();
  const { t, isRtl, language } = useLanguage();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [paymentMethod, setPaymentMethod] = useState<'cib' | 'ccp'>('cib');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardHolder, setCardHolder] = useState('Commerçant Hbibna');

  const isAnnual = billingCycle === 'annual';
  const priceDisplay = isAnnual ? '98 000' : '9 800';
  const priceUnit = isAnnual ? t('pricing.perYear') : t('pricing.perMonth');

  const features = [
    t('pricing.feature1'),
    t('pricing.feature2'),
    t('pricing.feature3'),
    t('pricing.feature4'),
    t('pricing.feature5'),
    t('pricing.feature6'),
    t('pricing.feature7'),
    t('pricing.feature8'),
  ];

  const handlePayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('plan', billingCycle);
      formData.append('paymentMethod', paymentMethod);

      const res = await activateBusinessSubscription(formData);

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setPaymentSuccess(true);
        setLoading(false);
        // Automatically redirect to dashboard after celebratory pause
        setTimeout(() => {
          router.push('/dashboard');
        }, 1800);
      }
    } catch {
      setError(t('common.error'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FFDE59] font-rounded selection:bg-black selection:text-[#FFE600]">
      {/* Top minimal header */}
      <header className="px-4 sm:px-8 py-5 max-w-7xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <HbibnaLogo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSelector />
          <Link
            href="/login"
            className="text-xs font-black text-black hover:underline"
          >
            {t('auth.signIn')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {paymentSuccess ? (
          /* Payment Success & Access Card */
          <div className="max-w-md mx-auto bg-white border-2 border-black rounded-[2.5rem] p-8 sm:p-12 shadow-[0_12px_0_#000] text-center space-y-6 animate-scale-up">
            <div className="w-20 h-20 rounded-3xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
              <CheckCircle2 className="w-10 h-10 text-black stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                {t('auth.paymentSuccessTitle')}
              </h1>
              <p className="text-sm text-black/80 font-medium leading-relaxed">
                {t('auth.paymentSuccessDesc')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black text-xs font-black text-black flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-black animate-spin" />
              <span>{t('auth.redirectingToDashboard')}</span>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 rounded-2xl bg-black hover:bg-zinc-800 text-[#FFE600] font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('auth.accessDashboardNow')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stepper Header */}
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              {/* Stepper bar */}
              <div className="inline-flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-full bg-white border-2 border-black shadow-[0_3px_0_#000] text-[11px] font-black">
                <span className="flex items-center gap-1 text-black/60">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>{t('auth.step1Account')}</span>
                </span>
                <span className="text-black/30">•</span>
                <span className="flex items-center gap-1.5 text-black bg-[#FFE600] px-2.5 py-0.5 rounded-full border border-black shadow-xs">
                  <span>{t('auth.step2PlanPayment')}</span>
                </span>
                <span className="text-black/30">•</span>
                <span className="text-black/40">{t('auth.step3Ready')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
                {t('auth.choosePlanTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-black/80 font-medium max-w-lg mx-auto">
                {t('auth.choosePlanDesc')}
              </p>
            </div>

            {error && (
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-800 text-xs font-bold flex items-center gap-2.5 shadow-[0_4px_0_#000]">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Plan Choice Cards (Side-by-side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {/* Card 1: Monthly Plan */}
              <div
                onClick={() => setBillingCycle('monthly')}
                className={`relative rounded-3xl p-6 sm:p-7 border-2 border-black transition-all cursor-pointer text-start ${
                  billingCycle === 'monthly'
                    ? 'bg-white shadow-[0_8px_0_#000] ring-4 ring-black'
                    : 'bg-white/80 hover:bg-white shadow-[0_4px_0_#000] opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-black/60 block">
                      {t('pricing.monthlyBilling')}
                    </span>
                    <h3 className="text-2xl font-black text-black mt-1">
                      {t('auth.monthlyPlan')}
                    </h3>
                    <p className="text-xs text-black/70 font-semibold mt-0.5">
                      {t('auth.monthlyPlanDesc')}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 ${
                      billingCycle === 'monthly'
                        ? 'bg-black text-[#FFE600]'
                        : 'bg-white'
                    }`}
                  >
                    {billingCycle === 'monthly' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black mb-5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-black">
                      9 800
                    </span>
                    <span className="text-sm font-black text-black">DA</span>
                    <span className="text-xs text-black/70 font-bold">{t('pricing.perMonth')}</span>
                  </div>
                  <p className="text-[11px] text-black/60 font-semibold mt-1">
                    {t('pricing.billedMonthly')}
                  </p>
                </div>

                <ul className="space-y-2 text-xs font-bold text-black/80">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature4')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature5')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature8')}</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Annual Plan (Popular) */}
              <div
                onClick={() => setBillingCycle('annual')}
                className={`relative rounded-3xl p-6 sm:p-7 border-2 border-black transition-all cursor-pointer text-start overflow-hidden ${
                  billingCycle === 'annual'
                    ? 'bg-white shadow-[0_8px_0_#000] ring-4 ring-black'
                    : 'bg-white/80 hover:bg-white shadow-[0_4px_0_#000] opacity-90'
                }`}
              >
                {/* Yellow Accent bar on top */}
                <div className="absolute top-0 inset-x-0 h-2 bg-[#FFE600] border-b border-black" />

                <div className="flex items-start justify-between gap-3 mb-4 pt-1">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-black tracking-widest text-black/60">
                        {t('pricing.annualBilling')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-[#FFE600] text-black border border-black shadow-2xs">
                        {t('auth.saveTwoMonthsBadge')}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-black mt-1">
                      {t('auth.yearlyPlan')}
                    </h3>
                    <p className="text-xs text-black/70 font-semibold mt-0.5">
                      {t('auth.yearlyPlanDesc')}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 ${
                      billingCycle === 'annual'
                        ? 'bg-black text-[#FFE600]'
                        : 'bg-white'
                    }`}
                  >
                    {billingCycle === 'annual' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black mb-5">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-black text-black">
                      98 000
                    </span>
                    <span className="text-sm font-black text-black">DA</span>
                    <span className="text-xs text-black/70 font-bold">{t('pricing.perYear')}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-800 font-black">
                    <span>{t('auth.saveTwoMonthsDetail')}</span>
                  </div>
                </div>

                <ul className="space-y-2 text-xs font-bold text-black/80">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature1')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature3')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature4')}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-black shrink-0 stroke-[3]" />
                    <span>{t('pricing.feature7')}</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Payment & Checkout Section */}
            <div className="max-w-2xl mx-auto bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-9 shadow-[0_10px_0_#000] space-y-6">
              <div className="text-start space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-black flex items-center gap-2">
                  <Lock className="w-5 h-5 text-black" />
                  <span>{t('auth.paymentMethod')}</span>
                </h3>
                <p className="text-xs text-black/70 font-semibold">
                  {t('auth.testModeNotice')}
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/5 rounded-2xl border-2 border-black">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cib')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    paymentMethod === 'cib'
                      ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t('auth.payWithCib')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ccp')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    paymentMethod === 'ccp'
                      ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                      : 'text-black/70 hover:text-black'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>{t('auth.payWithTransfer')}</span>
                </button>
              </div>

              {/* Payment Details */}
              {paymentMethod === 'cib' ? (
                /* Card Input Mock / Interactive */
                <div className="space-y-4 text-start">
                  <div>
                    <label className="block text-xs font-black text-black mb-1.5">
                      {t('auth.cardNumber')} <span className="text-rose-500 font-black">*</span>
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full ltr:pl-10 ltr:pr-3.5 rtl:pr-10 rtl:pl-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-mono font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-black mb-1.5">
                        {t('auth.cardExpiry')} <span className="text-rose-500 font-black">*</span>
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-mono font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-black mb-1.5">
                        {t('auth.cardCvv')} <span className="text-rose-500 font-black">*</span>
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                        className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-mono font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1.5">
                      {t('auth.cardHolder')} <span className="text-rose-500 font-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Nom et prénom"
                      className="w-full px-3.5 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
                    />
                  </div>
                </div>
              ) : (
                /* Bank / CCP Transfer Info */
                <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black text-start space-y-2 text-xs">
                  <div className="font-black text-black text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-black" />
                    <span>Algérie Poste — Coordonnées de paiement</span>
                  </div>
                  <div className="font-mono font-bold space-y-1 text-black/80 pt-1">
                    <p>CCP: <span className="text-black font-black">0012345678 Clé 99</span></p>
                    <p>RIP: <span className="text-black font-black">007 99999 0012345678 99</span></p>
                    <p>Bénéficiaire: <span className="text-black font-black">Hbibna SARL</span></p>
                  </div>
                  <p className="text-[11px] text-black/70 font-semibold pt-1">
                    {t('auth.payWithTransferDesc')}
                  </p>
                </div>
              )}

              {/* Order Summary */}
              <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black text-start space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-black/80">
                  <span>{t('auth.selectedPlan')}</span>
                  <span className="font-black text-black">
                    {isAnnual ? t('auth.yearlyPlan') : t('auth.monthlyPlan')}
                  </span>
                </div>
                <div className="flex items-center justify-between font-bold text-black/80">
                  <span>{t('auth.activationFee')}</span>
                  <span className="font-black text-emerald-700">{t('auth.free')}</span>
                </div>
                <div className="pt-2 border-t-2 border-black/10 flex items-center justify-between text-sm sm:text-base font-black text-black">
                  <span>{t('auth.totalDue')}</span>
                  <span className="text-xl sm:text-2xl font-black text-black">
                    {priceDisplay} DA {priceUnit}
                  </span>
                </div>
              </div>

              {/* Submit & Activate Button */}
              <button
                type="button"
                onClick={() => handlePayment()}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-black hover:bg-zinc-800 text-[#FFE600] font-black text-sm border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>
                  {loading
                    ? t('auth.processingPayment')
                    : `${t('auth.payAndAccess')} (${priceDisplay} DA)`}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-black/70">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Paiement sécurisé et chiffré SATIM • Accès immédiat au tableau de bord</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-bold text-black/70 border-t-2 border-black/10">
        <p>© {new Date().getFullYear()} {t('common.appName')}. {t('footer.allRightsReserved')}</p>
      </footer>
    </div>
  );
}
