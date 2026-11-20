"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { connectPmsIntegration, getIntegrationConflicts, getPmsIntegrations, resolveIntegrationConflict } from "@/lib/api/pms/integrations.actions";

export function usePmsIntegrations(enabled = true) {
  return useQuery({ queryKey: ["pms", "integrations"], enabled, queryFn: async () => {
    const result = await getPmsIntegrations();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  } });
}

export function useIntegrationConflicts(enabled = true) {
  return useQuery({ queryKey: ["pms", "integrations", "conflicts"], enabled, queryFn: async () => {
    const result = await getIntegrationConflicts();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  } });
}

export function useConnectPmsIntegration() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload: { provider: string; apiKey: string; baseUrl: string }) => {
    const result = await connectPmsIntegration(payload.provider, { apiKey: payload.apiKey, baseUrl: payload.baseUrl });
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["pms", "integrations"] }) });
}

export function useResolveIntegrationConflict() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: async (payload: { conflictId: string; resolution: string; notes?: string }) => {
    const result = await resolveIntegrationConflict(payload.conflictId, payload.resolution, payload.notes);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  }, onSuccess: () => qc.invalidateQueries({ queryKey: ["pms", "integrations", "conflicts"] }) });
}
