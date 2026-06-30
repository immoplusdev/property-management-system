"use client";
import { useQuery } from "@tanstack/react-query";
import { getPlanning } from "@/lib/api/pms/planning.actions";

export const planningKeys = {
  range: (from: string, to: string) => ["planning", from, to] as const,
};

export function usePlanning(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: planningKeys.range(from, to),
    queryFn: async () => {
      const res = await getPlanning(from, to);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!from && !!to && enabled,
    staleTime: 120_000,
  });
}
