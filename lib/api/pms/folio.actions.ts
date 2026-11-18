"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: FormError };
async function token() { return getAccessToken(); }

export interface FolioSummary {
  folio: { totalHt: number; taxTotal: number; totalTtc: number };
  payments: { confirmedTotal: number; refundedTotal: number };
  balanceDue: number;
  invoiceStatus: "pending" | "ready" | "failed";
}

export interface FolioItem {
  id: string;
  type: "extra" | "discount" | "city_tax";
  category?: string;
  label: string;
  quantity: number;
  unitPriceHt: number;
  taxAmount: number;
  amountTtc: number;
  occurredAt: string;
}

export interface ReservationFolio {
  reservationId: string;
  currency?: "XOF";
  items: FolioItem[];
  folio?: FolioSummary["folio"];
  payments?: FolioSummary["payments"];
  balanceDue: number;
}

export async function getReservationFolio(reservationId: string): Promise<ActionResult<ReservationFolio>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<ReservationFolio>(`/pms/reservations/${reservationId}/folio`, { accessToken });
    if (!Array.isArray(data.items) || typeof data.balanceDue !== "number" || !Number.isFinite(data.balanceDue)) {
      throw new Error("Réponse API invalide : folio incomplet.");
    }
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function addStayPayment(reservationId: string, payload: { amount: number; paymentMethod: "cash" | "wave" | "orange_money" | "mtn_momo" | "moov_money"; reference?: string; description?: string }): Promise<ActionResult<{ transactionId: string; status: string; amount: number; currency: "XOF"; balanceDue: number }>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ transactionId: string; status: string; amount: number; currency: "XOF"; balanceDue: number }>(`/pms/reservations/${reservationId}/payment`, { method: "POST", json: payload, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function addFolioItem(reservationId: string, payload: { type: "extra" | "discount" | "city_tax"; category?: string; label: string; quantity: number; unitPriceHt: number; tvaRate: number; occurredAt: string }): Promise<ActionResult<{ folioItemId: string; amountHt: number; taxAmount: number; amountTtc: number; folioTotalTtc: number; balanceDue: number }>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ folioItemId: string; amountHt: number; taxAmount: number; amountTtc: number; folioTotalTtc: number; balanceDue: number }>(`/pms/reservations/${reservationId}/folio-items`, { method: "POST", json: payload, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function getInvoicePdf(reservationId: string): Promise<ActionResult<{ invoiceId: string; status: "pending" | "ready" | "failed"; downloadUrl?: string; expiresAt?: string }>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ invoiceId: string; status: "pending" | "ready" | "failed"; downloadUrl?: string; expiresAt?: string }>(`/pms/checkout/${reservationId}/invoice/pdf`, { accessToken });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}
