"use client";

import { useState } from "react";
import { Button, SectionHead, Skeleton, toastPromise } from "../shared";
import { formatFCFA } from "../data";
import {
  useHotelWithdrawalBalance, useHotelWithdrawals,
  useRequestHotelWithdrawal, useSaveHotelPayoutAccount,
} from "@/lib/hooks/pms/useHotelWithdrawals";
import type { PayoutAccount } from "@/lib/api/pms/withdrawals.actions";

const operators: { value: PayoutAccount["operator"]; label: string }[] = [
  { value: "wave", label: "Wave" },
  { value: "orange", label: "Orange Money" },
  { value: "mtn", label: "MTN Money" },
  { value: "moov", label: "Moov Money" },
];

export function HotelWithdrawals() {
  const balanceQuery = useHotelWithdrawalBalance();
  const [page, setPage] = useState(1);
  const withdrawalsQuery = useHotelWithdrawals(page);
  const saveAccount = useSaveHotelPayoutAccount();
  const request = useRequestHotelWithdrawal();
  const [operatorEdit, setOperatorEdit] = useState<PayoutAccount["operator"] | null>(null);
  const [phoneEdit, setPhoneEdit] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  const balance = balanceQuery.data;
  const account = balance?.payoutAccount;
  const operator = operatorEdit ?? account?.operator ?? "wave";
  const phoneNumber = phoneEdit ?? account?.phoneNumber ?? "";
  const accountChanged = !account || operator !== account.operator || phoneNumber !== account.phoneNumber;
  const requestedAmount = Number(amount);

  async function handleSaveAccount() {
    try {
      await toastPromise(saveAccount.mutateAsync({ operator, phoneNumber: phoneNumber.trim() }), {
        loading: "Enregistrement du compte…",
        success: "Compte de reversement enregistré",
        error: (error) => (error as Error).message,
      });
      setOperatorEdit(null);
      setPhoneEdit(null);
    } catch { /* notification déjà affichée */ }
  }

  async function handleRequest() {
    if (!account || accountChanged || !Number.isSafeInteger(requestedAmount)) return;
    try {
      await toastPromise(request.mutateAsync({ amount: requestedAmount, account }), {
        loading: "Création de la demande…",
        success: "Demande de retrait envoyée à l'administration",
        error: (error) => (error as Error).message,
      });
      setAmount("");
    } catch { /* notification déjà affichée */ }
  }

  return (
    <section className="mb-5 rounded-[18px] border border-border bg-surface p-5.5">
      <SectionHead icon="creditCard" title="Retraits des revenus hôtel" sub="Paiements en ligne des séjours terminés" />
      {balanceQuery.isLoading ? <Skeleton className="mt-4 h-20" /> : balanceQuery.isError ? (
        <p role="alert" className="mt-3 text-[13px] text-danger">{(balanceQuery.error as Error).message}</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-success-bg p-3"><div className="text-[12px] text-ink-2">Disponible au retrait</div><strong>{formatFCFA(balance?.available ?? 0)}</strong></div>
            <div className="rounded-xl bg-warn-bg p-3"><div className="text-[12px] text-ink-2">Fonds non libérés</div><strong>{formatFCFA(balance?.pending ?? 0)}</strong></div>
            <div className="rounded-xl bg-surface-2 p-3"><div className="text-[12px] text-ink-2">Retraits en attente</div><strong>{formatFCFA(balance?.pendingWithdrawals ?? 0)}</strong></div>
          </div>
          <p className="mt-2 text-[11px] text-ink-3">Le solde exclut les espèces et les paiements saisis par l&apos;hôtel. Il tient compte des remboursements, frais de paiement et commissions.</p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <label className="text-[12px] font-medium text-ink-2">Opérateur de reversement
              <select value={operator} onChange={(event) => setOperatorEdit(event.target.value as PayoutAccount["operator"])} className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px]">
                {operators.map((entry) => <option key={entry.value} value={entry.value}>{entry.label}</option>)}
              </select>
            </label>
            <label className="text-[12px] font-medium text-ink-2">Numéro de reversement
              <input type="tel" value={phoneNumber} onChange={(event) => setPhoneEdit(event.target.value)} placeholder="+2250700000000" className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px]" />
            </label>
            <Button variant="ghost" disabled={!accountChanged || phoneNumber.trim().length < 8 || saveAccount.isPending} onClick={handleSaveAccount}>
              {saveAccount.isPending ? "Enregistrement…" : "Enregistrer le compte"}
            </Button>
          </div>
          {!account && <p className="mt-2 text-[12px] text-warn">Configurez le compte de reversement pour demander un retrait.</p>}

          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="text-[12px] font-medium text-ink-2">Montant à retirer (FCFA)
              <input type="number" min="1" max={balance?.available ?? 0} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 block w-52 rounded-lg border border-border bg-surface px-3 py-2 text-[13px]" />
            </label>
            <Button variant="primary" disabled={!account || accountChanged || request.isPending || !Number.isSafeInteger(requestedAmount) || requestedAmount <= 0 || requestedAmount > (balance?.available ?? 0)} onClick={handleRequest}>
              {request.isPending ? "Envoi…" : "Demander un retrait"}
            </Button>
          </div>
        </>
      )}

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="text-[13px] font-semibold">Historique des retraits</h3>
        {withdrawalsQuery.isError && <p role="alert" className="mt-2 text-[12px] text-danger">{(withdrawalsQuery.error as Error).message}</p>}
        {withdrawalsQuery.isLoading ? <Skeleton className="mt-2 h-12" /> : (withdrawalsQuery.data?.data ?? []).length === 0 ? (
          <p className="mt-2 text-[12px] text-ink-3">Aucune demande de retrait pour cet hôtel.</p>
        ) : (
          <div className="mt-2 grid gap-2">
            {(withdrawalsQuery.data?.data ?? []).map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-[12px]">
                <span>{new Date(item.createdAt).toLocaleDateString("fr-FR")} · {item.operator} · {item.phoneNumber}</span>
                <strong>{formatFCFA(item.amount)}</strong>
                <span className={item.status === "paid" ? "text-success" : item.status === "rejected" ? "text-danger" : "text-warn"}>
                  {item.status === "paid" ? "Payé" : item.status === "rejected" ? "Refusé" : "En attente"}
                </span>
              </div>
            ))}
          </div>
        )}
        {(withdrawalsQuery.data?.total ?? 0) > 20 && (
          <div className="mt-3 flex items-center justify-end gap-2 text-[12px]">
            <Button variant="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Précédent</Button>
            <span>Page {page}</span>
            <Button variant="ghost" disabled={page * 20 >= (withdrawalsQuery.data?.total ?? 0)} onClick={() => setPage(page + 1)}>Suivant</Button>
          </div>
        )}
      </div>
    </section>
  );
}
