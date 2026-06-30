"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface PlanningSlot {
  date: string;
  reservationId: string | null;
  guestName: string | null;
  status: string;
}

export interface PlanningRoom {
  id: string;
  roomNumber: string;
  floor: number;
  roomTypeName: string;
  status: string;
  slots: PlanningSlot[];
}

export interface PlanningData {
  from: string;
  to: string;
  rooms: PlanningRoom[];
}

export async function getPlanning(from: string, to: string): Promise<ActionResult<PlanningData>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<PlanningData>(
      `/pms/planning?from=${from}&to=${to}`,
      { accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
