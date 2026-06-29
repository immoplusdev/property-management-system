import React from "react";
import { cn } from "@/lib/utils/cn";

interface ChipProps {
  label: React.ReactNode;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  before?: React.ReactNode;
  className?: string;
}

export function Chip({ label, count, active, onClick, before, className }: ChipProps) {
  return (
    <button
      type="button"
      className={cn(
        "px-3 py-1.5 rounded-full text-[12px] font-medium border inline-flex items-center gap-1.5 transition-all duration-[120ms] cursor-pointer",
        active
          ? "bg-primary text-white border-primary"
          : "bg-surface border-border text-ink-2 hover:border-ink-3",
        className
      )}
      onClick={onClick}
    >
      {before}
      {label}
      {count != null && (
        <span
          className={cn(
            "px-1.5 py-px rounded-full text-[10.5px] font-semibold leading-none",
            active ? "bg-white/20 text-white" : "bg-surface-2 text-ink-2"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function ChipGroup({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex gap-1.5 flex-wrap", className)}>
      {children}
    </div>
  );
}
