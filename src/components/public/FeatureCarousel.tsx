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
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export function FeatureCarousel() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const features = [
    {
      id: 'points-rules',
      icon: Sliders,
      title: isAr ? 'معادلة نقاط مخصصة' : 'Custom Points Rules',
      description: isAr
        ? 'حدد بدقة كيف يكسب عملاؤك النقاط، سواء بقيمة المشتريات أو عدد الزيارات.'
        : 'Choose exactly how customers earn points.',
      badge: isAr ? 'نظام مرن' : 'Flexible Engine',
    },
    {
      id: 'customer-management',
      icon: Users,
      title: isAr ? 'إدارة العملاء' : 'Customer Management',
      description: isAr
        ? 'احتفظ ببيانات وأرصدة عملائك منظمة ومحمية بالكامل في متناول يدك.'
        : 'Keep all your loyalty customers organized.',
      badge: isAr ? 'دليل آمن' : 'Isolated Directory',
    },
    {
      id: 'digital-card',
      icon: Smartphone,
      title: isAr ? 'بطاقة ولاء رقمية' : 'Digital Loyalty Card',
      description: isAr
        ? 'يستطيع عملاؤك متابعة نقاطهم ومكافآتهم مباشرة من هواتفهم بدون تثبيت أي تطبيق.'
        : 'Customers can check their points from their phone.',
      badge: isAr ? 'بدون تحميل' : 'Zero-App Install',
    },
    {
      id: 'rewards',
      icon: Gift,
      title: isAr ? 'دليل المكافآت' : 'Rewards',
      description: isAr
        ? 'أنشئ هدايا وخصومات مميزة تجذب عملاءك وتشجعهم على تكرار الزيارة.'
        : 'Create rewards that customers actually want.',
      badge: isAr ? 'مكافآت مخصصة' : 'Tiered Catalog',
    },
    {
      id: 'purchase-tracking',
      icon: Receipt,
      title: isAr ? 'تسجيل المشتريات' : 'Purchase Tracking',
      description: isAr
        ? 'سجل المشتريات واحتسب النقاط تلقائياً في ثوانٍ معدودة عند الكاونتر.'
        : 'Record purchases and automatically award points.',
      badge: isAr ? 'سرعة فائقة' : 'Counter Speed',
    },
    {
      id: 'simple-dashboard',
      icon: LayoutDashboard,
      title: isAr ? 'لوحة تحكم سهلة' : 'Simple Dashboard',
      description: isAr
        ? 'تابع تطور برنامج الولاء ونشاط عملائك بلمحة واحدة واضحة وبسيطة.'
        : 'See your loyalty program at a glance.',
      badge: isAr ? 'نظرة فورية' : 'Live Overview',
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
      className="relative max-w-xl mx-auto select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E3E] rounded-3xl"
    >
      {/* Navigation Hint Arrows for Desktop */}
      <div className="hidden sm:flex items-center justify-between absolute -inset-x-5 lg:-inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none z-20">
        <button
          type="button"
          onClick={isAr ? nextSlide : prevSlide}
          aria-label={isAr ? 'العنصر التالي' : 'Previous feature'}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft hover:border-[#DFC99F] hover:bg-[#FBF6EB] text-[#191817] flex items-center justify-center transition-all cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E3E]"
        >
          <ChevronLeft className="w-5 h-5 text-[#736B63] hover:text-[#191817] rtl:rotate-180" />
        </button>

        <button
          type="button"
          onClick={isAr ? prevSlide : nextSlide}
          aria-label={isAr ? 'العنصر السابق' : 'Next feature'}
          className="pointer-events-auto w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft hover:border-[#DFC99F] hover:bg-[#FBF6EB] text-[#191817] flex items-center justify-center transition-all cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E3E]"
        >
          <ChevronRight className="w-5 h-5 text-[#736B63] hover:text-[#191817] rtl:rotate-180" />
        </button>
      </div>

      {/* Main Single Feature Card Viewport */}
      <div
        className="overflow-hidden rounded-3xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-card hover:border-[#DFC99F] transition-colors cursor-grab active:cursor-grabbing touch-pan-y text-start"
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
              <div className="w-12 h-12 rounded-2xl bg-[#FBF6EB] text-[#B88E3E] border border-[#DFC99F]/50 flex items-center justify-center shadow-xs">
                <IconComponent className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B88E3E] bg-[#FBF6EB] px-3 py-1 rounded-full border border-[#DFC99F]/60">
                {activeFeature.badge}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#736B63] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#E6DDCF]">
              <span className="text-[#191817] font-bold">{currentIndex + 1}</span>
              <span>/</span>
              <span>{features.length}</span>
            </div>
          </div>

          {/* Card Content: Title & Description */}
          <div className="space-y-2 py-2">
            <h3 className="font-extrabold text-xl sm:text-2xl text-[#191817] tracking-tight">
              {activeFeature.title}
            </h3>
            <p className="text-sm sm:text-base text-[#736B63] leading-relaxed">
              {activeFeature.description}
            </p>
          </div>

          {/* Subtle Swipe Guidance on Mobile */}
          <div className="flex sm:hidden items-center justify-between text-[11px] font-medium text-[#736B63]/70 pt-1">
            <span>{isAr ? 'اسحب للاستكشاف ←' : '← Swipe to explore'}</span>
            <span>{isAr ? '← اضغط على النقاط' : 'Tap dots below →'}</span>
          </div>
        </div>

        {/* 3. TIMER PROGRESS BAR */}
        <div
          className="w-full bg-[#FAF8F5] border-t border-[#E6DDCF]/80 h-1.5 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Card rotation timer"
        >
          <div
            className="h-full bg-gradient-to-r from-[#B88E3E] via-[#C9A250] to-[#B88E3E] transition-[width] duration-75 ease-linear rounded-r-full"
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
            aria-label={isAr ? 'التالي' : 'Previous feature'}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E6DDCF] hover:bg-[#FBF6EB] text-xs font-semibold text-[#191817] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
            <span>{isAr ? 'السابق' : 'Prev'}</span>
          </button>
          <button
            type="button"
            onClick={isAr ? prevSlide : nextSlide}
            aria-label={isAr ? 'السابق' : 'Next feature'}
            className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E6DDCF] hover:bg-[#FBF6EB] text-xs font-semibold text-[#191817] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <span>{isAr ? 'التالي' : 'Next'}</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        {/* Interactive Indicator Dots */}
        <div
          className="flex items-center gap-2 order-1 sm:order-2 mx-auto sm:mx-0"
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
                className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E3E] ${
                  isActive
                    ? 'w-7 h-2.5 bg-[#B88E3E]'
                    : 'w-2.5 h-2.5 bg-[#E6DDCF] hover:bg-[#DFC99F]'
                }`}
              />
            );
          })}
        </div>

        {/* Interaction status hint */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#736B63] order-3">
          <Sparkles className="w-3.5 h-3.5 text-[#B88E3E]" />
          <span>
            {isPaused
              ? isAr ? 'متوقف مؤقتاً عند التمرير' : 'Paused on hover'
              : isAr ? 'تبديل تلقائي كل 5 ثوانٍ' : 'Autoplays in 5s'}
          </span>
        </div>
      </div>
    </div>
  );
}
