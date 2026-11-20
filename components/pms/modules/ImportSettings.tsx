"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, SectionHead, showToast } from "../shared";
import { uploadFile } from "@/lib/api/files/files.client";
import { executeImport, getImportBatches, previewImport, rollbackImport, type ImportExecution, type ImportPreview, type ImportType } from "@/lib/api/pms/migration.actions";

const FIELDS: Record<ImportType, { required: string[]; optional: string[] }> = {
  rooms: { required: ["roomNumber", "roomTypeCode"], optional: ["floor", "notes"] },
  guests: { required: ["firstName", "lastName"], optional: ["phone", "email", "nationality", "idCardNumber", "type"] },
  reservations: { required: ["checkInDate", "checkOutDate", "lastName", "totalAmount"], optional: ["roomNumber", "roomTypeCode", "firstName", "phone", "email", "adults", "children", "status", "externalReference"] },
  opening_balances: { required: ["reservationReference", "amount"], optional: ["date", "note"] },
};

const LABELS: Record<ImportType, string> = {
  rooms: "Chambres", guests: "Clients", reservations: "Réservations", opening_balances: "Soldes d'ouverture",
};

export function ImportSettings() {
  const queryClient = useQueryClient();
  const batchesQ = useQuery({ queryKey: ["pms-import-batches"], queryFn: async () => {
    const result = await getImportBatches();
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  } });
  const [type, setType] = useState<ImportType>("rooms");
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [execution, setExecution] = useState<ImportExecution | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [rollbackBatchId, setRollbackBatchId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function analyze() {
    if (!file) { showToast("Sélectionnez un fichier CSV ou XLSX.", "x"); return; }
    const fields = FIELDS[type];
    if (fields.required.some(field => !mapping[field]?.trim()) || (type === "reservations" && !mapping.roomNumber?.trim() && !mapping.roomTypeCode?.trim())) {
      showToast("Renseignez toutes les colonnes obligatoires.", "x"); return;
    }
    setBusy(true); setPreview(null); setExecution(null);
    try {
      const uploaded = await uploadFile(file);
      const result = await previewImport({ importType: type, fileId: uploaded.id, mapping: Object.fromEntries(Object.entries(mapping).filter(([, column]) => column.trim()).map(([field, column]) => [field, column.trim()])), skipDuplicates });
      if (!result.ok) throw new Error(result.error.message);
      setPreview(result.data);
      queryClient.invalidateQueries({ queryKey: ["pms-import-batches"] });
      showToast("Prévisualisation terminée.", "check");
    } catch (error) { showToast((error as Error).message, "x"); }
    finally { setBusy(false); }
  }

  async function execute() {
    if (!preview || preview.validRows < 1 || !window.confirm(`Importer ${preview.validRows} ligne(s) valides ?`)) return;
    setBusy(true);
    try {
      const result = await executeImport(preview.previewToken);
      if (!result.ok) throw new Error(result.error.message);
      setExecution(result.data); setPreview(null);
      queryClient.invalidateQueries({ queryKey: ["pms-import-batches"] });
      showToast(`${result.data.importedRecords} ligne(s) importée(s).`, "check");
    } catch (error) { showToast((error as Error).message, "x"); }
    finally { setBusy(false); }
  }

  async function rollback(batchId: string) {
    if (rollbackReason.trim().length < 3 || !window.confirm("Annuler ce lot importé ? Cette action archive les données du lot qui ne sont pas encore utilisées.")) return;
    setBusy(true);
    try {
      const result = await rollbackImport(batchId, rollbackReason.trim());
      if (!result.ok) throw new Error(result.error.message);
      setExecution(null); setRollbackReason(""); setRollbackBatchId(null);
      queryClient.invalidateQueries({ queryKey: ["pms-import-batches"] });
      showToast(`${result.data.archivedRecords} enregistrement(s) archivé(s).`, "check");
    } catch (error) { showToast((error as Error).message, "x"); }
    finally { setBusy(false); }
  }

  return <div className="grid gap-4">
    <SectionHead icon="download" title="Importer des données" sub="Analysez un CSV ou XLSX avant de l'enregistrer" />
    <label className="grid gap-1 text-sm font-medium">Données à importer
      <select className="h-10 border border-border rounded-lg px-3 bg-surface" value={type} onChange={event => { setType(event.target.value as ImportType); setMapping({}); setPreview(null); setExecution(null); }}>
        {Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    <label className="grid gap-1 text-sm font-medium">Fichier CSV ou XLSX
      <input type="file" accept=".csv,.xlsx" onChange={event => { setFile(event.target.files?.[0] ?? null); setPreview(null); setExecution(null); }} />
    </label>
    <p className="text-xs text-ink-3">Indiquez le nom exact de chaque colonne tel qu'il apparaît dans la première ligne du fichier.</p>
    <div className="grid gap-3 md:grid-cols-2">
      {[...FIELDS[type].required, ...FIELDS[type].optional].map(field => <Input key={field} label={`${field}${FIELDS[type].required.includes(field) ? " *" : ""}`} value={mapping[field] ?? ""} placeholder="Nom de colonne du fichier" onChange={event => { setMapping(current => ({ ...current, [field]: event.target.value })); setPreview(null); }} />)}
    </div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={skipDuplicates} onChange={event => { setSkipDuplicates(event.target.checked); setPreview(null); }} /> Ignorer les doublons</label>
    <Button variant="primary" size="sm" disabled={busy || !file} onClick={analyze}>{busy ? "Traitement…" : "Prévisualiser"}</Button>
    {preview && <div className="border border-border rounded-xl p-4 grid gap-3 text-sm">
      <strong>Prévisualisation : {preview.validRows} valides / {preview.totalRows} lignes · {preview.rejectedRows} rejetées</strong>
      <span className="text-xs text-ink-3">Valable jusqu'au {new Date(preview.expiresAt).toLocaleString("fr-FR")}. Lot : {preview.importBatchId}</span>
      {preview.errors.length > 0 && <ul className="max-h-44 overflow-auto text-danger grid gap-1">{preview.errors.slice(0, 50).map((error, index) => <li key={index}>Ligne {error.row} · {error.field} : {error.message}</li>)}</ul>}
      <Button variant="primary" size="sm" disabled={busy || preview.validRows < 1} onClick={execute}>Importer les lignes valides</Button>
    </div>}
    {execution && <p className="text-sm text-ink-2">Lot importé : {execution.importedRecords} enregistrement(s) · {execution.importBatchId}</p>}
    <SectionHead icon="list" title="Derniers lots" sub="Historique des 50 derniers imports" />
    {batchesQ.isLoading ? <p className="text-sm text-ink-3">Chargement des lots…</p> : batchesQ.isError ? <p role="alert" className="text-sm text-danger">{(batchesQ.error as Error).message}</p> : !batchesQ.data?.length ? <p className="text-sm text-ink-3">Aucun lot importé.</p> : batchesQ.data.map(batch => <div key={batch.id} className="border border-border rounded-xl p-4 grid gap-2 text-sm">
      <div className="flex justify-between gap-3"><strong>{LABELS[batch.importType] ?? batch.importType} · {batch.status}</strong><span className="text-xs text-ink-3">{new Date(batch.createdAt).toLocaleString("fr-FR")}</span></div>
      <div>{batch.importedRecords} importés · {batch.rejectedRows} rejetés</div>
      <div className="text-xs text-ink-3">Lot : {batch.id}</div>
      {batch.status === "completed" && (rollbackBatchId === batch.id ? <div className="grid gap-2">
        <Input label="Motif d'annulation" value={rollbackReason} onChange={event => setRollbackReason(event.target.value)} />
        <div className="flex gap-2"><Button variant="ghost" size="sm" disabled={busy || rollbackReason.trim().length < 3} onClick={() => rollback(batch.id)}>Annuler ce lot</Button><Button variant="ghost" size="sm" onClick={() => { setRollbackBatchId(null); setRollbackReason(""); }}>Fermer</Button></div>
      </div> : <Button variant="ghost" size="sm" onClick={() => { setRollbackBatchId(batch.id); setRollbackReason(""); }}>Annuler ce lot</Button>)}
    </div>)}
  </div>;
}
