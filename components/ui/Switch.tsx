"use client";
import { cn } from "@/lib/utils/cn";

interface SwitchProps {
  on: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ on, onChange, label, disabled }: SwitchProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 w-10 h-5.5 rounded-full cursor-pointer transition-colors duration-220",
        on ? "bg-primary" : "bg-border",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={e => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onChange(!on);
        }
      }}
    >
      <span
        className={cn(
          "absolute top-0.75 left-0.75 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-220",
          on && "translate-x-4.5"
        )}
      />
    </div>
  );
}
