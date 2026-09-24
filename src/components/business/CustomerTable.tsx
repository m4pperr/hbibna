'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, UserPlus, Receipt, ArrowRight, User, QrCode } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { AddCustomerModal } from './AddCustomerModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import type { Customer, LoyaltyProgram } from '@/types/database';

interface CustomerTableProps {
  initialCustomers: Customer[];
  loyaltyRule?: LoyaltyProgram | null;
}

export function CustomerTable({ initialCustomers, loyaltyRule }: CustomerTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCustomerForPurchase, setSelectedCustomerForPurchase] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  const filtered = initialCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Search and Add Customer action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-sm text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setShowScanModal(true)}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-[#191817] hover:bg-[#2B2927] text-white text-xs font-bold shadow-soft transition-all cursor-pointer active:scale-[0.98] min-h-[44px]"
          >
            <QrCode className="w-4 h-4 text-[#DFC99F] shrink-0" />
            <span className="truncate">Scan QR</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white text-xs font-semibold shadow-soft transition-all cursor-pointer active:scale-[0.98] min-h-[44px]"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span className="truncate">Add Customer</span>
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Table (md+) */}
      <div className="hidden md:block bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E6DDCF] text-xs font-bold text-[#736B63] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Points</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DDCF]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#736B63]">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-[#191817]">No customers found</p>
                      <p className="text-xs text-[#736B63]">
                        {search
                          ? `No members match "${search}".`
                          : 'Get started by enrolling your first customer.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-bold text-[#191817] hover:text-[#B88E3E] transition-colors"
                      >
                        {customer.name}
                      </Link>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 font-mono text-xs text-[#191817]">
                      {customer.phone}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-xs text-[#736B63]">
                      {customer.email || '—'}
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60">
                        {customer.points_balance.toLocaleString()} pts
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-xs text-[#736B63]">
                      {new Date(customer.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCustomerForPurchase(customer)}
                          title="Add Purchase & Award Points"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E6DDCF] bg-[#FFFFFF] hover:bg-[#F3ECE2] text-xs font-semibold text-[#191817] transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#B88E3E]" />
                          <span>Add Purchase</span>
                        </button>

                        <Link
                          href={`/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F3ECE2] text-xs font-semibold text-[#736B63] hover:text-[#191817] border border-[#E6DDCF] transition-colors"
                        >
                          <span>Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List (<md) */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl p-8 text-center text-[#736B63]">
            <p className="font-semibold text-sm text-[#191817]">No customers found</p>
            <p className="text-xs text-[#736B63] mt-1">
              {search
                ? `No members match "${search}".`
                : 'Get started by enrolling your first customer.'}
            </p>
          </div>
        ) : (
          filtered.map((customer) => (
            <div
              key={customer.id}
              className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-2xl p-4 space-y-3 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-bold text-[#191817] text-base hover:text-[#B88E3E] transition-colors block truncate"
                  >
                    {customer.name}
                  </Link>
                  <p className="font-mono text-xs text-[#736B63] mt-0.5">{customer.phone}</p>
                  {customer.email && (
                    <p className="text-xs text-[#736B63] truncate mt-0.5">{customer.email}</p>
                  )}
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/60 shrink-0">
                  {customer.points_balance.toLocaleString()} pts
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#736B63] pt-2 border-t border-[#E6DDCF]/60">
                <span>
                  Joined{' '}
                  {new Date(customer.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setSelectedCustomerForPurchase(customer)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] hover:bg-[#F3ECE2] text-xs font-semibold text-[#191817] transition-colors cursor-pointer min-h-[44px]"
                >
                  <Receipt className="w-3.5 h-3.5 text-[#B88E3E]" />
                  <span>Purchase</span>
                </button>

                <Link
                  href={`/customers/${customer.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F3ECE2] text-xs font-semibold text-[#736B63] hover:text-[#191817] border border-[#E6DDCF] transition-colors min-h-[44px]"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {selectedCustomerForPurchase && (
        <RecordPurchaseModal
          isOpen={!!selectedCustomerForPurchase}
          onClose={() => setSelectedCustomerForPurchase(null)}
          customers={initialCustomers}
          defaultCustomerId={selectedCustomerForPurchase.id}
          loyaltyRule={loyaltyRule}
        />
      )}

      {showAddModal && (
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showScanModal && (
        <ScanCustomerModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          customers={initialCustomers}
          loyaltyRule={loyaltyRule}
        />
      )}
    </div>
  );
}
