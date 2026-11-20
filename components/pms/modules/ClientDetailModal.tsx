"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, SectionHead, StarRating, Icon, Button } from "../shared";
import { Tabs } from "@/components/ui/Tabs";
import { Pill } from "@/components/ui/Pill";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatFCFA, formatDate, type Guest, type Review } from "../data";
import { useReservations } from "@/lib/hooks/pms/useReservations";
import { useReviews } from "@/lib/hooks/pms/useReviews";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { GuestPreferences } from "./GuestPreferences";

const avatarColor = (g: Guest) => AV_COLORS[(String(g.firstName ?? "?").charCodeAt(0) || 0) % AV_COLORS.length];
const fullName = (g: Guest) => `${g.firstName} ${g.lastName}`;
const initials = (g: Guest) => `${g.firstName[0] ?? ""}${g.lastName[0] ?? ""}`.toUpperCase();

export function ClientDetailModal({ client }: { client: Guest }) {
  const router = useRouter();
  const [tab, setTab] = useState("info");
  const name = fullName(client);

  const bookingsQ = useReservations({ guestId: client.id, limit: 20 });
  const clientBookings = bookingsQ.data?.data ?? [];
  const reviewsQ = useReviews({ guestId: client.id, limit: 50 });
  const clientReviews: Review[] = (reviewsQ.data?.data ?? []).map(review => ({ ...review, date: formatDate(review.createdAt) }));

  function close() {
    router.back();
  }

  return (
    <Modal
      open
      onClose={close}
      maxWidth={760}
      footer={
        <>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={close}>Fermer</Button>
          </div>
        </>
      }
    >
      {/* Bleed header */}
      <div
        className="-m-5.5 mb-5 px-6 pt-6 pb-4.5 text-white relative"
        style={{ background: client.type === "vip" ? "var(--color-amber)" : "var(--color-ink)" }}
      >
        <button
          className="absolute top-4 right-4 w-8.5 h-8.5 grid place-items-center rounded-[9px] bg-white/20 border border-white/20 text-white hover:bg-white/30"
          onClick={close}
          aria-label="Fermer"
        >
          <Icon name="x" size={16} />
        </button>
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

      {/* Tabs */}
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
          <DetailRow label="Téléphone" value={client.phone} />
          <DetailRow label="Email" value={client.email} valueClass="text-[13px]" />
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
          {reviewsQ.isError ? <div role="alert" className="text-sm text-danger">{(reviewsQ.error as Error).message}</div> : clientReviews.length === 0 ? (
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
          <GuestPreferences client={client} />
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
