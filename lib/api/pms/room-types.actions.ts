"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: FormError };

export interface RoomTypeDto {
  id: string;
  code: string;
  name: string;
  basePrice: number;
  currency: "XOF";
  roomCount: number;
  amenities: string[];
  active: boolean;
}

export type RoomTypePayload = Pick<RoomTypeDto, "code" | "name" | "basePrice" | "amenities" | "active">;

export async function getRoomTypes(): Promise<ActionResult<RoomTypeDto[]>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const response = await backendFetch<{ data: RoomTypeDto[] } | RoomTypeDto[]>("/pms/room-types", { accessToken });
    const data = Array.isArray(response) ? response : response.data;
    if (!Array.isArray(data)) throw new Error("Réponse API invalide : liste des types de chambres absente.");
    if (data.some(item => !item || typeof item.id !== "string" || typeof item.code !== "string" || typeof item.name !== "string" || typeof item.basePrice !== "number" || typeof item.roomCount !== "number" || !Array.isArray(item.amenities))) {
      throw new Error("Réponse API invalide : un type de chambre est incomplet.");
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function createRoomType(payload: RoomTypePayload): Promise<ActionResult<RoomTypeDto>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<RoomTypeDto>("/pms/room-types", { method: "POST", json: payload, accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateRoomType(id: string, payload: Partial<RoomTypePayload>): Promise<ActionResult<RoomTypeDto>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<RoomTypeDto>(`/pms/room-types/${id}`, { method: "PATCH", json: payload, accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
