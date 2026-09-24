import { Suspense } from 'react';
import { CustomerPortalLayoutClient } from '@/components/customer/CustomerPortalLayoutClient';
import { SARAH_MEMBERSHIPS, DEFAULT_CUSTOMERS } from '@/lib/data-service';

import CustomerLoading from './loading';

export const dynamic = 'force-dynamic';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<CustomerLoading />}>
      <CustomerPortalLayoutClient
        memberships={SARAH_MEMBERSHIPS}
        customerName={DEFAULT_CUSTOMERS[0].name}
        customerPhone={DEFAULT_CUSTOMERS[0].phone}
      >
        {children}
      </CustomerPortalLayoutClient>
    </Suspense>
  );
}
