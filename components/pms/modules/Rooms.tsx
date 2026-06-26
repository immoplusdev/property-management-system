"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { StatusPill, SectionHead, Icon } from "../shared";
import { ROOMS_PMS, ROOM_TYPES_PMS, STATUS_CONFIG, formatFCFA, formatDate, type Room } from "../data";

function RoomTile({ room, onClick }: { room: Room; onClick: () => void }) {
  const type = ROOM_TYPES_PMS.find(t => t.code === room.type);
  return (
    <div className={"room-tile status-" + room.status} onClick={onClick}>
      <div className="rt-num">{room.num}</div>
      <div className="rt-type">{type?.name ?? room.type}</div>
      {room.guest && <div className="rt-guest">{room.guest}</div>}
      {room.checkout && <div className="rt-out">↩ {formatDate(room.checkout)}</div>}
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
    <div className="fade-in">
      <PMSHeader
        title="Chambres"
        sub={`${ROOMS_PMS.length} chambres réparties sur 5 étages · Vue temps réel`}
        actions={
          <>
            <div className="tabs">
              <div className={"tab" + (view === "grid" ? " active" : "")} onClick={() => setView("grid")}><Icon name="grid" size={13} /> Grille</div>
              <div className={"tab" + (view === "list" ? " active" : "")} onClick={() => setView("list")}><Icon name="list" size={13} /> Liste</div>
            </div>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} /> Bloquer chambre</button>
          </>
        }
      />

      <div className="card" style={{ padding: 14, marginBottom: 16 }}>
        <div className="chips">
          <div className={"chip" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>
            Tout <span className="chip-count">{counts.all}</span>
          </div>
          {Object.entries(STATUS_CONFIG).map(([k, c]) => (
            <div key={k} className={"chip" + (filter === k ? " active" : "")} onClick={() => setFilter(k)}>
              <span className={"status-dot " + k} /> {c.label} <span className="chip-count">{counts[k]}</span>
            </div>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        Object.keys(byFloor).sort().map(floor => (
          <div key={floor} className="card" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--primary-50)", color: "var(--primary)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 13 }}>{floor}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Étage {floor}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                    {byFloor[Number(floor)].length} chambres · {byFloor[Number(floor)].filter(r => r.status === "occupee" || r.status === "depart").length} occupées
                  </div>
                </div>
              </div>
            </div>
            <div className="room-grid">
              {byFloor[Number(floor)].map(r => (
                <RoomTile key={r.num} room={r} onClick={() => setSelected(r)} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="tbl">
            <thead>
              <tr><th>N°</th><th>Type</th><th>Étage</th><th>Statut</th><th>Occupant</th><th>Check-out</th><th>Prix / nuit</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const type = ROOM_TYPES_PMS.find(t => t.code === r.type);
                return (
                  <tr key={r.num} onClick={() => setSelected(r)} style={{ cursor: "pointer" }}>
                    <td><strong style={{ fontSize: 15 }}>{r.num}</strong></td>
                    <td>{type?.name}</td>
                    <td>{r.floor}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td>{r.guest ?? <span className="text-muted">—</span>}</td>
                    <td className="text-num">{r.checkout ? formatDate(r.checkout) : <span className="text-muted">—</span>}</td>
                    <td className="text-num"><strong>{type ? formatFCFA(type.price).replace(" FCFA","") : "—"}</strong> <span className="text-xs text-muted">FCFA</span></td>
                    <td><button className="btn-icon"><Icon name="chevronRight" size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-head">
              <div>
                <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: "-0.03em" }}>Chambre {selected.num}</div>
                <StatusPill status={selected.status} />
              </div>
              <button className="btn-icon" onClick={() => setSelected(null)}><Icon name="x" size={16} /></button>
            </div>
            <div className="modal-body">
              {selected.guest && (
                <div className="row" style={{ marginBottom: 8 }}>
                  <span className="text-muted text-sm">Occupant</span>
                  <strong>{selected.guest}</strong>
                </div>
              )}
              {selected.checkout && (
                <div className="row" style={{ marginBottom: 8 }}>
                  <span className="text-muted text-sm">Check-out</span>
                  <strong>{formatDate(selected.checkout)}</strong>
                </div>
              )}
              <div className="row">
                <span className="text-muted text-sm">Type</span>
                <strong>{ROOM_TYPES_PMS.find(t => t.code === selected.type)?.name}</strong>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
              <button className="btn btn-primary">Modifier le statut</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
