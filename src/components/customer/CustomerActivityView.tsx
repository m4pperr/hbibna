'use client';

import { ArrowUpRight, ArrowDownRight, Clock, Store } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type {
  Customer,
  CustomerBusinessMembership,
  Transaction,
  Business,
} from '@/types/database';

interface CustomerActivityViewProps {
  customer: Customer | null;
  activeMembership: CustomerBusinessMembership;
  transactions: Transaction[];
  business?: Business | null;
}

export function CustomerActivityView({
  customer,
  activeMembership,
  transactions,
  business,
}: CustomerActivityViewProps) {
  const { t, isRtl, language } = useLanguage();

  const activeBusinessName = business?.name || activeMembership.business?.name || 'Commerce Partenaire';
  const pointsBalance = activeMembership.points_balance;

  const displayTransactions =
    transactions.length > 0
      ? transactions
      : [
          {
            id: '1',
            points: 25,
            type: 'earn' as const,
            amount: 2500,
            business_id: activeMembership.business_id,
            customer_id: customer?.id || 'c1-sarah',
            description: t('business.purchase'),
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            points: 50,
            type: 'earn' as const,
            amount: 5000,
            business_id: activeMembership.business_id,
            customer_id: customer?.id || 'c1-sarah',
            description: t('business.purchase'),
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            points: -500,
            type: 'redeem' as const,
            amount: 0,
            business_id: activeMembership.business_id,
            customer_id: customer?.id || 'c1-sarah',
            description: t('customer.spentPts'),
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];

  return (
    <div className="space-y-6 font-rounded">
      {/* Page Header */}
      <div className="space-y-1 pb-4 border-b-2 border-black/15">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-black/70">
            {t('customer.activityLedger')}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000] flex items-center gap-1">
            <Store className="w-3 h-3 stroke-[2.5]" />
            <span>{activeBusinessName}</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('customer.recentActivity')}
        </h1>
        <p className="text-sm text-black/70 font-bold">
          {t('customer.allTransactions')} • <span className="font-black text-black">{activeBusinessName}</span>
        </p>
      </div>

      {/* Summary Balance Strip */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#FFE600] border-2 border-black shadow-[0_8px_0_#000] flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-black tracking-wider text-black/70 block">
            {activeBusinessName} • {t('customer.balance')}
          </span>
          <h2 className="text-base sm:text-lg font-black text-black">
            {customer?.name || 'Sarah Benali'}
          </h2>
        </div>
        <div className={isRtl ? 'text-left' : 'text-right'}>
          <span className="text-3xl sm:text-4xl font-black text-black font-mono">
            {pointsBalance.toLocaleString()}
          </span>
          <span className="text-xs font-black text-black uppercase"> {t('common.pts')}</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[0_8px_0_#000] divide-y-2 divide-black/10 font-bold">
        {displayTransactions.length === 0 ? (
          <div className="p-12 text-center text-sm text-black/60 font-bold">
            {t('customer.noActivity')}
          </div>
        ) : (
          displayTransactions.map((tx) => {
            const isEarn = tx.points > 0;
            return (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FFF9D2]/40 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black shadow-[0_2px_0_#000] ${
                      isEarn
                        ? 'bg-emerald-300 text-black'
                        : 'bg-rose-300 text-black'
                    }`}
                  >
                    {isEarn ? (
                      <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-black">
                      {tx.description || (isEarn ? t('business.purchase') : t('customer.spentPts'))}
                    </h3>
                    <p className="text-xs text-black/60 font-semibold mt-0.5">
                      {tx.amount && tx.amount > 0 ? (
                        <span className="font-black text-black">
                          {tx.amount.toLocaleString()} {t('common.da')} •{' '}
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 inline text-black/60" />
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
                    </p>
                  </div>
                </div>

                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <span
                    className={`text-sm font-black font-mono px-2.5 py-1 rounded-xl border border-black/20 ${
                      isEarn ? 'bg-amber-100 text-black' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {isEarn ? `+${tx.points}` : tx.points}
                  </span>
                  <span className="text-[10px] uppercase font-black text-black/60 block mt-0.5">
                    {t('business.points')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
