'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  openOfflineDb,
  getPendingTransactions,
  getPendingTransactionsCount,
  updateTransactionStatus,
  removeSyncedTransaction,
  updateLocalCustomerBalance,
  OfflineTransaction,
} from './db';

export type ConnectivityStatus = 'online' | 'offline' | 'syncing' | 'synced' | 'error';

export interface SyncState {
  isOnline: boolean;
  status: ConnectivityStatus;
  pendingCount: number;
  lastSyncTime: number | null;
  lastError: string | null;
}

// Global listeners and singleton sync state
type Listener = (state: SyncState) => void;
const listeners = new Set<Listener>();

let globalSyncState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  status: typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'online',
  pendingCount: 0,
  lastSyncTime: null,
  lastError: null,
};

let isSyncInProgress = false;

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener({ ...globalSyncState });
    } catch (e) {
      console.error('Error notifying sync listener:', e);
    }
  }
}

/**
 * Checks actual connectivity via pinging backend health endpoint.
 * Detects captive portals, dead Wi-Fi, or server unreachability.
 */
export async function checkActualConnectivity(): Promise<boolean> {
  if (typeof window === 'undefined') return true;
  if (!navigator.onLine) return false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('/api/sync/transactions', {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Executes synchronization of all pending offline transactions for the business.
 * Handles duplicate protection, retries, and atomic local state updates.
 */
export async function triggerSynchronization(businessId: string): Promise<{
  syncedCount: number;
  errorsCount: number;
}> {
  if (!businessId || isSyncInProgress) {
    return { syncedCount: 0, errorsCount: 0 };
  }

  // 1. Verify we have pending items
  const pending = await getPendingTransactions(businessId);
  if (pending.length === 0) {
    globalSyncState = {
      ...globalSyncState,
      status: globalSyncState.isOnline ? 'synced' : 'offline',
      pendingCount: 0,
    };
    notifyListeners();
    return { syncedCount: 0, errorsCount: 0 };
  }

  isSyncInProgress = true;
  globalSyncState = {
    ...globalSyncState,
    status: 'syncing',
    pendingCount: pending.length,
    lastError: null,
  };
  notifyListeners();

  try {
    // 2. Transmit batch to backend sync endpoint
    const response = await fetch('/api/sync/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactions: pending,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync server responded with status ${response.status}`);
    }

    const data = await response.json();
    const syncedItems: Array<{ clientTxId: string; serverTxId?: string; newBalance?: number }> = data.synced || [];
    const errorItems: Array<{ clientTxId: string; error: string }> = data.errors || [];

    // 3. Mark synced items in IndexedDB
    for (const item of syncedItems) {
      await updateTransactionStatus(item.clientTxId, 'synced', {
        serverTxId: item.serverTxId,
      });

      // Update local customer balance if authoritative server balance returned
      const originalTx = pending.find((t) => t.clientTxId === item.clientTxId);
      if (originalTx && typeof item.newBalance === 'number') {
        await updateLocalCustomerBalance(businessId, originalTx.customerId, item.newBalance);
      }

      // Prune synced item from queue after slight delay so UI shows sync completion
      setTimeout(async () => {
        try {
          await removeSyncedTransaction(item.clientTxId);
          const remaining = await getPendingTransactionsCount(businessId);
          globalSyncState.pendingCount = remaining;
          notifyListeners();
        } catch {}
      }, 3000);
    }

    // 4. Update failed items
    for (const errItem of errorItems) {
      await updateTransactionStatus(errItem.clientTxId, 'failed', {
        errorMessage: errItem.error,
        retryCountIncrement: true,
      });
    }

    const remainingCount = await getPendingTransactionsCount(businessId);
    globalSyncState = {
      ...globalSyncState,
      isOnline: true,
      status: remainingCount > 0 ? (errorItems.length > 0 ? 'error' : 'online') : 'synced',
      pendingCount: remainingCount,
      lastSyncTime: Date.now(),
      lastError: errorItems.length > 0 ? `${errorItems.length} transactions failed to sync.` : null,
    };
    notifyListeners();

    return {
      syncedCount: syncedItems.length,
      errorsCount: errorItems.length,
    };
  } catch (err: any) {
    console.warn('Network sync failed (will retry automatically):', err);
    const count = await getPendingTransactionsCount(businessId);
    globalSyncState = {
      ...globalSyncState,
      status: 'offline',
      pendingCount: count,
      lastError: err?.message || 'Sync failed due to network error.',
    };
    notifyListeners();
    return { syncedCount: 0, errorsCount: pending.length };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Initializes global browser connectivity listeners and periodic auto-sync.
 */
let isInitialized = false;

export function initOfflineSyncEngine(activeBusinessId: string) {
  if (typeof window === 'undefined' || isInitialized) return;
  isInitialized = true;

  const handleOnline = async () => {
    const reallyOnline = await checkActualConnectivity();
    if (reallyOnline) {
      globalSyncState.isOnline = true;
      globalSyncState.status = 'syncing';
      notifyListeners();
      await triggerSynchronization(activeBusinessId);
    }
  };

  const handleOffline = () => {
    globalSyncState.isOnline = false;
    globalSyncState.status = 'offline';
    notifyListeners();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Initial pending count inspection
  getPendingTransactionsCount(activeBusinessId).then((count) => {
    globalSyncState.pendingCount = count;
    if (!navigator.onLine) {
      globalSyncState.status = 'offline';
      globalSyncState.isOnline = false;
    }
    notifyListeners();
    if (navigator.onLine && count > 0) {
      triggerSynchronization(activeBusinessId);
    }
  });

  // Periodic heartbeat every 20 seconds: checks actual internet and auto-syncs pending transactions
  const intervalId = setInterval(async () => {
    const isConn = await checkActualConnectivity();
    if (isConn !== globalSyncState.isOnline) {
      globalSyncState.isOnline = isConn;
      if (!isConn) {
        globalSyncState.status = 'offline';
      }
      notifyListeners();
    }

    if (isConn) {
      const count = await getPendingTransactionsCount(activeBusinessId);
      globalSyncState.pendingCount = count;
      if (count > 0 && !isSyncInProgress) {
        await triggerSynchronization(activeBusinessId);
      }
    }
  }, 20000);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    clearInterval(intervalId);
  };
}

/**
 * React Hook for any component to access live connectivity and sync state.
 */
export function useOfflineSync(businessId: string) {
  const [syncState, setSyncState] = useState<SyncState>(globalSyncState);
  const activeBizIdRef = useRef(businessId);
  activeBizIdRef.current = businessId;

  useEffect(() => {
    if (!businessId) return;

    initOfflineSyncEngine(businessId);

    const listener: Listener = (newState) => {
      setSyncState(newState);
    };

    listeners.add(listener);

    // Initial count refresh for this business
    getPendingTransactionsCount(businessId).then((count) => {
      globalSyncState.pendingCount = count;
      notifyListeners();
    });

    return () => {
      listeners.delete(listener);
    };
  }, [businessId]);

  const forceSync = useCallback(() => {
    return triggerSynchronization(activeBizIdRef.current);
  }, []);

  return {
    ...syncState,
    forceSync,
  };
}
