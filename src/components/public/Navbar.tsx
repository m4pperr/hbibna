'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E6DDCF] bg-[#FAF8F5]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex items-center group">
          <HbibnaLogo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#736B63]">
          <Link href="/#how-it-works" className="hover:text-[#191817] transition-colors">
            How It Works
          </Link>
          <Link href="/#features" className="hover:text-[#191817] transition-colors">
            Features
          </Link>
          <Link href="/rewards-catalog" className="hover:text-[#191817] transition-colors">
            Rewards Catalog
          </Link>
          <Link href="/signup" className="hover:text-[#B88E3E] transition-colors font-bold">
            Register
          </Link>
          <Link href="/login" className="hover:text-[#191817] transition-colors">
            Login
          </Link>
        </nav>

        {/* Desktop Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-[#191817] hover:text-[#B88E3E] px-3.5 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#B88E3E] hover:bg-[#A37B30] text-white px-4 py-2.5 rounded-xl shadow-soft transition-all active:scale-[0.98]"
          >
            <span>Start with Hbibna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#736B63] hover:text-[#191817] hover:bg-[#F3ECE2] transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E6DDCF] bg-[#FAF8F5] px-5 py-6 space-y-4 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3 text-sm font-semibold text-[#191817]">
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#B88E3E]"
            >
              How It Works
            </Link>
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#B88E3E]"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#B88E3E]"
            >
              Pricing
            </Link>
            <Link
              href="/rewards-catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#B88E3E]"
            >
              Rewards Catalog
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#B88E3E]"
            >
              FAQ
            </Link>
          </nav>

          <div className="pt-4 border-t border-[#E6DDCF] flex flex-col gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-[#E6DDCF] text-xs font-bold text-[#191817] min-h-[44px] flex items-center justify-center hover:bg-[#FFFFFF]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-xs font-bold text-white shadow-soft min-h-[44px] flex items-center justify-center"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
