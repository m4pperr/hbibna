'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { revalidatePath } from 'next/cache';

export interface ActivateSubscriptionResult {
  success?: boolean;
  error?: string;
}

/**
 * Activates a business subscription after choosing monthly or annual plan and paying.
 */
export async function activateBusinessSubscription(
  formData: FormData
): Promise<ActivateSubscriptionResult> {
  const plan = (formData.get('plan') as string) || 'monthly';
  const isAnnual = plan === 'annual' || plan === 'yearly';
  const planPriceDa = isAnnual ? 98000 : 9800;
  const planName = isAnnual ? 'Hbibna Business Annuel' : 'Hbibna Business Mensuel';

  if (!isSupabaseConfigured()) {
    // Demo / mock mode fallback
    const { DEFAULT_BUSINESS } = await import('@/lib/data-service');
    DEFAULT_BUSINESS.subscription_status = 'active';
    DEFAULT_BUSINESS.plan_name = planName;
    DEFAULT_BUSINESS.plan_price_da = planPriceDa;
    revalidatePath('/dashboard');
    return { success: true };
  }

  try {
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business?.id;

    if (!businessId) {
      return { error: 'Session non trouvée. Veuillez vous reconnecter.' };
    }

    const adminClient = createAdminClient();
    const { error: updateErr } = await adminClient
      .from('businesses')
      .update({
        subscription_status: 'active',
        plan_name: planName,
        plan_price_da: planPriceDa,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (updateErr) {
      console.error('Error activating subscription in DB:', updateErr);
      return { error: updateErr.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
    return { success: true };
  } catch (err: unknown) {
    console.error('Error in activateBusinessSubscription:', err);
    return { error: 'Une erreur est survenue lors de l’activation. Veuillez réessayer.' };
  }
}

export type SubscriptionPlanId = 'starter' | 'business' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

const PLAN_CATALOG: Record<SubscriptionPlanId, { name: string; monthlyPrice: number; annualPrice: number }> = {
  starter: {
    name: 'Hbibna Starter',
    monthlyPrice: 4900,
    annualPrice: 49000,
  },
  business: {
    name: 'Hbibna Business Pro',
    monthlyPrice: 9800,
    annualPrice: 98000,
  },
  enterprise: {
    name: 'Hbibna Élite Enterprise',
    monthlyPrice: 18000,
    annualPrice: 180000,
  },
};

/**
 * Changes or upgrades/downgrades business subscription tier and billing cycle.
 */
export async function changeSubscriptionPlan(
  formData: FormData
): Promise<ActivateSubscriptionResult> {
  const planId = (formData.get('planId') as SubscriptionPlanId) || 'business';
  const cycle = (formData.get('cycle') as BillingCycle) || 'monthly';

  const planInfo = PLAN_CATALOG[planId] || PLAN_CATALOG.business;
  const planPriceDa = cycle === 'annual' ? planInfo.annualPrice : planInfo.monthlyPrice;
  const planName = `${planInfo.name} (${cycle === 'annual' ? 'Annuel' : 'Mensuel'})`;

  if (!isSupabaseConfigured()) {
    const { DEFAULT_BUSINESS } = await import('@/lib/data-service');
    DEFAULT_BUSINESS.subscription_status = 'active';
    DEFAULT_BUSINESS.plan_name = planName;
    DEFAULT_BUSINESS.plan_price_da = planPriceDa;
    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
    revalidatePath('/dashboard');
    return { success: true };
  }

  try {
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business?.id;

    if (!businessId) {
      return { error: 'Session non trouvée. Veuillez vous reconnecter.' };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('businesses')
      .update({
        subscription_status: 'active',
        plan_name: planName,
        plan_price_da: planPriceDa,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.error('Error changing subscription plan:', error);
      return { error: error.message };
    }

    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    console.error('Unexpected error in changeSubscriptionPlan:', err);
    return { error: 'Une erreur inattendue est survenue.' };
  }
}

/**
 * Cancels or pauses the current business subscription.
 */
export async function cancelOrPauseSubscription(
  formData: FormData
): Promise<ActivateSubscriptionResult> {
  const actionType = (formData.get('actionType') as 'cancelled' | 'paused') || 'cancelled';

  if (!isSupabaseConfigured()) {
    const { DEFAULT_BUSINESS } = await import('@/lib/data-service');
    DEFAULT_BUSINESS.subscription_status = actionType;
    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
    revalidatePath('/dashboard');
    return { success: true };
  }

  try {
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business?.id;

    if (!businessId) {
      return { error: 'Session non trouvée. Veuillez vous reconnecter.' };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('businesses')
      .update({
        subscription_status: actionType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.error('Error canceling/pausing subscription:', error);
      return { error: error.message };
    }

    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    console.error('Unexpected error in cancelOrPauseSubscription:', err);
    return { error: 'Une erreur inattendue est survenue.' };
  }
}

