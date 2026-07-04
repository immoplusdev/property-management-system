"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRequests,
  createRequest,
  updateRequestStatus,
  type CreateRequestPayload,
  type RequestStatus,
} from "@/lib/api/pms/requests.actions";

export const requestKeys = {
  all:  () => ["requests"] as const,
  list: (params?: object) => ["requests", "list", params] as const,
};

export function useRequests(params?: { status?: string; type?: string; assignedTo?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: requestKeys.list(params),
    queryFn: async () => {
      const res = await getRequests(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useCreateRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) =>
      createRequest(payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: requestKeys.all() });
    },
  });
}

export function useUpdateRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: RequestStatus; assignedTo?: string; notes?: string } }) =>
      updateRequestStatus(id, payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: requestKeys.all() });
    },
  });
}
