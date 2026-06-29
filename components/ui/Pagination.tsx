"use client";
import React from "react";
import { Icon } from "./Icon";

interface PaginationProps {
  page: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize = 10, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav aria-label="Pagination" style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center", marginTop: 16 }}>
      <button
        className="btn-icon"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
        style={{ opacity: page <= 1 ? 0.4 : 1 }}
      >
        <Icon name="chevronLeft" size={14} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} style={{ padding: "0 6px", color: "var(--text-3)", fontSize: 13 }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={"btn" + (p === page ? " btn-primary btn-sm" : " btn-ghost btn-sm")}
            style={{ minWidth: 32, padding: "0 10px" }}
          >
            {p}
          </button>
        )
      )}

      <button
        className="btn-icon"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Page suivante"
        style={{ opacity: page >= totalPages ? 0.4 : 1 }}
      >
        <Icon name="chevronRight" size={14} />
      </button>
    </nav>
  );
}
