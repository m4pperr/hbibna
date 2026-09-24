'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function BusinessError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Business page error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E6DDCF] rounded-3xl p-8 text-center shadow-card space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-xs">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-[#191817] tracking-tight">
            Unable to load data
          </h2>
          <p className="text-xs text-[#736B63] leading-relaxed">
            We encountered a temporary problem retrieving your business records. Please try reloading or check your connection.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-left">
              <p className="text-[11px] font-mono text-zinc-700 break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#191817] hover:bg-[#2B2927] text-white text-xs font-bold transition-all shadow-soft active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
