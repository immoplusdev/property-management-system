"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { BookingStatusPill, PayBadge, AppBadge, SourceBadge, Icon, Button, toastPromise } from "../shared";
import { formatFCFA, formatDate, type Booking } from "../data";
import { useCancelReservation } from "@/lib/hooks/pms/useReservations";
import { useHotel } from "@/lib/pms/HotelContext";

export function ReservationDetail({ booking }: { booking: Booking }) {
  const router = useRouter();
  const hotel = useHotel();
  const go = (id: "checkin" | "checkout") => router.push(`/pms/${hotel}/${id}`);
  const cancelMut = useCancelReservation();
  const balance = booking.amount - booking.paid;

  async function handleCancel() {
    if (!confirm(`Annuler la réservation ${booking.ref} ?`)) return;
    try {
      await toastPromise(cancelMut.mutateAsync(booking.id), {
        loading: "Annulation en cours…",
        success: `Réservation ${booking.ref} annulée`,
        error: (e) => (e as Error)?.message || "Erreur lors de l'annulation",
      });
      router.push(`/pms/${hotel}/reservations`);
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="animate-pms-fade-up">
      <Link href={`/pms/${hotel}/reservations`} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink mb-3">
        <Icon name="arrowLeft" size={12} /> Réservations
      </Link>

      <PMSHeader
        title={booking.guest}
        sub={booking.ref}
        search={false}
        actions={
          <>
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={cancelMut.isPending || ["cancelled", "checked_out"].includes(booking.status)}
            >
              <Icon name="trash" size={13} /> Annuler
            </Button>
            {booking.status === "confirmed" && (
              <Button variant="primary" onClick={() => go("checkin")}>
                <Icon name="arrowRight" size={13} /> Check-in
              </Button>
            )}
            {booking.status === "checking_out" && (
              <Button variant="primary" onClick={() => go("checkout")}>
                <Icon name="arrowLeft" size={13} /> Check-out
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-2.5 mb-4">
        <BookingStatusPill status={booking.status} />
        <PayBadge method={booking.payment} />
        <SourceBadge source={booking.source} />
        {booking.source === "App" && <AppBadge size="sm" />}
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5.5 max-w-[640px]">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            ["Chambre",  booking.room === "—" ? "À attribuer" : booking.room],
            ["Type",     booking.roomType],
            ["Arrivée",  formatDate(booking.checkin)],
            ["Départ",   formatDate(booking.checkout)],
            ["Nuits",    String(booking.nights)],
            ["Source",   booking.source],
            ["Montant",  formatFCFA(booking.amount)],
            ["Payé",     formatFCFA(booking.paid)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
              <span className="text-ink-3 text-[13px]">{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        {balance > 0 && (
          <div className="p-3 rounded-[10px] font-medium text-[13px]" style={{ background: "var(--color-warn-bg)", color: "var(--color-warn)" }}>
            Solde restant : {formatFCFA(balance)}
          </div>
        )}
      </div>
    </div>
  );
}
