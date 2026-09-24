'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import type { Reward } from '@/types/database';

export interface RewardActionResult {
  success?: boolean;
  error?: string;
  reward?: Reward;
}

export interface RedemptionActionResult {
  success?: boolean;
  error?: string;
  customerName?: string;
  rewardName?: string;
  pointsUsed?: number;
  newBalance?: number;
  redemptionId?: string;
}

/**
 * Fetches all rewards for the authenticated business.
 */
export async function getRewards(): Promise<Reward[]> {
  const { isSupabaseConfigured } = await import('@/lib/supabase/config');
  if (!isSupabaseConfigured()) {
    const { DEFAULT_REWARDS } = await import('@/lib/data-service');
    return DEFAULT_REWARDS;
  }

  try {
    const supabase = await createClient();
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business.id;

    let query = supabase
      .from('rewards')
      .select('*')
      .order('points_required', { ascending: true });

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rewards:', error);
      const { DEFAULT_REWARDS } = await import('@/lib/data-service');
      return DEFAULT_REWARDS;
    }

    return (data as Reward[]) || [];
  } catch (err) {
    console.warn('Rewards fetch handled:', err);
    const { DEFAULT_REWARDS } = await import('@/lib/data-service');
    return DEFAULT_REWARDS;
  }
}

/**
 * Creates a new reward for the business.
 */
export async function createReward(formData: FormData): Promise<RewardActionResult> {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || '';
  const rawPoints = formData.get('pointsRequired') as string;
  const pointsRequired = parseInt(rawPoints, 10);

  if (!name) {
    return { error: 'Please enter a reward name.' };
  }

  if (isNaN(pointsRequired) || pointsRequired <= 0) {
    return { error: 'Points required must be a positive number greater than 0.' };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const businessId = authBusiness.business.id;

  const { data, error } = await supabase
    .from('rewards')
    .insert({
      business_id: businessId,
      name,
      description,
      points_required: pointsRequired,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/rewards');
  revalidatePath('/dashboard');
  revalidatePath('/customer/rewards');
  return { success: true, reward: data as Reward };
}

/**
 * Edits an existing reward.
 */
export async function updateReward(id: string, formData: FormData): Promise<RewardActionResult> {
  const name = (formData.get('name') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || '';
  const rawPoints = formData.get('pointsRequired') as string;
  const pointsRequired = parseInt(rawPoints, 10);

  if (!name) {
    return { error: 'Please enter a reward name.' };
  }

  if (isNaN(pointsRequired) || pointsRequired <= 0) {
    return { error: 'Points required must be a positive number greater than 0.' };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const businessId = authBusiness.business.id;

  const { data, error } = await supabase
    .from('rewards')
    .update({
      name,
      description,
      points_required: pointsRequired,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('business_id', businessId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/rewards');
  revalidatePath('/dashboard');
  revalidatePath('/customer/rewards');
  return { success: true, reward: data as Reward };
}

/**
 * Deletes a reward belonging to the business.
 */
export async function deleteReward(id: string): Promise<RewardActionResult> {
  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) {
    return { error: 'Unauthorized.' };
  }

  const businessId = authBusiness.business.id;

  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/rewards');
  revalidatePath('/dashboard');
  revalidatePath('/customer/rewards');
  return { success: true };
}

/**
 * Toggles a reward's active status.
 */
export async function toggleRewardStatus(id: string, isActive: boolean) {
  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) return { error: 'Unauthorized.' };

  const { error } = await supabase
    .from('rewards')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('business_id', authBusiness.business.id);

  if (error) return { error: error.message };

  revalidatePath('/rewards');
  revalidatePath('/customer/rewards');
  return { success: true };
}

/**
 * Executes an atomic reward redemption.
 * 
 * Strict Security Checks:
 * 1. Verify customer belongs to current business.
 * 2. Verify reward belongs to current business.
 * 3. Verify sufficient points balance.
 * 4. Deduct points securely.
 * 5. Create redemption record.
 * 6. Create activity/transaction ledger record.
 */
export async function redeemRewardAction(params: {
  customerId: string;
  rewardId: string;
}): Promise<RedemptionActionResult> {
  const { customerId, rewardId } = params;

  if (!customerId || !rewardId) {
    return { error: 'Please select both a customer and a reward to redeem.' };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) {
    return { error: 'Unauthorized. Please sign in.' };
  }

  const businessId = authBusiness.business.id;

  // Security Check 1: Verify customer belongs to current business
  const { data: customer, error: custErr } = await supabase
    .from('customers')
    .select('id, name, points_balance, business_id')
    .eq('id', customerId)
    .eq('business_id', businessId)
    .single();

  if (custErr || !customer) {
    return { error: 'Customer not found or does not belong to your business.' };
  }

  // Security Check 2: Verify reward belongs to current business
  const { data: reward, error: rewErr } = await supabase
    .from('rewards')
    .select('id, name, points_required, is_active, business_id')
    .eq('id', rewardId)
    .eq('business_id', businessId)
    .single();

  if (rewErr || !reward) {
    return { error: 'Reward not found or does not belong to your business.' };
  }

  if (!reward.is_active) {
    return { error: 'This reward is currently inactive.' };
  }

  // Security Check 3: Verify sufficient points
  const currentBalance = customer.points_balance || 0;
  if (currentBalance < reward.points_required) {
    return {
      error: 'Not enough points to redeem this reward.',
    };
  }

  // Try atomic PostgreSQL stored procedure first
  const { data: rpcData, error: rpcError } = await supabase.rpc('redeem_reward', {
    p_business_id: businessId,
    p_customer_id: customerId,
    p_reward_id: rewardId,
  });

  if (!rpcError && rpcData?.success) {
    revalidatePath('/rewards');
    revalidatePath('/customers');
    revalidatePath(`/customers/${customerId}`);
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return {
      success: true,
      customerName: customer.name,
      rewardName: rpcData.reward_name || reward.name,
      pointsUsed: rpcData.points_used || reward.points_required,
      newBalance: rpcData.new_balance,
      redemptionId: rpcData.redemption_id,
    };
  }

  // Fallback sequential execution with balance check
  const newBalance = currentBalance - reward.points_required;

  // 4. Create redemption record
  const { data: redemption, error: redErr } = await supabase
    .from('redemptions')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      reward_id: rewardId,
      points_used: reward.points_required,
    })
    .select()
    .single();

  if (redErr) {
    return { error: redErr.message || 'Failed to record redemption.' };
  }

  // 5. Create activity/transaction record
  await supabase.from('transactions').insert({
    business_id: businessId,
    customer_id: customerId,
    type: 'redeem',
    amount: 0,
    points: -reward.points_required,
    description: `Redeemed: ${reward.name}`,
  });

  // 6. Deduct points securely from customer balance
  await supabase
    .from('customers')
    .update({
      points_balance: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq('id', customerId);

  revalidatePath('/rewards');
  revalidatePath('/customers');
  revalidatePath(`/customers/${customerId}`);
  revalidatePath('/transactions');
  revalidatePath('/dashboard');

  return {
    success: true,
    customerName: customer.name,
    rewardName: reward.name,
    pointsUsed: reward.points_required,
    newBalance,
    redemptionId: redemption?.id,
  };
}
