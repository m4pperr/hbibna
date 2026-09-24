import { TransactionsView } from '@/components/business/TransactionsView';
import { fetchBusinessData } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const { transactions } = await fetchBusinessData();

  return <TransactionsView transactions={transactions} />;
}
