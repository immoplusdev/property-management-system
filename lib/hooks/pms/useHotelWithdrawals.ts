"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getHotelWithdrawalBalance, getHotelWithdrawals,
  requestHotelWithdrawal, saveHotelPayoutAccount, type PayoutAccount,
} from "@/lib/api/pms/withdrawals.actions";

const keys = { balance: ["hotel-withdrawals", "balance"] as const, list: ["hotel-withdrawals", "list"] as const };

export function useHotelWithdrawalBalance() {
  return useQuery({ queryKey: keys.balance, queryFn: async () => {
    const result = await getHotelWithdrawalBalance();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, refetchInterval: 30_000 });
}

export function useHotelWithdrawals(page = 1) {
  return useQuery({ queryKey: [...keys.list, page], queryFn: async () => {
    const result = await getHotelWithdrawals(page);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, refetchInterval: 30_000 });
}

export function useSaveHotelPayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (account: PayoutAccount) => {
      const result = await saveHotelPayoutAccount(account);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: ({ payoutAccount }) => {
      queryClient.setQueryData(keys.balance, (current: { payoutAccount: PayoutAccount | null } | undefined) =>
        current ? { ...current, payoutAccount } : current,
      );
      queryClient.invalidateQueries({ queryKey: keys.balance });
    },
  });
}

export function useRequestHotelWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, account }: { amount: number; account: PayoutAccount }) => {
      const result = await requestHotelWithdrawal(amount, account);
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.balance });
      queryClient.invalidateQueries({ queryKey: keys.list });
    },
  });
}
