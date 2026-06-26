import type { ReactNode } from "react";
import { Icon } from "./Icon";

interface SectionHeadProps {
  icon?: string;
  title: string;
  sub?: string;
  right?: ReactNode;
}

export function SectionHead({ icon, title, sub, right }: SectionHeadProps) {
  return (
    <div className="sec-head">
      <div className="sh-left">
        {icon && (
          <div className="sh-icon">
            <Icon name={icon} size={16} />
          </div>
        )}
        <div>
          <div className="sh-title">{title}</div>
          {sub && <div className="sh-sub">{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}
