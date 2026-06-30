"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGuests,
  getGuest,
  updateGuest,
  type UpdateGuestPayload,
} from "@/lib/api/pms/clients.actions";
import type { GuestType } from "@/lib/types/pms";

export const guestKeys = {
  all:    () => ["guests"] as const,
  list:   (params?: object) => ["guests", "list", params] as const,
  detail: (id: string) => ["guests", "detail", id] as const,
};

export function useGuests(params?: { page?: number; limit?: number; type?: GuestType; search?: string }) {
  return useQuery({
    queryKey: guestKeys.list(params),
    queryFn: async () => {
      const res = await getGuests(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useGuest(id: string) {
  return useQuery({
    queryKey: guestKeys.detail(id),
    queryFn: async () => {
      const res = await getGuest(id);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useUpdateGuest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGuestPayload }) =>
      updateGuest(id, payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: guestKeys.detail(id) });
      qc.invalidateQueries({ queryKey: guestKeys.all() });
    },
  });
}
