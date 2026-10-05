'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Customer portal error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4 font-rounded">
      <div className="max-w-md w-full bg-white border-2 border-black rounded-[2.5rem] p-8 text-center shadow-[0_12px_0_#000] space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-200 text-black border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
          <AlertCircle className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-black tracking-tight">
            Unable to load your rewards pass
          </h2>
          <p className="text-xs text-black/70 font-bold leading-relaxed">
            We were unable to load your loyalty card information. Please try again or return to the login screen.
          </p>
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="mt-3 p-3.5 rounded-2xl bg-[#FFF9D2] border-2 border-black text-left shadow-[0_2px_0_#000]">
              <p className="text-[11px] font-mono font-bold text-black break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-black hover:bg-neutral-800 text-[#FFE600] text-xs font-black transition-all border-2 border-black shadow-[0_4px_0_#000] active:translate-y-0.5 active:shadow-[0_2px_0_#000] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            <span>Try Again</span>
          </button>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-white border-2 border-black hover:bg-neutral-100 text-black text-xs font-black shadow-[0_2px_0_#000] transition-colors"
          >
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
