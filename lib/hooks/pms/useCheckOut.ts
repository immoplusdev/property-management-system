"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCheckOutInvoice,
  performCheckOut,
  type CheckOutPayload,
} from "@/lib/api/pms/checkout.actions";
import { reservationKeys } from "./useReservations";
import { roomKeys } from "./useRooms";

export const checkoutKeys = {
  invoice: (reservationId: string) => ["checkout", "invoice", reservationId] as const,
};

export function useCheckOutInvoice(reservationId: string, enabled = true) {
  return useQuery({
    queryKey: checkoutKeys.invoice(reservationId),
    queryFn: async () => {
      const res = await getCheckOutInvoice(reservationId);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!reservationId && enabled,
  });
}

export function usePerformCheckOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: string; payload?: CheckOutPayload }) =>
      performCheckOut(reservationId, payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: (_data, { reservationId }) => {
      qc.invalidateQueries({ queryKey: reservationKeys.all() });
      qc.invalidateQueries({ queryKey: roomKeys.all() });
      qc.removeQueries({ queryKey: checkoutKeys.invoice(reservationId) });
    },
  });
}
