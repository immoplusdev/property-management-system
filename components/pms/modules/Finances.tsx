"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Donut, Icon, KPICard, Button } from "../shared";
import { Pill } from "@/components/ui/Pill";
import { TRANSACTIONS, formatFCFA } from "../data";

const PAY_COLORS: Record<string, string> = {
  wave: "#1BA1F2", om: "#FF7900", mtn: "#FFCC00", card: "#2744DE", cash: "#16A26B",
};

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
    { type:"Standard",       revenue:4880000, share:33, color:"#7B8DFF" },
    { type:"Supérieure",     revenue:5860000, share:40, color:"#FF8E73" },
    { type:"Suite Junior",   revenue:2950000, share:20, color:"#6FB5A8" },
    { type:"Présidentielle", revenue:1130000, share:7,  color:"#B57BE6" },
  ];

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Finances"
        sub="Vue financière complète · revenus, remboursements, commissions"
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              {["day","week","month"].map(p => (
                <button
                  key={p}
                  className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium ${period===p ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2"}`}
                  onClick={() => setPeriod(p)}
                >
                  {{day:"Jour",week:"Semaine",month:"Mois"}[p as "day"|"week"|"month"]}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3 mb-5.5">
        <KPICard value={(totalMonth/1000000).toFixed(1)} unit="M FCFA" sub="434 transactions · 287 séjours"
          icon="trendingUp" iconBg="var(--color-success-bg)" iconColor="var(--color-success)" trend="↑ 18% vs avril" trendUp />
        <KPICard value="82%" sub="Part mobile money"
          icon="creditCard" iconBg="var(--color-primary-50)" iconColor="var(--color-primary)" trend="↑ 4 pts" trendUp />
        <KPICard value="74" unit="%" sub="Taux d'occupation moyen"
          icon="barChart" iconBg="var(--color-teal-bg)" iconColor="var(--color-teal)" trend="↑ 12%" trendUp />
        <KPICard value="1" unit="%" sub="Taux de remboursement"
          icon="award" iconBg="var(--color-violet-bg)" iconColor="var(--color-violet)" trend="−2%" trendUp={false} />
      </div>

      <div className="grid grid-cols-3 gap-3.5 mb-3.5">
        {/* Payment mix */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="pieChart" title="Mix paiement" sub="Ce mois" />
          <Donut data={byMethod.map(m => ({ label:m.label, value:m.pct, color:m.color }))} centerValue="82%" centerLabel="Mobile money" />
          <div className="mt-3.5 grid gap-1.75">
            {byMethod.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-[12px]">
                <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: m.color }} />
                <span className="flex-1 text-ink-2">{m.label}</span>
                <span className="text-ink-3">{m.count} tx</span>
                <strong>{m.pct}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by room type */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="bed" title="Revenus par type" sub="Ce mois" />
          {byRoomType.map(r => (
            <div key={r.type} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-medium">{r.type}</span>
                <span className="text-[12px] text-ink-3">{r.share}% · {(r.revenue/1000).toFixed(0)}k</span>
              </div>
              <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: r.share+"%", background: r.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Monthly summary */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="trendingUp" title="Résumé mensuel" />
          <div className="grid gap-1.5">
            {[
              { label:"Revenu brut",      value:formatFCFA(totalMonth),              color:"var(--color-success)" },
              { label:"Commission (8%)",  value:"− "+formatFCFA(totalMonth*0.08),    color:"var(--color-danger)"  },
              { label:"Remboursements",   value:"− "+formatFCFA(65000),              color:"var(--color-danger)"  },
              { label:"Revenu net",       value:formatFCFA(totalMonth*0.92-65000),   color:"var(--color-ink)"     },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
                <span className="text-ink-3 text-[13px]">{s.label}</span>
                <strong style={{ color: s.color, fontSize: 13 }}>{s.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        <div className="px-5.5 py-4 border-b border-border">
          <SectionHead icon="fileText" title="Dernières transactions" sub={`${TRANSACTIONS.length} transactions récentes`} />
        </div>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              {["ID","Date & heure","Description","Méthode","Montant","Statut"].map(h => (
                <th key={h} className="text-left font-medium text-ink-3 text-[11.5px] px-3.5 py-2.5 border-b border-border">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map(t => (
              <tr key={t.id} className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2">
                <td className="px-3.5 py-3.5 align-middle">
                  <code style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-ink-3)" }}>{t.id}</code>
                </td>
                <td className="px-3.5 py-3.5 align-middle tabular-nums text-ink-3 text-[12px]">{t.time}</td>
                <td className="px-3.5 py-3.5 align-middle max-w-70"><span className="text-[12.5px]">{t.desc}</span></td>
                <td className="px-3.5 py-3.5 align-middle">
                  <span
                    className="w-7.5 h-5.5 rounded-[5px] inline-grid place-items-center text-[9.5px] font-bold tracking-[0.04em] uppercase"
                    style={{ background: PAY_COLORS[t.method] ?? "#ccc", color: t.method === "mtn" ? "#111" : "#fff" }}
                  >
                    {t.method}
                  </span>
                </td>
                <td className="px-3.5 py-3.5 align-middle tabular-nums">
                  <strong style={{ color: t.amount < 0 ? "var(--color-danger)" : "var(--color-success)", fontSize: 13 }}>
                    {t.amount < 0 ? "−" : "+"} {formatFCFA(Math.abs(t.amount))}
                  </strong>
                </td>
                <td className="px-3.5 py-3.5 align-middle">
                  <Pill kind={t.status==="ok" ? "success" : t.status==="refunded" ? "danger" : "warn"} dot>
                    {t.status==="ok" ? "OK" : t.status==="refunded" ? "Remboursé" : t.status}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
