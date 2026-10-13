'use client';

import React, { useState, useTransition } from 'react';
import {
  Store,
  CreditCard,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Coins,
} from 'lucide-react';
import { updateBusinessProfile } from '@/actions/business';
import { useToast } from '@/components/ui/ToastProvider';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Business } from '@/types/database';

export function SettingsView({ business }: { business: Business }) {
  const { t, language } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToast();

  const [name, setName] = useState(business.name || '');
  const [email, setEmail] = useState(business.email || '');
  const [phone, setPhone] = useState(business.phone || '');
  const [currency, setCurrency] = useState(business.currency || 'DA');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toastError(
        language === 'ar'
          ? 'اسم النشاط التجاري مطلوب.'
          : language === 'fr'
          ? 'Le nom du commerce est requis.'
          : 'Business name is required.'
      );
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('currency', currency);

    startTransition(async () => {
      try {
        const res = await updateBusinessProfile(formData);
        if (res?.error) {
          toastError(res.error);
        } else {
          toastSuccess(t('business.profileUpdated') || 'Profil mis à jour avec succès.');
        }
      } catch {
        toastError(t('common.error'));
      }
    });
  };

  return (
    <div className="max-w-4xl space-y-8 text-start font-rounded">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('business.settingsTitle')}
        </h1>
        <p className="text-sm text-black/70 font-bold mt-1">
          {t('business.settingsSubtitle')}
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-[#FFE600] border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-black/15">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
              <CreditCard className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-black">{t('business.planTitle')}</h3>
                <span className="px-3 py-0.5 rounded-full text-xs font-black bg-black text-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]">
                  {t('business.planActive')}
                </span>
              </div>
              <p className="text-xs text-black/80 font-bold mt-0.5">
                {t('business.allInclusive')}
              </p>
            </div>
          </div>

          <div className="ltr:text-left sm:ltr:text-right rtl:text-right sm:rtl:text-left">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-black font-mono">
                {business.plan_price_da.toLocaleString()}
              </span>
              <span className="text-base font-black text-black">{t('common.da')}</span>
            </div>
            <span className="text-xs font-bold text-black/70">{t('pricing.perMonth')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000]">
            <span className="text-black/60 font-black">{t('business.enrolledMembers')}</span>
            <p className="font-black text-base text-black mt-1">{t('common.unlimited')}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000]">
            <span className="text-black/60 font-black">{t('nav.transactions')}</span>
            <p className="font-black text-base text-black mt-1">{t('common.unlimited')}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000]">
            <span className="text-black/60 font-black">{t('business.billingCycle')}</span>
            <p className="font-black text-base text-black mt-1">{t('business.autoRenew')}</p>
          </div>
        </div>
      </div>

      {/* Editable Business Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF9D2] border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Store className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-black">{t('business.businessProfile')}</h3>
              <p className="text-xs text-black/60 font-bold">{t('business.profileNotice')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              {t('auth.businessName')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Business Email */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              {t('auth.businessEmail')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@commerce.dz"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              {t('auth.contactPhone')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0550 12 34 56"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold dir-ltr text-start shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              {t('business.currency')}
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-black shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFE600] hover:bg-yellow-400 active:translate-y-1 active:shadow-none text-black text-sm font-black border-2 border-black shadow-[0_4px_0_#000] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isPending
                ? t('business.savingChanges') || 'Enregistrement...'
                : t('business.saveChanges') || 'Enregistrer les modifications'}
            </span>
          </button>
        </div>
      </form>

      {/* Multi-Tenancy & Security Verification */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-300 border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-lg text-black">{t('business.tenantSecurity')}</h3>
            <p className="text-xs text-black/60 font-bold">
              {t('business.tenantSecurityDesc')}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF9D2] border-2 border-black space-y-2 text-xs font-bold shadow-[0_3px_0_#000]">
          <div className="flex items-center justify-between font-mono text-xs text-black/70">
            <span className="font-black">{t('business.tenantUuid')}:</span>
            <span className="text-black font-black bg-white px-2 py-0.5 rounded-lg border border-black">{business.id}</span>
          </div>
          <p className="text-black/80 pt-1 leading-relaxed">
            {t('business.tenantNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}
