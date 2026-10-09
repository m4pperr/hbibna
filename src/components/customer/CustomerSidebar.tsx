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
  Users,
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
  const { t, isRtl, language } = useLanguage();
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
        business: { name: 'Commerce Partenaire', id: 'default' },
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
    {
      name: language === 'ar' ? 'الإحالة والمكافآت' : language === 'fr' ? 'Parrainage' : 'Referrals',
      path: '/customer/referral',
      icon: Users,
      badge: language === 'ar' ? 'مكافأة' : language === 'fr' ? '+Bonus' : '+Bonus',
    },
    { name: t('customer.rewards'), path: '/customer/rewards', icon: Gift },
    { name: t('customer.activity'), path: '/customer/activity', icon: Clock },
    { name: t('customer.myQr'), path: '/customer/qr', icon: QrCode },
  ];

  return (
    <div className={`flex flex-col h-full bg-[#FFFFFF] ${isRtl ? 'border-l-2' : 'border-r-2'} border-black w-72 select-none font-rounded`}>
      {/* 1. Header with Logo & Close button for mobile */}
      <div className="h-16 px-5 border-b-2 border-black flex items-center justify-between shrink-0 bg-white">
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
              className="p-1.5 rounded-xl text-black hover:bg-[#FFF9D2] border-2 border-black shadow-[0_2px_0_#000] transition-colors lg:hidden"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Compact Business Switcher */}
      <div className="p-4 border-b-2 border-black relative" ref={menuRef}>
        <div className="flex items-center justify-between mb-2 px-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/60">
            {t('customer.currentBusiness')}
          </span>
          <span className="text-[10px] font-black text-black bg-[#FFE600] px-2 py-0.5 rounded-full border-2 border-black shadow-[0_2px_0_#000]">
            {memberships.length} {t('customer.myBusinesses')}
          </span>
        </div>

        {/* Trigger Button: e.g. "Artisan Bakery Oran ▼" */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`w-full flex items-center justify-between p-2.5 rounded-2xl border-2 border-black text-left transition-all ${
            isMenuOpen
              ? 'bg-[#FFE600] shadow-[0_4px_0_#000]'
              : 'bg-[#FFF9D2] hover:bg-white shadow-[0_3px_0_#000]'
          }`}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-1">
            <div className="w-8 h-8 rounded-xl bg-white border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Store className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-black text-xs text-black truncate leading-tight">
                {activeMembership.business?.name || t('customer.switchBusiness')}
              </p>
              <p className="text-[11px] font-black text-black/80 mt-0.5 leading-none">
                {activeMembership.points_balance.toLocaleString()} {t('common.pts')}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-black shrink-0 transition-transform duration-200 stroke-[2.5] ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* 3. Dropdown Menu / Popover */}
        {isMenuOpen && (
          <div className="absolute left-4 right-4 top-[84px] z-50 bg-[#FFFFFF] rounded-2xl border-2 border-black shadow-[0_8px_0_#000] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Popover Header */}
            <div className="p-3 bg-[#FFE600] border-b-2 border-black">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-black tracking-tight">
                  {t('customer.myBusinesses')}
                </span>
                <span className="text-[10px] font-black text-black/70">
                  {memberships.length} {t('customer.availableBusinesses')}
                </span>
              </div>

              {/* Instant Search Bar */}
              <div className="relative">
                <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-black/60 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('customer.searchBusinesses')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-1.5 text-xs rounded-xl border-2 border-black bg-white text-black font-bold placeholder:text-black/50 focus:outline-none ${
                    isRtl ? 'pr-8 pl-7' : 'pl-8 pr-7'
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute top-1/2 -translate-y-1/2 text-black hover:text-black ${isRtl ? 'left-2' : 'right-2'}`}
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable List of Businesses */}
            <div className="max-h-64 overflow-y-auto divide-y-2 divide-black/10 p-1">
              {filteredMemberships.length === 0 ? (
                <div className="p-6 text-center text-xs text-black/60 font-bold">
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
                          ? 'bg-[#FFE600] text-black font-black'
                          : 'hover:bg-[#FFF9D2] text-black'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-black border-2 border-black ${
                            isSelected
                              ? 'bg-black text-[#FFE600]'
                              : 'bg-white text-black'
                          }`}
                        >
                          {bizName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-extrabold truncate leading-tight text-black">
                            {bizName}
                          </p>
                          <p className="text-[11px] font-black text-black/70 mt-0.5">
                            {mem.points_balance.toLocaleString()} {t('common.pts')}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-black shrink-0 stroke-[3]" />
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
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={getHref(item.path)}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all ${
                isActive
                  ? 'bg-black text-[#FFE600] border-2 border-black shadow-[0_3px_0_#000]'
                  : 'text-black/70 hover:text-black hover:bg-[#FFF9D2]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#FFE600] stroke-[2.5]' : 'text-black stroke-[2]'
                }`}
              />
              <span className="flex-1 truncate">{item.name}</span>
              {item.badge && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                  isActive ? 'bg-[#FFE600] text-black' : 'bg-[#FFE600] text-black border border-black'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 5. Language Selector Section */}
      <div className="px-4 py-2 border-t-2 border-black/10 flex items-center justify-between">
        <span className="text-[11px] text-black/70 font-bold">{t('nav.language')}:</span>
        <LanguageSelector variant="compact" />
      </div>

      {/* 6. Customer Profile Footer */}
      <div className="p-3.5 border-t-2 border-black bg-[#FFF9D2] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-black text-black flex items-center justify-center font-black text-xs shrink-0 shadow-[0_2px_0_#000]">
            {customerName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-black text-black truncate leading-tight text-xs">
              {customerName}
            </p>
            <p className="text-[10px] text-black/60 truncate mt-0.5 font-bold" dir="ltr">
              {customerPhone || 'Loyalty Member'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black text-black bg-[#FFE600] px-2 py-0.5 rounded-full border-2 border-black shadow-[0_1px_0_#000] shrink-0">
          {t('customer.wallet')}
        </span>
      </div>
    </div>
  );
}
