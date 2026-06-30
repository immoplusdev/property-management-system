"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";
import type { AppRequest } from "@/lib/types/pms";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface RequestsList {
  data: AppRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateRequestPayload {
  reservationId: string;
  guestId: string;
  type: string;
  title: string;
  description?: string;
  amount?: number;
  paymentMethod?: string;
  priority?: "normal" | "high" | "urgent";
}

export async function getRequests(params?: {
  status?: string;
  type?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<RequestsList>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.type) qs.set("type", params.type);
    if (params?.assignedTo) qs.set("assignedTo", params.assignedTo);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString() ? `?${qs}` : "";
    const data = await backendFetch<RequestsList>(`/pms/requests${query}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function createRequest(
  payload: CreateRequestPayload
): Promise<ActionResult<AppRequest>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<AppRequest>("/pms/requests", {
      method: "POST",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateRequestStatus(
  id: string,
  payload: { status: string; assignedTo?: string; notes?: string }
): Promise<ActionResult<AppRequest>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<AppRequest>(`/pms/requests/${id}/status`, {
      method: "PATCH",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
