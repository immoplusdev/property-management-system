"use client";

interface SwitchProps {
  on: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ on, onChange, label, disabled }: SwitchProps) {
  return (
    <div
      className={`toggle${on ? " on" : ""}${disabled ? " opacity-50 cursor-not-allowed" : ""}`}
      onClick={() => !disabled && onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={e => { if (!disabled && (e.key === "Enter" || e.key === " ")) onChange(!on); }}
    />
  );
}
