"use client";
import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Max width in px (default 880). The panel is fluid below this. */
  maxWidth?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Hide the default close button (when a custom header provides its own). */
  hideClose?: boolean;
}

/**
 * Accessible, responsive modal rendered through a portal on `document.body`.
 *
 * Portaling is essential: rendered inline, a `fixed inset-0` overlay is trapped
 * by any transformed/animated ancestor (e.g. `animate-pms-fade-up` on the page),
 * so the backdrop fails to cover the viewport and other UI bleeds on top. The
 * portal lifts the overlay out of every parent stacking context.
 */
export function Modal({
  open,
  onClose,
  title,
  maxWidth = 880,
  children,
  footer,
  className,
  hideClose = false,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useHydrated();

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open (compensate for scrollbar to avoid layout shift).
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  // Move focus into the dialog on open, restore it on close.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => prev?.focus?.();
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 bg-[rgba(17,17,15,0.45)] backdrop-blur-[2px] animate-pms-fade overscroll-contain"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "bg-surface rounded-[18px] w-full max-h-[calc(100dvh-2rem)] sm:max-h-[90vh] flex flex-col border border-border shadow-2xl overflow-hidden animate-pms-slide-up outline-none",
          className
        )}
        style={{ maxWidth }}
      >
        {title && (
          <div className="px-5.5 py-4.5 border-b border-border flex items-center justify-between shrink-0">
            <div id={titleId} className="font-semibold text-[15px]">{title}</div>
            {!hideClose && (
              <button
                type="button"
                className="w-8.5 h-8.5 grid place-items-center rounded-[9px] bg-surface border border-border text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors"
                onClick={onClose}
                aria-label="Fermer"
              >
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
        )}
        <div className="p-5.5 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <div className="px-5.5 py-3.5 border-t border-border flex justify-between items-center gap-3 bg-surface-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
