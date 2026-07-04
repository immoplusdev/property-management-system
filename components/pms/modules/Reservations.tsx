"use client";
import React, { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { BookingStatusPill, PayBadge, AppBadge, SourceBadge, Icon, KPICard, Button, Skeleton } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { formatFCFA, formatDate, type Booking } from "../data";
import type { BookingStatus } from "@/lib/types/pms";
import { useReservations } from "@/lib/hooks/pms/useReservations";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { useHotel } from "@/lib/pms/HotelContext";

export function Reservations() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hotel = useHotel();
  const go = (id: "checkin" | "checkout") => router.push(`/pms/${hotel}/${id}`);

  const filter    = searchParams.get("status") ?? "all";
  const search    = searchParams.get("q") ?? "";
  const payFilter = searchParams.get("pay") ?? "all";

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const setFilter    = (v: string) => updateParams({ status: v });
  const setSearch    = (v: string) => updateParams({ q: v });
  const setPayFilter = (v: string) => updateParams({ pay: v });

  // Fetch all reservations (let API paginate at 100 max for client-side filtering)
  const { data, isLoading, error } = useReservations({ limit: 100 });
  const allBookings: Booking[] = data?.data ?? [];

  // Client-side filtering
  const list = useMemo(() => {
    let res = allBookings;
    if (filter !== "all") res = res.filter(b => b.status === (filter as BookingStatus));
    if (search) res = res.filter(b =>
      b.guest.toLowerCase().includes(search.toLowerCase()) ||
      b.ref.toLowerCase().includes(search.toLowerCase())
    );
    if (payFilter !== "all") res = res.filter(b => b.payment === payFilter);
    return res;
  }, [allBookings, filter, search, payFilter]);

  const count = (status: BookingStatus) => allBookings.filter(b => b.status === status).length;

  const kpis = [
    { id:"all",          label:"Toutes",             count:allBookings.length,          icon:"list",      iconBg:"var(--color-surface-2)",  iconColor:"var(--color-ink-2)"  },
    { id:"pending",      label:"En attente",          count:count("pending"),            icon:"clock",     iconBg:"var(--color-amber-bg)",   iconColor:"var(--color-amber)"  },
    { id:"confirmed",    label:"Confirmées",          count:count("confirmed"),          icon:"check",     iconBg:"var(--color-primary-50)", iconColor:"var(--color-primary)"},
    { id:"checked_in",   label:"Sur place",           count:count("checked_in"),         icon:"user",      iconBg:"var(--color-teal-bg)",    iconColor:"var(--color-teal)"   },
    { id:"checking_out", label:"Départ aujourd'hui",  count:count("checking_out"),       icon:"arrowLeft", iconBg:"var(--color-amber-bg)",   iconColor:"var(--color-amber)"  },
  ];

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Réservations"
        sub={
          isLoading
            ? "Chargement…"
            : `${allBookings.length} réservations · ${count("pending")} en attente d'acompte`
        }
        actions={
          <>
            <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export CSV</Button>
            <Button variant="primary" size="sm" onClick={() => go("checkin")}><Icon name="plus" size={14} /> Nouvelle résa</Button>
          </>
        }
      />

      {/* KPI Row */}
      <div className="grid gap-3 mb-5.5" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : kpis.map(s => (
              <KPICard
                key={s.id}
                value={s.count}
                label={s.label}
                icon={s.icon}
                iconBg={s.iconBg}
                iconColor={s.iconColor}
                active={filter === s.id}
                onClick={() => setFilter(s.id)}
                style={{ fontSize: 24 }}
              />
            ))
        }
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-[18px] p-3.5 mb-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="h-9.5 w-70 bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 focus-within:border-ink-3">
            <Icon name="eye" size={14} color="var(--color-ink-3)" />
            <input
              className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4"
              placeholder="Nom ou réf…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ChipGroup>
            {["all","wave","om","mtn","card"].map(p => (
              <Chip
                key={p}
                label={p === "all" ? "Tous paiements" : p.toUpperCase()}
                active={payFilter === p}
                onClick={() => setPayFilter(p)}
                before={p !== "all" ? <PayBadge method={p} /> : undefined}
              />
            ))}
          </ChipGroup>
          <div className="ml-auto text-[12px] text-ink-3">{list.length} résultats</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        {isLoading ? (
          <div className="p-4 grid gap-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : error ? (
          <div className="py-12 text-center text-ink-3 text-[13px]">
            <Icon name="x" size={20} color="var(--color-warn)" />
            <div className="mt-2">Impossible de charger les réservations</div>
          </div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-ink-3 text-[13px]">Aucune réservation trouvée</div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["Référence","Client","Chambre","Séjour","Statut","Montant","Paiement","Source",""].map(h => (
                  <th key={h} className="text-left font-medium text-ink-3 text-[11.5px] px-3.5 py-2.5 border-b border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map(b => {
                const balance = b.amount - b.paid;
                return (
                  <tr
                    key={b.id}
                    className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2 cursor-pointer"
                    onClick={() => router.push(`/pms/${hotel}/reservations/${b.id}`)}
                  >
                    <td className="px-3.5 py-3.5 align-middle">
                      <code style={{ fontSize: 11, color: "var(--color-ink-2)", fontFamily: "var(--font-mono)" }}>
                        {b.ref.replace("RES-","").slice(0, 12)}
                      </code>
                    </td>
                    <td className="px-3.5 py-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7.5 h-7.5 rounded-full inline-grid place-items-center text-white font-semibold text-[11px] shrink-0"
                          style={{ background: AV_COLORS[b.guest.charCodeAt(0) % 8] }}
                        >
                          {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-1.5">
                            {b.guest}
                            {b.source === "App" && <AppBadge size="sm" />}
                          </div>
                          <div className="text-[11.5px] text-ink-3">
                            {b.source === "Corp" ? "Compte corporate" : b.nights + " nuits"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 align-middle">
                      {b.room === "—"
                        ? <span className="text-ink-3">À attribuer</span>
                        : <><strong>{b.room}</strong> <span className="text-[11.5px] text-ink-3">· {b.roomType}</span></>}
                    </td>
                    <td className="px-3.5 py-3.5 align-middle tabular-nums">
                      {formatDate(b.checkin)} → {formatDate(b.checkout)}
                      <div className="text-[11.5px] text-ink-3">{b.nights} nuit{b.nights > 1 ? "s" : ""}</div>
                    </td>
                    <td className="px-3.5 py-3.5 align-middle"><BookingStatusPill status={b.status} /></td>
                    <td className="px-3.5 py-3.5 align-middle tabular-nums">
                      <strong>{formatFCFA(b.amount).replace(" FCFA","")}</strong>{" "}
                      <span className="text-[11.5px] text-ink-3">FCFA</span>
                      {balance > 0 && (
                        <div style={{ fontSize: 11, color: "var(--color-warn)" }}>Solde {formatFCFA(balance)}</div>
                      )}
                    </td>
                    <td className="px-3.5 py-3.5 align-middle"><PayBadge method={b.payment} /></td>
                    <td className="px-3.5 py-3.5 align-middle"><SourceBadge source={b.source} /></td>
                    <td className="px-3.5 py-3.5 align-middle">
                      <Button variant="icon" size="md"><Icon name="chevronRight" size={14} /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
