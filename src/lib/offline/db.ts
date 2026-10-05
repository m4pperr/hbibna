/**
 * Hbibna Offline IndexedDB Storage Layer
 * 
 * Provides robust browser-side persistent storage for offline cashier operations:
 * - Scoped strictly per authenticated business (tenant isolation).
 * - Stores customer loyalty profiles, points balances, and QR tokens.
 * - Stores loyalty rules for offline point calculation.
 * - Manages the pending offline transaction queue with client idempotency keys.
 */

export interface CachedCustomer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  points_balance: number;
  qr_token?: string;
  cached_at: number;
}

export interface CachedLoyaltyRule {
  business_id: string;
  rule_type: 'per_currency' | 'per_purchase';
  points_per_currency: number;
  currency_unit: number;
  points_per_purchase: number;
  cached_at: number;
}

export interface CachedBusiness {
  id: string;
  name: string;
  currency: string;
  plan_name?: string;
  cached_at: number;
}

export interface OfflineTransaction {
  clientTxId: string; // e.g. "offline_1727450000000_abc123"
  businessId: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  amount: number;
  points: number;
  transactionType: 'earn' | 'adjustment' | 'redeem';
  description: string;
  createdAt: string; // ISO string
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  syncedAt?: string;
  serverTxId?: string;
  retryCount: number;
  errorMessage?: string;
}

const DB_NAME = 'hbibna_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openOfflineDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in browser environments.'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Business Cache
      if (!db.objectStoreNames.contains('businesses')) {
        db.createObjectStore('businesses', { keyPath: 'id' });
      }

      // 2. Customers Cache (strictly indexed by business_id)
      if (!db.objectStoreNames.contains('customers')) {
        const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
        customerStore.createIndex('by_business', 'business_id', { unique: false });
        customerStore.createIndex('by_business_phone', ['business_id', 'phone'], { unique: false });
        customerStore.createIndex('by_qr_token', 'qr_token', { unique: false });
      }

      // 3. Loyalty Rules
      if (!db.objectStoreNames.contains('loyalty_rules')) {
        db.createObjectStore('loyalty_rules', { keyPath: 'business_id' });
      }

      // 4. Offline Transaction Queue
      if (!db.objectStoreNames.contains('transaction_queue')) {
        const txStore = db.createObjectStore('transaction_queue', { keyPath: 'clientTxId' });
        txStore.createIndex('by_business_status', ['businessId', 'status'], { unique: false });
        txStore.createIndex('by_business', 'businessId', { unique: false });
        txStore.createIndex('by_status', 'status', { unique: false });
        txStore.createIndex('by_created_at', 'createdAt', { unique: false });
      }

      // 5. Metadata / Settings
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed to open IndexedDB'));
    };

    request.onblocked = () => {
      console.warn('Hbibna IndexedDB upgrade blocked by another open tab.');
    };
  });

  return dbPromise;
}

// ==============================================================================
// BUSINESS CACHE
// ==============================================================================

export async function saveCachedBusiness(business: { id: string; name: string; currency?: string; plan_name?: string }): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('businesses', 'readwrite');
    const store = tx.objectStore('businesses');
    const item: CachedBusiness = {
      id: business.id,
      name: business.name,
      currency: business.currency || 'DA',
      plan_name: business.plan_name,
      cached_at: Date.now(),
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedBusiness(businessId: string): Promise<CachedBusiness | null> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('businesses', 'readonly');
    const store = tx.objectStore('businesses');
    const req = store.get(businessId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// ==============================================================================
// LOYALTY RULES CACHE
// ==============================================================================

export async function saveCachedLoyaltyRule(rule: {
  business_id: string;
  rule_type: 'per_currency' | 'per_purchase';
  points_per_currency?: number;
  currency_unit?: number;
  points_per_purchase?: number;
}): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('loyalty_rules', 'readwrite');
    const store = tx.objectStore('loyalty_rules');
    const item: CachedLoyaltyRule = {
      business_id: rule.business_id,
      rule_type: rule.rule_type || 'per_currency',
      points_per_currency: rule.points_per_currency ?? 1,
      currency_unit: rule.currency_unit ?? 100,
      points_per_purchase: rule.points_per_purchase ?? 10,
      cached_at: Date.now(),
    };
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedLoyaltyRule(businessId: string): Promise<CachedLoyaltyRule | null> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('loyalty_rules', 'readonly');
    const store = tx.objectStore('loyalty_rules');
    const req = store.get(businessId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// ==============================================================================
// CUSTOMER CACHE (SCOPED TO BUSINESS)
// ==============================================================================

export async function saveCachedCustomers(
  businessId: string,
  customers: Array<{ id: string; name: string; phone: string; points_balance: number; business_id?: string }>
): Promise<void> {
  if (!businessId || !customers || customers.length === 0) return;
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readwrite');
    const store = tx.objectStore('customers');
    const now = Date.now();

    for (const c of customers) {
      // Guarantee business isolation
      const targetBizId = c.business_id || businessId;
      if (targetBizId !== businessId) continue;

      const cached: CachedCustomer = {
        id: c.id,
        business_id: businessId,
        name: c.name,
        phone: c.phone,
        points_balance: c.points_balance || 0,
        qr_token: `hbibna:c:${c.id}`,
        cached_at: now,
      };
      store.put(cached);
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedCustomers(businessId: string): Promise<CachedCustomer[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readonly');
    const store = tx.objectStore('customers');
    const index = store.index('by_business');
    const req = index.getAll(businessId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function findCachedCustomerByQr(
  businessId: string,
  token: string
): Promise<CachedCustomer | null> {
  const trimmed = (token || '').trim();
  if (!trimmed) return null;

  // Extract raw ID from format "hbibna:c:<id>"
  let rawId = trimmed;
  if (rawId.startsWith('hbibna:c:')) {
    rawId = rawId.slice('hbibna:c:'.length).trim();
  }

  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readonly');
    const store = tx.objectStore('customers');

    // First try direct ID lookup
    const idReq = store.get(rawId);
    idReq.onsuccess = () => {
      const match = idReq.result as CachedCustomer | undefined;
      if (match && match.business_id === businessId) {
        resolve(match);
        return;
      }

      // If not by ID, try token index
      const qrIndex = store.index('by_qr_token');
      const qrReq = qrIndex.get(trimmed);
      qrReq.onsuccess = () => {
        const qrMatch = qrReq.result as CachedCustomer | undefined;
        if (qrMatch && qrMatch.business_id === businessId) {
          resolve(qrMatch);
          return;
        }

        // Also fallback to phone lookup if cashier entered phone
        const phoneIndex = store.index('by_business_phone');
        const phoneReq = phoneIndex.get([businessId, trimmed]);
        phoneReq.onsuccess = () => {
          const phoneMatch = phoneReq.result as CachedCustomer | undefined;
          resolve(phoneMatch || null);
        };
        phoneReq.onerror = () => resolve(null);
      };
      qrReq.onerror = () => resolve(null);
    };
    idReq.onerror = () => reject(idReq.error);
  });
}

export async function updateLocalCustomerBalance(
  businessId: string,
  customerId: string,
  newBalance: number
): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readwrite');
    const store = tx.objectStore('customers');
    const req = store.get(customerId);

    req.onsuccess = () => {
      const customer = req.result as CachedCustomer | undefined;
      if (customer && customer.business_id === businessId) {
        customer.points_balance = newBalance;
        customer.cached_at = Date.now();
        store.put(customer);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// ==============================================================================
// TRANSACTION QUEUE (IDEMPOTENT OFFLINE TRANSACTIONS)
// ==============================================================================

export function generateClientTransactionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `offline_${timestamp}_${random}`;
}

export async function enqueueOfflineTransaction(txData: Omit<OfflineTransaction, 'status' | 'retryCount'>): Promise<OfflineTransaction> {
  const db = await openOfflineDb();

  const record: OfflineTransaction = {
    ...txData,
    status: 'pending',
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('transaction_queue', 'readwrite');
    const store = tx.objectStore('transaction_queue');
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingTransactions(businessId: string): Promise<OfflineTransaction[]> {
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('transaction_queue', 'readonly');
    const store = tx.objectStore('transaction_queue');
    const index = store.index('by_business_status');

    // Get pending and syncing items
    const reqPending = index.getAll([businessId, 'pending']);
    reqPending.onsuccess = () => {
      const pending = reqPending.result || [];
      const reqSyncing = index.getAll([businessId, 'syncing']);
      reqSyncing.onsuccess = () => {
        const syncing = reqSyncing.result || [];
        const combined = [...pending, ...syncing];
        // Sort chronologically (FIFO)
        combined.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(combined);
      };
      reqSyncing.onerror = () => resolve(pending);
    };
    reqPending.onerror = () => reject(reqPending.error);
  });
}

export async function getPendingTransactionsCount(businessId: string): Promise<number> {
  try {
    const pending = await getPendingTransactions(businessId);
    return pending.length;
  } catch {
    return 0;
  }
}

export async function updateTransactionStatus(
  clientTxId: string,
  status: OfflineTransaction['status'],
  extra?: { serverTxId?: string; errorMessage?: string; retryCountIncrement?: boolean }
): Promise<void> {
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('transaction_queue', 'readwrite');
    const store = tx.objectStore('transaction_queue');
    const req = store.get(clientTxId);

    req.onsuccess = () => {
      const record = req.result as OfflineTransaction | undefined;
      if (record) {
        record.status = status;
        if (extra?.serverTxId) record.serverTxId = extra.serverTxId;
        if (extra?.errorMessage) record.errorMessage = extra.errorMessage;
        if (extra?.retryCountIncrement) record.retryCount = (record.retryCount || 0) + 1;
        if (status === 'synced') record.syncedAt = new Date().toISOString();
        store.put(record);
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

export async function removeSyncedTransaction(clientTxId: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('transaction_queue', 'readwrite');
    const store = tx.objectStore('transaction_queue');
    const req = store.delete(clientTxId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ==============================================================================
// TENANT SECURITY & DATA CLEARING
// ==============================================================================

/**
 * Clears cached data for a specific business upon logout or switch.
 * Ensures a cashier from Business A cannot inspect Business B's offline records.
 */
export async function clearOfflineDataForBusiness(businessId: string): Promise<void> {
  if (!businessId) return;
  const db = await openOfflineDb();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['customers', 'loyalty_rules', 'businesses', 'transaction_queue'], 'readwrite');

    // 1. Delete business customers
    const custStore = tx.objectStore('customers');
    const custIndex = custStore.index('by_business');
    const custReq = custIndex.getAllKeys(businessId);
    custReq.onsuccess = () => {
      for (const key of custReq.result) {
        custStore.delete(key);
      }
    };

    // 2. Delete business loyalty rule
    tx.objectStore('loyalty_rules').delete(businessId);

    // 3. Delete business profile
    tx.objectStore('businesses').delete(businessId);

    // 4. Keep synced transactions pruned, or delete all for this business
    const txStore = tx.objectStore('transaction_queue');
    const txIndex = txStore.index('by_business');
    const txReq = txIndex.getAllKeys(businessId);
    txReq.onsuccess = () => {
      for (const key of txReq.result) {
        txStore.delete(key);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
