"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { Pill, Icon, showToast, KPICard, Button } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { APP_REQUESTS, REQUEST_TYPES } from "../data";

type ReqStatus = "pending" | "in-progress" | "confirmed" | "done";

const STATUS_META: Record<ReqStatus, { label: string; kind: string }> = {
  "pending":     { label: "En attente", kind: "warn"    },
  "in-progress": { label: "En cours",   kind: "primary" },
  "confirmed":   { label: "Confirmé",   kind: "success" },
  "done":        { label: "Terminé",    kind: "success" },
};

const PRIORITY_META: Record<string, { label: string; kind: string }> = {
  high:   { label: "Urgent", kind: "danger" },
  normal: { label: "Normal", kind: "muted"  },
};

export function Requests() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [search,     setSearch]     = useState("");

  const pending    = APP_REQUESTS.filter(r => r.status === "pending");
  const inProgress = APP_REQUESTS.filter(r => r.status === "in-progress");
  const confirmed  = APP_REQUESTS.filter(r => r.status === "confirmed");
  const done       = APP_REQUESTS.filter(r => r.status === "done");

  let list = APP_REQUESTS as typeof APP_REQUESTS;
  if (typeFilter !== "all") list = list.filter(r => r.type === typeFilter);
  if (search) list = list.filter(r =>
    r.guest.toLowerCase().includes(search.toLowerCase()) ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.room.includes(search)
  );

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Demandes clients"
        sub="Toutes les demandes envoyées via l'app Immo Plus · mises à jour en temps réel"
        actions={
          <>
            <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export</Button>
            <Button variant="primary" size="sm"><Icon name="plus" size={14} /> Demande manuelle</Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-3 mb-5.5">
        <KPICard value={APP_REQUESTS.length} label="Total aujourd'hui"
          icon="list" iconBg="var(--color-surface-2)" iconColor="var(--color-ink-2)" />
        <KPICard value={pending.length} label="En attente" sub="À traiter maintenant"
          icon="clock" iconBg="var(--color-warn-bg)" iconColor="var(--color-warn)"
          trend={`${pending.length} urgentes`} trendUp={false} trendStyle={{ background: "var(--color-warn-bg)", color: "var(--color-warn)" }} />
        <KPICard value={inProgress.length} label="En cours" sub="Pris en charge par l'équipe"
          icon="refresh" iconBg="var(--color-primary-50)" iconColor="var(--color-primary)" />
        <KPICard value={confirmed.length} label="Confirmés" sub="Planifiés, en attente exécution"
          icon="check" iconBg="var(--color-success-bg)" iconColor="var(--color-success)" />
        <KPICard value={done.length} label="Terminés" sub="Ce jour"
          icon="check" iconBg="var(--color-surface-2)" iconColor="var(--color-ink-3)" />
      </div>

      {/* Filter bar */}
      <div className="bg-surface border border-border rounded-[18px] p-3.5 mb-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="h-9.5 w-70 bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 text-[13px] text-ink-3 focus-within:border-ink-3">
            <Icon name="eye" size={14} color="var(--color-ink-3)" />
            <input className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4" placeholder="Chambre, client, type…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <ChipGroup>
            <Chip label="Tous" count={APP_REQUESTS.length} active={typeFilter === "all"} onClick={() => setTypeFilter("all")} />
            {Object.entries(REQUEST_TYPES).map(([key, meta]) => {
              const count = APP_REQUESTS.filter(r => r.type === key).length;
              return (
                <Chip key={key} label={meta.label} count={count} active={typeFilter === key} onClick={() => setTypeFilter(key)} />
              );
            })}
          </ChipGroup>
        </div>
      </div>

      {/* Request list */}
      <div className="grid gap-2.5">
        {list.map(req => {
          const typeMeta   = REQUEST_TYPES[req.type];
          const statusMeta = STATUS_META[req.status as ReqStatus];
          const priMeta    = PRIORITY_META[req.priority];
          return (
            <div key={req.id} className="grid gap-3.5 items-center px-4 py-3.5 rounded-xl border border-border bg-surface hover:border-ink-3 transition-all duration-120" style={{ gridTemplateColumns: "auto minmax(0,1fr) auto auto" }}>
              {/* Icon */}
              <div
                className="w-11.5 h-11.5 rounded-xl shrink-0 grid place-items-center"
                style={{ background: `var(--color-${typeMeta.color}-bg, var(--color-primary-50))`, color: `var(--color-${typeMeta.color}, var(--color-primary))` }}
              >
                <Icon name={typeMeta.icon} size={22} />
              </div>

              {/* Main info */}
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-[14px]">{req.title}</span>
                  <Pill kind={priMeta.kind as "danger" | "muted"}>{priMeta.label}</Pill>
                  <Pill kind={statusMeta.kind as "warn" | "success" | "primary"}>{statusMeta.label}</Pill>
                </div>
                <div className="text-[11.5px] text-ink-3 mb-1.5">
                  <Icon name="bed" size={11} /> Ch. {req.room} ·{" "}
                  <Icon name="user" size={11} /> {req.guest} ·{" "}
                  <Icon name="clock" size={11} /> {req.time} · {typeMeta.label}
                  {req.price > 0 && (
                    <> · <strong style={{ color: "var(--color-primary)" }}>{req.price.toLocaleString("fr-FR")} FCFA</strong></>
                  )}
                </div>
                <div className="text-[12.5px] text-ink-2 leading-[1.4]">{req.details}</div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 items-end">
                <div className="text-[11.5px] text-ink-3 mb-1">{req.id}</div>
                {req.status === "pending" && (
                  <>
                    <Button variant="primary" size="sm" style={{ minWidth: 130 }} onClick={() => showToast("Demande prise en charge", "check")}>
                      <Icon name="check" size={13} /> Prendre en charge
                    </Button>
                    <Button variant="ghost" size="sm" style={{ minWidth: 130 }} onClick={() => showToast("Message WhatsApp envoyé", "check")}>
                      <Icon name="send" size={13} /> WhatsApp client
                    </Button>
                  </>
                )}
                {req.status === "in-progress" && (
                  <>
                    <Button variant="primary" size="sm" style={{ minWidth: 130 }} onClick={() => showToast("Demande marquée terminée", "check")}>
                      <Icon name="check" size={13} /> Marquer terminé
                    </Button>
                    <Button variant="ghost" size="sm" style={{ minWidth: 130 }}>
                      <Icon name="send" size={13} /> Mise à jour client
                    </Button>
                  </>
                )}
                {req.status === "confirmed" && (
                  <Button variant="ghost" size="sm" style={{ minWidth: 130 }} onClick={() => showToast("Demande finalisée", "check")}>
                    <Icon name="check" size={13} /> Finaliser
                  </Button>
                )}
                {req.status === "done" && <Pill kind="success" dot>Terminé</Pill>}
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <EmptyState icon="list" title="Aucune demande trouvée" sub="Modifiez les filtres ou attendez de nouvelles demandes de l'app" />
        )}
      </div>

      {/* Info card */}
      <div className="bg-primary-50 border border-primary-100 rounded-[18px] p-5.5 mt-5.5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-[10px] bg-primary text-white grid place-items-center shrink-0">
            <Icon name="info" size={18} />
          </div>
          <div className="flex-1">
            <div className="font-bold text-[14px]">Comment fonctionnent les demandes App ?</div>
            <div className="text-[11.5px] text-ink-3">Flux Immo Plus · app cliente</div>
          </div>
        </div>
        <div className="text-[12.5px] text-ink-2 leading-[1.6]">
          Le client envoie une demande depuis l&apos;app Immo Plus → vous recevez une notification push + la demande apparaît ici en temps réel.
          Vous cliquez <strong>Prendre en charge</strong> → le client reçoit une confirmation dans l&apos;app. Une fois terminé, marquez la demande
          comme <strong>Terminée</strong> et le client voit l&apos;update dans son historique.
        </div>
      </div>
    </div>
  );
}
