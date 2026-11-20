"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

type Result<T> = { ok: true; data: T } | { ok: false; error: FormError };

export interface CashCorrection {
  adjustmentId: string;
  amount: number;
  reason: string;
  status: string;
}

export interface CashClosure {
  closureId: string;
  date: string;
  expectedCash: number;
  countedCash: number;
  cashDiscrepancy: number;
  adjustedDiscrepancy: number;
  cashPayments: number;
  cashRefunds: number;
  status: string;
  notes?: string;
  corrections: CashCorrection[];
}

async function call<T>(path: string, method: "GET" | "POST" = "GET", json?: object): Promise<Result<T>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<T>(path, { method, json, accessToken, ...(method === "POST" ? { headers: { "Idempotency-Key": crypto.randomUUID() } } : {}) });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getCashClosures(): Promise<Result<{ data: CashClosure[] }>> {
  const result = await call<{ data: CashClosure[] }>("/pms/cash-desk/closures");
  if (result.ok && !Array.isArray(result.data.data)) return { ok: false, error: { message: "Réponse API invalide : clôtures absentes." } };
  return result;
}

export async function closeCashDesk(payload: { date: string; countedCash: number; notes?: string }): Promise<Result<CashClosure>> {
  return call<CashClosure>("/pms/cash-desk/daily-close", "POST", payload);
}

export async function createCashAdjustment(payload: { date: string; amount: number; reason: string }): Promise<Result<{ adjustmentId: string; status: string }>> {
  return call("/pms/cash-desk/adjustments", "POST", payload);
}

export async function reviewCashAdjustment(adjustmentId: string, decision: "validate" | "reject"): Promise<Result<{ adjustmentId: string; status: string }>> {
  return call(`/pms/cash-desk/adjustments/${adjustmentId}/${decision}`, "POST", {});
}
