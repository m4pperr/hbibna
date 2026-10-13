'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { generateWalletPass, isWalletWalletConfigured } from '@/lib/walletwallet/service';

export interface CustomerWalletInfo {
  configured: boolean;
  shareUrl?: string;
  googleSaveUrl?: string;
  applePassUrl?: string;
  serialNumber?: string;
  error?: string;
}

/**
 * Gets or creates the digital Apple / Google Wallet pass for a customer.
 */
export async function getOrCreateCustomerWallet(
  phone: string,
  businessId?: string
): Promise<CustomerWalletInfo> {
  if (!isWalletWalletConfigured()) {
    return { configured: false };
  }

  const cleanPhone = phone ? phone.replace(/[\s-]/g, '') : '';
  if (!cleanPhone) {
    return { configured: true, error: 'Numéro de téléphone requis.' };
  }

  const altPhone = cleanPhone.startsWith('0')
    ? `+213${cleanPhone.slice(1)}`
    : cleanPhone.startsWith('+213')
    ? `0${cleanPhone.slice(4)}`
    : cleanPhone;

  const adminClient = createAdminClient();

  try {
    // 1. Fetch customer by phone or alternate format
    const { data: customer } = await adminClient
      .from('customers')
      .select('*')
      .or(`phone.eq.${cleanPhone},phone.eq.${altPhone}`)
      .maybeSingle();

    const customerName = customer?.name || 'Client Fidèle';

    // 2. Fetch business
    const targetBusinessId = businessId || customer?.business_id;
    let businessName = 'Hbibna Loyalty';

    if (targetBusinessId) {
      const { data: business } = await adminClient
        .from('businesses')
        .select('name')
        .eq('id', targetBusinessId)
        .maybeSingle();
      if (business?.name) businessName = business.name;
    }

    // 3. Check existing membership
    let existingMembership: {
      id?: string;
      wallet_serial_number?: string | null;
      wallet_share_url?: string | null;
      wallet_google_url?: string | null;
      points_balance?: number;
    } | null = null;

    if (customer?.id && targetBusinessId) {
      const { data: membership } = await adminClient
        .from('customer_businesses')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('business_id', targetBusinessId)
        .maybeSingle();
      existingMembership = membership;
    }

    // If pass was already created, return existing URLs
    const existingSerial = existingMembership?.wallet_serial_number || customer?.wallet_serial_number;
    const existingShare = existingMembership?.wallet_share_url || customer?.wallet_share_url;
    const existingGoogle = existingMembership?.wallet_google_url || customer?.wallet_google_url;

    if (existingSerial || existingShare) {
      const serialNumber = existingSerial || '';
      const shareUrl = existingShare || (serialNumber ? `https://pass.walletwallet.dev/p/${serialNumber}` : '');
      const googleSaveUrl = existingGoogle || undefined;

      return {
        configured: true,
        shareUrl,
        googleSaveUrl,
        applePassUrl: serialNumber
          ? `https://api.walletwallet.dev/p/${serialNumber}/apple.pkpass`
          : `/api/wallet/pass?phone=${encodeURIComponent(cleanPhone)}${targetBusinessId ? `&b=${targetBusinessId}` : ''}`,
        serialNumber,
      };
    }

    // Otherwise generate a fresh pass via WalletWallet
    const points = existingMembership?.points_balance ?? customer?.points_balance ?? 0;
    const tierName =
      points >= 1500
        ? '⚡ Membre Élite VIP'
        : points >= 500
        ? '💎 Membre Privilège'
        : '👑 Membre VIP Gold';

    let rewardsCatalog: { title: string; points: number }[] = [];
    if (targetBusinessId) {
      const { data: dbRewards } = await adminClient
        .from('rewards')
        .select('name, points_required')
        .eq('business_id', targetBusinessId)
        .eq('is_active', true)
        .order('points_required', { ascending: true });
      if (dbRewards && dbRewards.length > 0) {
        rewardsCatalog = dbRewards.map((r) => ({ title: r.name, points: r.points_required }));
      }
    }

    const pass = await generateWalletPass({
      customerName,
      phone: cleanPhone,
      businessName,
      points,
      tierName,
      rewardsCatalog,
    });

    if (!pass) {
      return { configured: true, error: 'Impossible de générer le pass Wallet pour le moment.' };
    }

    // Save wallet information in DB
    try {
      if (existingMembership?.id) {
        await adminClient
          .from('customer_businesses')
          .update({
            wallet_serial_number: pass.serialNumber,
            wallet_share_url: pass.shareUrl,
            wallet_google_url: pass.googleSaveUrl || null,
          })
          .eq('id', existingMembership.id);
      }

      if (customer?.id) {
        await adminClient
          .from('customers')
          .update({
            wallet_serial_number: pass.serialNumber,
            wallet_share_url: pass.shareUrl,
            wallet_google_url: pass.googleSaveUrl || null,
          })
          .eq('id', customer.id);
      }
    } catch (saveErr) {
      console.warn('Notice saving wallet pass metadata:', saveErr);
    }

    return {
      configured: true,
      shareUrl: pass.shareUrl,
      googleSaveUrl: pass.googleSaveUrl,
      applePassUrl: `https://api.walletwallet.dev/p/${pass.serialNumber}/apple.pkpass`,
      serialNumber: pass.serialNumber,
    };
  } catch (err) {
    console.error('Error in getOrCreateCustomerWallet:', err);
    return { configured: true, error: 'Erreur lors de la génération du pass.' };
  }
}
