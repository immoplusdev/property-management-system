"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, toastPromise } from "../shared";
import { formatFCFA } from "../data";
import { useRefundReservation } from "@/lib/hooks/pms/useReservations";
import type { RefundPaymentMethod } from "@/lib/api/pms/reservations.actions";

export function RefundReservationPanel({ reservationId, reference, paid }: { reservationId: string; reference: string; paid: number }) {
  const router = useRouter();
  const refund = useRefundReservation();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<RefundPaymentMethod>("cash");
  const [reason, setReason] = useState("");
  const [providerReference, setProviderReference] = useState("");
  const [withFolioCredit, setWithFolioCredit] = useState(true);
  const valid = Number.isInteger(Number(amount)) && Number(amount) > 0 && reason.trim().length >= 3 && (method === "cash" || providerReference.trim().length > 0);

  async function submit() {
    if (!valid) return;
    if (!window.confirm(`Rembourser ${formatFCFA(Number(amount))} sur la réservation ${reference} ?`)) return;
    try {
      await toastPromise(refund.mutateAsync({ id: reservationId, payload: {
        amount: Number(amount), paymentMethod: method, reason: reason.trim(),
        reference: method === "cash" ? undefined : providerReference.trim(), withFolioCredit,
      } }), { loading: "Enregistrement du remboursement…", success: "Remboursement enregistré", error: error => (error as Error).message });
      setOpen(false); setAmount(""); setReason(""); setProviderReference("");
      router.refresh();
    } catch { /* toast déjà affiché */ }
  }

  if (!paid || paid <= 0) return null;
  return <div className="mt-4 p-4 border border-border rounded-xl">
    <div className="flex justify-between items-center gap-3"><div><strong className="text-sm">Remboursement</strong><div className="text-xs text-ink-3">Montant encaissé affiché : {formatFCFA(paid)}. L'API vérifie le plafond remboursable.</div></div><Button variant="ghost" size="sm" onClick={() => setOpen(value => !value)}>{open ? "Fermer" : "Rembourser"}</Button></div>
    {open && <div className="grid gap-3 mt-3">
      <div className="grid grid-cols-2 gap-3"><Input label="Montant (FCFA)" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} /><label className="grid gap-1 text-xs">Moyen de remboursement<select className="border border-border rounded-md p-2 bg-surface text-sm" value={method} onChange={e => setMethod(e.target.value as RefundPaymentMethod)}><option value="cash">Espèces</option><option value="wave">Wave</option><option value="orange_money">Orange Money</option><option value="mtn">MTN Money</option><option value="moov_money">Moov Money</option><option value="credit_card">Carte bancaire</option></select></label></div>
      <Input label="Motif" value={reason} onChange={e => setReason(e.target.value)} />
      {method !== "cash" && <Input label="Référence prestataire" value={providerReference} onChange={e => setProviderReference(e.target.value)} />}
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={withFolioCredit} onChange={e => setWithFolioCredit(e.target.checked)} /> Geste commercial ou litige : créer un avoir sur le folio. Décochez pour rendre seulement un trop-perçu.</label>
      <Button variant="primary" size="sm" disabled={!valid || refund.isPending} onClick={submit}>Confirmer le remboursement</Button>
    </div>}
  </div>;
}
