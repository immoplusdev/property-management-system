"use client";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";

interface CheckboxProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  sub?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, sub, disabled }: CheckboxProps) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Tick box */}
      <div
        className={cn(
          "shrink-0 mt-px w-4.5 h-4.5 rounded-[5px] border-[1.5px] grid place-items-center transition-all duration-150",
          checked
            ? "bg-primary border-primary text-white"
            : "bg-surface border-border-strong group-hover:border-primary/60"
        )}
      >
        {checked && <Icon name="check" size={12} stroke={3} />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-medium text-ink leading-snug">{label}</div>
        {sub && (
          <div className="text-[11.5px] text-ink-3 mt-0.5 leading-[1.4]">{sub}</div>
        )}
      </div>
    </div>
  );
}
