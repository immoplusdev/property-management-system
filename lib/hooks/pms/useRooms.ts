"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRooms,
  getRoom,
  updateRoomStatus,
  blockRoom,
  getHousekeepingTasks,
  updateHousekeepingTask,
  checkAvailability,
  type RoomsListParams,
} from "@/lib/api/pms/rooms.actions";
import type { RoomStatus } from "@/lib/types/pms";

export const roomKeys = {
  all:           () => ["rooms"] as const,
  list:          (params?: RoomsListParams) => ["rooms", "list", params] as const,
  detail:        (id: string) => ["rooms", "detail", id] as const,
  housekeeping:  (params?: object) => ["rooms", "housekeeping", params] as const,
  availability:  (params: object) => ["rooms", "availability", params] as const,
};

export function useRooms(params?: RoomsListParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: async () => {
      const res = await getRooms(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: async () => {
      const res = await getRoom(id);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useUpdateRoomStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RoomStatus }) =>
      updateRoomStatus(id, status).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.all() });
    },
  });
}

export function useBlockRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { from: string; to: string; reason?: string } }) =>
      blockRoom(id, payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.all() });
    },
  });
}

export function useHousekeepingTasks(params?: { status?: string; assignedTo?: string; date?: string }) {
  return useQuery({
    queryKey: roomKeys.housekeeping(params),
    queryFn: async () => {
      const res = await getHousekeepingTasks(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
  });
}

export function useUpdateHousekeepingTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: { status: string; notes?: string } }) =>
      updateHousekeepingTask(taskId, payload).then(res => {
        if (!res.ok) throw new Error(res.error.message);
        return res.data;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms", "housekeeping"] });
    },
  });
}

export function useCheckAvailability(params: { checkInDate: string; checkOutDate: string; roomTypeId?: string }, enabled = true) {
  return useQuery({
    queryKey: roomKeys.availability(params),
    queryFn: async () => {
      const res = await checkAvailability(params);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    enabled,
  });
}
