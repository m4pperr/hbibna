'use client';

import React from 'react';
import {
  Store,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Business } from '@/types/database';

export function SettingsView({ business }: { business: Business }) {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-4xl space-y-8 text-start">
      <div>
        <h1 className="text-2xl font-bold text-[#191817] tracking-tight">
          {t('business.settingsTitle')}
        </h1>
        <p className="text-xs text-[#736B63] mt-1">
          {t('business.settingsSubtitle')}
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-[#FFFFFF] border-2 border-[#B88E3E] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6DDCF]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#191817]">{t('business.planTitle')}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {t('business.planActive')}
                </span>
              </div>
              <p className="text-xs text-[#736B63]">
                {t('business.allInclusive')}
              </p>
            </div>
          </div>

          <div className="ltr:text-left sm:ltr:text-right rtl:text-right sm:rtl:text-left">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#191817] font-mono">
                {business.plan_price_da.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-[#B88E3E]">{t('common.da')}</span>
            </div>
            <span className="text-xs text-[#736B63]">{t('pricing.perMonth')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF]">
            <span className="text-[#736B63]">{t('business.enrolledMembers')}</span>
            <p className="font-bold text-sm text-[#191817] mt-0.5">{t('common.unlimited')}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF]">
            <span className="text-[#736B63]">{t('nav.transactions')}</span>
            <p className="font-bold text-sm text-[#191817] mt-0.5">{t('common.unlimited')}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF]">
            <span className="text-[#736B63]">{t('business.billingCycle')}</span>
            <p className="font-bold text-sm text-[#191817] mt-0.5">{t('business.autoRenew')}</p>
          </div>
        </div>
      </div>

      {/* Business Profile Details */}
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#191817] flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#191817]">{t('business.businessProfile')}</h3>
            <p className="text-xs text-[#736B63]">{t('business.profileNotice')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              {t('auth.businessName')}
            </label>
            <input
              type="text"
              readOnly
              value={business.name}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              {t('auth.businessEmail')}
            </label>
            <input
              type="email"
              readOnly
              value={business.email || (language === 'ar' ? 'غير محدد' : 'Not set')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              {t('auth.contactPhone')}
            </label>
            <input
              type="tel"
              readOnly
              value={business.phone || (language === 'ar' ? 'غير محدد' : 'Not set')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817] dir-ltr text-start"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              {t('business.currency')}
            </label>
            <input
              type="text"
              readOnly
              value={business.currency || t('common.da')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817] font-bold"
            />
          </div>
        </div>
      </div>

      {/* Multi-Tenancy & Security Verification */}
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#191817]">{t('business.tenantSecurity')}</h3>
            <p className="text-xs text-[#736B63]">
              {t('business.tenantSecurityDesc')}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#736B63]">
            <span>{t('business.tenantUuid')}:</span>
            <span className="text-[#191817] font-semibold">{business.id}</span>
          </div>
          <p className="text-[#736B63] pt-1 leading-relaxed">
            {t('business.tenantNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}
