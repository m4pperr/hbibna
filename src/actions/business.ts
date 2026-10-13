'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export interface UpdateBusinessProfileResult {
  success?: boolean;
  error?: string;
}

/**
 * Updates the business profile details (name, phone, email, currency)
 * strictly scoped to the authenticated tenant.
 */
export async function updateBusinessProfile(
  formData: FormData
): Promise<UpdateBusinessProfileResult> {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || null;
  const email = (formData.get('email') as string)?.trim().toLowerCase() || null;
  const currency = (formData.get('currency') as string)?.trim() || 'DA';

  if (!name || name.length < 2) {
    return { error: 'Le nom du commerce est obligatoire (au moins 2 caractères).' };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Veuillez saisir une adresse e-mail valide.' };
  }

  if (!isSupabaseConfigured()) {
    const { DEFAULT_BUSINESS } = await import('@/lib/data-service');
    DEFAULT_BUSINESS.name = name;
    if (phone) DEFAULT_BUSINESS.phone = phone;
    if (email) DEFAULT_BUSINESS.email = email;
    DEFAULT_BUSINESS.currency = currency;
    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: true };
  }

  try {
    const authData = await getAuthenticatedBusiness();
    const businessId = authData?.business?.id;

    if (!businessId) {
      return { error: 'Session non trouvée. Veuillez vous reconnecter.' };
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('businesses')
      .update({
        name,
        phone,
        email,
        currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.error('Error updating business profile:', error);
      return { error: error.message };
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    revalidatePath('/customers');
    return { success: true };
  } catch (err: unknown) {
    console.error('Unexpected error in updateBusinessProfile:', err);
    return { error: 'Une erreur inattendue est survenue.' };
  }
}
