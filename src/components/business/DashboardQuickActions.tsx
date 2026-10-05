'use client';

import { useState } from 'react';
import { Receipt, QrCode } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer } from '@/types/database';

interface DashboardQuickActionsProps {
  customers: Customer[];
}

export function DashboardQuickActions({ customers }: DashboardQuickActionsProps) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Primary Action: Scan Customer */}
        <button
          onClick={() => setShowScanModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-black hover:bg-zinc-800 border-2 border-black shadow-[0_4px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
        >
          <QrCode className="w-4 h-4 text-[#FFE600]" />
          <span>{t('business.scanCustomer')}</span>
        </button>

        {/* Quick Action: Add Purchase */}
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-black bg-[#FFE600] border-2 border-black shadow-[0_4px_0_#000] hover:bg-yellow-400 hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer min-h-[44px] w-full sm:w-auto"
        >
          <Receipt className="w-4 h-4 text-black" />
          <span>{t('business.addPurchase')}</span>
        </button>
      </div>

      {showScanModal && (
        <ScanCustomerModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          customers={customers}
        />
      )}

      {showPurchaseModal && (
        <RecordPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          customers={customers}
        />
      )}
    </>
  );
}
