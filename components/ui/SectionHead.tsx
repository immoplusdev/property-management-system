import React from "react";
import { Icon } from "./Icon";

interface SectionHeadProps {
  icon?: string;
  title: string;
  sub?: string;
  right?: React.ReactNode;
}

export function SectionHead({ icon, title, sub, right }: SectionHeadProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
        {icon && (
          <div className="w-6.5 h-6.5 rounded-[7px] bg-surface-2 text-ink-2 grid place-items-center shrink-0">
            <Icon name={icon} size={16} />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
          </div>
          {sub && (
            <div className="text-[12px] text-ink-3 mt-px whitespace-nowrap overflow-hidden text-ellipsis">
              {sub}
            </div>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
