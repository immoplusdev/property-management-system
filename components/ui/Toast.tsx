"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Icon } from "./Icon";

interface Toast {
  id: number;
  msg: string;
  icon: string;
  kind: string;
}

interface ToastContextValue {
  showToast: (msg: string, icon?: string, kind?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Module-level bridge — safe because Toast.tsx is "use client" only
let _show: ((msg: string, icon: string, kind: string) => void) | null = null;

export function showToast(msg: string, icon = "check", kind = "success") {
  _show?.(msg, icon, kind);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((msg: string, icon = "check", kind = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, icon, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    _show = show;
    return () => { _show = null; };
  }, [show]);

  return (
    <ToastContext.Provider value={{ showToast: show }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-200 flex flex-col gap-2 pointer-events-none"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-center gap-2.5 min-w-60 bg-surface border border-border rounded-xl px-3.5 py-3 shadow-lg animate-pms-slide-in"
          >
            <div
              className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
              style={{
                background: t.kind === "success" ? "var(--color-success-bg)" : "var(--color-primary-50)",
                color: t.kind === "success" ? "var(--color-success)" : "var(--color-primary)",
              }}
            >
              <Icon name={t.icon} size={15} />
            </div>
            <div className="text-[13px] font-medium text-ink">{t.msg}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
