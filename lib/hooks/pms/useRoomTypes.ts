"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRoomTypes, updateRoomType, type RoomTypePayload } from "@/lib/api/pms/room-types.actions";

export const roomTypeKeys = { all: () => ["room-types"] as const };

export function useRoomTypes(enabled = true) {
  return useQuery({
    queryKey: roomTypeKeys.all(),
    enabled,
    queryFn: async () => {
      const result = await getRoomTypes();
      if (!result.ok) throw new Error(result.error.message);
      return result.data;
    },
  });
}

export function useUpdateRoomType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<RoomTypePayload> }) =>
      updateRoomType(id, payload).then(result => {
        if (!result.ok) throw new Error(result.error.message);
        return result.data;
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: roomTypeKeys.all() }),
  });
}
