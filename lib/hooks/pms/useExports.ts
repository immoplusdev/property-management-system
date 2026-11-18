"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPmsExport, getPmsExport, type ExportDataset, type ExportFormat } from "@/lib/api/pms/exports.actions";

export function useCreatePmsExport() {
  return useMutation({
    mutationFn: (payload: { dataset: ExportDataset; format: ExportFormat; dateRange?: { fromDate: string; toDate: string } }) =>
      createPmsExport(payload).then(result => {
        if (!result.ok) throw new Error(result.error.message);
        return result.data;
      }),
  });
}

export function usePmsExport(exportId: string | null) {
  return useQuery({
    queryKey: ["pms-export", exportId],
    queryFn: async () => {
      if (!exportId) throw new Error("Identifiant d'export absent.");
      const result = await getPmsExport(exportId);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!exportId,
    refetchInterval: query => {
      const status = query.state.data?.status;
      return status === "ready" || status === "failed" ? false : 1500;
    },
  });
}
