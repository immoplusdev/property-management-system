import React from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";

interface ThumbProps {
  label?: string;
  ribbonAccent?: boolean;
  aspect?: "4/3" | "16/9";
  onRemove?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/** Media tile (.thumb) with optional ribbon label + remove button. */
export function Thumb({ label, ribbonAccent, aspect = "4/3", onRemove, className, children }: ThumbProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl bg-surface-2 overflow-hidden flex items-center justify-center text-white/50",
        aspect === "16/9" ? "aspect-video" : "aspect-[4/3]",
        className
      )}
    >
      {label && (
        <div
          className={cn(
            "absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.75 rounded-[5px] whitespace-nowrap",
            ribbonAccent ? "bg-primary" : "bg-black/55"
          )}
        >
          {label}
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label="Retirer"
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 rounded-[7px] bg-black/50 text-white grid place-items-center cursor-pointer transition-colors hover:bg-black/75"
        >
          <Icon name="x" size={14} />
        </button>
      )}
      {children}
    </div>
  );
}

/** Dashed "add media" placeholder tile. */
export function ThumbAdd({ onClick, aspect = "4/3" }: { onClick?: () => void; aspect?: "4/3" | "16/9" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 border-dashed border-border-strong bg-surface text-ink-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-220 hover:border-primary hover:bg-primary-50 hover:text-primary hover:scale-[1.02]",
        aspect === "16/9" ? "aspect-video" : "aspect-[4/3]"
      )}
    >
      <Icon name="plus" size={22} />
      <span className="text-[11px] font-medium">Ajouter</span>
    </button>
  );
}
