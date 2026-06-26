"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { BookingStatusPill, PayBadge, AppBadge, SourceBadge, Icon } from "../shared";
import { BOOKINGS, APP_PROFILES, formatFCFA, formatDate, type Booking } from "../data";
import type { NavId } from "../PMSSidebar";

interface Props { go: (id: NavId) => void; }

export function Reservations({ go }: Props) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [selected, setSelected] = useState<Booking|null>(null);

  const filterMap: Record<string, (b: Booking) => boolean> = {
    all:           () => true,
    pending:       b => b.status === "pending",
    confirmed:     b => b.status === "confirmed",
    "checked-in":  b => b.status === "checked-in",
    "checking-out":b => b.status === "checking-out",
  };

  let list = BOOKINGS.filter(filterMap[filter] ?? (() => true));
  if (search) list = list.filter(b => b.guest.toLowerCase().includes(search.toLowerCase()) || b.ref.toLowerCase().includes(search.toLowerCase()));
  if (payFilter !== "all") list = list.filter(b => b.payment === payFilter);

  const kpis = [
    { id:"all",          label:"Toutes",            count:BOOKINGS.length,                                       icon:"list",       color:"primary" },
    { id:"pending",      label:"En attente",         count:BOOKINGS.filter(b=>b.status==="pending").length,       icon:"clock",      color:"amber" },
    { id:"confirmed",    label:"Confirmées",         count:BOOKINGS.filter(b=>b.status==="confirmed").length,     icon:"check",      color:"primary" },
    { id:"checked-in",   label:"Sur place",          count:BOOKINGS.filter(b=>b.status==="checked-in").length,   icon:"user",       color:"teal" },
    { id:"checking-out", label:"Départ aujourd'hui", count:BOOKINGS.filter(b=>b.status==="checking-out").length, icon:"arrowLeft",  color:"amber" },
  ];

  return (
    <div className="fade-in">
      <PMSHeader
        title="Réservations"
        sub={`${BOOKINGS.length} réservations · ${BOOKINGS.filter(b=>b.status==="pending").length} en attente d'acompte`}
        actions={
          <>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> Export CSV</button>
            <button className="btn btn-primary btn-sm" onClick={() => go("checkin")}><Icon name="plus" size={14} /> Nouvelle résa</button>
          </>
        }
      />

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {kpis.map(s => (
          <div key={s.id} className="kpi" style={{ cursor:"pointer", borderColor: filter===s.id ? "var(--primary)" : "var(--border)", background: filter===s.id ? "var(--primary-50)" : "#fff" }} onClick={() => setFilter(s.id)}>
            <div className="kpi-top">
              <div className="kpi-icon" style={{ background:`var(--${s.color==="primary"?"primary-50":s.color+"-bg"})`, color:`var(--${s.color})` }}>
                <Icon name={s.icon} size={16} />
              </div>
              {filter===s.id && <Icon name="check" size={16} color="var(--primary)" />}
            </div>
            <div className="kpi-value" style={{ fontSize:24 }}>{s.count}</div>
            <div className="kpi-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:14, marginBottom:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <div className="search-bar" style={{ width:280 }}>
            <Icon name="eye" size={14} color="var(--text-3)" />
            <input placeholder="Nom ou réf…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="chips">
            {["all","wave","om","mtn","card"].map(p => (
              <div key={p} className={"chip"+(payFilter===p?" active":"")} onClick={() => setPayFilter(p)}>
                {p==="all" ? "Tous paiements" : <PayBadge method={p} />}
                {p!=="all" && " " + p.toUpperCase()}
              </div>
            ))}
          </div>
          <div style={{ marginLeft:"auto", fontSize:12, color:"var(--text-3)" }}>{list.length} résultats</div>
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table className="tbl">
          <thead>
            <tr><th>Référence</th><th>Client</th><th>Chambre</th><th>Séjour</th><th>Statut</th><th>Montant</th><th>Paiement</th><th>Source</th><th></th></tr>
          </thead>
          <tbody>
            {list.map(b => {
              const balance = b.amount - b.paid;
              const profile = APP_PROFILES[b.id];
              return (
                <tr key={b.id} onClick={() => setSelected(b)} style={{ cursor:"pointer" }}>
                  <td>
                    <code style={{ fontSize:11, color:"var(--text-2)", fontFamily:"var(--mono)" }}>{b.ref.replace("RES-2026-","")}</code>
                  </td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center" }}>
                      <div className={"av av-sm av-" + ((b.guest.charCodeAt(0) % 8) + 1)} style={{ width:30, height:30, fontSize:11 }}>
                        {b.guest.split(" ").map(x=>x[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                          {b.guest}
                          {b.source==="App" && <AppBadge size="sm" />}
                        </div>
                        <div className="text-xs text-muted">
                          {profile ? `Profil ${profile.complete}% complet` : b.source==="Corp" ? "Compte corporate" : "Réservation directe"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {b.room==="—" ? <span className="text-muted">À attribuer</span> : <><strong>{b.room}</strong> <span className="text-xs text-muted">· {b.roomType}</span></>}
                  </td>
                  <td className="text-num">
                    {formatDate(b.checkin)} → {formatDate(b.checkout)}
                    <div className="text-xs text-muted">{b.nights} nuits</div>
                  </td>
                  <td><BookingStatusPill status={b.status} /></td>
                  <td className="text-num">
                    <strong>{formatFCFA(b.amount).replace(" FCFA","")}</strong> <span className="text-xs text-muted">FCFA</span>
                    {balance > 0 && <div style={{ fontSize:11, color:"var(--warn)" }}>Solde {formatFCFA(balance)}</div>}
                  </td>
                  <td><PayBadge method={b.payment} /></td>
                  <td><SourceBadge source={b.source} /></td>
                  <td><button className="btn-icon"><Icon name="chevronRight" size={14} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div style={{ fontWeight:700, fontSize:18 }}>{selected.guest}</div>
                <div style={{ fontSize:12, color:"var(--text-3)", marginTop:2 }}>{selected.ref}</div>
              </div>
              <button className="btn-icon" onClick={() => setSelected(null)}><Icon name="x" size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="row"><span className="text-muted text-sm">Chambre</span><strong>{selected.room}</strong></div>
                <div className="row"><span className="text-muted text-sm">Type</span><strong>{selected.roomType}</strong></div>
                <div className="row"><span className="text-muted text-sm">Arrivée</span><strong>{formatDate(selected.checkin)}</strong></div>
                <div className="row"><span className="text-muted text-sm">Départ</span><strong>{formatDate(selected.checkout)}</strong></div>
                <div className="row"><span className="text-muted text-sm">Montant</span><strong>{formatFCFA(selected.amount)}</strong></div>
                <div className="row"><span className="text-muted text-sm">Payé</span><strong style={{ color:"var(--success)" }}>{formatFCFA(selected.paid)}</strong></div>
              </div>
              {selected.amount - selected.paid > 0 && (
                <div style={{ marginTop:12, padding:"12px 14px", background:"var(--warn-bg)", borderRadius:10, color:"var(--warn)", fontWeight:500, fontSize:13 }}>
                  Solde restant : {formatFCFA(selected.amount - selected.paid)}
                </div>
              )}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setSelected(null)}>Fermer</button>
              <button className="btn btn-primary">Modifier</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
