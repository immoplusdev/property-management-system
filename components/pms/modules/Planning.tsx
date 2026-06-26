"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, showToast, Icon } from "../shared";
import { PLANNING_BOOKINGS, ROOMS_PMS, ROOM_TYPES_PMS, STATUS_CONFIG } from "../data";

const WEEK_DAYS = [
  { short: "Lun", date: "18" },
  { short: "Mar", date: "19" },
  { short: "Mer", date: "20" },
  { short: "Jeu", date: "21" },
  { short: "Ven", date: "22" },
  { short: "Sam", date: "23" },
  { short: "Dim", date: "24" },
];

const OCC = [68, 72, 78, 82, 88, 95, 78];

// Width of the room label column — must match CSS grid: 180px
const COL_W = 180;

export function Planning() {
  const [, setWeekOffset] = useState(0);

  // Show first 22 rooms (matches original HTML)
  const visibleRooms = ROOMS_PMS.slice(0, 22);

  return (
    <div className="fade-in">
      <PMSHeader
        title="Planning"
        sub="Vue hebdomadaire · Résidence Lagune Bleue"
        search={false}
        actions={
          <>
            <div className="tabs">
              <div className="tab active">Semaine</div>
              <div className="tab">2 semaines</div>
              <div className="tab">Mois</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(o => o - 1)}>
              <Icon name="chevronLeft" size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(0)}>
              Aujourd&apos;hui
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setWeekOffset(o => o + 1)}>
              <Icon name="chevronRight" size={14} />
            </button>
          </>
        }
      />

      {/* Week label + legend */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--text)" }}>
          Semaine du 18 au 24 mai 2026
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          {[
            { key: "checkedin", label: "Sur place",  bg: "var(--success-bg)", bd: "var(--success)" },
            { key: "confirmed", label: "Confirmée",  bg: "var(--primary-50)", bd: "var(--primary)" },
            { key: "departure", label: "Départ",     bg: "var(--warn-bg)",    bd: "var(--warn)" },
            { key: "pending",   label: "En attente", bg: "var(--violet-bg)",  bd: "var(--violet)" },
          ].map(l => (
            <span key={l.key} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "var(--text-2)", fontWeight: 500 }}>
              <span style={{ width: 14, height: 10, borderRadius: 3, background: l.bg, border: `1.5px solid ${l.bd}`, display: "inline-block", flexShrink: 0 }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Gantt Grid ─── */}
      <div className="planning-wrap" style={{ marginBottom: 16 }}>
        {/* Header row */}
        <div className="planning-head">
          <div>Chambres</div>
          {WEEK_DAYS.map((d, i) => (
            <div key={d.date}>
              <div
                className="ph-day-name"
                style={i === 0 ? { color: "var(--primary)" } : undefined}
              >
                {d.short}
              </div>
              <div
                className="ph-day-num"
                style={i === 0 ? { color: "var(--primary)" } : undefined}
              >
                {d.date}
              </div>
            </div>
          ))}
        </div>

        {/* Room rows */}
        {visibleRooms.map(room => {
          const typeInfo = ROOM_TYPES_PMS.find(t => t.code === room.type);
          const roomBookings = PLANNING_BOOKINGS.filter(b => b.room === room.num);
          const sc = STATUS_CONFIG[room.status];

          return (
            <div key={room.num} className="planning-row">
              {/* Room label */}
              <div className="pr-room">
                <div style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: sc.bg, color: sc.color,
                  display: "grid", placeItems: "center",
                  fontWeight: 700, fontSize: 11, flexShrink: 0,
                }}>
                  {room.num}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>
                    {typeInfo?.code ?? room.type} · Ét.{room.floor}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {(typeInfo?.name ?? "").split(" ").slice(0, 2).join(" ")}
                  </div>
                </div>
              </div>

              {/* Day cells (background grid) */}
              {WEEK_DAYS.map((_, ci) => (
                <div key={ci} className={"pr-cell" + (ci === 0 ? " today" : "")} />
              ))}

              {/* Booking bars — absolutely positioned across the full row width */}
              {roomBookings.map((b, bi) => {
                // Clamp to visible 7-day window (columns 0–6)
                const startCol = Math.max(0, b.start);
                const endCol   = Math.min(7, b.end);
                if (endCol <= 0 || startCol >= 7 || endCol <= startCol) return null;

                // Fraction of the cells area (right of the room column)
                const startFrac = startCol / 7;
                const widthFrac = (endCol - startCol) / 7;

                // Rounded corners: flat on the side that extends beyond the view
                const rl = b.start < 0 ? 0 : 7;
                const rr = b.end   > 7 ? 0 : 7;

                return (
                  <div
                    key={bi}
                    className={"booking-bar " + b.status}
                    style={{
                      // left = room_col_width + fraction × cells_area_width
                      left:  `calc(${COL_W}px + ${startFrac.toFixed(6)} * (100% - ${COL_W}px))`,
                      width: `calc(${widthFrac.toFixed(6)} * (100% - ${COL_W}px))`,
                      borderRadius: `${rl}px ${rr}px ${rr}px ${rl}px`,
                    }}
                    onClick={() => showToast(`${b.guest} · Ch. ${room.num}`, "bell")}
                  >
                    <div className="bb-name">{b.guest}</div>
                    <div className="bb-meta">{typeInfo?.code}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ─── Summary cards ─── */}
      <div className="grid-dash-3">
        {/* Occupation trend */}
        <div className="card">
          <SectionHead icon="trendingUp" title="Tendance d'occupation" sub="18–24 mai 2026" />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 96, marginTop: 14 }}>
            {OCC.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: i === 0 ? "var(--primary)" : "var(--text-3)" }}>
                  {v}%
                </div>
                <div style={{
                  width: "100%", maxWidth: 28,
                  height: Math.round(v * 0.62),
                  background: i === 0 ? "var(--primary)" : "var(--primary-100)",
                  borderRadius: "4px 4px 0 0",
                }} />
                <div style={{ fontSize: 10, color: i === 0 ? "var(--primary)" : "var(--text-3)", fontWeight: i === 0 ? 600 : 400 }}>
                  {WEEK_DAYS[i].date}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <SectionHead icon="bell" title="Alertes" sub="3 éléments à traiter" />
          <div className="action-list">
            {[
              { bg: "var(--warn-bg)",    cl: "var(--warn)",    msg: "3 chambres non attribuées vendredi 22" },
              { bg: "var(--danger-bg)",  cl: "var(--danger)",  msg: "Chambre 109 hors-service depuis 3 jours" },
              { bg: "var(--primary-50)", cl: "var(--primary)", msg: "Pic prévu samedi 23 · occupation 95%" },
            ].map((a, i) => (
              <div key={i} className="al-item">
                <div style={{ width: 30, height: 30, borderRadius: 9, background: a.bg, color: a.cl, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Icon name="info" size={14} />
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.4 }}>{a.msg}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <SectionHead icon="sparkles" title="Actions rapides" />
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { icon: "plus",     label: "Bloquer une période" },
              { icon: "refresh",  label: "Synchroniser Booking.com" },
              { icon: "download", label: "Exporter la semaine PDF" },
              { icon: "users",    label: "Planning du personnel" },
            ].map(a => (
              <button
                key={a.label}
                className="btn btn-soft btn-sm"
                style={{ justifyContent: "flex-start" }}
                onClick={() => showToast(a.label, "check")}
              >
                <Icon name={a.icon} size={14} /> {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
