import { getDashboardMetrics } from '@/actions/stats';
import { fetchBusinessData } from '@/lib/data-service';
import { DashboardClientView } from '@/components/business/DashboardClientView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [metrics, data] = await Promise.all([
    getDashboardMetrics(),
    fetchBusinessData(),
  ]);

  return (
    <DashboardClientView
      metrics={metrics}
      customers={data.customers}
      business={data.business}
      transactions={data.transactions}
      hasConfiguredLoyalty={!!data.loyalty}
      hasRewards={data.rewards && data.rewards.length > 0}
      hasCustomers={data.customers && data.customers.length > 0}
      hasTransactions={data.transactions && data.transactions.length > 0}
    />
  );
}
