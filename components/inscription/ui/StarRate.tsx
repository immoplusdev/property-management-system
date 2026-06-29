"use client";
import { Icon } from "./Icon";

interface StarRateProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export function StarRate({ value, onChange, max = 5 }: StarRateProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Note">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={i + 1 === value}
          aria-label={`${i + 1} étoile${i > 0 ? "s" : ""}`}
          className={`cursor-pointer transition-[color,transform] duration-150 hover:text-amber hover:scale-120 ${i < value ? "text-amber" : "text-ink-4"}`}
          onClick={() => onChange(i + 1)}
        >
          <Icon name={i < value ? "starFilled" : "star"} size={18} />
        </button>
      ))}
    </div>
  );
}
