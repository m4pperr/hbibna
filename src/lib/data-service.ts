import { createClient } from '@/lib/supabase/server';
import type {
  Customer,
  Transaction,
  Reward,
  LoyaltyProgram,
  Business,
  CustomerBusinessMembership,
} from '@/types/database';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// ---------------------------------------------------------------------------
// 1. BUSINESS DEFINITIONS (Isolated Tenants)
// ---------------------------------------------------------------------------
export const DEFAULT_BUSINESS: Business = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Artisan Bakery Oran',
  logo_url: null,
  email: 'contact@artisan-bakery.dz',
  phone: '0550 12 34 56',
  subscription_status: 'active',
  plan_name: 'Hbibna Business',
  plan_price_da: 9800,
  currency: 'DA',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const BUSINESS_BEAUTY: Business = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Beauty Studio',
  logo_url: null,
  email: 'hello@beautystudio.dz',
  phone: '0661 55 44 33',
  subscription_status: 'active',
  plan_name: 'Hbibna Business',
  plan_price_da: 9800,
  currency: 'DA',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const BUSINESS_RESTAURANT: Business = {
  id: '00000000-0000-0000-0000-000000000003',
  name: 'Restaurant XYZ',
  logo_url: null,
  email: 'booking@restaurant-xyz.dz',
  phone: '0770 11 22 33',
  subscription_status: 'active',
  plan_name: 'Hbibna Business',
  plan_price_da: 9800,
  currency: 'DA',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// 2. LOYALTY RULES PER BUSINESS
// ---------------------------------------------------------------------------
export const DEFAULT_LOYALTY: LoyaltyProgram = {
  id: '10000000-0000-0000-0000-000000000001',
  business_id: DEFAULT_BUSINESS.id,
  name: 'El Bahia Regulars Club',
  rule_type: 'per_currency',
  points_per_currency: 1,
  currency_unit: 100,
  points_per_purchase: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// 3. CLEAN CUSTOMERS (Production isolated database)
export const DEFAULT_CUSTOMERS: Customer[] = [];

// ---------------------------------------------------------------------------
// 4. REWARDS PER BUSINESS (Isolated Catalogs)
// ---------------------------------------------------------------------------
export const STORE_REWARDS: Reward[] = [];
export const CAFE_REWARDS: Reward[] = [];
export const BEAUTY_REWARDS: Reward[] = [];
export const RESTAURANT_REWARDS: Reward[] = [];
export const DEFAULT_REWARDS: Reward[] = [];

// ---------------------------------------------------------------------------
// 5. TRANSACTIONS PER BUSINESS (Isolated Ledgers)
// ---------------------------------------------------------------------------
export const STORE_TRANSACTIONS: Transaction[] = [];
export const CAFE_TRANSACTIONS: Transaction[] = [];
export const BEAUTY_TRANSACTIONS: Transaction[] = [];
export const RESTAURANT_TRANSACTIONS: Transaction[] = [];
export const DEFAULT_TRANSACTIONS: Transaction[] = [];

export const ALL_CUSTOMER_BUSINESSES: {
  id: string;
  name: string;
  points: number;
  category: string;
}[] = [];

export const SARAH_MEMBERSHIPS: CustomerBusinessMembership[] = [];

// Map of business ID to rewards & transactions
const BUSINESS_MAP: Record<
  string,
  { business: Business; rewards: Reward[]; transactions: Transaction[] }
> = {
  [DEFAULT_BUSINESS.id]: {
    business: DEFAULT_BUSINESS,
    rewards: CAFE_REWARDS,
    transactions: CAFE_TRANSACTIONS,
  },
  [BUSINESS_BEAUTY.id]: {
    business: BUSINESS_BEAUTY,
    rewards: BEAUTY_REWARDS,
    transactions: BEAUTY_TRANSACTIONS,
  },
  [BUSINESS_RESTAURANT.id]: {
    business: BUSINESS_RESTAURANT,
    rewards: RESTAURANT_REWARDS,
    transactions: RESTAURANT_TRANSACTIONS,
  },
};

function getOrGenerateBusinessData(membership: CustomerBusinessMembership) {
  if (BUSINESS_MAP[membership.business_id]) {
    return BUSINESS_MAP[membership.business_id];
  }

  const biz = membership.business || {
    id: membership.business_id,
    name: 'Hbibna Partner Business',
    logo_url: null,
    email: null,
    phone: null,
    subscription_status: 'active' as const,
    plan_name: 'Hbibna Business',
    plan_price_da: 9800,
    currency: 'DA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const rewards: Reward[] = [
    {
      id: `r-${biz.id}-1`,
      business_id: biz.id,
      name: `${biz.name} Welcome Gift`,
      description: 'Complimentary welcome reward valid on any visit.',
      points_required: 250,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `r-${biz.id}-2`,
      business_id: biz.id,
      name: '500 DA Member Voucher',
      description: '500 DA direct discount at the counter.',
      points_required: 600,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: `r-${biz.id}-3`,
      business_id: biz.id,
      name: `${biz.name} Premium Perk`,
      description: 'Exclusive signature gift or free service.',
      points_required: 1200,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const transactions: Transaction[] = [
    {
      id: `tx-${biz.id}-1`,
      business_id: biz.id,
      customer_id: membership.customer_id,
      type: 'earn',
      amount: 3500,
      points: 35,
      description: 'Purchase at Counter',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
    },
    {
      id: `tx-${biz.id}-2`,
      business_id: biz.id,
      customer_id: membership.customer_id,
      type: 'earn',
      amount: 7200,
      points: 72,
      description: 'Visit & Purchase',
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
    },
  ];

  return { business: biz, rewards, transactions };
}

// ---------------------------------------------------------------------------
// 7. BUSINESS DASHBOARD DATA FETCHER (Strict Isolation)
// ---------------------------------------------------------------------------
export async function fetchBusinessData() {
  if (!isSupabaseConfigured()) {
    return {
      business: DEFAULT_BUSINESS,
      customers: DEFAULT_CUSTOMERS,
      loyalty: DEFAULT_LOYALTY,
      rewards: DEFAULT_REWARDS,
      transactions: DEFAULT_TRANSACTIONS,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Resolve authenticated user and business profile first
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    let business: Business = DEFAULT_BUSINESS;
    let businessId: string | null = null;

    if (authUser) {
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('*, businesses(*)')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profile?.businesses) {
          business = profile.businesses as Business;
          businessId = business.id;
        } else if (profile?.business_id) {
          businessId = profile.business_id;
          const { data: bData } = await supabase
            .from('businesses')
            .select('*')
            .eq('id', profile.business_id)
            .maybeSingle();
          if (bData) business = bData as Business;
        }
      } catch (err) {
        console.warn('Profile fetch notice in fetchBusinessData:', err);
      }
    }

    // 2. Query tenant-isolated entities scoped to businessId
    let custQuery = supabase.from('customers').select('*').order('created_at', { ascending: false });
    let loyaltyQuery = supabase.from('loyalty_programs').select('*').maybeSingle();
    let rewardsQuery = supabase.from('rewards').select('*').order('points_required', { ascending: true });
    let txQuery = supabase.from('transactions').select('*, customers(name, phone)').order('created_at', { ascending: false });

    if (businessId) {
      custQuery = custQuery.eq('business_id', businessId);
      loyaltyQuery = supabase.from('loyalty_programs').select('*').eq('business_id', businessId).maybeSingle();
      rewardsQuery = rewardsQuery.eq('business_id', businessId);
      txQuery = txQuery.eq('business_id', businessId);
    }

    const [custRes, loyaltyRes, rewardsRes, txRes] = await Promise.allSettled([
      custQuery,
      loyaltyQuery,
      rewardsQuery,
      txQuery,
    ]);

    const dbCustomers = custRes.status === 'fulfilled' && !custRes.value.error ? custRes.value.data : null;
    const dbLoyalty = loyaltyRes.status === 'fulfilled' && !loyaltyRes.value.error ? loyaltyRes.value.data : null;
    const dbRewards = rewardsRes.status === 'fulfilled' && !rewardsRes.value.error ? rewardsRes.value.data : null;
    const dbTransactions = txRes.status === 'fulfilled' && !txRes.value.error ? txRes.value.data : null;

    // Preserve real empty states if authenticated business is found (Step 7 & Step 10)
    const customers: Customer[] =
      dbCustomers !== null
        ? (dbCustomers as Customer[])
        : authUser ? [] : DEFAULT_CUSTOMERS;

    const loyalty: LoyaltyProgram =
      dbLoyalty
        ? (dbLoyalty as unknown as LoyaltyProgram)
        : {
            ...DEFAULT_LOYALTY,
            business_id: business.id,
            name: `${business.name} Loyalty Program`,
          };

    const rewards: Reward[] =
      dbRewards !== null
        ? (dbRewards as Reward[])
        : authUser ? [] : DEFAULT_REWARDS;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transactions: Transaction[] =
      dbTransactions !== null
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dbTransactions.map((t: any) => ({
            ...t,
            customer: t.customers ? { name: t.customers.name, phone: t.customers.phone } : undefined,
          }))
        : authUser ? [] : DEFAULT_TRANSACTIONS;

    return {
      business,
      customers,
      loyalty,
      rewards,
      transactions,
    };
  } catch (err) {
    console.warn('Falling back to default business data:', err);
    return {
      business: DEFAULT_BUSINESS,
      customers: DEFAULT_CUSTOMERS,
      loyalty: DEFAULT_LOYALTY,
      rewards: DEFAULT_REWARDS,
      transactions: DEFAULT_TRANSACTIONS,
    };
  }
}

// ---------------------------------------------------------------------------
// 8. CUSTOMER PORTAL DATA FETCHER (Multi-Business View for Customer)
// Enables the customer to see every business they belong to and switch between them.
// ---------------------------------------------------------------------------
export interface CustomerPortalData {
  customer: Customer;
  memberships: CustomerBusinessMembership[];
  activeMembership: CustomerBusinessMembership;
  rewards: Reward[];
  transactions: Transaction[];
  business: Business;
}

export async function fetchCustomerPortalData(params?: {
  phone?: string;
  customerId?: string;
  businessId?: string;
}): Promise<CustomerPortalData> {
  const { phone, customerId, businessId } = params || {};

  // If Supabase is configured, attempt real database lookup following multi-business architecture:
  // customer -> customer_businesses -> businesses
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      let dbCustomer: Customer | null = null;

      // 1. By auth user session
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: c } = await supabase
          .from('customers')
          .select('*')
          .or(`auth_user_id.eq.${authData.user.id},id.eq.${authData.user.id}`)
          .maybeSingle();
        if (c) dbCustomer = c as Customer;
      }

      // 2. By phone parameter
      if (!dbCustomer && phone) {
        const cleanPhone = phone.trim();
        const { data: c } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();
        if (c) dbCustomer = c as Customer;
      }

      // 3. By customerId parameter
      if (!dbCustomer && customerId) {
        const { data: c } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .maybeSingle();
        if (c) dbCustomer = c as Customer;
      }

      if (dbCustomer) {
        // Query isolated memberships for this customer across businesses
        const { data: membershipsData } = await supabase
          .from('customer_businesses')
          .select('*, businesses(*)')
          .eq('customer_id', dbCustomer.id);

        if (membershipsData && membershipsData.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const memberships: CustomerBusinessMembership[] = membershipsData.map((m: any) => ({
            id: m.id,
            customer_id: m.customer_id,
            business_id: m.business_id,
            points_balance: m.points_balance || 0,
            created_at: m.created_at,
            updated_at: m.updated_at,
            business: m.businesses || DEFAULT_BUSINESS,
          }));

          const activeMembership =
            (businessId ? memberships.find((m) => m.business_id === businessId) : null) ||
            memberships[0];

          // Fetch active rewards for the selected business
          const { data: rewardsData } = await supabase
            .from('rewards')
            .select('*')
            .eq('business_id', activeMembership.business_id)
            .eq('is_active', true)
            .order('points_required', { ascending: true });

          // Fetch transaction activity for this customer at the selected business
          const { data: txData } = await supabase
            .from('transactions')
            .select('*')
            .eq('customer_id', dbCustomer.id)
            .eq('business_id', activeMembership.business_id)
            .order('created_at', { ascending: false });

          return {
            customer: dbCustomer,
            memberships,
            activeMembership,
            rewards: (rewardsData as Reward[]) || [],
            transactions: (txData as Transaction[]) || [],
            business: activeMembership.business || DEFAULT_BUSINESS,
          };
        }
      }
    } catch (err) {
      console.warn('Notice in fetchCustomerPortalData, falling back gracefully:', err);
    }
  }

  // Clean fallback when no customer is found
  const cleanCustomer: Customer = {
    id: customerId || 'guest',
    business_id: businessId || DEFAULT_BUSINESS.id,
    name: 'Nouveau Client',
    phone: phone || '',
    email: null,
    points_balance: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const cleanMembership: CustomerBusinessMembership = {
    id: 'mem-clean',
    customer_id: cleanCustomer.id,
    business_id: businessId || DEFAULT_BUSINESS.id,
    points_balance: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    business: DEFAULT_BUSINESS,
  };

  return {
    customer: cleanCustomer,
    memberships: [],
    activeMembership: cleanMembership,
    rewards: [],
    transactions: [],
    business: DEFAULT_BUSINESS,
  };
}

// ---------------------------------------------------------------------------
// 9. PUBLIC REWARDS CATALOG (Public Directory of Businesses & Available Rewards)
// Strictly public information: business names, categories, and available rewards.
// NEVER leaks customer names, phone numbers, points balances, or redemptions.
// ---------------------------------------------------------------------------
export interface PublicRewardItem {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
}

export interface PublicBusinessCatalogItem {
  id: string;
  name: string;
  category: string;
  logo_url: string | null;
  phone: string | null;
  rewards: PublicRewardItem[];
}

export async function getPublicRewardsCatalog(): Promise<PublicBusinessCatalogItem[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data: businesses, error: bizError } = await supabase
        .from('businesses')
        .select('id, name, logo_url, phone')
        .in('subscription_status', ['active', 'trial', 'pending_payment']);

      if (!bizError && businesses && businesses.length > 0) {
        const { data: rewards, error: rewError } = await supabase
          .from('rewards')
          .select('id, business_id, name, description, points_required, is_active')
          .eq('is_active', true);

        if (!rewError && rewards) {
          const rewardsByBiz = rewards.reduce((acc, r) => {
            if (!acc[r.business_id]) acc[r.business_id] = [];
            acc[r.business_id].push({
              id: r.id,
              name: r.name,
              description: r.description,
              points_required: r.points_required,
            });
            return acc;
          }, {} as Record<string, PublicRewardItem[]>);

          return businesses
            .map((b) => ({
              id: b.id,
              name: b.name,
              category: 'Commerce Partenaire',
              logo_url: b.logo_url,
              phone: b.phone,
              rewards: rewardsByBiz[b.id] || [],
            }))
            .filter((b) => b.rewards.length > 0);
        }
      }
      return [];
    } catch (err) {
      console.warn('Notice fetching public rewards from Supabase:', err);
      return [];
    }
  }

  return [];
}

