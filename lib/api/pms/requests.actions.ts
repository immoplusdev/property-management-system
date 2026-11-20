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

export interface NotifyRequestWhatsAppResult {
  notificationId: string;
  status: "queued" | "sent";
  requestId: string;
}

export async function notifyRequestWhatsApp(id: string): Promise<ActionResult<NotifyRequestWhatsAppResult>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<NotifyRequestWhatsAppResult>(`/pms/requests/${id}/notify-whatsapp`, {
      method: "POST",
      json: {},
      accessToken,
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
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
    const response = await backendFetch<unknown>(`/pms/requests${query}`, { accessToken });
    const raw = response && typeof response === "object" ? response as Record<string, unknown> : {};
    if (!Array.isArray(raw.data)) throw new Error("Réponse API invalide : demandes absentes.");
    const data: AppRequest[] = raw.data.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ""),
      type: String(item.type ?? ""),
      title: String(item.title ?? ""),
      description: typeof item.description === "string" ? item.description : undefined,
      amount: typeof item.amount === "number" ? item.amount : undefined,
      paymentMethod: typeof item.paymentMethod === "string" ? item.paymentMethod : undefined,
      status: String(item.status ?? "pending") as RequestStatus,
      reservationId: String(item.reservationId ?? ""),
      guestName: String(item.guestName ?? "Client inconnu"),
      roomNumber: String(item.roomNumber ?? "—"),
      assignedTo: typeof item.assignedTo === "string" ? item.assignedTo : null,
      createdAt: String(item.createdAt ?? ""),
    }));
    return { ok: true, data: { data, total: Number(raw.total ?? data.length) } };
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
