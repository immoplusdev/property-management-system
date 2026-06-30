"use client";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hydration-safe "are we on the client yet?" flag.
 *
 * Returns `false` during SSR and the first client render (so server/client HTML
 * match), then `true` afterwards — without calling setState in an effect (which
 * `react-hooks/set-state-in-effect` forbids). Use to gate `createPortal`, which
 * needs `document.body`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
