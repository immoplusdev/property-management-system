"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { PMSHeader } from "./PMSHeader";
import { SectionHead, Donut, Icon, KPICard, Button, Skeleton } from "./shared";
import { Pill } from "@/components/ui/Pill";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { STATUS_CONFIG, REQUEST_TYPES, formatFCFA, formatDate } from "./data";
import type { UserDto } from "@/lib/api/generated/model";
import type { DashboardKPIs } from "@/lib/api/pms/dashboard.actions";
import {
  useDashboardKPIs,
  useDashboardMovements,
  useDashboardActivity,
  useDashboardPaymentMix,
} from "@/lib/hooks/pms/useDashboard";
import { useRooms } from "@/lib/hooks/pms/useRooms";
import { useRequests } from "@/lib/hooks/pms/useRequests";
import { useHotel } from "@/lib/pms/HotelContext";

interface Props {
  user: UserDto | null;
}

const ACTIVITY_ICON: Record<string, string> = {
  check_in:           "arrowRight",
  check_out:          "arrowLeft",
  payment:            "check",
  reservation_created:"bell",
  room_status_change: "refresh",
};

const PAYMENT_COLORS: Record<string, string> = {
  wave:         "var(--color-pay-wave)",
  orange_money: "var(--color-pay-om)",
  mtn:          "var(--color-pay-mtn)",
  credit_card:  "var(--color-primary)",
  cash:         "var(--color-success)",
};
const PAYMENT_LABELS: Record<string, string> = {
  wave:         "Wave",
  orange_money: "Orange Money",
  mtn:          "MTN",
  credit_card:  "Carte",
  cash:         "Espèces",
};

function fmt(ts: string) {
  return new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

const todayLabel = (() => {
  const d = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return d.charAt(0).toUpperCase() + d.slice(1);
})();

export function Dashboard({ user }: Props) {
  const router = useRouter();
  const hotel = useHotel();
  const go = (id: "checkin" | "checkout" | "rooms" | "requests") => router.push(`/pms/${hotel}/${id}`);
  const firstName = user?.firstName ?? "Directeur";

  const kpisQ    = useDashboardKPIs();
  const movQ     = useDashboardMovements();
  const actQ     = useDashboardActivity(10);
  const payMixQ  = useDashboardPaymentMix();
  const roomsQ   = useRooms();
  const reqsQ    = useRequests({ status: "pending", limit: 3 });

  const kpis     = kpisQ.data;
  const rooms    = roomsQ.data?.rooms ?? [];
  const movements = useMemo(() => {
    const arr = (movQ.data?.arrivals ?? []).map(a => ({ ...a, mvmt: "arrivee" as const }));
    const dep = (movQ.data?.departures ?? []).map(d => ({ ...d, mvmt: "depart" as const }));
    return [...arr, ...dep];
  }, [movQ.data]);
  const activities = actQ.data?.activities ?? [];
  const payBreakdown = payMixQ.data?.breakdown ?? [];
  const pendingReqs  = reqsQ.data?.data ?? [];

  const mobilePct = useMemo(() => {
    const total = payBreakdown.reduce((s, p) => s + p.percentage, 0);
    const mobile = payBreakdown
      .filter(p => ["wave","orange_money","mtn"].includes(p.method))
      .reduce((s, p) => s + p.percentage, 0);
    return total > 0 ? Math.round(mobile) : 0;
  }, [payBreakdown]);

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title={`Bonjour, ${firstName}`}
        sub={`${todayLabel} · ${kpis ? `${kpis.arrivalsToday ?? 0} arrivées · ${kpis.departuresToday ?? 0} départs prévus` : "Chargement…"}`}
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
        {kpisQ.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[96px]" />)
        ) : (
          <>
            <KPICard
              label="Taux d'occupation"
              value={kpis ? Math.round(kpis.occupancyRate ?? 0) : "—"}
              unit="%"
              trend={kpis ? `${kpis.occupiedRooms ?? 0}/${kpis.totalRooms ?? 0} ch.` : ""}
              trendUp
              sub={kpis ? `${kpis.availableRooms ?? 0} libres · ${kpis.inHouseGuests ?? 0} hôtes` : ""}
            />
            <KPICard
              label="Revenus du jour"
              value={kpis ? ((kpis.todayRevenue ?? 0) / 1000).toFixed(0) : "—"}
              unit="k FCFA"
              trendUp
              sub={kpis ? `${((kpis.monthRevenue ?? 0) / 1_000_000).toFixed(1)} M ce mois` : ""}
            />
            <KPICard
              label="RevPAR"
              value={kpis ? ((kpis.revPAR ?? 0) / 1000).toFixed(1) : "—"}
              unit="k FCFA"
              trendUp
              sub="Revenu / chambre disponible"
            />
            <KPICard
              label="ADR · prix moyen"
              value={kpis ? ((kpis.averageDailyRate ?? 0) / 1000).toFixed(0) : "—"}
              unit="k FCFA"
              trendUp
              sub={kpis ? `${kpis.pendingReservations ?? 0} résa en attente` : ""}
            />
          </>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[2fr_1fr] gap-3.5">
        {/* Movements table */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead
            icon="arrowRight"
            title="Mouvements du jour"
            sub={`${movQ.data?.arrivals.length ?? 0} arrivées · ${movQ.data?.departures.length ?? 0} départs`}
          />
          {movQ.isLoading ? (
            <div className="grid gap-2 mt-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : movements.length === 0 ? (
            <div className="py-8 text-center text-ink-3 text-[13px]">Aucun mouvement aujourd&apos;hui</div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  {["Type","Client","Chambre","Heure","Solde",""].map(h => (
                    <th key={h} className="text-left font-medium text-ink-3 text-[11.5px] px-3.5 py-2.5 border-b border-border">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {movements.map((b, i) => {
                  const name  = b.guestName ?? "—";
                  const room  = b.roomNumber ?? "—";
                  const time  = b.mvmt === "arrivee"
                    ? (b.expectedTime ? fmt(b.expectedTime) : "14:00")
                    : "12:00";
                  const balance = b.mvmt === "depart" ? (b.balance ?? 0) : null;
                  return (
                    <tr key={i} className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2">
                      <td className="px-3.5 py-3.5 align-middle">
                        {b.mvmt === "arrivee"
                          ? <Pill kind="teal" dot>Arrivée</Pill>
                          : <Pill kind="amber" dot>Départ</Pill>}
                      </td>
                      <td className="px-3.5 py-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full inline-grid place-items-center text-white font-semibold text-[11px] shrink-0"
                            style={{ background: AV_COLORS[i % 8] }}
                          >
                            {name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="font-semibold text-[13px]">{name}</div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3.5 align-middle">
                        <strong>{room}</strong>
                      </td>
                      <td className="px-3.5 py-3.5 align-middle tabular-nums text-ink-3">{time}</td>
                      <td className="px-3.5 py-3.5 align-middle">
                        {balance !== null
                          ? balance > 0
                            ? <span style={{ color: "var(--color-warn)", fontWeight: 600 }}>{formatFCFA(balance)}</span>
                            : <span style={{ color: "var(--color-success)", fontWeight: 500 }}>Soldé</span>
                          : <span className="text-ink-3">—</span>}
                      </td>
                      <td className="px-3.5 py-3.5 align-middle">
                        {b.mvmt === "arrivee"
                          ? <Button variant="soft" size="sm" onClick={() => go("checkin")}>Check-in</Button>
                          : <Button variant="soft" size="sm" onClick={() => go("checkout")}>Check-out</Button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3.5">
          {/* Mini room status */}
          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead
              icon="bed"
              title="État des chambres"
              right={<Button variant="text" size="sm" onClick={() => go("rooms")}>Détails →</Button>}
            />
            {roomsQ.isLoading ? (
              <Skeleton className="h-28" />
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1.25">
                  {rooms.slice(0, 28).map(r => {
                    const conf = STATUS_CONFIG[r.status];
                    return (
                      <div
                        key={r.id || r.num}
                        className="aspect-square rounded-md grid place-items-center text-[10.5px] font-semibold cursor-pointer transition-transform duration-120 hover:scale-[1.06]"
                        style={{ background: conf?.bg ?? "var(--color-surface-2)", color: conf?.color ?? "var(--color-ink-3)" }}
                        title={`${r.num} · ${conf?.label ?? r.status}`}
                      >
                        {r.num}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => {
                    const count = rooms.filter(r => r.status === k).length;
                    return (
                      <div key={k} className="inline-flex items-center gap-1.75 text-[12px] text-ink-2 font-medium">
                        <span className="w-1.75 h-1.75 rounded-full inline-block shrink-0" style={{ background: v.color }} />
                        <span>{v.label}</span>
                        <strong className="ml-auto text-ink">{count}</strong>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Pending app requests */}
          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead
              icon="bell"
              title="Demandes en cours"
              sub={reqsQ.data ? `${reqsQ.data.total} via l'app Immo Plus` : ""}
              right={<Button variant="text" size="sm" onClick={() => go("requests")}>Tout →</Button>}
            />
            {reqsQ.isLoading ? (
              <div className="grid gap-2 mt-2">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-10"/>)}</div>
            ) : pendingReqs.length === 0 ? (
              <div className="py-4 text-center text-ink-3 text-[12px]">Aucune demande en attente</div>
            ) : (
              pendingReqs.map(r => {
                const t = REQUEST_TYPES[r.type];
                return (
                  <div key={r.id} className="flex items-center gap-2.5 py-2.5 border-t border-border-soft">
                    <div className="w-7.5 h-7.5 rounded-[7px] bg-surface-2 text-ink-2 grid place-items-center shrink-0">
                      <Icon name={t?.icon ?? "bell"} size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{r.title}</div>
                      <div className="text-[11.5px] text-ink-3">Ch. {r.roomNumber} · {formatDate(r.createdAt)}</div>
                    </div>
                    <Pill kind="warn">À faire</Pill>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Revenue + Payment mix */}
      <div className="grid grid-cols-3 gap-3.5 mt-3.5">
        <div className="bg-surface border border-border rounded-[18px] p-5.5 col-span-2">
          <SectionHead
            icon="barChart"
            title="Revenus"
            sub="Aperçu du chiffre d'affaires"
          />
          <RevenueChart kpis={kpis} />
        </div>

        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="pieChart" title="Mix paiement" sub="Cette semaine" />
          {payMixQ.isLoading ? (
            <Skeleton className="h-40 mt-2" />
          ) : payBreakdown.length > 0 ? (
            <>
              <Donut
                data={payBreakdown.map(p => ({
                  label: PAYMENT_LABELS[p.method] ?? p.method,
                  value: p.percentage,
                  color: PAYMENT_COLORS[p.method] ?? "var(--color-ink-3)",
                }))}
                centerValue={`${mobilePct}%`}
                centerLabel="Mobile money"
              />
              <div className="mt-4 grid gap-1.75">
                {payBreakdown.map(p => (
                  <div key={p.method} className="flex items-center gap-2 text-[12px]">
                    <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ background: PAYMENT_COLORS[p.method] ?? "var(--color-ink-3)" }} />
                    <span className="flex-1 text-ink-2">{PAYMENT_LABELS[p.method] ?? p.method}</span>
                    <strong className="text-ink">{Math.round(p.percentage)}%</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-ink-3 text-[12px]">Aucune donnée</div>
          )}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-surface border border-border rounded-[18px] p-5.5 mt-3.5">
        <SectionHead icon="clock" title="Activité récente" />
        {actQ.isLoading ? (
          <div className="grid gap-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12"/>)}</div>
        ) : activities.length === 0 ? (
          <div className="py-6 text-center text-ink-3 text-[13px]">Aucune activité récente</div>
        ) : (
          <div className="flex flex-col">
            {activities.map((a, i) => (
              <div key={a.id ?? i} className="flex items-center gap-3 py-3 border-b border-border-soft last:border-b-0">
                <div className="text-[11px] text-ink-3 tabular-nums min-w-12.5">{fmt(a.timestamp)}</div>
                <div className="w-6.5 h-6.5 rounded-[7px] bg-surface-2 text-ink-2 grid place-items-center shrink-0">
                  <Icon name={ACTIVITY_ICON[a.type] ?? "clock"} size={12} />
                </div>
                <div className="text-[13px] text-ink-2 leading-[1.4] flex-1 min-w-0">{a.description}</div>
                <div className="text-[11px] text-ink-3 shrink-0 hidden lg:block">{a.performedBy}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RevenueChart({ kpis }: { kpis: DashboardKPIs | undefined }) {
  if (!kpis) {
    return (
      <div className="grid grid-cols-2 gap-3 mt-1">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  // L'API ne fournit pas de série journalière dédiée ; on affiche les agrégats
  // réels disponibles (jour / mois) issus de /pms/dashboard/kpis.
  const todayRev = kpis.todayRevenue ?? 0;
  const monthRev = kpis.monthRevenue ?? 0;
  const avgRate = kpis.averageDailyRate ?? 0;
  const revpar = kpis.revPAR ?? 0;
  const occRate = kpis.occupancyRate ?? 0;

  const cards = [
    {
      label: "Revenus du jour",
      value: todayRev,
      sub: `ADR ${(avgRate / 1000).toFixed(0)}k · RevPAR ${(revpar / 1000).toFixed(1)}k`,
      accent: "var(--color-ink)",
    },
    {
      label: "Revenus du mois",
      value: monthRev,
      sub: `${Math.round(occRate)}% d'occupation`,
      accent: "var(--color-primary)",
    },
  ];

  const max = Math.max(todayRev, monthRev, 1);

  return (
    <div className="grid grid-cols-2 gap-3 mt-1">
      {cards.map(c => (
        <div key={c.label} className="rounded-[14px] border border-border bg-surface-2 p-4 flex flex-col justify-between min-h-28">
          <div>
            <div className="text-[11.5px] text-ink-3 font-medium">{c.label}</div>
            <div className="font-extrabold text-[24px] tracking-[-0.02em] mt-1" style={{ color: c.accent }}>
              {(c.value / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })}
              <span className="text-[12px] text-ink-3 font-semibold ml-1">k FCFA</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${Math.round((c.value / max) * 100)}%`, background: c.accent }} />
            </div>
            <div className="text-[11px] text-ink-3 mt-1.5">{c.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
