/**
 * WalletWallet Service (Apple Wallet .pkpass & Google Wallet API integration)
 * Docs: https://www.walletwallet.dev/llms.txt
 */

const WALLETWALLET_API_URL = 'https://api.walletwallet.dev';

export interface WalletPassResult {
  serialNumber: string;
  shareUrl: string;
  googleSaveUrl?: string;
  applePassBase64?: string;
}

export interface CreatePassParams {
  customerName: string;
  phone: string;
  businessName: string;
  points: number;
  tierName?: string;
  serialNumber?: string;
}

const DEFAULT_WALLET_API_KEY = 'ww_live_aa77cb8f6ab767677d98eaaa0c1fc63d';

function getApiKey(): string {
  const key = process.env.WALLETWALLET_API_KEY?.trim() || DEFAULT_WALLET_API_KEY;
  return key;
}

/**
 * Checks if WalletWallet API key is configured.
 */
export function isWalletWalletConfigured(): boolean {
  const key = getApiKey();
  return Boolean(key && key.startsWith('ww_live_'));
}

/**
 * Generates an official signed Apple Wallet (.pkpass) and Google Wallet pass
 * using the WalletWallet API.
 */
export async function generateWalletPass(
  params: CreatePassParams
): Promise<WalletPassResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('WalletWallet API key is missing. Skipping pass generation.');
    return null;
  }

  try {
    const payload = {
      barcodeValue: params.phone,
      barcodeFormat: 'QR',
      barcodeAltText: params.phone,
      logoText: 'HBIBNA',
      organizationName: params.businessName || 'Hbibna Loyalty',
      description: `Pass Fidélité ${params.businessName || 'Hbibna'}`,
      primaryFields: [
        {
          label: 'POINTS CUMULÉS',
          value: `${params.points.toLocaleString()} PTS`,
          changeMessage: 'Solde Hbibna mis à jour : %@ PTS',
        },
      ],
      secondaryFields: [
        {
          label: 'TITULAIRE',
          value: params.customerName || 'Client Membre',
        },
        {
          label: 'STATUT',
          value: params.tierName || '👑 VIP GOLD',
        },
      ],
      headerFields: [
        {
          label: 'FIDÉLITÉ',
          value: params.businessName ? params.businessName.toUpperCase().slice(0, 16) : 'HBIBNA',
        },
      ],
      backFields: [
        {
          label: 'Commerce Partenaire',
          value: params.businessName || 'Réseau Partenaire Hbibna',
        },
        {
          label: 'Avantages du Pass',
          value:
            'Présentez ce QR code à la caisse lors de chaque passage pour cumuler des points, grimper de statut et débloquer des cadeaux exclusifs.',
        },
        {
          label: 'Niveau & Points',
          value: `${params.tierName || 'Membre VIP'} • ${params.points.toLocaleString()} points disponibles.`,
        },
        {
          label: 'Numéro de Compte Client',
          value: params.phone,
        },
        {
          label: 'Portail Client en Ligne',
          value: `https://hbibna-phi.vercel.app/customer?phone=${encodeURIComponent(params.phone)}`,
        },
        {
          label: 'Propulsé par',
          value: 'Hbibna • La fidélité phygitale nouvelle génération en Algérie (https://hbibna-phi.vercel.app)',
        },
      ],
      colorPreset: 'dark',
      sharingProhibited: true,
    };

    const res = await fetch(`${WALLETWALLET_API_URL}/api/passes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('WalletWallet pass generation error:', res.status, errBody);
      return null;
    }

    const data = await res.json();
    return {
      serialNumber: data.serialNumber,
      shareUrl: data.shareUrl,
      googleSaveUrl: data.googleSaveUrl,
      applePassBase64: data.applePass,
    };
  } catch (err) {
    console.error('Failed to create WalletWallet pass:', err);
    return null;
  }
}

/**
 * Updates an already issued pass globally across Apple and Google Wallet devices.
 * Triggers a native lock screen APNs notification on iOS devices!
 */
export async function updateWalletPass(
  serialNumber: string,
  params: CreatePassParams
): Promise<boolean> {
  const apiKey = getApiKey();
  if (!apiKey || !serialNumber) return false;

  try {
    const payload = {
      barcodeValue: params.phone,
      barcodeFormat: 'QR',
      barcodeAltText: params.phone,
      logoText: 'HBIBNA',
      organizationName: params.businessName || 'Hbibna Loyalty',
      description: `Pass Fidélité ${params.businessName || 'Hbibna'}`,
      primaryFields: [
        {
          label: 'POINTS CUMULÉS',
          value: `${params.points.toLocaleString()} PTS`,
          changeMessage: 'Solde Hbibna mis à jour : %@ PTS',
        },
      ],
      secondaryFields: [
        {
          label: 'TITULAIRE',
          value: params.customerName || 'Client Membre',
        },
        {
          label: 'STATUT',
          value: params.tierName || '👑 VIP GOLD',
        },
      ],
      headerFields: [
        {
          label: 'FIDÉLITÉ',
          value: params.businessName ? params.businessName.toUpperCase().slice(0, 16) : 'HBIBNA',
        },
      ],
      backFields: [
        {
          label: 'Commerce Partenaire',
          value: params.businessName || 'Réseau Partenaire Hbibna',
        },
        {
          label: 'Avantages du Pass',
          value:
            'Présentez ce QR code à la caisse lors de chaque passage pour cumuler des points, grimper de statut et débloquer des cadeaux exclusifs.',
        },
        {
          label: 'Niveau & Points',
          value: `${params.tierName || 'Membre VIP'} • ${params.points.toLocaleString()} points disponibles.`,
        },
        {
          label: 'Numéro de Compte Client',
          value: params.phone,
        },
        {
          label: 'Portail Client en Ligne',
          value: `https://hbibna-phi.vercel.app/customer?phone=${encodeURIComponent(params.phone)}`,
        },
        {
          label: 'Propulsé par',
          value: 'Hbibna • La fidélité phygitale nouvelle génération en Algérie (https://hbibna-phi.vercel.app)',
        },
      ],
      colorPreset: 'dark',
      sharingProhibited: true,
    };

    const res = await fetch(`${WALLETWALLET_API_URL}/api/passes/${encodeURIComponent(serialNumber)}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('WalletWallet pass update notice:', res.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to update WalletWallet pass:', err);
    return false;
  }
}
