"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHotelSettings,
  updateHotelSettings,
  getHotelHours,
  updateHotelHours,
  updateNotificationSettings,
  type HotelSettings,
  type HotelHours,
  type NotificationSettings,
} from "@/lib/api/pms/settings.actions";

export const settingsKeys = {
  hotel:         () => ["settings", "hotel"] as const,
  hours:         () => ["settings", "hours"] as const,
  notifications: () => ["settings", "notifications"] as const,
};

export function useHotelSettings() {
  return useQuery({
    queryKey: settingsKeys.hotel(),
    queryFn: async () => {
      const res = await getHotelSettings();
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 300_000,
  });
}

export function useUpdateHotelSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<HotelSettings>) =>
      updateHotelSettings(payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.hotel() });
    },
  });
}

export function useHotelHours() {
  return useQuery({
    queryKey: settingsKeys.hours(),
    queryFn: async () => {
      const res = await getHotelHours();
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    staleTime: 300_000,
  });
}

export function useUpdateHotelHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<HotelHours>) =>
      updateHotelHours(payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.hours() });
    },
  });
}

export function useUpdateNotificationSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<NotificationSettings>) =>
      updateNotificationSettings(payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.notifications() });
    },
  });
}
