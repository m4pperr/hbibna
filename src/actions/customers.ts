'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import { verifyDynamicQrToken } from '@/lib/qr-security';
import { normalizePhoneNumber, isValidPhoneNumber } from '@/lib/phone';
import type { Customer, Transaction, Reward } from '@/types/database';

export interface CreateCustomerResult {
  success?: boolean;
  error?: string;
  customer?: Customer;
}

/**
 * Fetches all customers belonging to or enrolled in the authenticated user's business.
 * Supports multi-tenant isolation via customer_businesses memberships.
 * Optional query filters by name or phone number.
 */
export async function getCustomers(query?: string): Promise<Customer[]> {
  const { isSupabaseConfigured } = await import('@/lib/supabase/config');
  if (!isSupabaseConfigured()) {
    const { DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
    if (!query) return DEFAULT_CUSTOMERS;
    const q = query.toLowerCase();
    return DEFAULT_CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
  }

  try {
    const admin = createAdminClient();
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business.id;

    if (!businessId) {
      const { DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
      return DEFAULT_CUSTOMERS;
    }

    // 1. Fetch memberships in customer_businesses for this business
    const { data: memberships } = await admin
      .from('customer_businesses')
      .select('customer_id, points_balance, wallet_serial_number, wallet_share_url, wallet_google_url')
      .eq('business_id', businessId);

    const membershipMap = new Map<string, { points_balance: number; wallet_serial_number?: string | null }>();
    const customerIds: string[] = [];

    if (memberships) {
      for (const m of memberships) {
        membershipMap.set(m.customer_id, m);
        customerIds.push(m.customer_id);
      }
    }

    // 2. Fetch customers either created by this business OR enrolled via customer_businesses
    let req = admin
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (customerIds.length > 0) {
      req = req.or(`business_id.eq.${businessId},id.in.(${customerIds.join(',')})`);
    } else {
      req = req.eq('business_id', businessId);
    }

    if (query) {
      req = req.or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
    }

    const { data: rawCustomers, error } = await req;
    if (error) {
      console.error('Error fetching customers:', error);
      const { DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
      return DEFAULT_CUSTOMERS;
    }

    // 3. Map customer points_balance to this business's isolated points
    const mapped: Customer[] = (rawCustomers || []).map((c: Customer) => {
      const mem = membershipMap.get(c.id);
      return {
        ...c,
        points_balance: mem ? mem.points_balance : (c.business_id === businessId ? c.points_balance : 0),
        wallet_serial_number: mem?.wallet_serial_number || c.wallet_serial_number,
      };
    });

    return mapped;
  } catch (err) {
    console.warn('Customer fetch handled:', err);
    const { DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
    return DEFAULT_CUSTOMERS;
  }
}

/**
 * Fetches a single customer by ID with their business-isolated points balance
 * and merchant transaction history.
 */
export async function getCustomerById(id: string): Promise<{
  customer: Customer | null;
  transactions: Transaction[];
}> {
  const { isSupabaseConfigured } = await import('@/lib/supabase/config');
  if (!isSupabaseConfigured()) {
    const { DEFAULT_CUSTOMERS, DEFAULT_TRANSACTIONS } = await import('@/lib/data-service');
    const customer = DEFAULT_CUSTOMERS.find((c) => c.id === id) || null;
    const transactions = DEFAULT_TRANSACTIONS.filter((t) => t.customer_id === id);
    return { customer, transactions };
  }

  try {
    const admin = createAdminClient();
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business.id;

    const { data: customer, error: custError } = await admin
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (custError || !customer) {
      const { DEFAULT_CUSTOMERS, DEFAULT_TRANSACTIONS } = await import('@/lib/data-service');
      const fallbackCustomer = DEFAULT_CUSTOMERS.find((c) => c.id === id) || null;
      const transactions = DEFAULT_TRANSACTIONS.filter((t) => t.customer_id === id);
      return { customer: fallbackCustomer, transactions };
    }

    // Check membership in customer_businesses for this business
    let isolatedBalance = customer.points_balance;
    if (businessId) {
      const { data: mem } = await admin
        .from('customer_businesses')
        .select('points_balance')
        .eq('customer_id', id)
        .eq('business_id', businessId)
        .maybeSingle();
      if (mem) {
        isolatedBalance = mem.points_balance;
      }
    }

    let txQuery = admin
      .from('transactions')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    if (businessId) {
      txQuery = txQuery.eq('business_id', businessId);
    }

    const { data: transactions } = await txQuery;

    return {
      customer: {
        ...(customer as Customer),
        points_balance: isolatedBalance,
      },
      transactions: (transactions as Transaction[]) || [],
    };
  } catch (err) {
    console.warn('Get customer by id handled:', err);
    const { DEFAULT_CUSTOMERS, DEFAULT_TRANSACTIONS } = await import('@/lib/data-service');
    const fallbackCustomer = DEFAULT_CUSTOMERS.find((c) => c.id === id) || null;
    const transactions = DEFAULT_TRANSACTIONS.filter((t) => t.customer_id === id);
    return { customer: fallbackCustomer, transactions };
  }
}

/**
 * Enrolls a new customer for the business.
 * Fields: Name, Phone, Email (optional).
 * Strictly initializes new customers with 0 points.
 */
export async function createCustomer(formData: FormData): Promise<CreateCustomerResult> {
  const name = (formData.get('name') as string)?.trim();
  const rawPhone = (formData.get('phone') as string)?.trim();
  const phone = rawPhone ? normalizePhoneNumber(rawPhone) : '';
  const rawEmail = (formData.get('email') as string)?.trim();
  const email = rawEmail && rawEmail.length > 0 ? rawEmail.toLowerCase() : null;
  const rawRefCode = (formData.get('referral_code') as string)?.trim();
  const referralCode = rawRefCode ? rawRefCode.toUpperCase() : null;

  if (!name || !phone) {
    return { error: 'Please enter both the customer name and phone number.' };
  }

  if (!isValidPhoneNumber(phone)) {
    return { error: 'Veuillez saisir un numéro de téléphone valide.' };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) {
    return { error: 'Unauthorized. Please sign in to your business account.' };
  }

  const businessId = authBusiness.business.id;

  // Resolve optional referrer
  let referrerId: string | null = null;
  let referrerCustomer: Customer | null = null;
  let welcomePoints = 0;
  let referralBonus = 50;

  if (referralCode) {
    const { data: refMatch } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId)
      .ilike('referral_code', referralCode)
      .maybeSingle();

    if (refMatch && refMatch.phone !== phone) {
      referrerCustomer = refMatch as Customer;
      referrerId = referrerCustomer.id;

      // Check business loyalty settings for referral points
      const { data: lp } = await supabase
        .from('loyalty_programs')
        .select('referral_bonus_points, referee_welcome_points')
        .eq('business_id', businessId)
        .maybeSingle();

      referralBonus = lp?.referral_bonus_points ?? 50;
      welcomePoints = lp?.referee_welcome_points ?? 25;
    }
  }

  const generatedRefCode = 'HB-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Insert customer with optional welcome points
  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      name,
      phone,
      email,
      points_balance: welcomePoints,
      referral_code: generatedRefCode,
      referred_by_customer_id: referrerId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'A customer with this phone number already exists in your business.' };
    }
    return { error: error.message };
  }

  // Create isolated membership in customer_businesses
  await supabase.from('customer_businesses').upsert(
    {
      customer_id: newCustomer.id,
      business_id: businessId,
      points_balance: welcomePoints,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'customer_id,business_id' }
  );

  // If referred, credit referrer and log transactions
  if (referrerCustomer && referrerId) {
    const newRefBalance = (referrerCustomer.points_balance || 0) + referralBonus;
    await supabase
      .from('customers')
      .update({ points_balance: newRefBalance, updated_at: new Date().toISOString() })
      .eq('id', referrerId);

    await supabase
      .from('customer_businesses')
      .update({ points_balance: newRefBalance, updated_at: new Date().toISOString() })
      .eq('customer_id', referrerId)
      .eq('business_id', businessId);

    // Referrer reward transaction
    await supabase.from('transactions').insert({
      business_id: businessId,
      customer_id: referrerId,
      type: 'earn',
      amount: 0,
      points: referralBonus,
      description: `Bonus Parrainage: ami(e) ${name} inscrit(e) (+${referralBonus} pts)`,
    });

    // Welcome bonus transaction
    if (welcomePoints > 0) {
      await supabase.from('transactions').insert({
        business_id: businessId,
        customer_id: newCustomer.id,
        type: 'earn',
        amount: 0,
        points: welcomePoints,
        description: `Bonus de Bienvenue Parrainage (invité(e) par ${referrerCustomer.name})`,
      });
    }

    // Referral log
    await supabase.from('referrals').insert({
      business_id: businessId,
      referrer_id: referrerId,
      referred_id: newCustomer.id,
      points_awarded: referralBonus,
    });
  }

  revalidatePath('/customers');
  revalidatePath('/dashboard');
  return { success: true, customer: newCustomer as Customer };
}

/**
 * Updates customer contact information.
 */
export async function updateCustomer(id: string, formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const rawPhone = (formData.get('phone') as string)?.trim();
  const phone = rawPhone ? normalizePhoneNumber(rawPhone) : '';
  const rawEmail = (formData.get('email') as string)?.trim();
  const email = rawEmail && rawEmail.length > 0 ? rawEmail.toLowerCase() : null;

  if (!name || !phone) {
    return { error: 'Name and phone are required.' };
  }

  if (!isValidPhoneNumber(phone)) {
    return { error: 'Veuillez saisir un numéro de téléphone valide.' };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  let query = supabase
    .from('customers')
    .update({ name, phone, email, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (authBusiness?.business.id) {
    query = query.eq('business_id', authBusiness.business.id);
  }

  const { error } = await query;
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/customers/${id}`);
  revalidatePath('/customers');
  return { success: true };
}

export interface ResolveCustomerResult {
  success?: boolean;
  error?: string;
  autoEnrolled?: boolean;
  welcomePoints?: number;
  businessName?: string;
  isNew?: boolean;
  notFound?: boolean;
  suggestedPhone?: string;
  customer?: {
    id: string;
    name: string;
    points_balance: number;
    phone: string;
    business_id: string;
    email?: string | null;
  };
  transactions?: Transaction[];
  rewards?: Reward[];
  message?: string;
}

/**
 * Resolves a customer securely from their scanned QR pass, NFC token, or Wallet barcode.
 * 
 * AUTOMATIC CROSS-MERCHANT ENROLLMENT LOGIC:
 * - Case A (Already Enrolled with this Merchant):
 *     Fetch and return customer's balance, transaction history, and active rewards for THIS business.
 * - Case B (Existing Global Hbibna User, First Time at this Merchant):
 *     Automatically create a new customer_businesses linkage record.
 *     Initialize starting balance (0 or configured welcome bonus).
 *     Return with autoEnrolled: true and instant notification.
 * - Case C (Unregistered / New Pass):
 *     Return notFound: true, isNew: true with suggested phone so UI can open registration modal.
 */
export async function resolveCustomerFromQr(token: string): Promise<ResolveCustomerResult> {
  const trimmed = (token || '').trim();
  if (!trimmed) {
    return { error: 'Aucun code QR ou identifiant fourni.' };
  }

  // 1. Parse token variants
  let idCandidate: string | null = null;
  let phoneCandidate: string | null = null;

  // Check URL format (e.g. from customer portal or pass links)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      const urlPhone = url.searchParams.get('phone');
      const urlId = url.searchParams.get('id');
      const urlToken = url.searchParams.get('token');
      if (urlToken) {
        if (urlToken.startsWith('hbibna:d:')) {
          const v = verifyDynamicQrToken(urlToken);
          if (v.valid && v.customerId) idCandidate = v.customerId;
        } else if (urlToken.startsWith('hbibna:c:')) {
          idCandidate = urlToken.slice(9).trim();
        } else {
          idCandidate = urlToken.trim();
        }
      } else if (urlId) {
        idCandidate = urlId.trim();
      } else if (urlPhone) {
        phoneCandidate = urlPhone.trim();
      }
    } catch {}
  }

  // Dynamic anti-fraud token (hbibna:d:...)
  if (!idCandidate && !phoneCandidate && trimmed.startsWith('hbibna:d:')) {
    const verification = verifyDynamicQrToken(trimmed);
    if (!verification.valid || !verification.customerId) {
      return {
        error: verification.error || 'QR code dynamique invalide ou expiré.',
      };
    }
    idCandidate = verification.customerId;
  }

  // Static token (hbibna:c:...)
  if (!idCandidate && !phoneCandidate && trimmed.startsWith('hbibna:c:')) {
    idCandidate = trimmed.slice('hbibna:c:'.length).trim();
  }

  // Raw UUID format
  if (!idCandidate && !phoneCandidate) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
    if (isUuid) {
      idCandidate = trimmed;
    }
  }

  // Phone number (e.g. from Apple/Google Wallet barcode or manual pass scan)
  if (!idCandidate && !phoneCandidate) {
    const cleanPhone = trimmed.replace(/[\s\-\.]/g, '');
    if (/^(\+213|213|0)?[567]\d{8}$/.test(cleanPhone) || /^\+?\d{9,15}$/.test(cleanPhone)) {
      phoneCandidate = cleanPhone;
    } else if (trimmed.length >= 10 && !trimmed.includes(':') && !trimmed.includes('@')) {
      idCandidate = trimmed;
    }
  }

  // Normalize phone variations for Algerian numbers
  const phoneVariations: string[] = [];
  if (phoneCandidate) {
    phoneVariations.push(phoneCandidate);
    if (phoneCandidate.startsWith('+213')) {
      phoneVariations.push('0' + phoneCandidate.slice(4));
      phoneVariations.push(phoneCandidate.slice(1));
    } else if (phoneCandidate.startsWith('213')) {
      phoneVariations.push('0' + phoneCandidate.slice(3));
      phoneVariations.push('+' + phoneCandidate);
    } else if (phoneCandidate.startsWith('0')) {
      phoneVariations.push('+213' + phoneCandidate.slice(1));
      phoneVariations.push('213' + phoneCandidate.slice(1));
    }
  }

  const authBusiness = await getAuthenticatedBusiness();
  const { DEFAULT_BUSINESS, DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
  const businessId = authBusiness?.business?.id || DEFAULT_BUSINESS.id;
  const businessName = authBusiness?.business?.name || DEFAULT_BUSINESS.name;

  let globalCustomer: Customer | null = null;
  const admin = createAdminClient();

  // 2. Global registry lookup across all Hbibna customers
  try {
    if (idCandidate) {
      const { data } = await admin
        .from('customers')
        .select('*')
        .eq('id', idCandidate)
        .maybeSingle();
      if (data) globalCustomer = data as Customer;
    }

    if (!globalCustomer && phoneVariations.length > 0) {
      for (const p of phoneVariations) {
        const { data } = await admin
          .from('customers')
          .select('*')
          .eq('phone', p)
          .maybeSingle();
        if (data) {
          globalCustomer = data as Customer;
          break;
        }
      }
    }
  } catch (err) {
    console.warn('DB global customer search warning:', err);
  }

  // Fallback to in-memory customers registry if Supabase is offline / demo
  if (!globalCustomer) {
    const fallback = DEFAULT_CUSTOMERS.find((c) =>
      (idCandidate && c.id === idCandidate) ||
      (phoneVariations.length > 0 &&
        phoneVariations.some((p) => c.phone.replace(/[\s\-\.]/g, '') === p.replace(/[\s\-\.]/g, '')))
    );
    if (fallback) globalCustomer = fallback;
  }

  // CASE C: Customer NOT found in global registry (Unregistered / New Pass)
  if (!globalCustomer) {
    return {
      success: false,
      notFound: true,
      isNew: true,
      suggestedPhone: phoneCandidate || undefined,
      error: 'Pass ou client non enregistré dans le réseau Hbibna.',
    };
  }

  // 3. Customer exists globally! Check enrollment with current business
  let membership: {
    id?: string;
    points_balance: number;
    created_at?: string;
  } | null = null;

  try {
    const { data: mem } = await admin
      .from('customer_businesses')
      .select('id, points_balance, created_at')
      .eq('customer_id', globalCustomer.id)
      .eq('business_id', businessId)
      .maybeSingle();

    if (mem) {
      membership = mem;
    }
  } catch (err) {
    console.warn('DB membership lookup warning:', err);
  }

  // Also check if customer was originally created by this business
  if (!membership && globalCustomer.business_id === businessId) {
    membership = {
      points_balance: globalCustomer.points_balance || 0,
      created_at: globalCustomer.created_at,
    };
    // Sync into customer_businesses for consistency
    try {
      await admin.from('customer_businesses').upsert(
        {
          customer_id: globalCustomer.id,
          business_id: businessId,
          points_balance: globalCustomer.points_balance || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'customer_id,business_id' }
      );
    } catch {}
  }

  // CASE A: Customer is ALREADY ENROLLED with this merchant
  if (membership) {
    let recentTxs: Transaction[] = [];
    let availableRewards: Reward[] = [];

    try {
      const { data: txs } = await admin
        .from('transactions')
        .select('*')
        .eq('customer_id', globalCustomer.id)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(5);
      if (txs) recentTxs = txs as Transaction[];

      const { data: rews } = await admin
        .from('rewards')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('points_required', { ascending: true });
      if (rews) availableRewards = rews as Reward[];
    } catch {}

    return {
      success: true,
      autoEnrolled: false,
      customer: {
        id: globalCustomer.id,
        name: globalCustomer.name,
        points_balance: membership.points_balance,
        phone: globalCustomer.phone,
        business_id: businessId,
        email: globalCustomer.email,
      },
      businessName,
      transactions: recentTxs,
      rewards: availableRewards,
    };
  }

  // CASE B: Existing Global Hbibna User, First Time at this Merchant!
  // Automatically enroll customer into this merchant's business account.
  let welcomePoints = 0;
  try {
    const { data: lp } = await admin
      .from('loyalty_programs')
      .select('referee_welcome_points')
      .eq('business_id', businessId)
      .maybeSingle();
    welcomePoints = lp?.referee_welcome_points ?? 0;
  } catch {}

  // 1. Create customer_businesses linkage record
  try {
    await admin.from('customer_businesses').insert({
      customer_id: globalCustomer.id,
      business_id: businessId,
      points_balance: welcomePoints,
      wallet_serial_number: globalCustomer.wallet_serial_number || null,
      wallet_share_url: globalCustomer.wallet_share_url || null,
      wallet_google_url: globalCustomer.wallet_google_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 2. Welcome bonus transaction if points awarded
    if (welcomePoints > 0) {
      await admin.from('transactions').insert({
        business_id: businessId,
        customer_id: globalCustomer.id,
        type: 'earn',
        amount: 0,
        points: welcomePoints,
        description: `Bonus de Bienvenue - Première visite chez ${businessName} (+${welcomePoints} pts)`,
      });
    }
  } catch (err) {
    console.warn('Auto-enrollment DB insert warning:', err);
  }

  // Fetch available rewards for this business
  let availableRewards: Reward[] = [];
  try {
    const { data: rews } = await admin
      .from('rewards')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('points_required', { ascending: true });
    if (rews) availableRewards = rews as Reward[];
  } catch {}

  revalidatePath('/customers');
  revalidatePath('/dashboard');

  return {
    success: true,
    autoEnrolled: true,
    welcomePoints,
    customer: {
      id: globalCustomer.id,
      name: globalCustomer.name,
      points_balance: welcomePoints,
      phone: globalCustomer.phone,
      business_id: businessId,
      email: globalCustomer.email,
    },
    businessName,
    rewards: availableRewards,
    message: `Client existant affilié automatiquement à ${businessName} !`,
  };
}

/**
 * Updates an authenticated customer's profile details (name, phone, email).
 */
export async function updateCustomerProfile(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  const customerId = formData.get('customerId') as string;
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  if (!name) {
    return { error: 'Le nom est obligatoire.' };
  }
  if (!phone) {
    return { error: 'Le numéro de téléphone est obligatoire.' };
  }

  const cleanPhone = normalizePhoneNumber(phone);
  if (!isValidPhoneNumber(cleanPhone)) {
    return { error: 'Numéro de téléphone invalide.' };
  }

  const { isSupabaseConfigured } = await import('@/lib/supabase/config');
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const admin = createAdminClient();
    const updatePayload: Record<string, unknown> = {
      name,
      phone: cleanPhone,
      email: email || null,
      updated_at: new Date().toISOString(),
    };

    if (customerId) {
      const { error } = await admin
        .from('customers')
        .update(updatePayload)
        .eq('id', customerId);

      if (error) {
        console.error('Error updating customer:', error);
        return { error: error.message };
      }
    }

    revalidatePath('/customer');
    revalidatePath('/customer/account');
    return { success: true };
  } catch (err: unknown) {
    console.error('Error in updateCustomerProfile:', err);
    return { error: 'Une erreur inattendue est survenue.' };
  }
}

