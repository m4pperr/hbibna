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
} from 'lucide-react';
import { resolveCustomerFromQr, type ResolveCustomerResult } from '@/actions/customers';
import { recordPurchase, type RecordPurchaseResult } from '@/actions/transactions';
import { calculateLoyaltyPoints } from '@/lib/loyalty-engine';
import type { Customer, LoyaltyProgram } from '@/types/database';

interface ScanCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  loyaltyRule?: LoyaltyProgram | null;
}

export function ScanCustomerModal({
  isOpen,
  onClose,
  customers,
  loyaltyRule,
}: ScanCustomerModalProps) {
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

    try {
      // Server action verifies token, tenant isolation, and lack of raw PII
      const result: ResolveCustomerResult = await resolveCustomerFromQr(rawToken);

      if (result.error) {
        setError(result.error);
        setResolving(false);
      } else if (result.success && result.customer) {
        setIdentifiedCustomer(result.customer);
        setStage('identified');
        setResolving(false);
      }
    } catch {
      setError('An unexpected error occurred while identifying customer.');
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
      setError('Please enter a valid purchase amount in DA greater than 0.');
      setConfirming(false);
      return;
    }

    try {
      // 1. Verify customer belongs to business
      // 2. Calculate points using business loyalty rules server-side
      // 3. Record transaction
      // 4. Update balance
      const res: RecordPurchaseResult = await recordPurchase({
        customerId: identifiedCustomer.id,
        amount: numAmount,
        description: description.trim() || 'Counter Purchase (QR Scan)',
      });

      if (res.error) {
        setError(res.error);
        setConfirming(false);
      } else if (res.success && res.pointsAwarded !== undefined) {
        setSuccessResult({
          pointsAwarded: res.pointsAwarded,
          newBalance: res.newBalance ?? (identifiedCustomer.points_balance + res.pointsAwarded),
          customerName: res.customerName || identifiedCustomer.name,
        });
        setStage('success');
        setConfirming(false);
      }
    } catch {
      setError('Failed to record transaction. Please try again.');
      setConfirming(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E6DDCF] flex items-center justify-between bg-[#FFFFFF] sticky top-0 z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#191817] text-[#DFC99F] flex items-center justify-center shadow-xs shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#191817] text-base leading-tight truncate">
                Scan Customer
              </h3>
              <p className="text-[11px] text-[#736B63] truncate">
                Instant QR identification & loyalty points reward
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#736B63] hover:text-[#191817] p-1.5 rounded-lg hover:bg-[#FAF8F5] transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* STAGE 1: SCAN OR MANUAL SEARCH */}
          {(stage === 'scan' || stage === 'manual') && (
            <div className="space-y-4">
              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#FAF8F5] border border-[#E6DDCF]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('qr');
                    setStage('scan');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'qr'
                      ? 'bg-[#FFFFFF] text-[#191817] shadow-xs border border-[#E6DDCF]'
                      : 'text-[#736B63] hover:text-[#191817]'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('manual');
                    setStage('manual');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'manual'
                      ? 'bg-[#FFFFFF] text-[#191817] shadow-xs border border-[#E6DDCF]'
                      : 'text-[#736B63] hover:text-[#191817]'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Manual Search</span>
                </button>
              </div>

              {/* TAB 1: QR SCANNER VIEW */}
              {activeTab === 'qr' && (
                <div className="space-y-4">
                  {/* Camera Scanner Viewport or Activation */}
                  <div className="rounded-3xl border border-[#E6DDCF] bg-[#FAF8F5] p-5 text-center space-y-4 relative overflow-hidden">
                    <div id="hbibna-qr-reader" className="w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden" />

                    {!cameraActive ? (
                      <div className="py-6 space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] text-[#B88E3E] shadow-soft flex items-center justify-center mx-auto">
                          <Camera className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#191817]">
                            Scan Customer Loyalty QR
                          </h4>
                          <p className="text-xs text-[#736B63] max-w-xs mx-auto">
                            Point your device camera at the customer&apos;s digital loyalty card.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCameraError(null);
                            setCameraActive(true);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-[#191817] text-white text-xs font-bold hover:bg-[#2B2927] transition-all shadow-soft cursor-pointer inline-flex items-center gap-2"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Start Camera Scanner</span>
                        </button>
                        {cameraError && (
                          <p className="text-[11px] text-amber-700">{cameraError}</p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setCameraActive(false)}
                          className="px-4 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E6DDCF] text-xs font-bold text-[#736B63] hover:text-[#191817]"
                        >
                          Stop Camera
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Fast Barcode / Token Scanner Gun Input */}
                  <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="token-input" className="font-bold text-[#191817] flex items-center gap-1.5">
                        <Keyboard className="w-3.5 h-3.5 text-[#B88E3E]" />
                        <span>Barcode Gun / Quick Token Paste</span>
                      </label>
                      <span className="text-[11px] text-[#736B63]">Press Enter to scan</span>
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
                        placeholder="e.g. hbibna:c:c1-sarah or scan with USB gun"
                        value={scannerTokenInput}
                        onChange={(e) => setScannerTokenInput(e.target.value)}
                        className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E6DDCF] bg-[#FAF8F5] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                      />
                      <button
                        type="submit"
                        disabled={resolving || !scannerTokenInput.trim()}
                        className="px-4 py-2 rounded-xl bg-[#B88E3E] text-white text-xs font-bold hover:bg-[#A37B30] disabled:opacity-50 transition-colors shadow-soft cursor-pointer"
                      >
                        {resolving ? 'Scanning...' : 'Identify'}
                      </button>
                    </form>
                  </div>

                  {/* Instant Demo Customers Quick-Tap (for effortless testing without physical phone) */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#736B63] uppercase tracking-wider block">
                      Quick Test (Click to simulate instant scan):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {customers.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleTokenScanned(`hbibna:c:${c.id}`)}
                          className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FBF6EB] border border-[#E6DDCF] hover:border-[#DFC99F] text-xs font-semibold text-[#191817] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <QrCode className="w-3 h-3 text-[#B88E3E]" />
                          <span>{c.name}</span>
                          <span className="text-[10px] text-[#736B63]">({c.points_balance} pts)</span>
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
                    <Search className="w-4 h-4 text-[#736B63] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search customer by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-xs text-[#191817] font-medium focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-[#E6DDCF] divide-y divide-[#E6DDCF] bg-[#FFFFFF]">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[#736B63]">
                        No customers found matching &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectCustomer(cust)}
                          className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          <div>
                            <p className="text-xs font-bold text-[#191817]">{cust.name}</p>
                            <p className="text-[11px] text-[#736B63]">{cust.phone}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-[#B88E3E]">
                              {cust.points_balance.toLocaleString()} pts
                            </span>
                            <span className="text-[10px] text-[#736B63] block">Select &rarr;</span>
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
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#191817] to-[#2B2927] text-white shadow-card space-y-3 relative overflow-hidden border border-[#DFC99F]/40">
                <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#B88E3E]/20 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between relative z-10">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#B88E3E]/20 text-[#DFC99F] border border-[#DFC99F]/30">
                    <ShieldCheck className="w-3 h-3 text-[#DFC99F]" />
                    <span>Customer Identified</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleScanNext}
                    className="text-[11px] font-semibold text-[#FAF8F5]/70 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Change</span>
                  </button>
                </div>

                {/* Display Customer name and Current points */}
                <div className="flex items-end justify-between relative z-10 pt-1">
                  <div>
                    <span className="text-[11px] text-[#FAF8F5]/70 block font-medium">
                      Customer Name
                    </span>
                    <h4 className="text-xl font-extrabold text-white tracking-tight">
                      {identifiedCustomer.name}
                    </h4>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[#FAF8F5]/70 block font-medium">
                      Current Points
                    </span>
                    <span className="text-2xl font-black text-[#DFC99F]">
                      {identifiedCustomer.points_balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enter Purchase Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#191817]">
                  Purchase Amount (DA) <span className="text-[#B88E3E]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="1"
                    placeholder="e.g. 2500"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-[#E6DDCF] bg-[#FFFFFF] text-base font-bold text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                    autoFocus
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#736B63]">
                    DA
                  </span>
                </div>
              </div>

              {/* Show Points Earned Preview */}
              <div className="p-4 rounded-2xl bg-[#FBF6EB] border border-[#DFC99F] flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#736B63] block font-medium">
                    Points Earned:
                  </span>
                  <div className="flex items-center gap-1.5 font-black text-sm text-[#B88E3E]">
                    <Sparkles className="w-4 h-4" />
                    <span>+{previewPoints} points</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#736B63] block font-medium">
                    New Projected Balance:
                  </span>
                  <span className="font-extrabold text-sm text-[#191817]">
                    {(identifiedCustomer.points_balance + previewPoints).toLocaleString()} pts
                  </span>
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <label className="block text-xs font-medium text-[#736B63] mb-1">
                  Receipt Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counter order, Table 5, or Receipt #104"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E6DDCF] bg-[#FFFFFF] text-[#191817] focus:outline-none focus:ring-2 focus:ring-[#B88E3E]"
                />
              </div>

              {/* Action Buttons: Confirm Purchase */}
              <div className="pt-2 grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={handleScanNext}
                  className="px-4 py-2.5 text-xs font-semibold text-[#736B63] hover:text-[#191817] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer min-h-[44px] flex items-center justify-center border border-[#E6DDCF] sm:border-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirming || !purchaseAmount || parsedAmount <= 0}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#B88E3E] hover:bg-[#A37B30] rounded-xl shadow-soft disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>{confirming ? 'Recording...' : 'Confirm'}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </form>
          )}

          {/* STAGE 3: SUCCESS CONFIRMATION */}
          {stage === 'success' && successResult && (
            <div className="p-4 sm:p-6 text-center space-y-5 sm:space-y-6 animate-in zoom-in-95 duration-150">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 sm:w-8 h-7 sm:h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-black text-[#191817] text-xl sm:text-2xl tracking-tight">
                  Purchase Confirmed!
                </h4>
                <p className="text-xs text-[#736B63]">
                  Loyalty points awarded to{' '}
                  <span className="font-bold text-[#191817]">{successResult.customerName}</span>.
                </p>
              </div>

              {/* Points Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-[#FBF6EB] border border-[#DFC99F] space-y-2 max-w-xs mx-auto">
                <span className="text-xs font-bold uppercase tracking-wider text-[#736B63] block">
                  Points Credited
                </span>
                <p className="text-3xl sm:text-4xl font-black text-[#B88E3E]">
                  +{successResult.pointsAwarded}{' '}
                  <span className="text-base font-bold text-[#191817]">PTS</span>
                </p>
                <div className="pt-2 border-t border-[#DFC99F]/50 flex items-center justify-between text-xs">
                  <span className="text-[#736B63]">New Balance:</span>
                  <span className="font-black text-[#191817]">
                    {successResult.newBalance.toLocaleString()} points
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleScanNext}
                  className="flex-1 py-3 rounded-xl bg-[#191817] hover:bg-[#2B2927] text-white text-xs font-bold transition-colors shadow-soft cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan Next Customer</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-[#FAF8F5] hover:bg-[#E6DDCF] border border-[#E6DDCF] text-[#191817] text-xs font-bold transition-colors cursor-pointer min-h-[44px]"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
