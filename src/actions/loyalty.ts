'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import type { LoyaltyProgram, LoyaltyRuleType } from '@/types/database';

export interface UpdateLoyaltyResult {
  success?: boolean;
  error?: string;
}

export async function getLoyaltyProgram(): Promise<LoyaltyProgram | null> {
  const { isSupabaseConfigured } = await import('@/lib/supabase/config');
  if (!isSupabaseConfigured()) {
    const { DEFAULT_LOYALTY } = await import('@/lib/data-service');
    return DEFAULT_LOYALTY;
  }

  try {
    const supabase = await createClient();
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business.id;

    let query = supabase.from('loyalty_programs').select('*');
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      const { DEFAULT_LOYALTY } = await import('@/lib/data-service');
      return DEFAULT_LOYALTY;
    }

    return data as LoyaltyProgram;
  } catch (err) {
    console.warn('Loyalty program fetch handled:', err);
    const { DEFAULT_LOYALTY } = await import('@/lib/data-service');
    return DEFAULT_LOYALTY;
  }
}

/**
 * Persists the business loyalty points rules in Supabase.
 * Enforces zero-tolerance validation: no zero, negative, or invalid values allowed.
 */
export async function updateLoyaltyProgram(formData: FormData): Promise<UpdateLoyaltyResult> {
  const ruleType = formData.get('ruleType') as LoyaltyRuleType;
  const rawPointsPerPurchase = formData.get('pointsPerPurchase') as string;
  const rawPointsPerCurrency = formData.get('pointsPerCurrency') as string;
  const rawCurrencyUnit = formData.get('currencyUnit') as string;

  // 1. Validate Rule Type
  if (!['per_purchase', 'per_currency'].includes(ruleType)) {
    return { error: 'Please choose either "Points per purchase" or "Points per amount spent".' };
  }

  // 2. Validate Values based on Rule Type
  let pointsPerPurchase = 10;
  let pointsPerCurrency = 1;
  let currencyUnit = 100;

  if (ruleType === 'per_purchase') {
    pointsPerPurchase = Number(rawPointsPerPurchase);
    if (isNaN(pointsPerPurchase) || !Number.isInteger(pointsPerPurchase) || pointsPerPurchase <= 0) {
      return { error: 'Points per purchase must be a positive whole number greater than 0.' };
    }
  } else if (ruleType === 'per_currency') {
    pointsPerCurrency = Number(rawPointsPerCurrency);
    currencyUnit = Number(rawCurrencyUnit);

    if (isNaN(pointsPerCurrency) || !Number.isInteger(pointsPerCurrency) || pointsPerCurrency <= 0) {
      return { error: 'Points earned must be a positive whole number greater than 0 (e.g. 1 point).' };
    }

    if (isNaN(currencyUnit) || !Number.isInteger(currencyUnit) || currencyUnit <= 0) {
      return { error: 'The amount spent (DA) must be a positive whole number greater than 0 (e.g. 100 DA).' };
    }
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) {
    return { error: 'You must be signed in to save loyalty rules.' };
  }

  const businessId = authBusiness.business.id;

  // 3. Persist in Supabase
  const { error: dbError } = await supabase
    .from('loyalty_programs')
    .upsert(
      {
        business_id: businessId,
        name: `${authBusiness.business.name} Loyalty Program`,
        rule_type: ruleType,
        points_per_purchase: pointsPerPurchase,
        points_per_currency: pointsPerCurrency,
        currency_unit: currencyUnit,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id' }
    );

  if (dbError) {
    console.error('Error saving loyalty rule to Supabase:', dbError);
    return { error: dbError.message || 'Failed to save changes. Please try again.' };
  }

  revalidatePath('/loyalty');
  revalidatePath('/dashboard');
  return { success: true };
}
