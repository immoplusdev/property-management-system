"use client";
import { Icon } from "./Icon";

interface StarRateProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export function StarRate({ value, onChange, max = 5 }: StarRateProps) {
  return (
    <div className="star-rate">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`star${i < value ? " active" : ""}`}
          onClick={() => onChange(i + 1)}
        >
          <Icon name={i < value ? "starFilled" : "star"} size={18} />
        </div>
      ))}
    </div>
  );
}
