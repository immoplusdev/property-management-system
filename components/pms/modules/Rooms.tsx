"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { StatusPill, Icon, Button, toastPromise } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";
import { ROOM_TYPES_PMS, STATUS_CONFIG, formatFCFA, formatDate } from "../data";
import type { Room, RoomStatus } from "@/lib/types/pms";
import { useRooms, useUpdateRoomStatus } from "@/lib/hooks/pms/useRooms";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-2 rounded-lg animate-pulse ${className}`} />;
}

function RoomTile({ room, onClick }: { room: Room; onClick: () => void }) {
  const type = ROOM_TYPES_PMS.find(t => t.code === room.type);
  const sc   = STATUS_CONFIG[room.status] ?? STATUS_CONFIG.free;
  return (
    <div
      className="rounded-xl px-3.5 pt-3.5 pb-3 bg-surface border border-border cursor-pointer transition-all duration-120 relative min-h-29 flex flex-col hover:border-ink-3"
      onClick={onClick}
    >
      <span className="absolute top-3.5 left-3.5 w-1.5 h-1.5 rounded-full" style={{ background: sc.color }} />
      <div className="text-[26px] font-semibold tracking-[-0.04em] leading-none text-ink pl-3.5">{room.num}</div>
      <div className="text-[11px] text-ink-3 mt-1 font-medium pl-3.5">{type?.name ?? room.type}</div>
      {room.guest && (
        <div className="text-[12px] mt-auto pt-2.5 font-medium text-ink overflow-hidden text-ellipsis whitespace-nowrap">{room.guest}</div>
      )}
      {room.checkout && <div className="text-[11px] text-ink-3 mt-0.5">↩ {formatDate(room.checkout)}</div>}
    </div>
  );
}

const EDITABLE_STATUSES: { value: RoomStatus; label: string }[] = [
  { value: "free",           label: "Libre"           },
  { value: "cleaning",       label: "Ménage"          },
  { value: "out_of_service", label: "Hors service"    },
];

export function Rooms() {
  const [view,     setView]     = useState<"grid"|"list">("grid");
  const [filter,   setFilter]   = useState("all");
  const [selected, setSelected] = useState<Room|null>(null);
  const [newStatus, setNewStatus] = useState<RoomStatus | "">("");

  const { data, isLoading, error } = useRooms();
  const rooms: Room[] = data?.floors?.flatMap(f => f.rooms) ?? [];
  const updateStatus  = useUpdateRoomStatus();

  const filtered = filter === "all" ? rooms : rooms.filter(r => r.status === filter);
  const counts: Record<string, number> = {
    all: rooms.length,
    ...Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, rooms.filter(r => r.status === k).length]))
  };

  const byFloor = filtered.reduce<Record<number, Room[]>>((acc, r) => {
    (acc[r.floor] = acc[r.floor] || []).push(r);
    return acc;
  }, {});

  async function handleUpdateStatus() {
    if (!selected?.id || !newStatus) return;
    try {
      await toastPromise(updateStatus.mutateAsync({ id: selected.id, status: newStatus }), {
        loading: "Mise à jour de la chambre…",
        success: `Chambre ${selected.num} → ${STATUS_CONFIG[newStatus]?.label ?? newStatus}`,
        error: (e) => (e as Error)?.message || "Erreur lors de la mise à jour",
      });
      setSelected(null);
      setNewStatus("");
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Chambres"
        sub={
          isLoading
            ? "Chargement…"
            : `${rooms.length} chambres · ${counts["occupied"] ?? 0} occupées · ${counts["cleaning"] ?? 0} en ménage`
        }
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              <button
                className={cn("px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium inline-flex items-center gap-1.5", view === "grid" ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2")}
                onClick={() => setView("grid")}
              >
                <Icon name="grid" size={13} /> Grille
              </button>
              <button
                className={cn("px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium inline-flex items-center gap-1.5", view === "list" ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2")}
                onClick={() => setView("list")}
              >
                <Icon name="list" size={13} /> Liste
              </button>
            </div>
          </>
        }
      />

      <div className="bg-surface border border-border rounded-[18px] p-3.5 mb-4">
        <ChipGroup>
          <Chip label="Tout" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
          {Object.entries(STATUS_CONFIG).map(([k, c]) => (
            <Chip
              key={k}
              label={c.label}
              count={counts[k] ?? 0}
              active={filter === k}
              onClick={() => setFilter(k)}
              before={<span className="w-1.75 h-1.75 rounded-full shrink-0" style={{ background: c.color }} />}
            />
          ))}
        </ChipGroup>
      </div>

      {isLoading ? (
        <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
          {Array.from({ length: 20 }).map((_, i) => <Skeleton key={i} className="h-29" />)}
        </div>
      ) : error ? (
        <div className="py-12 text-center text-ink-3 text-[13px]">
          <Icon name="x" size={20} color="var(--color-warn)" />
          <div className="mt-2">Impossible de charger les chambres</div>
        </div>
      ) : view === "grid" ? (
        Object.keys(byFloor).sort((a,b) => Number(a)-Number(b)).map(floor => (
          <div key={floor} className="bg-surface border border-border rounded-[18px] p-5.5 mb-3.5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7.5 h-7.5 rounded-lg bg-primary-50 text-primary grid place-items-center font-bold text-[13px]">{floor}</div>
                <div>
                  <div className="font-semibold text-[14px]">Étage {floor}</div>
                  <div className="text-[11.5px] text-ink-3">
                    {byFloor[Number(floor)].length} chambres · {byFloor[Number(floor)].filter(r => r.status === "occupied" || r.status === "departure").length} occupées
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
              {byFloor[Number(floor)].map(r => (
                <RoomTile key={r.id} room={r} onClick={() => { setSelected(r); setNewStatus(""); }} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["N°","Type","Étage","Statut","Occupant","Check-out","Prix / nuit",""].map(h => (
                  <th key={h} className="text-left font-medium text-ink-3 text-[11.5px] px-3.5 py-2.5 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const type = ROOM_TYPES_PMS.find(t => t.code === r.type);
                return (
                  <tr
                    key={r.num}
                    className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2 cursor-pointer"
                    onClick={() => { setSelected(r); setNewStatus(""); }}
                  >
                    <td className="px-3.5 py-3.5 align-middle"><strong className="text-[15px]">{r.num}</strong></td>
                    <td className="px-3.5 py-3.5 align-middle">{type?.name}</td>
                    <td className="px-3.5 py-3.5 align-middle">{r.floor}</td>
                    <td className="px-3.5 py-3.5 align-middle"><StatusPill status={r.status} /></td>
                    <td className="px-3.5 py-3.5 align-middle">{r.guest ?? <span className="text-ink-3">—</span>}</td>
                    <td className="px-3.5 py-3.5 align-middle tabular-nums">{r.checkout ? formatDate(r.checkout) : <span className="text-ink-3">—</span>}</td>
                    <td className="px-3.5 py-3.5 align-middle tabular-nums">
                      <strong>{type ? formatFCFA(type.price).replace(" FCFA","") : "—"}</strong>{" "}
                      <span className="text-[11.5px] text-ink-3">FCFA</span>
                    </td>
                    <td className="px-3.5 py-3.5 align-middle">
                      <Button variant="icon" size="md"><Icon name="chevronRight" size={14} /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={`Chambre ${selected.num}`}
          maxWidth={440}
          footer={
            <>
              <Button variant="ghost" onClick={() => setSelected(null)}>Fermer</Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                disabled={!newStatus || newStatus === selected.status || updateStatus.isPending}
              >
                {updateStatus.isPending ? "Mise à jour…" : "Confirmer"}
              </Button>
            </>
          }
        >
          <div className="mb-3"><StatusPill status={selected.status} /></div>
          {selected.guest && (
            <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px] mb-2">
              <span className="text-ink-3 text-[13px]">Occupant</span>
              <strong>{selected.guest}</strong>
            </div>
          )}
          {selected.checkout && (
            <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px] mb-2">
              <span className="text-ink-3 text-[13px]">Check-out</span>
              <strong>{formatDate(selected.checkout)}</strong>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px] mb-4">
            <span className="text-ink-3 text-[13px]">Type</span>
            <strong>{ROOM_TYPES_PMS.find(t => t.code === selected.type)?.name ?? selected.type}</strong>
          </div>
          {selected.id && (
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
      )}
    </div>
  );
}
