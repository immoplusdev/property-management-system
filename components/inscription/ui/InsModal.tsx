"use client";
import React, { useEffect, useId } from "react";
import { Icon } from "./Icon";
import { Btn } from "./Btn";

interface InsModalProps {
  eyebrow?: string;
  title: string;
  /** Custom head-left content; replaces the default eyebrow/title block when provided. */
  head?: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  maxWidth?: number;
  children: React.ReactNode;
}

/** Inscription modal (.modal): rounded-[26px] panel, eyebrow + title head, scrollable body, footer. */
export function InsModal({ eyebrow, title, head, onClose, footer, maxWidth = 680, children }: InsModalProps) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-9995 bg-black/40 flex items-center justify-center p-6 backdrop-blur-[3px] animate-insc-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="bg-surface rounded-[26px] w-full max-h-[90dvh] flex flex-col shadow-[0_0_0_1px_rgba(10,10,15,0.06),0_8px_40px_rgba(10,10,15,0.12)] animate-insc-slide-up"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6.5 pt-5.5 pb-4.5 border-b border-border shrink-0">
          {head ?? (
            <div>
              {eyebrow && <div className="text-[12px] text-primary font-semibold tracking-wider uppercase">{eyebrow}</div>}
              <div id={titleId} className="text-[18px] font-bold mt-0.5">{title}</div>
            </div>
          )}
          <Btn variant="icon" size="md" onClick={onClose} aria-label="Fermer"><Icon name="x" size={16} /></Btn>
        </div>

        <div className="p-6.5 overflow-y-auto flex-1 scrollbar-thin">{children}</div>

        {footer && (
          <div className="px-6.5 py-4.5 border-t border-border flex justify-end gap-2.5 shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}

/** Section divider used inside inscription modals/cards (.divider). */
export function InsDivider() {
  return <hr className="border-0 border-t border-border my-5" />;
}
