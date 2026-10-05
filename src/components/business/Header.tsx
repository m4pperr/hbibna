'use client';

import { useState } from 'react';
import { Menu, Receipt, Sparkles, QrCode } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Customer } from '@/types/database';
import { OfflineStatusBar } from './OfflineStatusBar';

interface BusinessHeaderProps {
  businessId?: string;
  businessName?: string;
  userName?: string;
  customers?: Customer[];
  onToggleMobileMenu?: () => void;
}

export function BusinessHeader({
  businessId = 'biz-default-1',
  businessName = 'Hbibna Business',
  userName = 'Owner',
  customers = [],
  onToggleMobileMenu,
}: BusinessHeaderProps) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const { t } = useLanguage();

  // User initials
  const initials = userName
    ? userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'HB';

  return (
    <>
      <header className="h-20 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white flex items-center justify-between sticky top-0 z-30 font-rounded">
        {/* Left: Mobile hamburger & Business Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-2xl text-black hover:bg-black/5 transition-colors shrink-0 border-2 border-black"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[#FFDE59] text-black border-2 border-black flex items-center justify-center font-black text-xs shrink-0 shadow-[0_2px_0_#000]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-start">
              <h2 className="text-sm sm:text-base font-black text-black tracking-tight truncate max-w-[120px] sm:max-w-xs">
                {businessName}
              </h2>
              <span className="hidden sm:inline-block text-[11px] font-bold text-black/60">
                {t('business.systemName')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions, Language & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Action: Scan Customer (QR Identification) */}
          <button
            onClick={() => setShowScanModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-black hover:bg-zinc-800 border-2 border-black shadow-[0_3px_0_#000] hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-[#FFE600]" />
            <span className="hidden sm:inline">{t('business.scanCustomer')}</span>
            <span className="sm:hidden">{t('business.scanCustomerShort')}</span>
          </button>

          {/* Quick Action: Add Purchase */}
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-black text-black bg-[#FFE600] border-2 border-black shadow-[0_3px_0_#000] hover:bg-yellow-400 hover:translate-x-0.5 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-black" />
            <span>{t('business.addPurchase')}</span>
          </button>

          {/* Offline / Online Connectivity & Sync Status Bar */}
          <OfflineStatusBar businessId={businessId} />

          {/* Language Selector */}
          <div className="hidden sm:block">
            <LanguageSelector variant="pill" />
          </div>

          {/* Divider */}
          <div className="h-6 w-0.5 bg-black/10 mx-0.5 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-0.5 sm:pl-1 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-black text-[#FFE600] flex items-center justify-center font-black text-xs tracking-wider border-2 border-black shadow-[0_2px_0_#000] shrink-0 font-mono">
              {initials}
            </div>
            <div className="hidden md:block text-start">
              <p className="text-xs font-black text-black leading-tight">{userName}</p>
              <p className="text-[10px] text-black/60 font-bold">{t('common.owner')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showScanModal && (
        <ScanCustomerModal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          customers={customers}
          businessId={businessId}
        />
      )}

      {showPurchaseModal && (
        <RecordPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          customers={customers}
          businessId={businessId}
        />
      )}
    </>
  );
}
