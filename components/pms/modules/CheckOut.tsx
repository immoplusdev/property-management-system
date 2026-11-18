"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, toastPromise, Button, Skeleton, showToast } from "../shared";
import { Pill } from "@/components/ui/Pill";
import { formatFCFA, formatDate, type Booking } from "../data";
import { useReservations } from "@/lib/hooks/pms/useReservations";
import { useCheckOutInvoice, usePerformCheckOut } from "@/lib/hooks/pms/useCheckOut";
import { emailCheckOutInvoice, type Invoice } from "@/lib/api/pms/checkout.actions";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { getInvoicePdf } from "@/lib/api/pms/folio.actions";
import { useAddFolioItem, useReservationFolio } from "@/lib/hooks/pms/useFolio";
import { Input } from "@/components/ui/Input";

const STEPS = ["Vérification", "Règlement", "Départ"];

const initials = (name: string) => name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
const avatarBg  = (name: string) => AV_COLORS[name.charCodeAt(0) % AV_COLORS.length];

export function CheckOut() {
  const [step,     setStep]     = useState(0);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [verifications, setVerifications] = useState({ roomInspected: false, keyReturned: false, valuablesChecked: false });
  const [notes, setNotes] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [extraForm, setExtraForm] = useState({ label: "", category: "", quantity: "1", unitPriceHt: "", tvaRate: "" });

  const checkedInQ = useReservations({ status: "checked_in", limit: 100 });
  const selectedInvoiceQ = useCheckOutInvoice(selected?.id ?? "", !!selected);
  const folioQ = useReservationFolio(selected?.id ?? "", !!selected);
  const addFolioItem = useAddFolioItem();
  const invoiceBalance = selectedInvoiceQ.data?.balanceDue ?? selectedInvoiceQ.data?.balance;
  const performCO = usePerformCheckOut();
  
  const allCheckedIn = checkedInQ.data?.data ?? [];
  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Abidjan", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  
  const departures = allCheckedIn.filter(b => b.checkout.startsWith(todayStr));
  const checkedIn  = allCheckedIn.filter(b => !b.checkout.startsWith(todayStr));

  function openCheckout(b: Booking) {
    setSelected(b);
    setStep(0);
    setVerifications({ roomInspected: false, keyReturned: false, valuablesChecked: false });
    setNotes("");
  }

  async function handleComplete() {
    if (!selected) return;
    try {
      await toastPromise(performCO.mutateAsync({ reservationId: selected.id, payload: { verifications, notes } }), {
        loading: "Check-out en cours…",
        success: `Check-out ${selected.guest} confirmé`,
        error: (e) => (e as Error)?.message || "Erreur lors du check-out",
      });
      setSelected(null);
    } catch { /* toast déjà affiché */ }
  }

  async function handleInvoicePdf() {
    if (!selected) return;
    const tab = window.open("about:blank", "_blank", "noopener,noreferrer");
    const result = await getInvoicePdf(selected.id);
    if (result.ok && result.data.status === "ready" && result.data.downloadUrl) {
      if (tab) tab.location.href = result.data.downloadUrl;
      else window.location.href = result.data.downloadUrl;
    } else {
      tab?.close();
      showToast(result.ok ? "La facture PDF est en cours de génération." : result.error.message, result.ok ? "info" : "x");
    }
  }

  async function handleEmailInvoice() {
    if (!selected || emailBusy) return;
    setEmailBusy(true);
    try {
      const result = await emailCheckOutInvoice(selected.id);
      if (!result.ok) throw new Error(result.error.message);
      if (result.data.status !== "sent") throw new Error("Le serveur n'a pas confirmé l'envoi de la facture.");
      showToast("Facture envoyée à l'adresse email enregistrée pour le client.", "check");
    } catch (error) {
      showToast((error as Error).message || "Impossible d'envoyer la facture par email.", "x");
    } finally {
      setEmailBusy(false);
    }
  }

  async function handleAddFolioItem() {
    if (!selected || !extraForm.label.trim()) return;
    const quantity = Number(extraForm.quantity);
    const unitPriceHt = Number(extraForm.unitPriceHt);
    const tvaRate = Number(extraForm.tvaRate);
    if (![quantity, unitPriceHt, tvaRate].every(Number.isFinite) || quantity <= 0 || unitPriceHt < 0 || tvaRate < 0) {
      showToast("Vérifiez la quantité, le prix HT et le taux de TVA.", "x");
      return;
    }
    try {
      await toastPromise(addFolioItem.mutateAsync({
        reservationId: selected.id,
        payload: {
          type: "extra",
          category: extraForm.category.trim() || undefined,
          label: extraForm.label.trim(),
          quantity,
          unitPriceHt,
          tvaRate,
          occurredAt: new Date().toISOString(),
        },
      }), {
        loading: "Ajout de la ligne au folio…",
        success: "Extra ajouté au folio par le serveur",
        error: error => (error as Error)?.message || "Impossible d'ajouter l'extra",
      });
      setExtraOpen(false);
      setExtraForm({ label: "", category: "", quantity: "1", unitPriceHt: "", tvaRate: "" });
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
        actions={null}
      />

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
        {/* Left column: departures + checked-in */}
        <div>
          <SectionHead icon="arrowRight" title="Départs du jour" sub={`${departures.length} chambres à libérer`} />
          {checkedInQ.isLoading ? (
            <div className="grid gap-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : checkedInQ.isError ? (
            <div role="alert" className="py-8 text-center text-[13px] text-danger">Impossible de charger les départs : {(checkedInQ.error as Error).message}</div>
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
                    <CheckItem checked={!selectedInvoiceQ.isLoading && !selectedInvoiceQ.isError && invoiceBalance === 0} label="Solde soldé selon la facture API" />
                    <CheckItem checked={!selectedInvoiceQ.isLoading && invoiceBalance === 0} label="Solde soldé" />
                    <CheckItem checked={verifications.valuablesChecked} label="Objets de valeur vérifiés" />
                  </div>
                  <p className="text-[11px] text-ink-3 mt-2">Le solde doit être nul et les trois contrôles de départ doivent être attestés avant la clôture.</p>

                  <Button variant="primary" size="sm" className="w-full mt-4" disabled={selectedInvoiceQ.isLoading || selectedInvoiceQ.isError || invoiceBalance === undefined} onClick={() => setStep(1)}>
                    Passer au règlement <Icon name="arrowRight" size={14} />
                  </Button>
                </div>
              )}

              {/* Step 1 — Règlement */}
              {step === 1 && (
                <div>
                  <InvoicePanel invoice={selectedInvoiceQ.data} loading={selectedInvoiceQ.isLoading} error={selectedInvoiceQ.error} />
                  <div className="mt-3 rounded-[12px] border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-[13px]">Lignes du folio</strong>
                      <Button variant="soft" size="sm" onClick={() => setExtraOpen(value => !value)}>Ajouter un extra</Button>
                    </div>
                    {folioQ.isLoading ? <Skeleton className="h-10 mt-3" /> : folioQ.isError ? (
                      <div role="alert" className="mt-3 text-[12px] text-danger">Impossible de charger le folio : {(folioQ.error as Error).message}</div>
                    ) : (
                      <div className="mt-2 grid gap-2">
                        {folioQ.data?.items.length ? folioQ.data.items.map(item => (
                          <div key={item.id} className="flex justify-between gap-3 text-[12px]">
                            <span>{item.label} × {item.quantity}</span><strong>{formatFCFA(item.amountTtc)}</strong>
                          </div>
                        )) : <div className="text-[12px] text-ink-3">Aucun extra enregistré.</div>}
                        <div className="flex justify-between border-t border-border pt-2 text-[12px] font-semibold"><span>Solde du folio (API)</span><span>{formatFCFA(folioQ.data?.balanceDue)}</span></div>
                      </div>
                    )}
                    {extraOpen && <div className="mt-3 grid gap-2">
                      <Input label="Description" value={extraForm.label} onChange={event => setExtraForm(form => ({ ...form, label: event.target.value }))} />
                      <Input label="Catégorie (facultative)" value={extraForm.category} onChange={event => setExtraForm(form => ({ ...form, category: event.target.value }))} />
                      <div className="grid grid-cols-3 gap-2">
                        <Input label="Quantité" type="number" min="1" value={extraForm.quantity} onChange={event => setExtraForm(form => ({ ...form, quantity: event.target.value }))} />
                        <Input label="Prix unitaire HT" type="number" min="0" value={extraForm.unitPriceHt} onChange={event => setExtraForm(form => ({ ...form, unitPriceHt: event.target.value }))} />
                        <Input label="TVA (%)" type="number" min="0" value={extraForm.tvaRate} onChange={event => setExtraForm(form => ({ ...form, tvaRate: event.target.value }))} />
                      </div>
                      <Button variant="primary" size="sm" disabled={addFolioItem.isPending || folioQ.isError} onClick={handleAddFolioItem}>{addFolioItem.isPending ? "Ajout…" : "Ajouter au folio"}</Button>
                    </div>}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="ghost" size="sm" onClick={handleInvoicePdf}><Icon name="download" size={13} /> Facture PDF</Button>
                    <Button variant="primary" size="sm" disabled={selectedInvoiceQ.isLoading || selectedInvoiceQ.isError || invoiceBalance !== 0} onClick={() => setStep(2)}>
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
                    {([
                      ["roomInspected", "Chambre inspectée"],
                      ["keyReturned", "Clé / carte rendue"],
                      ["valuablesChecked", "Objets de valeur vérifiés"],
                    ] as const).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2.5 px-3 py-2.5 border border-border rounded-[9px] text-[12.5px] cursor-pointer">
                        <input type="checkbox" checked={verifications[key]} onChange={e => setVerifications(v => ({ ...v, [key]: e.target.checked }))} />{label}
                      </label>
                    ))}
                    <label className="grid gap-1 text-[12px] text-ink-2">Notes de départ<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-surface border border-border rounded-[9px] p-2.5 text-[13px]" placeholder="Observations" /></label>
                  </div>

                  <div className="grid gap-2">
                    <Button
                      variant="primary" size="sm" className="w-full"
                      disabled={performCO.isPending || selectedInvoiceQ.isLoading || selectedInvoiceQ.isError || invoiceBalance !== 0 || !verifications.roomInspected || !verifications.keyReturned || !verifications.valuablesChecked}
                      onClick={handleComplete}
                    >
                      <Icon name="check" size={14} /> {performCO.isPending ? "Traitement…" : "Confirmer le check-out"}
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full" disabled={!selected || performCO.isPending || emailBusy} onClick={handleEmailInvoice}>
                      <Icon name="send" size={13} /> {emailBusy ? "Envoi…" : "Envoyer facture par email"}
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

function InvoicePanel({ invoice, loading, error }: { invoice?: Invoice; loading: boolean; error: Error | null }) {
  if (loading) return <div className="grid gap-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>;
  if (error) return <div role="alert" className="rounded-[12px] bg-danger/5 p-4 text-sm text-danger">Impossible de charger la facture : {error.message}</div>;
  if (!invoice) return <div role="alert" className="rounded-[12px] bg-warn/5 p-4 text-sm text-warn">La réponse de facturation est absente.</div>;
  return <InvoiceFromAPI invoice={invoice} />;
}

function InvoiceFromAPI({ invoice: inv }: { invoice: Invoice }) {
  if (!inv.guest || !inv.room || !inv.checkInDate || !inv.checkOutDate) {
    const balance = inv.balanceDue ?? inv.balance;
    return <div className="bg-surface-2 rounded-[12px] p-4 grid gap-2 text-[13px]">
      <div className="flex justify-between"><span>Total HT</span><strong>{formatFCFA(inv.folio?.totalHt)}</strong></div>
      <div className="flex justify-between"><span>Taxes</span><strong>{formatFCFA(inv.folio?.taxTotal)}</strong></div>
      <div className="flex justify-between"><span>Total TTC</span><strong>{formatFCFA(inv.folio?.totalTtc)}</strong></div>
      <div className="flex justify-between"><span>Encaissements confirmés</span><strong>{formatFCFA(inv.payments?.confirmedTotal)}</strong></div>
      <div className="h-px bg-border" />
      <div className="flex justify-between font-bold"><span>Solde à régler</span><strong className={balance > 0 ? "text-warn" : "text-success"}>{formatFCFA(balance)}</strong></div>
      <div className="text-[11px] text-ink-3">Facture : {inv.invoiceStatus ?? "Inconnu"}</div>
    </div>;
  }
  const guestName = `${inv.guest.firstName} ${inv.guest.lastName}`;
  const nights = inv.nights;
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
          <span className="text-ink-2">{nights ?? "—"} nuit{(nights ?? 0) > 1 ? "s" : ""} · {inv.room.typeName}</span>
          <span className="font-semibold">{formatFCFA(inv.roomTotal)}</span>
        </div>
        {(inv.extras ?? []).map((extra, i) => (
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
          <span className={(inv.balance ?? inv.balanceDue ?? 0) > 0 ? "text-warn" : "text-success"}>{formatFCFA(inv.balance ?? inv.balanceDue)}</span>
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
