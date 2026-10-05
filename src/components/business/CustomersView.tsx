'use client';

import React from 'react';
import { CustomerTable } from '@/components/business/CustomerTable';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, LoyaltyProgram } from '@/types/database';

export function CustomersView({
  customers,
  loyalty,
}: {
  customers: Customer[];
  loyalty?: LoyaltyProgram | null;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 font-rounded">
      <div className="space-y-1 text-start">
        <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
          {t('business.customersTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-black/75 font-semibold">
          {t('business.customersSubtitle')}
        </p>
      </div>

      <CustomerTable initialCustomers={customers} loyaltyRule={loyalty} />
    </div>
  );
}
