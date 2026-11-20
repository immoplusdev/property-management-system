"use client";
import React, { useState } from "react";
import { Button, Input, SectionHead, Skeleton, toastPromise } from "../shared";
import { formatFCFA, formatDate } from "../data";
import { useCashClosures, useCloseCashDesk, useCreateCashAdjustment, useReviewCashAdjustment } from "@/lib/hooks/pms/useCashDesk";

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Abidjan", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

export function CashDeskSection() {
  const closuresQ = useCashClosures();
  const close = useCloseCashDesk();
  const createAdjustment = useCreateCashAdjustment();
  const reviewAdjustment = useReviewCashAdjustment();
  const [date, setDate] = useState(today);
  const [countedCash, setCountedCash] = useState("");
  const [notes, setNotes] = useState("");
  const [adjustmentDate, setAdjustmentDate] = useState("");
  const [adjustmentAmount, setAdjustmentAmount] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const closures = closuresQ.data ?? [];
  const isClosed = closures.some(closure => closure.date === date);

  async function submitClose() {
    const amount = Number(countedCash);
    if (!Number.isInteger(amount) || amount < 0 || !date || isClosed) return;
    if (!window.confirm(`Clôturer la caisse du ${formatDate(date)} avec ${formatFCFA(amount)} comptés ?`)) return;
    try {
      await toastPromise(close.mutateAsync({ date, countedCash: amount, notes: notes.trim() || undefined }), {
        loading: "Clôture de la caisse…", success: "Caisse clôturée", error: error => (error as Error).message,
      });
      setCountedCash(""); setNotes("");
    } catch { /* toast déjà affiché */ }
  }

  async function submitAdjustment() {
    const amount = Number(adjustmentAmount);
    if (!Number.isInteger(amount) || amount === 0 || adjustmentReason.trim().length < 5 || !adjustmentDate) return;
    try {
      await toastPromise(createAdjustment.mutateAsync({ date: adjustmentDate, amount, reason: adjustmentReason.trim() }), {
        loading: "Enregistrement de la correction…", success: "Correction soumise à validation", error: error => (error as Error).message,
      });
      setAdjustmentAmount(""); setAdjustmentReason("");
    } catch { /* toast déjà affiché */ }
  }

  async function review(adjustmentId: string, decision: "validate" | "reject") {
    if (!window.confirm(decision === "validate" ? "Valider cette correction de caisse ?" : "Rejeter cette correction de caisse ?")) return;
    try {
      await toastPromise(reviewAdjustment.mutateAsync({ adjustmentId, decision }), {
        loading: "Traitement de la correction…", success: "Correction traitée", error: error => (error as Error).message,
      });
    } catch { /* toast déjà affiché */ }
  }

  return <section className="mt-6 bg-surface border border-border rounded-[18px] p-5.5">
    <SectionHead icon="moneyBill" title="Caisse" sub="Clôtures et corrections d'espèces" />
    {closuresQ.isError && <div role="alert" className="mt-3 text-sm text-danger">{(closuresQ.error as Error).message}</div>}
    <div className="grid grid-cols-3 gap-3 mt-4">
      <Input label="Date de clôture" type="date" max={today()} value={date} onChange={e => setDate(e.target.value)} />
      <Input label="Espèces comptées (FCFA)" type="number" min="0" value={countedCash} onChange={e => setCountedCash(e.target.value)} />
      <Input label="Notes (facultatif)" value={notes} onChange={e => setNotes(e.target.value)} />
    </div>
    <Button variant="primary" size="sm" className="mt-3" disabled={close.isPending || isClosed || !date || !Number.isInteger(Number(countedCash)) || countedCash === "" || Number(countedCash) < 0} onClick={submitClose}>{isClosed ? "Journée déjà clôturée" : "Clôturer la journée"}</Button>

    <h3 className="font-semibold text-sm mt-7 mb-2">Clôtures récentes</h3>
    {closuresQ.isLoading ? <Skeleton className="h-32" /> : closures.length ? <div className="grid gap-2">{closures.map(closure => <div key={closure.closureId} className="p-4 border border-border rounded-xl text-sm">
      <div className="flex justify-between gap-3"><strong>{formatDate(closure.date)}</strong><span>Attendu {formatFCFA(closure.expectedCash)} · compté {formatFCFA(closure.countedCash)} · écart {formatFCFA(closure.adjustedDiscrepancy)}</span></div>
      {closure.corrections?.length > 0 && <div className="grid gap-1 mt-3">{closure.corrections.map(correction => <div key={correction.adjustmentId} className="flex items-center justify-between gap-3 text-xs text-ink-2"><span>{correction.reason} · {formatFCFA(correction.amount)} · {correction.status}</span>{correction.status === "pending" && <div className="flex gap-2"><button className="text-primary underline" disabled={reviewAdjustment.isPending} onClick={() => review(correction.adjustmentId, "validate")}>Valider</button><button className="text-danger underline" disabled={reviewAdjustment.isPending} onClick={() => review(correction.adjustmentId, "reject")}>Rejeter</button></div>}</div>)}</div>}
      <button className="mt-2 text-xs text-primary underline" onClick={() => setAdjustmentDate(closure.date)}>Corriger cette journée</button>
    </div>)}</div> : <p className="text-sm text-ink-3">Aucune clôture enregistrée.</p>}

    {adjustmentDate && <div className="mt-5 p-4 bg-surface-2 border border-border rounded-xl">
      <h3 className="font-semibold text-sm mb-2">Correction du {formatDate(adjustmentDate)}</h3>
      <div className="grid grid-cols-2 gap-3"><Input label="Montant signé (FCFA)" type="number" value={adjustmentAmount} onChange={e => setAdjustmentAmount(e.target.value)} /><Input label="Motif" value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} /></div>
      <div className="flex gap-2 mt-3"><Button variant="primary" size="sm" disabled={createAdjustment.isPending || !Number.isInteger(Number(adjustmentAmount)) || Number(adjustmentAmount) === 0 || adjustmentReason.trim().length < 5} onClick={submitAdjustment}>Soumettre la correction</Button><Button variant="ghost" size="sm" onClick={() => setAdjustmentDate("")}>Annuler</Button></div>
    </div>}
  </section>;
}
