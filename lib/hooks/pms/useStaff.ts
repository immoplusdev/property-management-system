"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStaff,
  inviteStaff,
  revokeStaff,
  type StaffRole,
} from "@/lib/api/pms/staff.actions";

export const staffKeys = {
  all:  () => ["staff"] as const,
  list: () => ["staff", "list"] as const,
};

export function useStaff() {
  return useQuery({
    queryKey: staffKeys.list(),
    queryFn: async () => {
      const res = await getStaff();
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 120_000,
  });
}

export function useInviteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { email: string; role: StaffRole }) =>
      inviteStaff(payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.all() });
    },
  });
}

export function useRevokeStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      revokeStaff(id).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: staffKeys.all() });
    },
  });
}
