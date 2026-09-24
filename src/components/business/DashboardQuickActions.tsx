'use client';

import { useState } from 'react';
import { UserPlus, Receipt, QrCode } from 'lucide-react';
import { AddCustomerModal } from './AddCustomerModal';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer } from '@/types/database';

interface DashboardQuickActionsProps {
  customers: Customer[];
}

export function DashboardQuickActions({ customers }: DashboardQuickActionsProps) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        {/* Primary Action: Scan Customer */}
        <button
          onClick={() => setShowScanModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#191817] hover:bg-[#2B2927] shadow-soft transition-all cursor-pointer active:scale-[0.98] min-h-[44px] w-full sm:w-auto"
        >
          <QrCode className="w-4 h-4 text-[#DFC99F]" />
          <span>{t('business.scanCustomer')}</span>
        </button>

        {/* Quick Action: Add Customer */}
        <button
          onClick={() => setShowCustomerModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#191817] bg-[#FFFFFF] border border-[#E6DDCF] hover:bg-[#FAF8F5] shadow-xs transition-all cursor-pointer active:scale-[0.98] min-h-[44px] w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4 text-[#B88E3E]" />
          <span>{t('business.addCustomer')}</span>
        </button>

        {/* Quick Action: Add Purchase */}
        <button
          onClick={() => setShowPurchaseModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#191817] bg-[#FFFFFF] border border-[#E6DDCF] hover:bg-[#FAF8F5] shadow-xs transition-all cursor-pointer active:scale-[0.98] min-h-[44px] w-full sm:w-auto"
        >
          <Receipt className="w-4 h-4 text-[#B88E3E]" />
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

      {showCustomerModal && (
        <AddCustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
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
