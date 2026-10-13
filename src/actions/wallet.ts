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

  const cleanPhone = phone.replace(/[\s-]/g, '');
  const adminClient = createAdminClient();

  try {
    // 1. Fetch customer
    const { data: customer } = await adminClient
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (!customer) {
      return { configured: true, error: 'Client introuvable.' };
    }

    // 2. Fetch business
    const targetBusinessId = businessId || customer.business_id;
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

    if (targetBusinessId) {
      const { data: membership } = await adminClient
        .from('customer_businesses')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('business_id', targetBusinessId)
        .maybeSingle();
      existingMembership = membership;
    }

    // If pass was already created, return existing URLs
    if (existingMembership?.wallet_share_url || customer.wallet_share_url) {
      const shareUrl = (existingMembership?.wallet_share_url || customer.wallet_share_url)!;
      const serialNumber = (existingMembership?.wallet_serial_number || customer.wallet_serial_number)!;
      const googleSaveUrl = existingMembership?.wallet_google_url || customer.wallet_google_url || undefined;

      return {
        configured: true,
        shareUrl,
        googleSaveUrl,
        applePassUrl: `/api/wallet/pass?phone=${encodeURIComponent(cleanPhone)}${targetBusinessId ? `&b=${targetBusinessId}` : ''}`,
        serialNumber,
      };
    }

    // Otherwise generate a fresh pass via WalletWallet
    const points = existingMembership?.points_balance ?? customer.points_balance ?? 0;
    const tierName = points >= 500 ? 'Membre Gold' : points >= 200 ? 'Membre Silver' : 'Membre Bronze';

    const pass = await generateWalletPass({
      customerName: customer.name,
      phone: cleanPhone,
      businessName,
      points,
      tierName,
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

      await adminClient
        .from('customers')
        .update({
          wallet_serial_number: pass.serialNumber,
          wallet_share_url: pass.shareUrl,
          wallet_google_url: pass.googleSaveUrl || null,
        })
        .eq('id', customer.id);
    } catch (saveErr) {
      console.warn('Notice saving wallet pass metadata:', saveErr);
    }

    return {
      configured: true,
      shareUrl: pass.shareUrl,
      googleSaveUrl: pass.googleSaveUrl,
      applePassUrl: `/api/wallet/pass?phone=${encodeURIComponent(cleanPhone)}${targetBusinessId ? `&b=${targetBusinessId}` : ''}`,
      serialNumber: pass.serialNumber,
    };
  } catch (err) {
    console.error('Error in getOrCreateCustomerWallet:', err);
    return { configured: true, error: 'Erreur lors de la génération du pass.' };
  }
}
