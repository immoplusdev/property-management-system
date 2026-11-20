"use client";
import React from "react";
import { SectionHead, Skeleton } from "./shared";
import { formatDate } from "./data";
import { useDashboardOccupancyStats, useDashboardOperationalAlerts } from "@/lib/hooks/pms/useDashboard";

const civilDate = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Abidjan", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

export function DashboardInsights() {
  const fromDate = civilDate(new Date());
  const toDate = civilDate(new Date(Date.now() + 13 * 86_400_000));
  const occupancyQ = useDashboardOccupancyStats(fromDate, toDate);
  const alertsQ = useDashboardOperationalAlerts();

  return <div className="grid grid-cols-2 gap-3.5 mt-3.5">
    <section className="bg-surface border border-border rounded-[18px] p-5.5">
      <SectionHead icon="barChart" title="Occupation à venir" sub="14 prochains jours · chambres vendables" />
      {occupancyQ.isLoading ? <Skeleton className="h-32 mt-3" /> : occupancyQ.isError ? <div role="alert" className="mt-3 text-sm text-danger">{(occupancyQ.error as Error).message}</div> : occupancyQ.data?.dailyStats.length ? <div className="flex items-end gap-1 h-36 mt-4" role="img" aria-label="Taux d'occupation quotidien sur 14 jours">{occupancyQ.data.dailyStats.map(day => <div key={day.date} className="flex-1 h-full flex flex-col justify-end items-center gap-1" title={`${formatDate(day.date)} : ${day.occupiedRooms}/${day.sellableRooms} chambres (${day.occupancyRate} %)`}><div className={`w-full rounded-t-sm ${day.isPeak ? "bg-amber" : "bg-primary"}`} style={{ height: `${Math.max(2, Math.min(100, day.occupancyRate))}%` }} /><span className="text-[9px] text-ink-3">{day.date.slice(8)}</span></div>)}</div> : <p className="mt-3 text-sm text-ink-3">Aucune donnée d'occupation.</p>}
    </section>
    <section className="bg-surface border border-border rounded-[18px] p-5.5">
      <SectionHead icon="bell" title="Alertes opérationnelles" sub="Aujourd'hui et 7 prochains jours" />
      {alertsQ.isLoading ? <Skeleton className="h-32 mt-3" /> : alertsQ.isError ? <div role="alert" className="mt-3 text-sm text-danger">{(alertsQ.error as Error).message}</div> : alertsQ.data?.alerts.length ? <div className="grid gap-2 mt-3">{alertsQ.data.alerts.map(alert => <div key={alert.code} className="p-3 border border-border rounded-lg text-xs"><div className="flex items-start gap-2"><span className={`inline-block w-2 h-2 rounded-full mt-1 ${alert.level === "critical" ? "bg-danger" : alert.level === "warning" ? "bg-amber" : "bg-primary"}`} /><span>{alert.message}</span></div></div>)}</div> : <p className="mt-3 text-sm text-ink-3">Aucune alerte opérationnelle.</p>}
    </section>
  </div>;
}
