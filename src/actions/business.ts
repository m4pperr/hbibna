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

/**
 * Updates full business profile, operational preferences, and brand assets.
 */
export async function updateBusinessSettings(
  formData: FormData
): Promise<UpdateBusinessProfileResult> {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || null;
  const email = (formData.get('email') as string)?.trim().toLowerCase() || null;
  const category = (formData.get('category') as string)?.trim() || 'Commerce';
  const address = (formData.get('address') as string)?.trim() || null;
  const city = (formData.get('city') as string)?.trim() || 'Alger';
  const instagram = (formData.get('instagram') as string)?.trim() || null;
  const whatsapp = (formData.get('whatsapp') as string)?.trim() || null;
  const brand_color = (formData.get('brand_color') as string)?.trim() || '#FFE600';
  const opening_hours = (formData.get('opening_hours') as string)?.trim() || null;

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
    DEFAULT_BUSINESS.category = category;
    DEFAULT_BUSINESS.address = address;
    DEFAULT_BUSINESS.city = city;
    DEFAULT_BUSINESS.instagram = instagram;
    DEFAULT_BUSINESS.whatsapp = whatsapp;
    DEFAULT_BUSINESS.brand_color = brand_color;
    DEFAULT_BUSINESS.opening_hours = opening_hours;
    revalidatePath('/settings');
    revalidatePath('/dashboard/settings');
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
        category,
        address,
        city,
        instagram,
        whatsapp,
        brand_color,
        opening_hours,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.error('Error updating business settings:', error);
      return { error: error.message };
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard/settings');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: unknown) {
    console.error('Unexpected error in updateBusinessSettings:', err);
    return { error: 'Une erreur inattendue est survenue.' };
  }
}

/**
 * Updates billing and legal invoicing details (NIF, NIS, RC, Address).
 */
export async function updateBillingDetails(
  formData: FormData
): Promise<UpdateBusinessProfileResult> {
  const billing_name = (formData.get('billing_name') as string)?.trim() || null;
  const billing_address = (formData.get('billing_address') as string)?.trim() || null;
  const billing_email = (formData.get('billing_email') as string)?.trim().toLowerCase() || null;
  const tax_id_nif = (formData.get('tax_id_nif') as string)?.trim() || null;
  const nis = (formData.get('nis') as string)?.trim() || null;
  const rc = (formData.get('rc') as string)?.trim() || null;

  if (billing_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing_email)) {
    return { error: 'Veuillez saisir une adresse e-mail de facturation valide.' };
  }

  if (!isSupabaseConfigured()) {
    const { DEFAULT_BUSINESS } = await import('@/lib/data-service');
    DEFAULT_BUSINESS.billing_name = billing_name;
    DEFAULT_BUSINESS.billing_address = billing_address;
    DEFAULT_BUSINESS.billing_email = billing_email;
    DEFAULT_BUSINESS.tax_id_nif = tax_id_nif;
    DEFAULT_BUSINESS.nis = nis;
    DEFAULT_BUSINESS.rc = rc;
    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
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
        billing_name,
        billing_address,
        billing_email,
        tax_id_nif,
        nis,
        rc,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.error('Error updating billing details:', error);
      return { error: error.message };
    }

    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
    return { success: true };
  } catch (err: unknown) {
    console.error('Unexpected error in updateBillingDetails:', err);
    return { error: 'Une erreur inattendue est survenue.' };
  }
}

/**
 * Updates primary payment method label/type.
 */
export async function updatePaymentMethodAction(
  formData: FormData
): Promise<UpdateBusinessProfileResult> {
  const payment_method = (formData.get('payment_method') as string)?.trim();

  if (!payment_method) {
    return { error: 'Veuillez sélectionner un moyen de paiement valide.' };
  }

  if (!isSupabaseConfigured()) {
    const { DEFAULT_BUSINESS } = await import('@/lib/data-service');
    DEFAULT_BUSINESS.payment_method = payment_method;
    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
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
        payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId);

    if (error) {
      console.error('Error updating payment method:', error);
      return { error: error.message };
    }

    revalidatePath('/billing');
    revalidatePath('/dashboard/billing');
    return { success: true };
  } catch (err: unknown) {
    console.error('Unexpected error in updatePaymentMethodAction:', err);
    return { error: 'Une erreur inattendue est survenue.' };
  }
}
