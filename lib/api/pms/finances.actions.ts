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

const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {};
const amount = (value: unknown): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const stringValue = (value: unknown, fallback = "—"): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : fallback;

function normalizeSummary(value: unknown): FinanceSummary {
  const raw = object(object(value).data ?? value);
  return {
    period: stringValue(raw.period, "month"),
    date: stringValue(raw.date, ""),
    totalRevenue: amount(raw.totalRevenue),
    previousRevenue: amount(raw.previousRevenue),
    revenueChange: amount(raw.revenueChange),
    occupancyRevenue: amount(raw.occupancyRevenue),
    restaurantRevenue: amount(raw.restaurantRevenue),
    spaRevenue: amount(raw.spaRevenue),
    otherRevenue: amount(raw.otherRevenue),
    pendingBalance: amount(raw.pendingBalance),
    refunds: amount(raw.refunds),
    netRevenue: amount(raw.netRevenue ?? raw.totalRevenue),
  };
}

function normalizeTransactions(value: unknown): TransactionsList {
  const root = object(value);
  const nested = object(root.data);
  const rows = Array.isArray(root.data) ? root.data : Array.isArray(nested.data) ? nested.data : [];
  const data: Transaction[] = rows.map((entry, index) => {
    const row = object(entry);
    const recordedAt = stringValue(row.recordedAt ?? row.time, "");
    const method = stringValue(row.paymentMethod ?? row.method);
    return {
      id: stringValue(row.id ?? row.transactionId, `transaction-${index + 1}`),
      time: recordedAt,
      type: stringValue(row.type),
      desc: stringValue(row.description ?? row.desc),
      amount: amount(row.amount),
      method: method === "orange_money" ? "om" : method === "mtn_momo" ? "mtn" : method === "credit_card" ? "card" : method,
      status: stringValue(row.status, "ok"),
      reference: typeof row.reference === "string" ? row.reference : undefined,
      reservationId: typeof row.reservationId === "string" ? row.reservationId : undefined,
      guestName: typeof row.guestName === "string" ? row.guestName : undefined,
      roomNumber: typeof row.roomNumber === "string" ? row.roomNumber : undefined,
      recordedBy: typeof row.recordedBy === "string" ? row.recordedBy : undefined,
    };
  });
  return {
    data,
    total: amount(root.total ?? nested.total) || data.length,
    page: amount(root.page ?? nested.page) || 1,
    limit: amount(root.limit ?? nested.limit) || data.length,
  };
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
    const data = await backendFetch<unknown>(`/pms/finances/summary${query}`, { accessToken });
    return { ok: true, data: normalizeSummary(data) };
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
    const data = await backendFetch<unknown>(
      `/pms/finances/transactions${query}`,
      { accessToken }
    );
    return { ok: true, data: normalizeTransactions(data) };
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
