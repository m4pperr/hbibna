'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { CustomerSidebar } from '@/components/customer/CustomerSidebar';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { CustomerBusinessMembership } from '@/types/database';
import { Menu, LayoutDashboard, Gift, Clock, QrCode, Store } from 'lucide-react';

interface CustomerPortalLayoutClientProps {
  memberships: CustomerBusinessMembership[];
  activeBusinessId?: string;
  customerName: string;
  customerPhone?: string;
  children: React.ReactNode;
}

export function CustomerPortalLayoutClient({
  memberships,
  activeBusinessId,
  customerName,
  customerPhone,
  children,
}: CustomerPortalLayoutClientProps) {
  const { t, isRtl } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedParam = searchParams.get('b');
  const targetId = selectedParam || activeBusinessId || memberships[0]?.business_id;

  const activeMembership =
    memberships.find((m) => m.business_id === targetId) ||
    memberships[0] || {
      business_id: 'default',
      points_balance: 0,
      business: { name: 'Café El Bahia' },
    };

  const activeBusinessName = activeMembership.business?.name || 'Café El Bahia';

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
    <div className="min-h-screen bg-[#FAF8F5] text-[#191817] flex selection:bg-[#B88E3E]/20">
      {/* 1. DESKTOP PERSISTENT SIDEBAR */}
      <aside className={`hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30 ${isRtl ? 'border-l' : 'border-r'} border-[#E6DDCF]`}>
        <CustomerSidebar
          memberships={memberships}
          activeBusinessId={activeMembership.business_id}
          customerName={customerName}
          customerPhone={customerPhone}
        />
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className={`fixed inset-y-0 ${isRtl ? 'right-0 slide-in-from-right' : 'left-0 slide-in-from-left'} w-72 max-w-[85vw] shadow-2xl bg-white z-50 animate-in duration-200`}>
            <CustomerSidebar
              memberships={memberships}
              activeBusinessId={activeMembership.business_id}
              customerName={customerName}
              customerPhone={customerPhone}
              isOpenMobile={true}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 px-4 border-b border-[#E6DDCF] bg-[#FFFFFF] sticky top-0 z-30 flex items-center justify-between shadow-xs gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-[#191817] hover:bg-[#FAF8F5] border border-[#E6DDCF] transition-colors shrink-0"
              aria-label={t('nav.menu')}
            >
              <Menu className="w-5 h-5" />
            </button>
            <HbibnaLogo size="sm" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Active Business Indicator Pill (tappable to open switcher) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#DFC99F]/70 text-xs font-bold text-[#191817] max-w-[140px] sm:max-w-[170px] truncate"
            >
              <Store className="w-3.5 h-3.5 text-[#B88E3E] shrink-0" />
              <span className="truncate">{activeBusinessName}</span>
            </button>

            <LanguageSelector variant="minimal" />
          </div>
        </header>

        {/* Spacious Main Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Convenient thumb bar) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E6DDCF] shadow-lg">
          <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={getHref(item.path)}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                    isActive
                      ? 'text-[#B88E3E]'
                      : 'text-[#736B63] hover:text-[#191817]'
                  }`}
                >
                  <div
                    className={`p-1 rounded-xl transition-all ${
                      isActive ? 'bg-[#FBF6EB]' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 tracking-tight ${
                      isActive ? 'font-bold text-[#B88E3E]' : 'font-medium'
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
