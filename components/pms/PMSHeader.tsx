"use client";
import React from "react";
import { Icon } from "./shared";
import { Button } from "@/components/ui/Button";

interface PMSHeaderProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  search?: boolean;
}

export function PMSHeader({ title, sub, actions, search = true }: PMSHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-7 gap-6">
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold tracking-[-0.028em] m-0 leading-[1.05]">{title}</h1>
        {sub && <div className="text-[13px] text-ink-3 mt-1.5 max-w-[520px]">{sub}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-1">
        {search && (
          <div className="h-[38px] w-[220px] bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 text-[13px] text-ink-3 focus-within:border-ink-3 transition-colors">
            <Icon name="eye" size={14} color="var(--color-ink-3)" />
            <input
              className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4"
              placeholder="Rechercher…"
            />
            <span className="bg-surface-2 px-1.5 py-px rounded-[4px] text-[10.5px] text-ink-3 font-mono">⌘K</span>
          </div>
        )}
        {actions}
        <Button variant="icon" size="md" aria-label="Notifications">
          <Icon name="bell" size={15} />
        </Button>
      </div>
    </div>
  );
}
