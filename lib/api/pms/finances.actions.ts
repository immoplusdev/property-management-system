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
const stringValue = (value: unknown, fallback = "—"): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : fallback;

function normalizeSummary(value: unknown): FinanceSummary {
  const raw = object(object(value).data ?? value);
  const numericFields = ["totalRevenue", "previousRevenue", "revenueChange", "occupancyRevenue", "restaurantRevenue", "spaRevenue", "otherRevenue", "pendingBalance", "refunds", "netRevenue"] as const;
  if (typeof raw.period !== "string" || typeof raw.date !== "string" || numericFields.some(key => typeof raw[key] !== "number" || !Number.isFinite(raw[key]))) {
    throw new Error("Réponse API invalide : résumé financier incomplet.");
  }
  return {
    period: raw.period,
    date: raw.date,
    totalRevenue: raw.totalRevenue as number,
    previousRevenue: raw.previousRevenue as number,
    revenueChange: raw.revenueChange as number,
    occupancyRevenue: raw.occupancyRevenue as number,
    restaurantRevenue: raw.restaurantRevenue as number,
    spaRevenue: raw.spaRevenue as number,
    otherRevenue: raw.otherRevenue as number,
    pendingBalance: raw.pendingBalance as number,
    refunds: raw.refunds as number,
    netRevenue: raw.netRevenue as number,
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
    const recordedAt = row.recordedAt ?? row.time;
    const method = row.paymentMethod ?? row.method;
    const description = row.description ?? row.desc;
    if (
      (typeof id !== "string" && typeof id !== "number") ||
      (typeof recordedAt !== "string") ||
      (typeof method !== "string") ||
      typeof row.type !== "string" ||
      typeof description !== "string" ||
      typeof row.status !== "string" ||
      typeof row.amount !== "number" || !Number.isFinite(row.amount)
    ) {
      throw new Error(`Réponse API invalide : transaction ${index + 1} incomplète.`);
    }
    return {
      id: String(id),
      time: recordedAt,
      type: row.type,
      desc: description,
      amount: row.amount,
      method: method === "orange_money" ? "om" : method === "mtn_momo" ? "mtn" : method === "credit_card" ? "card" : method,
      status: row.status,
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
