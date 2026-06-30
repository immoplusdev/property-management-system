"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  startWalkIn,
  startCheckIn,
  updateCheckInIdentity,
  completeCheckIn,
  type WalkInPayload,
  type CheckInIdentityPayload,
} from "@/lib/api/pms/checkin.actions";
import { reservationKeys } from "./useReservations";
import { roomKeys } from "./useRooms";

export function useWalkIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalkInPayload) =>
      startWalkIn(payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all() });
      qc.invalidateQueries({ queryKey: roomKeys.all() });
    },
  });
}

export function useStartCheckIn() {
  return useMutation({
    mutationFn: (reservationId: string) =>
      startCheckIn(reservationId).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
  });
}

export function useUpdateCheckInIdentity() {
  return useMutation({
    mutationFn: ({ reservationId, payload }: { reservationId: string; payload: CheckInIdentityPayload }) =>
      updateCheckInIdentity(reservationId, payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
  });
}

export function useCompleteCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reservationId: string) =>
      completeCheckIn(reservationId).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reservationKeys.all() });
      qc.invalidateQueries({ queryKey: roomKeys.all() });
    },
  });
}
