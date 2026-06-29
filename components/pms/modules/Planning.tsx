"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, showToast, Icon, Button } from "../shared";
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
const COL_W = 180;

export function Planning() {
  const [, setWeekOffset] = useState(0);
  const visibleRooms = ROOMS_PMS.slice(0, 22);

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Planning"
        sub="Vue hebdomadaire · Résidence Lagune Bleue"
        search={false}
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              {[["Semaine", true], ["2 semaines", false], ["Mois", false]].map(([label, active]) => (
                <button key={label as string} className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium ${active ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2"}`}>
                  {label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(o => o - 1)}><Icon name="chevronLeft" size={14} /></Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>Aujourd&apos;hui</Button>
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(o => o + 1)}><Icon name="chevronRight" size={14} /></Button>
          </>
        }
      />

      {/* Week label + legend */}
      <div className="flex justify-between items-center mb-3.5">
        <div className="font-semibold text-[13.5px] text-ink">Semaine du 18 au 24 mai 2026</div>
        <div className="flex gap-4.5 items-center">
          {[
            { key: "checkedin", label: "Sur place",  bg: "var(--color-success-bg)", bd: "var(--color-success)" },
            { key: "confirmed", label: "Confirmée",  bg: "var(--color-primary-50)", bd: "var(--color-primary)" },
            { key: "departure", label: "Départ",     bg: "var(--color-warn-bg)",    bd: "var(--color-warn)" },
            { key: "pending",   label: "En attente", bg: "var(--color-violet-bg)",  bd: "var(--color-violet)" },
          ].map(l => (
            <span key={l.key} className="inline-flex items-center gap-1.75 text-[12px] text-ink-2 font-medium">
              <span className="w-3.5 h-2.5 rounded-[3px] inline-block shrink-0" style={{ background: l.bg, border: `1.5px solid ${l.bd}` }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* Gantt Grid */}
      <div className="bg-surface border border-border rounded-[18px] overflow-hidden mb-4">
        {/* Header row */}
        <div className="grid border-b border-border bg-surface-2" style={{ gridTemplateColumns: `${COL_W}px repeat(7,1fr)` }}>
          <div className="px-3 py-3 text-[12px] font-medium text-ink-2 border-r border-border-soft">Chambres</div>
          {WEEK_DAYS.map((d, i) => (
            <div key={d.date} className="px-3 py-3 border-r border-border-soft last:border-r-0">
              <div className={`text-[11px] uppercase tracking-[0.06em] font-medium mb-0.5 ${i === 0 ? "text-primary" : "text-ink-3"}`}>{d.short}</div>
              <div className={`text-[20px] font-semibold tracking-tight leading-none ${i === 0 ? "text-primary" : "text-ink"}`}>{d.date}</div>
            </div>
          ))}
        </div>

        {/* Room rows */}
        {visibleRooms.map(room => {
          const typeInfo = ROOM_TYPES_PMS.find(t => t.code === room.type);
          const roomBookings = PLANNING_BOOKINGS.filter(b => b.room === room.num);
          const sc = STATUS_CONFIG[room.status];

          return (
            <div key={room.num} className="grid border-b border-border-soft last:border-b-0 min-h-14 relative" style={{ gridTemplateColumns: `${COL_W}px repeat(7,1fr)` }}>
              {/* Room label */}
              <div className="px-3 py-2.5 border-r border-border-soft flex items-center gap-2.5 bg-surface-2 font-medium text-[13px]">
                <div className="w-7.5 h-7.5 rounded-[7px] grid place-items-center font-bold text-[11px] shrink-0"
                  style={{ background: sc.bg, color: sc.color }}>
                  {room.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold leading-tight">{typeInfo?.code ?? room.type} · Ét.{room.floor}</div>
                  <div className="text-[10.5px] text-ink-3 overflow-hidden text-ellipsis whitespace-nowrap">
                    {(typeInfo?.name ?? "").split(" ").slice(0, 2).join(" ")}
                  </div>
                </div>
              </div>

              {/* Day cells */}
              {WEEK_DAYS.map((_, ci) => (
                <div key={ci} className={`border-r border-border-soft last:border-r-0 ${ci === 0 ? "bg-[rgba(39,68,222,0.07)]" : ""}`} />
              ))}

              {/* Booking bars */}
              {roomBookings.map((b, bi) => {
                const startCol = Math.max(0, b.start);
                const endCol   = Math.min(7, b.end);
                if (endCol <= 0 || startCol >= 7 || endCol <= startCol) return null;
                const startFrac = startCol / 7;
                const widthFrac = (endCol - startCol) / 7;
                const rl = b.start < 0 ? 0 : 7;
                const rr = b.end   > 7 ? 0 : 7;

                const statusStyles: Record<string, { bg: string; color: string; border: string }> = {
                  confirmed: { bg: "var(--color-primary-50)", color: "var(--color-primary)", border: "var(--color-primary)" },
                  checkedin: { bg: "var(--color-success-bg)", color: "var(--color-success)", border: "var(--color-success)" },
                  departure: { bg: "var(--color-warn-bg)",    color: "var(--color-warn)",    border: "var(--color-warn)"    },
                  pending:   { bg: "var(--color-violet-bg)",  color: "var(--color-violet)",  border: "var(--color-violet)"  },
                };
                const s = statusStyles[b.status] ?? statusStyles.confirmed;

                return (
                  <div
                    key={bi}
                    className="absolute top-2 bottom-2 px-2.5 py-2 text-[11.5px] flex flex-col justify-center cursor-pointer overflow-hidden transition-transform duration-120 hover:scale-[1.01] hover:z-10"
                    style={{
                      left:  `calc(${COL_W}px + ${startFrac.toFixed(6)} * (100% - ${COL_W}px))`,
                      width: `calc(${widthFrac.toFixed(6)} * (100% - ${COL_W}px))`,
                      borderRadius: `${rl}px ${rr}px ${rr}px ${rl}px`,
                      background: s.bg,
                      color: s.color,
                      borderLeft: `3px solid ${s.border}`,
                    }}
                    onClick={() => showToast(`${b.guest} · Ch. ${room.num}`, "bell")}
                  >
                    <div className="font-semibold leading-[1.1] tracking-[-0.01em]">{b.guest}</div>
                    <div className="text-[10.5px] opacity-70 mt-0.5">{typeInfo?.code}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3.5">
        {/* Occupation trend */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="trendingUp" title="Tendance d'occupation" sub="18–24 mai 2026" />
          <div className="flex items-end gap-1.25 h-24 mt-3.5">
            {OCC.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.75">
                <div className={`text-[9.5px] font-semibold ${i === 0 ? "text-primary" : "text-ink-3"}`}>{v}%</div>
                <div
                  className="w-full max-w-7 rounded-t-sm"
                  style={{ height: Math.round(v * 0.62), background: i === 0 ? "var(--color-primary)" : "var(--color-primary-100)" }}
                />
                <div className={`text-[10px] ${i === 0 ? "text-primary font-semibold" : "text-ink-3"}`}>{WEEK_DAYS[i].date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="bell" title="Alertes" sub="3 éléments à traiter" />
          <div className="flex flex-col">
            {[
              { bg: "var(--color-warn-bg)",    cl: "var(--color-warn)",    msg: "3 chambres non attribuées vendredi 22" },
              { bg: "var(--color-danger-bg)",  cl: "var(--color-danger)",  msg: "Chambre 109 hors-service depuis 3 jours" },
              { bg: "var(--color-primary-50)", cl: "var(--color-primary)", msg: "Pic prévu samedi 23 · occupation 95%" },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-3 border-b border-border-soft last:border-b-0">
                <div className="w-7.5 h-7.5 rounded-[9px] grid place-items-center shrink-0" style={{ background: a.bg, color: a.cl }}>
                  <Icon name="info" size={14} />
                </div>
                <div className="text-[12.5px] text-ink-2 leading-[1.4]">{a.msg}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="sparkles" title="Actions rapides" />
          <div className="grid gap-2">
            {[
              { icon: "plus",     label: "Bloquer une période" },
              { icon: "refresh",  label: "Synchroniser Booking.com" },
              { icon: "download", label: "Exporter la semaine PDF" },
              { icon: "users",    label: "Planning du personnel" },
            ].map(a => (
              <Button key={a.label} variant="soft" size="sm" className="justify-start" onClick={() => showToast(a.label, "check")}>
                <Icon name={a.icon} size={14} /> {a.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
