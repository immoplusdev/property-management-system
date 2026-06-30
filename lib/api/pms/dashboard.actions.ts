"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface DashboardKPIs {
  date: string;
  occupancyRate: number;
  availableRooms: number;
  occupiedRooms: number;
  totalRooms: number;
  todayRevenue: number;
  monthRevenue: number;
  arrivalsToday: number;
  departuresToday: number;
  inHouseGuests: number;
  pendingReservations: number;
  averageDailyRate: number;
  revPAR: number;
}

export interface DashboardRooms {
  total: number;
  byStatus: Record<string, number>;
  occupancyRate: number;
}

export interface MovementEntry {
  reservationId: string;
  guestName: string;
  roomNumber: string;
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  status: string;
  expectedTime?: string | null;
  balance?: number;
}

export interface DashboardMovements {
  arrivals: MovementEntry[];
  departures: MovementEntry[];
}

export interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  performedBy: string;
  timestamp: string;
}

export interface DashboardActivity {
  activities: ActivityEntry[];
}

export interface PaymentMixEntry {
  method: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface DashboardPaymentMix {
  period: string;
  total: number;
  breakdown: PaymentMixEntry[];
}

async function token(): Promise<string | undefined> {
  return getAccessToken();
}

export async function getDashboardKPIs(date?: string): Promise<ActionResult<DashboardKPIs>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const qs = date ? `?date=${date}` : "";
    const data = await backendFetch<DashboardKPIs>(`/pms/dashboard/kpis${qs}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getDashboardRooms(): Promise<ActionResult<DashboardRooms>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<DashboardRooms>("/pms/dashboard/rooms", { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getDashboardMovements(): Promise<ActionResult<DashboardMovements>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<DashboardMovements>("/pms/dashboard/movements", { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getDashboardActivity(limit = 10): Promise<ActionResult<DashboardActivity>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<DashboardActivity>(`/pms/dashboard/activity?limit=${limit}`, { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getDashboardPaymentMix(): Promise<ActionResult<DashboardPaymentMix>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<DashboardPaymentMix>("/pms/dashboard/payment-mix", { accessToken });
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function exportDailyReport(): Promise<ActionResult<{ success: boolean; jobId: string; message: string }>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ success: boolean; jobId: string; message: string }>(
      "/pms/dashboard/export",
      { method: "POST", accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
