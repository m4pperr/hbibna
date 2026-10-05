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
          subscription_status: 'pending_payment',
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

  redirect('/choose-plan');
}

/**
 * Signs up a new customer/client for their digital loyalty pass.
 * Requires: Full Name, Phone Number, Password.
 * Optional: Email Address.
 */
export async function signUpCustomer(formData: FormData): Promise<AuthActionResult> {
  const name = (formData.get('name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;
  const emailInput = (formData.get('email') as string)?.trim().toLowerCase();
  const email = emailInput || null;

  if (!name || !phone || !password) {
    return { error: 'Please fill in all required fields (Full name, Phone number, Password).' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  // Clean phone: digits and optional leading plus
  const cleanPhone = phone.replace(/[\s-]/g, '');
  if (cleanPhone.length < 8) {
    return { error: 'Please provide a valid phone number (at least 8 digits).' };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  try {
    // Generate auth email: use actual email if provided, otherwise synthetic phone email
    const authEmail = email || `${cleanPhone.replace(/\+/g, '')}@customer.hbibna.local`;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: authEmail,
      password,
      options: {
        data: {
          name,
          phone: cleanPhone,
          role: 'customer',
        },
      },
    });

    const userId = authData?.user?.id;

    // Insert or update customer profile in customers table
    const { data: existingCustomer } = await adminClient
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingCustomer) {
      await adminClient
        .from('customers')
        .update({
          name,
          email: email || existingCustomer.email,
          ...(userId ? { auth_user_id: userId } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCustomer.id);
    } else {
      await adminClient.from('customers').insert({
        name,
        phone: cleanPhone,
        email,
        points_balance: 0,
        ...(userId ? { auth_user_id: userId } : {}),
      });
    }
  } catch (err: unknown) {
    console.warn('Notice during customer signup:', err);
  }

  // Redirect client directly to their personal loyalty portal
  redirect(`/customer?phone=${encodeURIComponent(cleanPhone)}`);
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
 * Authenticates a customer/client with phone number and password.
 */
export async function signInCustomer(formData: FormData): Promise<AuthActionResult> {
  const phone = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;

  if (!phone || !password) {
    return { error: 'Please enter your phone number and password.' };
  }

  const cleanPhone = phone.replace(/[\s-]/g, '');

  if (cleanPhone.length < 8) {
    return { error: 'Please enter a valid phone number.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();

  try {
    // 1. Check if customer exists in database
    const { data: customer } = await adminClient
      .from('customers')
      .select('email')
      .eq('phone', cleanPhone)
      .maybeSingle();

    // 2. Identify the corresponding Supabase Auth email (registered or synthetic)
    const authEmail = customer?.email || `${cleanPhone.replace(/\+/g, '')}@customer.hbibna.local`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        return { error: 'Incorrect phone number or password. Please verify and try again.' };
      }
      console.warn('Notice during customer signIn in Supabase:', authError.message);
    }
  } catch (err: unknown) {
    console.warn('Notice during customer signIn:', err);
  }

  redirect(`/customer?phone=${encodeURIComponent(cleanPhone)}`);
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
 * Resets a customer/client's password using their phone number.
 */
export async function resetCustomerPassword(formData: FormData): Promise<AuthActionResult> {
  const phone = (formData.get('phone') as string)?.trim();
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!phone || !password || !confirmPassword) {
    return { error: 'Veuillez remplir tous les champs obligatoires.' };
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit comporter au moins 6 caractères.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas.' };
  }

  const cleanPhone = phone.replace(/[\s-]/g, '');
  if (cleanPhone.length < 8) {
    return { error: 'Veuillez fournir un numéro de téléphone valide.' };
  }

  const { isSupabaseConfigured } = await import('@/lib/supabase/config');
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  const adminClient = createAdminClient();

  try {
    // 1. Look up customer in database
    const { data: customer, error: fetchErr } = await adminClient
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (fetchErr) {
      console.warn('Customer lookup notice:', fetchErr.message);
    }

    if (!customer) {
      return { error: 'Aucun compte client trouvé avec ce numéro de téléphone.' };
    }

    const authEmail = customer.email || `${cleanPhone.replace(/\+/g, '')}@customer.hbibna.local`;

    if (customer.auth_user_id) {
      const { error: updateErr } = await adminClient.auth.admin.updateUserById(
        customer.auth_user_id,
        { password }
      );
      if (updateErr) {
        console.warn('Auth admin update notice:', updateErr.message);
      }
    } else {
      // User registered before password auth was introduced or via cashier scan
      try {
        const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
          email: authEmail,
          password,
          email_confirm: true,
          user_metadata: {
            name: customer.name,
            phone: cleanPhone,
            role: 'customer',
          },
        });

        if (newUser?.user?.id) {
          await adminClient
            .from('customers')
            .update({ auth_user_id: newUser.user.id })
            .eq('id', customer.id);
        } else if (createErr) {
          console.warn('Admin createUser notice:', createErr.message);
        }
      } catch (err) {
        console.warn('Admin user creation fallback notice:', err);
      }
    }

    return { success: true };
  } catch (err: unknown) {
    console.error('Error during customer password reset:', err);
    return { error: 'Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.' };
  }
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
