'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  ArrowRight,
  Gift,
  Coins,
  UserPlus,
  Smartphone,
  ChevronDown,
  ChevronUp,
  X,
  Trophy,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface WelcomeGuideProps {
  hasConfiguredLoyalty: boolean;
  hasRewards: boolean;
  hasCustomers: boolean;
  hasTransactions?: boolean;
  onOpenAddCustomer?: () => void;
}

export function WelcomeGuide({
  hasConfiguredLoyalty,
  hasRewards,
  hasCustomers,
  hasTransactions,
  onOpenAddCustomer,
}: WelcomeGuideProps) {
  const { t, language, isRtl } = useLanguage();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load persistence from localStorage
  useEffect(() => {
    try {
      const savedDismissed = localStorage.getItem('hbibna_welcome_guide_dismissed');
      if (savedDismissed === 'true') {
        setIsDismissed(true);
      }
      const savedCollapsed = localStorage.getItem('hbibna_welcome_guide_collapsed');
      if (savedCollapsed === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore localStorage errors in SSR or restricted environments
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('hbibna_welcome_guide_dismissed', 'true');
    } catch {}
  };

  const handleToggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem('hbibna_welcome_guide_collapsed', String(next));
    } catch {}
  };

  const handleRestore = () => {
    setIsDismissed(false);
    setIsCollapsed(false);
    try {
      localStorage.removeItem('hbibna_welcome_guide_dismissed');
      localStorage.removeItem('hbibna_welcome_guide_collapsed');
    } catch {}
  };

  // 4 setup steps
  const steps = [
    {
      id: 'step1',
      title: t('onboarding.step1Title') || 'Règles de points de fidélité',
      desc:
        t('onboarding.step1Desc') ||
        'Définissez combien de points vos clients gagnent à chaque achat en Dinars (ex: 1 pt par 100 DA).',
      actionLabel: t('onboarding.step1Action') || 'Configurer les points',
      href: '/loyalty',
      icon: Coins,
      completed: hasConfiguredLoyalty,
    },
    {
      id: 'step2',
      title: t('onboarding.step2Title') || 'Créez votre 1ère récompense',
      desc:
        t('onboarding.step2Desc') ||
        'Ajoutez un cadeau ou une remise motivante (ex: Café offert à 50 pts, remise à 150 pts).',
      actionLabel: t('onboarding.step2Action') || 'Créer une récompense',
      href: '/rewards',
      icon: Gift,
      completed: hasRewards,
    },
    {
      id: 'step3',
      title: t('onboarding.step3Title') || 'Inscrivez votre 1er client test',
      desc:
        t('onboarding.step3Desc') ||
        "Enregistrez un premier client pour tester la génération du pass et le flux d'encaissement.",
      actionLabel: t('onboarding.step3Action') || 'Ajouter un client',
      href: '/customers',
      onClick: onOpenAddCustomer,
      icon: UserPlus,
      completed: hasCustomers,
    },
    {
      id: 'step4',
      title: t('onboarding.step4Title') || 'Découvrez le Pass VIP mobile',
      desc:
        t('onboarding.step4Desc') ||
        'Visualisez la carte 3D et le QR code dynamique anti-fraude tel que le client le voit.',
      actionLabel: t('onboarding.step4Action') || 'Tester le pass client',
      href: '/customer',
      external: true,
      icon: Smartphone,
      completed: hasCustomers || hasTransactions || false,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);
  const allCompleted = completedCount === totalSteps;

  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleRestore}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF9D2] border-2 border-black text-xs font-black text-black shadow-[0_2px_0_#000] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E25B6C]" />
          <span>{t('onboarding.showGuide') || 'Afficher le guide de bienvenue'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#FFF9D2] border-2 border-black rounded-3xl p-5 sm:p-7 shadow-[0_8px_0_#000] relative overflow-hidden transition-all text-start font-rounded space-y-5">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FFE600] border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            {allCompleted ? (
              <Trophy className="w-6 h-6 text-black stroke-[2.5]" />
            ) : (
              <Sparkles className="w-6 h-6 text-black stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-black tracking-tight">
                {allCompleted
                  ? t('onboarding.allDoneTitle') || 'Félicitations ! Votre programme est 100% prêt'
                  : t('onboarding.welcomeTitle') || 'Guide de bienvenue & mise en route'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-black text-[#FFE600] border border-black shrink-0 font-mono">
                {completedCount}/{totalSteps}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-black/75 font-semibold mt-0.5">
              {allCompleted
                ? t('onboarding.allDoneSubtitle') ||
                  'Votre établissement est prêt à accueillir et récompenser ses premiers clients fidèles.'
                : t('onboarding.welcomeSubtitle') ||
                  'Configurez votre programme en 4 étapes simples pour commencer à fidéliser vos clients.'}
            </p>
          </div>
        </div>

        {/* Controls: collapse / close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleToggleCollapse}
            className="p-1.5 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-black shadow-[0_2px_0_#000] transition-colors cursor-pointer"
            aria-label={isCollapsed ? 'Déplier' : 'Réduire'}
            title={isCollapsed ? 'Déplier' : 'Réduire'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl bg-white hover:bg-neutral-100 border-2 border-black text-black shadow-[0_2px_0_#000] transition-colors cursor-pointer"
            aria-label={t('onboarding.hideGuide') || 'Masquer le guide'}
            title={t('onboarding.hideGuide') || 'Masquer le guide'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-black text-black/80">
          <span>
            {t('onboarding.progressLabel') || 'Mise en route'} : {completedCount} sur {totalSteps}{' '}
            {t('onboarding.completed') || 'terminée(s)'}
          </span>
          <span className="font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
            {progressPercent}% {t('onboarding.readyPercent') || 'prêt'}
          </span>
        </div>
        <div className="w-full h-3 bg-white rounded-full border-2 border-black overflow-hidden p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              allCompleted ? 'bg-emerald-500' : 'bg-black'
            }`}
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Steps List (Collapsible) */}
      {!isCollapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-2xl border-2 border-black flex flex-col justify-between gap-3 transition-all ${
                  step.completed
                    ? 'bg-emerald-50/80 border-black shadow-[0_3px_0_#000]'
                    : 'bg-white border-black shadow-[0_4px_0_#000]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center font-mono text-[10px] font-black bg-[#FFE600]">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-black tracking-tight ${
                          step.completed ? 'text-emerald-950 line-through opacity-75' : 'text-black'
                        }`}
                      >
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-black/70 font-semibold leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Step Action Button */}
                <div className="flex justify-end pt-1">
                  {step.onClick ? (
                    <button
                      type="button"
                      onClick={step.onClick}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-black text-xs font-black shadow-[0_2px_0_#000] hover:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                        step.completed
                          ? 'bg-white hover:bg-neutral-100 text-black'
                          : 'bg-[#FFE600] hover:bg-yellow-400 text-black'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </button>
                  ) : (
                    <Link
                      href={step.href}
                      target={step.external ? '_blank' : undefined}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border-2 border-black text-xs font-black shadow-[0_2px_0_#000] hover:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                        step.completed
                          ? 'bg-white hover:bg-neutral-100 text-black'
                          : 'bg-[#FFE600] hover:bg-yellow-400 text-black'
                      }`}
                    >
                      <StepIcon className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
