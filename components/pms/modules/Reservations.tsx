"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { BookingStatusPill, PayBadge, AppBadge, SourceBadge, Icon, KPICard, Button } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { BOOKINGS, APP_PROFILES, formatFCFA, formatDate, type Booking } from "../data";
import type { NavId } from "../PMSSidebar";

const AV_COLORS = ["#E89060","#6FB5A8","#7B8DFF","#B57BE6","#F5C572","#6FCC92","#FF8585","#6FB5DD"];

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
    { id:"all",          label:"Toutes",            count:BOOKINGS.length,                                       icon:"list",       iconBg:"var(--color-surface-2)",  iconColor:"var(--color-ink-2)"  },
    { id:"pending",      label:"En attente",         count:BOOKINGS.filter(b=>b.status==="pending").length,       icon:"clock",      iconBg:"var(--color-amber-bg)",   iconColor:"var(--color-amber)"  },
    { id:"confirmed",    label:"Confirmées",         count:BOOKINGS.filter(b=>b.status==="confirmed").length,     icon:"check",      iconBg:"var(--color-primary-50)", iconColor:"var(--color-primary)"},
    { id:"checked-in",   label:"Sur place",          count:BOOKINGS.filter(b=>b.status==="checked-in").length,   icon:"user",       iconBg:"var(--color-teal-bg)",    iconColor:"var(--color-teal)"   },
    { id:"checking-out", label:"Départ aujourd'hui", count:BOOKINGS.filter(b=>b.status==="checking-out").length, icon:"arrowLeft",  iconBg:"var(--color-amber-bg)",   iconColor:"var(--color-amber)"  },
  ];

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Réservations"
        sub={`${BOOKINGS.length} réservations · ${BOOKINGS.filter(b=>b.status==="pending").length} en attente d'acompte`}
        actions={
          <>
            <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export CSV</Button>
            <Button variant="primary" size="sm" onClick={() => go("checkin")}><Icon name="plus" size={14} /> Nouvelle résa</Button>
          </>
        }
      />

      <div className="grid gap-3 mb-5.5" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {kpis.map(s => (
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
        ))}
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-3.5 mb-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="h-9.5 w-70 bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 text-[13px] text-ink-3 focus-within:border-ink-3">
            <Icon name="eye" size={14} color="var(--color-ink-3)" />
            <input className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4" placeholder="Nom ou réf…" value={search} onChange={e => setSearch(e.target.value)} />
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

      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
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
              const profile = APP_PROFILES[b.id];
              return (
                <tr key={b.id} className="[&_td]:border-b [&_td]:border-border-soft last:[&_td]:border-b-0 hover:[&_td]:bg-surface-2 cursor-pointer" onClick={() => setSelected(b)}>
                  <td className="px-3.5 py-3.5 align-middle">
                    <code style={{ fontSize: 11, color: "var(--color-ink-2)", fontFamily: "var(--font-mono)" }}>{b.ref.replace("RES-2026-","")}</code>
                  </td>
                  <td className="px-3.5 py-3.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7.5 h-7.5 rounded-full inline-grid place-items-center text-white font-semibold text-[11px] shrink-0"
                        style={{ background: AV_COLORS[b.guest.charCodeAt(0) % 8] }}
                      >
                        {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0,2)}
                      </div>
                      <div>
                        <div className="font-semibold flex items-center gap-1.5">
                          {b.guest}
                          {b.source==="App" && <AppBadge size="sm" />}
                        </div>
                        <div className="text-[11.5px] text-ink-3">
                          {profile ? `Profil ${profile.complete}% complet` : b.source==="Corp" ? "Compte corporate" : "Réservation directe"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3.5 align-middle">
                    {b.room==="—" ? <span className="text-ink-3">À attribuer</span> : <><strong>{b.room}</strong> <span className="text-[11.5px] text-ink-3">· {b.roomType}</span></>}
                  </td>
                  <td className="px-3.5 py-3.5 align-middle tabular-nums">
                    {formatDate(b.checkin)} → {formatDate(b.checkout)}
                    <div className="text-[11.5px] text-ink-3">{b.nights} nuits</div>
                  </td>
                  <td className="px-3.5 py-3.5 align-middle"><BookingStatusPill status={b.status} /></td>
                  <td className="px-3.5 py-3.5 align-middle tabular-nums">
                    <strong>{formatFCFA(b.amount).replace(" FCFA","")}</strong> <span className="text-[11.5px] text-ink-3">FCFA</span>
                    {balance > 0 && <div style={{ fontSize: 11, color: "var(--color-warn)" }}>Solde {formatFCFA(balance)}</div>}
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
      </div>

      {selected && (
        <Modal
          open
          onClose={() => setSelected(null)}
          title={selected.guest}
          footer={
            <>
              <Button variant="ghost" onClick={() => setSelected(null)}>Fermer</Button>
              <Button variant="primary">Modifier</Button>
            </>
          }
        >
          <div className="text-[12px] text-ink-3 mb-4">{selected.ref}</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              ["Chambre", selected.room],
              ["Type", selected.roomType],
              ["Arrivée", formatDate(selected.checkin)],
              ["Départ", formatDate(selected.checkout)],
              ["Montant", formatFCFA(selected.amount)],
              ["Payé", formatFCFA(selected.paid)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
                <span className="text-ink-3 text-[13px]">{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          {selected.amount - selected.paid > 0 && (
            <div className="p-3 rounded-[10px] font-medium text-[13px]" style={{ background: "var(--color-warn-bg)", color: "var(--color-warn)" }}>
              Solde restant : {formatFCFA(selected.amount - selected.paid)}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
