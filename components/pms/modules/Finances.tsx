"use client";
import React, { useState, useMemo } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Donut, KPICard, Skeleton } from "../shared";
import { PaymentMethodIcon } from "../PaymentMethodIcon";
import { Pill } from "@/components/ui/Pill";
import { formatFCFA } from "../data";
import { useFinanceSummary, useTransactions } from "@/lib/hooks/pms/useFinances";
import { ExportAction } from "@/components/pms/ExportAction";
import { CashDeskSection } from "./CashDeskSection";
import { HotelWithdrawals } from "./HotelWithdrawals";

const PAY_COLORS: Record<string, string> = {
  wave: "var(--color-pay-wave)", om: "var(--color-pay-om)", mtn: "var(--color-pay-mtn)",
  card: "var(--color-primary)", cash: "var(--color-success)",
};

export function Finances() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const summaryQ      = useFinanceSummary({ period });
  const transactionsQ = useTransactions({ limit: 50 });

  const s  = summaryQ.data;
  const txs = transactionsQ.data?.data ?? [];

  // The summary aggregates the entire selected period; the transaction list is paginated.
  const byMethod = useMemo(() => {
    const revenue = s?.revenueByMethod ?? {};
    const methods = Object.keys(revenue);
    if (!methods.length) return [];
    const labels: Record<string, string> = { wave:"Wave", orange_money:"Orange Money", mtn:"MTN Money", mtn_momo:"MTN Money", moov_money:"Moov Money", credit_card:"Carte bancaire", cash:"Espèces" };
    const colors: Record<string, string> = PAY_COLORS;
    const total = Object.values(revenue).reduce((sum, value) => sum + value, 0);
    return methods.map(id => {
      const val = revenue[id];
      const color = id === "orange_money" ? PAY_COLORS.om : id === "mtn" || id === "mtn_momo" ? PAY_COLORS.mtn : id === "credit_card" ? PAY_COLORS.card : colors[id];
      return { id, label: labels[id] ?? id, value: val, color: color ?? "var(--color-ink-3)", pct: total > 0 ? Math.round((val/total)*100) : 0, count: s?.transactionCountByMethod?.[id] };
    });
  }, [s]);

  const totalRevenue = s?.totalRevenue;
  const changePct    = s?.revenueChange;
  const isLoading    = summaryQ.isLoading;

  const mobileMoneyPct = byMethod.filter(m => ["wave","orange_money","mtn","mtn_momo","moov_money"].includes(m.id)).reduce((s, m) => s + m.pct, 0);

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Finances"
        sub="Vue financière · revenus, remboursements et soldes"
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              {(["day","week","month"] as const).map(p => (
                <button
                  key={p}
                  className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium ${period===p ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2"}`}
                  onClick={() => setPeriod(p)}
                >
                  {{day:"Jour",week:"Semaine",month:"Mois"}[p]}
                </button>
              ))}
            </div>
            <ExportAction dataset="finances" format="xlsx" label="Export XLSX" />
          </>
        }
      />

      <HotelWithdrawals />

      {(summaryQ.isError || transactionsQ.isError) && <div role="alert" className="mb-4 text-sm text-danger">
        {summaryQ.isError && `Résumé financier : ${(summaryQ.error as Error).message} `}
        {transactionsQ.isError && `Transactions : ${(transactionsQ.error as Error).message}`}
      </div>}

      <div className="grid grid-cols-4 gap-3 mb-5.5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : <>
              <KPICard
                value={totalRevenue !== undefined ? `${(totalRevenue/1000000).toFixed(1)}` : "—"} unit="M FCFA"
                sub={`${transactionsQ.data?.total ?? "—"} transactions`}
                icon="trendingUp" iconBg="var(--color-success-bg)" iconColor="var(--color-success)"
                trend={changePct === undefined ? undefined : changePct >= 0 ? `↑ ${changePct.toFixed(0)}%` : `↓ ${Math.abs(changePct).toFixed(0)}%`}
                trendUp={changePct === undefined ? undefined : changePct >= 0}
              />
              <KPICard
                value={byMethod.length ? `${mobileMoneyPct}%` : "—"} sub="Part mobile money"
                icon="creditCard" iconBg="var(--color-primary-50)" iconColor="var(--color-primary)"
              />
              <KPICard
                value={typeof s?.netRevenue === "number" ? `${(s.netRevenue/1000000).toFixed(1)}` : "—"} unit="M FCFA"
                sub="Revenu net calculé par le serveur"
                icon="award" iconBg="var(--color-teal-bg)" iconColor="var(--color-teal)"
              />
              <KPICard
                value={s ? formatFCFA(s.refunds) : "—"} sub="Remboursements"
                icon="barChart" iconBg="var(--color-violet-bg)" iconColor="var(--color-violet)"
              />
            </>
        }
      </div>

      <div className="grid grid-cols-3 gap-3.5 mb-3.5">
        {/* Payment mix */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="pieChart" title="Mix paiement" sub={`Transactions · ${period === "day" ? "aujourd'hui" : period === "week" ? "7 derniers jours" : "ce mois"}`} />
          {summaryQ.isLoading
            ? <Skeleton className="h-40 mt-3" />
            : <>
                <Donut
                  data={byMethod.filter(m => m.pct > 0).map(m => ({ label:m.label, value:m.pct, color:m.color }))}
                  centerValue={byMethod.length ? `${mobileMoneyPct}%` : "—"}
                  centerLabel="Mobile money"
                />
                <div className="mt-3.5 grid gap-1.75">
                  {byMethod.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-[12px]">
                      <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: m.color }} />
                      <span className="flex-1 text-ink-2">{m.label}</span>
                      {m.count !== undefined && <span className="text-ink-3">{m.count} tx</span>}
                      <strong>{m.pct}%</strong>
                    </div>
                  ))}
                  {byMethod.length === 0 && <div className="text-[12px] text-ink-3">Aucune transaction pour cette période.</div>}
                </div>
              </>
          }
        </div>

        {/* Revenue breakdown */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="bed" title="Revenus par source" sub={period === "day" ? "Aujourd'hui" : period === "week" ? "7 derniers jours" : "Ce mois"} />
          {isLoading
            ? <Skeleton className="h-40 mt-3" />
            : s?.revenueBySource ? (() => {
                const source = s.revenueBySource;
                const other = Object.entries(source).filter(([key]) => !["room", "restaurant", "spa"].includes(key)).reduce((sum, [, value]) => sum + value, 0);
                const sources = [
                  { type:"Hébergement",  value:source.room ?? 0, color:"var(--color-cat-3)" },
                  { type:"Restaurant",   value:source.restaurant ?? 0, color:"var(--color-cat-7)" },
                  { type:"Spa & Loisirs",value:source.spa ?? 0, color:"var(--color-cat-2)" },
                  { type:"Autres",       value:other, color:"var(--color-cat-4)" },
                ];
                const total = sources.reduce((sum, r) => sum + r.value, 0) || 1;
                return sources.map(r => (
                  <div key={r.type} className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12.5px] font-medium">{r.type}</span>
                      <span className="text-[12px] text-ink-3">{Math.round((r.value/total)*100)}% · {(r.value/1000).toFixed(0)}k</span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: Math.round((r.value/total)*100)+"%", background: r.color }} />
                    </div>
                  </div>
                ));
              })() : <div className="text-[12px] text-ink-3">Répartition par source indisponible.</div>
          }
        </div>

        {/* Monthly summary */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="trendingUp" title="Résumé" />
          {isLoading
            ? <Skeleton className="h-40 mt-3" />
            : <div className="grid gap-1.5">
                {[
                  { label:"Revenu brut",      value:s ? formatFCFA(s.totalRevenue)  : "—", color:"var(--color-success)" },
                  { label:"Remboursements",   value:typeof s?.refunds === "number" ? "−"+formatFCFA(s.refunds) : "—", color:"var(--color-danger)"  },
                  { label:"Soldes en attente",value:formatFCFA(s?.pendingBalance), color:"var(--color-warn)"    },
                  { label:"Revenu net",        value:formatFCFA(s?.netRevenue), color:"var(--color-ink)"     },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
                    <span className="text-ink-3 text-[13px]">{row.label}</span>
                    <strong style={{ color: row.color, fontSize: 13 }}>{row.value}</strong>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        <div className="px-5.5 py-4 border-b border-border">
          <SectionHead icon="fileText" title="Dernières transactions" sub={`${transactionsQ.data?.total ?? "…"} transactions récentes`} />
        </div>
        {transactionsQ.isLoading ? (
          <div className="p-4 grid gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["ID","Date & heure","Description","Méthode","Montant","Statut"].map(h => (
                  <th key={h} className="text-left font-medium text-ink-3 text-[11.5px] px-3.5 py-2.5 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.length === 0 ? (
                <tr><td colSpan={6} className="px-3.5 py-8 text-center text-ink-3 text-[13px]">Aucune transaction</td></tr>
              ) : txs.map(t => (
                <tr key={t.id} className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2">
                  <td className="px-3.5 py-3.5 align-middle">
                    <code style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--color-ink-3)" }}>{t.id.slice(0,12)}</code>
                  </td>
                  <td className="px-3.5 py-3.5 align-middle tabular-nums text-ink-3 text-[12px]">{t.time}</td>
                  <td className="px-3.5 py-3.5 align-middle max-w-70"><span className="text-[12.5px]">{t.desc}</span></td>
                  <td className="px-3.5 py-3.5 align-middle">
                    <PaymentMethodIcon method={t.method as any} size="sm" />
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
        )}
      </div>
      <CashDeskSection />
    </div>
  );
}
