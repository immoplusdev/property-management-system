"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export interface PmsIntegration {
  provider: string;
  status: string;
  baseUrl: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
}

export interface IntegrationConflict {
  conflictId: string;
  provider: string;
  type: string;
  date: string;
  details: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export async function getPmsIntegrations(): Promise<{ ok: true; data: PmsIntegration[] } | { ok: false; error: FormError }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const response = await backendFetch<{ data: PmsIntegration[] }>("/pms/integrations", { accessToken });
    if (!Array.isArray(response.data)) throw new Error("Réponse API invalide : intégrations absentes.");
    return { ok: true, data: response.data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export async function connectPmsIntegration(provider: string, payload: { apiKey: string; baseUrl: string }): Promise<{ ok: true; data: PmsIntegration } | { ok: false; error: FormError }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<PmsIntegration>(`/pms/integrations/${provider}/connect`, { method: "POST", json: payload, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function getIntegrationConflicts(): Promise<{ ok: true; data: IntegrationConflict[] } | { ok: false; error: FormError }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const response = await backendFetch<{ data: IntegrationConflict[] }>("/pms/integrations/conflicts?status=open", { accessToken });
    if (!Array.isArray(response.data)) throw new Error("Réponse API invalide : conflits absents.");
    return { ok: true, data: response.data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function resolveIntegrationConflict(conflictId: string, resolution: string, notes?: string): Promise<{ ok: true; data: unknown } | { ok: false; error: FormError }> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<unknown>(`/pms/integrations/conflicts/${conflictId}/resolve`, { method: "POST", json: { resolution, notes }, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}
