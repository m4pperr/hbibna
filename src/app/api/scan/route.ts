import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { verifyDynamicQrToken } from '@/lib/qr-security';
import { normalizePhoneNumber } from '@/lib/phone';
import { getAuthenticatedBusiness } from '@/actions/auth';

export const dynamic = 'force-dynamic';

interface ScanLookupRequest {
  qrCode?: string;
  token?: string;
  pass_id?: string;
  global_customer_id?: string;
  business_id?: string;
}

/**
 * Handle QR / Barcode Scan Lookup (/api/scan)
 * 2-step verification:
 *   Step A: Look up scanned_user_id in global users table FIRST (or customers/auth.users).
 *   Step B: Check relationship in merchant_customers (customer_businesses) for business_id.
 *           Auto-enroll if first visit.
 */
async function processScanLookup(params: ScanLookupRequest) {
  const rawInput = (params.qrCode || params.token || params.pass_id || params.global_customer_id || '').trim();

  // Step 1: Diagnostic log
  console.log("SCANNED PAYLOAD RECEIVED:", params.qrCode || rawInput);

  if (!rawInput) {
    return NextResponse.json(
      { success: false, error: 'Token ou code QR manquant.' },
      { status: 400 }
    );
  }

  // Determine current business context
  const authBusiness = await getAuthenticatedBusiness();
  const businessId = params.business_id || authBusiness?.business?.id || 'biz-default-1';
  const businessName = authBusiness?.business?.name || 'Commerce Partenaire';

  const admin = createAdminClient();

  // 1. Resolve raw identifier candidates
  let idCandidate: string | null = null;
  let phoneCandidate: string | null = null;

  // Case 1: Standardized HB-USER-[user_id] format (case-insensitive)
  if (rawInput.toUpperCase().startsWith('HB-USER-')) {
    idCandidate = rawInput.slice(8).trim();
  }
  // Case 2: URL format
  else if (rawInput.startsWith('http://') || rawInput.startsWith('https://')) {
    try {
      const url = new URL(rawInput);
      const urlToken = url.searchParams.get('qrCode') || url.searchParams.get('token');
      const urlId = url.searchParams.get('id') || url.searchParams.get('c');
      const urlPhone = url.searchParams.get('phone');

      if (urlToken) {
        if (urlToken.toUpperCase().startsWith('HB-USER-')) {
          idCandidate = urlToken.slice(8).trim();
        } else if (urlToken.startsWith('hbibna:c:')) {
          idCandidate = urlToken.slice(9).trim();
        } else if (urlToken.startsWith('hbibna:d:')) {
          const v = verifyDynamicQrToken(urlToken);
          idCandidate = v.customerId || urlToken.slice(9).split(':')[0].trim();
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
  // Case 3: Dynamic anti-fraud token (hbibna:d:...)
  else if (rawInput.startsWith('hbibna:d:')) {
    const verification = verifyDynamicQrToken(rawInput);
    if (verification.valid && verification.customerId) {
      idCandidate = verification.customerId;
    } else {
      const parts = rawInput.slice('hbibna:d:'.length).split(':');
      if (parts[0]) idCandidate = parts[0].trim();
    }
  }
  // Case 4: Static token (hbibna:c:...)
  else if (rawInput.startsWith('hbibna:c:')) {
    idCandidate = rawInput.slice('hbibna:c:'.length).trim();
  }
  // Case 5: Raw UUID format
  else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawInput)) {
    idCandidate = rawInput.trim();
  }
  // Case 6: Strip HB- if followed by a raw UUID
  else if (
    rawInput.toUpperCase().startsWith('HB-') &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawInput.slice(3).trim())
  ) {
    idCandidate = rawInput.slice(3).trim();
  }
  // Case 7: Member ID format (e.g. HB-XXXX-DZ or HB-XXXX)
  else if (rawInput.toUpperCase().startsWith('HB-')) {
    idCandidate = rawInput.trim();
  }
  // Case 8: Phone number
  else {
    const cleanPhone = rawInput.replace(/[\s\-\.]/g, '');
    if (/^(\+213|213|0)?[567]\d{8}$/.test(cleanPhone) || /^\+?\d{9,15}$/.test(cleanPhone)) {
      phoneCandidate = cleanPhone;
    } else if (rawInput.length >= 8 && !rawInput.includes(':') && !rawInput.includes('@')) {
      idCandidate = rawInput.trim();
    }
  }

  // Algerian phone variations
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

  // =========================================================================
  // STEP A: Look up global user in users / profiles table FIRST
  // =========================================================================
  let globalUser: {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    referral_code?: string | null;
    wallet_serial_number?: string | null;
    business_id?: string;
  } | null = null;

  try {
    const isUuid = idCandidate ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idCandidate) : false;

    // 1a. Query users table FIRST (Step A)
    if (idCandidate) {
      let userQuery = admin.from('users').select('*');
      if (isUuid) {
        userQuery = userQuery.or(`id.eq.${idCandidate},pass_id.eq.${idCandidate}`);
      } else {
        userQuery = userQuery.eq('pass_id', idCandidate);
      }
      const { data: userProfile } = await userQuery.maybeSingle();

      if (userProfile) {
        const genCode = 'HB-' + userProfile.id.replace(/-/g, '').slice(0, 6).toUpperCase();
        // Check if customer row exists
        const { data: existingC } = await admin
          .from('customers')
          .select('*')
          .or(`id.eq.${userProfile.id},auth_user_id.eq.${userProfile.id}`)
          .maybeSingle();

        if (existingC) {
          globalUser = {
            id: existingC.id,
            name: existingC.name,
            phone: existingC.phone,
            email: existingC.email,
            referral_code: existingC.referral_code,
            wallet_serial_number: existingC.wallet_serial_number,
            business_id: existingC.business_id,
          };
        } else {
          // Auto-provision customer row
          const { data: synced } = await admin
            .from('customers')
            .upsert({
              id: userProfile.id,
              auth_user_id: userProfile.id,
              name: userProfile.name || 'Client Hbibna',
              email: userProfile.email || null,
              phone: userProfile.phone ? normalizePhoneNumber(userProfile.phone) : '+213500000000',
              points_balance: 0,
              referral_code: genCode,
            }, { onConflict: 'id' })
            .select()
            .maybeSingle();

          globalUser = {
            id: userProfile.id,
            name: userProfile.name || 'Client Hbibna',
            phone: userProfile.phone || '+213500000000',
            email: userProfile.email || null,
            referral_code: genCode,
            wallet_serial_number: synced?.wallet_serial_number || null,
          };
        }
      }
    }

    // 1b. Query customers table
    if (!globalUser && idCandidate) {
      if (isUuid) {
        const { data: customerRow } = await admin
          .from('customers')
          .select('*')
          .or(`id.eq.${idCandidate},auth_user_id.eq.${idCandidate},referral_code.eq.${idCandidate},wallet_serial_number.eq.${idCandidate}`)
          .maybeSingle();

        if (customerRow) {
          globalUser = {
            id: customerRow.id,
            name: customerRow.name,
            phone: customerRow.phone,
            email: customerRow.email,
            referral_code: customerRow.referral_code,
            wallet_serial_number: customerRow.wallet_serial_number,
            business_id: customerRow.business_id,
          };
        }
      } else {
        const { data: customerRow } = await admin
          .from('customers')
          .select('*')
          .or(`referral_code.eq.${idCandidate},referral_code.ilike.%${idCandidate}%,wallet_serial_number.eq.${idCandidate}`)
          .maybeSingle();

        if (customerRow) {
          globalUser = {
            id: customerRow.id,
            name: customerRow.name,
            phone: customerRow.phone,
            email: customerRow.email,
            referral_code: customerRow.referral_code,
            wallet_serial_number: customerRow.wallet_serial_number,
            business_id: customerRow.business_id,
          };
        }
      }

      // Check stripped HB- code
      if (!globalUser && idCandidate.toUpperCase().endsWith('-DZ')) {
        const stripped = idCandidate.slice(0, -3);
        const { data: codeData } = await admin
          .from('customers')
          .select('*')
          .or(`referral_code.eq.${stripped},referral_code.ilike.%${stripped}%`)
          .maybeSingle();
        if (codeData) {
          globalUser = {
            id: codeData.id,
            name: codeData.name,
            phone: codeData.phone,
            email: codeData.email,
            referral_code: codeData.referral_code,
            wallet_serial_number: codeData.wallet_serial_number,
            business_id: codeData.business_id,
          };
        }
      }
    }

    // 1c. Query auth.users table directly
    if (!globalUser && idCandidate) {
      try {
        const { data: authData } = await admin.auth.admin.getUserById(idCandidate);
        if (authData?.user) {
          const au = authData.user;
          const auName = au.user_metadata?.name || au.email?.split('@')[0] || 'Client Hbibna';
          const auPhone = au.user_metadata?.phone ? normalizePhoneNumber(au.user_metadata.phone) : '+213500000000';
          const genCode = 'HB-' + au.id.replace(/-/g, '').slice(0, 6).toUpperCase();

          const { data: provCustomer } = await admin
            .from('customers')
            .upsert({
              id: au.id,
              auth_user_id: au.id,
              name: auName,
              email: au.email || null,
              phone: auPhone,
              points_balance: 0,
              referral_code: genCode,
            }, { onConflict: 'id' })
            .select()
            .maybeSingle();

          globalUser = {
            id: provCustomer?.id || au.id,
            name: auName,
            phone: auPhone,
            email: au.email || null,
            referral_code: genCode,
          };
        }
      } catch {}
    }

    // 1d. Query by phone variations
    if (!globalUser && phoneVariations.length > 0) {
      for (const p of phoneVariations) {
        const { data: pCust } = await admin
          .from('customers')
          .select('*')
          .eq('phone', p)
          .maybeSingle();
        if (pCust) {
          globalUser = {
            id: pCust.id,
            name: pCust.name,
            phone: pCust.phone,
            email: pCust.email,
            referral_code: pCust.referral_code,
            wallet_serial_number: pCust.wallet_serial_number,
            business_id: pCust.business_id,
          };
          break;
        }
      }
    }
  } catch (err) {
    console.warn('API /api/scan global user lookup warning:', err);
  }

  // Fallback to mock data in demo/local environment
  if (!globalUser) {
    const { DEFAULT_CUSTOMERS } = await import('@/lib/data-service');
    const fallback = DEFAULT_CUSTOMERS.find((c) =>
      (idCandidate && (c.id === idCandidate || (c as any).passId === idCandidate || c.referral_code === idCandidate)) ||
      (phoneVariations.length > 0 &&
        phoneVariations.some((p) => c.phone.replace(/[\s\-\.]/g, '') === p.replace(/[\s\-\.]/g, '')))
    );
    if (fallback) {
      globalUser = {
        id: fallback.id,
        name: fallback.name,
        phone: fallback.phone,
        email: fallback.email,
        referral_code: fallback.referral_code,
        wallet_serial_number: fallback.wallet_serial_number,
        business_id: fallback.business_id,
      };
    }
  }

  // Step 1 Diagnostic Log
  console.log("GLOBAL USER QUERY RESULT:", globalUser);

  // ONLY return "Client non inscrit" if NOT found anywhere in global users
  if (!globalUser) {
    return NextResponse.json(
      {
        success: false,
        not_found: true,
        is_new: true,
        suggested_phone: phoneCandidate || undefined,
        error: "Client non inscrit à Hbibna — Ce pass n'est pas encore associé à un compte client Hbibna.",
      },
      { status: 404 }
    );
  }

  // =========================================================================
  // STEP B: Check Relationship in merchant_customers (customer_businesses)
  // =========================================================================
  let membership: { points_balance: number; created_at?: string } | null = null;

  try {
    const { data: memData } = await admin
      .from('customer_businesses')
      .select('points_balance, created_at')
      .eq('customer_id', globalUser.id)
      .eq('business_id', businessId)
      .maybeSingle();

    if (memData) {
      membership = memData;
    }
  } catch (err) {
    console.warn('API /api/scan membership lookup warning:', err);
  }

  // Also check if customer was created by this business directly
  if (!membership && globalUser.business_id === businessId) {
    membership = { points_balance: 0 };
  }

  // CASE 2A: Already linked with this merchant
  if (membership) {
    let recentTransactions: any[] = [];
    let activeRewards: any[] = [];

    try {
      const [{ data: txs }, { data: rews }] = await Promise.all([
        admin
          .from('transactions')
          .select('*')
          .eq('customer_id', globalUser.id)
          .eq('business_id', businessId)
          .order('created_at', { ascending: false })
          .limit(5),
        admin
          .from('rewards')
          .select('*')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('points_required', { ascending: true }),
      ]);

      if (txs) recentTransactions = txs;
      if (rews) activeRewards = rews;
    } catch {}

    return NextResponse.json({
      success: true,
      auto_enrolled: false,
      customer: {
        id: globalUser.id,
        name: globalUser.name,
        phone: globalUser.phone,
        email: globalUser.email,
        points_balance: membership.points_balance,
        business_id: businessId,
      },
      business_name: businessName,
      rewards: activeRewards,
      transactions: recentTransactions,
    });
  }

  // CASE 2B: NOT linked yet (First visit) -> Automatically create linkage!
  let welcomeBonusPoints = 0;
  try {
    const { data: lp } = await admin
      .from('loyalty_programs')
      .select('referee_welcome_points')
      .eq('business_id', businessId)
      .maybeSingle();
    welcomeBonusPoints = lp?.referee_welcome_points ?? 0;
  } catch {}

  try {
    await admin.from('customer_businesses').insert({
      customer_id: globalUser.id,
      business_id: businessId,
      points_balance: welcomeBonusPoints,
      wallet_serial_number: globalUser.wallet_serial_number || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (welcomeBonusPoints > 0) {
      await admin.from('transactions').insert({
        business_id: businessId,
        customer_id: globalUser.id,
        type: 'earn',
        amount: 0,
        points: welcomeBonusPoints,
        description: `Bonus de Bienvenue - Première visite chez ${businessName} (+${welcomeBonusPoints} pts)`,
      });
    }
  } catch (err) {
    console.warn('API /api/scan auto-enrollment insert warning:', err);
  }

  // Fetch active rewards
  let activeRewards: any[] = [];
  try {
    const { data: rews } = await admin
      .from('rewards')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('points_required', { ascending: true });
    if (rews) activeRewards = rews;
  } catch {}

  return NextResponse.json({
    success: true,
    auto_enrolled: true,
    message: 'Existing Hbibna member auto-enrolled!',
    welcome_points: welcomeBonusPoints,
    customer: {
      id: globalUser.id,
      name: globalUser.name,
      phone: globalUser.phone,
      email: globalUser.email,
      points_balance: welcomeBonusPoints,
      business_id: businessId,
    },
    business_name: businessName,
    rewards: activeRewards,
    transactions: [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return processScanLookup(body);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Corps de requête JSON invalide.' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qrCode = searchParams.get('qrCode') || searchParams.get('token') || searchParams.get('pass_id') || searchParams.get('q') || '';
  const business_id = searchParams.get('business_id') || searchParams.get('b') || undefined;

  return processScanLookup({ qrCode, business_id });
}
