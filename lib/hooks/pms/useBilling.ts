"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disputeBillingInvoice, getBillingInvoiceDetail, getBillingInvoices, getBillingUsage, getPmsCommissions, payBillingInvoice } from "@/lib/api/pms/billing.actions";

export function useBillingUsage(enabled = true) {
  return useQuery({ queryKey: ["billing", "usage"], enabled, queryFn: async () => {
    const result = await getBillingUsage();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  } });
}

export function useBillingInvoices(enabled = true) {
  return useQuery({ queryKey: ["billing", "invoices"], enabled, queryFn: async () => {
    const result = await getBillingInvoices();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  } });
}

export function useBillingInvoiceDetail(invoiceId: string, enabled = true) {
  return useQuery({ queryKey: ["billing", "invoice", invoiceId], enabled: enabled && !!invoiceId, queryFn: async () => {
    const result = await getBillingInvoiceDetail(invoiceId);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  } });
}

export function usePmsCommissions(enabled = true) {
  return useQuery({ queryKey: ["billing", "commissions"], enabled, queryFn: async () => {
    const result = await getPmsCommissions();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  } });
}

export function usePayBillingInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload: { invoiceId: string; provider: "wave" | "orange_money" | "mtn" | "moov_money"; payerPhone: string }) => {
    const result = await payBillingInvoice(payload.invoiceId, payload.provider, payload.payerPhone);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["billing", "invoices"] }) });
}

export function useDisputeBillingInvoice() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload: { invoiceId: string; reason: string }) => {
    const result = await disputeBillingInvoice(payload.invoiceId, payload.reason);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["billing", "invoices"] }) });
}
