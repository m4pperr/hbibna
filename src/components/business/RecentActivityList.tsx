'use client';

import { Receipt, Gift, ArrowUpRight, Clock } from 'lucide-react';
import type { Transaction } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface RecentActivityListProps {
  transactions: Transaction[];
}

export function RecentActivityList({ transactions }: RecentActivityListProps) {
  const { t, language } = useLanguage();

  if (transactions.length === 0) {
    return (
      <div className="bg-white border-2 border-black rounded-3xl p-10 text-center space-y-3 shadow-[0_8px_0_#000] font-rounded">
        <div className="w-14 h-14 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_3px_0_#000]">
          <Receipt className="w-7 h-7" />
        </div>
        <h4 className="font-black text-black text-lg">{t('business.noRecentActivity')}</h4>
        <p className="text-xs text-black/70 font-semibold max-w-sm mx-auto">
          {t('business.startByScanning')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-black rounded-3xl shadow-[0_8px_0_#000] overflow-hidden divide-y-2 divide-black/10 font-rounded">
      {transactions.map((tx) => {
        const isEarn = tx.points > 0;
        const customerName =
          tx.customer?.name ||
          (language === 'ar' ? 'زبون مميز' : language === 'fr' ? 'Client privilégié' : 'Valued Customer');
        const isRedemption = tx.type === 'redeem';

        // Detail text
        let detail = tx.description || '';
        if (isEarn && tx.amount > 0) {
          detail = `${tx.amount.toLocaleString()} ${t('common.da')}`;
        } else if (isRedemption && detail.startsWith('Redeemed: ')) {
          detail = detail.replace('Redeemed: ', '');
        }

        const dateLocale = language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US';
        const formattedDate = new Date(tx.created_at).toLocaleDateString(dateLocale, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div
            key={tx.id}
            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FFF9D2]/50 transition-colors"
          >
            {/* Left side: Icon + Customer Name + Category / Detail */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border-2 border-black shadow-[0_2px_0_#000] ${
                  isEarn
                    ? 'bg-[#FFDE59] text-black'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {isEarn ? (
                  <ArrowUpRight className="w-5 h-5 rtl:rotate-90 text-black stroke-[2.5]" />
                ) : (
                  <Gift className="w-5 h-5 text-rose-700 stroke-[2.5]" />
                )}
              </div>

              <div className="text-start">
                <p className="font-black text-black text-base">
                  {customerName}
                </p>
                <div className="flex items-center gap-2 text-xs text-black/70 mt-0.5">
                  <span className="font-black text-black">
                    {isRedemption ? t('business.redeem') : t('business.purchase')}
                  </span>
                  {detail && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-black/80">{detail}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Points badge in gold + Time */}
            <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0">
              <span
                className={`text-xs font-black tracking-tight px-3 py-1 rounded-full border-2 border-black shadow-[0_2px_0_#000] ${
                  isEarn
                    ? 'bg-black text-[#FFE600]'
                    : 'bg-white text-black'
                }`}
              >
                {isEarn ? `+${tx.points} ${t('common.pts')}` : `${tx.points} ${t('common.pts')}`}
              </span>
              <span className="text-[11px] text-black/60 font-bold flex items-center gap-1 mt-1.5">
                <Clock className="w-3 h-3 text-black/60" />
                <span suppressHydrationWarning>{formattedDate}</span>
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
