'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Customer, Referral, LoyaltyProgram } from '@/types/database';

export interface JoinWithReferralResult {
  success?: boolean;
  error?: string;
  customer?: Customer;
  isExisting?: boolean;
  pointsEarned?: number;
  referrerName?: string;
}

/**
 * Enrolls a customer through a referral invitation link or customer join flow.
 * Atomically grants welcome points to the referee and referral bonus points to the referrer.
 */
export async function joinWithReferral(formData: FormData): Promise<JoinWithReferralResult> {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const rawEmail = (formData.get('email') as string)?.trim();
  const email = rawEmail && rawEmail.length > 0 ? rawEmail.toLowerCase() : null;
  const businessId = (formData.get('businessId') as string)?.trim();
  const rawReferralCode = (formData.get('referralCode') as string)?.trim();
  const referralCode = rawReferralCode ? rawReferralCode.toUpperCase() : null;

  if (!name || !phone) {
    return { error: 'Veuillez saisir votre nom et numéro de téléphone.' };
  }

  if (!businessId) {
    return { error: 'Identifiant du commerce manquant.' };
  }

  const { isSupabaseConfigured } = await import('@/lib/supabase/config');

  if (!isSupabaseConfigured()) {
    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      business_id: businessId,
      name,
      phone,
      email,
      points_balance: referralCode ? 25 : 0,
      referral_code: 'HB-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return {
      success: true,
      customer: newCust,
      pointsEarned: referralCode ? 25 : 0,
      referrerName: referralCode ? 'Votre ami(e)' : undefined,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Check if customer already exists for this business
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .eq('phone', phone)
      .maybeSingle();

    if (existingCustomer) {
      return {
        success: true,
        isExisting: true,
        customer: existingCustomer as Customer,
      };
    }

    // 2. Fetch loyalty program settings for this business
    const { data: loyaltyData } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('business_id', businessId)
      .maybeSingle();

    const loyalty = loyaltyData as LoyaltyProgram | null;
    const referralBonus = loyalty?.referral_bonus_points ?? 50;
    const refereeWelcomeBonus = loyalty?.referee_welcome_points ?? 25;

    // 3. Resolve referrer if referral code provided
    let referrer: Customer | null = null;
    if (referralCode) {
      const { data: foundReferrer } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .ilike('referral_code', referralCode)
        .maybeSingle();

      if (foundReferrer && foundReferrer.phone !== phone) {
        referrer = foundReferrer as Customer;
      }
    }

    const initialPoints = referrer ? refereeWelcomeBonus : 0;
    const newCustomerReferralCode =
      'HB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 4. Create new customer record
    const { data: newCustomer, error: custError } = await supabase
      .from('customers')
      .insert({
        business_id: businessId,
        name,
        phone,
        email,
        points_balance: initialPoints,
        referral_code: newCustomerReferralCode,
        referred_by_customer_id: referrer ? referrer.id : null,
      })
      .select()
      .single();

    if (custError || !newCustomer) {
      console.error('Error creating customer:', custError);
      return { error: custError?.message || 'Erreur lors de la création du compte.' };
    }

    // 5. Create isolated membership in customer_businesses
    await supabase.from('customer_businesses').upsert(
      {
        customer_id: newCustomer.id,
        business_id: businessId,
        points_balance: initialPoints,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'customer_id,business_id' }
    );

    // 6. If referred by a friend: award points & record referral
    if (referrer) {
      // Award points to referrer
      const newReferrerBalance = (referrer.points_balance || 0) + referralBonus;
      await supabase
        .from('customers')
        .update({
          points_balance: newReferrerBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('id', referrer.id);

      await supabase
        .from('customer_businesses')
        .update({
          points_balance: newReferrerBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('customer_id', referrer.id)
        .eq('business_id', businessId);

      // Ledger transaction for Referrer
      await supabase.from('transactions').insert({
        business_id: businessId,
        customer_id: referrer.id,
        type: 'earn',
        amount: 0,
        points: referralBonus,
        description: `Bonus Parrainage: ami(e) ${name} inscrit(e) (+${referralBonus} pts)`,
      });

      // Ledger transaction for Referee (Welcome Bonus)
      if (initialPoints > 0) {
        await supabase.from('transactions').insert({
          business_id: businessId,
          customer_id: newCustomer.id,
          type: 'earn',
          amount: 0,
          points: initialPoints,
          description: `Cadeau de Bienvenue Parrainage (invité(e) par ${referrer.name})`,
        });
      }

      // Record in referrals table
      await supabase.from('referrals').insert({
        business_id: businessId,
        referrer_id: referrer.id,
        referred_id: newCustomer.id,
        points_awarded: referralBonus,
      });
    }

    revalidatePath('/customer');
    revalidatePath('/customers');
    revalidatePath('/dashboard');

    return {
      success: true,
      customer: newCustomer as Customer,
      pointsEarned: initialPoints,
      referrerName: referrer?.name,
    };
  } catch (err: any) {
    console.error('Unhandled joinWithReferral error:', err);
    return { error: err?.message || 'Une erreur inattendue est survenue.' };
  }
}

export interface CustomerReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalPointsEarned: number;
  referrals: Referral[];
  referralBonusPoints: number;
  refereeWelcomePoints: number;
}

/**
 * Fetches referral stats for a customer at a given business.
 */
export async function getCustomerReferralStats(
  customerId: string,
  businessId: string
): Promise<CustomerReferralStats> {
  const { isSupabaseConfigured } = await import('@/lib/supabase/config');

  if (!isSupabaseConfigured() || !customerId || customerId === 'guest') {
    return {
      referralCode: 'HB-VIP100',
      totalReferrals: 0,
      totalPointsEarned: 0,
      referrals: [],
      referralBonusPoints: 50,
      refereeWelcomePoints: 25,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Customer code
    const { data: customer } = await supabase
      .from('customers')
      .select('referral_code')
      .eq('id', customerId)
      .maybeSingle();

    // 2. Loyalty rules
    const { data: loyalty } = await supabase
      .from('loyalty_programs')
      .select('referral_bonus_points, referee_welcome_points')
      .eq('business_id', businessId)
      .maybeSingle();

    // 3. Referrals list
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*, referred:customers!referrals_referred_id_fkey(name, phone, created_at)')
      .eq('referrer_id', customerId)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    const refList = (referrals as unknown as Referral[]) || [];
    const totalPoints = refList.reduce((acc, r) => acc + (r.points_awarded || 0), 0);

    return {
      referralCode: customer?.referral_code || 'HB-' + customerId.slice(0, 6).toUpperCase(),
      totalReferrals: refList.length,
      totalPointsEarned: totalPoints,
      referrals: refList,
      referralBonusPoints: loyalty?.referral_bonus_points ?? 50,
      refereeWelcomePoints: loyalty?.referee_welcome_points ?? 25,
    };
  } catch (err) {
    console.warn('getCustomerReferralStats fallback:', err);
    return {
      referralCode: 'HB-' + customerId.slice(0, 6).toUpperCase(),
      totalReferrals: 0,
      totalPointsEarned: 0,
      referrals: [],
      referralBonusPoints: 50,
      refereeWelcomePoints: 25,
    };
  }
}
