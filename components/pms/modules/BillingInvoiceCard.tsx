"use client";
import React, { useState } from "react";
import { Button, Input, toastPromise } from "../shared";
import { formatDate, formatFCFA } from "../data";
import type { BillingInvoice } from "@/lib/api/pms/billing.actions";
import { useBillingInvoiceDetail, useDisputeBillingInvoice, usePayBillingInvoice } from "@/lib/hooks/pms/useBilling";

export function BillingInvoiceCard({ invoice }: { invoice: BillingInvoice }) {
  const [mode, setMode] = useState<"none" | "pay" | "dispute">("none");
  const [provider, setProvider] = useState<"wave" | "orange_money" | "mtn" | "moov_money">("wave");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailQ = useBillingInvoiceDetail(invoice.invoiceId, detailsOpen);
  const pay = usePayBillingInvoice();
  const dispute = useDisputeBillingInvoice();
  const canAct = invoice.amountDue > 0 && !["paid", "disputed"].includes(invoice.status);

  async function submitPay() {
    if (!/^\+?\d{8,15}$/.test(phone)) return;
    if (!window.confirm(`Demander le paiement de ${formatFCFA(invoice.amountDue)} pour la facture ${invoice.number} sur ${phone} ?`)) return;
    try {
      const result = await toastPromise(pay.mutateAsync({ invoiceId: invoice.invoiceId, provider, payerPhone: phone }), {
        loading: "Initialisation du paiement…", success: "Paiement initié. Confirmez sur votre téléphone.", error: error => (error as Error).message,
      });
      setPaymentUrl(result.paymentUrl);
      setMode("none");
    } catch { /* toast déjà affiché */ }
  }

  async function submitDispute() {
    if (reason.trim().length < 5) return;
    if (!window.confirm(`Contester la facture ${invoice.number} ?`)) return;
    try {
      await toastPromise(dispute.mutateAsync({ invoiceId: invoice.invoiceId, reason: reason.trim() }), {
        loading: "Envoi de la contestation…", success: "Facture contestée", error: error => (error as Error).message,
      });
      setMode("none");
    } catch { /* toast déjà affiché */ }
  }

  return <div className="p-4 border border-border rounded-xl text-sm">
    <div className="flex justify-between gap-4">
      <div><strong>{invoice.number}</strong><div className="text-ink-3">{invoice.billingPeriod} · échéance {formatDate(invoice.dueDate)}</div></div>
      <div className="text-right"><strong>{formatFCFA(invoice.totalTtc)}</strong><div className="text-ink-3">{invoice.status} · reste {formatFCFA(invoice.amountDue)}</div></div>
    </div>
    {canAct && <div className="flex gap-2 mt-3"><Button variant="primary" size="sm" onClick={() => setMode(mode === "pay" ? "none" : "pay")}>Payer</Button><Button variant="ghost" size="sm" onClick={() => setMode(mode === "dispute" ? "none" : "dispute")}>Contester</Button></div>}
    <button className="mt-2 text-xs text-primary underline" onClick={() => setDetailsOpen(open => !open)}>{detailsOpen ? "Masquer le détail" : "Voir le détail"}</button>
    {detailsOpen && <div className="mt-2 p-3 bg-surface-2 rounded-lg text-xs">
      {detailQ.isLoading ? "Chargement…" : detailQ.isError ? <div role="alert" className="text-danger">{(detailQ.error as Error).message}</div> : <>
        <strong>Lignes</strong>{detailQ.data?.lines.map((line, index) => <div key={`${line.label}:${index}`} className="flex justify-between gap-2 py-1"><span>{line.label}</span><span>{formatFCFA(line.amountHt)} HT</span></div>)}
        <strong className="block mt-2">Paiements</strong>{detailQ.data?.payments.length ? detailQ.data.payments.map(payment => <div key={payment.billingPaymentId} className="flex justify-between gap-2 py-1"><span>{payment.provider} · {payment.status}</span><span>{formatFCFA(payment.amount)}</span></div>) : <div className="text-ink-3">Aucun paiement</div>}
        {detailQ.data?.disputeReason && <div className="mt-2">Motif de contestation : {detailQ.data.disputeReason}</div>}
      </>}
    </div>}
    {paymentUrl && <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-primary underline">Ouvrir la page de paiement</a>}
    {mode === "pay" && <div className="grid gap-2 mt-3"><label className="grid gap-1">Fournisseur<select className="border border-border rounded-md p-2 bg-surface" value={provider} onChange={e => setProvider(e.target.value as typeof provider)}><option value="wave">Wave</option><option value="orange_money">Orange Money</option><option value="mtn">MTN Money</option><option value="moov_money">Moov Money</option></select></label><Input label="Téléphone payeur" type="tel" value={phone} onChange={e => setPhone(e.target.value)} /><Button variant="primary" size="sm" disabled={pay.isPending || !/^\+?\d{8,15}$/.test(phone)} onClick={submitPay}>Demander le paiement</Button></div>}
    {mode === "dispute" && <div className="grid gap-2 mt-3"><Input label="Motif de contestation" value={reason} onChange={e => setReason(e.target.value)} /><Button variant="primary" size="sm" disabled={dispute.isPending || reason.trim().length < 5} onClick={submitDispute}>Envoyer la contestation</Button></div>}
  </div>;
}
