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
    return { success: true };
  } catch (err: unknown) {
    console.error('Error in activateBusinessSubscription:', err);
    return { error: 'Une erreur est survenue lors de l’activation. Veuillez réessayer.' };
  }
}
