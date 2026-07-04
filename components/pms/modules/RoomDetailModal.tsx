"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, StatusPill, Icon, Button, toastPromise } from "../shared";
import { cn } from "@/lib/utils/cn";
import { ROOM_TYPES_PMS, STATUS_CONFIG, formatDate } from "../data";
import type { Room, RoomStatus } from "@/lib/types/pms";
import { useUpdateRoomStatus } from "@/lib/hooks/pms/useRooms";

const EDITABLE_STATUSES: { value: RoomStatus; label: string }[] = [
  { value: "free",           label: "Libre"           },
  { value: "cleaning",       label: "Ménage"          },
  { value: "out_of_service", label: "Hors service"    },
];

export function RoomDetailModal({ room: initialRoom }: { room: Room }) {
  const router = useRouter();
  const [room, setRoom] = useState(initialRoom);
  const [newStatus, setNewStatus] = useState<RoomStatus | "">("");
  const updateStatus = useUpdateRoomStatus();

  function close() {
    router.back();
  }

  async function handleUpdateStatus() {
    if (!room.id || !newStatus) return;
    try {
      const updated = await toastPromise(updateStatus.mutateAsync({ id: room.id, status: newStatus }), {
        loading: "Mise à jour de la chambre…",
        success: `Chambre ${room.num} → ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`,
        error: (e) => (e as Error)?.message || "Erreur lors de la mise à jour",
      });
      setRoom(updated);
      setNewStatus("");
    } catch { /* toast déjà affiché */ }
  }

  return (
    <Modal
      open
      onClose={close}
      title={`Chambre ${room.num}`}
      maxWidth={440}
      footer={
        <>
          <Button variant="ghost" onClick={close}>Fermer</Button>
          <Button
            variant="primary"
            onClick={handleUpdateStatus}
            disabled={!newStatus || newStatus === room.status || updateStatus.isPending}
          >
            {updateStatus.isPending ? "Mise à jour…" : "Confirmer"}
          </Button>
        </>
      }
    >
      <div className="mb-3"><StatusPill status={room.status} /></div>
      {room.guest && (
        <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px] mb-2">
          <span className="text-ink-3 text-[13px]">Occupant</span>
          <strong>{room.guest}</strong>
        </div>
      )}
      {room.checkout && (
        <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px] mb-2">
          <span className="text-ink-3 text-[13px]">Check-out</span>
          <strong>{formatDate(room.checkout)}</strong>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px] mb-4">
        <span className="text-ink-3 text-[13px]">Type</span>
        <strong>{ROOM_TYPES_PMS.find(t => t.code === room.type)?.name ?? room.type}</strong>
      </div>
      {room.id && (
        <div>
          <div className="text-[11.5px] text-ink-3 font-medium mb-1.5">Changer le statut</div>
          <div className="flex gap-2 flex-wrap">
            {EDITABLE_STATUSES.map(s => (
              <button
                key={s.value}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[12.5px] font-medium border transition-all",
                  newStatus === s.value
                    ? "bg-primary text-white border-primary"
                    : "bg-surface border-border text-ink-2 hover:border-ink-3"
                )}
                onClick={() => setNewStatus(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
