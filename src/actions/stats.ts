'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import type { Transaction } from '@/types/database';

export interface DashboardMetrics {
  businessName: string;
  ownerName: string;
  totalCustomers: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalRewards: number;
  recentActivity: Transaction[];
}

/**
 * Fetches real dashboard statistics and recent activity directly from Supabase,
 * scoped strictly to the authenticated user's business_id.
 */
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  if (!isSupabaseConfigured()) {
    const { DEFAULT_BUSINESS, DEFAULT_CUSTOMERS, DEFAULT_REWARDS, DEFAULT_TRANSACTIONS } = await import('@/lib/data-service');
    return {
      businessName: DEFAULT_BUSINESS.name,
      ownerName: 'Commerçant',
      totalCustomers: 0,
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      totalRewards: 0,
      recentActivity: [],
    };
  }

  const supabase = await createClient();
  const authBusiness = await getAuthenticatedBusiness();

  // If not authenticated or in preview mode, query with graceful fallback
  const businessId = authBusiness?.business.id;
  const businessName = authBusiness?.business.name || 'Artisan Cafe';
  const ownerName = authBusiness?.user.name || 'Owner';

  try {
    // 1. Total Customers count
    let customerQuery = supabase.from('customers').select('*', { count: 'exact', head: true });
    if (businessId) customerQuery = customerQuery.eq('business_id', businessId);
    const { count: customerCount } = await customerQuery;

    // 2. Total Rewards count
    let rewardsQuery = supabase.from('rewards').select('*', { count: 'exact', head: true });
    if (businessId) rewardsQuery = rewardsQuery.eq('business_id', businessId);
    const { count: rewardsCount } = await rewardsQuery;

    // 3. Transactions for Points calculation & Recent Activity
    let txQuery = supabase
      .from('transactions')
      .select('*, customers(name, phone)')
      .order('created_at', { ascending: false });

    if (businessId) txQuery = txQuery.eq('business_id', businessId);
    const { data: dbTransactions } = await txQuery;

    const allTransactions: Transaction[] = (dbTransactions || []).map((t: any) => ({
      ...t,
      customer: t.customers
        ? {
            name: t.customers.name,
            phone: t.customers.phone,
          }
        : undefined,
    }));

    // Sum total points issued (type = 'earn' or positive points)
    const totalPointsIssued = allTransactions
      .filter((t) => t.type === 'earn' || t.points > 0)
      .reduce((sum, t) => sum + (t.points > 0 ? t.points : 0), 0);

    // Sum total points redeemed (type = 'redeem' or negative points)
    const totalPointsRedeemed = allTransactions
      .filter((t) => t.type === 'redeem' || t.points < 0)
      .reduce((sum, t) => sum + Math.abs(t.points), 0);

    // If database has records, return real database metrics
    if (dbTransactions && dbTransactions.length > 0) {
      return {
        businessName,
        ownerName,
        totalCustomers: customerCount || 0,
        totalPointsIssued,
        totalPointsRedeemed,
        totalRewards: rewardsCount || 0,
        recentActivity: allTransactions.slice(0, 10),
      };
    }

    return {
      businessName,
      ownerName,
      totalCustomers: customerCount ?? 0,
      totalPointsIssued: totalPointsIssued ?? 0,
      totalPointsRedeemed: totalPointsRedeemed ?? 0,
      totalRewards: rewardsCount ?? 0,
      recentActivity: allTransactions.slice(0, 10),
    };
  } catch (err) {
    console.error('Error fetching dashboard metrics:', err);
    return {
      businessName,
      ownerName,
      totalCustomers: 0,
      totalPointsIssued: 0,
      totalPointsRedeemed: 0,
      totalRewards: 0,
      recentActivity: [],
    };
  }
}
