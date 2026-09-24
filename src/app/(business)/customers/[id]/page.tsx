import { notFound } from 'next/navigation';
import { fetchBusinessData } from '@/lib/data-service';
import { CustomerDetailClientView } from '@/components/business/CustomerDetailClientView';

export const dynamic = 'force-dynamic';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const { customers, transactions, rewards, business, loyalty } = await fetchBusinessData();

  const customer = customers.find((c) => c.id === id);
  if (!customer) {
    notFound();
  }

  const customerTransactions = transactions.filter((t) => t.customer_id === id);

  return (
    <CustomerDetailClientView
      customer={customer}
      customers={customers}
      customerTransactions={customerTransactions}
      rewards={rewards}
      business={business}
      loyalty={loyalty}
    />
  );
}
