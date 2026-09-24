export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled';
export type UserRole = 'owner' | 'manager' | 'cashier';
export type LoyaltyRuleType = 'per_purchase' | 'per_currency';
export type TransactionType = 'earn' | 'adjustment' | 'redeem';

export interface Business {
  id: string;
  name: string;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  subscription_status: SubscriptionStatus;
  plan_name: string;
  plan_price_da: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  business_id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  points_balance: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerBusinessMembership {
  id: string;
  customer_id: string;
  business_id: string;
  points_balance: number;
  created_at: string;
  updated_at: string;
  business?: Business;
  customer?: Customer;
}

export interface LoyaltyProgram {
  id: string;
  business_id: string;
  name: string;
  rule_type: LoyaltyRuleType;
  points_per_purchase: number;
  points_per_currency: number;
  currency_unit: number;
  created_at: string;
  updated_at: string;
}

export interface Reward {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  points_required: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  customer_id: string;
  type: TransactionType;
  amount: number;
  points: number;
  description: string | null;
  created_at: string;
  customer?: {
    name: string;
    phone: string;
  };
}

export interface Redemption {
  id: string;
  business_id: string;
  customer_id: string;
  reward_id: string;
  points_used: number;
  created_at: string;
  reward?: Reward;
  customer?: Customer;
}

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: Business;
        Insert: Omit<Business, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Business, 'id'>>;
      };
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<UserProfile, 'id'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'points_balance'> & {
          id?: string;
          points_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Customer, 'id'>>;
      };
      customer_businesses: {
        Row: CustomerBusinessMembership;
        Insert: Omit<CustomerBusinessMembership, 'id' | 'created_at' | 'updated_at' | 'points_balance' | 'business' | 'customer'> & {
          id?: string;
          points_balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CustomerBusinessMembership, 'id' | 'business' | 'customer'>>;
      };
      loyalty_programs: {
        Row: LoyaltyProgram;
        Insert: Omit<LoyaltyProgram, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<LoyaltyProgram, 'id'>>;
      };
      rewards: {
        Row: Reward;
        Insert: Omit<Reward, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Reward, 'id'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at' | 'customer'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Transaction, 'id'>>;
      };
      redemptions: {
        Row: Redemption;
        Insert: Omit<Redemption, 'id' | 'created_at' | 'reward' | 'customer'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Redemption, 'id'>>;
      };
    };
    Functions: {
      record_purchase_and_award_points: {
        Args: {
          p_business_id: string;
          p_customer_id: string;
          p_amount: number;
          p_custom_description?: string | null;
        };
        Returns: {
          success: boolean;
          transaction_id: string;
          points_awarded: number;
          new_balance: number;
        };
      };
      redeem_reward: {
        Args: {
          p_business_id: string;
          p_customer_id: string;
          p_reward_id: string;
        };
        Returns: {
          success: boolean;
          redemption_id: string;
          reward_name: string;
          points_used: number;
          new_balance: number;
        };
      };
    };
  };
}
