export type {
  RoomStatus, Room, RoomType, BookingStatus, Booking,
  GuestType, Guest, GuestStay, Transaction, AppProfile, AppRequest, RequestType,
  ReviewGuest, ReviewScore, Review, ReviewStats, PlanningBooking, StatusConfig,
} from "@/lib/types/pms";

import type { RoomStatus, RequestType, StatusConfig } from "@/lib/types/pms";

export const REQUEST_TYPES: Record<string, RequestType> = {
  room_service: { label: "Room service", icon: "utensils", color: "amber" },
  concierge: { label: "Conciergerie", icon: "bell", color: "violet" },
  laundry: { label: "Pressing", icon: "droplet", color: "teal" },
  spa: { label: "Spa & bien-être", icon: "sparkles", color: "pink" },
  cleaning: { label: "Ménage", icon: "refresh", color: "primary" },
  transfer: { label: "Transfert", icon: "car", color: "primary" },
};

export const STATUS_CONFIG: Record<RoomStatus, StatusConfig> = {
  free: { label: "Libre", color: "var(--success)", bg: "var(--success-bg)" },
  occupied: { label: "Occupée", color: "var(--primary)", bg: "var(--info-bg)" },
  departure: { label: "Départ", color: "var(--warn)", bg: "var(--warn-bg)" },
  cleaning: { label: "Ménage", color: "var(--violet)", bg: "var(--violet-bg)" },
  arriving: { label: "Arrivée", color: "var(--teal)", bg: "var(--teal-bg)" },
  out_of_service: { label: "Hors-service", color: "var(--text-3)", bg: "var(--bg-2)" },
};

export function formatFCFA(n: number | null | undefined): string {
  return typeof n === "number" && Number.isFinite(n)
    ? `${n.toLocaleString("fr-FR")} FCFA`
    : "—";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
