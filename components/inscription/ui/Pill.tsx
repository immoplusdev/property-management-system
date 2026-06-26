import type { ReactNode } from "react";

type PillKind = "primary" | "success" | "warn" | "danger" | "violet" | "teal" | "amber" | "pink" | "";

interface PillProps {
  kind?: PillKind;
  dot?: boolean;
  children: ReactNode;
}

export function Pill({ kind = "", dot, children }: PillProps) {
  return (
    <span className={`pill${kind ? ` ${kind}` : ""}${dot ? " dot" : ""}`}>
      {children}
    </span>
  );
}
