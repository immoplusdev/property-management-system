"use client";
import React, { useEffect, useState } from "react";
import { Button, Icon, showToast } from "./shared";
import { useCreatePmsExport, usePmsExport } from "@/lib/hooks/pms/useExports";
import type { ExportDataset, ExportFormat } from "@/lib/api/pms/exports.actions";

export function ExportAction({
  dataset,
  format = "csv",
  label = "Exporter",
  dateRange,
}: {
  dataset: ExportDataset;
  format?: ExportFormat;
  label?: string;
  dateRange?: { fromDate: string; toDate: string };
}) {
  const [exportId, setExportId] = useState<string | null>(null);
  const create = useCreatePmsExport();
  const status = usePmsExport(exportId);

  useEffect(() => {
    if (status.isError && exportId) {
      showToast((status.error as Error)?.message || "Impossible de suivre la génération de l'export.", "x");
      setExportId(null);
      return;
    }
    const result = status.data;
    if (!result || !exportId) return;
    if (result.status === "ready") {
      if (result.downloadUrl) {
        window.location.assign(result.downloadUrl);
        showToast("Export prêt. Téléchargement lancé.", "check");
      } else {
        showToast("L’export est prêt, mais le lien de téléchargement est absent.", "x");
      }
      setExportId(null);
    } else if (result.status === "failed") {
      showToast(result.error || "La génération de l’export a échoué.", "x");
      setExportId(null);
    }
  }, [status.data, status.isError, status.error, exportId]);

  async function handleExport() {
    try {
      const result = await create.mutateAsync({ dataset, format, dateRange });
      if (!result.exportId) throw new Error("Le serveur n'a pas retourné l'identifiant de l'export.");
      setExportId(result.exportId);
      showToast("Export demandé. Préparation du fichier…", "info");
    } catch (error) {
      showToast((error as Error).message || "Impossible de démarrer l’export.", "x");
    }
  }

  return (
    <Button variant="ghost" size="sm" disabled={create.isPending || !!exportId} onClick={handleExport}>
      <Icon name="download" size={14} /> {exportId ? "Préparation…" : label}
    </Button>
  );
}
