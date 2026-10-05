'use client';

import React from 'react';
import Link from 'next/link';
import { CustomerLoyaltyCard } from '@/components/customer/CustomerLoyaltyCard';
import { CustomerActions } from '@/components/business/CustomerActions';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Gift,
  ArrowUpRight,
  Clock,
  Coins,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, Transaction, Reward, LoyaltyProgram, Business } from '@/types/database';

interface CustomerDetailClientViewProps {
  customer: Customer;
  customers: Customer[];
  customerTransactions: Transaction[];
  rewards: Reward[];
  business: Business | null;
  loyalty: LoyaltyProgram | null;
}

export function CustomerDetailClientView({
  customer,
  customers,
  customerTransactions,
  rewards,
  business,
  loyalty,
}: CustomerDetailClientViewProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Back button */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-xs font-black text-black hover:opacity-80 transition-opacity bg-white px-3.5 py-2 rounded-xl border-2 border-black shadow-[0_3px_0_#000]"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
          <span>{t('business.backToCustomers')}</span>
        </Link>
      </div>

      {/* Customer Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 text-start">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {customer.name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000]">
              {t('business.activeRegular')}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-black/70 font-bold">
            <div className="flex items-center gap-1.5 font-mono text-black dir-ltr">
              <Phone className="w-4 h-4 text-black stroke-[2.5]" />
              <span>{customer.phone}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-black stroke-[2.5]" />
              <span>
                {customer.email ||
                  (language === 'ar'
                    ? 'لا يوجد بريد مسجل'
                    : language === 'fr'
                    ? 'Aucun e-mail renseigné'
                    : 'No email provided')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-black stroke-[2.5]" />
              <span>
                {t('business.memberSince')}{' '}
                {new Date(customer.created_at).toLocaleDateString(
                  language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Action triggers: "Add Purchase" and "Redeem Reward" */}
        <CustomerActions
          customer={customer}
          customers={customers}
          rewards={rewards}
          loyaltyRule={loyalty}
        />
      </div>

      {/* Large Points Balance Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFE600] border-2 border-black shadow-[0_8px_0_#000] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-start">
            <span className="text-xs font-black uppercase tracking-wider text-black/80">
              {t('customer.pointsBalance')}
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black text-black tracking-tight font-mono">
                {customer.points_balance.toLocaleString()}
              </span>
              <span className="text-xl sm:text-2xl font-black text-black">
                {t('common.points')}
              </span>
            </div>
          </div>

          <div className="ltr:text-left rtl:text-right sm:ltr:text-right sm:rtl:text-left text-xs text-black/80 font-bold space-y-1 sm:max-w-xs">
            <p className="font-black text-black text-sm">
              {business?.name || 'Hbibna Loyalty Program'}
            </p>
            <p>
              {language === 'ar'
                ? 'يمكن استبدال النقاط في أي وقت عند الصندوق بالمكافآت والخصومات المتاحة.'
                : language === 'fr'
                ? 'Les points peuvent être échangés à tout moment au comptoir contre les récompenses du catalogue.'
                : 'Points can be redeemed anytime at the counter for active rewards catalog gifts.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Transaction History (7 cols) + Digital Pass / QR Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Transaction History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black tracking-tight">
              {t('business.transactionsTitle')}
            </h2>
            <span className="text-xs font-black bg-white px-2.5 py-1 rounded-xl border-2 border-black text-black font-mono shadow-[0_2px_0_#000]">
              {customerTransactions.length}
            </span>
          </div>

          <div className="bg-white border-2 border-black rounded-3xl shadow-[0_8px_0_#000] overflow-hidden divide-y-2 divide-black/10">
            {customerTransactions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF9D2] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_3px_0_#000]">
                  <Coins className="w-6 h-6 text-black stroke-[2.5]" />
                </div>
                <h4 className="font-black text-black text-base">{t('customer.noActivity')}</h4>
              </div>
            ) : (
              customerTransactions.map((tx) => {
                const isEarn = tx.points > 0;
                const isRedeem = tx.type === 'redeem';

                let detail = tx.description || (isEarn ? t('business.purchase') : t('business.redeem'));
                if (isRedeem && detail.startsWith('Redeemed: ')) {
                  detail = detail.replace('Redeemed: ', '');
                }

                return (
                  <div
                    key={tx.id}
                    className="p-5 flex items-center justify-between hover:bg-[#FFF9D2]/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black shadow-[0_2px_0_#000] ${
                          isEarn
                            ? 'bg-emerald-300 text-black'
                            : 'bg-rose-300 text-black'
                        }`}
                      >
                        {isEarn ? (
                          <ArrowUpRight className="w-5 h-5 rtl:rotate-90 stroke-[2.5]" />
                        ) : (
                          <Gift className="w-5 h-5 stroke-[2.5]" />
                        )}
                      </div>

                      <div className="text-start">
                        <p className="font-extrabold text-sm text-black">
                          {isRedeem ? detail : t('business.purchase')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-black/70 mt-0.5 font-semibold">
                          {isEarn && tx.amount > 0 && (
                            <span className="font-black text-black">
                              {tx.amount.toLocaleString()} {t('common.da')}
                            </span>
                          )}
                          {isRedeem && (
                            <span className="font-black text-rose-900">
                              {t('business.redeem')}
                            </span>
                          )}
                          <span className="text-black/30">•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-black/60" />
                            {new Date(tx.created_at).toLocaleDateString(
                              language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="ltr:text-right rtl:text-left">
                      <span
                        className={`text-sm font-black tracking-tight px-3 py-1 rounded-xl border-2 border-black shadow-[0_2px_0_#000] ${
                          isEarn
                            ? 'bg-amber-100 text-black'
                            : 'bg-neutral-100 text-black'
                        }`}
                      >
                        {isEarn ? `+${tx.points} ${t('common.pts')}` : `${tx.points} ${t('common.pts')}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Digital Loyalty Pass & QR (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-black tracking-tight">
              {t('customer.myPass')}
            </h2>
            <span className="text-xs text-black font-black underline">{t('customer.showQr')}</span>
          </div>

          <CustomerLoyaltyCard customer={customer} business={business} />
        </div>
      </div>
    </div>
  );
}
