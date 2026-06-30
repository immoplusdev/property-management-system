"use client";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils/cn";

interface UploadZoneProps {
  title: string;
  sub?: string;
  icon?: string;
  onClick?: () => void;
  square?: boolean; // For ID card uploads (1:1 aspect ratio)
}

export function UploadZone({ title, sub, icon = "upload", onClick, square = false }: UploadZoneProps) {
  if (square) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full aspect-square rounded-[16px] border-[1.5px] border-border bg-white",
          "flex flex-col items-center justify-center gap-2",
          "cursor-pointer transition-all duration-220",
          "hover:border-primary hover:bg-primary-50"
        )}
      >
        <div className="w-14 h-14 rounded-full bg-primary-50 text-primary grid place-items-center shadow-[0_0_0_1px_rgba(39,68,222,0.1)]">
          <Icon name={icon} size={24} />
        </div>
      </button>
    );
  }

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
