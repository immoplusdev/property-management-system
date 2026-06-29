"use client";
import { createContext, useContext } from "react";

interface PmsStatusContextValue {
  hasBanner: boolean;
}

const PmsStatusContext = createContext<PmsStatusContextValue>({ hasBanner: false });

export function PmsStatusProvider({
  hasBanner,
  children,
}: {
  hasBanner: boolean;
  children: React.ReactNode;
}) {
  return (
    <PmsStatusContext.Provider value={{ hasBanner }}>
      {children}
    </PmsStatusContext.Provider>
  );
}

export function usePmsStatus() {
  return useContext(PmsStatusContext);
}
