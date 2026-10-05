'use client';

import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useOfflineSync } from '@/lib/offline/sync-manager';

interface OfflineStatusBarProps {
  businessId: string;
}

export function OfflineStatusBar({ businessId }: OfflineStatusBarProps) {
  const { isOnline, status, pendingCount, forceSync } = useOfflineSync(businessId);
  const { language, isRtl } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  // If online and no pending transactions, show a clean, compact indicator
  if (isOnline && pendingCount === 0 && status !== 'syncing') {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs select-none"
        title={isAr ? 'متصل بالإنترنت' : isFr ? 'Connecté à Internet' : 'Connected to Internet'}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="hidden sm:inline">
          {isAr ? 'متصل' : isFr ? 'En ligne' : 'Online'}
        </span>
      </div>
    );
  }

  // When syncing
  if (status === 'syncing') {
    return (
      <div
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border-2 border-black text-black text-xs font-black shadow-[0_2px_0_#000] animate-pulse"
        title={isAr ? 'جاري مزامنة المعاملات...' : isFr ? 'Synchronisation en cours...' : 'Syncing transactions...'}
      >
        <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0 stroke-[2.5]" />
        <span>
          {isAr
            ? `مزامنة ${pendingCount} معاملة...`
            : isFr
            ? `Synchronisation (${pendingCount})...`
            : `Syncing (${pendingCount})...`}
        </span>
      </div>
    );
  }

  // When offline
  if (!isOnline || status === 'offline') {
    return (
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE600] border-2 border-black text-black text-xs font-black shadow-[0_2px_0_#000]">
        <WifiOff className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
        <span>
          {isAr
            ? `وضع بدون إنترنت ${pendingCount > 0 ? `(${pendingCount} في الانتظار)` : ''}`
            : isFr
            ? `Mode Hors-ligne ${pendingCount > 0 ? `(${pendingCount} en attente)` : ''}`
            : `Offline Mode ${pendingCount > 0 ? `(${pendingCount} pending)` : ''}`}
        </span>
      </div>
    );
  }

  // When synced
  if (status === 'synced') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border-2 border-black text-black text-xs font-black shadow-[0_2px_0_#000]">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 stroke-[2.5]" />
        <span>
          {isAr ? 'تمت المزامنة بنجاح' : isFr ? '✓ Toutes les opérations synchronisées' : '✓ All transactions synced'}
        </span>
      </div>
    );
  }

  // If there are pending transactions waiting
  if (pendingCount > 0) {
    return (
      <button
        onClick={() => forceSync()}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFF9D2] hover:bg-[#FFE600] border-2 border-black text-black text-xs font-black shadow-[0_2px_0_#000] cursor-pointer transition-all active:translate-y-0.5"
        title={isAr ? 'اضغط للمزامنة الفورية' : isFr ? 'Cliquer pour synchroniser' : 'Click to sync now'}
      >
        <RefreshCw className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
        <span>
          {isAr
            ? `${pendingCount} معاملة في انتظار المزامنة`
            : isFr
            ? `${pendingCount} opération${pendingCount > 1 ? 's' : ''} en attente`
            : `${pendingCount} transaction${pendingCount > 1 ? 's' : ''} waiting to sync`}
        </span>
      </button>
    );
  }

  return null;
}

/**
 * Prominent top banner displayed when the cashier device is offline
 * to reassure the employee that the loyalty program continues to record transactions normally.
 */
export function OfflineBanner({ businessId }: { businessId: string }) {
  const { isOnline, pendingCount, status, forceSync } = useOfflineSync(businessId);
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  if (isOnline && pendingCount === 0 && status !== 'syncing') {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full bg-[#FFF9D2] border-b-2 border-black px-4 py-2.5 flex items-center justify-between gap-3 text-black text-xs font-black shadow-sm font-rounded"
    >
      <div className="flex items-center gap-2 min-w-0">
        {!isOnline ? (
          <div className="w-6 h-6 rounded-full bg-black text-[#FFE600] flex items-center justify-center shrink-0">
            <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-black text-[#FFE600] flex items-center justify-center shrink-0">
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${status === 'syncing' ? 'animate-spin' : ''}`} />
          </div>
        )}

        <div className="truncate">
          {!isOnline ? (
            <span>
              {isAr
                ? 'أنت تعمل بدون اتصال بالإنترنت — تواصل الكاونتر تسجيل النقاط محلياً، وستتم المزامنة تلقائياً عند عودة الشبكة.'
                : isFr
                ? 'Mode Hors-ligne actif — La caisse continue d\'enregistrer les passages. Synchronisation automatique dès le retour du réseau.'
                : 'Offline Mode active — The counter continues recording transactions locally. Automatic sync when network returns.'}
            </span>
          ) : status === 'syncing' ? (
            <span>
              {isAr
                ? `عادت الشبكة — جاري مزامنة ${pendingCount} معاملة مع الخادم...`
                : isFr
                ? `Connexion rétablie — Synchronisation de ${pendingCount} opération(s) en cours...`
                : `Back online — Syncing ${pendingCount} transaction(s)...`}
            </span>
          ) : (
            <span>
              {isAr
                ? `هناك ${pendingCount} معاملة مسجلة بانتظار المزامنة.`
                : isFr
                ? `${pendingCount} opération(s) enregistrée(s) en attente de synchronisation.`
                : `${pendingCount} recorded transaction(s) waiting to sync.`}
            </span>
          )}
        </div>
      </div>

      {isOnline && pendingCount > 0 && status !== 'syncing' && (
        <button
          onClick={() => forceSync()}
          className="shrink-0 px-3 py-1 rounded-xl bg-black text-[#FFE600] border-2 border-black text-[11px] font-black hover:bg-neutral-800 active:translate-y-0.5 shadow-[0_2px_0_#000] cursor-pointer"
        >
          {isAr ? 'مزامنة الآن' : isFr ? 'Synchroniser' : 'Sync Now'}
        </button>
      )}
    </div>
  );
}
