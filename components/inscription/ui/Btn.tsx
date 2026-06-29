"use client";
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

// Faithful to inscription.css .btn family: pill shape, ink-dark primary (not brand blue).
const btnCva = cva(
  "inline-flex items-center justify-center gap-[7px] font-semibold whitespace-nowrap tracking-[-0.01em] cursor-pointer border-[1.5px] border-transparent transition-all duration-220 active:translate-y-px active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        primary: "bg-ink text-white border-ink hover:bg-black hover:border-black hover:shadow-md",
        accent:  "bg-primary text-white border-primary hover:bg-primary-600 hover:border-primary-600 hover:shadow-[var(--shadow-primary)]",
        ghost:   "bg-surface border-border text-ink hover:bg-surface-2 hover:border-border-strong",
        soft:    "bg-surface-2 text-ink border-transparent hover:bg-[rgba(10,10,15,0.08)]",
        text:    "bg-transparent border-0 text-ink-2 hover:text-ink hover:bg-surface-2",
        icon:    "bg-surface-2 text-ink-2 border-0 inline-grid place-items-center hover:bg-[rgba(10,10,15,0.10)] hover:text-ink active:scale-[0.92]",
      },
      size: {
        md: "h-10 px-[18px] text-[13.5px] rounded-full",
        sm: "h-[34px] px-3.5 text-[12.5px] rounded-full",
      },
    },
    compoundVariants: [
      { variant: "text", size: "md", class: "h-8 px-2 rounded-[10px]" },
      { variant: "text", size: "sm", class: "h-8 px-2 rounded-[10px]" },
      { variant: "icon", size: "md", class: "w-[34px] h-[34px] !p-0 rounded-[10px]" },
      { variant: "icon", size: "sm", class: "w-[34px] h-[34px] !p-0 rounded-[10px]" },
    ],
    defaultVariants: { variant: "ghost", size: "md" },
  }
);

interface BtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof btnCva> {}

export function Btn({ variant, size, className, children, ...props }: BtnProps) {
  return (
    <button {...props} className={cn(btnCva({ variant, size }), className)}>
      {children}
    </button>
  );
}

/** Round trailing chip used inside primary CTA (.btn-trail). */
export function BtnTrail({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full bg-white/15 shrink-0 transition-transform duration-220 group-hover:translate-x-px">
      {children}
    </span>
  );
}
