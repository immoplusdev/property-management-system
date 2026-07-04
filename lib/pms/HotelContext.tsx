"use client";
import React, { createContext, useContext } from "react";

const HotelContext = createContext<string | null>(null);

export function HotelProvider({ hotel, children }: { hotel: string; children: React.ReactNode }) {
  return <HotelContext.Provider value={hotel}>{children}</HotelContext.Provider>;
}

export function useHotel(): string {
  const hotel = useContext(HotelContext);
  if (!hotel) throw new Error("useHotel() must be used within app/pms/[hotel]/layout.tsx");
  return hotel;
}
