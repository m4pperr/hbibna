import { fetchBusinessData } from '@/lib/data-service';
import {
  Store,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export default async function SettingsPage() {
  const { business } = await fetchBusinessData();

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#191817] tracking-tight">Business Settings & Plan</h1>
        <p className="text-xs text-[#736B63] mt-1">
          Manage your business profile, tenant isolation settings, and subscription.
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-[#FFFFFF] border-2 border-[#B88E3E] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6DDCF]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-[#191817]">Hbibna Business Plan</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {business.subscription_status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-[#736B63]">
                Your single, all-inclusive monthly subscription
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-[#191817]">
                {business.plan_price_da.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-[#B88E3E]">DA</span>
            </div>
            <span className="text-xs text-[#736B63]">/ month</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF]">
            <span className="text-[#736B63]">Enrolled Members</span>
            <p className="font-bold text-sm text-[#191817] mt-0.5">Unlimited</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF]">
            <span className="text-[#736B63]">Transactions</span>
            <p className="font-bold text-sm text-[#191817] mt-0.5">Unlimited</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6DDCF]">
            <span className="text-[#736B63]">Billing Cycle</span>
            <p className="font-bold text-sm text-[#191817] mt-0.5">Monthly Auto-Renew</p>
          </div>
        </div>
      </div>

      {/* Business Profile Details */}
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] text-[#191817] flex items-center justify-center">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#191817]">Business Profile</h3>
            <p className="text-xs text-[#736B63]">Displayed on customer loyalty passes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              Business Name
            </label>
            <input
              type="text"
              readOnly
              value={business.name}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817] font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              Business Email
            </label>
            <input
              type="email"
              readOnly
              value={business.email || 'Not set'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              readOnly
              value={business.phone || 'Not set'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191817] mb-1">
              Currency
            </label>
            <input
              type="text"
              readOnly
              value={business.currency || 'DA'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] text-sm text-[#191817] font-bold"
            />
          </div>
        </div>
      </div>

      {/* Multi-Tenancy & Security Verification */}
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#191817]">Tenant Data Isolation</h3>
            <p className="text-xs text-[#736B63]">
              Guaranteed isolation via PostgreSQL Row Level Security (RLS)
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-2 text-xs">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#736B63]">
            <span>Tenant UUID:</span>
            <span className="text-[#191817] font-semibold">{business.id}</span>
          </div>
          <p className="text-[#736B63] pt-1">
            All customer records, transaction points, and reward redemptions are automatically partitioned
            by your tenant identifier. No other business can read or modify your data.
          </p>
        </div>
      </div>
    </div>
  );
}
