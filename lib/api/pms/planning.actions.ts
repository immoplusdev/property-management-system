"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

/** A room slot occupied by a reservation — see dimension.md §8.1. */
export interface PlanningBookingSlot {
  reservationId: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  nights: number;
  color?: string;
}

/** A room slot blocked for maintenance/other reasons — see dimension.md §8.1. */
export interface PlanningBlockedSlot {
  blockId: string;
  reason: string;
  fromDate: string;
  toDate: string;
  type: "blocked";
}

export type PlanningSlot = PlanningBookingSlot | PlanningBlockedSlot;

export interface PlanningRoom {
  id: string;
  number: string;
  floor: number;
  typeName: string;
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
