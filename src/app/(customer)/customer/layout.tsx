import { Suspense } from 'react';
import { CustomerPortalLayoutClient } from '@/components/customer/CustomerPortalLayoutClient';
import { fetchCustomerPortalData } from '@/lib/data-service';

import CustomerLoading from './loading';

export const dynamic = 'force-dynamic';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const portalData = await fetchCustomerPortalData();

  return (
    <Suspense fallback={<CustomerLoading />}>
      <CustomerPortalLayoutClient
        memberships={portalData.memberships}
        activeBusinessId={portalData.activeMembership?.business_id}
        customerName={portalData.customer?.name || ''}
        customerPhone={portalData.customer?.phone || ''}
      >
        {children}
      </CustomerPortalLayoutClient>
    </Suspense>
  );
}
