"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReservations,
  getReservation,
  createReservation,
  addReservationPayment,
  cancelReservation,
  refundReservation,
  type RefundPaymentMethod,
  type ReservationsListParams,
  type CreateReservationPayload,
  type AddPaymentPayload,
} from "@/lib/api/pms/reservations.actions";

export const reservationKeys = {
  all:    () => ["reservations"] as const,
  list:   (params?: ReservationsListParams) => ["reservations", "list", params] as const,
  detail: (id: string) => ["reservations", "detail", id] as const,
};

export function useReservations(params?: ReservationsListParams) {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: async () => {
      const res = await getReservations(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useReservation(id: string) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: async () => {
      const res = await getReservation(id);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservationPayload) =>
      createReservation(payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all() });
    },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddPaymentPayload }) =>
      addReservationPayment(id, payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: reservationKeys.all() });
    },
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelReservation(id, reason).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all() });
    },
  });
}

export function useRefundReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { amount: number; paymentMethod: RefundPaymentMethod; reason: string; reference?: string; withFolioCredit: boolean } }) => {
      const result = await refundReservation(id, payload);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (_result, { id }) => {
      qc.invalidateQueries({ queryKey: reservationKeys.all() });
      qc.invalidateQueries({ queryKey: reservationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: ["finances"] });
      qc.invalidateQueries({ queryKey: ["folio", id] });
    },
  });
}
