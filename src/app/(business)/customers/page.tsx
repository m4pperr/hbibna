import { CustomerTable } from '@/components/business/CustomerTable';
import { fetchBusinessData } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const { customers, loyalty } = await fetchBusinessData();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191817] tracking-tight">
          Customers
        </h1>
        <p className="text-xs sm:text-sm text-[#736B63]">
          Manage your enrolled loyalty members, view points balances, and award purchase points.
        </p>
      </div>

      <CustomerTable initialCustomers={customers} loyaltyRule={loyalty} />
    </div>
  );
}
