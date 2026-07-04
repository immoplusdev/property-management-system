"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "iconsax-react";

export function AnnounceBar() {
  return (
    <motion.a
      href="#"
      className="sticky top-0 z-[60] flex items-center justify-center h-11 px-6 max-[560px]:px-4"
      style={{ background: "#F72585" }}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.15 }}
        style={{ background: "rgba(0,0,0,0.08)" }}
      />

      <div className="relative flex items-center justify-center gap-1.5 min-w-0">
        <span className="hidden min-[640px]:inline text-[13px] font-bold uppercase tracking-[0.02em] text-black whitespace-nowrap">
          Déploiement août 2026.
        </span>
        <span className="hidden min-[640px]:inline text-black/50">•</span>
        <span className="hidden min-[640px]:inline text-[13px] font-medium text-black whitespace-nowrap">
          Découvrez la Bêta Hygge
        </span>
        <span className="min-[640px]:hidden text-[12.5px] font-bold uppercase text-black truncate">
          Août 2026 • Bêta Hygge
        </span>
        <motion.span
          className="inline-flex shrink-0"
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <ArrowRight size={14} color="#000000" />
        </motion.span>
      </div>
    </motion.a>
  );
}
