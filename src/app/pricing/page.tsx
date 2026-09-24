import Link from 'next/link';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { PricingCards } from '@/components/public/PricingCards';
import { CheckCircle2, ArrowRight, Sparkles, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <PublicNavbar />

      <main className="flex-1 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center space-y-4 mb-14">
            <span className="text-xs uppercase tracking-wider font-bold text-[#B88E3E]">
              Simple & Predictable
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#191817] tracking-tight">
              One transparent plan. No surprises.
            </h1>
            <p className="text-base text-[#736B63] max-w-lg mx-auto">
              Everything you need to launch, manage, and scale your loyalty program. No hidden fees,
              no tiered customer limits.
            </p>
          </div>

          {/* Interactive Pricing Cards */}
          <PricingCards />

          {/* FAQ snippet */}
          <div className="mt-16 space-y-6">
            <h3 className="text-lg font-bold text-[#191817] text-center">Frequently Asked Questions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] space-y-1.5">
                <h4 className="text-sm font-semibold text-[#191817]">Do my customers need to install an app?</h4>
                <p className="text-xs text-[#736B63]">
                  No! Customers can access their pass and QR code directly through any mobile browser or add it to their home screen.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] space-y-1.5">
                <h4 className="text-sm font-semibold text-[#191817]">How do I record purchases?</h4>
                <p className="text-xs text-[#736B63]">
                  Simply enter the amount spent on your phone or POS tablet. Hbibna calculates and awards the points automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
