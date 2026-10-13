import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateWalletPass, isWalletWalletConfigured } from '@/lib/walletwallet/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phone = searchParams.get('phone')?.trim();
  const customerId = searchParams.get('c')?.trim();
  const businessId = searchParams.get('b')?.trim();

  // If neither phone nor customerId is supplied, redirect nicely to customer portal
  if (!phone && !customerId) {
    return NextResponse.redirect(new URL('/customer', request.url));
  }

  const cleanPhone = phone ? phone.replace(/[\s-]/g, '') : '';
  const altPhone = cleanPhone.startsWith('0')
    ? `+213${cleanPhone.slice(1)}`
    : cleanPhone.startsWith('+213')
    ? `0${cleanPhone.slice(4)}`
    : cleanPhone;

  const adminClient = createAdminClient();

  try {
    let customer = null;

    if (cleanPhone) {
      const { data } = await adminClient
        .from('customers')
        .select('*')
        .or(`phone.eq.${cleanPhone},phone.eq.${altPhone}`)
        .maybeSingle();
      customer = data;
    } else if (customerId) {
      const { data } = await adminClient
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .maybeSingle();
      customer = data;
    }

    const effectivePhone = cleanPhone || customer?.phone || '0550000000';
    const customerName = customer?.name || 'Client Fidèle';

    // If customer already has an active Apple Pass serial number, redirect directly to Apple pkpass
    if (customer?.wallet_serial_number) {
      const pkpassUrl = `https://api.walletwallet.dev/p/${customer.wallet_serial_number}/apple.pkpass`;
      return NextResponse.redirect(pkpassUrl, 307);
    }

    const targetBusinessId = businessId || customer?.business_id;
    let businessName = 'Hbibna';

    if (targetBusinessId) {
      const { data: business } = await adminClient
        .from('businesses')
        .select('name')
        .eq('id', targetBusinessId)
        .maybeSingle();
      if (business?.name) businessName = business.name;
    }

    let points = customer?.points_balance || 0;
    let membershipId: string | null = null;

    if (customer?.id && targetBusinessId) {
      const { data: membership } = await adminClient
        .from('customer_businesses')
        .select('id, points_balance, wallet_serial_number')
        .eq('customer_id', customer.id)
        .eq('business_id', targetBusinessId)
        .maybeSingle();

      if (membership?.wallet_serial_number) {
        return NextResponse.redirect(
          `https://api.walletwallet.dev/p/${membership.wallet_serial_number}/apple.pkpass`,
          307
        );
      }
      if (membership?.points_balance !== undefined) {
        points = membership.points_balance;
      }
      if (membership?.id) {
        membershipId = membership.id;
      }
    }

    const tierName =
      points >= 1500
        ? '⚡ Membre Élite VIP'
        : points >= 500
        ? '💎 Membre Privilège'
        : '👑 Membre VIP Gold';

    const pass = await generateWalletPass({
      customerName,
      phone: effectivePhone,
      businessName,
      points,
      tierName,
    });

    if (!pass) {
      // Graceful fallback to customer portal
      return NextResponse.redirect(new URL(`/customer?phone=${encodeURIComponent(effectivePhone)}`, request.url));
    }

    // Save pass details in database for instant future downloads
    try {
      if (customer?.id) {
        await adminClient
          .from('customers')
          .update({
            wallet_serial_number: pass.serialNumber,
            wallet_share_url: pass.shareUrl,
            wallet_google_url: pass.googleSaveUrl || null,
          })
          .eq('id', customer.id);

        if (membershipId) {
          await adminClient
            .from('customer_businesses')
            .update({
              wallet_serial_number: pass.serialNumber,
              wallet_share_url: pass.shareUrl,
              wallet_google_url: pass.googleSaveUrl || null,
            })
            .eq('id', membershipId);
        }
      }
    } catch (saveErr) {
      console.warn('Notice saving wallet serial:', saveErr);
    }

    // Direct redirection to the Apple Wallet signed pkpass file
    const applePkpassDirectUrl = `https://api.walletwallet.dev/p/${pass.serialNumber}/apple.pkpass`;
    return NextResponse.redirect(applePkpassDirectUrl, 307);
  } catch (err) {
    console.error('Error in /api/wallet/pass route:', err);
    return NextResponse.redirect(new URL('/customer', request.url));
  }
}
