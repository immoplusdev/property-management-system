"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/types/pms";
import { useRooms } from "@/lib/hooks/pms/useRooms";
import { useAssignReservationRoom } from "@/lib/hooks/pms/useReservations";
import { Button, toastPromise } from "../shared";

export function ReservationRoomAssignment({ booking }: { booking: Booking }) {
  const router = useRouter();
  const roomsQuery = useRooms(booking.roomTypeId ? { roomTypeId: booking.roomTypeId } : undefined);
  const assign = useAssignReservationRoom();
  const [roomId, setRoomId] = useState("");
  if (booking.status !== "confirmed" || booking.room !== "—") return null;

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Abidjan", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const arrivingNow = booking.checkin <= today;
  const rooms = (roomsQuery.data?.rooms ?? []).filter((room) =>
    room.id && room.roomType?.id === booking.roomTypeId && (!arrivingNow || room.status === "free"),
  );

  async function handleAssign() {
    if (!roomId) return;
    try {
      await toastPromise(assign.mutateAsync({ id: booking.id, roomId }), {
        loading: "Attribution de la chambre…",
        success: "Chambre attribuée. Le check-in est maintenant disponible.",
        error: (error) => (error as Error).message || "Attribution impossible",
      });
      router.refresh();
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 text-[13px] font-semibold">Attribuer une chambre</div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={`Chambre pour ${booking.ref}`}
          className="min-w-[180px] flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-[13px]"
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
          disabled={roomsQuery.isLoading || assign.isPending}
        >
          <option value="">Choisir une chambre</option>
          {rooms.map((room) => <option key={room.id} value={room.id}>{room.num} · {room.type}</option>)}
        </select>
        <Button variant="primary" disabled={!roomId || assign.isPending} onClick={handleAssign}>
          {assign.isPending ? "Attribution…" : "Attribuer"}
        </Button>
      </div>
      {roomsQuery.isError && <p role="alert" className="mt-2 text-[12px] text-danger">Impossible de charger les chambres.</p>}
      {!roomsQuery.isLoading && !roomsQuery.isError && rooms.length === 0 && (
        <p className="mt-2 text-[12px] text-ink-3">Aucune chambre de ce type disponible à la sélection. Vérifiez les chambres et les dates du séjour.</p>
      )}
      <p className="mt-2 text-[11px] text-ink-3">La disponibilité sur les dates du séjour est vérifiée lors de l’attribution.</p>
    </div>
  );
}
