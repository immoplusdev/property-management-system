import React from "react";
import { Icon } from "./Icon";

/** Inline helper hint shown under a card section (.stepN-tip). */
export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 pl-4 border-l-[3px] border-l-tip mt-4.5">
      <Icon name="lamp" size={18} color="var(--color-tip)" className="shrink-0" />
      <p className="text-[13px] text-ink-2 leading-[1.55] m-0 [&_strong]:text-ink [&_strong]:font-bold">{children}</p>
    </div>
  );
}
