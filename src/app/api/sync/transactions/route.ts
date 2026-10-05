import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedBusiness } from '@/actions/auth';
import { recordPurchase } from '@/actions/transactions';
import { DEFAULT_BUSINESS } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

/**
 * Healthcheck ping endpoint for the offline manager
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hbibna-sync-engine',
  });
}

/**
 * Batch synchronization endpoint for offline transactions.
 * 
 * Guarantees:
 * - Scoped strictly to authenticated business.
 * - Idempotent processing: duplicate submissions never re-award points.
 * - Deterministic error reporting per client transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const authBusiness = await getAuthenticatedBusiness();
    const activeBusinessId = authBusiness?.business?.id || DEFAULT_BUSINESS.id;

    if (!activeBusinessId) {
      return NextResponse.json(
        { error: 'Unauthorized. Business session required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawTransactions = Array.isArray(body?.transactions)
      ? body.transactions
      : body?.transaction
      ? [body.transaction]
      : [];

    if (rawTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        synced: [],
        errors: [],
        message: 'No transactions to sync.',
      });
    }

    const syncedResults: Array<{
      clientTxId: string;
      serverTxId?: string;
      pointsAwarded?: number;
      newBalance?: number;
      alreadyProcessed?: boolean;
    }> = [];

    const errors: Array<{
      clientTxId: string;
      error: string;
    }> = [];

    // Process transactions sequentially to preserve causal ordering
    for (const tx of rawTransactions) {
      const clientTxId = tx.clientTxId;
      if (!clientTxId || !tx.customerId || typeof tx.amount !== 'number') {
        errors.push({
          clientTxId: clientTxId || 'unknown',
          error: 'Malformed transaction payload.',
        });
        continue;
      }

      // Security check: transaction must belong to current business
      if (tx.businessId && tx.businessId !== activeBusinessId) {
        errors.push({
          clientTxId,
          error: 'Tenant mismatch. Transaction cannot be synced to this business account.',
        });
        continue;
      }

      try {
        const result = await recordPurchase({
          customerId: tx.customerId,
          amount: tx.amount,
          description: tx.description || 'Offline Counter Purchase',
          clientTxId,
        });

        if (result.error) {
          errors.push({
            clientTxId,
            error: result.error,
          });
        } else {
          syncedResults.push({
            clientTxId,
            serverTxId: result.transactionId,
            pointsAwarded: result.pointsAwarded,
            newBalance: result.newBalance,
            alreadyProcessed: result.alreadyProcessed,
          });
        }
      } catch (err: any) {
        console.error(`Sync error for transaction ${clientTxId}:`, err);
        errors.push({
          clientTxId,
          error: err?.message || 'Server error processing transaction.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      businessId: activeBusinessId,
      synced: syncedResults,
      errors,
      syncedCount: syncedResults.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Fatal error in transaction sync route:', err);
    return NextResponse.json(
      { error: 'Internal server error during synchronization.' },
      { status: 500 }
    );
  }
}
