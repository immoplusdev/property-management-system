"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRescheduleReservation } from "@/lib/hooks/pms/useReservations";
import type { Booking } from "@/lib/types/pms";
import { formatDate } from "../data";
import { Button, Icon, toastPromise } from "../shared";

export function ReservationArrivalGuidance({ booking }: { booking: Booking }) {
  const router = useRouter();
  const reschedule = useRescheduleReservation();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Abidjan", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState("");

  async function handleReschedule() {
    if (!checkOutDate || checkOutDate <= checkInDate) return;
    try {
      await toastPromise(reschedule.mutateAsync({ id: booking.id, checkInDate, checkOutDate, roomTypeId: booking.roomTypeId }), {
        loading: "Reprogrammation en cours…",
        success: "Réservation confirmée aux nouvelles dates. Attribuez une chambre pour le check-in.",
        error: (error) => (error as Error).message || "Reprogrammation impossible",
      });
      router.refresh();
    } catch { /* toast déjà affiché */ }
  }

  if (booking.status === "no_show") {
    return (
      <div role="note" className="mt-4 rounded-xl border border-amber/25 bg-amber-bg p-4 text-[13px] text-ink-2">
        <div className="flex items-center gap-2 font-semibold text-warn">
          <Icon name="info" size={16} /> Arrivée non effectuée
        </div>
        <p className="mt-1.5 leading-relaxed">
          L&apos;arrivée était prévue le {formatDate(booking.checkin)}. Choisissez les nouvelles dates pour confirmer de nouveau cette réservation, puis attribuez une chambre.
        </p>
        {booking.paid > 0 && (
          <p className="mt-2 leading-relaxed">
            Les {booking.paid.toLocaleString("fr-FR")} FCFA déjà encaissés restent sur cette réservation et sont déduits du nouveau montant.
          </p>
        )}
        <p className="mt-2 text-[12px] leading-relaxed">Le tarif est recalculé selon les nouvelles dates. Vérifiez le solde après le report.</p>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="text-[12px]">Arrivée
            <input type="date" min={today} value={checkInDate} onChange={(event) => setCheckInDate(event.target.value)} className="mt-1 block rounded-lg border border-border bg-surface px-3 py-2" />
          </label>
          <label className="text-[12px]">Départ
            <input type="date" min={checkInDate} value={checkOutDate} onChange={(event) => setCheckOutDate(event.target.value)} className="mt-1 block rounded-lg border border-border bg-surface px-3 py-2" />
          </label>
          <Button variant="primary" disabled={reschedule.isPending || !checkOutDate || checkOutDate <= checkInDate} onClick={handleReschedule}>
            {reschedule.isPending ? "Reprogrammation…" : "Reprogrammer"}
          </Button>
        </div>
      </div>
    );
  }

  if (booking.status === "confirmed" && booking.room === "—") {
    return (
      <div role="note" className="mt-4 rounded-xl border border-amber/25 bg-amber-bg p-4 text-[13px] leading-relaxed text-ink-2">
        Une chambre doit être attribuée à cette réservation avant de démarrer son check-in.
      </div>
    );
  }

  return null;
}
