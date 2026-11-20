"use client";
import { PaymentMethodIcon } from "../PaymentMethodIcon";
import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, showToast, Button } from "../shared";
import { Pill } from "@/components/ui/Pill";
import { Modal } from "@/components/ui/Modal";
import { formatFCFA, formatDate, type Booking } from "../data";
import { useReservations } from "@/lib/hooks/pms/useReservations";
import { useRooms } from "@/lib/hooks/pms/useRooms";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { useWalkIn } from "@/lib/hooks/pms/useCheckIn";
import { checkAvailability } from "@/lib/api/pms/rooms.actions";
import { addStayPayment } from "@/lib/api/pms/folio.actions";
import { completeCheckIn, startCheckIn, updateCheckInIdentity } from "@/lib/api/pms/checkin.actions";
import { uploadFile } from "@/lib/api/files/files.client";
import { DashboardExportAction } from "@/components/pms/DashboardExportAction";
import { useHotel } from "@/lib/pms/HotelContext";
import { useReservationFolio } from "@/lib/hooks/pms/useFolio";

const STEPS_IN  = ["Identification","Identité","Paiement","Confirmation"];

type StepTarget = "checkin" | "walkin";

export function CheckIn() {
  const router = useRouter();
  const hotel = useHotel();
  const queryClient = useQueryClient();
  const [mode, setMode]     = useState<StepTarget>("checkin");
  const [step, setStep]     = useState(0);
  const [reservationSearch, setReservationSearch] = useState("");
  const [selectedReservation, setSelectedReservation] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wave" | "orange_money" | "mtn" | "cash">("cash");
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [checkInBusy, setCheckInBusy] = useState(false);
  const [checkInStarted, setCheckInStarted] = useState(false);
  const [identityBusy, setIdentityBusy] = useState(false);
  const [identityFrontId, setIdentityFrontId] = useState("");
  const [identityBackId, setIdentityBackId] = useState("");
  const [identityVerified, setIdentityVerified] = useState(false);
  const [checkInCompleted, setCheckInCompleted] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [serverBalanceDue, setServerBalanceDue] = useState<number | null>(null);
  const [paymentTransactionId, setPaymentTransactionId] = useState<string | null>(null);
  const [walkin, setWalkin] = useState(false);
  const [walkinForm, setWalkinForm] = useState({ firstName: "", lastName: "", phone: "", nationality: "CI", idCardNumber: "", checkOutDate: "", adults: "1", children: "0", amount: "0", paymentMethod: "cash" as "cash" | "orange_money" | "wave" | "mtn" | "moov_money", reference: "" });
  const [walkinRoomId, setWalkinRoomId] = useState("");
  const walkInMutation = useWalkIn();

  const STEPS = STEPS_IN;

  const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Abidjan", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const arrivalsQ   = useReservations({ status: "confirmed", checkInDate: todayStr, search: reservationSearch.trim() || undefined, limit: 100 });
  const departuresQ = useReservations({ status: "checked_in", checkOutDate: todayStr, limit: 100 });
  const roomsQ      = useRooms({ status: "free" });
  const folioQ      = useReservationFolio(selectedReservation?.id ?? "", !!selectedReservation);

  const arrivals = arrivalsQ.data?.data ?? [];
  const departures = departuresQ.data?.data ?? [];
  const availRooms = roomsQ.data?.rooms ?? [];
  const reservationTotal = folioQ.data?.folio?.totalTtc;
  const amountAlreadyPaid = folioQ.data?.payments?.confirmedTotal;
  const balanceDue = folioQ.data?.balanceDue;
  const currentBalanceDue = serverBalanceDue ?? balanceDue;
  const hasValidReservationAmount = typeof balanceDue === "number" && Number.isFinite(balanceDue) && balanceDue >= 0;
  const isPaymentConfirmed = paymentStatus === "already_paid" || (!!paymentStatus && ["confirmed", "succeeded", "success", "paid", "completed"].includes(paymentStatus.toLowerCase()));
  const isPaymentPending = !!paymentStatus && paymentStatus !== "already_paid" && !isPaymentConfirmed;

  async function handleStartCheckIn(booking: Booking) {
    if (checkInBusy) return;
    setCheckInBusy(true);
    try {
      const result = await startCheckIn(booking.id);
      if (!result.ok) throw new Error(result.error.message);
      setSelectedReservation(booking);
      setCheckInStarted(true);
      setIdentityFrontId("");
      setIdentityBackId("");
      setIdentityVerified(false);
      setPaymentStatus(null);
      setServerBalanceDue(null);
      setPaymentTransactionId(null);
      setCheckInCompleted(false);
      setStep(1);
      showToast("Check-in démarré. Vérifiez l'identité du client.", "check");
    } catch (error) {
      showToast((error as Error).message || "Impossible de démarrer le check-in.", "x");
    } finally {
      setCheckInBusy(false);
    }
  }

  async function uploadIdentity(file: File | undefined, side: "front" | "back") {
    if (!file) return;
    setIdentityBusy(true);
    try {
      const uploaded = await uploadFile(file);
      if (!uploaded?.id) throw new Error("Le serveur n'a pas retourné l'identifiant du document.");
      if (side === "front") setIdentityFrontId(uploaded.id);
      else setIdentityBackId(uploaded.id);
    } catch (error) {
      showToast((error as Error).message || "Échec du téléversement de la pièce d'identité.", "x");
    } finally {
      setIdentityBusy(false);
    }
  }

  async function handleVerifyIdentity() {
    if (!selectedReservation || !identityFrontId || !identityBackId || identityBusy) return;
    setIdentityBusy(true);
    try {
      const result = await updateCheckInIdentity(selectedReservation.id, {
        idCardFrontId: identityFrontId,
        idCardBackId: identityBackId,
        identityVerified: true,
      });
      if (!result.ok) throw new Error(result.error.message);
      if (!result.data.identityVerified) throw new Error("Le serveur n'a pas confirmé la vérification de l'identité.");
      setIdentityVerified(true);
      setStep(2);
      showToast("Identité validée par le serveur.", "check");
    } catch (error) {
      showToast((error as Error).message || "Impossible de valider l'identité.", "x");
    } finally {
      setIdentityBusy(false);
    }
  }

  async function handleCompleteCheckIn() {
    if (!selectedReservation || !checkInStarted || !identityVerified || !isPaymentConfirmed || checkInBusy) return;
    setCheckInBusy(true);
    try {
      const result = await completeCheckIn(selectedReservation.id);
      if (!result.ok) throw new Error(result.error.message);
      setCheckInCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      showToast("Check-in finalisé par le serveur.", "check");
    } catch (error) {
      showToast((error as Error).message || "Le check-in n'a pas pu être finalisé.", "x");
    } finally {
      setCheckInBusy(false);
    }
  }

  async function collectBalance() {
    if (!selectedReservation || paymentBusy) return;
    if (typeof balanceDue !== "number" || !Number.isFinite(balanceDue) || balanceDue < 0) return;
    if (balanceDue === 0) {
      setPaymentStatus("already_paid");
      setServerBalanceDue(0);
      setPaymentTransactionId(null);
      setStep(3);
      return;
    }
    setPaymentBusy(true);
    try {
      const result = await addStayPayment(selectedReservation.id, {
        amount: balanceDue,
        paymentMethod,
        description: `Solde encaissé au check-in — ${selectedReservation.ref}`,
      });
      if (!result.ok) throw new Error(result.error.message);
      if (typeof result.data.status !== "string" || !result.data.status) throw new Error("Réponse API invalide : statut du paiement absent.");
      if (typeof result.data.balanceDue !== "number" || !Number.isFinite(result.data.balanceDue)) throw new Error("Réponse API invalide : solde après paiement absent.");
      setPaymentStatus(result.data.status);
      setServerBalanceDue(result.data.balanceDue);
      setPaymentTransactionId(result.data.transactionId || null);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["folio", selectedReservation.id] });
      const pending = !["confirmed", "succeeded", "success", "paid", "completed"].includes(result.data.status.toLowerCase());
      setStep(3);
      showToast(
        pending ? "Paiement en attente de confirmation" : "Paiement enregistré",
        pending ? "info" : "check",
      );
    } catch (error) {
      showToast((error as Error).message || "Le paiement n’a pas pu être enregistré", "x");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function submitWalkIn() {
    if (!walkinRoomId || !walkinForm.firstName.trim() || !walkinForm.lastName.trim() || !walkinForm.phone.trim() || !walkinForm.idCardNumber.trim() || !walkinForm.checkOutDate) return;
    try {
      const checkInDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Abidjan", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const availability = await checkAvailability({ checkInDate, checkOutDate: walkinForm.checkOutDate, roomId: walkinRoomId });
      if (!availability.ok) throw new Error(availability.error.message);
      if (!availability.data.available) throw new Error(availability.data.reasons?.join(" · ") || "Cette chambre n’est pas disponible sur ces dates.");
      await walkInMutation.mutateAsync({
        roomId: walkinRoomId,
        checkOutDate: walkinForm.checkOutDate,
        adults: Number(walkinForm.adults),
        children: Number(walkinForm.children),
        guest: { firstName: walkinForm.firstName.trim(), lastName: walkinForm.lastName.trim(), phone: walkinForm.phone.trim(), nationality: walkinForm.nationality, idCardNumber: walkinForm.idCardNumber.trim() },
        payment: { amount: Number(walkinForm.amount), paymentMethod: walkinForm.paymentMethod, ...(walkinForm.reference.trim() ? { reference: walkinForm.reference.trim() } : {}) },
      });
      setWalkin(false);
      showToast("Walk-in enregistré. Le tarif et la durée sont calculés par l’hôtel.", "check");
    } catch (error) {
      showToast((error as Error).message || "Impossible d’enregistrer le walk-in", "x");
    }
  }

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Check-in / Check-out"
        sub="Gérez les arrivées, départs et walk-ins depuis cette interface unifiée"
        search={false}
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              {(["checkin","walkin"] as StepTarget[]).map(m => (
                <button
                  key={m}
                  className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium ${mode===m ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2"}`}
                  disabled={checkInStarted && !checkInCompleted}
                  onClick={() => { setMode(m); setStep(0); setSelectedReservation(null); setPaymentStatus(null); setCheckInStarted(false); setIdentityVerified(false); setCheckInCompleted(false); }}
                >
                  {m==="checkin" ? "Arrivées" : "Walk-in"}
                </button>
              ))}
              <button className="px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium text-ink-2" onClick={() => router.push(`/pms/${hotel}/checkout`)}>Départs</button>
            </div>
          </>
        }
      />

      <div className="grid gap-4.5" style={{ gridTemplateColumns: "1fr 380px" }}>
        {/* ── Left: stepper / walk-in ── */}
        <div>
          {mode === "walkin" && (
            <div className="bg-primary text-white rounded-[18px] p-5.5 mb-4 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="relative">
                <div className="font-bold text-[18px] tracking-[-0.02em]">Nouveau walk-in</div>
                <div className="text-[13px] opacity-85 mt-1 mb-4">Créez une réservation instantanée sans référence préalable</div>
                <Button variant="ghost" className="bg-white text-primary border-0 font-semibold" onClick={() => setWalkin(true)}>
                  <Icon name="plus" size={15} /> Créer walk-in
                </Button>
              </div>
            </div>
          )}

          {mode !== "walkin" && (
            <div className="bg-surface border border-border rounded-[18px] p-5.5 mb-4">
              {/* Step bar */}
              <div className="flex items-center gap-0 mb-6">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <button
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => i <= step && (!checkInStarted || i > 0) && setStep(i)}
                    >
                      <div className={`w-7.5 h-7.5 rounded-full grid place-items-center text-[12px] font-bold shrink-0 transition-colors ${i < step ? "bg-success text-white" : i === step ? "bg-primary text-white" : "bg-surface-2 text-ink-3"}`}>
                        {i < step ? <Icon name="check" size={13} /> : i + 1}
                      </div>
                      <span className={`text-[12.5px] font-medium whitespace-nowrap ${i === step ? "text-ink" : "text-ink-3"}`}>{s}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-2 min-w-4 ${i < step ? "bg-success" : "bg-border"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Check-in steps */}
              {mode === "checkin" && (
                <>
                  {step === 0 && (
                    <div>
                      <SectionHead icon="user" title="Identification du client" sub="Entrez le nom ou la référence de réservation" />
                      <div className="h-12 bg-surface border border-border rounded-[10px] px-4 flex items-center gap-3 mt-4 focus-within:border-primary">
                        <Icon name="eye" size={16} color="var(--color-ink-3)" />
                        <input className="flex-1 text-[14px] outline-none bg-transparent placeholder:text-ink-4" placeholder="Nom, prénom ou référence RES-2026-…" value={reservationSearch} onChange={event => setReservationSearch(event.target.value)} />
                      </div>
                      <div className="mt-3.5 grid gap-2">
                        {arrivalsQ.isError && <div role="alert" className="text-[12px] text-danger">Impossible de charger les arrivées : {(arrivalsQ.error as Error).message}</div>}
                        {arrivalsQ.isLoading && <div className="py-5 text-center text-[13px] text-ink-3">Chargement des arrivées…</div>}
                        {arrivals.map(b => (
                          <button type="button" key={b.id} disabled={checkInBusy} className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary cursor-pointer transition-all duration-120 disabled:opacity-60" onClick={() => handleStartCheckIn(b)}>
                            <div className="w-9.5 h-9.5 rounded-full inline-grid place-items-center text-white font-semibold text-[13px] shrink-0"
                              style={{ background: AV_COLORS[b.guest.charCodeAt(0) % 8] }}>
                              {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0,2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-[13.5px]">{b.guest}</div>
                              <div className="text-[11.5px] text-ink-3">{b.ref} · {b.roomType} · {b.nights} nuit{b.nights>1?"s":""}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[12.5px] font-semibold">{formatFCFA(b.amount)}</div>
                              <Pill kind={b.paid >= b.amount ? "success" : "warn"} dot>{b.paid >= b.amount ? "Payé" : "Acompte"}</Pill>
                            </div>
                          </button>
                        ))}
                        {!arrivalsQ.isLoading && !arrivalsQ.isError && arrivals.length === 0 && <div className="py-5 text-center text-[13px] text-ink-3">Aucune réservation confirmée correspondante.</div>}
                      </div>
                    </div>
                  )}
                  {step === 1 && (
                    <div>
                      <SectionHead icon="user" title="Vérification de l'identité" sub="Téléversez le recto et le verso de la pièce, puis confirmez leur vérification" />
                      <div className="grid gap-3 mt-4">
                        <label className="grid gap-1 text-[12px] text-ink-2">Recto de la pièce d'identité
                          <input type="file" accept="image/*,application/pdf" disabled={identityBusy} onChange={event => uploadIdentity(event.target.files?.[0], "front")} />
                          <span className="text-[11px] text-ink-3">{identityFrontId ? "Document envoyé" : "Document non envoyé"}</span>
                        </label>
                        <label className="grid gap-1 text-[12px] text-ink-2">Verso de la pièce d'identité
                          <input type="file" accept="image/*,application/pdf" disabled={identityBusy} onChange={event => uploadIdentity(event.target.files?.[0], "back")} />
                          <span className="text-[11px] text-ink-3">{identityBackId ? "Document envoyé" : "Document non envoyé"}</span>
                        </label>
                      </div>
                      <div className="flex justify-between mt-5.5">
                        <Button variant="ghost" onClick={() => setStep(0)}><Icon name="chevronLeft" size={14} /> Retour</Button>
                        <Button variant="primary" disabled={identityBusy || !identityFrontId || !identityBackId} onClick={handleVerifyIdentity}>
                          {identityBusy ? "Validation…" : "Valider l'identité"} <Icon name="chevronRight" size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <div>
                      <SectionHead icon="creditCard" title="Paiement & solde" sub="Vérifiez et encaissez le solde restant" />
                      <div className="mt-4 grid gap-2.5">
                        {[
                          { label:"Montant total",     value:formatFCFA(reservationTotal), color:"var(--color-ink)"     },
                          { label:"Déjà versé",        value:formatFCFA(amountAlreadyPaid), color:"var(--color-success)" },
                        { label:"Solde à encaisser", value:formatFCFA(balanceDue), color:"var(--color-warn)"    },
                        ].map(r => (
                          <div key={r.label} className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
                            <span className="text-ink-2 text-[13px]">{r.label}</span>
                            <strong style={{ color: r.color }}>{r.value}</strong>
                          </div>
                        ))}
                      </div>
                      {folioQ.isError && <div role="alert" className="mt-2 text-[12px] text-danger">Impossible de charger le folio : {(folioQ.error as Error).message}</div>}
                      <div className="mt-4">
                        <div className="text-[12px] font-semibold mb-2.5 text-ink-2">Mode de paiement du solde</div>
                        <div className="flex gap-2 flex-wrap">
                          {(["wave","orange_money","mtn","cash"] as const).map(method => {
                            const labels = { wave: "Wave", orange_money: "Orange Money", mtn: "MTN Money", cash: "Espèces" };
                            const iconMethod = method === "orange_money" ? "om" : method === "mtn" ? "mtn" : method;
                            return (
                              <button type="button" key={method} aria-pressed={paymentMethod === method} onClick={() => setPaymentMethod(method)} className={`flex items-center gap-2 px-3 py-2 rounded-[9px] border transition-all ${paymentMethod === method ? "border-primary bg-primary-50" : "border-border hover:border-primary hover:bg-primary-50"}`}>
                                <PaymentMethodIcon method={iconMethod} size="sm" />
                                <span className="text-[12.5px]">{labels[method]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between mt-5.5">
                        <Button variant="ghost" onClick={() => setStep(1)}><Icon name="chevronLeft" size={14} /> Retour</Button>
                        <Button variant="primary" disabled={!selectedReservation || !identityVerified || !hasValidReservationAmount || folioQ.isLoading || folioQ.isError || paymentBusy} onClick={balanceDue !== 0 ? collectBalance : () => { setPaymentStatus("already_paid"); setStep(3); }}>
                          {paymentBusy ? "Enregistrement…" : balanceDue !== 0 ? "Encaisser & Continuer" : "Continuer sans solde"} <Icon name="chevronRight" size={14} />
                        </Button>
                      </div>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="text-center py-8">
                      <div className={`w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 ${checkInCompleted ? "bg-success/10" : isPaymentPending ? "bg-warn/10" : "bg-surface-2"}`}>
                        <Icon name={checkInCompleted ? "check" : isPaymentPending ? "clock" : "user"} size={32} color={checkInCompleted ? "var(--color-success)" : isPaymentPending ? "var(--color-warn)" : "var(--color-ink-3)"} />
                      </div>
                      <div className="text-[22px] font-bold tracking-[-0.02em] mb-2">
                        {checkInCompleted ? "Check-in confirmé" : isPaymentPending ? "Paiement en attente" : "Prêt à finaliser le check-in"}
                      </div>
                      <div className="text-[14px] text-ink-2">{selectedReservation?.ref} · Solde : {formatFCFA(currentBalanceDue)}</div>
                      {paymentTransactionId && <div className="text-[11px] text-ink-3 mt-1">Transaction : {paymentTransactionId}</div>}
                      <div className="text-[12px] text-ink-3 mt-3 mb-5.5">{checkInCompleted ? "Le serveur a confirmé la finalisation du check-in." : isPaymentPending ? "Le paiement doit être confirmé par le prestataire avant la finalisation." : "L'identité est validée. Finalisez le check-in pour enregistrer l'arrivée."}</div>
                      <div className="flex gap-2 justify-center">
                        {!checkInCompleted ? <Button variant="primary" disabled={!isPaymentConfirmed || currentBalanceDue !== 0 || checkInBusy} onClick={handleCompleteCheckIn}>{checkInBusy ? "Finalisation…" : "Finaliser le check-in"}</Button> :
                          <Button variant="primary" onClick={() => { setStep(0); setSelectedReservation(null); setPaymentStatus(null); setPaymentTransactionId(null); setCheckInStarted(false); setIdentityVerified(false); setCheckInCompleted(false); }}>Nouveau check-in</Button>}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* Side-by-side arrivals/departures for walkin view */}
          {mode === "walkin" && (
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-surface border border-border rounded-[18px] p-5.5">
                <SectionHead icon="arrowRight" title="Arrivées du jour" sub={`${arrivals.length} réservations`} />
                {arrivals.map(b => (
                  <ArrivalRow key={b.id} b={b} color={AV_COLORS[b.guest.charCodeAt(0) % 8]} />
                ))}
              </div>
              <div className="bg-surface border border-border rounded-[18px] p-5.5">
                <SectionHead icon="arrowLeft" title="Départs du jour" sub={`${departures.length} réservations`} />
                {departures.map(b => (
                  <ArrivalRow key={b.id} b={b} color={AV_COLORS[b.guest.charCodeAt(0) % 8]} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right sidebar ── */}
        <div className="grid gap-3.5 content-start">
          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead icon="barChart" title="Aujourd'hui" sub="Vue d'ensemble" />
            <div className="grid gap-2.5 mt-1">
              {[
                { label:"Arrivées prévues",     value:arrivals.length,   bg:"var(--color-primary-50)", cl:"var(--color-primary)" },
                { label:"Départs prévus",       value:departures.length, bg:"var(--color-warn-bg)",    cl:"var(--color-warn)"    },
                { label:"Chambres disponibles", value:availRooms.length, bg:"var(--color-success-bg)", cl:"var(--color-success)" },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between px-3.5 py-3 rounded-[10px]" style={{ background: s.bg }}>
                  <span className="text-[12.5px] font-medium" style={{ color: s.cl }}>{s.label}</span>
                  <strong className="text-[18px] tracking-[-0.02em]" style={{ color: s.cl }}>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead icon="list" title="Départs prévus" sub={`${departures.length} départs à traiter`} />
            {departuresQ.isError ? <div role="alert" className="text-[12px] text-danger">Impossible de charger les départs : {(departuresQ.error as Error).message}</div> : departures.slice(0, 3).map(b => (
              <div key={b.id} className="flex items-center gap-2.5 py-2.5 border-b border-border-soft last:border-b-0">
                <div className="w-1.75 h-1.75 rounded-full shrink-0" style={{ background: "var(--color-warn)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] font-medium leading-tight truncate">{b.guest}</div>
                  <div className="text-[11px] text-ink-3">Ch. {b.room || "—"} · {formatDate(b.checkout)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead icon="sparkles" title="Raccourcis" />
            <div className="grid gap-2">
              <DashboardExportAction />
            </div>
          </div>
        </div>
      </div>

      {/* Walk-in modal */}
      {walkin && (
        <Modal
          open
          onClose={() => setWalkin(false)}
          title="Nouveau Walk-in"
          footer={
            <>
              <Button variant="ghost" onClick={() => setWalkin(false)}>Annuler</Button>
              <Button variant="primary" disabled={walkInMutation.isPending || !walkinRoomId || !walkinForm.firstName || !walkinForm.lastName || !walkinForm.phone || !walkinForm.idCardNumber || !walkinForm.checkOutDate} onClick={submitWalkIn}>
                <Icon name="check" size={14} /> {walkInMutation.isPending ? "Enregistrement…" : "Enregistrer le séjour"}
              </Button>
            </>
          }
        >
          <div className="grid gap-3">
            {[
              { label:"Prénom", key:"firstName", ph:"Amadou", type:"text" },
              { label:"Nom", key:"lastName", ph:"Bakayoko", type:"text" },
              { label:"Téléphone", key:"phone", ph:"+225 07 XX XX XX XX", type:"tel" },
              { label:"Nationalité (code pays)", key:"nationality", ph:"CI", type:"text" },
              { label:"Numéro de pièce d’identité", key:"idCardNumber", ph:"CI-00928172", type:"text" },
              { label:"Date de départ", key:"checkOutDate", ph:"", type:"date" },
              { label:"Adultes", key:"adults", ph:"1", type:"number" },
              { label:"Enfants", key:"children", ph:"0", type:"number" },
              { label:"Acompte reçu (XOF)", key:"amount", ph:"0", type:"number" },
              { label:"Référence de paiement (facultative)", key:"reference", ph:"Référence PSP", type:"text" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">{f.label}</label>
                <input type={f.type} min={f.type === "number" ? 0 : undefined} value={walkinForm[f.key as keyof typeof walkinForm]} placeholder={f.ph} onChange={e => setWalkinForm(v => ({ ...v, [f.key]: e.target.value }))} className="w-full h-10.5 bg-surface border border-border rounded-[9px] px-3 text-[13.5px] text-ink outline-none focus:border-primary placeholder:text-ink-4" />
              </div>
            ))}
            <div>
              <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">Chambre</label>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {availRooms.slice(0, 8).map(r => (
                  <button type="button" key={r.id ?? r.num} onClick={() => r.id && setWalkinRoomId(r.id)} className={`px-2.5 py-2 rounded-[9px] border text-[12.5px] font-semibold ${walkinRoomId === r.id ? "border-primary bg-primary-50 text-primary" : "border-dashed border-border hover:border-primary hover:text-primary"}`}>{r.num} · {r.type}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-ink-2 mb-1.5 block">Paiement</label>
              <div className="flex gap-2 flex-wrap">
                {(["wave","om","mtn","cash"] as const).map(method => {
                  const labels = { wave: "Wave", om: "Orange Money", mtn: "MTN Money", cash: "Espèces" };
                  return (
                    <button type="button" key={method} onClick={() => setWalkinForm(v => ({ ...v, paymentMethod: method === "om" ? "orange_money" : method === "mtn" ? "mtn" : method }))} className={`flex items-center gap-2 px-3 py-1.5 rounded-[9px] border transition-all ${walkinForm.paymentMethod === (method === "om" ? "orange_money" : method === "mtn" ? "mtn" : method) ? "border-primary bg-primary-50" : "border-border hover:border-primary hover:bg-primary-50"}`}>
                      <PaymentMethodIcon method={method} size="sm" />
                      <span className="text-[12.5px]">{labels[method]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[11.5px] text-ink-3">Le tarif, le nombre de nuits et le solde sont calculés par le serveur. Les paiements Mobile Money restent en attente de confirmation du fournisseur.</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ArrivalRow({ b, color }: { b: Booking; color: string }) {
  return (
    <div className="flex items-center gap-2.5 py-2.5 border-b border-border-soft last:border-b-0">
      <div className="w-7.5 h-7.5 rounded-full inline-grid place-items-center text-white font-semibold text-[11px] shrink-0"
        style={{ background: color }}>
        {b.guest.split(" ").map((x: string) => x[0]).join("").slice(0,2)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] font-medium leading-tight truncate">{b.guest}</div>
        <div className="text-[11px] text-ink-3">{b.roomType} · {b.nights} nuit{b.nights>1?"s":""}</div>
      </div>
      <Pill kind={b.paid >= b.amount ? "success" : "warn"} dot>
        {b.paid >= b.amount ? "Soldé" : "Solde"}
      </Pill>
    </div>
  );
}
