"use client";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getDashboardKPIs,
  getDashboardRooms,
  getDashboardMovements,
  getDashboardActivity,
  getDashboardPaymentMix,
  getDashboardOccupancyStats,
  getDashboardOperationalAlerts,
  exportDailyReport,
} from "@/lib/api/pms/dashboard.actions";

export const dashboardKeys = {
  all:           () => ["dashboard"] as const,
  kpis:          (date?: string) => ["dashboard", "kpis", date] as const,
  rooms:         () => ["dashboard", "rooms"] as const,
  movements:     () => ["dashboard", "movements"] as const,
  activity:      (limit?: number) => ["dashboard", "activity", limit] as const,
  paymentMix:    () => ["dashboard", "payment-mix"] as const,
  occupancy:     (from: string, to: string) => ["dashboard", "occupancy", from, to] as const,
  alerts:        () => ["dashboard", "alerts"] as const,
};

export function useDashboardKPIs(date?: string) {
  return useQuery({
    queryKey: dashboardKeys.kpis(date),
    queryFn: async () => {
      const res = await getDashboardKPIs(date);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useDashboardRooms() {
  return useQuery({
    queryKey: dashboardKeys.rooms(),
    queryFn: async () => {
      const res = await getDashboardRooms();
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useDashboardMovements() {
  return useQuery({
    queryKey: dashboardKeys.movements(),
    queryFn: async () => {
      const res = await getDashboardMovements();
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useDashboardActivity(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: async () => {
      const res = await getDashboardActivity(limit);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useDashboardPaymentMix() {
  return useQuery({
    queryKey: dashboardKeys.paymentMix(),
    queryFn: async () => {
      const res = await getDashboardPaymentMix();
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 300_000,
  });
}

export function useDashboardOccupancyStats(from: string, to: string) {
  return useQuery({ queryKey: dashboardKeys.occupancy(from, to), queryFn: async () => {
    const result = await getDashboardOccupancyStats(from, to);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, staleTime: 60_000 });
}

export function useDashboardOperationalAlerts() {
  return useQuery({ queryKey: dashboardKeys.alerts(), queryFn: async () => {
    const result = await getDashboardOperationalAlerts();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, staleTime: 30_000 });
}

export function useExportDailyReport() {
  return useMutation({
    mutationFn: () => exportDailyReport().then(res => {
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    }),
  });
}
