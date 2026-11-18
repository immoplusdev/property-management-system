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

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? value as Record<string, unknown> : {};
const text = (value: unknown, fallback = ""): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : fallback;
const number = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Convert the backend's nested reservation DTO to the flat shape used by PMS views. */
function normalizeBooking(value: unknown): Booking {
  const raw = record(value);
  const guest = raw.guest;
  const guestRecord = record(guest);
  const guestName = typeof guest === "string"
    ? guest
    : text(guestRecord.fullName, [text(guestRecord.firstName), text(guestRecord.lastName)].filter(Boolean).join(" "));
  const room = record(raw.room);
  const roomType = record(raw.roomType);
  const checkin = text(raw.checkInDate ?? raw.checkin ?? raw.checkIn);
  const checkout = text(raw.checkOutDate ?? raw.checkout ?? raw.checkOut);
  const calculatedNights = checkin && checkout
    ? number(Math.round((Date.parse(checkout) - Date.parse(checkin)) / 86_400_000))
    : 0;
  const nights = number(raw.nights, Math.max(0, calculatedNights));
  const id = text(raw.id ?? raw.reservationId ?? raw.reference, "unknown");
  const sourceRef = text(raw.reference ?? raw.ref ?? raw.reservationNumber, id);
  return {
    id,
    ref: sourceRef,
    guest: guestName || "Client",
    guestId: text(guestRecord.id ?? raw.guestId),
    room: text(room.number ?? raw.roomNumber, "—"),
    roomType: text(room.typeName ?? roomType.name ?? roomType.code ?? raw.roomTypeName, "—"),
    checkin,
    checkout,
    nights,
    status: text(raw.status, "pending") as Booking["status"],
    amount: number(raw.totalAmount ?? raw.amount ?? raw.totalEstimate),
    paid: number(raw.paidAmount ?? raw.paid),
    payment: text(raw.paymentMethod ?? raw.payment, "—"),
    source: text(raw.source, "—"),
    adults: number(raw.adults),
    children: number(raw.children),
    balance: number(raw.balance, Math.max(0, number(raw.totalAmount ?? raw.amount) - number(raw.paidAmount ?? raw.paid))),
    breakfastIncluded: Boolean(raw.breakfastIncluded),
    specialRequests: text(raw.specialRequests),
  };
}

function normalizeReservations(value: unknown): ReservationsList {
  const root = record(value);
  const nested = record(root.data);
  const rows = Array.isArray(root.data) ? root.data : Array.isArray(nested.data) ? nested.data : [];
  return {
    data: rows.map(normalizeBooking),
    total: number(root.total ?? nested.total, rows.length),
    page: number(root.page ?? nested.page, 1),
    limit: number(root.limit ?? nested.limit, rows.length),
  };
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
  paymentMethod: "cash" | "wave" | "orange_money" | "mtn_momo" | "moov_money";
  reference?: string;
  description?: string;
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
    const data = await backendFetch<unknown>(`/pms/reservations${query}`, { accessToken });
    return { ok: true, data: normalizeReservations(data) };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getReservation(id: string): Promise<ActionResult<Booking>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<unknown>(`/pms/reservations/${id}`, { accessToken });
    const root = record(data);
    return { ok: true, data: normalizeBooking(root.data ?? data) };
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
    const data = await backendFetch<unknown>("/pms/reservations", {
      method: "POST",
      json: payload,
      accessToken,
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    const root = record(data);
    return { ok: true, data: normalizeBooking(root.data ?? data) };
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
      { method: "POST", json: payload, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } }
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
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
