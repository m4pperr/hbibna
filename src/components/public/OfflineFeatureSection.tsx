'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Database,
  CloudOff,
  QrCode,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export function OfflineFeatureSection() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  // Animation cycle: 0 = ONLINE, 1 = OFFLINE, 2 = TRANSACTION SAVED, 3 = SYNC, 4 = ONLINE COMPLETE
  const [cycleStep, setCycleStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [isManualPaused, setIsManualPaused] = useState(false);

  useEffect(() => {
    if (isManualPaused) return;

    const durations = [
      3200, // 0: Online
      2800, // 1: Offline
      3400, // 2: Transaction saved (+10 points)
      2600, // 3: Syncing
      3000, // 4: Online synced
    ];

    const timer = setTimeout(() => {
      setCycleStep((prev) => ((prev + 1) % 5) as 0 | 1 | 2 | 3 | 4);
    }, durations[cycleStep]);

    return () => clearTimeout(timer);
  }, [cycleStep, isManualPaused]);

  return (
    <section
      className="w-full py-20 lg:py-28 border-b-2 border-black"
      style={{ backgroundColor: '#F2F7FF' }}
      id="mode-hors-ligne"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 font-rounded">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-2 border-black text-xs font-black shadow-[0_3px_0_#000] mb-4">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: cycleStep === 1 || cycleStep === 2 ? '#FC851D' : '#0AA95A' }}
            />
            <span style={{ color: '#000000' }}>
              {isAr
                ? 'ميزة حصرية للمتاجر • وضع عدم الاتصال الحقيقي'
                : isFr
                ? 'Nouveau • Véritable Mode Hors-Ligne pour Caisse'
                : 'Exclusive Feature • Real Offline Mode for Checkout'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight leading-tight">
            {isAr ? (
              <>
                يعمل حتى{' '}
                <span
                  className="px-4 py-1 rounded-2xl inline-block -rotate-1 border-2 border-black shadow-[0_4px_0_#000]"
                  style={{ backgroundColor: '#6BA4EE', color: '#000000' }}
                >
                  بدون إنترنت
                </span>
              </>
            ) : isFr ? (
              <>
                Fonctionne même{' '}
                <span
                  className="px-4 py-1 rounded-2xl inline-block -rotate-1 border-2 border-black shadow-[0_4px_0_#000]"
                  style={{ backgroundColor: '#6BA4EE', color: '#000000' }}
                >
                  sans internet
                </span>
              </>
            ) : (
              <>
                Works even{' '}
                <span
                  className="px-4 py-1 rounded-2xl inline-block -rotate-1 border-2 border-black shadow-[0_4px_0_#000]"
                  style={{ backgroundColor: '#6BA4EE', color: '#000000' }}
                >
                  without internet
                </span>
              </>
            )}
          </h2>

          <p className="text-base sm:text-lg text-black/80 font-bold mt-4 leading-relaxed max-w-2xl mx-auto">
            {isAr
              ? 'انقطعت الشبكة؟ تستمر الكاشير في العمل بدون توقف. يتم تسجيل العمليات محلياً ومزامنتها تلقائياً فور عودة الاتصال.'
              : isFr
              ? 'Pas de connexion ? La caisse continue de fonctionner. Les opérations sont enregistrées et synchronisées automatiquement dès que le réseau revient.'
              : 'Lost your Wi-Fi? The counter never stops. Transactions are securely stored on device and automatically synchronized as soon as the network returns.'}
          </p>
        </div>

        {/* Main Interactive Showcase Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* LEFT: Animated Interactive POS Terminal Visual */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-white border-2 border-black rounded-[2.5rem] p-6 sm:p-7 shadow-[0_10px_0_#000] relative overflow-hidden text-start">
              {/* Terminal Screen Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-2xl border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]"
                    style={{ backgroundColor: '#6BA4EE', color: '#000' }}
                  >
                    <QrCode className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-black">
                      {isAr ? 'محطة نقاط البيع Hbibna' : isFr ? 'Terminal de Caisse Hbibna' : 'Hbibna POS Terminal'}
                    </div>
                    <div className="text-[10px] text-black/60 font-bold">
                      {isAr ? 'نقطة البيع #01 • وضع هجين' : isFr ? 'Caisse #01 • Mode Hybride' : 'Checkout #01 • Hybrid Mode'}
                    </div>
                  </div>
                </div>

                {/* DYNAMIC LIVE STATUS BADGE */}
                <div
                  className="px-3 py-1.5 rounded-xl border-2 border-black shadow-[0_2px_0_#000] text-xs font-black flex items-center gap-1.5 transition-all duration-300"
                  style={{
                    backgroundColor:
                      cycleStep === 0
                        ? '#F0FDF4'
                        : cycleStep === 1 || cycleStep === 2
                        ? '#FFF3EB'
                        : cycleStep === 3
                        ? '#EBF3FF'
                        : '#F0FDF4',
                    color:
                      cycleStep === 0
                        ? '#0AA95A'
                        : cycleStep === 1 || cycleStep === 2
                        ? '#FC851D'
                        : cycleStep === 3
                        ? '#6BA4EE'
                        : '#0AA95A',
                  }}
                >
                  {cycleStep === 0 && (
                    <>
                      <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isAr ? '● متصل بالإنترنت' : isFr ? '● En ligne' : '● Online'}</span>
                    </>
                  )}
                  {(cycleStep === 1 || cycleStep === 2) && (
                    <>
                      <WifiOff className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isAr ? '● غير متصل' : isFr ? '● Hors ligne' : '● Offline'}</span>
                    </>
                  )}
                  {cycleStep === 3 && (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 stroke-[2.5] animate-spin" />
                      <span>{isAr ? 'مزامنة...' : isFr ? 'Synchronisation...' : 'Syncing...'}</span>
                    </>
                  )}
                  {cycleStep === 4 && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{isAr ? '● تمت المزامنة' : isFr ? '● Synchronisé' : '● Synced'}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Terminal Screen Body */}
              <div className="space-y-4">
                {/* Customer Scan Card */}
                <div className="p-4 rounded-2xl bg-[#FFF9D2] border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-black/60 block">
                      {isAr ? 'العميل الحالي' : isFr ? 'Client identifié' : 'Scanned Customer'}
                    </span>
                    <span className="text-sm font-black text-black">Amine Khelil</span>
                    <span className="text-[11px] text-black/60 block font-mono" dir="ltr">0550 12 34 56</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-black/60 block">
                      {isAr ? 'الرصيد' : isFr ? 'Solde' : 'Balance'}
                    </span>
                    <span className="text-base font-black font-mono text-black">
                      {cycleStep >= 2 ? '430' : '420'} pts
                    </span>
                  </div>
                </div>

                {/* Animated Simulation Central Action */}
                <div
                  className="p-5 rounded-2xl border-2 border-black transition-all duration-300 min-h-[140px] flex flex-col justify-center shadow-[0_4px_0_#000]"
                  style={{
                    backgroundColor:
                      cycleStep === 2
                        ? '#F0FDF4'
                        : cycleStep === 3
                        ? '#F2F7FF'
                        : cycleStep === 4
                        ? '#F0FDF4'
                        : '#FFFFFF',
                  }}
                >
                  {cycleStep === 0 && (
                    <div className="text-center space-y-1 animate-in fade-in">
                      <div className="w-10 h-10 rounded-xl bg-black text-[#FFE600] flex items-center justify-center mx-auto mb-2 border-2 border-black">
                        <Wifi className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="text-xs font-black text-black">
                        {isAr ? 'الاتصال مستقر — كاشير جاهز' : isFr ? 'Réseau normal — Caisse prête' : 'Network Online — Ready'}
                      </div>
                      <div className="text-[11px] text-black/60 font-bold">
                        {isAr ? 'جاهز لمسح الزبائن' : isFr ? 'Prêt à scanner les clients' : 'Ready to scan customers'}
                      </div>
                    </div>
                  )}

                  {cycleStep === 1 && (
                    <div className="text-center space-y-1 animate-in fade-in">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 border-2 border-black text-white shadow-[0_2px_0_#000]"
                        style={{ backgroundColor: '#FC851D' }}
                      >
                        <WifiOff className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="text-xs font-black text-black">
                        {isAr ? 'انقطع الإنترنت فجأة !' : isFr ? 'Coupure réseau soudaine !' : 'Internet disconnected!'}
                      </div>
                      <div className="text-[11px] font-bold" style={{ color: '#FC851D' }}>
                        {isAr
                          ? 'لا تقلق: وضع عدم الاتصال يعمل تلقائياً'
                          : isFr
                          ? 'Pas de panique : la caisse continue'
                          : 'No panic: offline mode activates instantly'}
                      </div>
                    </div>
                  )}

                  {cycleStep === 2 && (
                    <div className="text-center space-y-1.5 animate-in zoom-in-95">
                      <div
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-black text-xs font-black shadow-[0_2px_0_#000]"
                        style={{ backgroundColor: '#0AA95A', color: '#FFFFFF' }}
                      >
                        <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                        <span>+10 points ✓</span>
                      </div>
                      <div className="text-xs font-black text-black">
                        {isAr ? 'تم حفظ العملية محلياً في الذاكرة' : isFr ? 'Opération enregistrée hors ligne' : 'Transaction saved offline'}
                      </div>
                      <div className="text-[10px] text-black/70 font-bold">
                        {isAr ? 'مخزنة في قائمة الانتظار المحلية (IndexedDB)' : isFr ? 'En file d’attente locale sécurisée' : 'Enqueued locally in IndexedDB'}
                      </div>
                    </div>
                  )}

                  {cycleStep === 3 && (
                    <div className="text-center space-y-2 animate-in fade-in">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto border-2 border-black text-white shadow-[0_2px_0_#000]"
                        style={{ backgroundColor: '#6BA4EE' }}
                      >
                        <RefreshCw className="w-5 h-5 stroke-[2.5] animate-spin" />
                      </div>
                      <div className="text-xs font-black text-black">
                        {isAr ? 'عاد الإنترنت — جاري المزامنة...' : isFr ? 'Le réseau revient — Synchronisation...' : 'Back online — Syncing queue...'}
                      </div>
                      <div className="text-[10px] text-black/70 font-bold">
                        {isAr ? 'حماية تامة من التكرار (Idempotency Key)' : isFr ? 'Envoi sécurisé avec clé anti-doublon' : 'Sending with unique idempotency key'}
                      </div>
                    </div>
                  )}

                  {cycleStep === 4 && (
                    <div className="text-center space-y-1.5 animate-in zoom-in-95">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto border-2 border-black text-white shadow-[0_2px_0_#000]"
                        style={{ backgroundColor: '#0AA95A' }}
                      >
                        <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="text-xs font-black text-black">
                        {isAr ? 'تمت المزامنة بنجاح في السحابة ✓' : isFr ? 'Toutes les opérations sont synchronisées ✓' : 'All transactions synced to cloud ✓'}
                      </div>
                      <div className="text-[10px] text-black/70 font-bold">
                        {isAr ? 'رصيد العميل محدّث على السيرفر' : isFr ? 'Base de données serveur à jour' : 'Server database reconciled perfectly'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stepper Timeline Navigation */}
                <div className="pt-2 flex items-center justify-between gap-1 sm:gap-2">
                  {[
                    { label: isAr ? 'متصل' : isFr ? 'En ligne' : 'Online', step: 0 },
                    { label: isAr ? 'انقطاع' : isFr ? 'Hors ligne' : 'Offline', step: 1 },
                    { label: isAr ? 'حفظ محلي' : isFr ? '+10 pts ✓' : '+10 pts', step: 2 },
                    { label: isAr ? 'مزامنة' : isFr ? 'Synchro' : 'Sync', step: 3 },
                    { label: isAr ? 'تم' : isFr ? 'Validé' : 'Synced', step: 4 },
                  ].map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => {
                        setIsManualPaused(true);
                        setCycleStep(s.step as 0 | 1 | 2 | 3 | 4);
                      }}
                      className={`flex-1 py-1.5 px-1 rounded-xl text-[10px] font-black border-2 border-black transition-all cursor-pointer ${
                        cycleStep === s.step
                          ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                          : 'bg-white text-black/70 hover:bg-black/5'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: High-Impact Business Value Explanation */}
          <div className="lg:col-span-6 space-y-6 text-start">
            <div className="space-y-3">
              <span
                className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider inline-block border-2 border-black shadow-[0_2px_0_#000]"
                style={{ backgroundColor: '#6BA4EE', color: '#000000' }}
              >
                {isAr ? 'موثوقية مطلقة عند الصندوق' : isFr ? 'Fiabilité Absolue en Caisse' : 'Zero POS Downtime'}
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-snug">
                {isAr
                  ? 'لا توقف للعمليات أبداً. لا زبائن ينتظرون.'
                  : isFr
                  ? 'Vos encaissements ne s’arrêtent jamais. Zéro client bloqué.'
                  : 'Your counter never stops. Zero frustrated customers.'}
              </h3>

              <p className="text-sm sm:text-base text-black/80 font-bold leading-relaxed">
                {isAr
                  ? 'في الجزائر، انقطاع شبكة 4G أو الواي فاي أمر شائع. مع Hbibna، تستمر الكاشير في مسح بطاقات العملاء واحتساب النقاط بشكل فوري بفضل التخزين المحلي الآمن IndexedDB.'
                  : isFr
                  ? 'En Algérie, les coupures 4G ou Wi-Fi arrivent fréquemment. Avec Hbibna, vos caissiers continuent de scanner les QR codes et de créditer les points sans aucune interruption grâce au stockage local sécurisé IndexedDB.'
                  : 'In real retail environments, Wi-Fi dips and mobile data cuts happen. Hbibna keeps scanning QR codes and issuing loyalty points seamlessly using local IndexedDB persistence.'}
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_3px_0_#000] space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl border-2 border-black flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#0AA95A', color: '#FFFFFF' }}
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-black">
                    {isAr ? 'حماية من التكرار' : isFr ? 'Anti-doublon garanti' : 'Duplicate Protection'}
                  </span>
                </div>
                <p className="text-[11px] text-black/70 font-bold">
                  {isAr
                    ? 'مفتاح فريد لكل معاملة يضمن عدم احتساب النقاط مرتين أبداً.'
                    : isFr
                    ? 'Clé idempotente unique empêchant tout double crédit de points.'
                    : 'Idempotency key guarantees points are never awarded twice.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_3px_0_#000] space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-xl border-2 border-black flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#FC851D', color: '#FFFFFF' }}
                  >
                    <Database className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-black">
                    {isAr ? 'تخزين آمن ومعزول' : isFr ? 'Isolation des données' : 'Tenant Isolation'}
                  </span>
                </div>
                <p className="text-[11px] text-black/70 font-bold">
                  {isAr
                    ? 'بيانات الزبائن معزولة ومحمية ومخصصة لمتجرك فقط دون أي خلط.'
                    : isFr
                    ? 'Données chiffrées et cloisonnées strictement à votre boutique.'
                    : 'Customer balances strictly isolated to your authenticated business.'}
                </p>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-2">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] transition-all cursor-pointer"
              >
                <span>
                  {isAr ? 'ابدأ تجربة Hbibna مع وضع عدم الاتصال' : isFr ? 'Activer le mode hors ligne pour ma caisse' : 'Activate offline mode for my business'}
                </span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
