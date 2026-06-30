"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";
import type { Booking, BookingStatus } from "@/lib/types/pms";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface ReservationsListParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  source?: string;
  fromDate?: string;
  toDate?: string;
  guestId?: string;
  search?: string;
}

export interface ReservationsList {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateReservationPayload {
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  children?: number;
  source?: string;
  breakfastIncluded?: boolean;
  specialRequests?: string;
}

export interface AddPaymentPayload {
  amount: number;
  method: string;
  reference?: string;
}

export async function getReservations(
  params?: ReservationsListParams
): Promise<ActionResult<ReservationsList>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.status) qs.set("status", params.status);
    if (params?.source) qs.set("source", params.source);
    if (params?.fromDate) qs.set("fromDate", params.fromDate);
    if (params?.toDate) qs.set("toDate", params.toDate);
    if (params?.guestId) qs.set("guestId", params.guestId);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs}` : "";
    const data = await backendFetch<ReservationsList>(`/pms/reservations${query}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getReservation(id: string): Promise<ActionResult<Booking>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<Booking>(`/pms/reservations/${id}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function createReservation(
  payload: CreateReservationPayload
): Promise<ActionResult<Booking>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<Booking>("/pms/reservations", {
      method: "POST",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function addReservationPayment(
  id: string,
  payload: AddPaymentPayload
): Promise<ActionResult<{ success: boolean; paid: number; balance: number }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ success: boolean; paid: number; balance: number }>(
      `/pms/reservations/${id}/payment`,
      { method: "POST", json: payload, accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function cancelReservation(
  id: string
): Promise<ActionResult<{ success: boolean }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ success: boolean }>(`/pms/reservations/${id}`, {
      method: "DELETE",
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
