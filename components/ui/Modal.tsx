"use client";
import React, { useEffect, useId } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  maxWidth = 880,
  children,
  footer,
  className,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(17,17,15,0.42)] z-100 grid place-items-center p-8 animate-pms-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className={cn(
          "bg-surface rounded-[18px] w-full max-h-[90vh] flex flex-col border border-border overflow-hidden animate-pms-slide-up",
          className
        )}
        style={{ maxWidth }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="px-5.5 py-4.5 border-b border-border flex items-center justify-between">
            <div id={titleId} className="font-semibold text-[15px]">{title}</div>
            <button
              className="w-8.5 h-8.5 grid place-items-center rounded-[9px] bg-surface border border-border text-ink-2 hover:bg-surface-2 hover:text-ink"
              onClick={onClose}
              aria-label="Fermer"
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        )}
        <div className="p-5.5 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && (
          <div className="px-5.5 py-3.5 border-t border-border flex justify-between items-center gap-3 bg-surface-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
