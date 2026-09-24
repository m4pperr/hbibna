import { fetchCustomerPortalData } from '@/lib/data-service';
import { CustomerRewardsView } from '@/components/customer/CustomerRewardsView';

export const dynamic = 'force-dynamic';

interface CustomerRewardsPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerRewardsPage({
  searchParams,
}: CustomerRewardsPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, rewards, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  return (
    <CustomerRewardsView
      customer={customer}
      activeMembership={activeMembership}
      rewards={rewards}
      business={business}
    />
  );
}
