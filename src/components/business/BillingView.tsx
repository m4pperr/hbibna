'use client';

import React, { useState, useTransition } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  Sparkles,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Zap,
  HelpCircle,
  X,
  Save,
  Check,
  PauseCircle,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Business } from '@/types/database';
import {
  changeSubscriptionPlan,
  cancelOrPauseSubscription,
  type SubscriptionPlanId,
  type BillingCycle,
} from '@/actions/subscription';
import { updateBillingDetails, updatePaymentMethodAction } from '@/actions/business';

interface BillingViewProps {
  business: Business;
}

export function BillingView({ business }: BillingViewProps) {
  const { t, language } = useLanguage();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isPending, startTransition] = useTransition();

  // Plan selector states
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>('business');
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('monthly');

  // Cancel / Pause Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelAction, setCancelAction] = useState<'cancelled' | 'paused'>('cancelled');

  // Payment Method Modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethodType, setSelectedMethodType] = useState('edahabia');
  const [cardLast4, setCardLast4] = useState('4128');

  // Billing Contact Form
  const [billingName, setBillingName] = useState(business.billing_name || business.name || '');
  const [billingAddress, setBillingAddress] = useState(business.billing_address || business.address || 'Alger Centre, Alger');
  const [billingEmail, setBillingEmail] = useState(business.billing_email || business.email || '');
  const [taxIdNif, setTaxIdNif] = useState(business.tax_id_nif || '002116091234567');
  const [nis, setNis] = useState(business.nis || '19981600123');
  const [rc, setRc] = useState(business.rc || '16/00-0987654B22');

  // Trial / subscription status
  const isTrial = business.subscription_status === 'trial';
  const isCancelled = business.subscription_status === 'cancelled';
  const isPaused = business.subscription_status === 'paused';
  const currentPlanName = business.plan_name || 'Hbibna Business Pro';
  const currentPlanPrice = business.plan_price_da || 9800;
  const currentPaymentMethod = business.payment_method || 'Carte CIB / Edahabia (•••• 4128)';

  // Calculate renewal date (1 month from today)
  const nextRenewalDate = new Date();
  nextRenewalDate.setDate(nextRenewalDate.getDate() + 28);
  const formattedRenewal = nextRenewalDate.toLocaleDateString(
    language === 'ar' ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  // Invoices mock history
  const invoices = [
    {
      id: 'INV-2026-003',
      date: '13 Oct 2026',
      amount: currentPlanPrice,
      status: 'paid',
      plan: currentPlanName,
    },
    {
      id: 'INV-2026-002',
      date: '13 Sep 2026',
      amount: currentPlanPrice,
      status: 'paid',
      plan: currentPlanName,
    },
    {
      id: 'INV-2026-001',
      date: '13 Aoû 2026',
      amount: currentPlanPrice,
      status: 'paid',
      plan: currentPlanName,
    },
  ];

  // Handle plan change submission
  const handlePlanChange = () => {
    const formData = new FormData();
    formData.append('planId', selectedPlanId);
    formData.append('cycle', selectedCycle);

    startTransition(async () => {
      try {
        const res = await changeSubscriptionPlan(formData);
        if (res?.error) {
          toastError(res.error);
        } else {
          toastSuccess('Abonnement mis à jour avec succès.');
          setShowPlanModal(false);
        }
      } catch {
        toastError('Erreur lors du changement de forfait.');
      }
    });
  };

  // Handle cancel / pause
  const handleCancelOrPause = () => {
    const formData = new FormData();
    formData.append('actionType', cancelAction);

    startTransition(async () => {
      try {
        const res = await cancelOrPauseSubscription(formData);
        if (res?.error) {
          toastError(res.error);
        } else {
          toastSuccess(
            cancelAction === 'paused'
              ? 'Compte suspendu temporairement.'
              : 'Abonnement résilié avec succès.'
          );
          setShowCancelModal(false);
        }
      } catch {
        toastError('Erreur lors de la mise à jour.');
      }
    });
  };

  // Handle payment method update
  const handlePaymentMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let methodLabel = '';
    if (selectedMethodType === 'edahabia') {
      methodLabel = `Carte Edahabia (•••• ${cardLast4})`;
    } else if (selectedMethodType === 'cib') {
      methodLabel = `Carte CIB Satim (•••• ${cardLast4})`;
    } else if (selectedMethodType === 'baridimob') {
      methodLabel = 'BaridiMob (RIP Algérie Poste)';
    } else {
      methodLabel = 'Virement bancaire / CCP';
    }

    const formData = new FormData();
    formData.append('payment_method', methodLabel);

    startTransition(async () => {
      try {
        const res = await updatePaymentMethodAction(formData);
        if (res?.error) {
          toastError(res.error);
        } else {
          toastSuccess('Moyen de paiement enregistré.');
          setShowPaymentModal(false);
        }
      } catch {
        toastError('Erreur lors de la mise à jour.');
      }
    });
  };

  // Handle billing details update
  const handleBillingDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('billing_name', billingName);
    formData.append('billing_address', billingAddress);
    formData.append('billing_email', billingEmail);
    formData.append('tax_id_nif', taxIdNif);
    formData.append('nis', nis);
    formData.append('rc', rc);

    startTransition(async () => {
      try {
        const res = await updateBillingDetails(formData);
        if (res?.error) {
          toastError(res.error);
        } else {
          toastSuccess('Coordonnées de facturation enregistrées.');
        }
      } catch {
        toastError('Erreur lors de l’enregistrement.');
      }
    });
  };

  // Download PDF invoice helper
  const handleDownloadInvoice = (inv: typeof invoices[0]) => {
    // Generate simple printable/downloadable receipt
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toastError('Veuillez autoriser les fenêtres pop-up pour télécharger la facture.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${inv.id} - Hbibna</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; }
            .header { display: flex; justify-content: space-between; border-bottom: 3px solid #000; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 900; background: #FFE600; padding: 4px 12px; border: 2px solid #000; display: inline-block; }
            .meta { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .box { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #000; padding: 12px; text-align: left; }
            th { background: #FFE600; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; }
            .badge { display: inline-block; background: #10B981; color: white; padding: 4px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">HBIBNA.DZ</div>
              <p style="margin: 5px 0 0; font-size: 13px; color: #666;">Plateforme de Fidélisation & Cartes Wallet en Algérie</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0;">FACTURE OFFICIELLE</h2>
              <p style="margin: 4px 0 0; font-weight: bold;">N° ${inv.id}</p>
              <p style="margin: 4px 0 0; color: #666;">Date : ${inv.date}</p>
              <div class="badge">PAYÉE / ACQUITTÉE</div>
            </div>
          </div>

          <div class="meta">
            <div class="box">
              <strong>ÉMETTEUR :</strong><br/>
              HBIBNA SAS ALGERIA<br/>
              02 Rue Didouche Mourad, Alger<br/>
              NIF : 002316098765432 | RC : 16/00-1234567<br/>
              support@hbibna.dz
            </div>
            <div class="box">
              <strong>CLIENT / DESTINATAIRE :</strong><br/>
              ${billingName || business.name}<br/>
              ${billingAddress}<br/>
              ${taxIdNif ? `NIF : ${taxIdNif}<br/>` : ''}
              ${rc ? `RC : ${rc}<br/>` : ''}
              Email : ${billingEmail || business.email || 'N/A'}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Période</th>
                <th>Moyen de règlement</th>
                <th style="text-align: right;">Montant (DZD)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Abonnement Plateforme Hbibna (${inv.plan})</td>
                <td>1 Mois (Renouvelable)</td>
                <td>${currentPaymentMethod}</td>
                <td style="text-align: right; font-weight: bold;">${inv.amount.toLocaleString()} DA</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Net TTC : ${inv.amount.toLocaleString()} DA
          </div>

          <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #777; text-align: center;">
            Document généré électroniquement par Hbibna Algérie. Fait foi de quittance de paiement pour vos écritures comptables.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-5xl space-y-8 text-start font-rounded pb-16">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[#FFE600] border-2 border-black shadow-[0_2px_0_#000]">
            Espace Financier
          </span>
          <span className="text-xs font-bold text-black/60">
            Algérie / DZD
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
          Facturation & Abonnement
        </h1>
        <p className="text-sm text-black/70 font-bold mt-1">
          Gérez votre formule Hbibna, vos moyens de paiement CIB/Edahabia et vos justificatifs de comptabilité.
        </p>
      </div>

      {/* 1. Active Plan Overview Card */}
      <div className="bg-[#FFE600] border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] relative overflow-hidden">
        {/* Decorative corner accent */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/20 rounded-full pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b-2 border-black/15">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_4px_0_#000]">
              <Sparkles className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-black text-2xl text-black">{currentPlanName}</h2>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-black border-2 border-black shadow-[0_2px_0_#000] ${
                    isCancelled
                      ? 'bg-rose-500 text-white'
                      : isPaused
                      ? 'bg-amber-400 text-black'
                      : isTrial
                      ? 'bg-blue-500 text-white'
                      : 'bg-black text-[#FFE600]'
                  }`}
                >
                  {isCancelled
                    ? 'RÉSILIÉ'
                    : isPaused
                    ? 'SUSPENDU'
                    : isTrial
                    ? 'ESSAI GRATUIT (14J)'
                    : 'ABONNEMENT ACTIF'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-black/80 font-bold mt-1">
                Accès illimité au système de fidélisation Apple Wallet & Google Wallet
              </p>
            </div>
          </div>

          <div className="ltr:text-left lg:ltr:text-right rtl:text-right lg:rtl:text-left bg-white/70 backdrop-blur-xs p-4 rounded-2xl border-2 border-black shadow-[0_4px_0_#000]">
            <span className="text-[11px] font-black uppercase text-black/60 block">
              Tarif Actuel
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-black font-mono">
                {currentPlanPrice.toLocaleString()}
              </span>
              <span className="text-base font-black text-black">DA</span>
              <span className="text-xs font-bold text-black/70">/ mois</span>
            </div>
          </div>
        </div>

        {/* Free trial / Renewal progress bar */}
        {isTrial && (
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_3px_0_#000] space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-2 text-black">
                <Clock className="w-4 h-4 text-blue-600" />
                Période d&apos;essai gratuite
              </span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                11 jours restants sur 14
              </span>
            </div>
            <div className="w-full h-3 bg-black/10 rounded-full overflow-hidden border border-black/20">
              <div className="h-full bg-blue-600 rounded-full w-[78%]" />
            </div>
            <p className="text-[11px] text-black/70 font-bold">
              Votre carte ne sera débitée qu&apos;à la fin de la période d&apos;essai. Vous pouvez résilier sans frais à tout moment.
            </p>
          </div>
        )}

        {/* Status badges row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold pt-2">
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000]">
            <span className="text-black/60 font-black">Prochaine Échéance</span>
            <p className="font-black text-sm sm:text-base text-black mt-1 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-black/60" />
              {formattedRenewal}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000]">
            <span className="text-black/60 font-black">Moyen de Règlement</span>
            <p className="font-black text-sm text-black mt-1 truncate">
              {currentPaymentMethod}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000]">
            <span className="text-black/60 font-black">Statut du Renouvellement</span>
            <p className="font-black text-sm text-emerald-700 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Automatique & Sécurisé
            </p>
          </div>
        </div>

        {/* Plan actions */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-black border-2 border-black shadow-[0_3px_0_#000] hover:shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
          >
            Suspendre ou Résilier
          </button>
          <button
            type="button"
            onClick={() => setShowPlanModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black hover:bg-neutral-800 text-[#FFE600] text-xs font-black border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Changer ou Mettre à niveau le Plan
          </button>
        </div>
      </div>

      {/* 2. Payment Method Management */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE600] border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-black">Moyen de Paiement Principal</h3>
              <p className="text-xs text-black/60 font-bold">
                Cartes bancaires nationales CIB, Edahabia et virements BaridiMob
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFF9D2] hover:bg-[#FFE600] text-black text-xs font-black border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            Modifier le Moyen de Paiement
          </button>
        </div>

        {/* Current Active Payment Card Presentation */}
        <div className="p-5 rounded-2xl bg-[#FFF9D2] border-2 border-black shadow-[0_4px_0_#000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-9 rounded-lg bg-emerald-600 text-white font-mono font-black text-xs flex items-center justify-center border-2 border-black shadow-[0_2px_0_#000]">
              CIB/DZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-black text-sm text-black">{currentPaymentMethod}</p>
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-300">
                  Par défaut
                </span>
              </div>
              <p className="text-xs text-black/70 font-bold mt-0.5">
                Prélèvements sécurisés sous convention interbancaire Satim / Algérie Poste
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-black/60">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Paiement certifié 3D-Secure
          </div>
        </div>
      </div>

      {/* 3. Billing Legal Information (NIF, NIS, RC) */}
      <form
        onSubmit={handleBillingDetailsSubmit}
        className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <Building2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-lg text-black">Informations Fiscales & Facturation</h3>
            <p className="text-xs text-black/60 font-bold">
              Ces mentions apparaîtront automatiquement sur vos factures conformes à la législation algérienne.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Billing Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Raison Sociale / Nom Facturation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={billingName}
              onChange={(e) => setBillingName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Billing Email */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Email Destinataire des Factures <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="comptabilite@commerce.dz"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Tax ID NIF */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              NIF (Identifiant Fiscal)
            </label>
            <input
              type="text"
              value={taxIdNif}
              onChange={(e) => setTaxIdNif(e.target.value)}
              placeholder="002116091234567"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-mono font-bold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* NIS */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              NIS (Identifiant Statistique)
            </label>
            <input
              type="text"
              value={nis}
              onChange={(e) => setNis(e.target.value)}
              placeholder="19981600123"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-mono font-bold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* RC */}
          <div>
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              RC (Registre du Commerce)
            </label>
            <input
              type="text"
              value={rc}
              onChange={(e) => setRc(e.target.value)}
              placeholder="16/00-0987654B22"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-mono font-bold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>

          {/* Billing Address */}
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-black text-black mb-1.5 uppercase tracking-wide">
              Adresse du Siège Social
            </label>
            <input
              type="text"
              value={billingAddress}
              onChange={(e) => setBillingAddress(e.target.value)}
              placeholder="08 Boulevard Sidi Yahia, Hydra, Alger"
              className="w-full px-4 py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm text-black font-extrabold shadow-[0_3px_0_#000] focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#FFE600] hover:bg-yellow-400 active:translate-y-1 active:shadow-none text-black text-sm font-black border-2 border-black shadow-[0_4px_0_#000] transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isPending ? 'Enregistrement...' : 'Enregistrer les Mentions Légales'}</span>
          </button>
        </div>
      </form>

      {/* 4. Invoice History Table */}
      <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 shadow-[0_8px_0_#000] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border-2 border-black text-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-black">Historique des Factures & Reçus</h3>
              <p className="text-xs text-black/60 font-bold">
                Consultez et téléchargez vos factures acquittées au format PDF
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-bold border-separate border-spacing-y-2">
            <thead>
              <tr className="text-black/60 uppercase tracking-wider text-[11px]">
                <th className="py-2 px-4">N° Facture</th>
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Plan / Description</th>
                <th className="py-2 px-4">Montant</th>
                <th className="py-2 px-4">Statut</th>
                <th className="py-2 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="bg-[#FFF9D2] hover:bg-yellow-100 transition-colors border-2 border-black rounded-2xl"
                >
                  <td className="py-3.5 px-4 font-mono font-black text-black rounded-l-2xl border-y-2 border-l-2 border-black">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-4 text-black font-semibold border-y-2 border-black">
                    {inv.date}
                  </td>
                  <td className="py-3.5 px-4 text-black font-bold border-y-2 border-black">
                    {inv.plan}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-black border-y-2 border-black">
                    {inv.amount.toLocaleString()} DA
                  </td>
                  <td className="py-3.5 px-4 border-y-2 border-black">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-200 text-emerald-900 border border-emerald-400">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Payée
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right rounded-r-2xl border-y-2 border-r-2 border-black">
                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(inv)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-black hover:text-[#FFE600] text-black text-xs font-black border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Change / Upgrade Plan */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-[0_12px_0_#000] space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black/10">
              <div>
                <h3 className="text-xl font-black text-black">Changer de Formule</h3>
                <p className="text-xs text-black/60 font-bold">
                  Sélectionnez l&apos;offre la plus adaptée à l&apos;évolution de votre commerce
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="p-2 rounded-xl text-black hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cycle toggle */}
            <div className="flex justify-center">
              <div className="bg-[#FFF9D2] p-1.5 rounded-2xl border-2 border-black flex gap-1 shadow-[0_3px_0_#000]">
                <button
                  type="button"
                  onClick={() => setSelectedCycle('monthly')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    selectedCycle === 'monthly'
                      ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                      : 'text-black hover:bg-white/60'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCycle('annual')}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                    selectedCycle === 'annual'
                      ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                      : 'text-black hover:bg-white/60'
                  }`}
                >
                  <span>Annuel</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-[#FFE600] text-black text-[10px] font-black border border-black">
                    -20% (2 mois offerts)
                  </span>
                </button>
              </div>
            </div>

            {/* Tier cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Starter */}
              <div
                onClick={() => setSelectedPlanId('starter')}
                className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  selectedPlanId === 'starter'
                    ? 'bg-[#FFE600] shadow-[0_6px_0_#000] scale-[1.02]'
                    : 'bg-white hover:bg-[#FFF9D2] shadow-[0_3px_0_#000]'
                }`}
              >
                <h4 className="font-black text-sm text-black">Starter</h4>
                <div className="mt-2 font-mono font-black text-xl text-black">
                  {selectedCycle === 'annual' ? '49 000 DA' : '4 900 DA'}
                  <span className="text-xs font-normal text-black/70">
                    /{selectedCycle === 'annual' ? 'an' : 'mois'}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-[11px] font-bold text-black/80">
                  <li className="flex items-center gap-1">✓ Jusqu&apos;à 500 clients</li>
                  <li className="flex items-center gap-1">✓ Apple & Google Wallet</li>
                  <li className="flex items-center gap-1">✓ Scanner QR Caisse</li>
                </ul>
              </div>

              {/* Business Pro */}
              <div
                onClick={() => setSelectedPlanId('business')}
                className={`p-4 rounded-2xl border-2 border-black cursor-pointer relative transition-all ${
                  selectedPlanId === 'business'
                    ? 'bg-[#FFE600] shadow-[0_6px_0_#000] scale-[1.02]'
                    : 'bg-white hover:bg-[#FFF9D2] shadow-[0_3px_0_#000]'
                }`}
              >
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black bg-black text-[#FFE600] border border-black">
                  POPULAIRE
                </span>
                <h4 className="font-black text-sm text-black">Business Pro</h4>
                <div className="mt-2 font-mono font-black text-xl text-black">
                  {selectedCycle === 'annual' ? '98 000 DA' : '9 800 DA'}
                  <span className="text-xs font-normal text-black/70">
                    /{selectedCycle === 'annual' ? 'an' : 'mois'}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-[11px] font-bold text-black/80">
                  <li className="flex items-center gap-1">✓ Clients ILLIMITÉS</li>
                  <li className="flex items-center gap-1">✓ Notifications Push</li>
                  <li className="flex items-center gap-1">✓ Campagnes & Récompenses</li>
                  <li className="flex items-center gap-1">✓ Support prioritaire 7j/7</li>
                </ul>
              </div>

              {/* Enterprise */}
              <div
                onClick={() => setSelectedPlanId('enterprise')}
                className={`p-4 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  selectedPlanId === 'enterprise'
                    ? 'bg-[#FFE600] shadow-[0_6px_0_#000] scale-[1.02]'
                    : 'bg-white hover:bg-[#FFF9D2] shadow-[0_3px_0_#000]'
                }`}
              >
                <h4 className="font-black text-sm text-black">Élite Entreprise</h4>
                <div className="mt-2 font-mono font-black text-xl text-black">
                  {selectedCycle === 'annual' ? '180 000 DA' : '18 000 DA'}
                  <span className="text-xs font-normal text-black/70">
                    /{selectedCycle === 'annual' ? 'an' : 'mois'}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5 text-[11px] font-bold text-black/80">
                  <li className="flex items-center gap-1">✓ Multi-établissements</li>
                  <li className="flex items-center gap-1">✓ API & Webhooks sur mesure</li>
                  <li className="flex items-center gap-1">✓ Accompagnement dédié</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2.5 rounded-2xl border-2 border-black font-black text-xs hover:bg-black/5"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handlePlanChange}
                className="px-6 py-2.5 rounded-2xl bg-black text-[#FFE600] font-black text-xs border-2 border-black shadow-[0_3px_0_#000] hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? 'Mise à jour...' : 'Confirmer le Changement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Cancel / Pause Subscription */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_12px_0_#000] space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border-2 border-black flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-lg text-black">Gérer votre Abonnement</h3>
                <p className="text-xs text-black/60 font-bold">Suspension ou résiliation</p>
              </div>
            </div>

            <p className="text-xs text-black/80 font-bold leading-relaxed">
              Vous pouvez soit <strong>suspendre</strong> temporairement les prélèvements (vos données et passes clients restent intacts), soit <strong>résilier définitivement</strong>.
            </p>

            <div className="space-y-3">
              <label
                onClick={() => setCancelAction('paused')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  cancelAction === 'paused'
                    ? 'bg-[#FFF9D2] shadow-[0_3px_0_#000]'
                    : 'bg-white hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancelType"
                  checked={cancelAction === 'paused'}
                  onChange={() => setCancelAction('paused')}
                  className="mt-1"
                />
                <div>
                  <p className="font-black text-xs text-black">Mettre en pause (Recommandé)</p>
                  <p className="text-[11px] text-black/70">
                    Gèle les prélèvements jusqu&apos;à réactivation. Les passes existants restent fonctionnels.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setCancelAction('cancelled')}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  cancelAction === 'cancelled'
                    ? 'bg-rose-50 border-rose-600 shadow-[0_3px_0_#000]'
                    : 'bg-white hover:bg-neutral-50'
                }`}
              >
                <input
                  type="radio"
                  name="cancelType"
                  checked={cancelAction === 'cancelled'}
                  onChange={() => setCancelAction('cancelled')}
                  className="mt-1"
                />
                <div>
                  <p className="font-black text-xs text-rose-700">Résilier l&apos;abonnement</p>
                  <p className="text-[11px] text-black/70">
                    Maintient l&apos;accès jusqu&apos;à la fin du cycle en cours ({formattedRenewal}), puis désactive les fonctionnalités pro.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-2xl border-2 border-black font-black text-xs hover:bg-black/5"
              >
                Conserver mon offre
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleCancelOrPause}
                className="px-5 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-xs border-2 border-black shadow-[0_3px_0_#000] hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? 'En cours...' : 'Confirmer la décision'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Update Payment Method */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handlePaymentMethodSubmit}
            className="bg-white border-2 border-black rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_12px_0_#000] space-y-5"
          >
            <div className="flex items-center justify-between pb-2 border-b-2 border-black/10">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="font-black text-lg text-black">Moyen de Paiement</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-xl text-black hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label
                onClick={() => setSelectedMethodType('edahabia')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  selectedMethodType === 'edahabia'
                    ? 'bg-[#FFE600] shadow-[0_3px_0_#000]'
                    : 'bg-white hover:bg-[#FFF9D2]'
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  checked={selectedMethodType === 'edahabia'}
                  onChange={() => setSelectedMethodType('edahabia')}
                />
                <span className="font-black text-xs text-black">
                  Carte Edahabia (Algérie Poste)
                </span>
              </label>

              <label
                onClick={() => setSelectedMethodType('cib')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  selectedMethodType === 'cib'
                    ? 'bg-[#FFE600] shadow-[0_3px_0_#000]'
                    : 'bg-white hover:bg-[#FFF9D2]'
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  checked={selectedMethodType === 'cib'}
                  onChange={() => setSelectedMethodType('cib')}
                />
                <span className="font-black text-xs text-black">
                  Carte Bancaire CIB (Banques Algériennes)
                </span>
              </label>

              <label
                onClick={() => setSelectedMethodType('baridimob')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  selectedMethodType === 'baridimob'
                    ? 'bg-[#FFE600] shadow-[0_3px_0_#000]'
                    : 'bg-white hover:bg-[#FFF9D2]'
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  checked={selectedMethodType === 'baridimob'}
                  onChange={() => setSelectedMethodType('baridimob')}
                />
                <span className="font-black text-xs text-black">
                  BaridiMob (Virement Instantané)
                </span>
              </label>

              <label
                onClick={() => setSelectedMethodType('ccp')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 border-black cursor-pointer transition-all ${
                  selectedMethodType === 'ccp'
                    ? 'bg-[#FFE600] shadow-[0_3px_0_#000]'
                    : 'bg-white hover:bg-[#FFF9D2]'
                }`}
              >
                <input
                  type="radio"
                  name="payMethod"
                  checked={selectedMethodType === 'ccp'}
                  onChange={() => setSelectedMethodType('ccp')}
                />
                <span className="font-black text-xs text-black">
                  Virement Bancaire / CCP
                </span>
              </label>
            </div>

            {(selectedMethodType === 'edahabia' || selectedMethodType === 'cib') && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-black text-black mb-1 uppercase">
                    4 Derniers Chiffres de la Carte
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={cardLast4}
                    onChange={(e) => setCardLast4(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-black bg-[#FFF9D2] font-mono font-black text-sm text-center shadow-[0_2px_0_#000]"
                    placeholder="4128"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2.5 rounded-2xl border-2 border-black font-black text-xs hover:bg-black/5"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-2xl bg-black text-[#FFE600] font-black text-xs border-2 border-black shadow-[0_3px_0_#000] hover:bg-neutral-800 disabled:opacity-50 cursor-pointer"
              >
                {isPending ? 'Enregistrement...' : 'Valider le Moyen de Paiement'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
