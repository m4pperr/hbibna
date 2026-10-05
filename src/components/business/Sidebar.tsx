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
    <div className="flex flex-col justify-between h-full bg-white font-rounded">
      <div>
        {/* Brand header */}
        <div className="h-20 px-6 flex items-center justify-between border-b-2 border-black/10">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <HbibnaLogo size="sm" />
            {businessName && (
              <span className="text-[10px] font-black text-black bg-[#FFDE59] border border-black px-2.5 py-0.5 rounded-full truncate max-w-[110px] shadow-2xs">
                {businessName}
              </span>
            )}
          </Link>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-black hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-2">
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
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-black transition-all ${
                  isActive
                    ? 'bg-black text-[#FFE600] border-2 border-black shadow-[0_3px_0_#000]'
                    : 'text-black/70 hover:text-black hover:bg-[#FFF9D2] border-2 border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#FFE600]' : 'text-black/60'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Language, Account & Log out */}
      <div className="p-4 border-t-2 border-black/10 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-black/70 font-black">{t('common.language')}</span>
          <LanguageSelector variant="pill" />
        </div>

        <div className="space-y-1.5 pt-2 border-t-2 border-black/10">
          <Link
            href="/settings"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              pathname === '/settings'
                ? 'bg-black text-[#FFE600] border-2 border-black shadow-[0_3px_0_#000]'
                : 'text-black/75 hover:text-black hover:bg-[#FFF9D2]'
            }`}
          >
            <User className="w-4 h-4 text-black/60" />
            <span>{t('nav.account')}</span>
          </Link>

          <form action={signOutBusiness}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
      <aside className="hidden lg:flex w-64 border-r-2 rtl:border-r-0 rtl:border-l-2 border-black flex-col shrink-0 min-h-screen sticky top-0 h-screen shadow-[4px_0_0_rgba(0,0,0,0.03)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onClose}
          />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 border-r-2 border-black">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
