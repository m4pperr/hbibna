import { getDashboardMetrics } from '@/actions/stats';
import { fetchBusinessData } from '@/lib/data-service';
import { DashboardClientView } from '@/components/business/DashboardClientView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [metrics, data] = await Promise.all([
    getDashboardMetrics(),
    fetchBusinessData(),
  ]);

  return <DashboardClientView metrics={metrics} customers={data.customers} />;
}
