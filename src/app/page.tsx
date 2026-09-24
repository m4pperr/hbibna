import Link from 'next/link';
import { PublicNavbar } from '@/components/public/Navbar';
import { PublicFooter } from '@/components/public/Footer';
import { FaqSection } from '@/components/public/FaqSection';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Gift,
  QrCode,
} from 'lucide-react';

import { PricingCards } from '@/components/public/PricingCards';
import { FeatureCarousel } from '@/components/public/FeatureCarousel';


export const metadata = {
  title: 'Hbibna | Reward your customers. Keep them coming back.',
  description:
    'Hbibna helps businesses create simple loyalty programs, reward customers with points, and turn more visits into repeat customers. 9,800 DA / month.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#191817] selection:bg-[#B88E3E]/20">
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E6DDCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Hero Text Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FBF6EB] border border-[#DFC99F]/70 text-[#B88E3E] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#B88E3E]" />
                <span>Hbibna Digital Loyalty Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#191817] leading-[1.12]">
                Reward your customers.{' '}
                <span className="text-[#B88E3E]">Keep them coming back.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#736B63] max-w-xl leading-relaxed">
                Hbibna helps businesses create simple loyalty programs, reward customers with
                points, and turn more visits into repeat customers.
              </p>

              {/* Call to Actions: Primary & Secondary */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-bold text-sm shadow-soft transition-all active:scale-[0.98]"
                >
                  <span>Start with Hbibna</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#191817] border border-[#E6DDCF] font-bold text-sm transition-colors"
                >
                  <span>Log in</span>
                </Link>
              </div>

              {/* Key Trust Checkmarks */}
              <div className="pt-3 flex flex-wrap items-center gap-5 text-xs font-medium text-[#736B63]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B88E3E]" />
                  <span>No apps to download</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B88E3E]" />
                  <span>Works on phone, tablet & PC</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B88E3E]" />
                  <span>Private isolated data</span>
                </div>
              </div>
            </div>

            {/* Hero Visual: Polished Digital Loyalty Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm sm:max-w-md">
                {/* Subtle warm glow behind card */}
                <div className="absolute -inset-2 rounded-3xl bg-[#B88E3E]/15 blur-2xl pointer-events-none" />

                {/* Main Digital Loyalty Card Container */}
                <div className="relative rounded-3xl bg-gradient-to-br from-[#191817] via-[#24211D] to-[#191817] text-[#FAF8F5] p-6 sm:p-7 shadow-2xl border border-[#DFC99F]/30 space-y-6">
                  
                  {/* Card Header: Business & Customer */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B88E3E] to-[#DFC99F] flex items-center justify-center text-white shadow-soft">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#DFC99F] block leading-tight">
                          Hbibna Card
                        </span>
                        <h4 className="font-extrabold text-sm text-white leading-tight mt-0.5">
                          Hbibna Artisan Café
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B88E3E]/25 text-[#DFC99F] border border-[#DFC99F]/30">
                      Member
                    </span>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <span className="text-xs text-[#FAF8F5]/70 font-medium block">
                      Customer
                    </span>
                    <p className="text-lg font-bold text-white tracking-tight">
                      Sarah Benali
                    </p>
                  </div>

                  {/* Large Points Balance */}
                  <div className="text-center py-2 bg-white/5 rounded-2xl border border-white/10">
                    <div className="text-5xl sm:text-6xl font-black text-[#DFC99F] tracking-tight leading-none">
                      1,250
                    </div>
                    <span className="inline-block mt-2 text-xs font-black uppercase tracking-widest text-[#FAF8F5]/80">
                      POINTS
                    </span>
                  </div>

                  {/* Rewards Preview on Card */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#DFC99F]">
                        Your Rewards
                      </span>
                      <span className="text-[11px] text-[#FAF8F5]/60">2 unlocked</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {/* Reward 1 */}
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-3.5 h-3.5 text-[#DFC99F]" />
                          <span className="font-bold text-white">Free Coffee</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">
                          500 pts • Ready
                        </span>
                      </div>

                      {/* Reward 2 */}
                      <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="w-3.5 h-3.5 text-[#DFC99F]" />
                          <span className="font-bold text-white">Free Dessert</span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">
                          1,000 pts • Ready
                        </span>
                      </div>

                      {/* Reward 3 */}
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between opacity-75">
                        <div className="flex items-center gap-2">
                          <Gift className="w-3.5 h-3.5 text-[#DFC99F]/70" />
                          <span className="font-medium text-white/80">500 DA Discount</span>
                        </div>
                        <span className="text-[11px] text-[#FAF8F5]/60">
                          2,000 pts (750 left)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-[#FAF8F5]/60 text-[11px]">
                      Instant mobile access
                    </span>
                    <div className="flex items-center gap-1.5 text-[#DFC99F] font-semibold text-xs">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Contactless QR</span>
                    </div>
                  </div>
                </div>

                {/* Clean Floating Activity Tag */}
                <div className="hidden sm:flex absolute -bottom-5 -left-4 bg-[#FFFFFF] border border-[#E6DDCF] shadow-card rounded-2xl px-4 py-2.5 items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FBF6EB] text-[#B88E3E] flex items-center justify-center font-bold text-xs">
                    +25
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#191817]">Purchase</p>
                    <p className="text-[10px] text-[#736B63]">2,500 DA order at checkout</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E6DDCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
              How Hbibna works
            </h2>
            <p className="text-sm text-[#736B63]">
              Simple for your staff at the counter, effortless for your customers on their phones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-4 hover:border-[#DFC99F] transition-all">
              <span className="text-3xl font-black text-[#B88E3E] block font-mono">
                01
              </span>
              <h3 className="font-extrabold text-xl text-[#191817]">
                Create your program
              </h3>
              <p className="text-sm text-[#736B63] leading-relaxed">
                Choose how your customers earn points.
              </p>
              <div className="pt-2 text-xs text-[#736B63]/80 border-t border-[#E6DDCF]">
                Set points per purchase or points per amount spent in DA.
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-4 hover:border-[#DFC99F] transition-all">
              <span className="text-3xl font-black text-[#B88E3E] block font-mono">
                02
              </span>
              <h3 className="font-extrabold text-xl text-[#191817]">
                Reward your customers
              </h3>
              <p className="text-sm text-[#736B63] leading-relaxed">
                Customers earn points whenever they purchase.
              </p>
              <div className="pt-2 text-xs text-[#736B63]/80 border-t border-[#E6DDCF]">
                Scan customer QR code or look up by name/phone in seconds.
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E6DDCF] space-y-4 hover:border-[#DFC99F] transition-all">
              <span className="text-3xl font-black text-[#B88E3E] block font-mono">
                03
              </span>
              <h3 className="font-extrabold text-xl text-[#191817]">
                Bring customers back
              </h3>
              <p className="text-sm text-[#736B63] leading-relaxed">
                Customers return to redeem rewards and keep earning.
              </p>
              <div className="pt-2 text-xs text-[#736B63]/80 border-t border-[#E6DDCF]">
                Build a dedicated base of lifelong regulars who choose you first.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-20 lg:py-28 bg-[#FAF8F5] border-b border-[#E6DDCF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
              Platform Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
              Everything built for real businesses
            </h2>
            <p className="text-sm text-[#736B63]">
              No unnecessary enterprise complexity. Only the essential retention tools that work.
            </p>
          </div>

          {/* Interactive Feature Card Carousel (Single card at a time with 5s timer & swipe) */}
          <FeatureCarousel />
        </div>
      </section>

      {/* 4. PRICING SECTION */}
      <section id="pricing" className="py-20 lg:py-28 bg-[#FFFFFF] border-b border-[#E6DDCF]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
          <div className="space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#B88E3E] bg-[#FBF6EB] px-3.5 py-1 rounded-full border border-[#DFC99F]/50">
              One Transparent Plan
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191817] tracking-tight">
              One price. No surprises.
            </h2>
            <p className="text-sm text-[#736B63] max-w-md mx-auto">
              Everything your business needs to launch and scale a thriving loyalty program.
            </p>
          </div>

          {/* Interactive Pricing Cards */}
          <PricingCards />
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <FaqSection />

      {/* 6. FINAL CTA SECTION */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-[#191817] via-[#24211D] to-[#191817] text-white text-center relative overflow-hidden">
        {/* Subtle warm glow elements */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#B88E3E]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#DFC99F]/10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#DFC99F] flex items-center justify-center mx-auto shadow-soft">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Your customers already love your business.{' '}
            <span className="text-[#DFC99F]">Give them a reason to come back.</span>
          </h2>

          <p className="text-base text-[#FAF8F5]/80 max-w-xl mx-auto leading-relaxed">
            Launch your complete digital loyalty program today for 9,800 DA / month.
            No card setup fees, no software installations.
          </p>

          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#B88E3E] hover:bg-[#A37B30] text-white font-bold text-sm shadow-gold transition-all active:scale-[0.98]"
            >
              <span>Start with Hbibna</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
