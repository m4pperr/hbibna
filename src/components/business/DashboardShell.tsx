'use client';

import { useState } from 'react';
import { BusinessSidebar } from './Sidebar';
import { BusinessHeader } from './Header';
import { OfflineCacheSeeder } from './OfflineCacheSeeder';
import { OfflineBanner } from './OfflineStatusBar';
import type { Customer } from '@/types/database';

interface DashboardShellProps {
  businessId?: string;
  businessName: string;
  userName: string;
  customers: Customer[];
  children: React.ReactNode;
}

export function DashboardShell({
  businessId = 'biz-default-1',
  businessName,
  userName,
  customers,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FFDE59] font-rounded selection:bg-black selection:text-[#FFDE59]">
      {/* Background seeder for IndexedDB offline persistence */}
      <OfflineCacheSeeder
        businessId={businessId}
        businessName={businessName}
        customers={customers}
      />

      {/* Sidebar with mobile drawer support */}
      <BusinessSidebar
        businessName={businessName}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <BusinessHeader
          businessId={businessId}
          businessName={businessName}
          userName={userName}
          customers={customers}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Dynamic Offline / Syncing Warning Banner */}
        <OfflineBanner businessId={businessId} />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
