'use client';

import React from 'react';
import { TransactionTable } from '@/components/business/TransactionTable';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Transaction } from '@/types/database';

export function TransactionsView({ transactions }: { transactions: Transaction[] }) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-start">
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          {t('business.transactionsTitle')}
        </h1>
        <p className="text-sm text-black/70 font-bold">
          {t('business.transactionsSubtitle')}
        </p>
      </div>

      <TransactionTable initialTransactions={transactions} />
    </div>
  );
}
