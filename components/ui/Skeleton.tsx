import React from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
}

export function Skeleton({ width = "100%", height = 16, radius = 6, className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Chargement…"
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, var(--bg-2) 25%, var(--border) 50%, var(--bg-2) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.4s ease infinite",
      }}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }} role="status" aria-label="Chargement…">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "65%" : "100%"} height={14} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" role="status" aria-label="Chargement…">
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Skeleton width={40} height={40} radius="50%" />
        <div style={{ flex: 1 }}>
          <Skeleton height={14} width="60%" />
          <div style={{ marginTop: 6 }}><Skeleton height={12} width="40%" /></div>
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
}
