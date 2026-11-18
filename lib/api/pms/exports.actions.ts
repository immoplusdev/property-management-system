"use server";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: FormError };
export type ExportDataset = "reservations" | "guests" | "finances" | "requests" | "reviews";
export type ExportFormat = "csv" | "xlsx";

export interface ExportStatus {
  exportId: string;
  status: "queued" | "processing" | "ready" | "failed";
  downloadUrl?: string | null;
  error?: string | null;
}

export async function createPmsExport(payload: {
  dataset: ExportDataset;
  format: ExportFormat;
  dateRange?: { fromDate: string; toDate: string };
}): Promise<ActionResult<{ exportId: string; status: "queued" | "processing" }>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<{ exportId: string; status: "queued" | "processing" }>("/pms/exports", {
      method: "POST", json: payload, accessToken,
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}

export async function getPmsExport(exportId: string): Promise<ActionResult<ExportStatus>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const data = await backendFetch<ExportStatus>(`/pms/exports/${exportId}`, { accessToken });
    return { ok: true, data };
  } catch (err) { return { ok: false, error: toFormError(err) }; }
}
