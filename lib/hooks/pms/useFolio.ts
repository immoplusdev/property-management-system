"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addFolioItem, getReservationFolio } from "@/lib/api/pms/folio.actions";

export const folioKeys = { reservation: (id: string) => ["folio", id] as const };

export function useReservationFolio(reservationId: string, enabled = true) {
  return useQuery({
    queryKey: folioKeys.reservation(reservationId),
    queryFn: async () => {
      const result = await getReservationFolio(reservationId);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!reservationId && enabled,
  });
}

export function useAddFolioItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reservationId, payload }: {
      reservationId: string;
      payload: { type: "extra" | "discount" | "city_tax"; category?: string; label: string; quantity: number; unitPriceHt: number; tvaRate: number; occurredAt: string };
    }) => addFolioItem(reservationId, payload).then(result => {
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: folioKeys.reservation(variables.reservationId) });
      queryClient.invalidateQueries({ queryKey: ["checkout", "invoice", variables.reservationId] });
    },
  });
}
