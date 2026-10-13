import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { generateWalletPass, isWalletWalletConfigured } from '@/lib/walletwallet/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const phone = searchParams.get('phone')?.trim();
  const businessId = searchParams.get('b')?.trim();

  if (!phone) {
    return new NextResponse('Phone parameter is required', { status: 400 });
  }

  if (!isWalletWalletConfigured()) {
    return new NextResponse('Wallet service not configured', { status: 503 });
  }

  const cleanPhone = phone.replace(/[\s-]/g, '');
  const adminClient = createAdminClient();

  try {
    const { data: customer } = await adminClient
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (!customer) {
      return new NextResponse('Customer not found', { status: 404 });
    }

    const targetBusinessId = businessId || customer.business_id;
    let businessName = 'Hbibna';

    if (targetBusinessId) {
      const { data: business } = await adminClient
        .from('businesses')
        .select('name')
        .eq('id', targetBusinessId)
        .maybeSingle();
      if (business?.name) businessName = business.name;
    }

    let points = customer.points_balance || 0;
    if (targetBusinessId) {
      const { data: membership } = await adminClient
        .from('customer_businesses')
        .select('points_balance')
        .eq('customer_id', customer.id)
        .eq('business_id', targetBusinessId)
        .maybeSingle();
      if (membership?.points_balance !== undefined) {
        points = membership.points_balance;
      }
    }

    const tierName = points >= 500 ? 'Membre Gold' : points >= 200 ? 'Membre Silver' : 'Membre Bronze';

    const pass = await generateWalletPass({
      customerName: customer.name,
      phone: cleanPhone,
      businessName,
      points,
      tierName,
    });

    if (!pass?.applePassBase64) {
      if (pass?.shareUrl) {
        return NextResponse.redirect(pass.shareUrl);
      }
      return new NextResponse('Failed to generate Apple Wallet pass', { status: 500 });
    }

    const buffer = Buffer.from(pass.applePassBase64, 'base64');
    const filename = `pass-${cleanPhone}.pkpass`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (err) {
    console.error('Error generating pkpass:', err);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
