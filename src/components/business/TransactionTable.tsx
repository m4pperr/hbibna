'use client';

import { useState } from 'react';
import { Search, Receipt, Gift, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Transaction } from '@/types/database';

export function TransactionTable({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'earn' | 'redeem'>('all');
  const [search, setSearch] = useState('');

  const filtered = initialTransactions.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (t.customer?.name && t.customer.name.toLowerCase().includes(s)) ||
      (t.customer?.phone && t.customer.phone.includes(s)) ||
      (t.description && t.description.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-4">
      {/* Filters & search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-black/60 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={t('business.searchTransactions')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm text-black font-bold placeholder:text-black/40 focus:bg-white focus:outline-none shadow-[0_4px_0_#000] transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="grid grid-cols-3 sm:flex sm:items-center p-1.5 bg-white rounded-2xl border-2 border-black gap-1.5 shadow-[0_4px_0_#000]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black text-center transition-all truncate min-h-[36px] flex items-center justify-center cursor-pointer ${
              filter === 'all'
                ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                : 'text-black/70 hover:text-black hover:bg-black/5'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => setFilter('earn')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black text-center transition-all truncate min-h-[36px] flex items-center justify-center cursor-pointer ${
              filter === 'earn'
                ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                : 'text-black/70 hover:text-black hover:bg-black/5'
            }`}
          >
            {t('customer.earnedPts')}
          </button>
          <button
            onClick={() => setFilter('redeem')}
            className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-black text-center transition-all truncate min-h-[36px] flex items-center justify-center cursor-pointer ${
              filter === 'redeem'
                ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                : 'text-black/70 hover:text-black hover:bg-black/5'
            }`}
          >
            {t('customer.spentPts')}
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Table (md+) */}
      <div className="hidden md:block bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[0_8px_0_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-[#FFE600] border-b-2 border-black text-xs font-black text-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-start">{t('common.type')}</th>
                <th className="px-6 py-4 text-start">{t('common.customer')}</th>
                <th className="px-6 py-4 text-start">{t('common.amount')}</th>
                <th className="px-6 py-4 text-start">{t('common.points')}</th>
                <th className="px-6 py-4 text-start">{t('common.actions')}</th>
                <th className="px-6 py-4 ltr:text-right rtl:text-left">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10 font-bold">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-black/60 font-bold">
                    {t('customer.noActivity')}
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isEarn = tx.points > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#FFF9D2]/40 transition-colors">
                      {/* Type Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border-2 border-black shadow-[0_2px_0_#000] ${
                            isEarn
                              ? 'bg-emerald-300 text-black'
                              : 'bg-rose-300 text-black'
                          }`}
                        >
                          {isEarn ? (
                            <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90 stroke-[2.5]" />
                          ) : (
                            <Gift className="w-3.5 h-3.5 stroke-[2.5]" />
                          )}
                          <span>{isEarn ? t('business.purchase') : t('business.redeem')}</span>
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-extrabold text-black">
                            {tx.customer?.name || (language === 'ar' ? 'زبون' : language === 'fr' ? 'Client' : 'Customer')}
                          </p>
                          {tx.customer?.phone && (
                            <p className="text-xs text-black/60 font-mono dir-ltr text-start font-semibold">{tx.customer.phone}</p>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-black font-extrabold">
                        {tx.amount > 0 ? `${tx.amount.toLocaleString()} ${t('common.da')}` : '—'}
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4">
                        <span
                          className={`font-black font-mono text-sm px-2.5 py-1 rounded-xl border border-black/20 ${
                            isEarn ? 'bg-amber-100 text-black' : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {isEarn ? `+${tx.points}` : tx.points} {t('common.pts')}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-xs text-black/70 max-w-xs truncate font-medium">
                        {tx.description || '—'}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 ltr:text-right rtl:text-left text-xs text-black/60 font-semibold">
                        {new Date(tx.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (<md) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-3xl p-8 text-center text-black/60 font-bold shadow-[0_6px_0_#000]">
            {t('customer.noActivity')}
          </div>
        ) : (
          filtered.map((tx) => {
            const isEarn = tx.points > 0;
            return (
              <div
                key={tx.id}
                className="bg-white border-2 border-black rounded-2xl p-4 space-y-3 shadow-[0_6px_0_#000] text-start"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border-2 border-black shadow-[0_2px_0_#000] ${
                        isEarn
                          ? 'bg-emerald-300 text-black'
                          : 'bg-rose-300 text-black'
                      }`}
                    >
                      {isEarn ? (
                        <ArrowUpRight className="w-3 h-3 rtl:rotate-90 stroke-[2.5]" />
                      ) : (
                        <Gift className="w-3 h-3 stroke-[2.5]" />
                      )}
                      <span>{isEarn ? t('business.purchase') : t('business.redeem')}</span>
                    </span>
                  </div>

                  <span
                    className={`font-black font-mono text-sm px-2 py-0.5 rounded-lg border border-black/20 ${
                      isEarn ? 'bg-amber-100 text-black' : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {isEarn ? `+${tx.points}` : tx.points} {t('common.pts')}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="font-black text-sm text-black">
                      {tx.customer?.name || (language === 'ar' ? 'زبون' : language === 'fr' ? 'Client' : 'Customer')}
                    </p>
                    {tx.customer?.phone && (
                      <p className="text-xs text-black/60 font-mono dir-ltr text-start font-semibold">{tx.customer.phone}</p>
                    )}
                  </div>

                  {tx.amount > 0 && (
                    <span className="text-xs font-black text-black">
                      {tx.amount.toLocaleString()} {t('common.da')}
                    </span>
                  )}
                </div>

                {tx.description && (
                  <p className="text-xs text-black/80 bg-[#FFF9D2] p-2.5 rounded-xl border-2 border-black/10 font-medium">
                    {tx.description}
                  </p>
                )}

                <div className="text-[11px] text-black/60 pt-2 border-t-2 border-black/10 ltr:text-right rtl:text-left font-semibold">
                  {new Date(tx.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
