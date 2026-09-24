'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import type { Business, UserProfile } from '@/types/database';

export interface AuthActionResult {
  success?: boolean;
  error?: string;
  requiresEmailVerification?: boolean;
  email?: string;
}

/**
 * Signs up a new business owner and establishes isolated multi-tenant entities.
 * Never trusts business_id from the frontend.
 */
export async function signUpBusiness(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const businessName = (formData.get('businessName') as string)?.trim();
  const ownerName = (formData.get('ownerName') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || null;

  if (!email || !password || !businessName || !ownerName) {
    return { error: 'Please provide all required fields (Business name, Owner name, Email, Password).' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      data: {
        name: ownerName,
        business_name: businessName,
      },
    },
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Unable to create user account. Please try again.' };
  }

  const userId = authData.user.id;

  // 2. Provision isolated business and tenant data securely on the server
  const adminClient = createAdminClient();

  try {
    // Attempt atomic stored procedure first if available in database
    const { data: rpcData, error: rpcError } = await adminClient.rpc('handle_business_signup', {
      p_user_id: userId,
      p_business_name: businessName,
      p_owner_name: ownerName,
      p_email: email,
      p_phone: phone,
    });

    if (rpcError || !rpcData?.success) {
      // Fallback direct sequential provisioning
      // a. Create Business record
      const { data: business, error: bErr } = await adminClient
        .from('businesses')
        .insert({
          name: businessName,
          email,
          phone,
          subscription_status: 'active',
          plan_name: 'Hbibna Business',
          plan_price_da: 9800,
          currency: 'DA',
        })
        .select()
        .single();

      if (bErr || !business) {
        console.error('Error inserting business:', bErr);
        return { error: bErr?.message || 'Failed to initialize business entity.' };
      }

      // b. Create user/profile record linked to business
      const { error: uErr } = await adminClient.from('users').insert({
        id: userId,
        business_id: business.id,
        name: ownerName,
        email,
        role: 'owner',
      });

      if (uErr) {
        console.error('Error linking user profile:', uErr);
        return { error: uErr.message };
      }

      // c. Create initial loyalty_program record
      await adminClient.from('loyalty_programs').insert({
        business_id: business.id,
        name: `${businessName} Loyalty Club`,
        rule_type: 'per_currency',
        points_per_currency: 1,
        currency_unit: 100,
        points_per_purchase: 10,
      });

      // d. Create starter rewards
      await adminClient.from('rewards').insert([
        {
          business_id: business.id,
          name: 'Welcome Drink / Coffee',
          description: 'Complimentary beverage of choice from the counter.',
          points_required: 50,
          is_active: true,
        },
        {
          business_id: business.id,
          name: '500 DA Counter Discount',
          description: '500 DA cash discount on orders over 2,000 DA.',
          points_required: 100,
          is_active: true,
        },
      ]);
    }
  } catch (err: unknown) {
    console.error('Error during business onboarding pipeline:', err);
  }

  // If Supabase requires email verification and session is not immediately active:
  if (!authData.session) {
    return {
      success: true,
      requiresEmailVerification: true,
      email,
    };
  }

  redirect('/dashboard');
}

/**
 * Authenticates a business user with email and password.
 */
export async function signInBusiness(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter your email and password.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Incorrect email or password. Please verify and try again.' };
    }
    return { error: error.message };
  }

  redirect('/dashboard');
}

/**
 * Signs out the current authenticated user and clears session cookies.
 */
export async function signOutBusiness() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export const signOutAction = signOutBusiness;

/**
 * Requests a password reset link sent to the user's email.
 */
export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email) {
    return { error: 'Please enter your registered email address.' };
  }

  const supabase = await createClient();
  const headerList = await headers();
  const origin = headerList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    email,
  };
}

/**
 * Updates password for an authenticated session (from reset link).
 */
export async function updatePassword(formData: FormData): Promise<AuthActionResult> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

/**
 * Resolves current user and their business association strictly on the server.
 * Guarantees zero trust for any client-provided business_id.
 */
export async function getAuthenticatedBusiness(): Promise<{
  user: UserProfile;
  business: Business;
} | null> {
  const { isSupabaseConfigured } = await import('@/lib/supabase/config');
  if (!isSupabaseConfigured()) {
    const { DEFAULT_BUSINESS } = await import('@/lib/data-service');
    return {
      user: {
        id: 'user-default-1',
        business_id: DEFAULT_BUSINESS.id,
        name: 'Owner',
        email: 'contact@hbibna-cafe.dz',
        role: 'owner',
        created_at: new Date().toISOString(),
      },
      business: DEFAULT_BUSINESS,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const { data: userProfile, error: profileErr } = await supabase
      .from('users')
      .select('*, businesses(*)')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileErr) {
      console.warn('Profile fetch notice:', profileErr.message);
    }

    if (!userProfile) return null;

    let businessData: Business | null = (userProfile.businesses as Business) || null;
    if (!businessData && userProfile.business_id) {
      const { data: bData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', userProfile.business_id)
        .maybeSingle();
      businessData = bData as Business;
    }

    if (!businessData) return null;

    return {
      user: {
        id: userProfile.id,
        business_id: userProfile.business_id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        created_at: userProfile.created_at,
      },
      business: businessData,
    };
  } catch (err) {
    console.error('Error fetching authenticated business:', err);
    return null;
  }
}
