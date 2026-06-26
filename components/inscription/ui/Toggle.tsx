"use client";

interface ToggleProps {
  on: boolean;
  onChange: (val: boolean) => void;
}

export function Toggle({ on, onChange }: ToggleProps) {
  return (
    <div
      className={`toggle${on ? " on" : ""}`}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
    />
  );
}
