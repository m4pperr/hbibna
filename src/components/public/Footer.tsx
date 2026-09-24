import Link from 'next/link';
import { Heart } from 'lucide-react';
import { HbibnaLogo } from '@/components/brand/HbibnaLogo';

export function PublicFooter() {
  return (
    <footer className="border-t border-[#E6DDCF] bg-[#F3ECE2]/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <HbibnaLogo size="md" />
            </Link>
            <p className="text-sm text-[#736B63] max-w-sm leading-relaxed">
              The modern digital loyalty platform crafted for retail shops, cafes, restaurants,
              and boutiques. Turn first-time shoppers into lifelong regulars.
            </p>
          </div>

          {/* Business links */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#191817] mb-3">
              Business
            </h4>
            <ul className="space-y-2 text-sm text-[#736B63]">
              <li>
                <Link href="/signup" className="hover:text-[#191817] transition-colors">
                  Register Business
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#191817] transition-colors">
                  Business Login
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#191817] transition-colors">
                  Pricing &amp; Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer links */}
          <div>
            <h4 className="text-xs uppercase font-semibold tracking-wider text-[#191817] mb-3">
              Customer
            </h4>
            <ul className="space-y-2 text-sm text-[#736B63]">
              <li>
                <Link href="/rewards-catalog" className="hover:text-[#191817] transition-colors">
                  Rewards Catalog
                </Link>
              </li>
              <li>
                <Link href="/customer" className="hover:text-[#191817] transition-colors">
                  Digital Loyalty Pass
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E6DDCF]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#736B63]">
          <p>© {new Date().getFullYear()} Hbibna. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Built with care for local Algerian businesses</span>
            <Heart className="w-3.5 h-3.5 text-[#B88E3E] fill-[#B88E3E]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
