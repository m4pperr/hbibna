import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { DEFAULT_BUSINESS, DEFAULT_LOYALTY } from '@/lib/data-service';
import { CustomerJoinView } from '@/components/customer/CustomerJoinView';
import type { Business, LoyaltyProgram, Customer } from '@/types/database';

export const dynamic = 'force-dynamic';

interface CustomerJoinPageProps {
  searchParams: Promise<{ ref?: string; b?: string }>;
}

export default async function CustomerJoinPage({ searchParams }: CustomerJoinPageProps) {
  const { ref: referralCode, b: businessId } = await searchParams;

  let business: Business = DEFAULT_BUSINESS;
  let loyalty: LoyaltyProgram = DEFAULT_LOYALTY;
  let referrer: Customer | null = null;

  const targetBusinessId = businessId || DEFAULT_BUSINESS.id;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      // 1. Fetch business info
      const { data: bData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', targetBusinessId)
        .maybeSingle();

      if (bData) business = bData as Business;

      // 2. Fetch loyalty rules
      const { data: lpData } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('business_id', targetBusinessId)
        .maybeSingle();

      if (lpData) loyalty = lpData as LoyaltyProgram;

      // 3. Resolve referrer name if referralCode provided
      if (referralCode) {
        const { data: refData } = await supabase
          .from('customers')
          .select('*')
          .eq('business_id', targetBusinessId)
          .ilike('referral_code', referralCode.trim())
          .maybeSingle();

        if (refData) referrer = refData as Customer;
      }
    } catch (err) {
      console.warn('Error fetching join page data:', err);
    }
  }

  return (
    <CustomerJoinView
      business={business}
      loyalty={loyalty}
      referrer={referrer}
      initialReferralCode={referralCode || ''}
    />
  );
}
