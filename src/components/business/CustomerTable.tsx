'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Receipt, ArrowRight, QrCode } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer, LoyaltyProgram } from '@/types/database';

interface CustomerTableProps {
  initialCustomers: Customer[];
  loyaltyRule?: LoyaltyProgram | null;
}

export function CustomerTable({ initialCustomers, loyaltyRule }: CustomerTableProps) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCustomerForPurchase, setSelectedCustomerForPurchase] = useState<Customer | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);

  const filtered = initialCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5 font-rounded">
      {/* Search and Scan action bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-black/60 absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('business.searchCustomers')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => setShowScanModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <QrCode className="w-4 h-4 text-[#FFE600] shrink-0" />
            <span>{t('business.scanCustomer')}</span>
          </button>
        </div>
      </div>

      {/* Desktop & Tablet Table (md+) */}
      <div className="hidden md:block bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[0_8px_0_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-[#FFF9D2] border-b-2 border-black text-xs font-black text-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-start">{t('common.name')}</th>
                <th className="px-6 py-4 text-start">{t('common.phone')}</th>
                <th className="px-6 py-4 text-start">{t('common.email')}</th>
                <th className="px-6 py-4 text-start">{t('common.points')}</th>
                <th className="px-6 py-4 text-start">{t('business.memberSince')}</th>
                <th className="px-6 py-4 ltr:text-right rtl:text-left">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-black/70">
                    <div className="space-y-2">
                      <p className="font-black text-base text-black">{t('catalog.noResults')}</p>
                      <p className="text-xs text-black/70 font-semibold">
                        {search
                          ? t('catalog.noResultsDesc')
                          : t('business.startByScanning')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.id} className="hover:bg-[#FFF9D2]/50 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-black text-black hover:underline transition-colors"
                      >
                        {customer.name}
                      </Link>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 font-mono text-xs font-bold text-black/80 dir-ltr text-start">
                      {customer.phone}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 text-xs font-medium text-black/70 truncate max-w-[160px]">
                      {customer.email || '—'}
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-black text-[#FFE600] border border-black shadow-[0_2px_0_#000] font-mono">
                        {customer.points_balance.toLocaleString()} {t('common.pts')}
                      </span>
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-xs font-semibold text-black/60">
                      {new Date(customer.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 ltr:text-right rtl:text-left">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setSelectedCustomerForPurchase(customer)}
                          title={t('business.awardPoints')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black bg-[#FFE600] hover:bg-yellow-400 text-xs font-black text-black shadow-[0_2px_0_#000] transition-all cursor-pointer active:translate-y-0.5 active:shadow-none"
                        >
                          <Receipt className="w-3.5 h-3.5 text-black" />
                          <span>{t('business.purchase')}</span>
                        </button>

                        <Link
                          href={`/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF9D2] text-xs font-black text-black border-2 border-black shadow-[0_2px_0_#000] transition-colors"
                        >
                          <span>{t('business.viewProfile')}</span>
                          <ArrowRight className="w-3 h-3 rtl:rotate-180" />
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
          <div className="bg-white border-2 border-black rounded-3xl p-8 text-center text-black shadow-[0_6px_0_#000]">
            <p className="font-black text-base text-black">{t('catalog.noResults')}</p>
            <p className="text-xs text-black/70 mt-1 font-semibold">
              {search
                ? t('catalog.noResultsDesc')
                : t('business.startByScanning')}
            </p>
          </div>
        ) : (
          filtered.map((customer) => (
            <div
              key={customer.id}
              className="bg-white border-2 border-black rounded-3xl p-5 space-y-3 shadow-[0_6px_0_#000] text-start"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="font-black text-black text-base hover:underline transition-colors block truncate"
                  >
                    {customer.name}
                  </Link>
                  <p className="font-mono text-xs font-bold text-black/70 mt-0.5 dir-ltr text-start">{customer.phone}</p>
                  {customer.email && (
                    <p className="text-xs text-black/60 truncate mt-0.5">{customer.email}</p>
                  )}
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-black text-[#FFE600] border border-black shadow-[0_2px_0_#000] shrink-0 font-mono">
                  {customer.points_balance.toLocaleString()} {t('common.pts')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-black/70 pt-2 border-t-2 border-black/10 font-bold">
                <span>
                  {t('business.memberSince')}{' '}
                  {new Date(customer.created_at).toLocaleDateString(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setSelectedCustomerForPurchase(customer)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-black bg-[#FFE600] hover:bg-yellow-400 text-xs font-black text-black shadow-[0_2px_0_#000] transition-colors cursor-pointer min-h-[44px]"
                >
                  <Receipt className="w-3.5 h-3.5 text-black" />
                  <span>{t('business.purchase')}</span>
                </button>

                <Link
                  href={`/customers/${customer.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-[#FFF9D2] text-xs font-black text-black border-2 border-black shadow-[0_2px_0_#000] transition-colors min-h-[44px]"
                >
                  <span>{t('business.viewProfile')}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
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
