"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

/** One line of the pre-checkout invoice. Backend: `{ label, amount }` — see dimension.md §6.1. */
export interface InvoiceExtra {
  label: string;
  amount: number;
}

/** Response of `GET /pms/checkout/:reservationId/invoice` — see dimension.md §6.1. */
export interface Invoice {
  reservationId: string;
  guest: { firstName: string; lastName: string };
  room: { number: string; typeName: string };
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomRate: number;
  roomTotal: number;
  extras: InvoiceExtra[];
  extrasTotal: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
}

/** Request body of `POST /pms/checkout/:reservationId` — see dimension.md §6.2. */
export interface CheckOutPayload {
  notes?: string;
}

/** Response of `POST /pms/checkout/:reservationId` — see dimension.md §6.2. */
export interface CheckOutResult {
  success: boolean;
  reservationId: string;
  status: string;
  invoiceId: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  checkedOutAt: string;
}

export async function getCheckOutInvoice(reservationId: string): Promise<ActionResult<Invoice>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<Invoice>(`/pms/checkout/${reservationId}/invoice`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function performCheckOut(
  reservationId: string,
  payload?: CheckOutPayload
): Promise<ActionResult<CheckOutResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<CheckOutResult>(`/pms/checkout/${reservationId}`, {
      method: "POST",
      json: payload ?? {},
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
