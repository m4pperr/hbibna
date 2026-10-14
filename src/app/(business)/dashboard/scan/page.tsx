import { fetchBusinessData } from '@/lib/data-service';
import { ScannerPageView } from '@/components/business/ScannerPageView';

export const dynamic = 'force-dynamic';

export default async function DashboardScanPage() {
  const data = await fetchBusinessData();

  return (
    <ScannerPageView
      business={data.business}
      customers={data.customers}
      loyalty={data.loyalty}
    />
  );
}
