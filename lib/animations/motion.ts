import type { Transition, Variants } from "framer-motion";

/* ──────────── Shared easing ──────────── */
export const ease = [0.22, 1, 0.36, 1] as const;

/* ──────────── Entrance on mount (above the fold) ──────────── */
export const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 22 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
});

export const fadeIn = (delay = 0) => ({
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  transition: { duration: 0.5, ease, delay },
});

export const scaleInUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 28, scale: 0.96 },
  animate:    { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.65, ease, delay },
});

/* ──────────── Entrance on scroll ──────────── */
export const reveal = (delay = 0) => ({
  initial:      { opacity: 0, y: 18 },
  whileInView:  { opacity: 1, y: 0 },
  viewport:     { once: true, margin: "-80px" },
  transition:   { duration: 0.55, ease, delay },
});

export const scaleIn = (delay = 0) => ({
  initial:      { opacity: 0, scale: 0.94 },
  whileInView:  { opacity: 1, scale: 1 },
  viewport:     { once: true, margin: "-80px" },
  transition:   { duration: 0.5, ease, delay },
});

/** Per-item delay for a list revealed individually (no shared parent variants). */
export const stagger = (i: number, base = 0.08) => reveal(i * base);

/* ──────────── Parent/child stagger (variants-based cascade) ──────────── */
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  initial:     "hidden",
  whileInView: "visible",
  viewport:    { once: true, margin: "-80px" },
  variants: {
    hidden:  {},
    visible: { transition: { staggerChildren, delayChildren } },
  } satisfies Variants,
});

export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ──────────── Ambient floating (hero cards, decorative blobs) ──────────── */
export const float = (amplitude = 10, duration = 6, delay = 0) => ({
  animate:    { y: [0, -amplitude, 0] as number[] },
  transition: { duration, delay, repeat: Infinity, ease: "easeInOut" as const },
});

/* ──────────── Interaction feedback ──────────── */
const springTap: Transition = { type: "spring", stiffness: 420, damping: 24 };

export const hoverLift = { whileHover: { y: -4 }, transition: { duration: 0.18, ease } };

export const hoverTapButton = {
  whileHover: { scale: 1.03 },
  whileTap:   { scale: 0.96 },
  transition: springTap,
};

export const tapPress = { whileTap: { scale: 0.96 }, transition: springTap };
