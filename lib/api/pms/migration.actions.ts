"use server";

import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ImportType = "rooms" | "guests" | "reservations" | "opening_balances";
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: FormError };
export interface ImportError { row: number; field: string; code: string; message: string }
export interface ImportPreview {
  previewToken: string;
  importBatchId: string;
  expiresAt: string;
  totalRows: number;
  validRows: number;
  rejectedRows: number;
  errors: ImportError[];
}
export interface ImportExecution {
  importBatchId: string;
  status: string;
  importedRecords: number;
  rejectedRecords: number;
  errors: ImportError[];
}
export interface ImportBatch {
  id: string;
  importType: ImportType;
  status: string;
  totalRows: number;
  validRows: number;
  rejectedRows: number;
  importedRecords: number;
  createdAt: string;
  executedAt: string | null;
  rolledBackAt: string | null;
  rollbackReason: string | null;
}

export async function getImportBatches(): Promise<ActionResult<ImportBatch[]>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    const response = await backendFetch<{ data: ImportBatch[] }>("/pms/migration/batches", { accessToken });
    if (!Array.isArray(response.data)) throw new Error("Réponse API invalide : liste des lots absente.");
    return { ok: true, data: response.data };
  } catch (error) { return { ok: false, error: toFormError(error) }; }
}

async function request<T>(path: string, body: unknown): Promise<ActionResult<T>> {
  const accessToken = await getAccessToken();
  if (!accessToken) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };
  try {
    return { ok: true, data: await backendFetch<T>(path, { method: "POST", json: body, accessToken, headers: { "Idempotency-Key": crypto.randomUUID() } }) };
  } catch (error) { return { ok: false, error: toFormError(error) }; }
}

export async function previewImport(payload: { importType: ImportType; fileId: string; mapping: Record<string, string>; skipDuplicates: boolean }) {
  return request<ImportPreview>("/pms/migration/preview", payload);
}

export async function executeImport(previewToken: string) {
  return request<ImportExecution>("/pms/migration/execute", { previewToken });
}

export async function rollbackImport(batchId: string, reason: string) {
  return request<{ importBatchId: string; status: string; archivedRecords: number }>(`/pms/migration/batches/${batchId}/rollback`, { reason });
}
