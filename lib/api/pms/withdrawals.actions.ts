"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type PayoutAccount = { operator: "wave" | "orange" | "mtn" | "moov"; phoneNumber: string };
export type WithdrawalBalance = {
  available: number;
  shortfall: number;
  pending: number;
  pendingWithdrawals: number;
  currency: "XOF";
  payoutAccount: PayoutAccount | null;
};
export type HotelWithdrawal = {
  id: string;
  source: "pms";
  hotelId: string;
  requestedBy: string;
  amount: number;
  currency: string;
  operator: string;
  phoneNumber: string;
  status: "pending" | "paid" | "rejected";
  createdAt: string;
  transferReference: string | null;
  adminNote: string | null;
};
type Result<T> = { ok: true; data: T } | { ok: false; error: FormError };

async function call<T>(path: string, method = "GET", json?: unknown): Promise<Result<T>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<T>(path, {
      method, accessToken, ...(json ? { json } : {}),
      ...(method !== "GET" ? { headers: { "Idempotency-Key": crypto.randomUUID() } } : {}),
    });
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: toFormError(error) };
  }
}

export const getHotelWithdrawalBalance = () => call<WithdrawalBalance>("/pms/withdrawals/balance");
export const getHotelWithdrawals = (page = 1) => call<{ data: HotelWithdrawal[]; total: number }>(`/pms/withdrawals?page=${Math.max(1, page)}&limit=20`);
export const saveHotelPayoutAccount = (account: PayoutAccount) =>
  call<{ payoutAccount: PayoutAccount }>("/pms/withdrawals/payout-account", "PATCH", account);
export const requestHotelWithdrawal = (amount: number, account: PayoutAccount) =>
  call<HotelWithdrawal>("/pms/withdrawals", "POST", { amount, ...account });
