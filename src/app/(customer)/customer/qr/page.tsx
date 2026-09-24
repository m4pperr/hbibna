import { fetchCustomerPortalData } from '@/lib/data-service';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, ShieldCheck, Store } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface CustomerQrPageProps {
  searchParams: Promise<{ phone?: string; c?: string; b?: string }>;
}

export default async function CustomerQrPage({ searchParams }: CustomerQrPageProps) {
  const { phone, c: customerId, b: businessId } = await searchParams;
  const { customer, memberships, activeMembership, business } =
    await fetchCustomerPortalData({ phone, customerId, businessId });

  const customerName = customer?.name || 'Sarah Benali';
  const pointsBalance = activeMembership.points_balance;
  const activeBusinessName = business?.name || activeMembership.business?.name || 'Café El Bahia';

  const createQueryStr = (targetBizId: string) => {
    const params = new URLSearchParams();
    if (customer?.phone) params.set('phone', customer.phone);
    else if (customer?.id) params.set('c', customer.id);
    params.set('b', targetBizId);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  // SECURE IDENTIFIER ONLY:
  // We NEVER encode sensitive personal information (no phone, no email, no full names).
  // When a business scans this token, it only resolves the customer's membership for THAT business.
  const secureQrToken = customer?.id ? `hbibna:c:${customer.id}` : 'hbibna:c:guest_demo';

  return (
    <div className="space-y-6 text-center max-w-sm mx-auto">
      {/* Page Title */}
      <div className="space-y-1 pb-2 border-b border-[#E6DDCF]/60">
        <div className="flex items-center justify-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3E]">
            Digital Loyalty Pass
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60 flex items-center gap-1">
            <Store className="w-3 h-3" />
            <span>{activeBusinessName}</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-[#191817] tracking-tight">
          My Hbibna QR
        </h1>
        <p className="text-xs text-[#736B63]">
          Present this code at <span className="font-semibold text-[#191817]">{activeBusinessName}</span> to earn points and claim rewards.
        </p>
      </div>

      {/* Digital Member Card with QR */}
      <div className="bg-[#FFFFFF] border border-[#DFC99F]/50 rounded-3xl p-4 sm:p-7 shadow-card relative overflow-hidden space-y-5 sm:space-y-6">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#B88E3E]/10 blur-2xl pointer-events-none" />

        {/* Business & Member Info */}
        <div className="flex items-center justify-between border-b border-[#E6DDCF] pb-4">
          <div className="text-left min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#736B63] block truncate">
              {activeBusinessName}
            </span>
            <h2 className="text-base font-extrabold text-[#191817] truncate">{customerName}</h2>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-[#736B63] block">
              Balance
            </span>
            <span className="text-lg font-black text-[#B88E3E]">
              {pointsBalance.toLocaleString()}{' '}
              <span className="text-[10px] font-bold text-[#191817]">PTS</span>
            </span>
          </div>
        </div>

        {/* Centered QR Code Container */}
        <div className="p-3 sm:p-5 bg-[#FAF8F5] border border-[#E6DDCF] rounded-2xl inline-flex items-center justify-center shadow-inner mx-auto">
          <QRCodeSVG
            value={secureQrToken}
            size={175}
            level="M"
            bgColor="#FAF8F5"
            fgColor="#191817"
            aria-label="Customer Loyalty QR Code"
            className="w-40 sm:w-48 h-40 sm:h-48"
          />
        </div>

        {/* Token identifier tag */}
        <div className="space-y-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E6DDCF] text-[11px] font-mono font-medium text-[#736B63]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B88E3E]" />
            <span>ID: {customer?.id ? customer.id.slice(0, 16) + '...' : 'SECURE_TOKEN'}</span>
          </div>

          <p className="text-[11px] text-[#736B63]/80 leading-relaxed max-w-xs mx-auto">
            Protected customer token. Cashier scanner automatically resolves your membership for {activeBusinessName} with zero cross-business data sharing.
          </p>
        </div>
      </div>

      {/* Helpful Hint Card */}
      <div className="p-4 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F]/40 text-left flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#B88E3E] shrink-0 mt-0.5" />
        <div className="text-xs text-[#191817] leading-relaxed">
          <span className="font-bold text-[#B88E3E]">Fast Checkout: </span>
          Keep your screen brightness high when presenting your QR code to the scanner.
        </div>
      </div>
    </div>
  );
}
