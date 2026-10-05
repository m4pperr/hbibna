'use client';

import React from 'react';

interface HbibnaStackedCouponLogoProps {
  className?: string;
  size?: number;
}

export function HbibnaStackedCouponLogo({
  className = '',
  size = 38,
}: HbibnaStackedCouponLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ height: size }}
      aria-label="Hbibna Stacked Coupon Logo"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/hbibna-icon-trimmed.png"
        alt="Hbibna Icon"
        style={{ height: `${size}px`, width: 'auto' }}
        className="h-full w-auto object-contain transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
}
