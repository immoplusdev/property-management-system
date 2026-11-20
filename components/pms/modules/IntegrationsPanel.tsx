"use client";
import React, { useState } from "react";
import { Button, Input, SectionHead, Skeleton, toastPromise } from "../shared";
import { formatDate } from "../data";
import { useConnectPmsIntegration, useIntegrationConflicts, usePmsIntegrations, useResolveIntegrationConflict } from "@/lib/hooks/pms/useIntegrations";

const resolutions = [
  ["keep_local_reservation", "Conserver la réservation locale"],
  ["accept_provider_inventory", "Accepter l'inventaire fournisseur"],
  ["relocate_guest", "Client relogé"],
  ["dismissed", "Écarter le conflit"],
] as const;

export function IntegrationsPanel() {
  const integrationsQ = usePmsIntegrations();
  const conflictsQ = useIntegrationConflicts();
  const connect = useConnectPmsIntegration();
  const resolve = useResolveIntegrationConflict();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [decisions, setDecisions] = useState<Record<string, string>>({});

  async function submitConnect() {
    if (!baseUrl.startsWith("https://") || apiKey.length < 8) return;
    try {
      await toastPromise(connect.mutateAsync({ provider: "channel_manager", baseUrl, apiKey }), {
        loading: "Test de connexion au fournisseur…", success: "Canal connecté", error: error => (error as Error).message,
      });
      setApiKey(""); setBaseUrl("");
    } catch { /* toast déjà affiché */ }
  }

  async function submitResolution(conflictId: string) {
    const resolution = decisions[conflictId];
    if (!resolution) return;
    if (!window.confirm("Appliquer cette résolution au conflit de synchronisation ?")) return;
    try {
      await toastPromise(resolve.mutateAsync({ conflictId, resolution }), {
        loading: "Résolution du conflit…", success: "Conflit résolu", error: error => (error as Error).message,
      });
    } catch { /* toast déjà affiché */ }
  }

  return <div className="grid gap-5">
    <SectionHead icon="barChart" title="Canaux de distribution" sub="Connexions et conflits de synchronisation" />
    {integrationsQ.isLoading ? <Skeleton className="h-20" /> : integrationsQ.isError ? <div role="alert" className="text-sm text-danger">{(integrationsQ.error as Error).message}</div> : integrationsQ.data?.length ? <div className="grid gap-2">{integrationsQ.data.map(integration => <div key={integration.provider} className="flex justify-between gap-4 p-4 border border-border rounded-xl text-sm"><div><strong>{integration.provider}</strong><div className="text-ink-3">{integration.baseUrl ?? "Adresse non renseignée"}</div></div><div className="text-right"><strong>{integration.status}</strong><div className="text-ink-3">Dernière synchronisation : {formatDate(integration.lastSyncAt)}</div></div></div>)}</div> : <p className="text-sm text-ink-3">Aucune intégration connectée.</p>}
    <div className="p-4 border border-border rounded-xl grid gap-3">
      <strong className="text-sm">Connecter un channel manager</strong>
      <Input label="Adresse HTTPS du fournisseur" type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} />
      <Input label="Clé API fournisseur" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} />
      <Button variant="primary" size="sm" disabled={connect.isPending || !baseUrl.startsWith("https://") || apiKey.length < 8} onClick={submitConnect}>Tester et connecter</Button>
    </div>
    <SectionHead icon="bell" title="Conflits à résoudre" />
    {conflictsQ.isLoading ? <Skeleton className="h-20" /> : conflictsQ.isError ? <div role="alert" className="text-sm text-danger">{(conflictsQ.error as Error).message}</div> : conflictsQ.data?.length ? <div className="grid gap-2">{conflictsQ.data.map(conflict => <div key={conflict.conflictId} className="p-4 border border-border rounded-xl text-sm"><div className="flex justify-between gap-3"><strong>{conflict.provider} · {conflict.type}</strong><span className="text-ink-3">{formatDate(conflict.date)}</span></div><pre className="mt-2 p-2 bg-surface-2 rounded-md text-xs whitespace-pre-wrap break-all">{JSON.stringify(conflict.details, null, 2)}</pre><div className="flex gap-2 mt-3"><select aria-label="Résolution du conflit" className="border border-border rounded-md p-2 bg-surface text-xs" value={decisions[conflict.conflictId] ?? ""} onChange={e => setDecisions(current => ({ ...current, [conflict.conflictId]: e.target.value }))}><option value="">Choisir une résolution</option>{resolutions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><Button variant="primary" size="sm" disabled={resolve.isPending || !decisions[conflict.conflictId]} onClick={() => submitResolution(conflict.conflictId)}>Appliquer</Button></div></div>)}</div> : <p className="text-sm text-ink-3">Aucun conflit ouvert.</p>}
  </div>;
}
