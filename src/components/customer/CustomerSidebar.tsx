'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { CustomerBusinessMembership } from '@/types/database';
import {
  Store,
  Search,
  ChevronDown,
  Check,
  LayoutDashboard,
  Gift,
  Clock,
  QrCode,
  X,
  Sparkles,
} from 'lucide-react';

interface CustomerSidebarProps {
  memberships: CustomerBusinessMembership[];
  activeBusinessId: string;
  customerName: string;
  customerPhone?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function CustomerSidebar({
  memberships,
  activeBusinessId,
  customerName,
  customerPhone,
  isOpenMobile,
  onCloseMobile,
}: CustomerSidebarProps) {
  const { t, isRtl } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Switcher state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active membership
  const activeMembership = useMemo(() => {
    return (
      memberships.find((m) => m.business_id === activeBusinessId) ||
      memberships[0] || {
        business_id: 'default',
        points_balance: 0,
        business: { name: 'Café El Bahia', id: 'default' },
      }
    );
  }, [memberships, activeBusinessId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Instant search filtering
  const filteredMemberships = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return memberships;
    return memberships.filter((m) => {
      const name = (m.business?.name || '').toLowerCase();
      return name.includes(q);
    });
  }, [memberships, searchQuery]);

  // Handle switching business
  const handleSelectBusiness = (businessId: string) => {
    setIsMenuOpen(false);
    setSearchQuery('');
    if (onCloseMobile) onCloseMobile();

    // Preserve phone or c params while updating b param
    const params = new URLSearchParams(searchParams.toString());
    params.set('b', businessId);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Helper to create link URL preserving the active business
  const getHref = (targetPath: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('b', activeMembership.business_id);
    const qs = params.toString();
    return qs ? `${targetPath}?${qs}` : targetPath;
  };

  const navItems = [
    { name: t('customer.dashboard'), path: '/customer', icon: LayoutDashboard },
    { name: t('customer.rewards'), path: '/customer/rewards', icon: Gift },
    { name: t('customer.activity'), path: '/customer/activity', icon: Clock },
    { name: t('customer.myQr'), path: '/customer/qr', icon: QrCode },
  ];

  return (
    <div className={`flex flex-col h-full bg-[#FFFFFF] ${isRtl ? 'border-l' : 'border-r'} border-[#E6DDCF] w-72 select-none`}>
      {/* 1. Header with Logo & Close button for mobile */}
      <div className="h-16 px-5 border-b border-[#E6DDCF] flex items-center justify-between shrink-0">
        <Link
          href={getHref('/customer')}
          onClick={() => onCloseMobile && onCloseMobile()}
          className="flex items-center gap-2"
        >
          <HbibnaLogo size="sm" />
        </Link>

        <div className="flex items-center gap-2">
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] transition-colors lg:hidden"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Business Switcher */}
      <div className="p-4 border-b border-[#E6DDCF] relative" ref={menuRef}>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#736B63]">
            {t('customer.currentBusiness')}
          </span>
          <span className="text-[10px] font-semibold text-[#B88E3E] bg-[#FBF6EB] px-2 py-0.5 rounded-full border border-[#DFC99F]/50">
            {memberships.length} {t('customer.myBusinesses')}
          </span>
        </div>

        {/* Trigger Button: e.g. "Café El Bahia ▼" */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all ${
            isMenuOpen
              ? 'border-[#B88E3E] ring-2 ring-[#B88E3E]/20 bg-[#FBF6EB]/40'
              : 'border-[#E6DDCF] bg-[#FAF8F5] hover:bg-[#FFFFFF] hover:border-[#DFC99F] shadow-xs'
          }`}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="w-8 h-8 rounded-xl bg-[#FFFFFF] border border-[#E6DDCF] text-[#B88E3E] flex items-center justify-center shrink-0 shadow-xs">
              <Store className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-extrabold text-xs text-[#191817] truncate leading-tight">
                {activeMembership.business?.name || t('customer.switchBusiness')}
              </p>
              <p className="text-[11px] font-black text-[#B88E3E] mt-0.5 leading-none">
                {activeMembership.points_balance.toLocaleString()} {t('common.pts')}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[#736B63] shrink-0 transition-transform duration-200 ${
              isMenuOpen ? 'rotate-180 text-[#B88E3E]' : ''
            }`}
          />
        </button>

        {/* 3. Dropdown Menu / Popover */}
        {isMenuOpen && (
          <div className="absolute left-4 right-4 top-[84px] z-50 bg-[#FFFFFF] rounded-2xl border border-[#DFC99F] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Popover Header */}
            <div className="p-3 bg-[#FAF8F5] border-b border-[#E6DDCF]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#191817] tracking-tight">
                  {t('customer.myBusinesses')}
                </span>
                <span className="text-[10px] font-semibold text-[#736B63]">
                  {memberships.length} {t('customer.availableBusinesses')}
                </span>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-[#736B63] ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('customer.searchBusinesses')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-1.5 text-xs rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-[#191817] placeholder-[#736B63] focus:outline-none focus:border-[#B88E3E] focus:ring-1 focus:ring-[#B88E3E] ${
                    isRtl ? 'pr-8 pl-7' : 'pl-8 pr-7'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute top-1/2 -translate-y-1/2 text-[#736B63] hover:text-[#191817] ${isRtl ? 'left-2' : 'right-2'}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable List of Businesses (Handles 1, 5, 20+ businesses smoothly) */}
            <div className="max-h-64 overflow-y-auto divide-y divide-[#E6DDCF]/40 p-1">
              {filteredMemberships.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#736B63]">
                  {t('customer.noSavedBusinesses')}
                </div>
              ) : (
                filteredMemberships.map((mem) => {
                  const isSelected = mem.business_id === activeMembership.business_id;
                  const bizName = mem.business?.name || 'Partner Business';

                  return (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => handleSelectBusiness(mem.business_id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                        isSelected
                          ? 'bg-[#FBF6EB] text-[#191817]'
                          : 'hover:bg-[#FAF8F5] text-[#191817]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected
                              ? 'bg-[#B88E3E] text-white'
                              : 'bg-[#FAF8F5] border border-[#E6DDCF] text-[#736B63]'
                          }`}
                        >
                          {bizName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold truncate leading-tight text-[#191817]">
                            {bizName}
                          </p>
                          <p className="text-[11px] font-black text-[#B88E3E] mt-0.5">
                            {mem.points_balance.toLocaleString()} {t('common.pts')}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#B88E3E] shrink-0 stroke-[2.5]" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Sidebar Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={getHref(item.path)}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#FBF6EB] text-[#B88E3E] font-bold border border-[#DFC99F]/50 shadow-xs'
                  : 'text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#B88E3E] stroke-[2.5]' : 'text-[#736B63]'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* 5. Language Selector Section */}
      <div className="px-4 py-2 border-t border-[#E6DDCF]/60 flex items-center justify-between">
        <span className="text-[11px] text-[#736B63] font-medium">{t('nav.language')}:</span>
        <LanguageSelector variant="compact" />
      </div>

      {/* 6. Customer Profile Footer */}
      <div className="p-3.5 border-t border-[#E6DDCF] bg-[#FAF8F5]/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#E6DDCF] text-[#B88E3E] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            {customerName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[#191817] truncate leading-tight text-xs">
              {customerName}
            </p>
            <p className="text-[10px] text-[#736B63] truncate mt-0.5" dir="ltr">
              {customerPhone || 'Loyalty Member'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#B88E3E] bg-[#FFFFFF] px-2 py-0.5 rounded-full border border-[#E6DDCF] shrink-0">
          {t('customer.wallet')}
        </span>
      </div>
    </div>
  );
}
