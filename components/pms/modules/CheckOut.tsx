"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, toastPromise, Button, Skeleton } from "../shared";
import { Pill } from "@/components/ui/Pill";
import { formatFCFA, formatDate, type Booking } from "../data";
import { useReservations } from "@/lib/hooks/pms/useReservations";
import { useCheckOutInvoice, usePerformCheckOut } from "@/lib/hooks/pms/useCheckOut";
import type { Invoice } from "@/lib/api/pms/checkout.actions";
import { AV_COLORS } from "@/lib/utils/avatarColor";

const STEPS = ["Vérification", "Règlement", "Départ"];

const initials = (name: string) => name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
const avatarBg  = (name: string) => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];

export function CheckOut() {
  const [step,     setStep]     = useState(0);
  const [selected, setSelected] = useState<Booking | null>(null);

  const checkedInQ = useReservations({ status: "checked_in", limit: 100 });
  const performCO = usePerformCheckOut();
  
  const allCheckedIn = checkedInQ.data?.data ?? [];
  const todayStr = new Date().toISOString().split("T")[0];
  
  const departures = allCheckedIn.filter(b => b.checkout.startsWith(todayStr));
  const checkedIn  = allCheckedIn.filter(b => !b.checkout.startsWith(todayStr));

  function openCheckout(b: Booking) {
    setSelected(b);
    setStep(0);
  }

  async function handleComplete() {
    if (!selected) return;
    try {
      await toastPromise(performCO.mutateAsync({ reservationId: selected.id }), {
        loading: "Check-out en cours…",
        success: `Check-out ${selected.guest} confirmé`,
        error: (e) => (e as Error)?.message || "Erreur lors du check-out",
      });
      setSelected(null);
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Check-out"
        sub={
          checkedInQ.isLoading
            ? "Chargement…"
            : `${departures.length} départ${departures.length !== 1 ? "s" : ""} aujourd'hui · ${checkedIn.length} clients en cours de séjour`
        }
        search={false}
        actions={
          <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export</Button>
        }
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
        {/* Left column: departures + checked-in */}
        <div>
          <SectionHead icon="arrowRight" title="Départs du jour" sub={`${departures.length} chambres à libérer`} />
          {checkedInQ.isLoading ? (
            <div className="grid gap-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : departures.length === 0 ? (
            <div className="py-8 text-center text-ink-3 text-[13px]">Aucun départ aujourd&apos;hui</div>
          ) : (
            <div className="grid gap-2">
              {departures.map(b => (
                <DepartureRow key={b.id} booking={b} onSelect={() => openCheckout(b)} active={selected?.id === b.id} />
              ))}
            </div>
          )}

          <div className="mt-5">
            <SectionHead icon="users" title="Clients en séjour" sub="Peuvent demander un check-out anticipé" />
            {checkedInQ.isLoading ? (
              <div className="grid gap-2">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : (
              <div className="grid gap-2">
                {checkedIn.slice(0, 5).map(b => (
                  <DepartureRow key={b.id} booking={b} onSelect={() => openCheckout(b)} active={selected?.id === b.id} dim />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: wizard panel */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5 h-fit sticky top-6">
          {selected ? (
            <>
              {/* Step bar */}
              <div className="flex items-center gap-0 mb-6">
                {STEPS.map((label, i) => (
                  <React.Fragment key={label}>
                    <button
                      onClick={() => setStep(i)}
                      className={`flex items-center gap-1.5 text-[12px] font-semibold ${i === step ? "text-primary" : i < step ? "text-success" : "text-ink-3"}`}
                    >
                      <span className={`w-5.5 h-5.5 rounded-full text-[11px] font-bold inline-grid place-items-center ${
                        i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-surface-2 text-ink-3"
                      }`}>
                        {i < step ? "✓" : i + 1}
                      </span>
                      {label}
                    </button>
                    {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 0 — Vérification */}
              {step === 0 && (
                <div>
                  <div className="flex items-center gap-3 p-4 bg-surface-2 rounded-[12px] mb-4">
                    <div
                      className="w-12 h-12 rounded-full inline-grid place-items-center text-white font-semibold text-[15px] shrink-0"
                      style={{ background: avatarBg(selected.guest) }}
                    >
                      {initials(selected.guest)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[16px]">{selected.guest}</div>
                      <div className="text-[12px] text-ink-3">Chambre {selected.room} · {selected.roomType} · {selected.nights} nuit{selected.nights > 1 ? "s" : ""}</div>
                    </div>
                    <Pill kind={selected.status === "checking_out" ? "warn" : "primary"}>
                      {selected.status === "checking_out" ? "Départ" : "En séjour"}
                    </Pill>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <StatCard label="Arrivée"      value={formatDate(selected.checkin)} />
                    <StatCard label="Départ prévu" value={formatDate(selected.checkout)} />
                    <StatCard label="Nuits"        value={`${selected.nights}`} />
                    <StatCard label="Chambre"      value={selected.room} />
                  </div>

                  <div className="grid gap-2">
                    <CheckItem checked label="Identité vérifiée au check-in" />
                    <CheckItem checked={selected.paid >= selected.amount} label="Acompte versé" />
                    <CheckItem checked={selected.paid >= selected.amount} label="Solde soldé" />
                    <CheckItem checked label="Objets valuables vérifiés (coffre)" />
                  </div>

                  <Button variant="primary" size="sm" className="w-full mt-4" onClick={() => setStep(1)}>
                    Passer au règlement <Icon name="arrowRight" size={14} />
                  </Button>
                </div>
              )}

              {/* Step 1 — Règlement */}
              {step === 1 && (
                <div>
                  <InvoicePanel reservationId={selected.id} booking={selected} />
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="ghost" size="sm"><Icon name="download" size={13} /> Facture PDF</Button>
                    <Button variant="primary" size="sm" onClick={() => setStep(2)}>
                      Valider <Icon name="arrowRight" size={14} />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2 — Départ */}
              {step === 2 && (
                <div>
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-success/10 inline-grid place-items-center mx-auto mb-3">
                      <Icon name="check" size={28} color="var(--color-success)" />
                    </div>
                    <div className="font-bold text-[18px] tracking-[-0.02em]">Prêt pour le départ</div>
                    <div className="text-[13px] text-ink-3 mt-1">
                      {selected.guest} · Chambre {selected.room}
                    </div>
                  </div>

                  <div className="grid gap-2 mb-4">
                    <CheckItem checked label="Clé / carte rendue" />
                    <CheckItem checked={false} label="Minibar relevé" />
                    <CheckItem checked label="Chambre signalée au ménage" />
                    <CheckItem checked label="Facture remise au client" />
                  </div>

                  <div className="grid gap-2">
                    <Button
                      variant="primary" size="sm" className="w-full"
                      disabled={performCO.isPending}
                      onClick={handleComplete}
                    >
                      <Icon name="check" size={14} /> {performCO.isPending ? "Traitement…" : "Confirmer le check-out"}
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Icon name="send" size={13} /> Envoyer facture par email
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-surface-2 inline-grid place-items-center mb-3">
                <Icon name="arrowRight" size={22} color="var(--color-ink-3)" />
              </div>
              <div className="font-semibold text-[15px] text-ink-2">Sélectionner un client</div>
              <div className="text-[12px] text-ink-3 mt-1">Cliquez sur une ligne à gauche pour démarrer le check-out</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DepartureRow({ booking: b, onSelect, dim, active }: { booking: Booking; onSelect: () => void; dim?: boolean; active?: boolean }) {
  const balance = b.amount - b.paid;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-3 px-4 py-3.5 bg-surface border rounded-[14px] cursor-pointer transition-colors duration-120 ${
        active ? "border-primary bg-primary-50" : dim ? "border-border hover:border-ink-3" : "border-warn/40 bg-warn/5 hover:border-warn"
      }`}
    >
      <div
        className="w-10 h-10 rounded-full inline-grid place-items-center text-white font-semibold text-[13px] shrink-0"
        style={{ background: avatarBg(b.guest) }}
      >
        {initials(b.guest)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13.5px]">{b.guest}</div>
        <div className="text-[11.5px] text-ink-3">Ch. {b.room} · départ {formatDate(b.checkout)}</div>
      </div>
      <div className="text-right shrink-0">
        {balance > 0
          ? <Pill kind="warn">{formatFCFA(balance)}</Pill>
          : <Pill kind="success">Soldé</Pill>
        }
      </div>
      <Icon name="chevronRight" size={16} color="var(--color-ink-3)" />
    </button>
  );
}

function InvoicePanel({ reservationId, booking: b }: { reservationId: string; booking: Booking }) {
  const { data: invoice, isLoading } = useCheckOutInvoice(reservationId, true);

  if (isLoading) return <div className="grid gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>;

  if (invoice) return <InvoiceFromAPI invoice={invoice} />;

  // Fallback: use booking data
  const balance = b.amount - b.paid;
  return (
    <div className="bg-surface-2 rounded-[12px] p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-[14px]">{b.guest}</div>
          <div className="text-[12px] text-ink-3">Chambre {b.room} · {formatDate(b.checkin)} → {formatDate(b.checkout)}</div>
        </div>
        <div className="text-[11px] text-ink-3">{b.ref}</div>
      </div>
      <div className="grid gap-1.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-ink-2">{b.nights} nuit{b.nights > 1 ? "s" : ""} × {formatFCFA(Math.round(b.amount / b.nights))}</span>
          <span className="font-semibold">{formatFCFA(b.amount)}</span>
        </div>
        <div className="flex justify-between text-ink-3">
          <span>Acompte versé</span>
          <span>− {formatFCFA(b.paid)}</span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex justify-between font-bold text-[14px]">
          <span>Solde à régler</span>
          <span className={balance > 0 ? "text-warn" : "text-success"}>{formatFCFA(balance)}</span>
        </div>
      </div>
    </div>
  );
}

function InvoiceFromAPI({ invoice: inv }: { invoice: Invoice }) {
  const guestName = `${inv.guest.firstName} ${inv.guest.lastName}`;
  return (
    <div className="bg-surface-2 rounded-[12px] p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-[14px]">{guestName}</div>
          <div className="text-[12px] text-ink-3">Chambre {inv.room.number} · {formatDate(inv.checkInDate)} → {formatDate(inv.checkOutDate)}</div>
        </div>
      </div>
      <div className="grid gap-1.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-ink-2">{inv.nights} nuit{inv.nights > 1 ? "s" : ""} · {inv.room.typeName}</span>
          <span className="font-semibold">{formatFCFA(inv.roomTotal)}</span>
        </div>
        {inv.extras.map((extra, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-ink-2">{extra.label}</span>
            <span className="font-semibold">{formatFCFA(extra.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between text-ink-3">
          <span>Acompte versé</span>
          <span>− {formatFCFA(inv.paidAmount)}</span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex justify-between font-bold text-[14px]">
          <span>Solde à régler</span>
          <span className={inv.balance > 0 ? "text-warn" : "text-success"}>{formatFCFA(inv.balance)}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 bg-surface-2 border border-border rounded-[10px]">
      <div className="text-[11px] text-ink-3">{label}</div>
      <div className="font-semibold text-[14px]">{value}</div>
    </div>
  );
}

function CheckItem({ checked, label }: { checked: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] border ${checked ? "border-success/30 bg-success/5" : "border-border bg-surface"}`}>
      <div className={`w-4.5 h-4.5 rounded-[5px] shrink-0 grid place-items-center border-[1.5px] ${checked ? "bg-success border-success text-white" : "bg-white border-border-strong"}`}>
        {checked && <Icon name="check" size={10} />}
      </div>
      <span className="text-[13px]">{label}</span>
    </div>
  );
}
