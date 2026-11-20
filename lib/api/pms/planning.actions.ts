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
    const response = await backendFetch<unknown>(
      `/pms/planning?from=${from}&to=${to}`,
      { accessToken }
    );
    const raw = response && typeof response === "object" ? response as Record<string, unknown> : {};
    if (!Array.isArray(raw.rooms)) throw new Error("Réponse API invalide : planning absent.");
    const rooms: PlanningRoom[] = raw.rooms.map((value: unknown) => {
      const room = value && typeof value === "object" ? value as Record<string, unknown> : {};
      const daily = Array.isArray(room.slots) ? room.slots : [];
      const slots: PlanningBookingSlot[] = [];
      for (const value of daily) {
        const day = value && typeof value === "object" ? value as Record<string, unknown> : {};
        if (typeof day.reservationId !== "string" || typeof day.date !== "string") continue;
        const previous = slots[slots.length - 1];
        const nextDate = new Date(`${day.date}T00:00:00Z`);
        nextDate.setUTCDate(nextDate.getUTCDate() + 1);
        const checkOutDate = nextDate.toISOString().slice(0, 10);
        if (previous?.reservationId === day.reservationId && previous.checkOutDate === day.date) {
          previous.checkOutDate = checkOutDate;
          previous.nights += 1;
        } else {
          slots.push({
            reservationId: day.reservationId,
            guestName: String(day.guestName ?? "—"),
            checkInDate: day.date,
            checkOutDate,
            status: String(day.status ?? "confirmed"),
            nights: 1,
          });
        }
      }
      return {
        id: String(room.id ?? ""),
        number: String(room.number ?? room.roomNumber ?? ""),
        floor: Number(room.floor ?? 0),
        typeName: String(room.typeName ?? room.roomTypeName ?? "—"),
        slots,
      };
    });
    return { ok: true, data: { from: String(raw.from ?? raw.fromDate ?? from), to: String(raw.to ?? raw.toDate ?? to), rooms } };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
