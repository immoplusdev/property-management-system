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
  maxOccupancy: number;
  description: string | null;
  bedType: string | null;
  bedCount: number | null;
  weekendPrice: number | null;
  longStayPrice: number | null;
  longStayMinNights: number | null;
  seasonalRates: Array<{ id?: string; fromDate: string; toDate: string; price: number }>;
}

export type RoomTypePayload = Pick<RoomTypeDto, "code" | "name" | "basePrice" | "maxOccupancy"> &
  Partial<Pick<RoomTypeDto, "description" | "bedType" | "bedCount" | "weekendPrice" | "longStayPrice" | "longStayMinNights" | "active">> &
  { seasonalRates?: Array<{ fromDate: string; toDate: string; price: number }> };

type ApiRoomType = Partial<RoomTypeDto> & { totalUnits?: number; isActive?: boolean };

function normalizeRoomType(item: ApiRoomType): RoomTypeDto {
  if (!item || typeof item.id !== "string" || typeof item.code !== "string" || typeof item.name !== "string" || typeof item.basePrice !== "number") {
    throw new Error("Réponse API invalide : un type de chambre est incomplet.");
  }
  return {
    id: item.id, code: item.code, name: item.name, basePrice: item.basePrice,
    currency: "XOF", roomCount: item.totalUnits ?? item.roomCount ?? 0,
    amenities: Array.isArray(item.amenities) ? item.amenities : [],
    active: item.isActive ?? item.active ?? true,
    maxOccupancy: item.maxOccupancy ?? 1,
    description: item.description ?? null,
    bedType: item.bedType ?? null,
    bedCount: item.bedCount ?? null,
    weekendPrice: item.weekendPrice ?? null,
    longStayPrice: item.longStayPrice ?? null,
    longStayMinNights: item.longStayMinNights ?? null,
    seasonalRates: Array.isArray(item.seasonalRates) ? item.seasonalRates : [],
  };
}

function apiPayload(payload: Partial<RoomTypePayload>) {
  const { active, ...fields } = payload;
  return active === undefined ? fields : { ...fields, isActive: active };
}

export async function getRoomTypes(): Promise<ActionResult<RoomTypeDto[]>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const response = await backendFetch<{ data: ApiRoomType[] } | ApiRoomType[]>("/pms/room-types", { accessToken });
    const data = Array.isArray(response) ? response : response.data;
    if (!Array.isArray(data)) throw new Error("Réponse API invalide : liste des types de chambres absente.");
    return { ok: true, data: data.map(normalizeRoomType) };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function createRoomType(payload: RoomTypePayload): Promise<ActionResult<RoomTypeDto>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<ApiRoomType>("/pms/room-types", { method: "POST", json: apiPayload(payload), accessToken });
    return { ok: true, data: normalizeRoomType(data) };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function updateRoomType(id: string, payload: Partial<RoomTypePayload>): Promise<ActionResult<RoomTypeDto>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<ApiRoomType>(`/pms/room-types/${id}`, { method: "PATCH", json: apiPayload(payload), accessToken });
    return { ok: true, data: normalizeRoomType(data) };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
