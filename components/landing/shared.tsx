"use client";
import React, { useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/Logo";

/* ──────────── Button variants (cva) ──────────── */
export const btn = cva(
  "inline-flex items-center gap-2 font-semibold rounded-full transition-all whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:      "bg-primary text-white hover:bg-primary-600",
        dark:         "bg-ink text-white hover:bg-dark",
        outline:      "text-ink border border-border-strong hover:bg-surface-2",
        outlineLight: "text-white border border-white/20 hover:bg-white/10 hover:border-white/45",
      },
      size: {
        default: "text-[14.5px] py-3 px-[22px]",
        lg:      "text-[15.5px] py-[15px] px-7",
        nav:     "text-[13.5px] py-[10px] px-[18px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

/* ──────────── Layout wrapper ──────────── */
export const Wrap = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("max-w-[1180px] mx-auto px-7 max-[560px]:px-[18px]", className)}>
    {children}
  </div>
);

/* ──────────── Brand mark ──────────── */
export const BrandMark = () => (
  <Logo size="sm" showHover={false} />
);

export const BrandName = () => (
  <span className="font-semibold text-[17px] tracking-[-0.02em] flex items-center gap-2">
    Immo Plus{" "}
    <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-primary border border-primary/35 px-1.5 py-px rounded-[5px]">
      PMS
    </span>
  </span>
);

/* ──────────── Animated counter ──────────── */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(start);
    }, 28);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}
