"use client";
import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { StatusPill, Icon, Button, Skeleton } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { cn } from "@/lib/utils/cn";
import { ROOM_TYPES_PMS, STATUS_CONFIG, formatFCFA, formatDate } from "../data";
import type { Room } from "@/lib/types/pms";
import { useRooms } from "@/lib/hooks/pms/useRooms";
import { useHotel } from "@/lib/pms/HotelContext";

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

export function Rooms() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hotel = useHotel();

  const view   = (searchParams.get("view") === "list" ? "list" : "grid") as "grid" | "list";
  const filter = searchParams.get("status") ?? "all";

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "all" || (key === "view" && value === "grid")) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const setView   = (v: "grid" | "list") => updateParams({ view: v });
  const setFilter = (v: string) => updateParams({ status: v });

  const { data, isLoading, error } = useRooms();
  const rooms: Room[] = data?.rooms ?? [];

  const filtered = filter === "all" ? rooms : rooms.filter(r => r.status === filter);
  const counts: Record<string, number> = {
    all: rooms.length,
    ...Object.fromEntries(Object.keys(STATUS_CONFIG).map(k => [k, rooms.filter(r => r.status === k).length]))
  };

  const byFloor = filtered.reduce<Record<number, Room[]>>((acc, r) => {
    (acc[r.floor] = acc[r.floor] || []).push(r);
    return acc;
  }, {});

  function openRoom(r: Room) {
    if (r.id) router.push(`/pms/${hotel}/rooms/${r.id}`);
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
                <RoomTile key={r.id ?? r.num} room={r} onClick={() => openRoom(r)} />
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
                    onClick={() => openRoom(r)}
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
    </div>
  );
}
