import type { LoyaltyProgram } from '@/types/database';

export interface PointCalculationResult {
  points: number;
  explanation: string;
}

/**
 * Calculates loyalty points based on business rule configuration.
 * Always run server-side to prevent client tampering.
 */
export function calculateLoyaltyPoints(
  rule: Pick<LoyaltyProgram, 'rule_type' | 'points_per_purchase' | 'points_per_currency' | 'currency_unit'>,
  purchaseAmount: number
): PointCalculationResult {
  if (rule.rule_type === 'per_purchase') {
    const points = Math.max(0, Math.floor(rule.points_per_purchase));
    return {
      points,
      explanation: `${points} points per purchase`,
    };
  }

  // per_currency unit (e.g., 1 point per 100 DA)
  const currencyUnit = rule.currency_unit > 0 ? rule.currency_unit : 100;
  const pointsPerUnit = Math.max(0, rule.points_per_currency || 1);
  const units = Math.floor(Math.max(0, purchaseAmount) / currencyUnit);
  const points = units * pointsPerUnit;

  return {
    points,
    explanation: `${points} points (${pointsPerUnit} pt per ${currencyUnit} DA on ${purchaseAmount.toLocaleString()} DA spent)`,
  };
}
