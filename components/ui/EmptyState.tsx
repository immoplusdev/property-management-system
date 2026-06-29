import React from "react";
import { Icon } from "./Icon";

interface EmptyStateProps {
  icon?: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, sub, action }: EmptyStateProps) {
  return (
    <div className="text-center px-5 py-10 text-ink-3" role="status" aria-label={title}>
      {icon && (
        <div
          className="w-15 h-15 mx-auto mb-3.5 rounded-[14px] bg-surface-2 grid place-items-center text-ink-3"
          aria-hidden="true"
        >
          <Icon name={icon} size={24} />
        </div>
      )}
      <div className="text-[14px] font-semibold text-ink-2">{title}</div>
      {sub && <div className="text-[12px] mt-1">{sub}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
