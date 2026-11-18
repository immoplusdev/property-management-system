"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface WalkInPayload {
  roomId: string;
  checkOutDate: string;
  adults: number;
  children: number;
  guest: {
    firstName: string;
    lastName: string;
    phone: string;
    nationality: string;
    idCardNumber: string;
  };
  payment: {
    amount: number;
    paymentMethod: "cash" | "orange_money" | "wave" | "mtn_momo" | "moov_money";
    reference?: string;
  };
}

export interface CheckInIdentityPayload {
  idCardFrontId: string;
  idCardBackId: string;
  signatureFileId?: string;
  identityVerified: true;
}

export interface CheckInResult {
  reservationId: string;
  reference?: string;
  room?: { id: string; number: string; status: string };
  stay?: { checkInDate: string; checkOutDate: string; nights: number };
  pricing?: { nightlyRate: number; totalTtc: number };
  payment?: { transactionId: string; status: string; confirmedAmount: number };
  balanceDue?: number;
  status: string;
  checkinId?: string;
  roomStatus?: string;
  keyHandedAt?: string;
}

export async function startWalkIn(
  payload: WalkInPayload
): Promise<ActionResult<CheckInResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<CheckInResult>("/pms/checkin/walk-in", {
      method: "POST",
      json: payload,
      accessToken,
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function startCheckIn(
  reservationId: string
): Promise<ActionResult<{ checkinId: string; status: "in_progress"; balanceDue: number }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ checkinId: string; status: "in_progress"; balanceDue: number }>(
      `/pms/checkin/${reservationId}/start`,
      { method: "POST", json: {}, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateCheckInIdentity(
  reservationId: string,
  payload: CheckInIdentityPayload
): Promise<ActionResult<{ success: boolean }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ success: boolean }>(
      `/pms/checkin/${reservationId}/identity`,
      { method: "PATCH", json: payload, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function completeCheckIn(
  reservationId: string
): Promise<ActionResult<CheckInResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<CheckInResult>(
      `/pms/checkin/${reservationId}/complete`,
      { method: "POST", json: {}, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
