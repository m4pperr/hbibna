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

interface FeatureItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'points-rules',
    icon: Sliders,
    title: 'Custom Points Rules',
    description: 'Choose exactly how customers earn points.',
    badge: 'Flexible Engine',
  },
  {
    id: 'customer-management',
    icon: Users,
    title: 'Customer Management',
    description: 'Keep all your loyalty customers organized.',
    badge: 'Isolated Directory',
  },
  {
    id: 'digital-card',
    icon: Smartphone,
    title: 'Digital Loyalty Card',
    description: 'Customers can check their points from their phone.',
    badge: 'Zero-App Install',
  },
  {
    id: 'rewards',
    icon: Gift,
    title: 'Rewards',
    description: 'Create rewards that customers actually want.',
    badge: 'Tiered Catalog',
  },
  {
    id: 'purchase-tracking',
    icon: Receipt,
    title: 'Purchase Tracking',
    description: 'Record purchases and automatically award points.',
    badge: 'Counter Speed',
  },
  {
    id: 'simple-dashboard',
    icon: LayoutDashboard,
    title: 'Simple Dashboard',
    description: 'See your loyalty program at a glance.',
    badge: 'Live Overview',
  },
];

const AUTOPLAY_DURATION = 5000; // 5 seconds per feature card
const TIMER_INTERVAL = 30; // Update progress bar every 30ms for 60fps smoothness
const SWIPE_THRESHOLD = 45; // Pixels to trigger slide change

export function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // References for drag/swipe calculations
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const mouseStartX = useRef<number | null>(null);

  // Check reduced motion preference
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

  // Slide navigation with direction tracking
  const goToSlide = useCallback(
    (targetIndex: number, direction?: 'next' | 'prev') => {
      if (targetIndex === currentIndex) return;

      const determinedDirection =
        direction || (targetIndex > currentIndex ? 'next' : 'prev');

      // Special wrap-around direction handling
      let finalDir = determinedDirection;
      if (currentIndex === FEATURES.length - 1 && targetIndex === 0) finalDir = 'next';
      if (currentIndex === 0 && targetIndex === FEATURES.length - 1) finalDir = 'prev';

      setSlideDirection(finalDir);
      setIsAnimating(true);
      setCurrentIndex(targetIndex);
      setProgress(0); // Reset timer immediately

      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, prefersReducedMotion ? 50 : 380);

      return () => clearTimeout(timer);
    },
    [currentIndex, prefersReducedMotion]
  );

  const nextSlide = useCallback(() => {
    const nextIdx = (currentIndex + 1) % FEATURES.length;
    goToSlide(nextIdx, 'next');
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIdx = (currentIndex - 1 + FEATURES.length) % FEATURES.length;
    goToSlide(prevIdx, 'prev');
  }, [currentIndex, goToSlide]);

  // Autoplay progression timer
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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  };

  // --- Touch Gestures ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    // Detect if movement is primarily horizontal on first move
    if (isHorizontalSwipe.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipe.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipe.current) {
      // Horizontal swipe in progress, provide visual resistance
      setDragOffset(deltaX * 0.7);
    }
  };

  const handleTouchEnd = () => {
    if (isHorizontalSwipe.current && Math.abs(dragOffset) > SWIPE_THRESHOLD) {
      if (dragOffset < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    // Reset drag states
    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    touchStartY.current = null;
    isHorizontalSwipe.current = null;
  };

  // --- Mouse Drag Gestures ---
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
          nextSlide();
        } else {
          prevSlide();
        }
      }
      setIsDragging(false);
      setDragOffset(0);
      mouseStartX.current = null;
    }
  };

  const activeFeature = FEATURES[currentIndex];
  const IconComponent = activeFeature.icon;

  // Compute slide animation class
  const animationClass = prefersReducedMotion
    ? 'opacity-100 transition-opacity duration-150'
    : isAnimating
    ? slideDirection === 'next'
      ? 'animate-slide-in-right'
      : 'animate-slide-in-left'
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
      {/* Visual Navigation Hint Arrows for Desktop / Tablets */}
      <div className="hidden sm:flex items-center justify-between absolute -inset-x-5 lg:-inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none z-20">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous feature"
          className="pointer-events-auto w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft hover:border-[#DFC99F] hover:bg-[#FBF6EB] text-[#191817] flex items-center justify-center transition-all cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E3E]"
        >
          <ChevronLeft className="w-5 h-5 text-[#736B63] hover:text-[#191817]" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next feature"
          className="pointer-events-auto w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E6DDCF] shadow-soft hover:border-[#DFC99F] hover:bg-[#FBF6EB] text-[#191817] flex items-center justify-center transition-all cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E3E]"
        >
          <ChevronRight className="w-5 h-5 text-[#736B63] hover:text-[#191817]" />
        </button>
      </div>

      {/* Main Single Feature Card Viewport */}
      <div
        className="overflow-hidden rounded-3xl bg-[#FFFFFF] border border-[#E6DDCF] shadow-card hover:border-[#DFC99F] transition-colors cursor-grab active:cursor-grabbing touch-pan-y"
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
              <span>{FEATURES.length}</span>
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
            <span>← Swipe to explore</span>
            <span>Tap dots below →</span>
          </div>
        </div>

        {/* 3. TIMER PROGRESS BAR (Inside Card at the very bottom) */}
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

      {/* 9. INDICATOR / POSITION (Subtle Dots & Mobile Controls) */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        {/* Mobile Next/Prev Buttons */}
        <div className="flex sm:hidden items-center gap-2 order-2 sm:order-1">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous feature"
            className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E6DDCF] hover:bg-[#FBF6EB] text-xs font-semibold text-[#191817] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next feature"
            className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E6DDCF] hover:bg-[#FBF6EB] text-xs font-semibold text-[#191817] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Interactive Indicator Dots */}
        <div
          className="flex items-center gap-2 order-1 sm:order-2 mx-auto sm:mx-0"
          role="tablist"
          aria-label="Select feature card"
        >
          {FEATURES.map((feature, idx) => {
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
          <span>{isPaused ? 'Paused on hover' : 'Autoplays in 5s'}</span>
        </div>
      </div>
    </div>
  );
}
