import React from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps {
  children: React.ReactNode;
  flat?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, flat, className, style, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-[18px] p-[22px]",
        flat && "bg-transparent",
        className
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
