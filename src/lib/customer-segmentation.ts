/**
 * Hbibna Customer Segmentation Engine
 * 
 * Automatically segments customers based on shopping frequency,
 * recency, and accumulated loyalty points:
 * - VIP: High points (>= 200) or high frequency (>= 5 visits)
 * - Regular (Fidèle): Active within last 30 days and >= 2 visits
 * - At Risk (À relancer): No activity in the last 30 days
 * - New (Nouveau): Registered in the last 14 days and <= 1 visit
 */

import type { Customer, Transaction } from '@/types/database';

export type CustomerSegmentKey = 'all' | 'vip' | 'regular' | 'at_risk' | 'new';

export interface CustomerSegmentMeta {
  key: CustomerSegmentKey;
  labelFr: string;
  labelAr: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export const SEGMENT_METAS: Record<Exclude<CustomerSegmentKey, 'all'>, CustomerSegmentMeta> = {
  vip: {
    key: 'vip',
    labelFr: 'VIP',
    labelAr: 'عميل مميز',
    badgeBg: 'bg-[#FFE600]',
    badgeText: 'text-black',
    borderClass: 'border-black',
  },
  regular: {
    key: 'regular',
    labelFr: 'Régulier',
    labelAr: 'عميل وفيّ',
    badgeBg: 'bg-[#FFF9D2]',
    badgeText: 'text-black',
    borderClass: 'border-black',
  },
  at_risk: {
    key: 'at_risk',
    labelFr: 'À relancer',
    labelAr: 'غائب / للتواصل',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    borderClass: 'border-rose-400',
  },
  new: {
    key: 'new',
    labelFr: 'Nouveau',
    labelAr: 'جديد',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
    borderClass: 'border-sky-400',
  },
};

export interface CustomerAnalysis {
  customer: Customer;
  visitCount: number;
  lastVisitDate: Date;
  daysSinceLastVisit: number;
  daysSinceRegistration: number;
  segment: Exclude<CustomerSegmentKey, 'all'>;
  meta: CustomerSegmentMeta;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function analyzeCustomer(
  customer: Customer,
  transactions: Transaction[] = []
): CustomerAnalysis {
  const now = Date.now();
  const customerTxs = transactions.filter((t) => t.customer_id === customer.id);
  const visitCount = customerTxs.length;

  // Compute registration recency
  const regDate = customer.created_at ? new Date(customer.created_at) : new Date();
  const daysSinceRegistration = Math.max(0, Math.floor((now - regDate.getTime()) / (24 * 60 * 60 * 1000)));

  // Compute last visit date
  let lastVisitDate = regDate;
  if (customerTxs.length > 0) {
    const dates = customerTxs
      .map((t) => (t.created_at ? new Date(t.created_at).getTime() : 0))
      .filter((t) => t > 0);
    if (dates.length > 0) {
      lastVisitDate = new Date(Math.max(...dates));
    }
  }

  const daysSinceLastVisit = Math.max(0, Math.floor((now - lastVisitDate.getTime()) / (24 * 60 * 60 * 1000)));

  // Segmentation Rules
  let segment: Exclude<CustomerSegmentKey, 'all'> = 'regular';

  if (customer.points_balance >= 200 || visitCount >= 5) {
    segment = 'vip';
  } else if (daysSinceRegistration <= 14 && visitCount <= 1) {
    segment = 'new';
  } else if (daysSinceLastVisit > 30) {
    segment = 'at_risk';
  } else {
    segment = 'regular';
  }

  return {
    customer,
    visitCount,
    lastVisitDate,
    daysSinceLastVisit,
    daysSinceRegistration,
    segment,
    meta: SEGMENT_METAS[segment],
  };
}

export function computeSegmentCounts(
  customers: Customer[],
  transactions: Transaction[] = []
): Record<CustomerSegmentKey, number> {
  const counts: Record<CustomerSegmentKey, number> = {
    all: customers.length,
    vip: 0,
    regular: 0,
    at_risk: 0,
    new: 0,
  };

  customers.forEach((c) => {
    const analysis = analyzeCustomer(c, transactions);
    counts[analysis.segment] += 1;
  });

  return counts;
}
