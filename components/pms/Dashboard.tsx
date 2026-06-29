"use client";
import React from "react";
import { PMSHeader } from "./PMSHeader";
import { SectionHead, AppBadge, Donut, showToast, Icon, KPICard, Button } from "./shared";
import { Pill } from "@/components/ui/Pill";
import {
  ROOMS_PMS, TRANSACTIONS, ARRIVALS_TODAY, DEPARTURES_TODAY,
  APP_REQUESTS, REQUEST_TYPES, STATUS_CONFIG, formatFCFA,
} from "./data";
import type { NavId } from "./PMSSidebar";

interface Props {
  go: (id: NavId) => void;
}

export function Dashboard({ go }: Props) {
  const occupied = ROOMS_PMS.filter(r => ["occupee", "depart"].includes(r.status)).length;
  const occupancy = Math.round((occupied / ROOMS_PMS.length) * 100);
  const revenueToday = TRANSACTIONS
    .filter(t => t.time.startsWith("2026-05-18") && t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const revpar = Math.round(revenueToday / ROOMS_PMS.length);
  const adr = Math.round(revenueToday / occupied);

  const arrivals = ARRIVALS_TODAY;
  const departures = DEPARTURES_TODAY;
  const movements = [
    ...arrivals.map(b => ({ ...b, mvmt: "arrivee" as const })),
    ...departures.map(b => ({ ...b, mvmt: "depart" as const })),
  ];

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Bonjour, Aïcha"
        sub={`Lundi 18 mai 2026 · ${arrivals.length} arrivées · ${departures.length} départs prévus`}
        actions={
          <>
            <Button variant="ghost" size="sm">
              <Icon name="download" size={13} /> Export
            </Button>
            <Button variant="primary" size="sm" onClick={() => go("checkin")}>
              <Icon name="plus" size={13} /> Nouvelle résa
            </Button>
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-5.5">
        <KPICard label="Taux d'occupation" value={occupancy} unit="%" trend="+12%" trendUp sub={`${occupied} chambres louées sur ${ROOMS_PMS.length}`} />
        <KPICard label="Revenus du jour" value={(revenueToday / 1000).toFixed(0)} unit="k FCFA" trend="+8%" trendUp sub={`vs ${(revenueToday * 0.92 / 1000).toFixed(0)}k FCFA hier`} />
        <KPICard label="RevPAR" value={(revpar / 1000).toFixed(1)} unit="k FCFA" trend="+5%" trendUp sub="Revenu / chambre disponible" />
        <KPICard label="ADR · prix moyen" value={(adr / 1000).toFixed(0)} unit="k FCFA" trend="+3%" trendUp sub="par nuit · cible 65k" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[2fr_1fr] gap-3.5">
        {/* Movements table */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead
            icon="arrowRight"
            title="Mouvements du jour"
            sub={`${arrivals.length} arrivées · ${departures.length} départs`}
            right={
              <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
                <button className="px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium text-ink bg-surface border border-border shadow-xs">Tous</button>
                <button className="px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium text-ink-2">Arrivées</button>
                <button className="px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium text-ink-2">Départs</button>
              </div>
            }
          />
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["Type","Client","Chambre","Heure","Solde",""].map(h => (
                  <th key={h} className="text-left font-medium text-ink-3 text-[11.5px] px-3.5 py-2.5 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movements.map((b, i) => (
                <tr key={b.id} className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2">
                  <td className="px-3.5 py-3.5 align-middle">
                    {b.mvmt === "arrivee"
                      ? <Pill kind="teal" dot>Arrivée</Pill>
                      : <Pill kind="amber" dot>Départ</Pill>}
                  </td>
                  <td className="px-3.5 py-3.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full inline-grid place-items-center text-white font-semibold text-[11px] shrink-0"
                        style={{ background: ["#E89060","#6FB5A8","#7B8DFF","#B57BE6","#F5C572","#6FCC92","#FF8585","#6FB5DD"][i % 8] }}
                      >
                        {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-semibold text-[13px] flex items-center gap-1.5">
                          {b.guest}
                          {b.source === "App" && <AppBadge size="sm" />}
                        </div>
                        <div className="text-[11.5px] text-ink-3">
                          {b.nights} nuits · {b.source === "App" ? "Profil pré-rempli" : b.source}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3.5 align-middle">
                    <strong>{b.room}</strong>{" "}
                    <span className="text-[11.5px] text-ink-3">· {b.roomType}</span>
                  </td>
                  <td className="px-3.5 py-3.5 align-middle tabular-nums text-ink-3">
                    {b.mvmt === "arrivee" ? "14:00" : "12:00"}
                  </td>
                  <td className="px-3.5 py-3.5 align-middle">
                    {b.amount - b.paid > 0
                      ? <span style={{ color: "var(--color-warn)", fontWeight: 600 }}>{formatFCFA(b.amount - b.paid)}</span>
                      : <span style={{ color: "var(--color-success)", fontWeight: 500 }}>Soldé</span>}
                  </td>
                  <td className="px-3.5 py-3.5 align-middle">
                    {b.mvmt === "arrivee"
                      ? <Button variant="soft" size="sm" onClick={() => { go("checkin"); showToast("Check-in pour " + b.guest, "user"); }}>Check-in</Button>
                      : <Button variant="soft" size="sm" onClick={() => showToast("Départ " + b.guest + " validé", "check")}>Check-out</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3.5">
          {/* Mini room status */}
          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead
              icon="bed"
              title="État des chambres"
              right={
                <Button variant="text" size="sm" onClick={() => go("rooms")}>Détails →</Button>
              }
            />
            <div className="grid grid-cols-7 gap-1.25">
              {ROOMS_PMS.slice(0, 28).map(r => {
                const conf = STATUS_CONFIG[r.status];
                return (
                  <div
                    key={r.num}
                    className="aspect-square rounded-md grid place-items-center text-[10.5px] font-semibold cursor-pointer transition-transform duration-120 hover:scale-[1.06] border border-transparent"
                    style={{ background: conf.bg, color: conf.color }}
                    title={`${r.num} · ${conf.label}`}
                  >
                    {r.num}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).slice(0, 6).map(([k, v]) => {
                const count = ROOMS_PMS.filter(r => r.status === k).length;
                return (
                  <div key={k} className="inline-flex items-center gap-1.75 text-[12px] text-ink-2 font-medium">
                    <span
                      className="w-1.75 h-1.75 rounded-full inline-block shrink-0"
                      style={{ background: v.color }}
                    />
                    <span>{v.label}</span>
                    <strong className="ml-auto text-ink">{count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending app requests */}
          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead
              icon="bell"
              title="Demandes en cours"
              sub={`${APP_REQUESTS.filter(r => r.status !== "done").length} via l'app Immo Plus`}
              right={
                <Button variant="text" size="sm" onClick={() => go("requests")}>Tout →</Button>
              }
            />
            {APP_REQUESTS.filter(r => r.status !== "done").slice(0, 3).map(r => {
              const t = REQUEST_TYPES[r.type];
              return (
                <div key={r.id} className="flex items-center gap-2.5 py-2.5 border-t border-border-soft">
                  <div className="w-7.5 h-7.5 rounded-[7px] bg-surface-2 text-ink-2 grid place-items-center shrink-0">
                    <Icon name={t.icon} size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{r.title}</div>
                    <div className="text-[11.5px] text-ink-3">Ch. {r.room} · {r.time}</div>
                  </div>
                  <Pill kind={r.status === "pending" ? "warn" : r.status === "in-progress" ? "primary" : "success"}>
                    {r.status === "pending" ? "À faire" : r.status === "in-progress" ? "En cours" : "OK"}
                  </Pill>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue + Payment mix */}
      <div className="grid grid-cols-3 gap-3.5 mt-3.5">
        <div className="bg-surface border border-border rounded-[18px] p-5.5 col-span-2">
          <SectionHead
            icon="barChart"
            title="Revenus 7 derniers jours"
            sub="Par mode de paiement · milliers FCFA"
            right={
              <div className="flex gap-3.5 text-[11.5px] text-ink-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-ink" /> Mobile money
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-[3px] bg-ink-4" /> Carte + espèces
                </span>
              </div>
            }
          />
          <RevenueChart />
        </div>

        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="pieChart" title="Mix paiement" sub="Cette semaine" />
          <Donut
            data={[
              { label: "Wave",         value: 42, color: "#1BA1F2" },
              { label: "Orange Money", value: 28, color: "#FF7900" },
              { label: "MTN",          value: 12, color: "#FFCC00" },
              { label: "Carte",        value: 13, color: "var(--color-ink)" },
              { label: "Espèces",      value: 5,  color: "#1F8A5B" },
            ]}
            centerValue="82%"
            centerLabel="Mobile money"
          />
          <div className="mt-4 grid gap-1.75">
            {([ ["Wave", 42, "#1BA1F2"], ["Orange Money", 28, "#FF7900"], ["MTN", 12, "#FFCC00"], ["Carte", 13, "#11110F"], ["Espèces", 5, "#1F8A5B"] ] as [string, number, string][]).map(([l, v, c]) => (
              <div key={l} className="flex items-center gap-2 text-[12px]">
                <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: c }} />
                <span className="flex-1 text-ink-2">{l}</span>
                <strong className="text-ink">{v}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-surface border border-border rounded-[18px] p-5.5 mt-3.5">
        <SectionHead icon="clock" title="Activité récente" />
        <div className="flex flex-col">
          {[
            { time: "14:32", icon: "check",      txt: "Élise N'Guessan · Paiement reçu 38 000 FCFA via Orange Money" },
            { time: "13:18", icon: "arrowRight",  txt: "Daniel Kouassi · Check-in chambre 308" },
            { time: "12:08", icon: "arrowLeft",   txt: "Joseph Brou · Check-out chambre 303" },
            { time: "11:45", icon: "bell",        txt: "Réservation reçue · M. Dupont · 3 nuits" },
            { time: "10:22", icon: "refresh",     txt: "Ménage chambre 207 terminé" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border-soft last:border-b-0">
              <div className="text-[11px] text-ink-3 tabular-nums min-w-12.5">{a.time}</div>
              <div className="w-6.5 h-6.5 rounded-[7px] bg-surface-2 text-ink-2 grid place-items-center shrink-0">
                <Icon name={a.icon} size={12} />
              </div>
              <div className="text-[13px] text-ink-2 leading-[1.4]">{a.txt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevenueChart() {
  const days = [
    { d: "Mar 12", a: 480, b: 95  },
    { d: "Mer 13", a: 520, b: 110 },
    { d: "Jeu 14", a: 610, b: 140 },
    { d: "Ven 15", a: 720, b: 180 },
    { d: "Sam 16", a: 850, b: 220 },
    { d: "Dim 17", a: 780, b: 195 },
    { d: "Lun 18", a: 690, b: 130 },
  ];
  const max = 1100;
  return (
    <div className="relative py-3">
      <div className="flex items-end gap-3.5 h-45">
        {days.map(d => (
          <div key={d.d} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="text-[10px] text-ink-3 tabular-nums mb-0.5">
              {(d.a + d.b).toLocaleString("fr-FR")}
            </div>
            <div className="w-full max-w-10 flex flex-col items-stretch gap-0.5">
              <div style={{ height: (d.b / max) * 150, background: "var(--color-ink-4)", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
              <div style={{ height: (d.a / max) * 150, background: d.d === "Lun 18" ? "var(--color-ink)" : "var(--color-ink-2)", borderRadius: "0 0 4px 4px" }} />
            </div>
            <div className={`text-[11px] mt-1 ${d.d === "Lun 18" ? "text-ink font-semibold" : "text-ink-3 font-medium"}`}>
              {d.d}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
