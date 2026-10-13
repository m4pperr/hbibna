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
  nextRewardTitle?: string;
  pointsRemaining?: number;
  rewardsCatalog?: { title: string; points: number }[];
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

  const points = params.points || 0;
  const nextTarget = points >= 1500 ? 2500 : points >= 500 ? 1500 : 500;
  const remaining =
    params.pointsRemaining !== undefined
      ? params.pointsRemaining
      : Math.max(0, nextTarget - points);

  const nextReward =
    params.nextRewardTitle ||
    (points >= 1500
      ? 'Expérience VIP Élite & Boisson'
      : points >= 500
      ? 'Cadeau Privilège ou Boisson'
      : 'Remise 20% sur la commande');

  const rewardsListText =
    params.rewardsCatalog && params.rewardsCatalog.length > 0
      ? params.rewardsCatalog.map((r) => `• ${r.points} PTS : ${r.title}`).join('\n')
      : '• 100 PTS : Café ou Boisson offerte ☕\n• 200 PTS : Remise -20% sur la commande 🏷️\n• 500 PTS : Cadeau Privilège ou Box gourmande 🍰\n• 1500 PTS : Expérience VIP Élite exclusive ⭐';

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
          label: 'SOLDE DE POINTS',
          value: `${points.toLocaleString()} PTS`,
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
          value: params.tierName || (points >= 1500 ? '⚡ ÉLITE VIP' : points >= 500 ? '💎 PRIVILÈGE' : '👑 VIP GOLD'),
        },
        {
          label: 'PROCHAIN CADEAU',
          value: remaining === 0 ? '🎁 Débloqué en caisse !' : `${nextReward}`,
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
          label: '🎁 Catalogue des Récompenses',
          value: rewardsListText,
        },
        {
          label: '🎯 Progression vers votre Cadeau',
          value:
            remaining === 0
              ? `✨ Félicitations ! Votre récompense (${nextReward}) est 100% prête à être utilisée en caisse.`
              : `Vous avez ${points} PTS. Plus que ${remaining} PTS pour débloquer votre cadeau (${nextReward}) !`,
        },
        {
          label: '💡 Comment échanger vos points',
          value:
            'Présentez simplement ce pass lors de votre passage en caisse et indiquez au commerçant le cadeau que vous souhaitez utiliser. Vos points seront déduits en temps réel.',
        },
        {
          label: 'Commerce Partenaire',
          value: params.businessName || 'Réseau Partenaire Hbibna',
        },
        {
          label: 'Portail Client & QR Écran',
          value: `https://hbibna-phi.vercel.app/customer?phone=${encodeURIComponent(params.phone)}`,
        },
        {
          label: 'Propulsé par',
          value: 'Hbibna • La fidélité phygitale nouvelle génération en Algérie (https://hbibna-phi.vercel.app)',
        },
      ],
      stripURL: 'https://hbibna-phi.vercel.app/assets/hbibna-wallet-banner.jpg',
      logoURL: 'https://hbibna-phi.vercel.app/assets/hbibna-logo-clean.png',
      color: '#18181B',
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

  const points = params.points || 0;
  const nextTarget = points >= 1500 ? 2500 : points >= 500 ? 1500 : 500;
  const remaining =
    params.pointsRemaining !== undefined
      ? params.pointsRemaining
      : Math.max(0, nextTarget - points);

  const nextReward =
    params.nextRewardTitle ||
    (points >= 1500
      ? 'Expérience VIP Élite & Boisson'
      : points >= 500
      ? 'Cadeau Privilège ou Boisson'
      : 'Remise 20% sur la commande');

  const rewardsListText =
    params.rewardsCatalog && params.rewardsCatalog.length > 0
      ? params.rewardsCatalog.map((r) => `• ${r.points} PTS : ${r.title}`).join('\n')
      : '• 100 PTS : Café ou Boisson offerte ☕\n• 200 PTS : Remise -20% sur la commande 🏷️\n• 500 PTS : Cadeau Privilège ou Box gourmande 🍰\n• 1500 PTS : Expérience VIP Élite exclusive ⭐';

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
          label: 'SOLDE DE POINTS',
          value: `${points.toLocaleString()} PTS`,
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
          value: params.tierName || (points >= 1500 ? '⚡ ÉLITE VIP' : points >= 500 ? '💎 PRIVILÈGE' : '👑 VIP GOLD'),
        },
        {
          label: 'PROCHAIN CADEAU',
          value: remaining === 0 ? '🎁 Débloqué en caisse !' : `${nextReward}`,
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
          label: '🎁 Catalogue des Récompenses',
          value: rewardsListText,
        },
        {
          label: '🎯 Progression vers votre Cadeau',
          value:
            remaining === 0
              ? `✨ Félicitations ! Votre récompense (${nextReward}) est 100% prête à être utilisée en caisse.`
              : `Vous avez ${points} PTS. Plus que ${remaining} PTS pour débloquer votre cadeau (${nextReward}) !`,
        },
        {
          label: '💡 Comment échanger vos points',
          value:
            'Présentez simplement ce pass lors de votre passage en caisse et indiquez au commerçant le cadeau que vous souhaitez utiliser. Vos points seront déduits en temps réel.',
        },
        {
          label: 'Commerce Partenaire',
          value: params.businessName || 'Réseau Partenaire Hbibna',
        },
        {
          label: 'Portail Client & QR Écran',
          value: `https://hbibna-phi.vercel.app/customer?phone=${encodeURIComponent(params.phone)}`,
        },
        {
          label: 'Propulsé par',
          value: 'Hbibna • La fidélité phygitale nouvelle génération en Algérie (https://hbibna-phi.vercel.app)',
        },
      ],
      stripURL: 'https://hbibna-phi.vercel.app/assets/hbibna-wallet-banner.jpg',
      logoURL: 'https://hbibna-phi.vercel.app/assets/hbibna-logo-clean.png',
      color: '#18181B',
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
