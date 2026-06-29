import { cn } from "@/lib/utils/cn";

/** Radio selection dot (.rc-mark): hollow ring → filled primary disc when checked. */
export function RadioMark({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "w-4.25 h-4.25 rounded-full border-[1.5px] transition-all duration-220",
        checked
          ? "bg-primary border-primary shadow-[inset_0_0_0_3px_#fff,0_2px_6px_rgba(39,68,222,0.30)]"
          : "border-border-strong",
        className
      )}
    />
  );
}
