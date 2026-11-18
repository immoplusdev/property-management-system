"use client";
import React, { useEffect, useState } from "react";
import { Button, Icon, showToast } from "./shared";
import { useExportDailyReport } from "@/lib/hooks/pms/useDashboard";
import { usePmsExport } from "@/lib/hooks/pms/useExports";

export function DashboardExportAction() {
  const [exportId, setExportId] = useState<string | null>(null);
  const create = useExportDailyReport();
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
        showToast("Export XLSX prêt. Téléchargement lancé.", "check");
      } else showToast("L’export est prêt, mais son lien est absent.", "x");
      setExportId(null);
    } else if (result.status === "failed") {
      showToast(result.error || "La génération de l’export a échoué.", "x");
      setExportId(null);
    }
  }, [status.data, status.isError, status.error, exportId]);

  async function handleExport() {
    try {
      const result = await create.mutateAsync();
      if (!result.exportId) throw new Error("Le serveur n'a pas retourné l'identifiant de l'export.");
      setExportId(result.exportId);
      showToast("Export XLSX du jour demandé.", "info");
    } catch (error) {
      showToast((error as Error).message || "Impossible de démarrer l’export.", "x");
    }
  }

  return <Button variant="ghost" size="sm" disabled={create.isPending || !!exportId} onClick={handleExport}>
    <Icon name="download" size={14} /> {exportId ? "Préparation…" : "Export XLSX du jour"}
  </Button>;
}
