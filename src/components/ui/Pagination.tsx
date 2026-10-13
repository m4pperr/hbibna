'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}: PaginationProps) {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null; // Don't show pagination if there's only 1 page
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 font-rounded ${className}`}
    >
      {/* Items count summary */}
      <div className="text-xs font-bold text-black/70">
        <span>{t('common.showing')} </span>
        <span className="font-black text-black">
          {startItem}-{endItem}
        </span>
        <span> {t('common.of')} </span>
        <span className="font-black text-black">{totalItems}</span>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Previous button */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          aria-label={t('common.previous')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-[#FFF9D2] text-black text-xs font-black shadow-[0_2px_0_#000] hover:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:translate-x-0 disabled:shadow-none cursor-pointer"
        >
          <PrevIcon className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">{t('common.previous')}</span>
        </button>

        {/* Page pills */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs font-black text-black/50 select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-black text-[#FFE600] shadow-[0_2px_0_#000]'
                    : 'bg-white hover:bg-[#FFF9D2] text-black shadow-[0_2px_0_#000] hover:translate-x-0.5 active:translate-y-0.5 active:shadow-none'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label={t('common.next')}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border-2 border-black bg-white hover:bg-[#FFF9D2] text-black text-xs font-black shadow-[0_2px_0_#000] hover:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:translate-x-0 disabled:shadow-none cursor-pointer"
        >
          <span className="hidden sm:inline">{t('common.next')}</span>
          <NextIcon className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
