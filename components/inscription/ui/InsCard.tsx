import React from "react";
import { cn } from "@/lib/utils/cn";

interface InsCardProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "section";
  /** Flat outline variant (no elevation), e.g. Step 1 bento cards. */
  flat?: boolean;
}

/** Inscription surface card (.card): rounded-[20px], padded, soft layered shadow. */
export function InsCard({ as = "section", flat, className, children, ...props }: InsCardProps) {
  const Tag = as;
  return (
    <Tag
      {...props}
      className={cn(
        "bg-surface rounded-[20px] p-6 transition-shadow duration-400",
        flat ? "shadow-none border border-border" : "shadow-card",
        className
      )}
    >
      {children}
    </Tag>
  );
}
