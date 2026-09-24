'use client';

import { Receipt, Gift, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import type { Transaction } from '@/types/database';
import Link from 'next/link';

interface RecentActivityListProps {
  transactions: Transaction[];
}

export function RecentActivityList({ transactions }: RecentActivityListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-10 text-center space-y-3 shadow-soft">
        <div className="w-12 h-12 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] flex items-center justify-center mx-auto">
          <Receipt className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-[#191817] text-base">No recent activity yet</h4>
        <p className="text-xs text-[#736B63] max-w-sm mx-auto">
          When you record purchases or redeem rewards for customers, the activity ledger will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl shadow-soft overflow-hidden divide-y divide-[#E6DDCF]">
      {transactions.map((tx) => {
        const isEarn = tx.points > 0;
        const customerName = tx.customer?.name || 'Valued Customer';
        const isRedemption = tx.type === 'redeem';

        // Detail text (e.g. "2,500 DA" for purchase, or "Free Coffee" from description)
        let detail = tx.description || '';
        if (isEarn && tx.amount > 0) {
          detail = `${tx.amount.toLocaleString()} DA`;
        } else if (isRedemption && detail.startsWith('Redeemed: ')) {
          detail = detail.replace('Redeemed: ', '');
        }

        const formattedDate = new Date(tx.created_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={tx.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF8F5]/80 transition-colors"
          >
            {/* Left side: Icon + Customer Name + Category / Detail */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  isEarn
                    ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/40 shadow-xs'
                    : 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                }`}
              >
                {isEarn ? (
                  <ArrowUpRight className="w-5 h-5 text-[#B88E3E]" />
                ) : (
                  <Gift className="w-5 h-5 text-rose-600" />
                )}
              </div>

              <div>
                <p className="font-bold text-[#191817] text-sm">
                  {customerName}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#736B63] mt-0.5">
                  <span className="font-medium text-[#191817]">
                    {isRedemption ? 'Reward Redemption' : 'Purchase'}
                  </span>
                  {detail && (
                    <>
                      <span className="text-[#E6DDCF]">•</span>
                      <span className="font-semibold text-[#191817]">{detail}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Points badge in gold + Time */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0">
              <span
                className={`text-sm font-extrabold tracking-tight px-3 py-1 rounded-full ${
                  isEarn
                    ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60'
                    : 'bg-zinc-100 text-[#191817] border border-zinc-200'
                }`}
              >
                {isEarn ? `+${tx.points} points` : `${tx.points} points`}
              </span>
              <span className="text-[11px] text-[#736B63] flex items-center gap-1 mt-1 font-medium">
                <Clock className="w-3 h-3 text-[#736B63]" />
                <span suppressHydrationWarning>{formattedDate}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
