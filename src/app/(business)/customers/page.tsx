import { CustomersView } from '@/components/business/CustomersView';
import { fetchBusinessData } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const { customers, loyalty } = await fetchBusinessData();

  return <CustomersView customers={customers} loyalty={loyalty} />;
}
