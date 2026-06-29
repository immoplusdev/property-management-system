import React from "react";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProps {
  data: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}

export function Donut({ data, centerValue, centerLabel }: DonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 62, c = 80, sw = 16;
  const circ = 2 * Math.PI * r;

  // Pre-compute each arc length + its cumulative offset, purely (no mutable accumulator).
  const segments = data.map((d, i) => {
    const len = (d.value / total) * circ;
    const offset = data.slice(0, i).reduce((sum, p) => sum + (p.value / total) * circ, 0);
    return { ...d, len, offset };
  });

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 160 160" className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={sw} />
        {segments.map((s, i) => (
          <circle
            key={i} cx={c} cy={c} r={r} fill="none"
            stroke={s.color} strokeWidth={sw}
            strokeDasharray={`${s.len} ${circ - s.len}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[22px] font-bold tracking-[-0.02em] text-ink">{centerValue}</div>
          <div className="text-[11px] text-ink-3">{centerLabel}</div>
        </div>
      </div>
    </div>
  );
}
