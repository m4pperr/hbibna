'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/* ─────────────────────────── Types ─────────────────────────── */
export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

/* ─────────────────────────── Context ─────────────────────────── */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/* ─────────────────────────── Individual Toast ─────────────────────────── */
function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(t.id), 200);
  }, [t.id, onDismiss]);

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, t.duration || 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, t.duration]);

  const config = {
    success: {
      bg: 'bg-emerald-400',
      icon: <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />,
    },
    error: {
      bg: 'bg-rose-400',
      icon: <AlertCircle className="w-4.5 h-4.5 stroke-[2.5]" />,
    },
    info: {
      bg: 'bg-[#FFE600]',
      icon: <Info className="w-4.5 h-4.5 stroke-[2.5]" />,
    },
  }[t.type];

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border-2 border-black shadow-[0_6px_0_#000] text-black text-sm font-black select-none transition-all duration-200 ${config.bg} ${
        exiting ? 'opacity-0 translate-y-2 scale-95' : 'opacity-100 translate-y-0 scale-100 animate-in slide-in-from-top-3'
      }`}
    >
      <span className="shrink-0">{config.icon}</span>
      <span className="flex-1 leading-snug">{t.message}</span>
      <button
        onClick={dismiss}
        className="shrink-0 p-0.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 stroke-[2.5]" />
      </button>
    </div>
  );
}

/* ─────────────────────────── Provider ─────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = `toast-${++counterRef.current}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: ToastContextType = {
    toast: addToast,
    success: useCallback((msg: string) => addToast(msg, 'success'), [addToast]),
    error: useCallback((msg: string) => addToast(msg, 'error', 6000), [addToast]),
    info: useCallback((msg: string) => addToast(msg, 'info'), [addToast]),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast Container — top-center, always on top */}
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2.5 w-full max-w-md px-4 pointer-events-none font-rounded"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full">
            <ToastItem toast={t} onDismiss={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
