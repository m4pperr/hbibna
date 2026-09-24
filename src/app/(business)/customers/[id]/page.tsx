import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchBusinessData } from '@/lib/data-service';
import { CustomerLoyaltyCard } from '@/components/customer/CustomerLoyaltyCard';
import { CustomerActions } from '@/components/business/CustomerActions';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Receipt,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Coins,
} from 'lucide-react';

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
    <div className="space-y-8 max-w-6xl">
      {/* Back button */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#736B63] hover:text-[#191817] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Customer Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191817] tracking-tight">
              {customer.name}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/70">
              Active Regular
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#736B63]">
            <div className="flex items-center gap-1.5 font-mono text-[#191817]">
              <Phone className="w-4 h-4 text-[#B88E3E]" />
              <span>{customer.phone}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#B88E3E]" />
              <span>{customer.email || 'No email provided'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#B88E3E]" />
              <span>
                Joined{' '}
                {new Date(customer.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Action triggers: "Add Purchase" and "Redeem Reward" */}
        <CustomerActions
          customer={customer}
          customers={customers}
          rewards={rewards}
          loyaltyRule={loyalty}
        />
      </div>

      {/* Large Points Balance Display */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFFFFF] to-[#FBF6EB]/40 border-2 border-[#DFC99F] shadow-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#B88E3E]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B88E3E]">
              Available Points Balance
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black text-[#B88E3E] tracking-tight">
                {customer.points_balance.toLocaleString()}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#191817]">
                points
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs text-[#736B63] space-y-1 sm:max-w-xs">
            <p className="font-semibold text-[#191817]">
              {business?.name || 'Hbibna Loyalty Program'}
            </p>
            <p>
              Points can be redeemed anytime at the counter for active rewards catalog gifts.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Transaction History (7 cols) + Digital Pass / QR Preview (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Transaction History (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#191817] tracking-tight">
              Transaction History
            </h2>
            <span className="text-xs font-medium text-[#736B63]">
              {customerTransactions.length} event{customerTransactions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl shadow-soft overflow-hidden divide-y divide-[#E6DDCF]">
            {customerTransactions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] text-[#736B63] border border-[#E6DDCF] flex items-center justify-center mx-auto">
                  <Coins className="w-6 h-6 text-[#B88E3E]" />
                </div>
                <h4 className="font-bold text-[#191817] text-base">No transactions yet</h4>
                <p className="text-xs text-[#736B63] max-w-xs mx-auto">
                  Click &quot;Add Purchase&quot; above to record the first purchase for {customer.name}.
                </p>
              </div>
            ) : (
              customerTransactions.map((tx) => {
                const isEarn = tx.points > 0;
                const isRedeem = tx.type === 'redeem';

                // Display description matching the user's requested examples:
                // Purchase with DA amount, or Reward Name (e.g. Free Coffee)
                let detail = tx.description || (isEarn ? 'Purchase' : 'Reward Redeemed');
                if (isRedeem && detail.startsWith('Redeemed: ')) {
                  detail = detail.replace('Redeemed: ', '');
                }

                return (
                  <div
                    key={tx.id}
                    className="p-5 flex items-center justify-between hover:bg-[#FAF8F5]/80 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isEarn
                            ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 shadow-xs'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                        }`}
                      >
                        {isEarn ? (
                          <ArrowUpRight className="w-5 h-5 text-[#B88E3E]" />
                        ) : (
                          <Gift className="w-5 h-5 text-rose-600" />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-sm text-[#191817]">
                          {isRedeem ? detail : 'Purchase'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[#736B63] mt-0.5">
                          {isEarn && tx.amount > 0 && (
                            <span className="font-semibold text-[#191817]">
                              {tx.amount.toLocaleString()} DA
                            </span>
                          )}
                          {isRedeem && (
                            <span className="font-semibold text-rose-700">
                              Reward Claimed
                            </span>
                          )}
                          <span className="text-[#E6DDCF]">•</span>
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-[#736B63]" />
                            {new Date(tx.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-black tracking-tight px-3 py-1 rounded-full ${
                          isEarn
                            ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60'
                            : 'bg-zinc-100 text-[#191817] border border-zinc-200'
                        }`}
                      >
                        {isEarn ? `+${tx.points} points` : `${tx.points} points`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Digital Loyalty Pass & QR (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#191817] tracking-tight">
              Customer Loyalty Pass
            </h2>
            <span className="text-xs text-[#B88E3E] font-semibold">Live QR Code</span>
          </div>

          <CustomerLoyaltyCard customer={customer} business={business} />
        </div>
      </div>
    </div>
  );
}
