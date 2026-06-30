"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";
import type { Transaction } from "@/lib/types/pms";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface FinanceSummary {
  period: string;
  date: string;
  totalRevenue: number;
  previousRevenue: number;
  revenueChange: number;
  occupancyRevenue: number;
  restaurantRevenue: number;
  spaRevenue: number;
  otherRevenue: number;
  pendingBalance: number;
  refunds: number;
  netRevenue: number;
}

export interface TransactionsList {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export async function getFinanceSummary(params?: {
  period?: "day" | "week" | "month" | "year";
  date?: string;
}): Promise<ActionResult<FinanceSummary>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.period) qs.set("period", params.period);
    if (params?.date) qs.set("date", params.date);
    const query = qs.toString() ? `?${qs}` : "";
    const data = await backendFetch<FinanceSummary>(`/pms/finances/summary${query}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  type?: string;
  paymentMethod?: string;
  fromDate?: string;
  toDate?: string;
}): Promise<ActionResult<TransactionsList>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.type) qs.set("type", params.type);
    if (params?.paymentMethod) qs.set("paymentMethod", params.paymentMethod);
    if (params?.fromDate) qs.set("fromDate", params.fromDate);
    if (params?.toDate) qs.set("toDate", params.toDate);
    const query = qs.toString() ? `?${qs}` : "";
    const data = await backendFetch<TransactionsList>(
      `/pms/finances/transactions${query}`,
      { accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function exportFinanceReport(): Promise<ActionResult<{ success: boolean; jobId: string; message: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ success: boolean; jobId: string; message: string }>(
      "/pms/finances/export",
      { method: "POST", accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
