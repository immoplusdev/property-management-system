import React from "react";
import { Icon } from "./Icon";

/** Inline helper hint shown under a card section (.stepN-tip). */
export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 px-3.75 py-2.75 bg-primary-50 rounded-2xl mt-4.5">
      <div className="shrink-0 w-5.5 h-5.5 rounded-full bg-primary text-white grid place-items-center mt-px">
        <Icon name="sparkles" size={12} />
      </div>
      <p className="text-[13px] text-ink-2 leading-[1.55] m-0">{children}</p>
    </div>
  );
}
