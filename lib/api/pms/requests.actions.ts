"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

/** Real request statuses — see dimension.md §9. No `confirmed`/`done`, no `priority` field. */
export type RequestStatus = "pending" | "in_progress" | "completed" | "cancelled";

/** See dimension.md §9.1. */
export interface AppRequest {
  id: string;
  type: string;
  title: string;
  description?: string;
  amount?: number;
  paymentMethod?: string;
  status: RequestStatus;
  reservationId: string;
  guestName: string;
  roomNumber: string;
  assignedTo: string | null;
  createdAt: string;
}

export interface RequestsList {
  data: AppRequest[];
  total: number;
}

/** Request body of `POST /pms/requests` — see dimension.md §9.2. */
export interface CreateRequestPayload {
  reservationId: string;
  guestId: string;
  type: string;
  title: string;
  description?: string;
  amount?: number;
  paymentMethod?: string;
}

/** Response of `POST /pms/requests` — see dimension.md §9.2. */
export interface CreateRequestResult {
  requestId: string;
  status: RequestStatus;
  createdAt: string;
}

/** Response of `PATCH /pms/requests/:id/status` — see dimension.md §9.3. */
export interface UpdateRequestStatusResult {
  success: boolean;
  requestId: string;
  status: RequestStatus;
  updatedAt: string;
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
): Promise<ActionResult<CreateRequestResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<CreateRequestResult>("/pms/requests", {
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
  payload: { status: RequestStatus; assignedTo?: string; notes?: string }
): Promise<ActionResult<UpdateRequestStatusResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<UpdateRequestStatusResult>(`/pms/requests/${id}/status`, {
      method: "PATCH",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
