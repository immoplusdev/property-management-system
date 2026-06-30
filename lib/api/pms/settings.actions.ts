"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface HotelSettings {
  hotelId: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  nightAccessCode?: string;
  reception24h: boolean;
  autoCheckout: boolean;
  whatsappBusinessNumber?: string;
  paymentMethods: string[];
  cancellationPolicy?: string;
  depositPercent: number;
  touristTax: number;
  checkInTime: string;
  checkOutTime: string;
}

export interface NotificationSettings {
  whatsappBusinessNumber?: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
}

export interface HotelHours {
  checkInTime: string;
  checkOutTime: string;
}

export async function getHotelSettings(): Promise<ActionResult<HotelSettings>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<HotelSettings>("/pms/settings/hotel", { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateHotelSettings(
  payload: Partial<HotelSettings>
): Promise<ActionResult<HotelSettings>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<HotelSettings>("/pms/settings/hotel", {
      method: "PATCH",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getHotelHours(): Promise<ActionResult<HotelHours>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<HotelHours>("/pms/settings/hours", { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateHotelHours(
  payload: Partial<HotelHours>
): Promise<ActionResult<HotelHours>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<HotelHours>("/pms/settings/hours", {
      method: "PATCH",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateNotificationSettings(
  payload: Partial<NotificationSettings>
): Promise<ActionResult<NotificationSettings>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<NotificationSettings>("/pms/settings/notifications", {
      method: "PATCH",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
