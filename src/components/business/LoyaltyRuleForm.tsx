'use client';

import { useState, useTransition } from 'react';
import {
  ShoppingBag,
  Coins,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Users,
  Gift,
  Sparkles,
} from 'lucide-react';
import { updateLoyaltyProgram, type UpdateLoyaltyResult } from '@/actions/loyalty';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { LoyaltyProgram, LoyaltyRuleType } from '@/types/database';

interface LoyaltyRuleFormProps {
  initialLoyalty: LoyaltyProgram;
}

export function LoyaltyRuleForm({ initialLoyalty }: LoyaltyRuleFormProps) {
  const { t, language } = useLanguage();
  const [ruleType, setRuleType] = useState<LoyaltyRuleType>(
    initialLoyalty?.rule_type || 'per_currency'
  );
  const [pointsPerPurchase, setPointsPerPurchase] = useState<string>(
    String(initialLoyalty?.points_per_purchase || 10)
  );
  const [currencyUnit, setCurrencyUnit] = useState<string>(
    String(initialLoyalty?.currency_unit || 100)
  );
  const [pointsPerCurrency, setPointsPerCurrency] = useState<string>(
    String(initialLoyalty?.points_per_currency || 1)
  );
  const [referralBonusPoints, setReferralBonusPoints] = useState<string>(
    String(initialLoyalty?.referral_bonus_points ?? 50)
  );
  const [refereeWelcomePoints, setRefereeWelcomePoints] = useState<string>(
    String(initialLoyalty?.referee_welcome_points ?? 25)
  );

  // Live simulation test purchase
  const [testAmount, setTestAmount] = useState<string>('2500');

  // Status & Validation
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Client-side dynamic preview calculation
  const parsedAmount = Math.max(0, parseFloat(testAmount) || 0);
  const parsedPointsPurchase = parseInt(pointsPerPurchase, 10);
  const parsedUnit = parseInt(currencyUnit, 10);
  const parsedPointsPerUnit = parseInt(pointsPerCurrency, 10);

  let previewPoints = 0;
  let previewExplanation = '';

  if (ruleType === 'per_purchase') {
    previewPoints = !isNaN(parsedPointsPurchase) && parsedPointsPurchase > 0 ? parsedPointsPurchase : 0;
    previewExplanation =
      language === 'ar'
        ? `${previewPoints} نقطة تُمنح مع كل عملية شراء`
        : language === 'fr'
        ? `${previewPoints} points attribués à chaque achat`
        : `${previewPoints} points awarded on any purchase`;
  } else {
    if (!isNaN(parsedUnit) && parsedUnit > 0 && !isNaN(parsedPointsPerUnit) && parsedPointsPerUnit > 0) {
      const units = Math.floor(parsedAmount / parsedUnit);
      previewPoints = units * parsedPointsPerUnit;
      previewExplanation =
        language === 'ar'
          ? `${parsedPointsPerUnit} نقطة لكل ${parsedUnit.toLocaleString()} د.ج تُنفق`
          : language === 'fr'
          ? `${parsedPointsPerUnit} point pour chaque ${parsedUnit.toLocaleString()} DA dépensés`
          : `${parsedPointsPerUnit} point for every ${parsedUnit.toLocaleString()} DA spent`;
    } else {
      previewPoints = 0;
      previewExplanation =
        language === 'ar'
          ? 'أدخل معايير صحيحة'
          : language === 'fr'
          ? 'Saisissez des paramètres valides'
          : 'Enter valid rule parameters';
    }
  }

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    // Client validation
    if (ruleType === 'per_purchase') {
      const p = Number(pointsPerPurchase);
      if (isNaN(p) || p <= 0 || !Number.isInteger(p)) {
        setFeedback({
          type: 'error',
          message:
            language === 'ar'
              ? 'يجب أن تكون النقاط عدداً صحيحاً أكبر من 0.'
              : language === 'fr'
              ? 'Le nombre de points par achat doit être un entier supérieur à 0.'
              : 'Points per purchase must be a positive whole number greater than 0.',
        });
        return;
      }
    } else {
      const u = Number(currencyUnit);
      const pts = Number(pointsPerCurrency);
      if (isNaN(u) || u <= 0 || !Number.isInteger(u)) {
        setFeedback({
          type: 'error',
          message:
            language === 'ar'
              ? 'يجب أن يكون المبلغ بالدينار عدداً صحيحاً موجباً (مثلاً 100 د.ج).'
              : language === 'fr'
              ? 'Le montant en DA doit être un entier supérieur à 0 (ex. 100 DA).'
              : 'The DA amount spent must be a positive whole number greater than 0 (e.g. 100 DA).',
        });
        return;
      }
      if (isNaN(pts) || pts <= 0 || !Number.isInteger(pts)) {
        setFeedback({
          type: 'error',
          message:
            language === 'ar'
              ? 'يجب أن تكون النقاط عدداً صحيحاً موجباً (مثلاً 1 نقطة).'
              : language === 'fr'
              ? 'Les points attribués doivent être un nombre entier positif (ex. 1 point).'
              : 'Points awarded must be a positive whole number greater than 0 (e.g. 1 point).',
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append('ruleType', ruleType);
    formData.append('pointsPerPurchase', pointsPerPurchase);
    formData.append('currencyUnit', currencyUnit);
    formData.append('pointsPerCurrency', pointsPerCurrency);
    formData.append('referralBonusPoints', referralBonusPoints);
    formData.append('refereeWelcomePoints', refereeWelcomePoints);

    startTransition(async () => {
      try {
        const res: UpdateLoyaltyResult = await updateLoyaltyProgram(formData);
        if (res?.error) {
          setFeedback({ type: 'error', message: res.error });
        } else {
          setFeedback({
            type: 'success',
            message:
              language === 'ar'
                ? 'تم حفظ قواعد برنامج الولاء بنجاح.'
                : language === 'fr'
                ? 'Les règles de votre programme de fidélité ont été enregistrées avec succès.'
                : 'Your loyalty points rule has been saved successfully in Supabase.',
          });
          setTimeout(() => setFeedback(null), 4000);
        }
      } catch {
        setFeedback({
          type: 'error',
          message: t('common.error'),
        });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header text */}
      <div className="space-y-1 text-start">
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('business.loyaltyTitle')}
        </h1>
        <p className="text-sm text-black/70 font-bold">
          {t('business.loyaltySubtitle')}
        </p>
      </div>

      {/* Main Grid: Form (7 cols) + Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white border-2 border-black rounded-3xl p-5 sm:p-8 shadow-[0_8px_0_#000] space-y-6 text-start"
        >
          {/* Feedback alerts */}
          {feedback?.type === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-300 border-2 border-black text-black text-xs font-black flex items-center gap-2.5 shadow-[0_3px_0_#000] animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
              <span>{feedback.message}</span>
            </div>
          )}

          {feedback?.type === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-300 border-2 border-black text-black text-xs font-black flex items-center gap-2.5 shadow-[0_3px_0_#000] animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Intro instruction */}
          <div>
            <h2 className="text-lg font-black text-black">
              {language === 'ar'
                ? 'حدد معادلة احتساب نقاط الولاء لعملائك'
                : language === 'fr'
                ? 'Choisissez le mode de calcul des points de fidélité'
                : 'Choose how Hbibna rewards your customers'}
            </h2>
            <p className="text-xs text-black/70 font-bold mt-0.5">
              {language === 'ar'
                ? 'اختر طريقة الاحتساب التي تناسب طبيعة وهوامش نشاطك التجاري.'
                : language === 'fr'
                ? 'Sélectionnez la méthode de calcul adaptée à votre modèle commercial.'
                : 'Select the calculation method that best matches your business model.'}
            </p>
          </div>

          {/* Rule Selection Cards */}
          <div className="space-y-3">
            {/* Rule 1: Points per amount spent */}
            <div
              onClick={() => setRuleType('per_currency')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                ruleType === 'per_currency'
                  ? 'border-2 border-black bg-[#FFE600] shadow-[0_4px_0_#000]'
                  : 'border-2 border-black/20 bg-white hover:border-black'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000] ${
                      ruleType === 'per_currency'
                        ? 'bg-black text-[#FFE600]'
                        : 'bg-[#FFF9D2] text-black'
                    }`}
                  >
                    <Coins className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-black">
                      {language === 'ar'
                        ? 'نقاط حسب المبلغ المنفق'
                        : language === 'fr'
                        ? 'Points selon le montant dépensé'
                        : 'Points per amount spent'}
                    </h3>
                    <p className="text-xs text-black/70 font-semibold mt-0.5">
                      {language === 'ar'
                        ? 'يكسب العميل النقاط بالتناسب مع قيمة مشترياته بالدينار.'
                        : language === 'fr'
                        ? 'Le client cumule des points proportionnellement au montant dépensé en DA.'
                        : 'Customers earn points proportionally to how much they spend.'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-black bg-white/70 px-2.5 py-0.5 rounded-lg border border-black/20">
                      <span>
                        {language === 'ar'
                          ? 'مثال: كل 100 د.ج مشتريات = 1 نقطة'
                          : language === 'fr'
                          ? 'Exemple : Chaque 100 DA dépensés = 1 point'
                          : 'Example: Every 100 DA spent = 1 point'}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 mt-0.5 ${
                    ruleType === 'per_currency'
                      ? 'bg-black'
                      : 'bg-white'
                  }`}
                >
                  {ruleType === 'per_currency' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
                  )}
                </div>
              </div>

              {/* Editable Fields for Rule 1 */}
              {ruleType === 'per_currency' && (
                <div className="mt-4 pt-4 border-t-2 border-black/20 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-black mb-1 uppercase tracking-wide">
                      {language === 'ar'
                        ? 'لكل مبلغ منفق قدره:'
                        : language === 'fr'
                        ? 'Pour chaque tranche de dépenses de :'
                        : 'For every amount spent:'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={currencyUnit}
                        onChange={(e) => setCurrencyUnit(e.target.value)}
                        className="w-full ltr:px-3.5 rtl:px-3.5 py-2.5 rounded-2xl border-2 border-black bg-white text-sm text-black font-black shadow-[0_2px_0_#000] focus:outline-none"
                      />
                      <span className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-black text-black">
                        {t('common.da')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-black mb-1 uppercase tracking-wide">
                      {language === 'ar'
                        ? 'يكسب العميل:'
                        : language === 'fr'
                        ? 'Le client gagne :'
                        : 'Customer earns:'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={pointsPerCurrency}
                        onChange={(e) => setPointsPerCurrency(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-black bg-white text-sm text-black font-black shadow-[0_2px_0_#000] focus:outline-none"
                      />
                      <span className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-black text-black">
                        {t('common.pts')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rule 2: Points per purchase */}
            <div
              onClick={() => setRuleType('per_purchase')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                ruleType === 'per_purchase'
                  ? 'border-2 border-black bg-[#FFE600] shadow-[0_4px_0_#000]'
                  : 'border-2 border-black/20 bg-white hover:border-black'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000] ${
                      ruleType === 'per_purchase'
                        ? 'bg-black text-[#FFE600]'
                        : 'bg-[#FFF9D2] text-black'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-black">
                      {language === 'ar'
                        ? 'نقاط ثابتة لكل زيارة/شراء'
                        : language === 'fr'
                        ? 'Points fixes par passage / achat'
                        : 'Points per purchase'}
                    </h3>
                    <p className="text-xs text-black/70 font-semibold mt-0.5">
                      {language === 'ar'
                        ? 'منح عدد محدد وثابت من النقاط مع كل عملية شراء بغض النظر عن قيمتها.'
                        : language === 'fr'
                        ? 'Attribuez un nombre fixe de points à chaque passage en caisse, quel que soit le montant.'
                        : 'Award a flat number of points whenever a customer visits and makes any purchase.'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-black bg-white/70 px-2.5 py-0.5 rounded-lg border border-black/20">
                      <span>
                        {language === 'ar'
                          ? 'مثال: 10 نقاط لكل عملية شراء'
                          : language === 'fr'
                          ? 'Exemple : 10 points par achat'
                          : 'Example: 10 points per purchase'}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border-2 border-black flex items-center justify-center shrink-0 mt-0.5 ${
                    ruleType === 'per_purchase'
                      ? 'bg-black'
                      : 'bg-white'
                  }`}
                >
                  {ruleType === 'per_purchase' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFE600]" />
                  )}
                </div>
              </div>

              {/* Editable Field for Rule 2 */}
              {ruleType === 'per_purchase' && (
                <div className="mt-4 pt-4 border-t-2 border-black/20">
                  <label className="block text-xs font-black text-black mb-1 uppercase tracking-wide">
                    {language === 'ar'
                      ? 'النقاط الممنوحة لكل زيارة/شراء:'
                      : language === 'fr'
                      ? 'Points attribués par visite / achat :'
                      : 'Points awarded per visit / purchase:'}
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={pointsPerPurchase}
                      onChange={(e) => setPointsPerPurchase(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-black bg-white text-sm text-black font-black shadow-[0_2px_0_#000] focus:outline-none"
                    />
                    <span className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-black text-black">
                      {t('common.pts')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. SYSTÈME D'AFFILIATION & PARRAINAGE */}
          <div className="bg-white border-2 border-black rounded-3xl p-5 sm:p-6 shadow-[0_6px_0_#000] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FFE600] border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
                  <Users className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-black">
                      {language === 'ar' ? 'نظام الإحالة والولاء الجماعي' : language === 'fr' ? 'Système d’Affiliation & Parrainage' : 'Referral & Affiliation System'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-300 text-black border border-black uppercase tracking-wider">
                      {language === 'ar' ? 'نمو تلقائي' : language === 'fr' ? 'Croissance Virale' : 'Viral Growth'}
                    </span>
                  </div>
                  <p className="text-xs text-black/70 font-semibold mt-0.5">
                    {language === 'ar'
                      ? 'مكافأة العملاء الذين يدعون أصدقاءهم للانضمام لبرنامج الولاء، مما يضاعف عدد زوار محلك تلقائياً.'
                      : language === 'fr'
                      ? 'Récompensez vos clients fidèles lorsqu’ils invitent leurs proches, démultipliant vos clients sans frais de pub.'
                      : 'Reward your customers when they refer friends, driving new visits organically.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t-2 border-black/10">
              {/* Parrain Bonus Points */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-black uppercase tracking-wide">
                  {language === 'ar' ? 'النقاط الممنوحة للمُحيل (الراعي) :' : language === 'fr' ? 'Points offerts au parrain :' : 'Points for the referrer:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={referralBonusPoints}
                    onChange={(e) => setReferralBonusPoints(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm text-black font-black shadow-[0_2px_0_#000] focus:outline-none"
                  />
                  <span className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-black text-black">
                    {t('common.pts')}
                  </span>
                </div>
                <p className="text-[11px] text-black/60 font-semibold">
                  {language === 'ar' ? 'يُمنح عند تسجيل الصديق بنجاح' : language === 'fr' ? 'Crédité dès que l’ami rejoint le programme' : 'Awarded when referred friend signs up'}
                </p>
              </div>

              {/* Referee Welcome Bonus Points */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-black uppercase tracking-wide">
                  {language === 'ar' ? 'نقاط الترحيب بالصديق (المُحال) :' : language === 'fr' ? 'Points de bienvenue au filleul :' : 'Welcome bonus for the friend:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={refereeWelcomePoints}
                    onChange={(e) => setRefereeWelcomePoints(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-black bg-white text-sm text-black font-black shadow-[0_2px_0_#000] focus:outline-none"
                  />
                  <span className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-xs font-black text-black">
                    {t('common.pts')}
                  </span>
                </div>
                <p className="text-[11px] text-black/60 font-semibold">
                  {language === 'ar' ? 'رصيد ترحيبي فوري في بطاقته' : language === 'fr' ? 'Crédité immédiatement sur son pass digital' : 'Instant welcome points on pass'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-black hover:bg-neutral-900 text-[#FFE600] font-black text-sm border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isPending ? t('common.saving') : t('business.saveLoyaltyRules')}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
            </button>
          </div>
        </form>

        {/* Right: Live Interactive Preview */}
        <div className="lg:col-span-5 bg-white border-2 border-black rounded-3xl p-5 sm:p-8 shadow-[0_8px_0_#000] space-y-6 text-start">
          <div className="flex items-center gap-2.5 pb-4 border-b-2 border-black/10">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE600] border-2 border-black text-black flex items-center justify-center shadow-[0_2px_0_#000]">
              <Calculator className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-black">
                {language === 'ar' ? 'معاينة تجريبية مباشرة' : language === 'fr' ? 'Aperçu en direct' : 'Live Preview'}
              </h3>
              <p className="text-xs text-black/60 font-bold">
                {language === 'ar'
                  ? 'يتم التحديث تلقائياً أثناء تعديل القواعد'
                  : language === 'fr'
                  ? 'Mis à jour automatiquement selon vos règles'
                  : 'Updates dynamically as you adjust rules'}
              </p>
            </div>
          </div>

          {/* Test Amount Simulator */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-black uppercase tracking-wide">
              {language === 'ar'
                ? 'تجربة مبلغ شراء عشوائي:'
                : language === 'fr'
                ? 'Simulation d\'un montant d\'achat :'
                : 'Sample Customer Purchase:'}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="2500"
                className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-base text-black font-black shadow-[0_3px_0_#000] focus:bg-white focus:outline-none"
              />
              <span className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-xs font-black text-black">
                {t('common.da')}
              </span>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {['1000', '2500', '5000', '10000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTestAmount(amt)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border-2 border-black ${
                    testAmount === amt
                      ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                      : 'bg-white text-black hover:bg-[#FFF9D2]'
                  }`}
                >
                  {Number(amt).toLocaleString()} {t('common.da')}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Result Card */}
          <div className="p-6 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_4px_0_#000] space-y-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-black text-black/70">
                {t('business.purchase')}
              </span>
              <p className="text-xl font-black text-black font-mono">
                {parsedAmount.toLocaleString()} {t('common.da')}
              </p>
            </div>

            <div className="pt-3 border-t-2 border-black/15 space-y-1">
              <span className="text-xs uppercase tracking-wider font-black text-black/70">
                {language === 'ar' ? 'النقاط المحتسبة' : language === 'fr' ? 'Points cumulés' : 'Points earned'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-black tracking-tight font-mono">
                  {previewPoints}
                </span>
                <span className="text-base font-black text-black">{t('common.points')}</span>
              </div>
            </div>

            <p className="text-xs text-black/80 font-bold pt-1">
              {previewExplanation}
            </p>
          </div>

          {/* Referral Bonus Preview Badge */}
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_3px_0_#000] space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-black">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{language === 'ar' ? 'مكافآت الإحالة النشطة' : language === 'fr' ? 'Gains d’affiliation configurés' : 'Configured Referral Rewards'}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-black/10">
              <span className="text-black/70">{language === 'ar' ? 'للمُحيل (الراعي) :' : language === 'fr' ? 'Pour le parrain :' : 'For Referrer:'}</span>
              <span className="font-mono font-black text-black bg-[#FFE600] px-2 py-0.5 rounded-lg border border-black">+{referralBonusPoints || 0} pts</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-black/70">{language === 'ar' ? 'للصديق (الترحيب) :' : language === 'fr' ? 'Pour le filleul :' : 'For Referee:'}</span>
              <span className="font-mono font-black text-black bg-emerald-200 px-2 py-0.5 rounded-lg border border-black">+{refereeWelcomePoints || 0} pts</span>
            </div>
          </div>

          {/* Security Note */}
          <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black shadow-[0_2px_0_#000] flex items-start gap-3 text-xs text-black font-medium">
            <ShieldCheck className="w-5 h-5 text-black shrink-0 mt-0.5 stroke-[2.5]" />
            <p className="leading-relaxed">
              <strong>
                {language === 'ar'
                  ? 'حساب آمن وموثوق:'
                  : language === 'fr'
                  ? 'Sécurité côté serveur :'
                  : 'Server-Side Security:'}
              </strong>{' '}
              {language === 'ar'
                ? 'تتم جميع حسابات النقاط والعمليات المالية عبر خوادم Hbibna بأمان تام عند تسجيل كل عملية شراء لدى الصندوق.'
                : language === 'fr'
                ? 'Tous les calculs de points sont exécutés en toute sécurité sur les serveurs Hbibna lors de l\'enregistrement en caisse.'
                : 'All points are calculated and credited securely on Hbibna servers when counter purchases are recorded.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
