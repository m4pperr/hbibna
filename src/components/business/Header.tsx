import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Receipt, Sparkles, QrCode, LogOut, Settings, CreditCard, ChevronDown } from 'lucide-react';
import { RecordPurchaseModal } from './RecordPurchaseModal';
import { ScanCustomerModal } from './ScanCustomerModal';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { signOutBusiness } from '@/actions/auth';
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

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
              className="lg:hidden p-2 rounded-2xl text-black hover:bg-black/5 transition-colors shrink-0 border-2 border-black active:translate-y-0.5 cursor-pointer"
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

          {/* Language Selector (Desktop) */}
          <div className="hidden sm:block">
            <LanguageSelector variant="pill" />
          </div>

          {/* Divider */}
          <div className="h-6 w-0.5 bg-black/10 mx-0.5 hidden sm:block" />

          {/* User Profile with Interactive Dropdown (Works on Mobile & Desktop) */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1 rounded-2xl hover:bg-black/5 active:scale-95 transition-all cursor-pointer border-2 border-transparent focus:border-black"
              aria-label="User Profile Menu"
              aria-expanded={profileDropdownOpen}
            >
              <div className="w-9 h-9 rounded-2xl bg-black text-[#FFE600] flex items-center justify-center font-black text-xs tracking-wider border-2 border-black shadow-[0_2px_0_#000] shrink-0 font-mono">
                {initials}
              </div>
              <div className="hidden md:block text-start">
                <p className="text-xs font-black text-black leading-tight truncate max-w-[100px]">{userName}</p>
                <p className="text-[10px] text-black/60 font-bold">{t('common.owner')}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-black/60 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-64 rounded-3xl bg-white border-2 border-black shadow-[0_8px_0_#000] p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 font-rounded text-start">
                {/* User & Business Info */}
                <div className="pb-2.5 border-b-2 border-black/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-black text-[#FFE600] flex items-center justify-center font-black text-xs shrink-0 font-mono border border-black shadow-xs">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-black truncate">{userName}</p>
                      <p className="text-[11px] text-black/60 font-bold truncate">{businessName}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-black hover:bg-[#FFF9D2] transition-colors"
                  >
                    <Settings className="w-4 h-4 text-black/70" />
                    <span>{t('nav.settings')}</span>
                  </Link>

                  <Link
                    href="/billing"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-black hover:bg-[#FFF9D2] transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-black/70" />
                    <span>{t('nav.billing')}</span>
                  </Link>
                </div>

                {/* Mobile Language Selector */}
                <div className="sm:hidden pt-2 border-t-2 border-black/10 flex items-center justify-between">
                  <span className="text-xs font-black text-black/70">{t('common.language')}</span>
                  <LanguageSelector variant="pill" />
                </div>

                {/* Prominent Log Out Button */}
                <div className="pt-2 border-t-2 border-black/10">
                  <form action={signOutBusiness}>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 rtl:rotate-180" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </form>
                </div>
              </div>
            )}
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
