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
    <div className="min-h-screen bg-[#FAF8F5] text-[#191817] flex font-rounded">
      {/* 1. DESKTOP PERSISTENT SIDEBAR */}
      <aside className={`hidden lg:block w-72 shrink-0 h-screen sticky top-0 z-30 ${isRtl ? 'border-l-2' : 'border-r-2'} border-black bg-white`}>
        <CustomerSidebar
          memberships={memberships}
          activeBusinessId={activeMembership.business_id}
          customerName={customerName}
          customerPhone={customerPhone}
        />
      </aside>

      {/* 2. DRAWER SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className={`fixed inset-y-0 ${isRtl ? 'right-0 slide-in-from-right' : 'left-0 slide-in-from-left'} w-72 max-w-[85vw] shadow-2xl bg-white z-50 animate-in duration-200 border-2 border-black`}>
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
        {/* Customer Dashboard Header */}
        <header className="h-16 px-3 sm:px-4 md:px-6 lg:px-8 border-b-2 border-black bg-white sticky top-0 z-30 flex items-center justify-between shadow-[0_4px_0_#000] gap-2 sm:gap-4 select-none">
          {/* LEFT: 1. Hamburger menu button, 2. Hbibna logo/brand, 3. Selected business indicator/pill */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
            {/* 1. Hamburger menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-black bg-white hover:bg-[#FFF9D2] active:bg-[#FFE600] border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center shrink-0 cursor-pointer"
              aria-label={t('nav.menu')}
            >
              <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[2.5]" />
            </button>

            {/* 2. Hbibna logo/brand */}
            <Link
              href={getHref('/customer')}
              className="flex items-center shrink-0 hover:opacity-90 transition-opacity focus:outline-none"
              aria-label="Hbibna"
            >
              <HbibnaLogo size="sm" />
            </Link>

            {/* 3. Selected business indicator/pill */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              title={activeBusinessName}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#FFE600] hover:bg-[#FACC15] active:translate-y-0.5 active:shadow-none border-2 border-black text-xs font-black text-black min-w-0 max-w-[120px] xs:max-w-[155px] sm:max-w-[200px] md:max-w-xs shrink shadow-[0_2px_0_#000] transition-all cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
              <span className="truncate leading-none">{activeBusinessName}</span>
            </button>
          </div>

          {/* RIGHT: 4. Language selector */}
          <div className="flex items-center shrink-0 pl-1 rtl:pl-0 rtl:pr-1">
            <LanguageSelector variant="minimal" />
          </div>
        </header>

        {/* Spacious Main Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto pb-24 lg:pb-12">
          {children}
        </main>

        {/* Mobile Bottom Navigation (Convenient thumb bar) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-black shadow-[0_-4px_0_#000]">
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
                      ? 'text-black'
                      : 'text-black/60 hover:text-black'
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive ? 'bg-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 tracking-tight ${
                      isActive ? 'font-black text-black' : 'font-bold'
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
