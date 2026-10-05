'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  ShieldCheck,
  ArrowRight,
  User,
  RotateCcw,
  Receipt,
  Keyboard,
  CloudOff,
  Wifi,
} from 'lucide-react';
import { resolveCustomerFromQr, type ResolveCustomerResult } from '@/actions/customers';
import { recordPurchase, type RecordPurchaseResult } from '@/actions/transactions';
import { calculateLoyaltyPoints } from '@/lib/loyalty-engine';
import type { Customer, LoyaltyProgram } from '@/types/database';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  findCachedCustomerByQr,
  enqueueOfflineTransaction,
  updateLocalCustomerBalance,
  generateClientTransactionId,
} from '@/lib/offline/db';

interface ScanCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  businessId?: string;
  loyaltyRule?: LoyaltyProgram | null;
}

export function ScanCustomerModal({
  isOpen,
  onClose,
  customers,
  businessId = 'biz-default-1',
  loyaltyRule,
}: ScanCustomerModalProps) {
  const { t, isRtl, language } = useLanguage();
  // Modal stages: 'scan' | 'manual' | 'identified' | 'success'
  const [stage, setStage] = useState<'scan' | 'manual' | 'identified' | 'success'>('scan');
  const [activeTab, setActiveTab] = useState<'qr' | 'manual'>('qr');

  // Scanner & token states
  const [scannerTokenInput, setScannerTokenInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Identified customer state
  const [identifiedCustomer, setIdentifiedCustomer] = useState<{
    id: string;
    name: string;
    points_balance: number;
    phone?: string;
  } | null>(null);

  // Purchase input state
  const [purchaseAmount, setPurchaseAmount] = useState<string>('');
  const [description, setDescription] = useState('');

  // Processing & Error states
  const [resolving, setResolving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success result
  const [successResult, setSuccessResult] = useState<{
    pointsAwarded: number;
    newBalance: number;
    customerName: string;
    isOffline?: boolean;
  } | null>(null);

  // Manual search query
  const [searchQuery, setSearchQuery] = useState('');

  // QR Code Scanner instance ref
  const scannerRef = useRef<any>(null);

  // Informational calculation rule
  const rule = loyaltyRule || {
    rule_type: 'per_currency',
    points_per_currency: 1,
    currency_unit: 100,
    points_per_purchase: 10,
  };

  const parsedAmount = Math.max(0, parseFloat(purchaseAmount) || 0);
  const previewPoints = calculateLoyaltyPoints(rule, parsedAmount).points;

  // Filtered customers for manual search
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.replace(/\s+/g, '').includes(searchQuery.replace(/\s+/g, ''))
  );

  // Initialize and clean up Html5Qrcode when camera is toggled
  useEffect(() => {
    let html5QrCode: any = null;

    if (isOpen && activeTab === 'qr' && cameraActive) {
      const initCamera = async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const scannerId = 'hbibna-qr-reader';
          html5QrCode = new Html5Qrcode(scannerId);
          scannerRef.current = html5QrCode;

          const config = { fps: 10, qrbox: { width: 220, height: 220 } };
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText: string) => {
              handleTokenScanned(decodedText);
              // Stop camera upon successful read
              try {
                html5QrCode.stop();
                setCameraActive(false);
              } catch {}
            },
            () => {
              // Frame scan ignore error
            }
          );
        } catch (err: any) {
          console.warn('Camera scanner access error:', err);
          setCameraError('Camera access not permitted or not supported on this device.');
          setCameraActive(false);
        }
      };

      initCamera();
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen, activeTab, cameraActive]);

  if (!isOpen) return null;

  // Process scanned token (either from camera, USB scanner gun, or manual paste)
  const handleTokenScanned = async (rawToken: string) => {
    if (!rawToken || resolving) return;
    setError(null);
    setResolving(true);

    const bizId = businessId || 'biz-default-1';

    // 1. Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const cached = await findCachedCustomerByQr(bizId, rawToken);
        if (cached) {
          setIdentifiedCustomer({
            id: cached.id,
            name: cached.name,
            points_balance: cached.points_balance,
            phone: cached.phone,
          });
          setStage('identified');
          setResolving(false);
          return;
        }

        // Also check in-memory customers list
        let rawId = rawToken.trim();
        if (rawId.startsWith('hbibna:c:')) {
          rawId = rawId.slice('hbibna:c:'.length).trim();
        }
        const memMatch = customers.find(
          (c) => c.id === rawId || c.phone === rawId || `hbibna:c:${c.id}` === rawToken.trim()
        );
        if (memMatch) {
          setIdentifiedCustomer({
            id: memMatch.id,
            name: memMatch.name,
            points_balance: memMatch.points_balance,
            phone: memMatch.phone,
          });
          setStage('identified');
          setResolving(false);
          return;
        }

        setError(
          language === 'ar'
            ? 'العميل غير موجود في الذاكرة المحلية بدون إنترنت.'
            : language === 'fr'
            ? 'Client non trouvé dans le cache hors ligne. Reconnectez-vous pour le premier scan.'
            : 'Customer not found in offline cache. Connect to internet for first scan.'
        );
        setResolving(false);
        return;
      } catch {
        setError(
          language === 'ar'
            ? 'خطأ أثناء قراءة الذاكرة المؤقتة بدون إنترنت.'
            : language === 'fr'
            ? 'Erreur lors de la lecture du cache hors ligne.'
            : 'Error reading offline cache.'
        );
        setResolving(false);
        return;
      }
    }

    // 2. Online: server action verifies token, tenant isolation, and lack of raw PII
    try {
      const result: ResolveCustomerResult = await resolveCustomerFromQr(rawToken);

      if (result.error) {
        // Fallback to offline cache
        const cached = await findCachedCustomerByQr(bizId, rawToken);
        if (cached) {
          setIdentifiedCustomer({
            id: cached.id,
            name: cached.name,
            points_balance: cached.points_balance,
            phone: cached.phone,
          });
          setStage('identified');
          setResolving(false);
          return;
        }
        setError(result.error);
        setResolving(false);
      } else if (result.success && result.customer) {
        setIdentifiedCustomer(result.customer);
        setStage('identified');
        setResolving(false);
      }
    } catch {
      // Network drop: fallback to offline cache
      try {
        const cached = await findCachedCustomerByQr(bizId, rawToken);
        if (cached) {
          setIdentifiedCustomer({
            id: cached.id,
            name: cached.name,
            points_balance: cached.points_balance,
            phone: cached.phone,
          });
          setStage('identified');
          setResolving(false);
          return;
        }
      } catch {}
      setError(
        language === 'ar'
          ? 'تعذر الاتصال بالخادم. العميل غير محفوظ محلياً.'
          : language === 'fr'
          ? 'Impossible de joindre le serveur. Client non trouvé en cache.'
          : 'Could not reach server. Customer not found in cache.'
      );
      setResolving(false);
    }
  };

  // Select customer from manual search alternative
  const handleSelectCustomer = (cust: Customer) => {
    setError(null);
    setIdentifiedCustomer({
      id: cust.id,
      name: cust.name,
      points_balance: cust.points_balance,
      phone: cust.phone,
    });
    setStage('identified');
  };

  // Confirm purchase action
  const handleConfirmPurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifiedCustomer) return;

    setError(null);
    setConfirming(true);

    const numAmount = parseFloat(purchaseAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(
        language === 'ar'
          ? 'يرجى إدخال مبلغ صحيح أكبر من 0 د.ج.'
          : language === 'fr'
          ? 'Veuillez saisir un montant d\'achat valide supérieur à 0 DA.'
          : 'Please enter a valid purchase amount in DA greater than 0.'
      );
      setConfirming(false);
      return;
    }

    const bizId = businessId || 'biz-default-1';
    const clientTxId = generateClientTransactionId();
    const calculated = calculateLoyaltyPoints(rule, numAmount);
    const pointsToAward = calculated.points;

    // Check if offline
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        // Save transaction to local IndexedDB queue
        await enqueueOfflineTransaction({
          clientTxId,
          businessId: bizId,
          customerId: identifiedCustomer.id,
          customerName: identifiedCustomer.name,
          customerPhone: identifiedCustomer.phone,
          amount: numAmount,
          points: pointsToAward,
          transactionType: 'earn',
          description:
            description.trim() ||
            (language === 'ar'
              ? 'شراء دون اتصال (مسح QR)'
              : language === 'fr'
              ? 'Achat hors ligne (scan QR)'
              : 'Offline Purchase (QR Scan)'),
          createdAt: new Date().toISOString(),
        });

        const newBalance = identifiedCustomer.points_balance + pointsToAward;
        await updateLocalCustomerBalance(bizId, identifiedCustomer.id, newBalance);

        setSuccessResult({
          pointsAwarded: pointsToAward,
          newBalance,
          customerName: identifiedCustomer.name,
          isOffline: true,
        });
        setStage('success');
        setConfirming(false);
        return;
      } catch (err) {
        console.error('Failed to save offline transaction:', err);
        setError(
          language === 'ar'
            ? 'خطأ أثناء الحفظ في التخزين المحلي بدون إنترنت.'
            : language === 'fr'
            ? 'Erreur lors de la sauvegarde hors ligne dans IndexedDB.'
            : 'Error saving offline transaction to local storage.'
        );
        setConfirming(false);
        return;
      }
    }

    // Online submission with duplicate protection clientTxId
    try {
      const res: RecordPurchaseResult = await recordPurchase({
        customerId: identifiedCustomer.id,
        amount: numAmount,
        clientTxId,
        description:
          description.trim() ||
          (language === 'ar'
            ? 'شراء عند الصندوق (مسح QR)'
            : language === 'fr'
            ? 'Achat comptoir (scan QR)'
            : 'Counter Purchase (QR Scan)'),
      });

      if (res.error) {
        setError(res.error);
        setConfirming(false);
      } else if (res.success && res.pointsAwarded !== undefined) {
        const finalBalance = res.newBalance ?? (identifiedCustomer.points_balance + res.pointsAwarded);
        // Sync local cache
        await updateLocalCustomerBalance(bizId, identifiedCustomer.id, finalBalance).catch(() => {});

        setSuccessResult({
          pointsAwarded: res.pointsAwarded,
          newBalance: finalBalance,
          customerName: res.customerName || identifiedCustomer.name,
          isOffline: false,
        });
        setStage('success');
        setConfirming(false);
      }
    } catch {
      // Network interrupted mid-flight: fallback to offline queue!
      try {
        await enqueueOfflineTransaction({
          clientTxId,
          businessId: bizId,
          customerId: identifiedCustomer.id,
          customerName: identifiedCustomer.name,
          customerPhone: identifiedCustomer.phone,
          amount: numAmount,
          points: pointsToAward,
          transactionType: 'earn',
          description:
            description.trim() ||
            (language === 'ar'
              ? 'عملية شراء في وضع عدم الاتصال (انقطاع الشبكة)'
              : language === 'fr'
              ? 'Achat hors ligne (réseau interrompu)'
              : 'Offline purchase (interrupted network)'),
          createdAt: new Date().toISOString(),
        });
        const newBalance = identifiedCustomer.points_balance + pointsToAward;
        await updateLocalCustomerBalance(bizId, identifiedCustomer.id, newBalance);

        setSuccessResult({
          pointsAwarded: pointsToAward,
          newBalance,
          customerName: identifiedCustomer.name,
          isOffline: true,
        });
        setStage('success');
        setConfirming(false);
      } catch {
        setError(t('common.error'));
        setConfirming(false);
      }
    }
  };

  // Reset scanner for next customer
  const handleScanNext = () => {
    setIdentifiedCustomer(null);
    setPurchaseAmount('');
    setDescription('');
    setScannerTokenInput('');
    setSuccessResult(null);
    setError(null);
    setStage('scan');
    setActiveTab('qr');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-rounded">
      <div className="bg-white border-2 border-black rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_12px_0_#000] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b-2 border-black flex items-center justify-between bg-[#FFE600] sticky top-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-black text-[#FFE600] border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000] shrink-0">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-black text-base leading-tight truncate">
                {t('modals.scanTitle')}
              </h3>
              <p className="text-[11px] text-black/70 font-bold truncate">
                {t('modals.scanDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-black bg-white hover:bg-[#FFF9D2] border-2 border-black p-1.5 rounded-xl shadow-[0_2px_0_#000] transition-colors cursor-pointer shrink-0"
            aria-label={t('common.close')}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-300 border-2 border-black text-black text-xs font-black flex items-center gap-2.5 shadow-[0_3px_0_#000] animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>{error}</span>
            </div>
          )}

          {/* STAGE 1: SCAN OR MANUAL SEARCH */}
          {(stage === 'scan' || stage === 'manual') && (
            <div className="space-y-4">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-white border-2 border-black shadow-[0_3px_0_#000]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('qr');
                    setStage('scan');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'qr'
                      ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                      : 'text-black/70 hover:text-black hover:bg-black/5'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('modals.cameraScan')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manual');
                    setStage('manual');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'manual'
                      ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                      : 'text-black/70 hover:text-black hover:bg-black/5'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t('modals.manualEntry')}</span>
                </button>
              </div>

              {/* TAB 1: QR SCANNER VIEW */}
              {activeTab === 'qr' && (
                <div className="space-y-4">
                  {/* Camera Scanner Viewport or Activation */}
                  <div className="rounded-3xl border-2 border-black bg-[#FFF9D2] p-5 text-center space-y-4 relative overflow-hidden shadow-[0_4px_0_#000]">
                    <div id="hbibna-qr-reader" className="w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-black" />

                    {!cameraActive ? (
                      <div className="py-6 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-black text-black shadow-[0_3px_0_#000] flex items-center justify-center mx-auto">
                          <Camera className="w-7 h-7 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-black">
                            {t('modals.scanTitle')}
                          </h4>
                          <p className="text-xs text-black/70 font-bold max-w-xs mx-auto">
                            {t('modals.cameraInstruction')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCameraError(null);
                            setCameraActive(true);
                          }}
                          className="px-6 py-3 rounded-2xl bg-black text-[#FFE600] text-xs font-black hover:bg-neutral-900 transition-all border-2 border-black shadow-[0_4px_0_#000] cursor-pointer inline-flex items-center gap-2 active:translate-y-0.5 active:shadow-[0_2px_0_#000]"
                        >
                          <Camera className="w-4 h-4 stroke-[2.5]" />
                          <span>{t('modals.startCamera')}</span>
                        </button>
                        {cameraError && (
                          <p className="text-xs text-rose-700 font-bold">{cameraError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setCameraActive(false)}
                          className="px-4 py-2 rounded-xl bg-white border-2 border-black text-xs font-black text-black shadow-[0_2px_0_#000]"
                        >
                          {t('modals.stopCamera')}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fast Barcode / Token Scanner Gun Input */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="token-input" className="font-black text-black flex items-center gap-1.5 uppercase tracking-wide">
                        <Keyboard className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{t('modals.quickTokenTitle')}</span>
                      </label>
                      <span className="text-[11px] text-black/60 font-bold">{t('modals.pressEnterToScan')}</span>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleTokenScanned(scannerTokenInput);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        id="token-input"
                        type="text"
                        placeholder={t('modals.enterCodePlaceholder')}
                        value={scannerTokenInput}
                        onChange={(e) => setScannerTokenInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border-2 border-black bg-[#FFF9D2] font-bold text-black focus:bg-white focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={resolving || !scannerTokenInput.trim()}
                        className="px-4 py-2 rounded-xl bg-black text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_2px_0_#000] disabled:opacity-50 cursor-pointer"
                      >
                        {resolving ? t('business.loading') : t('modals.identify')}
                      </button>
                    </form>
                  </div>

                  {/* Instant Demo Customers Quick-Tap */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-black/70 uppercase tracking-wider block">
                      {t('modals.quickTest')}:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {customers.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleTokenScanned(`hbibna:c:${c.id}`)}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF9D2] border-2 border-black text-xs font-black text-black transition-all flex items-center gap-1.5 shadow-[0_2px_0_#000] cursor-pointer"
                        >
                          <QrCode className="w-3 h-3 stroke-[2.5]" />
                          <span>{c.name}</span>
                          <span className="text-[10px] text-black/60 font-mono">({c.points_balance} {t('common.pts')})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MANUAL SEARCH ALTERNATIVE */}
              {activeTab === 'manual' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className={`w-4 h-4 text-black/60 absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="text"
                      placeholder={t('modals.searchCustomerPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full py-2.5 rounded-2xl border-2 border-black bg-[#FFF9D2] text-xs text-black font-bold focus:bg-white focus:outline-none shadow-[0_3px_0_#000] ${
                        isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'
                      }`}
                      autoFocus
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-2xl border-2 border-black divide-y-2 divide-black/10 bg-white shadow-[0_4px_0_#000]">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-6 text-center text-xs text-black/60 font-bold">
                        {t('business.noCustomersFound')}
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className="p-3.5 flex items-center justify-between hover:bg-[#FFF9D2]/40 transition-colors cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-black text-black">{cust.name}</p>
                            <p className="text-[11px] text-black/60 font-mono font-semibold" dir="ltr">{cust.phone}</p>
                          </div>
                          <div className={isRtl ? 'text-left' : 'text-right'}>
                            <span className="text-xs font-black font-mono text-black bg-[#FFE600] px-2 py-0.5 rounded-lg border border-black">
                              {cust.points_balance.toLocaleString()} {t('common.pts')}
                            </span>
                            <span className="text-[10px] text-black/70 font-black block mt-0.5">
                              {isRtl ? '← اختيار' : language === 'fr' ? 'Choisir →' : 'Select →'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STAGE 2: CUSTOMER IDENTIFIED -> RECORD PURCHASE */}
          {stage === 'identified' && identifiedCustomer && (
            <form onSubmit={handleConfirmPurchase} className="space-y-5 animate-in fade-in">
              {/* Verified Customer Card */}
              <div className="p-5 rounded-3xl bg-black text-white shadow-[0_6px_0_#000] space-y-3 relative overflow-hidden border-2 border-black">
                <div className="flex items-center justify-between relative z-10">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFE600] text-black border-2 border-black shadow-[0_2px_0_#000]">
                    <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                    <span>{t('modals.customerIdentified')}</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleScanNext}
                    className="text-[11px] font-bold text-white/80 hover:text-white flex items-center gap-1 cursor-pointer underline"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('modals.changeCustomer')}</span>
                  </button>
                </div>

                {/* Display Customer name and Current points */}
                <div className="flex items-end justify-between relative z-10 pt-1">
                  <div>
                    <span className="text-xs text-white/70 block font-bold">
                      {t('modals.fullName')}
                    </span>
                    <h4 className="text-xl font-black text-white tracking-tight">
                      {identifiedCustomer.name}
                    </h4>
                  </div>

                  <div className={isRtl ? 'text-left' : 'text-right'}>
                    <span className="text-xs text-white/70 block font-bold">
                      {t('modals.currentPoints')}
                    </span>
                    <span className="text-3xl font-black text-[#FFE600] font-mono">
                      {identifiedCustomer.points_balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enter Purchase Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-black uppercase tracking-wide">
                  {t('modals.purchaseAmountDa')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="e.g. 2500"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className={`w-full py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] text-base font-black text-black focus:bg-white focus:outline-none shadow-[0_3px_0_#000] ${
                      isRtl ? 'pr-4 pl-12' : 'pl-4 pr-12'
                    }`}
                    autoFocus
                    required
                  />
                  <span className={`absolute top-1/2 -translate-y-1/2 text-xs font-black text-black ${
                    isRtl ? 'left-4' : 'right-4'
                  }`}>
                    {t('common.da')}
                  </span>
                </div>
              </div>

              {/* Show Points Earned Preview */}
              <div className="p-4 rounded-2xl bg-[#FFE600] border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-between">
                <div>
                  <span className="text-xs text-black/70 block font-bold">
                    {t('modals.pointsToAward')}:
                  </span>
                  <div className="flex items-center gap-1.5 font-black text-base text-black">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                    <span>+{previewPoints} {t('business.points')}</span>
                  </div>
                </div>
                <div className={isRtl ? 'text-left' : 'text-right'}>
                  <span className="text-xs text-black/70 block font-bold">
                    {t('modals.newBalance')}:
                  </span>
                  <span className="font-black text-base text-black font-mono">
                    {(identifiedCustomer.points_balance + previewPoints).toLocaleString()} {t('common.pts')}
                  </span>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-black text-black/70 mb-1">
                  {t('modals.receiptNoteOptional')}
                </label>
                <input
                  type="text"
                  placeholder={t('modals.receiptNotePlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border-2 border-black bg-white text-black font-bold focus:outline-none"
                />
              </div>

              {/* Action Buttons: Confirm Purchase */}
              <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleScanNext}
                  className="px-4 py-2.5 text-xs font-black text-black bg-white hover:bg-[#FFF9D2] rounded-2xl border-2 border-black shadow-[0_2px_0_#000] transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={confirming || !purchaseAmount || parsedAmount <= 0}
                  className="px-6 py-2.5 text-xs font-black text-[#FFE600] bg-black hover:bg-neutral-900 border-2 border-black rounded-2xl shadow-[0_4px_0_#000] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] active:translate-y-0.5 active:shadow-[0_2px_0_#000]"
                >
                  <span>{confirming ? t('modals.recording') : t('common.confirm')}</span>
                  <ArrowRight className="w-4 h-4 shrink-0 rtl:rotate-180 stroke-[2.5]" />
                </button>
              </div>
            </form>
          )}

          {/* STAGE 3: SUCCESS CONFIRMATION */}
          {stage === 'success' && successResult && (
            <div className="p-4 sm:p-6 text-center space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-3xl bg-emerald-300 text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-black text-xl sm:text-2xl tracking-tight">
                  {t('modals.purchaseConfirmed')}
                </h4>
                <p className="text-xs text-black/70 font-bold">
                  {successResult.customerName}
                </p>
              </div>

              {/* Points Card */}
              <div className="p-5 rounded-3xl bg-[#FFE600] border-2 border-black shadow-[0_6px_0_#000] space-y-2 max-w-xs mx-auto">
                <span className="text-xs font-black uppercase tracking-wider text-black/70 block">
                  {t('modals.pointsCredited')}
                </span>
                <p className="text-4xl font-black text-black font-mono">
                  +{successResult.pointsAwarded}{' '}
                  <span className="text-base font-black text-black">{t('common.pts')}</span>
                </p>
                <div className="pt-2 border-t-2 border-black/15 flex items-center justify-between text-xs font-bold">
                  <span className="text-black/70">{t('modals.newBalance')}:</span>
                  <span className="font-black text-black font-mono">
                    {successResult.newBalance.toLocaleString()} {t('business.points')}
                  </span>
                </div>
              </div>

              {/* Offline notice if saved locally */}
              {successResult.isOffline && (
                <div className="p-3 rounded-2xl bg-[#FC851D]/15 border-2 border-black text-black text-xs font-black flex items-center justify-center gap-2 shadow-[0_2px_0_#000] animate-in fade-in max-w-sm mx-auto">
                  <CloudOff className="w-4 h-4 stroke-[2.5] text-[#FC851D] shrink-0" />
                  <span className="leading-tight">
                    {language === 'ar'
                      ? 'تم الحفظ محلياً — ستتم المزامنة تلقائياً عند عودة الإنترنت'
                      : language === 'fr'
                      ? 'Enregistré hors ligne — synchronisation automatique dès le retour d\'internet'
                      : 'Saved offline — will sync automatically when back online'}
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleScanNext}
                  className="flex-1 py-3 rounded-2xl bg-black hover:bg-neutral-900 text-[#FFE600] text-xs font-black transition-colors border-2 border-black shadow-[0_4px_0_#000] cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] active:translate-y-0.5 active:shadow-[0_2px_0_#000]"
                >
                  <QrCode className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('modals.scanNextCustomer')}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-[#FFF9D2] border-2 border-black text-black text-xs font-black transition-colors shadow-[0_4px_0_#000] cursor-pointer min-h-[44px] active:translate-y-0.5 active:shadow-[0_2px_0_#000]"
                >
                  {t('common.done')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
