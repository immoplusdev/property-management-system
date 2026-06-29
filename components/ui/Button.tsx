import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const btnCva = cva(
  "inline-flex items-center gap-[7px] font-medium transition-all duration-[120ms] border whitespace-nowrap tracking-[-0.005em] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white border-transparent hover:bg-primary-600 active:bg-primary-700",
        ghost:   "bg-surface border-border text-ink hover:bg-surface-2",
        soft:    "bg-surface-2 text-ink border-transparent hover:bg-border",
        text:    "bg-transparent border-transparent text-ink-2 hover:text-ink",
        icon:    "bg-surface border-border text-ink-2 hover:bg-surface-2 hover:text-ink grid place-items-center",
      },
      size: {
        sm: "h-8 px-3 text-[12.5px] rounded-lg",
        md: "h-[38px] px-[14px] text-[13px] rounded-[9px]",
        lg: "h-11 px-[18px] text-[14px] rounded-[10px]",
      },
    },
    compoundVariants: [
      { variant: "icon", size: "sm", class: "w-7 h-7 !p-0 rounded-lg" },
      { variant: "icon", size: "md", class: "w-[34px] h-[34px] !p-0 rounded-[9px]" },
      { variant: "icon", size: "lg", class: "w-10 h-10 !p-0 rounded-[10px]" },
    ],
    defaultVariants: { variant: "ghost", size: "md" },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof btnCva> {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(btnCva({ variant, size }), className)}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading ?? undefined}
    >
      {children}
    </button>
  );
}
