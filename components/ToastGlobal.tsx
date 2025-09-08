"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type ToastOptions = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number; // ms
  confetti?: boolean; // celebratory burst
};

type ToastContextValue = {
  show: (opts: ToastOptions) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastGlobal>");
  return ctx;
}

export default function ToastGlobal({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const timerRef = useRef<number | null>(null);
  const [confettiOn, setConfettiOn] = useState(false);

  const hide = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const show = useCallback((opts: ToastOptions) => {
    // replace any existing toast
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(opts);
    const dur = Math.max(1000, opts.duration ?? 4000);
    timerRef.current = window.setTimeout(() => {
      setToast(null);
      timerRef.current = null;
    }, dur);

    if (opts.confetti) {
      setConfettiOn(true);
      window.setTimeout(() => setConfettiOn(false), Math.min(2000, dur));
    }
  }, []);

  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      {/* Global bottom-center toast */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast && (
          <div
            className="pointer-events-auto max-w-md w-full sm:w-auto rounded-full border bg-white shadow-lg px-3.5 py-2 text-sm flex items-center gap-2"
            role="status"
          >
            <span className="truncate">{toast.message}</span>
            {toast.actionLabel && (
              <button
                className="ml-auto rounded-full border px-3 py-1 text-xs hover:bg-gray-50"
                onClick={() => { toast.onAction?.(); hide(); }}
              >
                {toast.actionLabel}
              </button>
            )}
            <button
              aria-label="Close"
              className="rounded-full border px-2 py-1 text-xs hover:bg-gray-50"
              onClick={hide}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Confetti overlay (lightweight DOM-based) */}
      {confettiOn && (
        <ConfettiOverlay />
      )}
    </ToastContext.Provider>
  );
}

function ConfettiOverlay() {
  const pieces = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100, // vw
    delay: Math.random() * 200,
    size: 6 + Math.random() * 6,
    hue: Math.floor(330 * Math.random()),
    rotate: Math.floor(360 * Math.random()),
    duration: 1200 + Math.random() * 600,
  })), []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[55] overflow-hidden">
      <style>{`
      @keyframes confetti-fall {
        0% { transform: translate3d(0,-60vh,0) rotate(0deg); opacity: 0 }
        10% { opacity: 1 }
        100% { transform: translate3d(0,60vh,0) rotate(720deg); opacity: 0 }
      }
      `}</style>
      {pieces.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-10vh',
            left: `${p.left}vw`,
            width: p.size,
            height: p.size * (0.4 + Math.random()),
            background: `hsl(${p.hue} 80% 60%)`,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: 2,
            animation: `confetti-fall ${p.duration}ms ease-out ${p.delay}ms forwards`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.04) inset',
          }}
        />
      ))}
    </div>
  );
}
