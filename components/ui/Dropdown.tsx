"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./Icon";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
}

export interface DropdownDivider {
  divider: true;
}

type Item = DropdownItem | DropdownDivider;

function isDivider(item: Item): item is DropdownDivider {
  return "divider" in item;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: Item[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "right" }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <div
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        style={{ display: "inline-flex" }}
      >
        {trigger}
      </div>

      {open && (
        <div
          id={menuId}
          role="menu"
          style={{
            position: "absolute",
            [align === "right" ? "right" : "left"]: 0,
            top: "calc(100% + 4px)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "var(--shadow-lg, 0 16px 48px rgba(18,19,26,.10))",
            minWidth: 180,
            zIndex: 300,
            padding: 4,
            animation: "pms-fade .1s ease",
          }}
        >
          {items.map((item, i) => {
            if (isDivider(item)) {
              return (
                <hr
                  key={`divider-${i}`}
                  role="separator"
                  style={{ margin: "4px 0", border: "none", borderTop: "1px solid var(--border-soft, var(--border))" }}
                />
              );
            }
            return (
              <button
                key={i}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => { item.onClick(); setOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 10px",
                  border: "none",
                  background: "transparent",
                  color: item.danger ? "var(--danger)" : item.disabled ? "var(--text-4)" : "var(--text)",
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: item.disabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background .1s ease",
                }}
                onMouseEnter={e => { if (!item.disabled) e.currentTarget.style.background = "var(--bg-2)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                {item.icon && <Icon name={item.icon} size={14} aria-hidden="true" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
