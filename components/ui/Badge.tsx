import React from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";
import type { RoomStatus } from "@/lib/types/pms";

/* ─── StatusPill ─── */
const STATUS_MAP: Record<RoomStatus, { label: string; cls: string }> = {
  free:          { label: "Libre",        cls: "bg-success-bg text-success" },
  occupied:      { label: "Occupée",      cls: "bg-primary-50 text-primary" },
  departure:     { label: "Départ",       cls: "bg-warn-bg text-warn" },
  cleaning:      { label: "Ménage",       cls: "bg-violet-bg text-violet" },
  arriving:      { label: "Arrivée",      cls: "bg-teal-bg text-teal" },
  out_of_service:{ label: "Hors-service", cls: "bg-surface-2 text-ink-3" },
};

const PILL_BASE =
  "inline-flex items-center gap-1.5 px-[9px] py-[3px] rounded-full text-[11.5px] font-medium tracking-[-0.005em]";

export function StatusPill({ status }: { status: RoomStatus }) {
  const conf = STATUS_MAP[status];
  return (
    <span
      className={cn(
        PILL_BASE,
        conf.cls,
        "before:content-[''] before:w-1.25 before:h-1.25 before:rounded-full before:bg-current before:shrink-0"
      )}
      role="status"
      aria-label={`Statut : ${conf.label}`}
    >
      {conf.label}
    </span>
  );
}

/* ─── BookingStatusPill ─── */
const BOOKING_MAP: Record<string, { label: string; cls: string }> = {
  pending:      { label: "En attente", cls: "bg-warn-bg text-warn" },
  confirmed:    { label: "Confirmée",  cls: "bg-primary-50 text-primary" },
  checked_in:   { label: "Sur place",  cls: "bg-success-bg text-success" },
  checking_out: { label: "Départ",     cls: "bg-amber-bg text-amber" },
  checked_out:  { label: "Terminée",   cls: "bg-surface-2 text-ink-2" },
  cancelled:    { label: "Annulée",    cls: "bg-danger-bg text-danger" },
};

export function BookingStatusPill({ status }: { status: string }) {
  const c = BOOKING_MAP[status] ?? { label: status, cls: "bg-surface-2 text-ink-2" };
  return (
    <span
      className={cn(
        PILL_BASE,
        c.cls,
        "before:content-[''] before:w-1.25 before:h-1.25 before:rounded-full before:bg-current before:shrink-0"
      )}
      role="status"
      aria-label={`Réservation : ${c.label}`}
    >
      {c.label}
    </span>
  );
}

/* ─── PayBadge ─── */
const PAY_MAP: Record<string, { label: string; bg: string; color: string }> = {
  wave: { label: "Wave", bg: "var(--color-pay-wave)", color: "var(--color-surface)" },
  om:   { label: "OM",   bg: "var(--color-pay-om)",   color: "var(--color-surface)" },
  mtn:  { label: "MTN",  bg: "var(--color-pay-mtn)",  color: "var(--color-ink)"     },
  card: { label: "CB",   bg: "var(--color-primary)",  color: "var(--color-surface)" },
  cash: { label: "ESP",  bg: "var(--color-success)",   color: "var(--color-surface)" },
};

export function PayBadge({ method }: { method: string }) {
  const c = PAY_MAP[method];
  if (!c) return <span className="text-ink-3 text-[13px]" aria-label="Mode de paiement inconnu">—</span>;
  return (
    <span
      className="w-7.5 h-5.5 rounded-[5px] inline-grid place-items-center text-[9.5px] font-bold tracking-[0.04em]"
      style={{ background: c.bg, color: c.color }}
      aria-label={`Paiement : ${c.label}`}
    >
      {c.label}
    </span>
  );
}

/* ─── AppBadge ─── */
export function AppBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const sm = size === "sm";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.75 rounded-full bg-primary text-white font-semibold tracking-[0.01em]",
        sm ? "text-[9.5px] px-1.25 py-[1.5px]" : "text-[10px] px-1.75 py-0.5"
      )}
      title="Via l'app Immo Plus"
      aria-label="Via l'app Immo Plus"
    >
      <Icon name="smartphone" size={sm ? 9 : 10} aria-hidden="true" />
      <span aria-hidden="true">App</span>
    </span>
  );
}

/* ─── SourceBadge ─── */
export function SourceBadge({ source }: { source: string }) {
  if (source === "App") return <AppBadge />;
  if (source === "Corp") {
    return (
      <span
        className={cn(PILL_BASE, "bg-warn-bg text-warn")}
        aria-label="Source : Corporatif"
      >
        <Icon name="briefcase" size={10} aria-hidden="true" /> Corp
      </span>
    );
  }
  return (
    <span
      className={cn(PILL_BASE, "bg-surface-2 text-ink-2")}
      aria-label="Source : Direct"
    >
      <Icon name="phone" size={10} aria-hidden="true" /> Direct
    </span>
  );
}
