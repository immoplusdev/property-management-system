"use client";
import React, { useEffect, useId } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
}

export function Dialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = "Confirmer", cancelLabel = "Annuler",
  variant = "default", loading = false,
}: DialogProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose, loading]);

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(17,17,15,.44)",
          animation: "pms-fade .15s ease",
        }}
        onClick={() => !loading && onClose()}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? descId : undefined}
        style={{
          position: "relative",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          maxWidth: 420,
          width: "100%",
          padding: 24,
          boxShadow: "var(--shadow-lg, 0 16px 48px rgba(17,17,15,.12))",
          animation: "pms-slideUp .2s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        {/* Danger icon */}
        {variant === "danger" && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--danger-bg)",
              display: "grid",
              placeItems: "center",
              marginBottom: 16,
            }}
          >
            <svg
              width={20}
              height={20}
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--danger)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
        )}

        <h3
          id={titleId}
          style={{
            margin: "0 0 8px",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text)",
            letterSpacing: -0.01,
          }}
        >
          {title}
        </h3>

        {message && (
          <p
            id={descId}
            style={{
              margin: "0 0 20px",
              fontSize: 13.5,
              color: "var(--text-3)",
              lineHeight: 1.55,
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: message ? 0 : 20,
          }}
        >
          <button className="btn btn-ghost btn-sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            style={
              variant === "danger"
                ? { background: "var(--danger)", color: "#fff", borderColor: "var(--danger)" }
                : undefined
            }
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
