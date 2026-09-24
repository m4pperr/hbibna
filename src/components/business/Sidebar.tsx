'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Gift,
  Sliders,
  Settings,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { signOutBusiness } from '@/actions/auth';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface BusinessSidebarProps {
  businessName?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function BusinessSidebar({
  businessName,
  isOpen = false,
  onClose,
}: BusinessSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const NAV_ITEMS = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.customers'), href: '/customers', icon: Users },
    { name: t('nav.transactions'), href: '/transactions', icon: Receipt },
    { name: t('nav.rewards'), href: '/rewards', icon: Gift },
    { name: t('nav.loyaltyProgram'), href: '/loyalty', icon: Sliders },
    { name: t('nav.settings'), href: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full bg-[#FFFFFF]">
      <div>
        {/* Brand header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-[#E6DDCF]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <HbibnaLogo size="sm" />
            {businessName && (
              <span className="text-[10px] font-semibold text-[#736B63] bg-[#FAF8F5] border border-[#E6DDCF] px-2 py-0.5 rounded-full truncate max-w-[100px]">
                {businessName}
              </span>
            )}
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#FBF6EB] text-[#B88E3E] font-bold border border-[#DFC99F]/60 shadow-xs'
                    : 'text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#B88E3E]' : 'text-[#736B63]'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Language, Account & Log out */}
      <div className="p-4 border-t border-[#E6DDCF] space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-[#736B63] font-medium">{t('common.language')}</span>
          <LanguageSelector variant="pill" />
        </div>

        <div className="space-y-1 pt-1 border-t border-[#F3ECE2]">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/settings'
                ? 'bg-[#FBF6EB] text-[#B88E3E] font-bold border border-[#DFC99F]/60'
                : 'text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5]'
            }`}
          >
            <User className="w-4 h-4 text-[#736B63]" />
            <span>{t('nav.account')}</span>
          </Link>

          <form action={signOutBusiness}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 rtl:rotate-180" />
              <span>{t('nav.logout')}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r rtl:border-r-0 rtl:border-l border-[#E6DDCF] flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
