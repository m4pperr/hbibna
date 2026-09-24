import { fetchCustomerPortalData } from '@/lib/data-service';
import { ArrowUpRight, ArrowDownRight, Clock, Store } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface CustomerActivityPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerActivityPage({
  searchParams,
}: CustomerActivityPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, memberships, activeMembership, transactions, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  const activeBusinessName = business?.name || activeMembership.business?.name || 'Café El Bahia';
  const pointsBalance = activeMembership.points_balance;

  const createQueryStr = (targetBizId: string) => {
    const params = new URLSearchParams();
    if (customer?.phone) params.set('phone', customer.phone);
    else if (customer?.id) params.set('c', customer.id);
    params.set('b', targetBizId);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const displayTransactions =
    transactions.length > 0
      ? transactions
      : [
          {
            id: '1',
            points: 25,
            type: 'earn' as const,
            amount: 2500,
            business_id: activeMembership.business_id,
            customer_id: customer?.id || 'c1-sarah',
            description: 'Purchase',
            created_at: new Date().toISOString(),
          },
          {
            id: '2',
            points: 50,
            type: 'earn' as const,
            amount: 5000,
            business_id: activeMembership.business_id,
            customer_id: customer?.id || 'c1-sarah',
            description: 'Purchase',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: '3',
            points: -500,
            type: 'redeem' as const,
            amount: 0,
            business_id: activeMembership.business_id,
            customer_id: customer?.id || 'c1-sarah',
            description: 'Reward Redeemed',
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 pb-2 border-b border-[#E6DDCF]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3E]">
            Activity History
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60 flex items-center gap-1">
            <Store className="w-3 h-3" />
            <span>{activeBusinessName}</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#191817] tracking-tight">
          Activity at {activeBusinessName}
        </h1>
        <p className="text-xs text-[#736B63]">
          Complete record of points earned and rewards redeemed at <span className="font-semibold text-[#191817]">{activeBusinessName}</span>.
        </p>
      </div>

      {/* Summary Balance Strip */}
      <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-card flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#736B63] block">
            {activeBusinessName} Balance
          </span>
          <h2 className="text-sm font-bold text-[#191817]">
            {customer?.name || 'Sarah Benali'}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-[#B88E3E]">
            {pointsBalance.toLocaleString()}
          </span>
          <span className="text-xs font-bold text-[#191817] uppercase"> pts</span>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl overflow-hidden shadow-card divide-y divide-[#E6DDCF]">
        {displayTransactions.map((tx) => {
          const isEarn = tx.points > 0;
          return (
            <div
              key={tx.id}
              className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F5]/60 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isEarn
                      ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/40'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {isEarn ? (
                    <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#191817]">
                    {tx.description || (isEarn ? 'Purchase' : 'Reward Redeemed')}
                  </h3>
                  <p className="text-[11px] text-[#736B63] mt-0.5">
                    {tx.amount && tx.amount > 0 ? (
                      <span className="font-semibold text-[#191817]">
                        {tx.amount.toLocaleString()} DA •{' '}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 inline text-[#736B63]" />
                      {new Date(tx.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-black ${
                    isEarn ? 'text-[#B88E3E]' : 'text-zinc-800'
                  }`}
                >
                  {isEarn ? `+${tx.points}` : tx.points}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#736B63] block">
                  Points
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
