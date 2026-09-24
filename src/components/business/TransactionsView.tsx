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
        <h1 className="text-2xl font-bold text-[#191817] tracking-tight">
          {t('business.transactionsTitle')}
        </h1>
        <p className="text-xs text-[#736B63]">
          {t('business.transactionsSubtitle')}
        </p>
      </div>

      <TransactionTable initialTransactions={transactions} />
    </div>
  );
}
