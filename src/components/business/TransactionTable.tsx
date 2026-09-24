'use client';

import { useState } from 'react';
import { Search, Receipt, Gift, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { Transaction } from '@/types/database';

export function TransactionTable({
  initialTransactions,
}: {
  initialTransactions: Transaction[];
}) {
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
          <Search className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
          />
        </div>

        {/* Filter tabs */}
        <div className="grid grid-cols-3 sm:flex sm:items-center p-1 bg-[#FAF8F5] rounded-xl border border-[#E6DDCF] gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all truncate min-h-[36px] flex items-center justify-center ${
              filter === 'all'
                ? 'bg-[#FFFFFF] text-[#191817] shadow-xs'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('earn')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all truncate min-h-[36px] flex items-center justify-center ${
              filter === 'earn'
                ? 'bg-[#FFFFFF] text-[#191817] shadow-xs'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            Earned
          </button>
          <button
            onClick={() => setFilter('redeem')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all truncate min-h-[36px] flex items-center justify-center ${
              filter === 'redeem'
                ? 'bg-[#FFFFFF] text-[#191817] shadow-xs'
                : 'text-[#736B63] hover:text-[#191817]'
            }`}
          >
            Redeemed
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Table (md+) */}
      <div className="hidden md:block bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E6DDCF] text-xs font-semibold text-[#736B63] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Purchase Amount</th>
                <th className="px-6 py-3.5">Points</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DDCF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[#736B63]">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isEarn = tx.points > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isEarn
                              ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isEarn ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span>{tx.type === 'redeem' ? 'Redemption' : 'Earned'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#191817]">
                          {tx.customer?.name || 'Customer'}
                        </p>
                        {tx.customer?.phone && (
                          <p className="font-mono text-xs text-[#736B63]">
                            {tx.customer.phone}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-[#191817]">
                        {tx.amount > 0 ? `${tx.amount.toLocaleString()} DA` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-bold ${
                            isEarn ? 'text-[#B88E3E]' : 'text-rose-600'
                          }`}
                        >
                          {isEarn ? `+${tx.points}` : tx.points} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#736B63] max-w-xs truncate">
                        {tx.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-[#736B63]">
                        {new Date(tx.created_at).toLocaleString(undefined, {
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
          <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl p-8 text-center text-[#736B63]">
            No transactions found.
          </div>
        ) : (
          filtered.map((tx) => {
            const isEarn = tx.points > 0;
            return (
              <div
                key={tx.id}
                className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl p-4 space-y-2.5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-[#191817] text-sm truncate">
                      {tx.customer?.name || 'Customer'}
                    </p>
                    {tx.customer?.phone && (
                      <p className="font-mono text-xs text-[#736B63] mt-0.5">{tx.customer.phone}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                      isEarn
                        ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isEarn ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{isEarn ? `+${tx.points}` : tx.points} pts</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-[#736B63] pt-2 border-t border-[#E6DDCF]/60">
                  <span>
                    {tx.amount > 0 ? (
                      <span className="font-semibold text-[#191817]">{tx.amount.toLocaleString()} DA</span>
                    ) : (
                      'Redemption'
                    )}
                  </span>
                  <span>
                    {new Date(tx.created_at).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {tx.description && (
                  <p className="text-xs text-[#736B63] bg-[#FAF8F5] p-2 rounded-xl border border-[#E6DDCF]/50">
                    {tx.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
