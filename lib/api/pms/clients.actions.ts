"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";
import type { Guest, GuestType } from "@/lib/types/pms";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface GuestsList {
  data: Guest[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateGuestPayload {
  type?: GuestType;
  notes?: string;
  corporateName?: string | null;
  isBlacklisted?: boolean;
  blacklistReason?: string | null;
}

export interface UpdateGuestResult {
  success: true;
  guestId: string;
  type: string;
  updatedAt: string;
}

export async function getGuests(params?: {
  page?: number;
  limit?: number;
  type?: GuestType;
  search?: string;
}): Promise<ActionResult<GuestsList>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.type) qs.set("type", params.type);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString() ? `?${qs}` : "";
    const data = await backendFetch<GuestsList>(`/pms/guests${query}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getGuest(id: string): Promise<ActionResult<Guest>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<Guest>(`/pms/guests/${id}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateGuest(
  id: string,
  payload: UpdateGuestPayload
): Promise<ActionResult<UpdateGuestResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<UpdateGuestResult>(`/pms/guests/${id}`, {
      method: "PATCH",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
