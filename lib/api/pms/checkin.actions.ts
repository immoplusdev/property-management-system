"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface WalkInPayload {
  guest: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    nationality?: string;
  };
  roomId: string;
  roomTypeId: string;
  roomRate: number;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  children?: number;
  paymentMethod: string;
  amountPaid: number;
  breakfastIncluded?: boolean;
}

export interface CheckInIdentityPayload {
  idCardFrontId: string;
  idCardBackId: string;
  signatureFileId?: string;
}

export interface CheckInResult {
  success: boolean;
  reservationId: string;
  status: string;
  roomNumber: string;
  checkedInAt: string;
  checkOutDate: string;
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
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function startCheckIn(
  reservationId: string
): Promise<ActionResult<{ sessionId: string; steps: string[] }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ sessionId: string; steps: string[] }>(
      `/pms/checkin/${reservationId}/start`,
      { method: "POST", accessToken }
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
      { method: "PATCH", json: payload, accessToken }
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
      { method: "POST", accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
