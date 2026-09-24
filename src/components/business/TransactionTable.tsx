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
          <Search className="w-4 h-4 text-[#736B63] absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('business.searchTransactions')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
          />
        </div>

        {/* Filter tabs */}
        <div className="grid grid-cols-3 sm:flex sm:items-center p-1 bg-[#FAF8F5] rounded-xl border border-[#E6DDCF] gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all truncate min-h-[36px] flex items-center justify-center cursor-pointer ${
              filter === 'all'
                ? 'bg-[#FFFFFF] text-[#191817] shadow-xs font-bold'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            {t('common.all')}
          </button>
          <button
            onClick={() => setFilter('earn')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all truncate min-h-[36px] flex items-center justify-center cursor-pointer ${
              filter === 'earn'
                ? 'bg-[#FFFFFF] text-[#191817] shadow-xs font-bold'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            {t('customer.earnedPts')}
          </button>
          <button
            onClick={() => setFilter('redeem')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all truncate min-h-[36px] flex items-center justify-center cursor-pointer ${
              filter === 'redeem'
                ? 'bg-[#FFFFFF] text-[#191817] shadow-xs font-bold'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            {t('customer.spentPts')}
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Table (md+) */}
      <div className="hidden md:block bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E6DDCF] text-xs font-semibold text-[#736B63] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 text-start">{t('common.type')}</th>
                <th className="px-6 py-3.5 text-start">{t('common.customer')}</th>
                <th className="px-6 py-3.5 text-start">{t('common.amount')}</th>
                <th className="px-6 py-3.5 text-start">{t('common.points')}</th>
                <th className="px-6 py-3.5 text-start">{t('common.actions')}</th>
                <th className="px-6 py-3.5 ltr:text-right rtl:text-left">{t('common.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DDCF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#736B63]">
                    {t('customer.noActivity')}
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isEarn = tx.points > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* Type Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isEarn
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isEarn ? (
                            <ArrowUpRight className="w-3.5 h-3.5 rtl:rotate-90" />
                          ) : (
                            <Gift className="w-3.5 h-3.5" />
                          )}
                          <span>{isEarn ? t('business.purchase') : t('business.redeem')}</span>
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#191817]">
                            {tx.customer?.name || (language === 'ar' ? 'زبون' : 'Customer')}
                          </p>
                          {tx.customer?.phone && (
                            <p className="text-xs text-[#736B63] font-mono dir-ltr text-start">{tx.customer.phone}</p>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-[#191817] font-semibold">
                        {tx.amount > 0 ? `${tx.amount.toLocaleString()} ${t('common.da')}` : '—'}
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4">
                        <span
                          className={`font-black font-mono text-sm ${
                            isEarn ? 'text-[#B88E3E]' : 'text-rose-600'
                          }`}
                        >
                          {isEarn ? `+${tx.points}` : tx.points} {t('common.pts')}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-xs text-[#736B63] max-w-xs truncate">
                        {tx.description || '—'}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 ltr:text-right rtl:text-left text-xs text-[#736B63]">
                        {new Date(tx.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', {
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
      <div className="block md:hidden space-y-2.5">
        {filtered.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl p-8 text-center text-[#736B63]">
            {t('customer.noActivity')}
          </div>
        ) : (
          filtered.map((tx) => {
            const isEarn = tx.points > 0;
            return (
              <div
                key={tx.id}
                className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl p-4 space-y-3 shadow-soft text-start"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isEarn
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isEarn ? (
                        <ArrowUpRight className="w-3 h-3 rtl:rotate-90" />
                      ) : (
                        <Gift className="w-3 h-3" />
                      )}
                      <span>{isEarn ? t('business.purchase') : t('business.redeem')}</span>
                    </span>
                  </div>

                  <span
                    className={`font-black font-mono text-sm ${
                      isEarn ? 'text-[#B88E3E]' : 'text-rose-600'
                    }`}
                  >
                    {isEarn ? `+${tx.points}` : tx.points} {t('common.pts')}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="font-semibold text-sm text-[#191817]">
                      {tx.customer?.name || (language === 'ar' ? 'زبون' : 'Customer')}
                    </p>
                    {tx.customer?.phone && (
                      <p className="text-xs text-[#736B63] font-mono dir-ltr text-start">{tx.customer.phone}</p>
                    )}
                  </div>

                  {tx.amount > 0 && (
                    <span className="text-xs font-bold text-[#191817]">
                      {tx.amount.toLocaleString()} {t('common.da')}
                    </span>
                  )}
                </div>

                {tx.description && (
                  <p className="text-xs text-[#736B63] bg-[#FAF8F5] p-2 rounded-xl border border-[#E6DDCF]/60">
                    {tx.description}
                  </p>
                )}

                <div className="text-[11px] text-[#736B63] pt-1 border-t border-[#E6DDCF]/60 ltr:text-right rtl:text-left">
                  {new Date(tx.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'en-US', {
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
