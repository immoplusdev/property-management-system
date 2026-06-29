"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, StarRating, Icon, Button } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { CLIENTS, BOOKINGS, REVIEWS, formatFCFA, formatDate, type Client, type Review } from "../data";

const AV_COLORS = ["#E89060","#6FB5A8","#7B8DFF","#B57BE6","#F5C572","#6FCC92","#FF8585","#6FB5DD"];
const avatarColor = (n: number) => AV_COLORS[(n - 1) % AV_COLORS.length];
const initials = (name: string) => name.split(" ").map(x => x[0]).join("").slice(0, 2);

export function Clients() {
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Client | null>(null);

  let list = CLIENTS;
  if (filter === "vip")  list = list.filter(c => c.vip);
  if (filter === "corp") list = list.filter(c => !!c.corporate);
  if (filter === "new")  list = list.filter(c => c.stays <= 1);
  if (search) list = list.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Clients"
        sub={`${CLIENTS.length} fiches clients · ${CLIENTS.filter(c => c.vip).length} VIP · ${CLIENTS.filter(c => c.corporate).length} comptes corporate`}
        actions={
          <>
            <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export CRM</Button>
            <Button variant="primary" size="sm"><Icon name="plus" size={14} /> Nouveau client</Button>
          </>
        }
      />

      {/* Filters */}
      <div className="bg-surface border border-border rounded-[18px] p-3.5 mb-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="h-9.5 w-80 bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 focus-within:border-ink-3">
            <Icon name="eye" size={14} color="var(--color-ink-3)" />
            <input
              className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4"
              placeholder="Nom, email, téléphone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ChipGroup>
            {([
              ["all",  "Tous",      CLIENTS.length],
              ["vip",  "VIP",       CLIENTS.filter(c => c.vip).length],
              ["corp", "Corporate", CLIENTS.filter(c => c.corporate).length],
              ["new",  "Nouveaux",  CLIENTS.filter(c => c.stays <= 1).length],
            ] as [string, string, number][]).map(([id, label, count]) => (
              <Chip key={id} label={label} count={count} active={filter === id} onClick={() => setFilter(id)} />
            ))}
          </ChipGroup>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-3 gap-3">
        {list.map(c => (
          <ClientCard key={c.id} client={c} onClick={() => setSelected(c)} />
        ))}
      </div>

      {selected && <ClientDetail client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-surface border border-border rounded-[18px] p-4.5 cursor-pointer hover:border-ink-3 transition-colors duration-120"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full inline-grid place-items-center text-white font-semibold text-[16px] shrink-0"
          style={{ background: avatarColor(client.avatar) }}
        >
          {initials(client.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="font-bold text-[14px]">{client.name}</div>
            {client.vip && (
              <span className="inline-flex items-center gap-0.75 text-white text-[10px] font-bold px-1.75 py-0.5 rounded-full bg-amber">
                <Icon name="star" size={10} /> VIP
              </span>
            )}
          </div>
          <div className="text-[11.5px] text-ink-3 mt-0.5">
            {client.corporate
              ? <span className="inline-flex items-center gap-1"><Icon name="briefcase" size={10} /> {client.corporate}</span>
              : <>{client.country} · {client.idType}</>}
          </div>
        </div>
        <Icon name="chevronRight" size={16} color="var(--color-ink-3)" />
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-3.5 pt-3.5 border-t border-border">
        <div>
          <div className="text-[11px] text-ink-3">Séjours</div>
          <div className="font-bold text-[15px]">{client.stays}</div>
        </div>
        <div>
          <div className="text-[11px] text-ink-3">Total dépensé</div>
          <div className="font-bold text-[13px] text-primary">{(client.totalSpent / 1000).toFixed(0)}k</div>
        </div>
        <div>
          <div className="text-[11px] text-ink-3">Dernier séjour</div>
          <div className="font-semibold text-[12px]">{client.lastStay ? formatDate(client.lastStay) : "—"}</div>
        </div>
      </div>
    </button>
  );
}

const PREFERENCES: [boolean, string][] = [
  [true,  "Chambre haut étage"],
  [true,  "Vue lagune préférée"],
  [false, "Lit jumeau"],
  [true,  "Petit-déjeuner en chambre"],
  [true,  "Ne pas déranger après 22h"],
  [false, "Chambre fumeur"],
];

function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  const [tab, setTab] = useState("info");
  const clientBookings = BOOKINGS.filter(b => b.guestId === client.id);
  const clientReviews: Review[] = REVIEWS.filter(r => r.guest === client.name);

  return (
    <Modal
      open
      onClose={onClose}
      maxWidth={760}
      footer={
        <>
          <Button variant="ghost" size="sm"><Icon name="trash" size={13} /> Supprimer</Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><Icon name="send" size={13} /> WhatsApp</Button>
            <Button variant="primary" size="sm" onClick={onClose}><Icon name="plus" size={13} /> Nouvelle résa</Button>
          </div>
        </>
      }
    >
      {/* Bleed header */}
      <div
        className="-m-5.5 mb-5 px-6 pt-6 pb-4.5 text-white relative"
        style={{ background: client.vip ? "var(--color-amber)" : "var(--color-ink)" }}
      >
        <button
          className="absolute top-4 right-4 w-8.5 h-8.5 grid place-items-center rounded-[9px] bg-white/20 border border-white/20 text-white hover:bg-white/30"
          onClick={onClose}
          aria-label="Fermer"
        >
          <Icon name="x" size={16} />
        </button>
        <div className="flex items-center gap-3.5">
          <div
            className="w-16 h-16 rounded-full inline-grid place-items-center text-white font-bold text-[22px] shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"
            style={{ background: avatarColor(client.avatar) }}
          >
            {initials(client.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[22px] font-bold tracking-[-0.02em]">{client.name}</div>
            <div className="text-[12px] opacity-90 mt-1 flex gap-3 flex-wrap">
              {client.vip       && <span className="inline-flex items-center gap-1"><Icon name="star" size={11} /> Client VIP</span>}
              {client.corporate && <span className="inline-flex items-center gap-1"><Icon name="briefcase" size={11} /> {client.corporate}</span>}
              <span className="inline-flex items-center gap-1"><Icon name="mapPin" size={11} /> {client.country}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] opacity-85">Total dépensé</div>
            <div className="text-[24px] font-extrabold tracking-[-0.02em]">
              {(client.totalSpent / 1000).toFixed(0)}k <span className="text-[11px] opacity-85">FCFA</span>
            </div>
            <div className="text-[11px] opacity-85 mt-0.5">sur {client.stays} séjours</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        variant="line"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "info",    label: "Informations" },
          { id: "history", label: `Historique · ${client.stays} séjours` },
          { id: "reviews", label: "Avis postés" },
          { id: "prefs",   label: "Préférences & notes" },
        ]}
      />

      {/* Info */}
      {tab === "info" && (
        <div className="grid grid-cols-2 gap-2">
          <DetailRow label="Téléphone (WhatsApp)" value={client.phone} action={<Button variant="soft" size="sm"><Icon name="send" size={13} /> Message</Button>} />
          <DetailRow label="Email" value={client.email} valueClass="text-[13px]" action={<Button variant="icon" size="md"><Icon name="mail" size={14} /></Button>} />
          <DetailRow label="Pièce d&apos;identité" value={`${client.idType} · ${client.idNumber}`} action={<Button variant="icon" size="md"><Icon name="eye" size={14} /></Button>} />
          <DetailRow label="Pays / Nationalité" value={client.country} />
          {client.corporate && (
            <div className="col-span-2 p-4 bg-surface-2 border border-primary-100 rounded-[14px]">
              <div className="flex items-center gap-2.5">
                <div className="w-9.5 h-9.5 rounded-[10px] bg-primary text-white grid place-items-center shrink-0">
                  <Icon name="briefcase" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[14px]">{client.corporate}</div>
                  <div className="text-[11px] text-ink-3">Compte corporate · facturation centralisée</div>
                </div>
                <Pill kind="primary" dot>Contrat actif</Pill>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {tab === "history" && (
        <div>
          <div className="grid grid-cols-3 gap-3 mb-3.5">
            <StatBox label="Séjours total" value={`${client.stays}`} />
            <StatBox label="Panier moyen" value={`${client.stays > 0 ? Math.round(client.totalSpent / client.stays / 1000) : 0}k`} unit="FCFA" />
            <StatBox label="Total dépensé" value={`${(client.totalSpent / 1000).toFixed(0)}k`} unit="FCFA" valueClass="text-primary" />
          </div>
          {clientBookings.length > 0 ? (
            <div className="relative pl-5 border-l-2 border-border grid gap-3.5">
              {clientBookings.map(b => (
                <div key={b.id} className="relative">
                  <div className="absolute -left-6.25 top-1 w-2.5 h-2.5 rounded-full border-2 border-primary bg-surface" />
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-[13px]">Chambre {b.room} · {b.roomType} · {b.nights} nuit{b.nights > 1 ? "s" : ""}</div>
                    <span className="text-[11px] text-ink-3 ml-auto">{formatDate(b.checkin)}</span>
                  </div>
                  <div className="text-[11px] text-ink-3">{b.ref} · via {b.source} · {b.payment.toUpperCase()}</div>
                  <div className="mt-1 font-bold text-primary text-[13px]">{formatFCFA(b.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="calendar" title="Aucun séjour enregistré" sub="Les réservations de ce client apparaîtront ici" />
          )}
        </div>
      )}

      {/* Reviews */}
      {tab === "reviews" && (
        <div>
          {clientReviews.length === 0 ? (
            <EmptyState icon="star" title="Pas encore d'avis posté" sub="Ce client n'a pas encore évalué de séjour via l'app Immo Plus" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-[13px] text-ink-2">Avis postés via l&apos;app Immo Plus</div>
                <div className="text-[12px] text-ink-3">
                  Note moyenne :{" "}
                  <strong className="text-amber text-[14px]">
                    {(clientReviews.reduce((s, r) => s + r.overall, 0) / clientReviews.length).toFixed(1)}★
                  </strong>
                </div>
              </div>
              {clientReviews.map(r => (
                <div key={r.id} className="p-4 border border-border rounded-xl mb-2.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarRating value={r.overall} size={13} />
                      <span className="font-bold">{r.overall}/5</span>
                    </div>
                    <span className="text-[11px] text-ink-3">{r.date} · {r.roomType}</span>
                  </div>
                  <div className="font-bold text-[14px] mb-1">{r.title}</div>
                  <div className="text-[13px] text-ink-2 leading-normal">{r.text}</div>
                  {r.reply && (
                    <div className="mt-2.5 p-2.5 bg-primary-50 rounded-lg text-[12px] border-l-[3px] border-primary">
                      <div className="text-[10px] font-bold text-primary uppercase tracking-[0.04em] mb-0.75">Votre réponse</div>
                      {r.reply}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Preferences */}
      {tab === "prefs" && (
        <div>
          <SectionHead icon="star" title="Préférences" />
          <div className="grid grid-cols-2 gap-2">
            {PREFERENCES.map(([checked, label], i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] border ${checked ? "border-primary-100 bg-primary-50" : "border-border bg-surface"}`}
              >
                <div className={`w-4.5 h-4.5 rounded-[5px] shrink-0 grid place-items-center text-white border-[1.5px] ${checked ? "bg-ink border-ink" : "bg-white border-border-strong"}`}>
                  {checked && <Icon name="check" size={12} />}
                </div>
                <span className="text-[13px] font-medium">{label}</span>
              </div>
            ))}
          </div>
          {client.notes && (
            <>
              <div className="h-px bg-border-soft my-4" />
              <SectionHead icon="fileText" title="Notes équipe" />
              <div className="px-3.5 py-3 bg-surface-2 rounded-[10px] text-[12.5px] text-ink-2 leading-normal">
                {client.notes}
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}

function DetailRow({ label, value, valueClass, action }: { label: string; value: string; valueClass?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border border-border rounded-[10px]">
      <div className="min-w-0">
        <div className="text-[11px] text-ink-3">{label}</div>
        <div className={`font-semibold mt-0.5 ${valueClass ?? "text-[14px]"}`}>{value}</div>
      </div>
      {action}
    </div>
  );
}

function StatBox({ label, value, unit, valueClass }: { label: string; value: string; unit?: string; valueClass?: string }) {
  return (
    <div className="px-3.5 py-3 bg-surface-2 border border-border rounded-xl">
      <div className="text-[11px] text-ink-3 font-medium">{label}</div>
      <div className={`font-bold text-[20px] tracking-[-0.02em] ${valueClass ?? ""}`}>
        {value}{unit && <span className="text-[11px] text-ink-3 ml-1 font-normal">{unit}</span>}
      </div>
    </div>
  );
}
