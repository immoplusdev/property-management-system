"use client";
import React from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PmsError({ error, reset }: ErrorProps) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 420,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <svg
          width={48}
          height={48}
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--danger)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", margin: 0 }}>
          Une erreur est survenue
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0 }}>
          {error.message || "Le tableau de bord PMS n'a pas pu se charger."}
        </p>
        <button
          className="mt-2 inline-flex items-center justify-center h-10 px-5 rounded-full bg-primary text-white font-semibold text-[13.5px] cursor-pointer transition-colors hover:bg-primary-600"
          onClick={reset}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
