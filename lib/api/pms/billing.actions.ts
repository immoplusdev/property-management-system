"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

type Result<T> = { ok: true; data: T } | { ok: false; error: FormError };

export interface BillingInvoice {
  invoiceId: string;
  number: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalTtc: number;
  amountPaid: number;
  amountDue: number;
  status: string;
}

export interface BillingInvoiceDetail extends BillingInvoice {
  lines: { type: string; label: string; amountHt: number }[];
  payments: { billingPaymentId: string; amount: number; provider: string; status: string }[];
  disputeReason?: string | null;
}

export interface PmsCommission {
  commissionId: string;
  reservationId: string;
  source: string;
  baseHt: number;
  ratePercent: number;
  amountHt: number;
  creditedHt: number;
  status: string;
}

export interface BillingUsage {
  period: string;
  contractVersion: number;
  metrics: {
    activeClients: { raw: number };
    completedStays: { raw: number };
  };
  subscriptionHt: number;
  overagesHt: number;
  optionsHt: number;
}

async function readBilling<T>(path: string): Promise<Result<T>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    return { ok: true, data: await backendFetch<T>(path, { accessToken }) };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function getBillingUsage(): Promise<Result<BillingUsage>> {
  return readBilling<BillingUsage>("/pms/billing/usage/current");
}

export async function getBillingInvoices(): Promise<Result<{ data: BillingInvoice[] }>> {
  return readBilling<{ data: BillingInvoice[] }>("/pms/billing/invoices");
}

export async function getBillingInvoiceDetail(invoiceId: string): Promise<Result<BillingInvoiceDetail>> {
  return readBilling<BillingInvoiceDetail>(`/pms/billing/invoices/${invoiceId}`);
}

export async function getPmsCommissions(): Promise<Result<{ period: string; data: PmsCommission[]; totalHt: number }>> {
  return readBilling<{ period: string; data: PmsCommission[]; totalHt: number }>("/pms/commissions");
}

export async function payBillingInvoice(invoiceId: string, provider: "wave" | "orange_money" | "mtn" | "moov_money", payerPhone: string): Promise<Result<{ billingPaymentId: string; status: string; paymentUrl: string | null }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ billingPaymentId: string; status: string; paymentUrl: string | null }>(`/pms/billing/invoices/${invoiceId}/pay`, {
      method: "POST", json: { paymentMethod: "mobile_money", provider, payerPhone }, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function disputeBillingInvoice(invoiceId: string, reason: string): Promise<Result<{ invoiceId: string; status: string }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ invoiceId: string; status: string }>(`/pms/billing/invoices/${invoiceId}/dispute`, {
      method: "POST", json: { reason }, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}
