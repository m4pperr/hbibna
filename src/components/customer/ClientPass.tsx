'use client';

import React from 'react';
import { CustomerLoyaltyCard } from './CustomerLoyaltyCard';
import type { Customer, CustomerBusinessMembership, Business } from '@/types/database';

export interface ClientPassProps {
  currentUser?: {
    id: string;
    passId?: string;
    global_pass_id?: string;
    name?: string;
    phone?: string;
    email?: string | null;
  } | null;
  customer?: Customer | null;
  business?: Business | null;
  membership?: CustomerBusinessMembership | null;
  activeQueryStr?: string;
  showQrStub?: boolean;
}

/**
 * ClientPass Component
 * Encodes the authenticated user's unique pass ID directly into the pass and QR code.
 */
export function ClientPass({
  currentUser,
  customer,
  business,
  membership,
  activeQueryStr,
  showQrStub = true,
}: ClientPassProps) {
  // Bind directly to currentUser.id or passId or customer.id
  const resolvedId =
    currentUser?.id ||
    currentUser?.passId ||
    currentUser?.global_pass_id ||
    customer?.id ||
    '';

  if (typeof window !== 'undefined') {
    console.log("GENERATED QR PAYLOAD:", currentUser?.id || currentUser?.passId || resolvedId);
  }

  const effectiveCustomer: Customer | null = (customer || currentUser)
    ? ({
        id: resolvedId,
        business_id: customer?.business_id || '',
        name: currentUser?.name || customer?.name || 'Client Hbibna',
        phone: currentUser?.phone || customer?.phone || '',
        email: currentUser?.email ?? customer?.email ?? null,
        points_balance: customer?.points_balance || 0,
        created_at: customer?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        passId: resolvedId,
        global_pass_id: resolvedId,
      } as unknown as Customer)
    : null;

  return (
    <CustomerLoyaltyCard
      customer={effectiveCustomer}
      business={business}
      membership={membership}
      activeQueryStr={activeQueryStr}
      showQrStub={showQrStub}
    />
  );
}
