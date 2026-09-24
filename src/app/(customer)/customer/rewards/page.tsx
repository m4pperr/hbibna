import { fetchCustomerPortalData } from '@/lib/data-service';
import { Gift, CheckCircle2, Lock, Sparkles, Store } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomerRewardsPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerRewardsPage({
  searchParams,
}: CustomerRewardsPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, rewards, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  const activeBusinessName = business?.name || activeMembership.business?.name || 'Café El Bahia';
  const pointsBalance = activeMembership.points_balance;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="space-y-1 pb-2 border-b border-[#E6DDCF]/60">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3E]">
            Exclusive Perks
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60 flex items-center gap-1">
            <Store className="w-3 h-3" />
            <span>{activeBusinessName}</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#191817] tracking-tight">
          Rewards at {activeBusinessName}
        </h1>
        <p className="text-xs text-[#736B63]">
          Redeem points earned at <span className="font-semibold text-[#191817]">{activeBusinessName}</span> for exclusive perks and gifts.
        </p>
      </div>

      {/* Balance Summary Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FFFFFF] to-[#FBF6EB] border border-[#DFC99F]/50 shadow-card flex items-center justify-between">
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

      {/* Rewards Catalog */}
      <div className="space-y-3.5">
        {rewards.map((reward) => {
          const isUnlocked = pointsBalance >= reward.points_required;
          const pointsNeeded = reward.points_required - pointsBalance;
          const percentage = Math.min(
            100,
            Math.round((pointsBalance / reward.points_required) * 100)
          );

          return (
            <div
              key={reward.id}
              className={`p-5 rounded-3xl bg-[#FFFFFF] border shadow-card space-y-4 transition-all ${
                isUnlocked
                  ? 'border-[#B88E3E] ring-1 ring-[#B88E3E]/30 bg-gradient-to-br from-[#FFFFFF] to-[#FBF6EB]/40'
                  : 'border-[#E6DDCF] opacity-85'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-[#B88E3E] text-white shadow-soft'
                        : 'bg-[#FAF8F5] text-[#736B63] border border-[#E6DDCF]'
                    }`}
                  >
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#191817] tracking-tight">
                      {reward.name}
                    </h3>
                    <p className="text-xs font-black text-[#B88E3E] mt-0.5">
                      {reward.points_required.toLocaleString()} points
                    </p>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#736B63] border border-[#E6DDCF]">
                      <Lock className="w-3 h-3" />
                      <span>{pointsNeeded.toLocaleString()} pts to go</span>
                    </span>
                  )}
                </div>
              </div>

              {reward.description && (
                <p className="text-xs text-[#736B63] leading-relaxed">
                  {reward.description}
                </p>
              )}

              {/* Progress bar towards this reward */}
              <div className="space-y-1.5 pt-1 border-t border-[#E6DDCF]/50">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#736B63]">Progress</span>
                  <span className="font-bold text-[#191817]">
                    {isUnlocked ? '100% (Ready to claim)' : `${percentage}%`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#FAF8F5] border border-[#E6DDCF] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isUnlocked ? 'bg-[#B88E3E]' : 'bg-[#DFC99F]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Redemption Note */}
      <div className="p-4 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F]/40 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#B88E3E] shrink-0 mt-0.5" />
        <div className="text-xs text-[#191817] leading-relaxed">
          <span className="font-bold text-[#B88E3E]">How to claim: </span>
          Show your Hbibna QR code to the cashier at {activeBusinessName} to redeem your reward at checkout.
        </div>
      </div>
    </div>
  );
}
