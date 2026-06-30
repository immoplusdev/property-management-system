"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getFinanceSummary,
  getTransactions,
  exportFinanceReport,
} from "@/lib/api/pms/finances.actions";

export const financeKeys = {
  summary:      (params?: object) => ["finances", "summary", params] as const,
  transactions: (params?: object) => ["finances", "transactions", params] as const,
};

export function useFinanceSummary(params?: { period?: "day" | "week" | "month" | "year"; date?: string }) {
  return useQuery({
    queryKey: financeKeys.summary(params),
    queryFn: async () => {
      const res = await getFinanceSummary(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useTransactions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
}) {
  return useQuery({
    queryKey: financeKeys.transactions(params),
    queryFn: async () => {
      const res = await getTransactions(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useExportFinanceReport() {
  return useMutation({
    mutationFn: () =>
      exportFinanceReport().then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
  });
}
