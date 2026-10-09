import { fetchCustomerPortalData } from '@/lib/data-service';
import { CustomerReferralView } from '@/components/customer/CustomerReferralView';

export const dynamic = 'force-dynamic';

interface CustomerReferralPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerReferralPage({ searchParams }: CustomerReferralPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, business, loyalty, referrals } =
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
    <CustomerReferralView
      customer={customer}
      activeMembership={activeMembership}
      business={business}
      loyalty={loyalty}
      referrals={referrals}
      activeQueryStr={activeQueryStr}
    />
  );
}
