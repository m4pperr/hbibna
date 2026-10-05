-- ==============================================================================
-- Hbibna Multi-Tenant Loyalty Platform - Production Database Schema & RLS
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BUSINESSES TABLE
create table if not exists public.businesses (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    logo_url text,
    email text,
    phone text,
    subscription_status text not null default 'pending_payment' check (subscription_status in ('trial', 'active', 'past_due', 'cancelled', 'pending_payment')),
    plan_name text not null default 'Hbibna Pro',
    plan_price_da integer not null default 9800,
    currency text not null default 'DA',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. USERS (STAFF / OWNERS) TABLE
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    business_id uuid not null references public.businesses(id) on delete cascade,
    name text not null,
    email text not null,
    role text not null default 'owner' check (role in ('owner', 'manager', 'cashier')),
    created_at timestamptz not null default now()
);

-- 3. CUSTOMERS TABLE (Global Customer Identity)
create table if not exists public.customers (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid references auth.users(id) on delete set null,
    business_id uuid references public.businesses(id) on delete cascade,
    name text not null,
    phone text not null,
    email text,
    points_balance integer not null default 0 check (points_balance >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_customer_business_phone unique (business_id, phone)
);

-- 3b. CUSTOMER_BUSINESSES TABLE (Isolated Per-Business Loyalty Memberships)
-- A customer can belong to multiple businesses, but each membership is strictly isolated.
create table if not exists public.customer_businesses (
    id uuid primary key default gen_random_uuid(),
    customer_id uuid not null references public.customers(id) on delete cascade,
    business_id uuid not null references public.businesses(id) on delete cascade,
    points_balance integer not null default 0 check (points_balance >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_customer_business unique (customer_id, business_id)
);

-- 4. LOYALTY PROGRAMS (RULES CONFIGURATION)
create table if not exists public.loyalty_programs (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade unique,
    name text not null default 'Hbibna Loyalty Program',
    rule_type text not null check (rule_type in ('per_purchase', 'per_currency')),
    points_per_purchase integer not null default 10 check (points_per_purchase >= 0),
    points_per_currency integer not null default 1 check (points_per_currency >= 0),
    currency_unit integer not null default 100 check (currency_unit > 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 5. REWARDS TABLE
create table if not exists public.rewards (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    name text not null,
    description text,
    points_required integer not null check (points_required > 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 6. TRANSACTIONS TABLE (POINTS EARNED & ADJUSTMENTS)
create table if not exists public.transactions (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    type text not null check (type in ('earn', 'adjustment', 'redeem')),
    amount numeric(12, 2) not null default 0.00,
    points integer not null,
    description text,
    created_at timestamptz not null default now()
);

-- 7. REDEMPTIONS TABLE
create table if not exists public.redemptions (
    id uuid primary key default gen_random_uuid(),
    business_id uuid not null references public.businesses(id) on delete cascade,
    customer_id uuid not null references public.customers(id) on delete cascade,
    reward_id uuid not null references public.rewards(id) on delete restrict,
    points_used integer not null check (points_used > 0),
    created_at timestamptz not null default now()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_users_business_id on public.users(business_id);
create index if not exists idx_customers_business_id on public.customers(business_id);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_cust_biz_customer_id on public.customer_businesses(customer_id);
create index if not exists idx_cust_biz_business_id on public.customer_businesses(business_id);
create index if not exists idx_loyalty_business_id on public.loyalty_programs(business_id);
create index if not exists idx_rewards_business_id on public.rewards(business_id);
create index if not exists idx_transactions_business_id on public.transactions(business_id);
create index if not exists idx_transactions_customer_id on public.transactions(customer_id);
create index if not exists idx_redemptions_business_id on public.redemptions(business_id);
create index if not exists idx_redemptions_customer_id on public.redemptions(customer_id);

-- ==============================================================================
-- ATOMIC STORED PROCEDURES & CALCULATION ENGINES
-- ==============================================================================

-- 1. Function to record purchase, calculate points server-side, insert transaction, update balance
create or replace function public.record_purchase_and_award_points(
    p_business_id uuid,
    p_customer_id uuid,
    p_amount numeric,
    p_custom_description text default null
)
returns json
language plpgsql
security definer
as $$
declare
    v_rule record;
    v_points_to_award integer := 0;
    v_new_balance integer := 0;
    v_transaction_id uuid;
    v_desc text;
begin
    -- Verify customer belongs to business
    if not exists (select 1 from public.customers where id = p_customer_id and business_id = p_business_id) then
        raise exception 'Customer not found or does not belong to this business.';
    end if;

    -- Fetch loyalty rule
    select * into v_rule from public.loyalty_programs where business_id = p_business_id;
    if not found then
        -- Default to 10 points per purchase if not configured
        v_points_to_award := 10;
    elsif v_rule.rule_type = 'per_purchase' then
        v_points_to_award := v_rule.points_per_purchase;
    elsif v_rule.rule_type = 'per_currency' then
        if p_amount <= 0 then
            v_points_to_award := 0;
        else
            v_points_to_award := floor(p_amount / v_rule.currency_unit)::integer * v_rule.points_per_currency;
        end if;
    else
        v_points_to_award := 0;
    end if;

    v_desc := coalesce(p_custom_description, 'Purchase of ' || p_amount || ' DA (' || v_points_to_award || ' points)');

    -- Insert transaction
    insert into public.transactions (business_id, customer_id, type, amount, points, description)
    values (p_business_id, p_customer_id, 'earn', p_amount, v_points_to_award, v_desc)
    returning id into v_transaction_id;

    -- Atomically update customer balance
    update public.customers
    set points_balance = points_balance + v_points_to_award,
        updated_at = now()
    where id = p_customer_id
    returning points_balance into v_new_balance;

    return json_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'points_awarded', v_points_to_award,
        'new_balance', v_new_balance
    );
end;
$$;

-- 2. Function to redeem reward atomically
create or replace function public.redeem_reward(
    p_business_id uuid,
    p_customer_id uuid,
    p_reward_id uuid
)
returns json
language plpgsql
security definer
as $$
declare
    v_reward record;
    v_customer record;
    v_redemption_id uuid;
    v_new_balance integer := 0;
begin
    -- Fetch active reward
    select * into v_reward from public.rewards
    where id = p_reward_id and business_id = p_business_id and is_active = true;

    if not found then
        raise exception 'Reward is invalid, inactive, or not found.';
    end if;

    -- Fetch customer balance
    select * into v_customer from public.customers
    where id = p_customer_id and business_id = p_business_id
    for update;

    if not found then
        raise exception 'Customer not found.';
    end if;

    if v_customer.points_balance < v_reward.points_required then
        raise exception 'Insufficient points balance. Customer has % points, requires % points.',
            v_customer.points_balance, v_reward.points_required;
    end if;

    -- Record redemption
    insert into public.redemptions (business_id, customer_id, reward_id, points_used)
    values (p_business_id, p_customer_id, p_reward_id, v_reward.points_required)
    returning id into v_redemption_id;

    -- Record ledger transaction
    insert into public.transactions (business_id, customer_id, type, amount, points, description)
    values (
        p_business_id,
        p_customer_id,
        'redeem',
        0,
        -v_reward.points_required,
        'Redeemed: ' || v_reward.name
    );

    -- Deduct customer points
    update public.customers
    set points_balance = points_balance - v_reward.points_required,
        updated_at = now()
    where id = p_customer_id
    returning points_balance into v_new_balance;

    return json_build_object(
        'success', true,
        'redemption_id', v_redemption_id,
        'reward_name', v_reward.name,
        'points_used', v_reward.points_required,
        'new_balance', v_new_balance
    );
end;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Helper function to get current user's business_id from public.users
create or replace function public.get_auth_business_id()
returns uuid
language sql
stable
security definer
as $$
  select business_id from public.users where id = auth.uid();
$$;

-- Enable RLS on all tenant tables
alter table public.businesses enable row level security;
alter table public.users enable row level security;
alter table public.customers enable row level security;
alter table public.loyalty_programs enable row level security;
alter table public.rewards enable row level security;
alter table public.transactions enable row level security;
alter table public.redemptions enable row level security;
alter table public.customer_businesses enable row level security;

-- Businesses Policies
create policy "Users can view their own business"
on public.businesses for select
using (id = public.get_auth_business_id());

create policy "Users can update their own business"
on public.businesses for update
using (id = public.get_auth_business_id());

-- Users Policies
create policy "Users can view team members of their business"
on public.users for select
using (id = auth.uid() or business_id = public.get_auth_business_id());

create policy "Users can insert profile during signup"
on public.users for insert
with check (id = auth.uid());

-- ==============================================================================
-- BUSINESS ONBOARDING ATOMIC FUNCTION
-- ==============================================================================
create or replace function public.handle_business_signup(
    p_user_id uuid,
    p_business_name text,
    p_owner_name text,
    p_email text,
    p_phone text default null
)
returns json
language plpgsql
security definer
as $$
declare
    v_business_id uuid;
    v_loyalty_id uuid;
begin
    -- 1. Create Business Record
    insert into public.businesses (
        name,
        email,
        phone,
        subscription_status,
        plan_name,
        plan_price_da,
        currency
    )
    values (
        p_business_name,
        p_email,
        p_phone,
        'pending_payment',
        'Hbibna Business',
        9800,
        'DA'
    )
    returning id into v_business_id;

    -- 2. Create User / Profile linked to the business
    insert into public.users (
        id,
        business_id,
        name,
        email,
        role
    )
    values (
        p_user_id,
        v_business_id,
        p_owner_name,
        p_email,
        'owner'
    );

    -- 3. Create Default Loyalty Program (1 point per 100 DA spent)
    insert into public.loyalty_programs (
        business_id,
        name,
        rule_type,
        points_per_currency,
        currency_unit,
        points_per_purchase
    )
    values (
        v_business_id,
        p_business_name || ' Loyalty Club',
        'per_currency',
        1,
        100,
        10
    )
    returning id into v_loyalty_id;

    -- 4. Create Starter Rewards
    insert into public.rewards (
        business_id,
        name,
        description,
        points_required,
        is_active
    )
    values
    (
        v_business_id,
        'Welcome Drink / Coffee',
        'Complimentary beverage of choice from the counter.',
        50,
        true
    ),
    (
        v_business_id,
        '500 DA Counter Discount',
        '500 DA cash discount on orders over 2,000 DA.',
        100,
        true
    );

    return json_build_object(
        'success', true,
        'business_id', v_business_id,
        'loyalty_id', v_loyalty_id
    );
end;
$$;
create policy "Businesses can select their own customers"
on public.customers for select
using (business_id = public.get_auth_business_id());

create policy "Businesses can insert their own customers"
on public.customers for insert
with check (business_id = public.get_auth_business_id());

create policy "Businesses can update their own customers"
on public.customers for update
using (business_id = public.get_auth_business_id());

create policy "Businesses can delete their own customers"
on public.customers for delete
using (business_id = public.get_auth_business_id());

-- Loyalty Programs Policies
create policy "Businesses can view their loyalty program"
on public.loyalty_programs for select
using (business_id = public.get_auth_business_id());

create policy "Businesses can update their loyalty program"
on public.loyalty_programs for update
using (business_id = public.get_auth_business_id());

create policy "Businesses can insert their loyalty program"
on public.loyalty_programs for insert
with check (business_id = public.get_auth_business_id());

-- Rewards Policies
create policy "Businesses can manage their rewards"
on public.rewards for all
using (business_id = public.get_auth_business_id());

-- Transactions Policies
create policy "Businesses can view their transactions"
on public.transactions for select
using (business_id = public.get_auth_business_id());

create policy "Businesses can insert their transactions"
on public.transactions for insert
with check (business_id = public.get_auth_business_id());

-- Redemptions Policies
create policy "Businesses can view their redemptions"
on public.redemptions for select
using (business_id = public.get_auth_business_id());

create policy "Businesses can insert redemptions"
on public.redemptions for insert
with check (business_id = public.get_auth_business_id());

-- ==============================================================================
-- STRICT CUSTOMER_BUSINESSES MEMBERSHIP ISOLATION POLICIES
-- ==============================================================================

-- 1. BUSINESS VIEW ISOLATION:
-- A business user authenticated for Business A can ONLY retrieve memberships belonging to Business A.
-- They CANNOT query or discover whether the customer belongs to Business B, C, or any other business.
create policy "Business can only view its own customer memberships"
on public.customer_businesses for select
using (business_id = public.get_auth_business_id());

create policy "Business can insert memberships for its business"
on public.customer_businesses for insert
with check (business_id = public.get_auth_business_id());

create policy "Business can update memberships for its business"
on public.customer_businesses for update
using (business_id = public.get_auth_business_id());

create policy "Business can delete memberships for its business"
on public.customer_businesses for delete
using (business_id = public.get_auth_business_id());

-- 2. CUSTOMER VIEW:
-- The authenticated customer can retrieve all of their own memberships across all businesses they belong to.
-- Customer John can retrieve John -> Business A, John -> Business B, John -> Business C,
-- but cannot retrieve memberships belonging to other customers.
create policy "Customer can view their own memberships across businesses"
on public.customer_businesses for select
using (
  customer_id in (
    select id from public.customers
    where auth_user_id = auth.uid() or id = auth.uid()
  )
);

-- ==============================================================================
-- PRIVACY-PRESERVING CUSTOMER & TRANSACTION POLICIES
-- ==============================================================================

-- Customer profile lookup:
-- A customer can view their own profile; businesses can only view customers enrolled in their business.
create policy "Customer can view own profile"
on public.customers for select
using (
  auth_user_id = auth.uid() 
  or id = auth.uid() 
  or id in (
    select customer_id from public.customer_businesses 
    where business_id = public.get_auth_business_id()
  )
);

-- Customer transaction lookup:
-- Customers can view only their own transactions. Businesses can view only transactions for their business.
create policy "Customer can view own transactions"
on public.transactions for select
using (
  customer_id in (
    select id from public.customers 
    where auth_user_id = auth.uid() or id = auth.uid()
  )
);

-- Active rewards lookup for customer portal:
create policy "Customer can view active rewards"
on public.rewards for select
using (is_active = true);

-- Public business info lookup for loyalty passes:
create policy "Public customer business info lookup"
on public.businesses for select
using (true);
