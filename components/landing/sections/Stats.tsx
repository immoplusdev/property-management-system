"use client";
import { motion } from "framer-motion";
import { reveal, stagger } from "@/lib/animations/motion";
import { Wrap, Counter } from "../shared";

const STATS = [
  { to: 42,  suffix: "",    label: "chambres gérées en démo" },
  { to: 1,   suffix: "min", label: "par check-in client" },
  { to: 100, suffix: "%",   label: "des paiements réconciliés" },
  { to: 24,  suffix: "/7",  label: "support en français" },
];

export function Stats() {
  return (
    <section className="py-16 bg-white border-y border-border-soft">
      <Wrap>
        <motion.div
          className="grid grid-cols-4 gap-6 text-center max-[880px]:grid-cols-2 max-[880px]:gap-8"
          {...reveal(0)}
        >
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...stagger(i)}>
              <div className="text-[clamp(38px,4.8vw,64px)] leading-[1] tracking-[-0.03em] text-primary" style={{ fontFamily: "var(--font-display)" }}>
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="text-[13.5px] text-ink-2 mt-2.5 leading-[1.4]">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </Wrap>
    </section>
  );
}
