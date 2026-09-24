import { fetchCustomerPortalData } from '@/lib/data-service';
import { CustomerActivityView } from '@/components/customer/CustomerActivityView';

export const dynamic = 'force-dynamic';

interface CustomerActivityPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerActivityPage({
  searchParams,
}: CustomerActivityPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, transactions, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  return (
    <CustomerActivityView
      customer={customer}
      activeMembership={activeMembership}
      transactions={transactions}
      business={business}
    />
  );
}
