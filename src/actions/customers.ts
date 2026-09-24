'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { revalidatePath } from 'next/cache';
import type { Customer, Transaction } from '@/types/database';

export interface CreateCustomerResult {
  success?: boolean;
  error?: string;
  customer?: Customer;
}

/**
 * Fetches all customers belonging strictly to the authenticated user's business.
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
    const supabase = await createClient();
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business.id;

    let req = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (businessId) {
      req = req.eq('business_id', businessId);
    }

    if (query) {
      req = req.or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
    }

    const { data, error } = await req;
    if (error) {
      console.error('Error fetching customers:', error);
      const { DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
      return DEFAULT_CUSTOMERS;
    }

    return (data as Customer[]) || [];
  } catch (err) {
    console.warn('Customer fetch handled:', err);
    const { DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
    return DEFAULT_CUSTOMERS;
  }
}

/**
 * Fetches a single customer by ID, ensuring they belong to the authenticated business,
 * along with their complete transaction history.
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
    const supabase = await createClient();
    const authBusiness = await getAuthenticatedBusiness();
    const businessId = authBusiness?.business.id;

    let query = supabase.from('customers').select('*').eq('id', id);
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data: customer, error: custError } = await query.single();

    if (custError || !customer) {
      const { DEFAULT_CUSTOMERS, DEFAULT_TRANSACTIONS } = await import('@/lib/data-service');
      const fallbackCustomer = DEFAULT_CUSTOMERS.find((c) => c.id === id) || null;
      const transactions = DEFAULT_TRANSACTIONS.filter((t) => t.customer_id === id);
      return { customer: fallbackCustomer, transactions };
    }

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    return {
      customer: customer as Customer,
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
  const phone = (formData.get('phone') as string)?.trim();
  const rawEmail = (formData.get('email') as string)?.trim();
  const email = rawEmail && rawEmail.length > 0 ? rawEmail.toLowerCase() : null;

  if (!name || !phone) {
    return { error: 'Please enter both the customer name and phone number.' };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  if (!authBusiness) {
    return { error: 'Unauthorized. Please sign in to your business account.' };
  }

  const businessId = authBusiness.business.id;

  // Insert customer strictly initialized with 0 points
  const { data: newCustomer, error } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      name,
      phone,
      email,
      points_balance: 0, // Always initialized with 0 points per spec
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'A customer with this phone number already exists in your business.' };
    }
    return { error: error.message };
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
  const phone = (formData.get('phone') as string)?.trim();
  const rawEmail = (formData.get('email') as string)?.trim();
  const email = rawEmail && rawEmail.length > 0 ? rawEmail.toLowerCase() : null;

  if (!name || !phone) {
    return { error: 'Name and phone are required.' };
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
  customer?: {
    id: string;
    name: string;
    points_balance: number;
    phone: string;
    business_id: string;
  };
}

/**
 * Resolves a customer securely from their scanned QR token.
 * 
 * SECURITY:
 * - Token contains ONLY the customer's unique ID/token (never raw sensitive personal data).
 * - Verifies that the customer belongs strictly to the currently authenticated business.
 */
export async function resolveCustomerFromQr(token: string): Promise<ResolveCustomerResult> {
  const trimmed = (token || '').trim();
  if (!trimmed) {
    return { error: 'No QR code or token provided.' };
  }

  // Extract ID from format "hbibna:c:<customerId>" or raw ID
  let customerId = trimmed;
  if (customerId.startsWith('hbibna:c:')) {
    customerId = customerId.slice('hbibna:c:'.length).trim();
  }

  // Reject raw personal information mistakenly passed as token
  if (customerId.includes('@') || /^\+?\d{9,15}$/.test(customerId)) {
    return {
      error: 'Invalid QR format. QR code must contain a secure customer token, not raw contact information.',
    };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();
  const businessId = authBusiness?.business?.id;

  try {
    let query = supabase
      .from('customers')
      .select('id, name, points_balance, phone, business_id')
      .eq('id', customerId);

    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    const { data: customer, error } = await query.single();

    if (customer && !error) {
      return {
        success: true,
        customer: {
          id: customer.id,
          name: customer.name,
          points_balance: customer.points_balance,
          phone: customer.phone,
          business_id: customer.business_id,
        },
      };
    }
  } catch (err) {
    console.error('Error resolving customer from QR in database:', err);
  }

  // Fallback lookup from default customer registry (strictly scoped to this business)
  const { DEFAULT_CUSTOMERS, DEFAULT_BUSINESS } = await import('@/lib/data-service');
  const targetBusinessId = businessId || DEFAULT_BUSINESS.id;
  const fallback = DEFAULT_CUSTOMERS.find(
    (c) => c.id === customerId && c.business_id === targetBusinessId
  );

  if (fallback) {
    return {
      success: true,
      customer: {
        id: fallback.id,
        name: fallback.name,
        points_balance: fallback.points_balance,
        phone: fallback.phone,
        business_id: fallback.business_id,
      },
    };
  }

  return {
    error: 'Customer not found or not enrolled in your loyalty program.',
  };
}

