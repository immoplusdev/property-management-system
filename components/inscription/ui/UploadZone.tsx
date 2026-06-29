"use client";
import { Icon } from "./Icon";

interface UploadZoneProps {
  title: string;
  sub?: string;
  icon?: string;
  onClick?: () => void;
}

export function UploadZone({ title, sub, icon = "upload", onClick }: UploadZoneProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex flex-col items-center gap-2.5 text-center px-5 py-8 rounded-2xl border-2 border-dashed border-border-strong bg-surface-2 cursor-pointer transition-all duration-220 hover:border-primary hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="w-13 h-13 rounded-[14px] bg-primary-50 text-primary grid place-items-center shadow-[0_0_0_1px_var(--color-primary-100)]">
        <Icon name={icon} size={22} />
      </div>
      <div className="text-[14px] font-bold text-ink">{title}</div>
      {sub && <div className="text-[12px] text-ink-3 leading-normal">{sub}</div>}
    </button>
  );
}
