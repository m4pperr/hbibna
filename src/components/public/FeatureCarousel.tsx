'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sliders,
  Users,
  Smartphone,
  Gift,
  Receipt,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function FeatureCarousel() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const isFr = language === 'fr';

  const features = [
    {
      id: 'offline-mode',
      icon: WifiOff,
      title: isAr
        ? 'يعمل حتى بدون إنترنت'
        : isFr
        ? 'Fonctionne même sans internet'
        : 'Works even without internet',
      description: isAr
        ? 'انقطعت الشبكة؟ تستمر الكاشير في العمل بشكل طبيعي وتُسجل العمليات وتتزامن تلقائياً فور عودة الاتصال.'
        : isFr
        ? 'Pas de connexion ? La caisse continue de fonctionner. Les opérations sont enregistrées et synchronisées automatiquement dès que le réseau revient.'
        : 'No connection? Cashier keeps working uninterrupted. Transactions are saved and auto-synced as soon as you reconnect.',
      badge: isAr ? 'وضع عدم الاتصال' : isFr ? 'Mode Hors Ligne 100%' : '100% Offline Mode',
    },
    {
      id: 'points-rules',
      icon: Sliders,
      title: isAr
        ? 'معادلة نقاط مخصصة'
        : isFr
        ? 'Règles de points sur mesure'
        : 'Custom Points Rules',
      description: isAr
        ? 'حدد بدقة كيف يكسب عملاؤك النقاط، سواء بقيمة المشتريات أو عدد الزيارات.'
        : isFr
        ? 'Définissez précisément comment vos clients cumulent leurs points, au montant ou par visite.'
        : 'Choose exactly how customers earn points.',
      badge: isAr ? 'نظام مرن' : isFr ? 'Moteur flexible' : 'Flexible Engine',
    },
    {
      id: 'customer-management',
      icon: Users,
      title: isAr
        ? 'إدارة العملاء'
        : isFr
        ? 'Gestion des clients'
        : 'Customer Management',
      description: isAr
        ? 'احتفظ ببيانات وأرصدة عملائك منظمة ومحمية بالكامل في متناول يدك.'
        : isFr
        ? 'Gardez tous vos clients fidèles organisés et sécurisés à portée de main.'
        : 'Keep all your loyalty customers organized.',
      badge: isAr ? 'دليل آمن' : isFr ? 'Répertoire isolé' : 'Isolated Directory',
    },
    {
      id: 'digital-card',
      icon: Smartphone,
      title: isAr
        ? 'بطاقة ولاء رقمية'
        : isFr
        ? 'Carte de fidélité numérique'
        : 'Digital Loyalty Card',
      description: isAr
        ? 'يستطيع عملاؤك متابعة نقاطهم ومكافآتهم مباشرة من هواتفهم بدون تثبيت أي تطبيق.'
        : isFr
        ? 'Vos clients consultent leurs points et récompenses depuis leur smartphone sans application.'
        : 'Customers can check their points from their phone.',
      badge: isAr ? 'بدون تحميل' : isFr ? 'Zéro installation' : 'Zero-App Install',
    },
    {
      id: 'rewards',
      icon: Gift,
      title: isAr
        ? 'دليل المكافآت'
        : isFr
        ? 'Catalogue de récompenses'
        : 'Rewards',
      description: isAr
        ? 'أنشئ هدايا وخصومات مميزة تجذب عملاءك وتشجعهم على تكرار الزيارة.'
        : isFr
        ? 'Créez des récompenses et réductions attractives qui fidélisent durablement vos clients.'
        : 'Create rewards that customers actually want.',
      badge: isAr ? 'مكافآت مخصصة' : isFr ? 'Catalogue par paliers' : 'Tiered Catalog',
    },
    {
      id: 'purchase-tracking',
      icon: Receipt,
      title: isAr
        ? 'تسجيل المشتريات'
        : isFr
        ? 'Enregistrement des achats'
        : 'Purchase Tracking',
      description: isAr
        ? 'سجل المشتريات واحتسب النقاط تلقائياً في ثوانٍ معدودة عند الكاونتر.'
        : isFr
        ? 'Enregistrez les passages et créditez les points automatiquement en quelques secondes au comptoir.'
        : 'Record purchases and automatically award points.',
      badge: isAr ? 'سرعة فائقة' : isFr ? 'Rapidité en caisse' : 'Counter Speed',
    },
    {
      id: 'simple-dashboard',
      icon: LayoutDashboard,
      title: isAr
        ? 'لوحة تحكم سهلة'
        : isFr
        ? 'Tableau de bord intuitif'
        : 'Simple Dashboard',
      description: isAr
        ? 'تابع تطور برنامج الولاء ونشاط عملائك بلمحة واحدة واضحة وبسيطة.'
        : isFr
        ? 'Suivez l\'évolution de votre programme de fidélité et l\'activité de vos clients en un clin d\'œil.'
        : 'See your loyalty program at a glance.',
      badge: isAr ? 'نظرة فورية' : isFr ? 'Vue en direct' : 'Live Overview',
    },
  ];

  const AUTOPLAY_DURATION = 5000;
  const TIMER_INTERVAL = 30;
  const SWIPE_THRESHOLD = 45;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const mouseStartX = useRef<number | null>(null);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const goToSlide = useCallback(
    (targetIndex: number, direction?: 'next' | 'prev') => {
      if (targetIndex === currentIndex) return;

      const determinedDirection =
        direction || (targetIndex > currentIndex ? 'next' : 'prev');

      let finalDir = determinedDirection;
      if (currentIndex === features.length - 1 && targetIndex === 0) finalDir = 'next';
      if (currentIndex === 0 && targetIndex === features.length - 1) finalDir = 'prev';

      setSlideDirection(finalDir);
      setIsAnimating(true);
      setCurrentIndex(targetIndex);
      setProgress(0);

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, prefersReducedMotion ? 50 : 380);

      return () => clearTimeout(timer);
    },
    [currentIndex, features.length, prefersReducedMotion]
  );

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % features.length;
    goToSlide(nextIdx, 'next');
  }, [currentIndex, features.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIdx = (currentIndex - 1 + features.length) % features.length;
    goToSlide(prevIdx, 'prev');
  }, [currentIndex, features.length, goToSlide]);

  useEffect(() => {
    if (isPaused || isDragging) return;

    const step = (TIMER_INTERVAL / AUTOPLAY_DURATION) * 100;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + step;
      });
    }, TIMER_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, isDragging, nextSlide]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (isAr) prevSlide();
      else nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (isAr) nextSlide();
      else prevSlide();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe.current) {
      setDragOffset(deltaX * 0.7);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && Math.abs(dragOffset) > SWIPE_THRESHOLD) {
      if (dragOffset < 0) {
        if (isAr) prevSlide();
        else nextSlide();
      } else {
        if (isAr) nextSlide();
        else prevSlide();
      }
    }
    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseStartX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || mouseStartX.current === null) return;
    const deltaX = e.clientX - mouseStartX.current;
    setDragOffset(deltaX * 0.6);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
        if (dragOffset < 0) {
          if (isAr) prevSlide();
          else nextSlide();
        } else {
          if (isAr) nextSlide();
          else prevSlide();
        }
      }
      setIsDragging(false);
      setDragOffset(0);
      mouseStartX.current = null;
    }
  };

  const activeFeature = features[currentIndex];
  const IconComponent = activeFeature.icon;

  const animationClass = prefersReducedMotion
    ? 'opacity-100 transition-opacity duration-150'
    : isAnimating
    ? slideDirection === 'next'
      ? isAr ? 'animate-slide-in-left' : 'animate-slide-in-right'
      : isAr ? 'animate-slide-in-right' : 'animate-slide-in-left'
    : 'translate-x-0 opacity-100';

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Platform Features"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        handleMouseUp();
      }}
      className="relative max-w-xl mx-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-3xl font-rounded"
    >
      {/* Navigation Hint Arrows for Desktop */}
      <div className="hidden sm:flex items-center justify-between absolute -inset-x-5 lg:-inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none z-20">
        <button
          type="button"
          onClick={isAr ? nextSlide : prevSlide}
          aria-label={isAr ? 'العنصر السابق' : isFr ? 'Fonctionnalité précédente' : 'Previous feature'}
          className="pointer-events-auto w-12 h-12 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000] hover:bg-[#FFE600] text-black flex items-center justify-center transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_2px_0_#000] focus:outline-none"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5] rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={isAr ? prevSlide : nextSlide}
          aria-label={isAr ? 'العنصر التالي' : isFr ? 'Fonctionnalité suivante' : 'Next feature'}
          className="pointer-events-auto w-12 h-12 rounded-2xl bg-white border-2 border-black shadow-[0_4px_0_#000] hover:bg-[#FFE600] text-black flex items-center justify-center transition-all cursor-pointer active:translate-y-0.5 active:shadow-[0_2px_0_#000] focus:outline-none"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5] rtl:rotate-180" />
        </button>
      </div>

      {/* Main Single Feature Card Viewport */}
      <div
        className="overflow-hidden rounded-[2.5rem] bg-white border-2 border-black shadow-[0_8px_0_#000] transition-colors cursor-grab active:cursor-grabbing touch-pan-y text-start"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <div
          style={{
            transform: dragOffset ? `translateX(${dragOffset}px)` : undefined,
            transition: isDragging ? 'none' : prefersReducedMotion ? 'none' : 'transform 0.25s ease-out',
          }}
          className={`p-7 sm:p-9 space-y-5 min-h-[260px] sm:min-h-[270px] flex flex-col justify-between ${animationClass}`}
        >
          {/* Card Top Row: Icon + Badge + Slide Counter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
                <IconComponent className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-black bg-[#FFE600] px-3.5 py-1 rounded-xl border-2 border-black shadow-[0_2px_0_#000]">
                {activeFeature.badge}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-[#FFE600] bg-black px-3.5 py-1 rounded-xl border-2 border-black shadow-[0_2px_0_#000]">
              <span className="text-[#FFE600] font-black">{currentIndex + 1}</span>
              <span>/</span>
              <span>{features.length}</span>
            </div>
          </div>

          {/* Card Content: Title & Description */}
          <div className="space-y-2 py-2">
            <h3 className="font-black text-xl sm:text-2xl text-black tracking-tight">
              {activeFeature.title}
            </h3>
            <p className="text-sm sm:text-base text-black/75 font-bold leading-relaxed">
              {activeFeature.description}
            </p>
          </div>

          {/* Subtle Swipe Guidance on Mobile */}
          <div className="flex sm:hidden items-center justify-between text-[11px] font-bold text-black/60 pt-1">
            <span>{isAr ? 'اسحب للاستكشاف ←' : isFr ? '← Glisser pour explorer' : '← Swipe to explore'}</span>
            <span>{isAr ? '← اضغط على النقاط' : isFr ? 'Appuyer sur les points ci-dessous →' : 'Tap dots below →'}</span>
          </div>
        </div>

        {/* 3. TIMER PROGRESS BAR */}
        <div
          className="w-full bg-[#FFF9D2] border-t-2 border-black h-2 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Card rotation timer"
        >
          <div
            className="h-full bg-black transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 9. INDICATOR / POSITION */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        {/* Mobile Next/Prev Buttons */}
        <div className="flex sm:hidden items-center gap-2 order-2 sm:order-1">
          <button
            type="button"
            onClick={isAr ? nextSlide : prevSlide}
            aria-label={isAr ? 'السابق' : isFr ? 'Précédent' : 'Previous feature'}
            className="px-4 py-2 rounded-xl bg-white border-2 border-black hover:bg-[#FFE600] text-xs font-black text-black flex items-center gap-1 shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5] rtl:rotate-180" />
            <span>{isAr ? 'السابق' : isFr ? 'Précédent' : 'Prev'}</span>
          </button>
          <button
            type="button"
            onClick={isAr ? prevSlide : nextSlide}
            aria-label={isAr ? 'التالي' : isFr ? 'Suivant' : 'Next feature'}
            className="px-4 py-2 rounded-xl bg-white border-2 border-black hover:bg-[#FFE600] text-xs font-black text-black flex items-center gap-1 shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all"
          >
            <span>{isAr ? 'التالي' : isFr ? 'Suivant' : 'Next'}</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5] rtl:rotate-180" />
          </button>
        </div>

        {/* Interactive Indicator Dots */}
        <div
          className="flex items-center gap-2.5 order-1 sm:order-2 mx-auto sm:mx-0"
          role="tablist"
          aria-label="Select feature card"
        >
          {features.map((feature, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={feature.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to feature ${idx + 1}: ${feature.title}`}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none border-2 border-black ${
                  isActive
                    ? 'w-8 h-3.5 bg-black'
                    : 'w-3.5 h-3.5 bg-white hover:bg-[#FFE600]'
                }`}
              />
            );
          })}
        </div>

        {/* Interaction status hint */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-black/70 font-bold order-3">
          <Sparkles className="w-4 h-4 text-black" />
          <span>
            {isPaused
              ? isAr
                ? 'متوقف مؤقتاً عند التمرير'
                : isFr
                ? 'Mis en pause au survol'
                : 'Paused on hover'
              : isAr
              ? 'تبديل تلقائي كل 5 ثوانٍ'
              : isFr
              ? 'Défilement auto toutes les 5s'
              : 'Autoplays in 5s'}
          </span>
        </div>
      </div>
    </div>
  );
}
