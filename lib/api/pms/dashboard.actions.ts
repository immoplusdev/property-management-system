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
  monthRevenue?: number;
  arrivalsToday?: number;
  departuresToday?: number;
  inHouseGuests?: number;
  pendingReservations?: number;
  averageDailyRate?: number;
  revPAR?: number;
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
    const response = await backendFetch<unknown>(`/pms/dashboard/kpis${qs}`, { accessToken });
    const raw = response && typeof response === "object" ? response as Record<string, unknown> : {};
    const number = (value: unknown): number | undefined =>
      typeof value === "number" && Number.isFinite(value) ? value : undefined;
    const todayRevenue = number(raw.todayRevenue ?? raw.revenueToday);
    const occupancyRate = number(raw.occupancyRate);
    const occupiedRooms = number(raw.occupiedRooms);
    const totalRooms = number(raw.totalRooms);
    if (typeof raw.date !== "string" || todayRevenue === undefined || occupancyRate === undefined || occupiedRooms === undefined || totalRooms === undefined) {
      throw new Error("Réponse API invalide : indicateurs du tableau de bord incomplets.");
    }
    return { ok: true, data: {
      date: raw.date,
      todayRevenue,
      occupancyRate,
      occupiedRooms,
      totalRooms,
      availableRooms: number(raw.availableRooms) ?? Math.max(0, totalRooms - occupiedRooms),
      monthRevenue: number(raw.monthRevenue),
      arrivalsToday: number(raw.arrivalsToday),
      departuresToday: number(raw.departuresToday),
      inHouseGuests: number(raw.inHouseGuests),
      pendingReservations: number(raw.pendingReservations),
      averageDailyRate: number(raw.averageDailyRate),
      revPAR: number(raw.revPAR),
    } };
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
    const response = await backendFetch<unknown>(`/pms/dashboard/activity?limit=${limit}`, { accessToken });
    const rows = Array.isArray(response) ? response : response && typeof response === "object" && "activities" in response ? response.activities : undefined;
    if (!Array.isArray(rows)) throw new Error("Réponse API invalide : activité absente.");
    return { ok: true, data: { activities: rows.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ""),
      type: String(item.type ?? ""),
      description: String(item.description ?? ""),
      performedBy: String(item.performedBy ?? ""),
      timestamp: String(item.timestamp ?? item.createdAt ?? ""),
    })) } };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getDashboardPaymentMix(): Promise<ActionResult<DashboardPaymentMix>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const response = await backendFetch<unknown>("/pms/dashboard/payment-mix", { accessToken });
    const raw = response && typeof response === "object" ? response as Record<string, unknown> : {};
    const rows = raw.breakdown ?? raw.mix;
    if (!Array.isArray(rows)) throw new Error("Réponse API invalide : mix des paiements absent.");
    return { ok: true, data: {
      period: String(raw.period ?? "7 jours"),
      total: Number(raw.total ?? raw.totalRevenue ?? 0),
      breakdown: rows.map((item: Record<string, unknown>) => ({
        method: String(item.method ?? "unknown"),
        amount: Number(item.amount ?? 0),
        percentage: Number(item.percentage ?? item.share ?? 0),
        count: Number(item.count ?? 0),
      })),
    } };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export interface OccupancyDay {
  date: string;
  sellableRooms: number;
  occupiedRooms: number;
  occupancyRate: number;
  isPeak: boolean;
}

export interface OperationalAlert {
  code: string;
  level: "critical" | "warning" | "info";
  message: string;
  reservationIds?: string[];
  dates?: string[];
}

export async function getDashboardOccupancyStats(fromDate: string, toDate: string): Promise<ActionResult<{ dailyStats: OccupancyDay[]; averageOccupancyRate: number }>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ dailyStats: OccupancyDay[]; averageOccupancyRate: number }>(`/pms/dashboard/occupancy-stats?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`, { accessToken });
    if (!Array.isArray(data.dailyStats)) throw new Error("Réponse API invalide : occupation absente.");
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function getDashboardOperationalAlerts(): Promise<ActionResult<{ alerts: OperationalAlert[] }>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ alerts: OperationalAlert[] }>("/pms/dashboard/operational-alerts", { accessToken });
    if (!Array.isArray(data.alerts)) throw new Error("Réponse API invalide : alertes absentes.");
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function exportDailyReport(): Promise<ActionResult<{ exportId: string; status: "queued" | "processing" }>> {
  const accessToken = await token();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ exportId: string; status: "queued" | "processing" }>(
      "/pms/dashboard/export",
      { method: "POST", accessToken }
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
