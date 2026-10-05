'use client';

import { useEffect } from 'react';
import { saveCachedBusiness, saveCachedLoyaltyRule, saveCachedCustomers } from '@/lib/offline/db';
import { initOfflineSyncEngine } from '@/lib/offline/sync-manager';
import type { Customer } from '@/types/database';

interface OfflineCacheSeederProps {
  businessId: string;
  businessName: string;
  customers: Customer[];
}

/**
 * Pre-seeds the IndexedDB storage whenever the authenticated business interface loads online.
 * Ensures the cashier device has all customer profiles and rules ready before any network disruption.
 */
export function OfflineCacheSeeder({
  businessId,
  businessName,
  customers,
}: OfflineCacheSeederProps) {
  useEffect(() => {
    if (!businessId || typeof window === 'undefined') return;

    // 1. Initialize sync listener
    initOfflineSyncEngine(businessId);

    // 2. Cache business info
    saveCachedBusiness({
      id: businessId,
      name: businessName,
      currency: 'DA',
    }).catch((err) => console.warn('Offline cache seeder business error:', err));

    // 3. Cache default loyalty rule (or custom if fetched)
    saveCachedLoyaltyRule({
      business_id: businessId,
      rule_type: 'per_currency',
      points_per_currency: 1,
      currency_unit: 100,
      points_per_purchase: 10,
    }).catch((err) => console.warn('Offline cache seeder rule error:', err));

    // 4. Cache customers list
    if (customers && customers.length > 0) {
      saveCachedCustomers(businessId, customers).catch((err) =>
        console.warn('Offline cache seeder customers error:', err)
      );
    }
  }, [businessId, businessName, customers]);

  return null;
}
