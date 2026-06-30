"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface InvoiceExtra {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  date?: string;
}

export interface Invoice {
  reservationId?: string;
  ref: string;
  guest: { firstName: string; lastName: string };
  room: { number: string; typeName: string };
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  extras: InvoiceExtra[];
  roomTotal: number;
  touristTax?: number;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  paymentMethod?: string;
}

export interface CheckOutPayload {
  paymentMethod?: string;
  amountPaid?: number;
  notes?: string;
}

export interface CheckOutResult {
  success: boolean;
  reservationId: string;
  roomNumber: string;
  guestName: string;
  checkedOutAt: string;
  invoiceRef: string;
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
