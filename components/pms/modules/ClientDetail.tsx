"use client";
import React, { useState } from "react";
import Link from "next/link";
import { SectionHead, StarRating, Icon, Button } from "../shared";
import { Tabs } from "@/components/ui/Tabs";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatFCFA, formatDate, type Guest, type Review } from "../data";
import { useReservations } from "@/lib/hooks/pms/useReservations";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { useHotel } from "@/lib/pms/HotelContext";

const avatarColor = (g: Guest) => AV_COLORS[(g.firstName.charCodeAt(0) ?? 0) % AV_COLORS.length];
const fullName = (g: Guest) => `${g.firstName} ${g.lastName}`;
const initials = (g: Guest) => `${g.firstName[0] ?? ""}${g.lastName[0] ?? ""}`.toUpperCase();

const PREFERENCES: [boolean, string][] = [
  [true,  "Chambre haut étage"],
  [true,  "Vue lagune préférée"],
  [false, "Lit jumeau"],
  [true,  "Petit-déjeuner en chambre"],
  [true,  "Ne pas déranger après 22h"],
  [false, "Chambre fumeur"],
];

export function ClientDetail({ client }: { client: Guest }) {
  const hotel = useHotel();
  const [tab, setTab] = useState("info");
  const name = fullName(client);

  const bookingsQ = useReservations({ guestId: client.id, limit: 20 });
  const clientBookings = bookingsQ.data?.data ?? [];
  // Le backend n'expose pas (encore) d'endpoint d'avis par client
  // (cf. PMS_CONCORDANCE.md). On affiche un état vide honnête plutôt que des mocks.
  const clientReviews: Review[] = [];

  return (
    <div className="animate-pms-fade-up">
      <Link href={`/pms/${hotel}/clients`} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink mb-3">
        <Icon name="arrowLeft" size={12} /> Clients
      </Link>

      {/* Bleed header */}
      <div
        className="-mx-9 px-9 pt-6 pb-4.5 text-white relative mb-5"
        style={{ background: client.type === "vip" ? "var(--color-amber)" : "var(--color-ink)" }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-16 h-16 rounded-full inline-grid place-items-center text-white font-bold text-[22px] shrink-0 shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"
            style={{ background: avatarColor(client) }}
          >
            {initials(client)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[22px] font-bold tracking-[-0.02em]">{name}</div>
            <div className="text-[12px] opacity-90 mt-1 flex gap-3 flex-wrap">
              {client.type === "vip"       && <span className="inline-flex items-center gap-1"><Icon name="star" size={11} /> Client VIP</span>}
              {client.corporateName        && <span className="inline-flex items-center gap-1"><Icon name="briefcase" size={11} /> {client.corporateName}</span>}
              <span className="inline-flex items-center gap-1"><Icon name="mapPin" size={11} /> {client.nationality}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[11px] opacity-85">Total dépensé</div>
            <div className="text-[24px] font-extrabold tracking-[-0.02em]">
              {(client.totalSpent / 1000).toFixed(0)}k <span className="text-[11px] opacity-85">FCFA</span>
            </div>
            <div className="text-[11px] opacity-85 mt-0.5">sur {client.totalStays} séjours</div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5.5">
        <Tabs
          variant="line"
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "info",    label: "Informations" },
            { id: "history", label: `Historique · ${client.totalStays} séjours` },
            { id: "reviews", label: "Avis postés" },
            { id: "prefs",   label: "Préférences & notes" },
          ]}
        />

        {/* Info */}
        {tab === "info" && (
          <div className="grid grid-cols-2 gap-2">
            <DetailRow label="Téléphone (WhatsApp)" value={client.phone} action={<Button variant="soft" size="sm"><Icon name="send" size={13} /> Message</Button>} />
            <DetailRow label="Email" value={client.email} valueClass="text-[13px]" action={<Button variant="icon" size="md"><Icon name="mail" size={14} /></Button>} />
            <DetailRow label="Pays / Nationalité" value={client.nationality} />
            {client.isBlacklisted && client.blacklistReason && (
              <div className="col-span-2 p-4 bg-red-50 border border-red-200 rounded-[14px] text-[13px] text-red-700">
                <strong>Client blacklisté :</strong> {client.blacklistReason}
              </div>
            )}
            {client.corporateName && (
              <div className="col-span-2 p-4 bg-surface-2 border border-primary-100 rounded-[14px]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9.5 h-9.5 rounded-[10px] bg-primary text-white grid place-items-center shrink-0">
                    <Icon name="briefcase" size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px]">{client.corporateName}</div>
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
              <StatBox label="Séjours total" value={`${client.totalStays}`} />
              <StatBox label="Panier moyen" value={`${client.totalStays > 0 ? Math.round(client.totalSpent / client.totalStays / 1000) : 0}k`} unit="FCFA" />
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
              <EmptyState icon="star" title="Pas encore d&apos;avis posté" sub="Ce client n&apos;a pas encore évalué de séjour via l&apos;app Immo Plus" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="text-[13px] text-ink-2">Avis postés via l&apos;app Immo Plus</div>
                  <div className="text-[12px] text-ink-3">
                    Note moyenne :{" "}
                    <strong className="text-amber text-[14px]">
                      {(clientReviews.reduce((s, r) => s + r.rating, 0) / clientReviews.length).toFixed(1)}★
                    </strong>
                  </div>
                </div>
                {clientReviews.map(r => (
                  <div key={r.id} className="p-4 border border-border rounded-xl mb-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <StarRating value={r.rating} size={13} />
                        <span className="font-bold">{r.rating}/5</span>
                      </div>
                      <span className="text-[11px] text-ink-3">{r.date} · {r.roomType}</span>
                    </div>
                    <div className="font-bold text-[14px] mb-1">{r.title}</div>
                    <div className="text-[13px] text-ink-2 leading-normal">{r.comment}</div>
                    {r.response && (
                      <div className="mt-2.5 p-2.5 bg-primary-50 rounded-lg text-[12px] border-l-[3px] border-primary">
                        <div className="text-[10px] font-bold text-primary uppercase tracking-[0.04em] mb-0.75">Votre réponse</div>
                        {r.response}
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
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" size="sm"><Icon name="trash" size={13} /> Supprimer</Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm"><Icon name="send" size={13} /> WhatsApp</Button>
          <Button variant="primary" size="sm"><Icon name="plus" size={13} /> Nouvelle résa</Button>
        </div>
      </div>
    </div>
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
