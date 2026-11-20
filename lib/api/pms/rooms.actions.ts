"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";
import type { Room, RoomStatus } from "@/lib/types/pms";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface RoomsListParams {
  status?: RoomStatus;
  floor?: number;
  roomTypeId?: string;
}

export interface HousekeepingTask {
  id: string;
  roomId: string;
  roomNumber: string;
  status: "todo" | "in_progress" | "done";
  assignedTo?: string | null;
  notes?: string;
  date: string;
}

function normalizeRoom(value: unknown): Room {
  const room = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const roomType = room.roomType && typeof room.roomType === "object" ? room.roomType as Room["roomType"] : undefined;
  const currentGuest = room.currentGuest && typeof room.currentGuest === "object" ? room.currentGuest as Record<string, unknown> : {};
  return {
    id: String(room.id ?? ""),
    num: String(room.num ?? room.roomNumber ?? ""),
    type: String(room.type ?? roomType?.name ?? "—"),
    typeName: roomType?.name,
    roomType,
    floor: Number(room.floor ?? 0),
    status: String(room.status ?? "free") as RoomStatus,
    guest: typeof room.guest === "string" ? room.guest : typeof room.currentGuestName === "string" ? room.currentGuestName :
      [currentGuest.firstName, currentGuest.lastName].filter(part => typeof part === "string").join(" ") || undefined,
    checkout: typeof room.checkout === "string" ? room.checkout : typeof room.checkoutDate === "string" ? room.checkoutDate : undefined,
  };
}

export async function getRooms(params?: RoomsListParams): Promise<ActionResult<{ rooms: Room[] }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.floor !== undefined) qs.set("floor", String(params.floor));
    if (params?.roomTypeId) qs.set("roomTypeId", params.roomTypeId);
    const query = qs.toString() ? `?${qs}` : "";
    const response = await backendFetch<unknown>(`/pms/rooms${query}`, { accessToken });
    const raw = response && typeof response === "object" ? response as Record<string, unknown> : {};
    const floors = Array.isArray(raw.floors) ? raw.floors : [];
    const rows = Array.isArray(raw.rooms) ? raw.rooms : floors.flatMap(floor => {
      const group = floor && typeof floor === "object" ? floor as Record<string, unknown> : {};
      return Array.isArray(group.rooms) ? group.rooms : [];
    });
    if (!Array.isArray(raw.rooms) && !Array.isArray(raw.floors)) {
      throw new Error("Réponse API invalide : liste des chambres absente.");
    }
    const rooms: Room[] = rows.map(normalizeRoom);
    return { ok: true, data: { rooms } };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getRoom(id: string): Promise<ActionResult<Room>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<unknown>(`/pms/rooms/${id}`, { accessToken });
    return { ok: true, data: normalizeRoom(data) };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateRoomStatus(
  id: string,
  status: RoomStatus
): Promise<ActionResult<{ roomId: string; status: RoomStatus }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ roomId: string; status: RoomStatus }>(`/pms/rooms/${id}/status`, {
      method: "PATCH",
      json: { status },
      accessToken,
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function blockRoom(
  id: string,
  payload: { fromDate: string; toDate: string; reason: string; notes?: string }
): Promise<ActionResult<{ blockId: string; roomId: string; fromDate: string; toDate: string; status: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ blockId: string; roomId: string; fromDate: string; toDate: string; status: string }>(`/pms/rooms/${id}/block`, {
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

export async function unblockRoom(id: string, blockId: string): Promise<ActionResult<{ blockId: string; status: string; unblockedAt: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ blockId: string; status: string; unblockedAt: string }>(`/pms/rooms/${id}/blocks/${blockId}`, { method: "DELETE", accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function getHousekeepingTasks(params?: {
  status?: string;
  assignedTo?: string;
  date?: string;
}): Promise<ActionResult<{ tasks: HousekeepingTask[] }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.assignedTo) qs.set("assignedTo", params.assignedTo);
    if (params?.date) qs.set("date", params.date);
    const query = qs.toString() ? `?${qs}` : "";
    const data = await backendFetch<{ tasks: HousekeepingTask[] }>(
      `/pms/rooms/housekeeping${query}`,
      { accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateHousekeepingTask(
  taskId: string,
  payload: { status: string; notes?: string }
): Promise<ActionResult<HousekeepingTask>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<HousekeepingTask>(`/pms/rooms/housekeeping/${taskId}`, {
      method: "PATCH",
      json: payload,
      accessToken,
    });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function checkAvailability(params: {
  checkInDate: string;
  checkOutDate: string;
  roomId?: string;
}): Promise<ActionResult<{ available: boolean; roomId?: string; reasons?: string[] }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = new URLSearchParams({ checkInDate: params.checkInDate, checkOutDate: params.checkOutDate });
    if (params.roomId) qs.set("roomId", params.roomId);
    const data = await backendFetch<{ available: boolean; roomId?: string; reasons?: string[] }>(
      `/pms/reservations/availability?${qs}`,
      { accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
