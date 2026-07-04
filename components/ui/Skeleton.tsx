import React from "react";
import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Chargement…"
      className={cn("bg-surface-2 rounded-lg animate-pulse", className)}
    />
  );
}
