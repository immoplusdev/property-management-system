import { cn } from "@/lib/utils/cn";

/** Radio selection dot (.rc-mark): hollow ring → filled primary disc when checked. */
export function RadioMark({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-full border-[1.5px] transition-all duration-220",
        checked
          ? "bg-primary border-primary shadow-[inset_0_0_0_3px_var(--color-surface)]"
          : "border-border-strong",
        className
      )}
    />
  );
}
