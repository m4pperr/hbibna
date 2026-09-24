'use client';

import { useState } from 'react';
import { BusinessSidebar } from './Sidebar';
import { BusinessHeader } from './Header';
import type { Customer } from '@/types/database';

interface DashboardShellProps {
  businessName: string;
  userName: string;
  customers: Customer[];
  children: React.ReactNode;
}

export function DashboardShell({
  businessName,
  userName,
  customers,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAF8F5]">
      {/* Sidebar with mobile drawer support */}
      <BusinessSidebar
        businessName={businessName}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <BusinessHeader
          businessName={businessName}
          userName={userName}
          customers={customers}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
