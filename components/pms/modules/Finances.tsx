"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Donut, Icon } from "../shared";
import { TRANSACTIONS, formatFCFA } from "../data";

export function Finances() {
  const [period, setPeriod] = useState("month");

  const totalMonth = 14820000;
  const byMethod = [
    { id:"wave", label:"Wave",           value:6224400, color:"#1BA1F2", pct:42, count:187 },
    { id:"om",   label:"Orange Money",   value:4149600, color:"#FF7900", pct:28, count:124 },
    { id:"mtn",  label:"MTN Money",      value:1778400, color:"#FFCC00", pct:12, count:53  },
    { id:"card", label:"Carte bancaire", value:1926600, color:"#2744DE", pct:13, count:42  },
    { id:"cash", label:"Espèces",        value:741000,  color:"#16A26B", pct:5,  count:28  },
  ];
  const byRoomType = [
    { type:"Standard",          revenue:4880000, share:33, color:"#7B8DFF" },
    { type:"Supérieure",        revenue:5860000, share:40, color:"#FF8E73" },
    { type:"Suite Junior",      revenue:2950000, share:20, color:"#6FB5A8" },
    { type:"Présidentielle",    revenue:1130000, share:7,  color:"#B57BE6" },
  ];

  return (
    <div className="fade-in">
      <PMSHeader
        title="Finances"
        sub="Vue financière complète · revenus, remboursements, commissions"
        actions={
          <>
            <div className="tabs">
              {["day","week","month"].map(p => (
                <div key={p} className={"tab"+(period===p?" active":"")} onClick={() => setPeriod(p)}>
                  {{day:"Jour",week:"Semaine",month:"Mois"}[p]}
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> Export</button>
          </>
        }
      />

      <div className="kpi-grid">
        <div className="kpi">
          <div className="kpi-top"><div className="kpi-icon" style={{ background:"var(--success-bg)", color:"var(--success)" }}><Icon name="trendingUp" size={18} /></div><span className="kpi-trend up">↑ 18% vs avril</span></div>
          <div className="kpi-value" style={{ fontSize:28 }}>{(totalMonth/1000000).toFixed(1)}<span className="kpi-unit">M FCFA</span></div>
          <div className="kpi-sub">434 transactions · 287 séjours</div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><div className="kpi-icon" style={{ background:"var(--primary-50)", color:"var(--primary)" }}><Icon name="creditCard" size={18} /></div><span className="kpi-trend up">↑ 4 pts</span></div>
          <div className="kpi-value">82%</div>
          <div className="kpi-sub">Part mobile money</div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><div className="kpi-icon" style={{ background:"var(--teal-bg)", color:"var(--teal)" }}><Icon name="barChart" size={18} /></div><span className="kpi-trend up">↑ 12%</span></div>
          <div className="kpi-value">74<span className="kpi-unit">%</span></div>
          <div className="kpi-sub">Taux d&apos;occupation moyen</div>
        </div>
        <div className="kpi">
          <div className="kpi-top"><div className="kpi-icon" style={{ background:"var(--violet-bg)", color:"var(--violet)" }}><Icon name="award" size={18} /></div><span className="kpi-trend down">−2%</span></div>
          <div className="kpi-value">1<span className="kpi-unit">%</span></div>
          <div className="kpi-sub">Taux de remboursement</div>
        </div>
      </div>

      <div className="grid-dash-3" style={{ marginBottom:14 }}>
        {/* Payment mix */}
        <div className="card">
          <SectionHead icon="pieChart" title="Mix paiement" sub="Ce mois" />
          <Donut data={byMethod.map(m => ({ label:m.label, value:m.pct, color:m.color }))} centerValue="82%" centerLabel="Mobile money" />
          <div style={{ marginTop:14, display:"grid", gap:7 }}>
            {byMethod.map(m => (
              <div key={m.id} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                <span style={{ width:10, height:10, borderRadius:3, background:m.color, flexShrink:0 }} />
                <span style={{ flex:1, color:"var(--text-2)" }}>{m.label}</span>
                <span style={{ color:"var(--text-3)" }}>{m.count} tx</span>
                <strong>{m.pct}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by room type */}
        <div className="card">
          <SectionHead icon="bed" title="Revenus par type" sub="Ce mois" />
          {byRoomType.map(r => (
            <div key={r.type} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12.5, fontWeight:500 }}>{r.type}</span>
                <span style={{ fontSize:12, color:"var(--text-3)" }}>{r.share}% · {(r.revenue/1000).toFixed(0)}k</span>
              </div>
              <div style={{ height:6, background:"var(--bg-2)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:r.share+"%", background:r.color, borderRadius:99 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Monthly summary */}
        <div className="card">
          <SectionHead icon="trendingUp" title="Résumé mensuel" />
          <div className="stat-grid" style={{ gridTemplateColumns:"1fr" }}>
            {[
              { label:"Revenu brut",      value:formatFCFA(totalMonth),        color:"var(--success)" },
              { label:"Commission (8%)",  value:"− "+formatFCFA(totalMonth*0.08), color:"var(--danger)" },
              { label:"Remboursements",   value:"− "+formatFCFA(65000),         color:"var(--danger)" },
              { label:"Revenu net",       value:formatFCFA(totalMonth*0.92-65000), color:"var(--text)" },
            ].map(s => (
              <div key={s.label} className="row" style={{ marginBottom:6 }}>
                <span className="text-muted text-sm">{s.label}</span>
                <strong style={{ color:s.color, fontSize:13 }}>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:"16px 22px", borderBottom:"1px solid var(--border)" }}>
          <SectionHead icon="fileText" title="Dernières transactions" sub={`${TRANSACTIONS.length} transactions récentes`} />
        </div>
        <table className="tbl">
          <thead>
            <tr><th>ID</th><th>Date & heure</th><th>Description</th><th>Méthode</th><th>Montant</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map(t => (
              <tr key={t.id}>
                <td><code style={{ fontSize:11, fontFamily:"var(--mono)", color:"var(--text-3)" }}>{t.id}</code></td>
                <td className="text-num text-muted" style={{ fontSize:12 }}>{t.time}</td>
                <td style={{ maxWidth:280 }}><span style={{ fontSize:12.5 }}>{t.desc}</span></td>
                <td>
                  <span className={"pay-icon pay-"+t.method} style={{ textTransform:"uppercase" }}>{t.method}</span>
                </td>
                <td className="text-num">
                  <strong style={{ color: t.amount < 0 ? "var(--danger)" : "var(--success)", fontSize:13 }}>
                    {t.amount < 0 ? "−" : "+"} {formatFCFA(Math.abs(t.amount))}
                  </strong>
                </td>
                <td>
                  <span className={"pill dot " + (t.status==="ok" ? "success" : t.status==="refunded" ? "danger" : "warn")}>
                    {t.status==="ok" ? "OK" : t.status==="refunded" ? "Remboursé" : t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
