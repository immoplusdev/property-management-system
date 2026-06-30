"use client";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Icon } from "./Icon";

export type ToastKind = "success" | "error" | "warn" | "info" | "loading";

interface ToastItem {
  id: number;
  msg: string;
  kind: ToastKind;
  icon?: string;
  /** ms before auto-dismiss; 0 = sticky (loading). */
  duration: number;
}

interface PushInput {
  msg: string;
  kind?: ToastKind;
  icon?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (msg: string, icon?: string, kind?: string) => number;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const KIND_STYLES: Record<ToastKind, { bg: string; color: string; icon: string; accent: string }> = {
  success: { bg: "var(--color-success-bg)", color: "var(--color-success)", icon: "check", accent: "var(--color-success)" },
  error:   { bg: "var(--color-danger-bg)",  color: "var(--color-danger)",  icon: "x",     accent: "var(--color-danger)"  },
  warn:    { bg: "var(--color-warn-bg)",    color: "var(--color-warn)",    icon: "info",  accent: "var(--color-warn)"    },
  info:    { bg: "var(--color-primary-50)", color: "var(--color-primary)", icon: "info",  accent: "var(--color-primary)" },
  loading: { bg: "var(--color-surface-2)",  color: "var(--color-ink-2)",   icon: "",      accent: "var(--color-ink-3)"   },
};

const DEFAULT_DURATION: Record<ToastKind, number> = {
  success: 3500, error: 4500, warn: 4000, info: 3500, loading: 0,
};

/** Map a legacy icon name to a toast kind, so old `showToast(msg, "x")` calls turn red. */
function inferKind(icon?: string, kind?: string): ToastKind {
  if (kind && kind in KIND_STYLES) return kind as ToastKind;
  switch (icon) {
    case "x":     return "error";
    case "check": return "success";
    case "warn":  return "warn";
    case "bell":
    case "info":  return "info";
    default:      return "info";
  }
}

// ── Module-level bridge (safe: this file is client-only) ──────────────────────
interface Bridge {
  push: (t: PushInput) => number;
  update: (id: number, patch: PushInput) => void;
  dismiss: (id: number) => void;
}
let bridge: Bridge | null = null;

/**
 * Fire a toast. Backward-compatible signature `showToast(msg, icon?, kind?)`:
 * when `kind` is omitted it is inferred from the icon (so error toasts that only
 * passed `"x"` now render red instead of green).
 */
export function showToast(msg: string, icon?: string, kind?: string): number {
  const k = inferKind(icon, kind);
  return bridge?.push({ msg, kind: k, icon }) ?? -1;
}

export function dismissToast(id: number) {
  bridge?.dismiss(id);
}

type MsgOrFn<T> = string | ((arg: T) => string);
function resolve<T>(m: MsgOrFn<T>, arg: T): string {
  return typeof m === "function" ? (m as (a: T) => string)(arg) : m;
}

/**
 * Coordinate an async action with a single toast: shows a sticky `loading`
 * toast, then swaps it to `success` or `error` when the promise settles.
 *
 *   await toastPromise(saveSettings(), {
 *     loading: "Sauvegarde…",
 *     success: "Paramètres enregistrés",
 *     error:   (e) => e.message ?? "Échec de la sauvegarde",
 *   });
 */
export async function toastPromise<T>(
  promise: Promise<T>,
  msgs: { loading: string; success: MsgOrFn<T>; error: MsgOrFn<unknown> },
): Promise<T> {
  const id = bridge?.push({ msg: msgs.loading, kind: "loading", duration: 0 }) ?? -1;
  try {
    const result = await promise;
    bridge?.update(id, { msg: resolve(msgs.success, result), kind: "success" });
    return result;
  } catch (err) {
    bridge?.update(id, { msg: resolve(msgs.error, err), kind: "error" });
    throw err;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useHydrated();
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const clearTimer = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const dismiss = useCallback((id: number) => {
    clearTimer(id);
    setToasts(prev => prev.filter(t => t.id !== id));
  }, [clearTimer]);

  const schedule = useCallback((id: number, duration: number) => {
    clearTimer(id);
    if (duration > 0) {
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
    }
  }, [clearTimer, dismiss]);

  const push = useCallback((input: PushInput): number => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const kind = input.kind ?? "info";
    const duration = input.duration ?? DEFAULT_DURATION[kind];
    setToasts(prev => [...prev, { id, msg: input.msg, kind, icon: input.icon, duration }]);
    schedule(id, duration);
    return id;
  }, [schedule]);

  const update = useCallback((id: number, patch: PushInput) => {
    const kind = patch.kind ?? "info";
    const duration = patch.duration ?? DEFAULT_DURATION[kind];
    setToasts(prev => {
      const exists = prev.some(t => t.id === id);
      if (!exists) {
        return [...prev, { id, msg: patch.msg, kind, icon: patch.icon, duration }];
      }
      return prev.map(t => t.id === id ? { ...t, msg: patch.msg, kind, icon: patch.icon, duration } : t);
    });
    schedule(id, duration);
  }, [schedule]);

  // Expose the bridge + clean up timers on unmount.
  useEffect(() => {
    bridge = { push, update, dismiss };
    const map = timers.current;
    return () => {
      bridge = null;
      map.forEach(clearTimeout);
      map.clear();
    };
  }, [push, update, dismiss]);

  const legacyShow = useCallback(
    (msg: string, icon?: string, kind?: string) => push({ msg, kind: inferKind(icon, kind), icon }),
    [push],
  );

  return (
    <ToastContext.Provider value={{ showToast: legacyShow }}>
      {children}
      {mounted && createPortal(
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-2000 flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-90 pointer-events-none"
          role="region"
          aria-live="polite"
          aria-label="Notifications"
        >
          {toasts.map(t => {
            const s = KIND_STYLES[t.kind];
            const iconName = t.icon && t.kind !== "loading" ? t.icon : s.icon;
            return (
              <div
                key={t.id}
                role={t.kind === "error" ? "alert" : "status"}
                className="pointer-events-auto flex items-start gap-2.5 w-full bg-surface border border-border rounded-xl px-3.5 py-3 shadow-lg animate-pms-slide-in"
                style={{ borderLeft: `3px solid ${s.accent}` }}
              >
                <div
                  className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
                  style={{ background: s.bg, color: s.color }}
                >
                  {t.kind === "loading" ? (
                    <span
                      className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
                      aria-hidden
                    />
                  ) : (
                    <Icon name={iconName} size={15} />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-[13px] font-medium text-ink leading-snug wrap-break-word pt-0.5">
                  {t.msg}
                </div>
                {t.kind !== "loading" && (
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Fermer"
                    className="shrink-0 w-5 h-5 grid place-items-center rounded-md text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
                  >
                    <Icon name="x" size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
