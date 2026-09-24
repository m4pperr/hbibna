'use client';

import { useState } from 'react';
import { Menu, Plus, UserPlus, Receipt, User, Sparkles, QrCode } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { AddCustomerModal } from './AddCustomerModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import type { Customer } from '@/types/database';

interface BusinessHeaderProps {
  businessName?: string;
  userName?: string;
  customers?: Customer[];
  onToggleMobileMenu?: () => void;
}

export function BusinessHeader({
  businessName = 'Hbibna Business',
  userName = 'Owner',
  customers = [],
  onToggleMobileMenu,
}: BusinessHeaderProps) {
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

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
      <header className="h-18 px-4 sm:px-6 lg:px-8 border-b border-[#E6DDCF] bg-[#FFFFFF] flex items-center justify-between sticky top-0 z-30">
        {/* Left: Mobile hamburger & Business Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] transition-colors shrink-0"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center font-bold text-xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-[#191817] tracking-tight truncate max-w-[120px] sm:max-w-xs">
                {businessName}
              </h2>
              <span className="hidden sm:inline-block text-[11px] font-medium text-[#736B63]">
                Hbibna Loyalty System
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Action: Scan Customer (QR Identification) */}
          <button
            onClick={() => setShowScanModal(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#191817] hover:bg-[#2B2927] shadow-soft transition-all active:scale-[0.98] cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-[#DFC99F]" />
            <span className="hidden sm:inline">Scan Customer</span>
            <span className="sm:hidden">Scan</span>
          </button>

          {/* Quick Action: Add Customer */}
          <button
            onClick={() => setShowCustomerModal(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#191817] bg-[#FAF8F5] border border-[#E6DDCF] hover:bg-[#F3ECE2] transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#B88E3E]" />
            <span>Add Customer</span>
          </button>

          {/* Quick Action: Add Purchase */}
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#191817] bg-[#FAF8F5] border border-[#E6DDCF] hover:bg-[#F3ECE2] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5 text-[#B88E3E]" />
            <span>Add Purchase</span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-[#E6DDCF] mx-0.5 sm:mx-1 hidden sm:block" />

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-0.5 sm:pl-1 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#191817] text-[#FAF8F5] flex items-center justify-center font-bold text-xs tracking-wider border border-[#DFC99F]/40 shadow-xs shrink-0">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#191817] leading-tight">{userName}</p>
              <p className="text-[10px] text-[#B88E3E] font-medium">Owner</p>
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
        />
      )}

      {showPurchaseModal && (
        <RecordPurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          customers={customers}
        />
      )}

      {showCustomerModal && (
        <AddCustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
    </>
  );
}
