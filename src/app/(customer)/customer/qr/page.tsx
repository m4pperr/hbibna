import { fetchCustomerPortalData } from '@/lib/data-service';
import { CustomerQrView } from '@/components/customer/CustomerQrView';

export const dynamic = 'force-dynamic';

interface CustomerQrPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerQrPage({ searchParams }: CustomerQrPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  return (
    <CustomerQrView
      customer={customer}
      activeMembership={activeMembership}
      business={business}
    />
  );
}
