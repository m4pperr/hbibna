import { fetchCustomerPortalData } from '@/lib/data-service';
import { CustomerAccountView } from '@/components/customer/CustomerAccountView';

export const dynamic = 'force-dynamic';

interface CustomerAccountPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerAccountPage({ searchParams }: CustomerAccountPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  // Build query string helper for links
  const createQueryStr = () => {
    const params = new URLSearchParams();
    if (customer?.phone) params.set('phone', customer.phone);
    else if (customer?.id) params.set('c', customer.id);
    if (activeMembership?.business_id) params.set('b', activeMembership.business_id);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const activeQueryStr = createQueryStr();

  return (
    <CustomerAccountView
      customer={customer}
      activeMembership={activeMembership}
      business={business}
      activeQueryStr={activeQueryStr}
    />
  );
}
