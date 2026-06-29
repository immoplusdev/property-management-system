import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const pillCva = cva(
  "inline-flex items-center gap-[6px] px-[9px] py-[3px] rounded-full text-[11.5px] font-medium tracking-[-0.005em]",
  {
    variants: {
      kind: {
        default: "bg-surface-2 text-ink-2",
        primary: "bg-primary-50 text-primary",
        success: "bg-success-bg text-success",
        warn:    "bg-warn-bg text-warn",
        danger:  "bg-danger-bg text-danger",
        violet:  "bg-violet-bg text-violet",
        teal:    "bg-teal-bg text-teal",
        amber:   "bg-amber-bg text-amber",
        pink:    "bg-pink-bg text-pink",
        muted:   "bg-surface-2 text-ink-3",
        "":      "bg-surface-2 text-ink-2",
      },
    },
    defaultVariants: { kind: "default" },
  }
);

interface PillProps extends VariantProps<typeof pillCva> {
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function Pill({ kind, dot, children, className, "aria-label": ariaLabel }: PillProps) {
  return (
    <span
      className={cn(
        pillCva({ kind }),
        dot && "before:content-[''] before:w-1.25 before:h-1.25 before:rounded-full before:bg-current before:shrink-0",
        className
      )}
      aria-label={ariaLabel}
    >
      {children}
    </span>
  );
}
