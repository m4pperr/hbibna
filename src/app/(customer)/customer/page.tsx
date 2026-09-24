import { fetchCustomerPortalData } from '@/lib/data-service';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  Sparkles,
  Gift,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Store,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CustomerHomePageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerHomePage({ searchParams }: CustomerHomePageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, activeMembership, rewards, transactions, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  const customerName = customer?.name || 'Sarah Benali';
  const activeBusinessName = business?.name || activeMembership.business?.name || 'Café El Bahia';
  const pointsBalance = activeMembership.points_balance;

  // Build query string helper for links
  const createQueryStr = () => {
    const params = new URLSearchParams();
    if (customer?.phone) params.set('phone', customer.phone);
    else if (customer?.id) params.set('c', customer.id);
    if (activeMembership.business_id) params.set('b', activeMembership.business_id);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const activeQueryStr = createQueryStr();

  // Secure token identifier for QR code (no sensitive personal info)
  const secureQrValue = customer?.id
    ? `hbibna:c:${customer.id}`
    : 'hbibna:c:guest_demo';

  // Customer transactions for the active business
  const displayActivity =
    transactions.length > 0
      ? transactions.slice(0, 5)
      : [
          { id: '1', points: 25, type: 'earn', description: 'Purchase' },
          { id: '2', points: 50, type: 'earn', description: 'Purchase' },
          { id: '3', points: -500, type: 'redeem', description: 'Reward Redeemed' },
        ];

  return (
    <div className="space-y-8">
      {/* 1. PORTAL HEADER: Focused on Currently Selected Business */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6DDCF]/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3E]">
              Digital Loyalty Card
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60 flex items-center gap-1">
              <Store className="w-3 h-3" />
              <span>{activeBusinessName}</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#191817] tracking-tight">
            {activeBusinessName}
          </h1>
          <p className="text-xs text-[#736B63]">
            Welcome back, <span className="font-semibold text-[#191817]">{customerName}</span>. Your rewards pass is active and ready to use at checkout.
          </p>
        </div>

        <Link
          href={`/customer/qr${activeQueryStr}`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#191817] hover:bg-[#2B2927] text-white text-xs font-bold transition-all shadow-soft shrink-0 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-[#DFC99F]" />
          <span>Pay &amp; Earn QR</span>
        </Link>
      </div>

      {/* 2. ACTIVE DIGITAL LOYALTY CARD */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#191817] via-[#24211D] to-[#191817] text-[#FAF8F5] p-4 sm:p-8 shadow-xl border border-[#DFC99F]/30 overflow-hidden">
        {/* Subtle decorative warm gold glow */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#B88E3E]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#DFC99F]/10 blur-3xl pointer-events-none" />

        {/* Brand & Business Header */}
        <div className="flex items-center justify-between relative z-10 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B88E3E] to-[#DFC99F] flex items-center justify-center text-white shadow-soft shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFC99F] block truncate">
                Hbibna Member Pass
              </span>
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none mt-0.5 truncate">
                {activeBusinessName}
              </h2>
            </div>
          </div>

          <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#B88E3E]/20 text-[#DFC99F] border border-[#DFC99F]/30 shrink-0">
            Active Member
          </span>
        </div>

        {/* Customer Name Greeting */}
        <div className="mt-5 sm:mt-6 relative z-10">
          <p className="text-[11px] sm:text-xs text-[#FAF8F5]/70 font-medium">Customer</p>
          <p className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">{customerName}</p>
        </div>

        {/* Large Points Balance */}
        <div className="my-6 sm:my-8 relative z-10 text-center py-2">
          <div className="text-4xl sm:text-6xl md:text-7xl font-black text-[#DFC99F] tracking-tight leading-none drop-shadow-xs truncate px-2">
            {pointsBalance.toLocaleString()}
          </div>
          <span className="inline-block mt-2 sm:mt-3 text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#FAF8F5]/80 max-w-full break-words">
            POINTS AVAILABLE AT {activeBusinessName.toUpperCase()}
          </span>
        </div>

        {/* Card Footer: Quick QR link */}
        <div className="pt-4 sm:pt-5 border-t border-white/10 flex flex-col xs:flex-row xs:items-center justify-between gap-3 relative z-10 text-xs">
          <div className="flex items-center gap-1.5 text-[#FAF8F5]/70 text-[10px] sm:text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#DFC99F] shrink-0" />
            <span className="truncate">Scoped to {activeBusinessName}</span>
          </div>
          <Link
            href={`/customer/qr${activeQueryStr}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#DFC99F] font-semibold text-xs backdrop-blur-xs transition-colors min-h-[38px] self-start xs:self-auto"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </Link>
        </div>
      </div>

      {/* 3. YOUR REWARDS FOR THIS BUSINESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-[#191817] tracking-tight">
              Rewards at {activeBusinessName}
            </h3>
            <p className="text-xs text-[#736B63]">
              Unlock complimentary perks as your points grow at this location
            </p>
          </div>
          <Link
            href={`/customer/rewards${activeQueryStr}`}
            className="text-xs font-semibold text-[#B88E3E] hover:underline inline-flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {rewards.map((reward) => {
            const canAfford = pointsBalance >= reward.points_required;
            const pointsNeeded = reward.points_required - pointsBalance;

            return (
              <div
                key={reward.id}
                className={`p-5 rounded-3xl border bg-[#FFFFFF] shadow-card flex flex-col justify-between gap-4 transition-all ${
                  canAfford
                    ? 'border-[#B88E3E] ring-1 ring-[#B88E3E]/30 bg-gradient-to-br from-[#FFFFFF] to-[#FBF6EB]/40'
                    : 'border-[#E6DDCF] opacity-85'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        canAfford
                          ? 'bg-[#B88E3E] text-white shadow-soft'
                          : 'bg-[#FAF8F5] text-[#736B63] border border-[#E6DDCF]'
                      }`}
                    >
                      <Gift className="w-5 h-5" />
                    </div>
                    {canAfford ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#736B63] border border-[#E6DDCF]">
                        <Lock className="w-3 h-3" />
                        <span>{pointsNeeded.toLocaleString()} pts left</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-[#191817] tracking-tight">
                      {reward.name}
                    </h4>
                    <p className="text-xs font-black text-[#B88E3E] mt-0.5">
                      {reward.points_required.toLocaleString()} points
                    </p>
                    {reward.description && (
                      <p className="text-[11px] text-[#736B63] mt-1 line-clamp-2">
                        {reward.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVITY AT THIS BUSINESS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-[#191817] tracking-tight">
              Recent Activity at {activeBusinessName}
            </h3>
            <p className="text-xs text-[#736B63]">
              Your recent visits, earned points, and redeemed rewards
            </p>
          </div>
          <Link
            href={`/customer/activity${activeQueryStr}`}
            className="text-xs font-semibold text-[#B88E3E] hover:underline inline-flex items-center gap-0.5"
          >
            <span>History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl shadow-card divide-y divide-[#E6DDCF] overflow-hidden">
          {displayActivity.map((act) => {
            const isEarn = act.points > 0;
            const title =
              act.description ||
              (act as any).title ||
              (isEarn ? 'Purchase' : 'Reward Redeemed');

            return (
              <div
                key={act.id}
                className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAF8F5]/60 transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isEarn
                        ? 'bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50'
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
                    <span className="font-bold text-sm text-[#191817] block">
                      {title}
                    </span>
                    <span className="text-[11px] text-[#736B63]">
                      {isEarn ? 'Points earned' : 'Reward claimed'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-black ${
                      isEarn ? 'text-[#B88E3E]' : 'text-zinc-800'
                    }`}
                  >
                    {isEarn ? `+${act.points}` : act.points}
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

      {/* 5. CONTACTLESS QR PASS */}
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-6 sm:p-8 text-center shadow-card space-y-4 max-w-md mx-auto">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#B88E3E]">
            Counter Checkout Pass
          </span>
          <h3 className="font-extrabold text-lg text-[#191817] mt-0.5">My Hbibna QR</h3>
          <p className="text-xs text-[#736B63] mt-1 max-w-xs mx-auto">
            Scan at {activeBusinessName} to earn points or claim unlocked rewards.
          </p>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E6DDCF] rounded-2xl inline-block shadow-inner mx-auto">
          <QRCodeSVG
            value={secureQrValue}
            size={160}
            level="M"
            bgColor="#FAF8F5"
            fgColor="#191817"
            aria-label="My Hbibna QR"
          />
        </div>

        <div className="space-y-2">
          <div className="text-[11px] text-[#736B63] font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B88E3E]" />
            <span>Secure Token • Scoped to {activeBusinessName}</span>
          </div>

          <Link
            href={`/customer/qr${activeQueryStr}`}
            className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[#191817] hover:bg-[#2B2927] text-xs font-bold text-white transition-colors shadow-soft"
          >
            <span>Open Fullscreen QR</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
