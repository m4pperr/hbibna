import { fetchCustomerPortalData } from '@/lib/data-service';
import { CustomerHomeView } from '@/components/customer/CustomerHomeView';

export const dynamic = 'force-dynamic';

interface CustomerHomePageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerHomePage({ searchParams }: CustomerHomePageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, rewards, transactions, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  // Build query string helper for links
  const createQueryStr = () => {
    const params = new URLSearchParams();
    if (customer?.phone) params.set('phone', customer.phone);
    else if (customer?.id) params.set('c', customer.id);
    if (activeMembership.business_id) params.set('b', activeMembership.business_id);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const activeQueryStr = createQueryStr();

  return (
    <CustomerHomeView
      customer={customer}
      activeMembership={activeMembership}
      rewards={rewards}
      transactions={transactions}
      business={business}
      activeQueryStr={activeQueryStr}
    />
  );
}
