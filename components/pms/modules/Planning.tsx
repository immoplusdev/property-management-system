"use client";
import React, { useState, useMemo } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, showToast, Icon, Button } from "../shared";
import { ROOM_TYPES_PMS, STATUS_CONFIG } from "../data";
import { usePlanning } from "@/lib/hooks/pms/usePlanning";
import type { PlanningRoom } from "@/lib/api/pms/planning.actions";

const COL_W = 180;

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  confirmed:   { bg: "var(--color-primary-50)", color: "var(--color-primary)", border: "var(--color-primary)" },
  checked_in:  { bg: "var(--color-success-bg)", color: "var(--color-success)", border: "var(--color-success)" },
  checking_out:{ bg: "var(--color-warn-bg)",    color: "var(--color-warn)",    border: "var(--color-warn)"    },
  departure:   { bg: "var(--color-warn-bg)",    color: "var(--color-warn)",    border: "var(--color-warn)"    },
  pending:     { bg: "var(--color-violet-bg)",  color: "var(--color-violet)",  border: "var(--color-violet)"  },
};

function getMonday(offset = 0): Date {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

const FR_SHORT = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const FR_LONG  = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-2 rounded-lg animate-pulse ${className}`} />;
}

export function Planning({ hotelName }: { hotelName: string }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const monday = useMemo(() => getMonday(weekOffset), [weekOffset]);
  const days   = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(monday, i)), [monday]);
  const from   = toISO(days[0]);
  const to     = toISO(days[6]);

  const { data, isLoading } = usePlanning(from, to);
  const rooms: PlanningRoom[] = data?.rooms ?? [];

  const weekLabel = useMemo(() => {
    const start = days[0];
    const end   = days[6];
    const startDay = start.getDate();
    const endDay   = end.getDate();
    const month = end.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return `Semaine du ${startDay} au ${endDay} ${month}`;
  }, [days]);

  function slotToFraction(checkIn: string, checkOut: string) {
    const start = new Date(checkIn + "T00:00:00");
    const end   = new Date(checkOut + "T00:00:00");
    const weekStart = days[0];
    const weekEnd   = addDays(days[6], 1);

    const clampedStart = start < weekStart ? weekStart : start > weekEnd ? weekEnd : start;
    const clampedEnd   = end   < weekStart ? weekStart : end   > weekEnd ? weekEnd : end;

    const totalMs  = weekEnd.getTime() - weekStart.getTime();
    const startFr  = (clampedStart.getTime() - weekStart.getTime()) / totalMs;
    const endFr    = (clampedEnd.getTime()   - weekStart.getTime()) / totalMs;
    return { startFr, widthFr: endFr - startFr, rl: start < weekStart ? 0 : 7, rr: end > weekEnd ? 0 : 7 };
  }

  const OCC = [68, 72, 78, 82, 88, 95, 78];

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Planning"
        sub={`Vue hebdomadaire · ${hotelName}`}
        search={false}
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              {["Semaine","2 semaines","Mois"].map((label, i) => (
                <button key={label} className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium ${i===0 ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2"}`}>
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
        <div className="font-semibold text-[13.5px] text-ink">{weekLabel}</div>
        <div className="flex gap-4.5 items-center">
          {[
            { key:"checked_in", label:"Sur place",  bg:"var(--color-success-bg)", bd:"var(--color-success)" },
            { key:"confirmed",  label:"Confirmée",  bg:"var(--color-primary-50)", bd:"var(--color-primary)" },
            { key:"departure",  label:"Départ",     bg:"var(--color-warn-bg)",    bd:"var(--color-warn)"    },
            { key:"pending",    label:"En attente", bg:"var(--color-violet-bg)",  bd:"var(--color-violet)"  },
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
          {days.map((d, i) => (
            <div key={i} className="px-3 py-3 border-r border-border-soft last:border-r-0">
              <div className={`text-[11px] uppercase tracking-[0.06em] font-medium mb-0.5 ${weekOffset===0 && i===new Date().getDay()-1 ? "text-primary" : "text-ink-3"}`}>{FR_SHORT[i]}</div>
              <div className={`text-[20px] font-semibold tracking-tight leading-none ${weekOffset===0 && i===new Date().getDay()-1 ? "text-primary" : "text-ink"}`}>{d.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="p-4 grid gap-2">
            {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="py-12 text-center text-ink-3 text-[13px]">Aucune chambre disponible pour cette période</div>
        ) : (
          rooms.map(room => {
            const typeInfo = room.roomTypeName ? ROOM_TYPES_PMS.find(t => t.code === room.roomTypeName.slice(0,3).toUpperCase()) : undefined;
            const sc = STATUS_CONFIG.free;

            return (
              <div key={room.id} className="grid border-b border-border-soft last:border-b-0 min-h-14 relative" style={{ gridTemplateColumns: `${COL_W}px repeat(7,1fr)` }}>
                {/* Room label */}
                <div className="px-3 py-2.5 border-r border-border-soft flex items-center gap-2.5 bg-surface-2 font-medium text-[13px]">
                  <div
                    className="w-7.5 h-7.5 rounded-[7px] grid place-items-center font-bold text-[11px] shrink-0"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {room.roomNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold leading-tight">{typeInfo?.code ?? room.roomTypeName?.slice(0,3) ?? "N/A"} · Ét.{room.floor}</div>
                    <div className="text-[10.5px] text-ink-3 overflow-hidden text-ellipsis whitespace-nowrap">
                      {room.roomTypeName?.split(" ").slice(0, 2).join(" ") ?? "—"}
                    </div>
                  </div>
                </div>

                {/* Day cells */}
                {days.map((_, ci) => (
                  <div key={ci} className={`border-r border-border-soft last:border-r-0 ${weekOffset===0 && ci===new Date().getDay()-1 ? "bg-[rgba(39,68,222,0.07)]" : ""}`} />
                ))}

                {/* Booking bars */}
                {room.slots.filter(s => s.guestName).map((slot, bi) => {
                  const { startFr, widthFr, rl, rr } = slotToFraction(slot.date, slot.date);
                  if (widthFr <= 0) return null;
                  const s = STATUS_STYLES[slot.status] ?? STATUS_STYLES.confirmed;
                  const label    = slot.guestName || "—";
                  const toastMsg = `${label} · Ch. ${room.roomNumber}`;

                  return (
                    <div
                      key={bi}
                      className="absolute top-2 bottom-2 px-2.5 py-2 text-[11.5px] flex flex-col justify-center cursor-pointer overflow-hidden transition-transform duration-120 hover:scale-[1.01] hover:z-10"
                      style={{
                        left:  `calc(${COL_W}px + ${startFr.toFixed(6)} * (100% - ${COL_W}px))`,
                        width: `calc(${widthFr.toFixed(6)} * (100% - ${COL_W}px))`,
                        borderRadius: `${rl}px ${rr}px ${rr}px ${rl}px`,
                        background: s.bg,
                        color: s.color,
                        borderLeft: `3px solid ${s.border}`,
                      }}
                      onClick={() => showToast(toastMsg, "bell")}
                    >
                      <div className="font-semibold leading-tight tracking-[-0.01em]">{label}</div>
                      <div className="text-[10.5px] opacity-70 mt-0.5">{room.roomTypeName?.slice(0, 3) ?? "—"}</div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3.5">
        {/* Occupation trend */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="trendingUp" title="Tendance d'occupation" sub={weekLabel} />
          <div className="flex items-end gap-1.25 h-24 mt-3.5">
            {OCC.map((v, i) => {
              const isToday = weekOffset === 0 && i === new Date().getDay() - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.75">
                  <div className={`text-[9.5px] font-semibold ${isToday ? "text-primary" : "text-ink-3"}`}>{v}%</div>
                  <div
                    className="w-full max-w-7 rounded-t-sm"
                    style={{ height: Math.round(v * 0.62), background: isToday ? "var(--color-primary)" : "var(--color-primary-100)" }}
                  />
                  <div className={`text-[10px] ${isToday ? "text-primary font-semibold" : "text-ink-3"}`}>{days[i].getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="bell" title="Alertes" sub="Éléments à traiter" />
          <div className="flex flex-col">
            {[
              { bg:"var(--color-warn-bg)",    cl:"var(--color-warn)",    msg:"Chambres non attribuées cette semaine" },
              { bg:"var(--color-danger-bg)",  cl:"var(--color-danger)",  msg:"Vérifiez les chambres hors service"    },
              { bg:"var(--color-primary-50)", cl:"var(--color-primary)", msg:"Pic d'occupation prévu en fin de semaine" },
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
              { icon:"plus",     label:"Bloquer une période"           },
              { icon:"refresh",  label:"Synchroniser Booking.com"      },
              { icon:"download", label:"Exporter la semaine PDF"        },
              { icon:"users",    label:"Planning du personnel"         },
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
