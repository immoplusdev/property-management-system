"use client";
import React, { useEffect, useId } from "react";
import { Icon } from "./Icon";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "right" | "left" | "bottom";
  width?: number | string;
  footer?: React.ReactNode;
}

export function Drawer({
  open, onClose, title, children,
  side = "right", width = 420, footer,
}: DrawerProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const panelStyle: React.CSSProperties =
    side === "right"  ? { right: 0, top: 0, bottom: 0, width } :
    side === "left"   ? { left:  0, top: 0, bottom: 0, width } :
    { bottom: 0, left: 0, right: 0, maxHeight: "80vh" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(18,19,26,.38)",
          animation: "pms-fade .15s ease",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={{
          position: "absolute",
          background: "var(--surface)",
          borderLeft:  side === "right"  ? "1px solid var(--border)" : undefined,
          borderRight: side === "left"   ? "1px solid var(--border)" : undefined,
          borderTop:   side === "bottom" ? "1px solid var(--border)" : undefined,
          boxShadow: "var(--shadow-lg, 0 16px 48px rgba(18,19,26,.12))",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "pms-slideUp .22s cubic-bezier(.2,.8,.2,1)",
          ...panelStyle,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          {title ? (
            <h2
              id={titleId}
              style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text)", letterSpacing: -0.01 }}
            >
              {title}
            </h2>
          ) : <div />}
          <button className="btn-icon" onClick={onClose} aria-label="Fermer">
            <Icon name="x" size={14} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "14px 20px",
              flexShrink: 0,
              background: "var(--surface-soft, var(--bg-2))",
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
