'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, QrCode } from 'lucide-react';
import type { Customer, Business } from '@/types/database';

interface CustomerLoyaltyCardProps {
  customer: Customer;
  business?: Business | null;
}

export function CustomerLoyaltyCard({
  customer,
  business,
}: CustomerLoyaltyCardProps) {
  // QR value can encode customer ID or phone for instant lookup
  const qrValue = typeof window !== 'undefined'
    ? `${window.location.origin}/customers/${customer.id}`
    : `hbibna://customer/${customer.id}`;

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Physical-style Digital Membership Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#1C1A17] to-[#2B2722] text-[#FAF8F5] p-6 shadow-2xl overflow-hidden border border-[#DFC99F]/30 transition-all hover:scale-[1.01]">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#B88E3E]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-[#DFC99F]/10 blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#B88E3E] flex items-center justify-center text-white shadow-soft">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase font-bold text-[#DFC99F]">
                Hbibna Pass
              </p>
              <h3 className="font-bold text-sm tracking-tight text-[#FAF8F5]">
                {business?.name || 'Loyalty Member'}
              </h3>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#B88E3E]/20 text-[#DFC99F] border border-[#DFC99F]/30">
            VIP Regular
          </span>
        </div>

        {/* Card Body - Points Balance */}
        <div className="my-8 relative z-10">
          <p className="text-xs uppercase tracking-wider font-medium text-[#DFC99F]/80">
            Available Balance
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-5xl font-extrabold text-[#DFC99F] tracking-tight">
              {customer.points_balance.toLocaleString()}
            </span>
            <span className="text-base font-semibold text-[#FAF8F5]/80">points</span>
          </div>
        </div>

        {/* Card Footer - Member Details & Mini QR Icon */}
        <div className="pt-4 border-t border-white/10 flex items-end justify-between relative z-10 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#FAF8F5]/50">
              Member
            </p>
            <p className="font-semibold text-sm text-[#FAF8F5]">{customer.name}</p>
            <p className="text-[11px] text-[#DFC99F]/80 font-mono mt-0.5">{customer.phone}</p>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 text-white text-[11px] font-medium backdrop-blur-xs">
            <QrCode className="w-3.5 h-3.5 text-[#DFC99F]" />
            <span>Scan to Earn</span>
          </div>
        </div>
      </div>

      {/* QR Code Presentation for In-Store Counter Scanning */}
      <div className="mt-6 bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl p-6 text-center shadow-card space-y-4">
        <div>
          <h4 className="text-sm font-bold text-[#191817]">Present at Checkout</h4>
          <p className="text-xs text-[#736B63] mt-0.5">
            Show this QR code to the cashier to earn points or redeem rewards.
          </p>
        </div>

        <div className="p-4 bg-[#FAF8F5] border border-[#E6DDCF] rounded-2xl inline-block shadow-inner mx-auto">
          <QRCodeSVG
            value={qrValue}
            size={180}
            level="M"
            bgColor="#FAF8F5"
            fgColor="#191817"
          />
        </div>

        <p className="text-[11px] text-[#736B63] font-mono">
          ID: {customer.id.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}
