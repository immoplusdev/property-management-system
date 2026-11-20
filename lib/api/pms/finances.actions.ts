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
  previousRevenue?: number;
  revenueChange?: number;
  occupancyRevenue?: number;
  restaurantRevenue?: number;
  spaRevenue?: number;
  otherRevenue?: number;
  pendingBalance?: number;
  refunds?: number;
  netRevenue?: number;
  revenueByMethod?: Record<string, number>;
  transactionCountByMethod?: Record<string, number>;
  revenueBySource?: Record<string, number>;
}

export interface TransactionsList {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

const object = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {};
const stringValue = (value: unknown, fallback = "—"): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : fallback;

function normalizeSummary(value: unknown): FinanceSummary {
  const raw = object(object(value).data ?? value);
  if (typeof raw.period !== "string" || typeof (raw.date ?? raw.to) !== "string" || typeof raw.totalRevenue !== "number" || !Number.isFinite(raw.totalRevenue)) {
    throw new Error("Réponse API invalide : résumé financier incomplet.");
  }
  return {
    period: raw.period,
    date: (raw.date ?? raw.to) as string,
    totalRevenue: raw.totalRevenue as number,
    previousRevenue: raw.previousRevenue as number | undefined,
    revenueChange: raw.revenueChange as number | undefined,
    occupancyRevenue: raw.occupancyRevenue as number | undefined,
    restaurantRevenue: raw.restaurantRevenue as number | undefined,
    spaRevenue: raw.spaRevenue as number | undefined,
    otherRevenue: raw.otherRevenue as number | undefined,
    pendingBalance: raw.pendingBalance as number | undefined,
    refunds: raw.refunds as number | undefined,
    netRevenue: raw.netRevenue as number | undefined,
    revenueByMethod: raw.revenueByMethod && typeof raw.revenueByMethod === "object" ? raw.revenueByMethod as Record<string, number> : undefined,
    transactionCountByMethod: raw.transactionCountByMethod && typeof raw.transactionCountByMethod === "object" ? raw.transactionCountByMethod as Record<string, number> : undefined,
    revenueBySource: raw.revenueBySource && typeof raw.revenueBySource === "object" ? raw.revenueBySource as Record<string, number> : undefined,
  };
}

function normalizeTransactions(value: unknown): TransactionsList {
  const root = object(value);
  const nested = object(root.data);
  const rows = Array.isArray(root.data) ? root.data : Array.isArray(nested.data) ? nested.data : [];
  const totalValue = root.total ?? nested.total;
  const pageValue = root.page ?? nested.page;
  const limitValue = root.limit ?? nested.limit;
  if (!Array.isArray(root.data) && !Array.isArray(nested.data)) throw new Error("Réponse API invalide : liste des transactions absente.");
  if (![totalValue, pageValue, limitValue].every(value => typeof value === "number" && Number.isFinite(value))) {
    throw new Error("Réponse API invalide : pagination des transactions absente.");
  }
  const data: Transaction[] = rows.map((entry, index) => {
    const row = object(entry);
    const id = row.id ?? row.transactionId;
    const recordedAt = row.recordedAt ?? row.time ?? row.confirmedAt ?? row.createdAt;
    const method = row.paymentMethod ?? row.method ?? "—";
    const description = row.description ?? row.desc;
    const amount = row.amount ?? (row.type === "refund" ? row.refundAmount : row.grossAmount);
    const status = row.status ?? row.reconciliationStatus;
    if (
      (typeof id !== "string" && typeof id !== "number") ||
      (typeof recordedAt !== "string") ||
      (typeof method !== "string") ||
      typeof row.type !== "string" ||
      typeof description !== "string" ||
      typeof status !== "string" ||
      typeof amount !== "number" || !Number.isFinite(amount)
    ) {
      throw new Error(`Réponse API invalide : transaction ${index + 1} incomplète.`);
    }
    return {
      id: String(id),
      time: recordedAt,
      type: row.type,
      desc: description,
      amount: row.type === "refund" ? -(amount as number) : amount as number,
      method: method === "orange_money" ? "om" : method === "mtn_momo" ? "mtn" : method === "credit_card" ? "card" : method,
      status: status === "confirmed" || status === "completed" ? "ok" : status,
      reference: typeof row.reference === "string" ? row.reference : undefined,
      reservationId: typeof row.reservationId === "string" ? row.reservationId : undefined,
      guestName: typeof row.guestName === "string" ? row.guestName : undefined,
      roomNumber: typeof row.roomNumber === "string" ? row.roomNumber : undefined,
      recordedBy: typeof row.recordedBy === "string" ? row.recordedBy : undefined,
    };
  });
  return {
    data,
    total: totalValue as number,
    page: pageValue as number,
    limit: limitValue as number,
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
    if (params?.period) qs.set("period", params.period === "day" ? "today" : params.period);
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
