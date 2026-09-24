'use client';

import { useState, useTransition } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Coins,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { updateLoyaltyProgram, type UpdateLoyaltyResult } from '@/actions/loyalty';
import type { LoyaltyProgram, LoyaltyRuleType } from '@/types/database';

interface LoyaltyRuleFormProps {
  initialLoyalty: LoyaltyProgram;
}

export function LoyaltyRuleForm({ initialLoyalty }: LoyaltyRuleFormProps) {
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
    previewExplanation = `${previewPoints} points awarded on any purchase`;
  } else {
    if (!isNaN(parsedUnit) && parsedUnit > 0 && !isNaN(parsedPointsPerUnit) && parsedPointsPerUnit > 0) {
      const units = Math.floor(parsedAmount / parsedUnit);
      previewPoints = units * parsedPointsPerUnit;
      previewExplanation = `${parsedPointsPerUnit} point for every ${parsedUnit.toLocaleString()} DA spent`;
    } else {
      previewPoints = 0;
      previewExplanation = 'Enter valid rule parameters';
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
          message: 'Points per purchase must be a positive whole number greater than 0.',
        });
        return;
      }
    } else {
      const u = Number(currencyUnit);
      const pts = Number(pointsPerCurrency);
      if (isNaN(u) || u <= 0 || !Number.isInteger(u)) {
        setFeedback({
          type: 'error',
          message: 'The DA amount spent must be a positive whole number greater than 0 (e.g. 100 DA).',
        });
        return;
      }
      if (isNaN(pts) || pts <= 0 || !Number.isInteger(pts)) {
        setFeedback({
          type: 'error',
          message: 'Points awarded must be a positive whole number greater than 0 (e.g. 1 point).',
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append('ruleType', ruleType);
    formData.append('pointsPerPurchase', pointsPerPurchase);
    formData.append('currencyUnit', currencyUnit);
    formData.append('pointsPerCurrency', pointsPerCurrency);

    startTransition(async () => {
      try {
        const res: UpdateLoyaltyResult = await updateLoyaltyProgram(formData);
        if (res?.error) {
          setFeedback({ type: 'error', message: res.error });
        } else {
          setFeedback({
            type: 'success',
            message: 'Your loyalty points rule has been saved successfully in Supabase.',
          });
          setTimeout(() => setFeedback(null), 4000);
        }
      } catch {
        setFeedback({
          type: 'error',
          message: 'Failed to save changes. Please try again.',
        });
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header text */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191817] tracking-tight">
          Loyalty Program
        </h1>
        <p className="text-sm text-[#736B63]">
          Choose how your customers earn points.
        </p>
      </div>

      {/* Main Grid: Form (7 cols) + Live Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-4 sm:p-8 shadow-card space-y-6"
        >
          {/* Feedback alerts */}
          {feedback?.type === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {feedback?.type === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* Intro instruction */}
          <div>
            <h2 className="text-base font-bold text-[#191817]">
              Choose how Hbibna rewards your customers
            </h2>
            <p className="text-xs text-[#736B63] mt-0.5">
              Select the calculation method that best matches your business model.
            </p>
          </div>

          {/* Rule Selection Cards */}
          <div className="space-y-3">
            {/* Rule 1: Points per amount spent */}
            <div
              onClick={() => setRuleType('per_currency')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                ruleType === 'per_currency'
                  ? 'border-[#B88E3E] bg-[#FBF6EB]/70 shadow-xs'
                  : 'border-[#E6DDCF] bg-[#FFFFFF] hover:border-[#DFC99F]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      ruleType === 'per_currency'
                        ? 'bg-[#B88E3E] text-white shadow-soft'
                        : 'bg-[#FAF8F5] text-[#736B63]'
                    }`}
                  >
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#191817]">
                      Points per amount spent
                    </h3>
                    <p className="text-xs text-[#736B63] mt-0.5">
                      Customers earn points proportionally to how much they spend.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B88E3E]">
                      <span>Example: Every 100 DA spent = 1 point</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    ruleType === 'per_currency'
                      ? 'border-[#B88E3E] bg-[#B88E3E]'
                      : 'border-[#E6DDCF]'
                  }`}
                >
                  {ruleType === 'per_currency' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Editable Fields for Rule 2 */}
              {ruleType === 'per_currency' && (
                <div className="mt-4 pt-4 border-t border-[#DFC99F]/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#191817] mb-1">
                      For every amount spent:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={currencyUnit}
                        onChange={(e) => setCurrencyUnit(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#736B63]">
                        DA
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#191817] mb-1">
                      Customer earns:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={pointsPerCurrency}
                        onChange={(e) => setPointsPerCurrency(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#B88E3E]">
                        point(s)
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
                  ? 'border-[#B88E3E] bg-[#FBF6EB]/70 shadow-xs'
                  : 'border-[#E6DDCF] bg-[#FFFFFF] hover:border-[#DFC99F]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      ruleType === 'per_purchase'
                        ? 'bg-[#B88E3E] text-white shadow-soft'
                        : 'bg-[#FAF8F5] text-[#736B63]'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#191817]">
                      Points per purchase
                    </h3>
                    <p className="text-xs text-[#736B63] mt-0.5">
                      Award a flat number of points whenever a customer visits and makes any purchase.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#B88E3E]">
                      <span>Example: 10 points per purchase</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    ruleType === 'per_purchase'
                      ? 'border-[#B88E3E] bg-[#B88E3E]'
                      : 'border-[#E6DDCF]'
                  }`}
                >
                  {ruleType === 'per_purchase' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Editable Field for Rule 1 */}
              {ruleType === 'per_purchase' && (
                <div className="mt-4 pt-4 border-t border-[#DFC99F]/50">
                  <label className="block text-xs font-bold text-[#191817] mb-1">
                    Points awarded per visit / purchase:
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={pointsPerPurchase}
                      onChange={(e) => setPointsPerPurchase(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] font-semibold focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#B88E3E]">
                      points
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-bold text-sm shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isPending ? 'Saving Changes...' : 'Save Changes'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Right: Live Interactive Preview */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-4 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-[#E6DDCF]">
            <div className="w-9 h-9 rounded-xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#191817]">Live Preview</h3>
              <p className="text-xs text-[#736B63]">Updates dynamically as you adjust rules</p>
            </div>
          </div>

          {/* Test Amount Simulator */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#191817]">
              Sample Customer Purchase:
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="50"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full px-4 py-3 rounded-2xl border border-[#E6DDCF] bg-[#FAF8F5] text-base text-[#191817] font-bold focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#736B63]">
                DA
              </span>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {['1000', '2500', '5000', '10000'].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTestAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    testAmount === amt
                      ? 'bg-[#B88E3E] text-white'
                      : 'bg-[#FAF8F5] text-[#736B63] hover:text-[#191817] border border-[#E6DDCF]'
                  }`}
                >
                  {Number(amt).toLocaleString()} DA
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Result Card matching user's exact format */}
          <div className="p-6 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F] space-y-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#736B63]">
                Purchase
              </span>
              <p className="text-lg font-bold text-[#191817]">
                {parsedAmount.toLocaleString()} DA
              </p>
            </div>

            <div className="pt-3 border-t border-[#DFC99F]/60 space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#736B63]">
                Points earned
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#B88E3E] tracking-tight">
                  {previewPoints}
                </span>
                <span className="text-sm font-bold text-[#B88E3E]">points</span>
              </div>
            </div>

            <p className="text-xs text-[#736B63] font-medium pt-1">
              {previewExplanation}
            </p>
          </div>

          {/* Security Note */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF] flex items-start gap-3 text-xs text-[#736B63]">
            <ShieldCheck className="w-4 h-4 text-[#B88E3E] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Server-Side Security:</strong> This live preview is informational.
              All points are calculated and credited securely on Hbibna servers when counter purchases are recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
