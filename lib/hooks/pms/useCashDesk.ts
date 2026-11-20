"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closeCashDesk, createCashAdjustment, getCashClosures, reviewCashAdjustment } from "@/lib/api/pms/cash-desk.actions";

const key = ["pms", "cash-desk", "closures"] as const;

export function useCashClosures() {
  return useQuery({ queryKey: key, queryFn: async () => {
    const result = await getCashClosures();
    if (!result.ok) throw new Error(result.error.message);
    return result.data.data;
  } });
}

export function useCloseCashDesk() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload: { date: string; countedCash: number; notes?: string }) => {
    const result = await closeCashDesk(payload);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: key }) });
}

export function useCreateCashAdjustment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload: { date: string; amount: number; reason: string }) => {
    const result = await createCashAdjustment(payload);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: key }) });
}

export function useReviewCashAdjustment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async ({ adjustmentId, decision }: { adjustmentId: string; decision: "validate" | "reject" }) => {
    const result = await reviewCashAdjustment(adjustmentId, decision);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: key }) });
}
