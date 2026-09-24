import type { Metadata } from 'next';
import { PricingPageClient } from '@/components/public/PricingPageClient';

export const metadata: Metadata = {
  title: 'Pricing — Hbibna',
  description:
    'Simple, predictable loyalty platform pricing for Algerian businesses. One transparent plan with no hidden fees or customer limits.',
};

export default function PricingPage() {
  return <PricingPageClient />;
}
