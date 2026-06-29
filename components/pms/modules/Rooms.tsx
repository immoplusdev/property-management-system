"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { StatusPill, Icon, Button } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";
import { ROOMS_PMS, ROOM_TYPES_PMS, STATUS_CONFIG, formatFCFA, formatDate, type Room } from "../data";

function RoomTile({ room, onClick }: { room: Room; onClick: () => void }) {
  const type = ROOM_TYPES_PMS.find(t => t.code === room.type);
  const sc = STATUS_CONFIG[room.status];
  return (
    <div
      className="rounded-xl px-3.5 pt-3.5 pb-3 bg-surface border border-border cursor-pointer transition-all duration-120 relative min-h-29 flex flex-col hover:border-ink-3"
      onClick={onClick}
    >
      <span
        className="absolute top-3.5 left-3.5 w-1.5 h-1.5 rounded-full"
        style={{ background: sc.color }}
      />
      <div className="text-[26px] font-semibold tracking-[-0.04em] leading-none text-ink pl-3.5">{room.num}</div>
      <div className="text-[11px] text-ink-3 mt-1 font-medium pl-3.5">{type?.name ?? room.type}</div>
      {room.guest && <div className="text-[12px] mt-auto pt-2.5 font-medium text-ink overflow-hidden text-ellipsis whitespace-nowrap">{room.guest}</div>}
      {room.checkout && <div className="text-[11px] text-ink-3 mt-0.5">↩ {formatDate(room.checkout)}</div>}
    </div>
  );
}

export function Rooms() {
  const [view, setView] = useState<"grid"|"list">("grid");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Room|null>(null);

  const filtered = filter === "all" ? ROOMS_PMS : ROOMS_PMS.filter(r => r.status === filter);
  const counts: Record<string, number> = Object.fromEntries(
    ["all", ...Object.keys(STATUS_CONFIG)].map(k => [k, k === "all" ? ROOMS_PMS.length : ROOMS_PMS.filter(r => r.status === k).length])
  );

  const byFloor = filtered.reduce<Record<number, Room[]>>((acc, r) => {
    (acc[r.floor] = acc[r.floor] || []).push(r);
    return acc;
  }, {});

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Chambres"
        sub={`${ROOMS_PMS.length} chambres réparties sur 5 étages · Vue temps réel`}
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
            <Button variant="primary" size="sm"><Icon name="plus" size={14} /> Bloquer chambre</Button>
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
              count={counts[k]}
              active={filter === k}
              onClick={() => setFilter(k)}
              before={<span className="w-1.75 h-1.75 rounded-full shrink-0" style={{ background: c.color }} />}
            />
          ))}
        </ChipGroup>
      </div>

      {view === "grid" ? (
        Object.keys(byFloor).sort().map(floor => (
          <div key={floor} className="bg-surface border border-border rounded-[18px] p-5.5 mb-3.5">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7.5 h-7.5 rounded-lg bg-primary-50 text-primary grid place-items-center font-bold text-[13px]">{floor}</div>
                <div>
                  <div className="font-semibold text-[14px]">Étage {floor}</div>
                  <div className="text-[11.5px] text-ink-3">
                    {byFloor[Number(floor)].length} chambres · {byFloor[Number(floor)].filter(r => r.status === "occupee" || r.status === "depart").length} occupées
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))" }}>
              {byFloor[Number(floor)].map(r => (
                <RoomTile key={r.num} room={r} onClick={() => setSelected(r)} />
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
                  <tr key={r.num} className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2 cursor-pointer" onClick={() => setSelected(r)}>
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
              <Button variant="primary">Modifier le statut</Button>
            </>
          }
        >
          <div className="mb-2"><StatusPill status={selected.status} /></div>
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
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
            <span className="text-ink-3 text-[13px]">Type</span>
            <strong>{ROOM_TYPES_PMS.find(t => t.code === selected.type)?.name}</strong>
          </div>
        </Modal>
      )}
    </div>
  );
}
