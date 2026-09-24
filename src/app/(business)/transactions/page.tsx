import { TransactionTable } from '@/components/business/TransactionTable';
import { fetchBusinessData } from '@/lib/data-service';

export default async function TransactionsPage() {
  const { transactions } = await fetchBusinessData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#191817] tracking-tight">Transaction Ledger</h1>
        <p className="text-xs text-[#736B63] mt-1">
          Complete audit trail of all loyalty points earned and rewards redeemed.
        </p>
      </div>

      <TransactionTable initialTransactions={transactions} />
    </div>
  );
}
