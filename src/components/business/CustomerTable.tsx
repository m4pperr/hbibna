'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Receipt, ArrowRight, QrCode, UserPlus, Tag, Download, Crown, Zap, AlertCircle, Sparkles } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import { AddCustomerModal } from './AddCustomerModal';
import { Pagination } from '@/components/ui/Pagination';
import { exportCustomersToCsv } from '@/lib/export-csv';
import {
  CustomerSegmentKey,
  analyzeCustomer,
  computeSegmentCounts,
} from '@/lib/customer-segmentation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatPhoneNumber } from '@/lib/phone';
import type { Customer, LoyaltyProgram, Transaction } from '@/types/database';

const PAGE_SIZE = 10;

interface CustomerTableProps {
  initialCustomers: Customer[];
  loyaltyRule?: LoyaltyProgram | null;
  transactions?: Transaction[];
}

export function CustomerTable({
  initialCustomers,
  loyaltyRule,
  transactions = [],
}: CustomerTableProps) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegmentKey>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerForPurchase, setSelectedCustomerForPurchase] = useState<Customer | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const segmentCounts = useMemo(
    () => computeSegmentCounts(initialCustomers, transactions),
    [initialCustomers, transactions]
  );

  const filtered = initialCustomers.filter((c) => {
    // Search query match
    if (search) {
      const s = search.toLowerCase();
      const sNoSpace = s.replace(/[\s-+]/g, '');
      const phoneNoSpace = c.phone.replace(/[\s-+]/g, '');
      const formattedPhone = formatPhoneNumber(c.phone).toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(s) ||
        c.phone.toLowerCase().includes(s) ||
        formattedPhone.includes(s) ||
        (sNoSpace.length > 2 && (phoneNoSpace.includes(sNoSpace) || sNoSpace.includes(phoneNoSpace))) ||
        (c.email && c.email.toLowerCase().includes(s));
      if (!matchesSearch) return false;
    }

    // Segment filter match
    if (segmentFilter !== 'all') {
      const analysis = analyzeCustomer(c, transactions);
      if (analysis.segment !== segmentFilter) return false;
    }

    return true;
  });

  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const isAr = language === 'ar';

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
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => exportCustomersToCsv(filtered)}
            title={language === 'ar' ? 'تصدير كملف إكسيل CSV' : 'Exporter au format Excel CSV'}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white hover:bg-[#FFF9D2] text-black text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer min-h-[44px]"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFE600] hover:bg-yellow-400 text-black text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('business.addCustomer')}</span>
          </button>

          <button
            onClick={() => setShowScanModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-black hover:bg-zinc-800 text-white text-xs font-black border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
          >
            <QrCode className="w-4 h-4 text-[#FFE600] shrink-0" />
            <span>{t('business.scanCustomer')}</span>
          </button>
        </div>
      </div>

      {/* Customer Segmentation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border-2 border-black shadow-[0_4px_0_#000]">
        <button
          onClick={() => {
            setSegmentFilter('all');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
            segmentFilter === 'all'
              ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
              : 'text-black/70 hover:text-black hover:bg-black/5'
          }`}
        >
          <span>{isAr ? 'كل العملاء' : 'Tous'}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 border border-current">
            {segmentCounts.all}
          </span>
        </button>

        <button
          onClick={() => {
            setSegmentFilter('vip');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
            segmentFilter === 'vip'
              ? 'bg-[#FFE600] text-black border border-black shadow-[0_2px_0_#000]'
              : 'text-black/70 hover:text-black hover:bg-black/5'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-black" />
          <span>{isAr ? 'عملاء مميزين' : '⭐ VIP'}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/10">
            {segmentCounts.vip}
          </span>
        </button>

        <button
          onClick={() => {
            setSegmentFilter('regular');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
            segmentFilter === 'regular'
              ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
              : 'text-black/70 hover:text-black hover:bg-black/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isAr ? 'أوفياء' : '⚡ Réguliers'}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 border border-current">
            {segmentCounts.regular}
          </span>
        </button>

        <button
          onClick={() => {
            setSegmentFilter('at_risk');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
            segmentFilter === 'at_risk'
              ? 'bg-rose-500 text-white shadow-[0_2px_0_#000]'
              : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{isAr ? 'للتواصل (غائبون)' : '😴 À relancer'}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/10">
            {segmentCounts.at_risk}
          </span>
        </button>

        <button
          onClick={() => {
            setSegmentFilter('new');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
            segmentFilter === 'new'
              ? 'bg-sky-500 text-white shadow-[0_2px_0_#000]'
              : 'text-sky-700 hover:text-sky-900 hover:bg-sky-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'جدد' : '🌱 Nouveaux'}</span>
          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-black/10">
            {segmentCounts.new}
          </span>
        </button>
      </div>

      {/* Desktop & Tablet Table (md+) */}
      <div className="hidden md:block bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[0_8px_0_#000]">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-[#FFF9D2] border-b-2 border-black text-xs font-black text-black uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-start">{t('common.name')}</th>
                <th className="px-6 py-4 text-start">{isAr ? 'الفئة' : 'Segment'}</th>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-black/70">
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
                paginatedCustomers.map((customer) => {
                  const analysis = analyzeCustomer(customer, transactions);

                  return (
                    <tr key={customer.id} className="hover:bg-[#FFF9D2]/50 transition-colors">
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/customers/${customer.id}`}
                            className="font-black text-black hover:underline transition-colors"
                          >
                            {customer.name}
                          </Link>
                          {customer.referral_code && (
                            <span
                              className="font-mono text-[10px] font-bold bg-[#FFF9D2] border border-black/30 px-1.5 py-0.5 rounded-md text-black/80"
                              title="Code de parrainage"
                            >
                              {customer.referral_code}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Segment Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black border ${analysis.meta.badgeBg} ${analysis.meta.badgeText} ${analysis.meta.borderClass} shadow-[0_1px_0_#000]`}
                        >
                          {analysis.segment === 'vip' && <Crown className="w-3 h-3" />}
                          {analysis.segment === 'regular' && <Zap className="w-3 h-3" />}
                          {analysis.segment === 'at_risk' && <AlertCircle className="w-3 h-3" />}
                          {analysis.segment === 'new' && <Sparkles className="w-3 h-3" />}
                          <span>{isAr ? analysis.meta.labelAr : analysis.meta.labelFr}</span>
                        </span>
                      </td>

                    {/* Phone */}
                    <td className="px-6 py-4 font-mono text-xs font-bold text-black/80 dir-ltr text-start">
                      {formatPhoneNumber(customer.phone)}
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
                );
              })
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
          paginatedCustomers.map((customer) => {
            const analysis = analyzeCustomer(customer, transactions);

            return (
              <div
                key={customer.id}
                className="bg-white border-2 border-black rounded-3xl p-5 space-y-3 shadow-[0_6px_0_#000] text-start"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="font-black text-black text-base hover:underline transition-colors block truncate"
                      >
                        {customer.name}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${analysis.meta.badgeBg} ${analysis.meta.badgeText} ${analysis.meta.borderClass}`}
                      >
                        {analysis.segment === 'vip' && <Crown className="w-2.5 h-2.5" />}
                        {analysis.segment === 'regular' && <Zap className="w-2.5 h-2.5" />}
                        {analysis.segment === 'at_risk' && <AlertCircle className="w-2.5 h-2.5" />}
                        {analysis.segment === 'new' && <Sparkles className="w-2.5 h-2.5" />}
                        <span>{isAr ? analysis.meta.labelAr : analysis.meta.labelFr}</span>
                      </span>
                    </div>
                    <p className="font-mono text-xs font-bold text-black/70 mt-0.5 dir-ltr text-start">{formatPhoneNumber(customer.phone)}</p>
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
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

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

      {showAddModal && (
        <AddCustomerModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
