"use client";
import React from "react";
import { PMSHeader } from "./PMSHeader";
import { SectionHead, AppBadge, Donut, showToast, Icon } from "./shared";
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
    <div className="fade-in">
      <PMSHeader
        title="Bonjour, Aïcha"
        sub={`Lundi 18 mai 2026 · ${arrivals.length} arrivées · ${departures.length} départs prévus`}
        actions={
          <>
            <button className="btn btn-ghost btn-sm">
              <Icon name="download" size={13} /> Export
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => go("checkin")}>
              <Icon name="plus" size={13} /> Nouvelle résa
            </button>
          </>
        }
      />

      {/* KPI Row */}
      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-label">Taux d&apos;occupation</div>
            <span className="kpi-trend up">+12%</span>
          </div>
          <div className="kpi-value">{occupancy}<span className="kpi-unit">%</span></div>
          <div className="kpi-sub">{occupied} chambres louées sur {ROOMS_PMS.length}</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-label">Revenus du jour</div>
            <span className="kpi-trend up">+8%</span>
          </div>
          <div className="kpi-value">{(revenueToday / 1000).toFixed(0)}<span className="kpi-unit">k FCFA</span></div>
          <div className="kpi-sub">vs {(revenueToday * 0.92 / 1000).toFixed(0)}k FCFA hier</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-label">RevPAR</div>
            <span className="kpi-trend up">+5%</span>
          </div>
          <div className="kpi-value">{(revpar / 1000).toFixed(1)}<span className="kpi-unit">k FCFA</span></div>
          <div className="kpi-sub">Revenu / chambre disponible</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-label">ADR · prix moyen</div>
            <span className="kpi-trend up">+3%</span>
          </div>
          <div className="kpi-value">{(adr / 1000).toFixed(0)}<span className="kpi-unit">k FCFA</span></div>
          <div className="kpi-sub">par nuit · cible 65k</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid-dash">
        {/* Movements table */}
        <div className="card">
          <SectionHead
            icon="arrowRight"
            title="Mouvements du jour"
            sub={`${arrivals.length} arrivées · ${departures.length} départs`}
            right={
              <div className="tabs">
                <div className="tab active">Tous</div>
                <div className="tab">Arrivées</div>
                <div className="tab">Départs</div>
              </div>
            }
          />
          <table className="tbl">
            <thead>
              <tr>
                <th>Type</th>
                <th>Client</th>
                <th>Chambre</th>
                <th>Heure</th>
                <th>Solde</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {movements.map((b, i) => (
                <tr key={b.id}>
                  <td>
                    {b.mvmt === "arrivee"
                      ? <span className="pill teal dot">Arrivée</span>
                      : <span className="pill amber dot">Départ</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div className={"av av-sm av-" + ((i % 8) + 1)} style={{ width: 28, height: 28, fontSize: 11, marginRight: 10 }}>
                        {b.guest.split(" ").map(x => x[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                          {b.guest}
                          {b.source === "App" && <AppBadge size="sm" />}
                        </div>
                        <div className="text-xs text-muted">
                          {b.nights} nuits · {b.source === "App" ? "Profil pré-rempli" : b.source}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{b.room}</strong>{" "}
                    <span className="text-xs text-muted">· {b.roomType}</span>
                  </td>
                  <td className="text-num text-muted">
                    {b.mvmt === "arrivee" ? "14:00" : "12:00"}
                  </td>
                  <td>
                    {b.amount - b.paid > 0
                      ? <span style={{ color: "var(--warn)", fontWeight: 600 }}>{formatFCFA(b.amount - b.paid)}</span>
                      : <span style={{ color: "var(--success)", fontWeight: 500 }}>Soldé</span>}
                  </td>
                  <td>
                    {b.mvmt === "arrivee"
                      ? <button className="btn btn-soft btn-sm" onClick={() => { go("checkin"); showToast("Check-in pour " + b.guest, "user"); }}>Check-in</button>
                      : <button className="btn btn-soft btn-sm" onClick={() => showToast("Départ " + b.guest + " validé", "check")}>Check-out</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Mini room status */}
          <div className="card">
            <SectionHead
              icon="bed"
              title="État des chambres"
              right={
                <button className="btn btn-text btn-sm" onClick={() => go("rooms")}>Détails →</button>
              }
            />
            <div className="mini-rooms">
              {ROOMS_PMS.slice(0, 28).map(r => {
                const conf = STATUS_CONFIG[r.status];
                return (
                  <div
                    key={r.num}
                    className={"mini-room status-" + r.status}
                    style={{ background: conf.bg, color: conf.color }}
                    title={`${r.num} · ${conf.label}`}
                  >
                    {r.num}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(STATUS_CONFIG).slice(0, 6).map(([k, v]) => {
                const count = ROOMS_PMS.filter(r => r.status === k).length;
                return (
                  <div key={k} className="legend-item">
                    <span className={"status-dot " + k} />
                    <span>{v.label}</span>
                    <strong style={{ marginLeft: "auto" }}>{count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending app requests */}
          <div className="card">
            <SectionHead
              icon="bell"
              title="Demandes en cours"
              sub={`${APP_REQUESTS.filter(r => r.status !== "done").length} via l'app Immo Plus`}
              right={
                <button className="btn btn-text btn-sm" onClick={() => go("requests")}>Tout →</button>
              }
            />
            {APP_REQUESTS.filter(r => r.status !== "done").slice(0, 3).map(r => {
              const t = REQUEST_TYPES[r.type];
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid var(--border-soft)" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--bg-2)", color: "var(--text-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon name={t.icon} size={13} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                    <div className="text-xs text-muted">Ch. {r.room} · {r.time}</div>
                  </div>
                  <span className={"req-status " + r.status} style={{ flexShrink: 0 }}>
                    {r.status === "pending" ? "À faire" : r.status === "in-progress" ? "En cours" : "OK"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Revenue + Payment mix */}
      <div className="grid-dash-3" style={{ marginTop: 14 }}>
        <div className="card" style={{ gridColumn: "span 2" }}>
          <SectionHead
            icon="barChart"
            title="Revenus 7 derniers jours"
            sub="Par mode de paiement · milliers FCFA"
            right={
              <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "var(--text-2)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--text)" }} /> Mobile money
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 3, background: "var(--text-4)" }} /> Carte + espèces
                </span>
              </div>
            }
          />
          <RevenueChart />
        </div>

        <div className="card">
          <SectionHead icon="pieChart" title="Mix paiement" sub="Cette semaine" />
          <Donut
            data={[
              { label: "Wave",         value: 42, color: "#1BA1F2" },
              { label: "Orange Money", value: 28, color: "#FF7900" },
              { label: "MTN",          value: 12, color: "#FFCC00" },
              { label: "Carte",        value: 13, color: "var(--text)" },
              { label: "Espèces",      value: 5,  color: "#1F8A5B" },
            ]}
            centerValue="82%"
            centerLabel="Mobile money"
          />
          <div style={{ marginTop: 16, display: "grid", gap: 7 }}>
            {([ ["Wave", 42, "#1BA1F2"], ["Orange Money", 28, "#FF7900"], ["MTN", 12, "#FFCC00"], ["Carte", 13, "#11110F"], ["Espèces", 5, "#1F8A5B"] ] as [string, number, string][]).map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: c, flexShrink: 0 }} />
                <span style={{ flex: 1, color: "var(--text-2)" }}>{l}</span>
                <strong style={{ color: "var(--text)" }}>{v}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="card" style={{ marginTop: 14 }}>
        <SectionHead icon="clock" title="Activité récente" />
        <div className="action-list">
          {[
            { time: "14:32", icon: "check",      txt: "Élise N’Guessan · Paiement reçu 38 000 FCFA via Orange Money" },
            { time: "13:18", icon: "arrowRight",  txt: "Daniel Kouassi · Check-in chambre 308" },
            { time: "12:08", icon: "arrowLeft",   txt: "Joseph Brou · Check-out chambre 303" },
            { time: "11:45", icon: "bell",        txt: "Réservation reçue · M. Dupont · 3 nuits" },
            { time: "10:22", icon: "refresh",     txt: "Ménage chambre 207 terminé" },
          ].map((a, i) => (
            <div key={i} className="al-item">
              <div className="al-time">{a.time}</div>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: "var(--bg-2)", color: "var(--text-2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Icon name={a.icon} size={12} />
              </div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.4 }}>{a.txt}</div>
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
    <div style={{ position: "relative", padding: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180 }}>
        {days.map(d => (
          <div key={d.d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 10, color: "var(--text-3)", fontVariantNumeric: "tabular-nums", marginBottom: 2 }}>
              {(d.a + d.b).toLocaleString("fr-FR")}
            </div>
            <div style={{ width: "100%", maxWidth: 40, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 2 }}>
              <div style={{ height: (d.b / max) * 150, background: "var(--text-4)", borderRadius: "4px 4px 0 0", minHeight: 4 }} />
              <div style={{ height: (d.a / max) * 150, background: d.d === "Lun 18" ? "var(--text)" : "var(--text-2)", borderRadius: "0 0 4px 4px" }} />
            </div>
            <div style={{ fontSize: 11, color: d.d === "Lun 18" ? "var(--text)" : "var(--text-3)", fontWeight: d.d === "Lun 18" ? 600 : 500, marginTop: 4 }}>
              {d.d}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
