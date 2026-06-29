"use client";
import React, { useId } from "react";
import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  variant?: "pill" | "line";
  className?: string;
}

export function Tabs({ tabs, active, onChange, variant = "pill", className }: TabsProps) {
  const uid = useId();

  if (variant === "line") {
    return (
      <div className={cn("flex border-b border-border mb-4.5 gap-0.5", className)} role="tablist">
        {tabs.map(t => (
          <button
            key={t.id}
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${uid}-panel-${t.id}`}
            className={cn(
              "px-3.5 py-2.5 text-[13px] font-medium text-ink-3 cursor-pointer relative border-none bg-transparent",
              "hover:text-ink-2 transition-colors",
              "after:absolute after:left-0 after:right-0 after:-bottom-px after:h-0.5 after:content-[''] after:rounded-full after:transition-transform",
              active === t.id ? "text-primary after:bg-primary after:scale-x-100" : "after:scale-x-0"
            )}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {t.badge != null && (
              <span className="ml-1.5 text-[11px] opacity-70">{t.badge}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px] w-max", className)}
      role="tablist"
    >
      {tabs.map(t => (
        <button
          key={t.id}
          role="tab"
          id={`${uid}-tab-${t.id}`}
          aria-selected={active === t.id}
          aria-controls={`${uid}-panel-${t.id}`}
          className={cn(
            "px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium text-ink-2 cursor-pointer inline-flex items-center gap-1.5",
            "border border-transparent transition-all hover:text-ink",
            active === t.id && "bg-surface text-ink border-border shadow-xs"
          )}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {t.badge != null && (
            <span className="text-[11px] opacity-70">{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}
