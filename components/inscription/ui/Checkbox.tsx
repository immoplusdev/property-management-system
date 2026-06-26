"use client";
import { Icon } from "./Icon";

interface CheckboxProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  sub?: string;
}

export function Checkbox({ checked, onChange, label, sub }: CheckboxProps) {
  return (
    <div
      className={`checkbox${checked ? " checked" : ""}`}
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
    >
      <div className="cb-box">
        {checked && <Icon name="check" size={14} stroke={3} />}
      </div>
      <div>
        <div className="cb-text">{label}</div>
        {sub && <div className="cb-sub">{sub}</div>}
      </div>
    </div>
  );
}
