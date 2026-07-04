"use client";
import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./shared";
import { Button } from "@/components/ui/Button";

interface PMSHeaderProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  search?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

export function PMSHeader({ title, sub, actions, search = true, searchPlaceholder = "Rechercher…", onSearch }: PMSHeaderProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!search) return;
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [search]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  }

  function handleClear() {
    setQuery("");
    onSearch?.("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (query) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    }
  }

  return (
    <div className="flex items-start justify-between mb-7 gap-6">
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold tracking-[-0.028em] m-0 leading-[1.05]">{title}</h1>
        {sub && <div className="text-[13px] text-ink-3 mt-1.5 max-w-[520px]">{sub}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0 mt-1">
        {search && (
          <div className="h-[38px] w-[220px] bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 text-[13px] text-ink-3 focus-within:border-ink-3 transition-colors">
            <Icon name="search" size={14} color="var(--color-ink-3)" />
            <input
              ref={inputRef}
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-0 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4"
              placeholder={searchPlaceholder}
              aria-label="Rechercher"
            />
            {query ? (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Effacer la recherche"
                className="shrink-0 flex items-center justify-center text-ink-3 hover:text-ink transition-colors"
              >
                <Icon name="x" size={14} />
              </button>
            ) : (
              <span className="shrink-0 bg-surface-2 px-1.5 py-px rounded-[4px] text-[10.5px] text-ink-3 font-mono">⌘K</span>
            )}
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
