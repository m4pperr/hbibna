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
  name: 'Café El Bahia',
  logo_url: null,
  email: 'contact@elbahia-cafe.dz',
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
// 3. BUSINESS A (Café El Bahia) CUSTOMERS
// Notice: Café El Bahia only sees Sarah's points at Café El Bahia (1,250).
// Café El Bahia has ZERO awareness of Beauty Studio or Restaurant XYZ.
// ---------------------------------------------------------------------------
export const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 'c1-sarah',
    business_id: DEFAULT_BUSINESS.id,
    name: 'Sarah Benali',
    phone: '0555 12 34 56',
    email: 'sarah.benali@example.com',
    points_balance: 1250,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2-amine',
    business_id: DEFAULT_BUSINESS.id,
    name: 'Amine Haddad',
    phone: '0661 22 33 44',
    email: 'amine@example.com',
    points_balance: 850,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3-yasmine',
    business_id: DEFAULT_BUSINESS.id,
    name: 'Yasmine K.',
    phone: '0770 99 88 77',
    email: null,
    points_balance: 350,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// 4. REWARDS PER BUSINESS (Isolated Catalogs)
// ---------------------------------------------------------------------------
export const CAFE_REWARDS: Reward[] = [
  {
    id: 'r1-coffee',
    business_id: DEFAULT_BUSINESS.id,
    name: 'Free Coffee',
    description: 'Enjoy one regular coffee on us.',
    points_required: 500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'r2-dessert',
    business_id: DEFAULT_BUSINESS.id,
    name: 'Free Dessert',
    description: 'Choose any handcrafted cake, tart, or pastry.',
    points_required: 1000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'r3-discount',
    business_id: DEFAULT_BUSINESS.id,
    name: '500 DA Discount',
    description: '500 DA voucher valid on any purchase over 2,000 DA.',
    points_required: 2000,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const BEAUTY_REWARDS: Reward[] = [
  {
    id: 'r4-manicure',
    business_id: BUSINESS_BEAUTY.id,
    name: 'Express Manicure',
    description: 'Nail shaping, cuticle care, and natural polish.',
    points_required: 400,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'r5-hair',
    business_id: BUSINESS_BEAUTY.id,
    name: 'Keratin Hair Treatment',
    description: 'Deep hydration mask and blow-dry styling.',
    points_required: 800,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'r6-facial',
    business_id: BUSINESS_BEAUTY.id,
    name: 'Deluxe Glow Facial',
    description: 'Customized rejuvenating facial with natural serums.',
    points_required: 1500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const RESTAURANT_REWARDS: Reward[] = [
  {
    id: 'r7-mocktail',
    business_id: BUSINESS_RESTAURANT.id,
    name: 'Artisanal Mocktail',
    description: 'Signature freshly pressed tropical mocktail.',
    points_required: 300,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'r8-burger',
    business_id: BUSINESS_RESTAURANT.id,
    name: 'Signature Burger & Fries',
    description: 'Gourmet Angus beef burger with homemade seasoned fries.',
    points_required: 1200,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'r9-dinner',
    business_id: BUSINESS_RESTAURANT.id,
    name: '3-Course Gourmet Dinner',
    description: 'Starter, Chef special main course, and dessert for two.',
    points_required: 2500,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const DEFAULT_REWARDS: Reward[] = CAFE_REWARDS;

// ---------------------------------------------------------------------------
// 5. TRANSACTIONS PER BUSINESS (Isolated Ledgers)
// ---------------------------------------------------------------------------
export const CAFE_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    business_id: DEFAULT_BUSINESS.id,
    customer_id: 'c1-sarah',
    type: 'earn',
    amount: 2500,
    points: 25,
    description: 'Purchase',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
  {
    id: 't2',
    business_id: DEFAULT_BUSINESS.id,
    customer_id: 'c1-sarah',
    type: 'earn',
    amount: 5000,
    points: 50,
    description: 'Purchase',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
  {
    id: 't3',
    business_id: DEFAULT_BUSINESS.id,
    customer_id: 'c1-sarah',
    type: 'redeem',
    amount: 0,
    points: -500,
    description: 'Free Coffee',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
];

export const BEAUTY_TRANSACTIONS: Transaction[] = [
  {
    id: 't-b1',
    business_id: BUSINESS_BEAUTY.id,
    customer_id: 'c1-sarah',
    type: 'earn',
    amount: 4000,
    points: 40,
    description: 'Hair Styling & Blow Dry',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
  {
    id: 't-b2',
    business_id: BUSINESS_BEAUTY.id,
    customer_id: 'c1-sarah',
    type: 'earn',
    amount: 6000,
    points: 60,
    description: 'Manicure & Spa Treatment',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
  {
    id: 't-b3',
    business_id: BUSINESS_BEAUTY.id,
    customer_id: 'c1-sarah',
    type: 'redeem',
    amount: 0,
    points: -300,
    description: 'Express Treatment',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
];

export const RESTAURANT_TRANSACTIONS: Transaction[] = [
  {
    id: 't-r1',
    business_id: BUSINESS_RESTAURANT.id,
    customer_id: 'c1-sarah',
    type: 'earn',
    amount: 8500,
    points: 85,
    description: 'Gourmet Lunch Menu',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
  {
    id: 't-r2',
    business_id: BUSINESS_RESTAURANT.id,
    customer_id: 'c1-sarah',
    type: 'earn',
    amount: 15000,
    points: 150,
    description: 'Family Weekend Dinner',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
  {
    id: 't-r3',
    business_id: BUSINESS_RESTAURANT.id,
    customer_id: 'c1-sarah',
    type: 'redeem',
    amount: 0,
    points: -600,
    description: "Chef's Special Tasting",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    customer: { name: 'Sarah Benali', phone: '0555 12 34 56' },
  },
];

export const DEFAULT_TRANSACTIONS: Transaction[] = CAFE_TRANSACTIONS;

// ---------------------------------------------------------------------------
// 6. CUSTOMER MULTI-BUSINESS MEMBERSHIPS (1, 5, 20+ Businesses Supported)
// Sarah Benali belongs to 22 active businesses with isolated point balances:
// ---------------------------------------------------------------------------
export const ALL_CUSTOMER_BUSINESSES: {
  id: string;
  name: string;
  points: number;
  category: string;
}[] = [
  { id: DEFAULT_BUSINESS.id, name: 'Café El Bahia', points: 1250, category: 'Coffee & Bakery' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Café Central', points: 850, category: 'Café & Lounge' },
  { id: BUSINESS_RESTAURANT.id, name: 'Restaurant XYZ', points: 2100, category: 'Dining & Grill' },
  { id: BUSINESS_BEAUTY.id, name: 'Salon Beauty', points: 640, category: 'Hair & Esthetics' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Pâtisserie La Rose', points: 420, category: 'French Pastry' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Artisan Bakery Oran', points: 1150, category: 'Bakery' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Librairie Moderne', points: 310, category: 'Books & Stationery' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'FitLife Gym & Spa', points: 920, category: 'Fitness & Wellness' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Optique Vision Plus', points: 580, category: 'Eyewear & Care' },
  { id: '00000000-0000-0000-0000-000000000010', name: 'Fleuriste Jasmine', points: 190, category: 'Flowers & Gifts' },
  { id: '00000000-0000-0000-0000-000000000011', name: 'Pizzeria Napoli', points: 760, category: 'Italian Cuisine' },
  { id: '00000000-0000-0000-0000-000000000012', name: 'Boutique Élégance', points: 1400, category: 'Fashion & Apparel' },
  { id: '00000000-0000-0000-0000-000000000013', name: 'Glacier Al-Amir', points: 340, category: 'Artisanal Ice Cream' },
  { id: '00000000-0000-0000-0000-000000000014', name: 'Cyber Café Connect', points: 150, category: 'Internet & Work' },
  { id: '00000000-0000-0000-0000-000000000015', name: 'Clinique Dentaire Sourire', points: 800, category: 'Dental Care' },
  { id: '00000000-0000-0000-0000-000000000016', name: 'Auto Wash Express', points: 490, category: 'Car Detailing' },
  { id: '00000000-0000-0000-0000-000000000017', name: 'Superette El Baraka', points: 1670, category: 'Grocery & Market' },
  { id: '00000000-0000-0000-0000-000000000018', name: 'Café des Arts', points: 610, category: 'Coffee & Books' },
  { id: '00000000-0000-0000-0000-000000000019', name: 'Parfumerie Royale', points: 1850, category: 'Luxury Fragrance' },
  { id: '00000000-0000-0000-0000-000000000020', name: 'Gourmet Burger Co.', points: 980, category: 'Burgers & Shakes' },
  { id: '00000000-0000-0000-0000-000000000021', name: 'Spa & Hammam Andalou', points: 2300, category: 'Baths & Relaxation' },
  { id: '00000000-0000-0000-0000-000000000022', name: 'Café Panorama', points: 730, category: 'Rooftop Lounge' },
];

export const SARAH_MEMBERSHIPS: CustomerBusinessMembership[] = ALL_CUSTOMER_BUSINESSES.map((b, idx) => ({
  id: `mem-${idx + 1}`,
  customer_id: 'c1-sarah',
  business_id: b.id,
  points_balance: b.points,
  created_at: new Date(Date.now() - 86400000 * (10 + idx * 5)).toISOString(),
  updated_at: new Date().toISOString(),
  business: {
    id: b.id,
    name: b.name,
    logo_url: null,
    email: `contact@${b.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.dz`,
    phone: `0550 ${String(10 + idx).padStart(2, '0')} 00 00`,
    subscription_status: 'active',
    plan_name: 'Hbibna Business',
    plan_price_da: 9800,
    currency: 'DA',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
}));

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

  // Graceful fallback to multi-business mock data for development & preview
  let customer: Customer = DEFAULT_CUSTOMERS[0];
  if (phone) {
    const found = DEFAULT_CUSTOMERS.find(
      (c) => c.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '')
    );
    if (found) customer = found;
  } else if (customerId) {
    const found = DEFAULT_CUSTOMERS.find((c) => c.id === customerId);
    if (found) customer = found;
  }

  // Get all memberships belonging to this customer
  const memberships = SARAH_MEMBERSHIPS;

  // Active membership: selected via businessId or default to the first one (Café El Bahia)
  let activeMembership = memberships[0];
  if (businessId) {
    const found = memberships.find((m) => m.business_id === businessId);
    if (found) activeMembership = found;
  }

  const activeBizData = getOrGenerateBusinessData(activeMembership);

  return {
    customer,
    memberships,
    activeMembership,
    rewards: activeBizData.rewards,
    transactions: activeBizData.transactions,
    business: activeBizData.business,
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
  try {
    if (isSupabaseConfigured()) {
      const supabase = await createClient();
      const { data: businesses, error: bizError } = await supabase
        .from('businesses')
        .select('id, name, logo_url, phone')
        .eq('subscription_status', 'active');

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
              category: 'Partner Merchant',
              logo_url: b.logo_url,
              phone: b.phone,
              rewards: rewardsByBiz[b.id] || [],
            }))
            .filter((b) => b.rewards.length > 0);
        }
      }
    }
  } catch (err) {
    console.warn('Error fetching public rewards from Supabase, using local catalog:', err);
  }

  // Fallback to local partner businesses and their catalogs (strictly public, zero customer data)
  const defaultList: PublicBusinessCatalogItem[] = [
    {
      id: DEFAULT_BUSINESS.id,
      name: DEFAULT_BUSINESS.name,
      category: 'Artisanal Café',
      logo_url: DEFAULT_BUSINESS.logo_url,
      phone: DEFAULT_BUSINESS.phone,
      rewards: CAFE_REWARDS.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        points_required: r.points_required,
      })),
    },
    {
      id: BUSINESS_BEAUTY.id,
      name: BUSINESS_BEAUTY.name,
      category: 'Beauty & Wellness',
      logo_url: BUSINESS_BEAUTY.logo_url,
      phone: BUSINESS_BEAUTY.phone,
      rewards: BEAUTY_REWARDS.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        points_required: r.points_required,
      })),
    },
    {
      id: BUSINESS_RESTAURANT.id,
      name: BUSINESS_RESTAURANT.name,
      category: 'Fine Dining & Grill',
      logo_url: BUSINESS_RESTAURANT.logo_url,
      phone: BUSINESS_RESTAURANT.phone,
      rewards: RESTAURANT_REWARDS.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        points_required: r.points_required,
      })),
    },
  ];

  // Add other partner businesses with catalogs
  ALL_CUSTOMER_BUSINESSES.slice(3).forEach((item) => {
    const bizData = getOrGenerateBusinessData({
      id: `mem-${item.id}`,
      customer_id: '',
      business_id: item.id,
      points_balance: 0,
      created_at: '',
      updated_at: '',
      business: {
        id: item.id,
        name: item.name,
        logo_url: null,
        email: null,
        phone: null,
        subscription_status: 'active',
        plan_name: 'Hbibna Business',
        plan_price_da: 9800,
        currency: 'DA',
        created_at: '',
        updated_at: '',
      },
    });

    defaultList.push({
      id: item.id,
      name: item.name,
      category: item.category,
      logo_url: null,
      phone: null,
      rewards: bizData.rewards.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        points_required: r.points_required,
      })),
    });
  });

  return defaultList;
}

