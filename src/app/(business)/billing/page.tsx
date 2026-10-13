import { fetchBusinessData } from '@/lib/data-service';
import { BillingView } from '@/components/business/BillingView';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const { business } = await fetchBusinessData();

  return <BillingView business={business} />;
}
