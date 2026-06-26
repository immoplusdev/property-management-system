"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { Pill, Icon, showToast } from "../shared";
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
    <div className="fade-in">
      <PMSHeader
        title="Demandes clients"
        sub="Toutes les demandes envoyées via l'app Immo Plus · mises à jour en temps réel"
        actions={
          <>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> Export</button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} /> Demande manuelle</button>
          </>
        }
      />

      {/* ── KPI row ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)", marginBottom: 22 }}>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon"><Icon name="list" size={18} /></div>
          </div>
          <div className="kpi-value">{APP_REQUESTS.length}</div>
          <div className="kpi-label">Total aujourd&apos;hui</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}><Icon name="clock" size={18} /></div>
            <span className="kpi-trend down" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>{pending.length} urgentes</span>
          </div>
          <div className="kpi-value">{pending.length}</div>
          <div className="kpi-label">En attente</div>
          <div className="kpi-sub">À traiter maintenant</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--primary-50)", color: "var(--primary)" }}><Icon name="refresh" size={18} /></div>
          </div>
          <div className="kpi-value">{inProgress.length}</div>
          <div className="kpi-label">En cours</div>
          <div className="kpi-sub">Pris en charge par l&apos;équipe</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}><Icon name="check" size={18} /></div>
          </div>
          <div className="kpi-value">{confirmed.length}</div>
          <div className="kpi-label">Confirmés</div>
          <div className="kpi-sub">Planifiés, en attente exécution</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--bg-2)", color: "var(--text-3)" }}><Icon name="check" size={18} /></div>
          </div>
          <div className="kpi-value">{done.length}</div>
          <div className="kpi-label">Terminés</div>
          <div className="kpi-sub">Ce jour</div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div className="search-bar" style={{ width: 280 }}>
            <Icon name="eye" size={14} color="var(--text-3)" />
            <input placeholder="Chambre, client, type…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="chips">
            <div className={"chip" + (typeFilter === "all" ? " active" : "")} onClick={() => setTypeFilter("all")}>
              Tous <span className="chip-count">{APP_REQUESTS.length}</span>
            </div>
            {Object.entries(REQUEST_TYPES).map(([key, meta]) => {
              const count = APP_REQUESTS.filter(r => r.type === key).length;
              return (
                <div key={key} className={"chip" + (typeFilter === key ? " active" : "")} onClick={() => setTypeFilter(key)}>
                  {meta.label} <span className="chip-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Request list ── */}
      <div style={{ display: "grid", gap: 10 }}>
        {list.map(req => {
          const typeMeta   = REQUEST_TYPES[req.type];
          const statusMeta = STATUS_META[req.status as ReqStatus];
          const priMeta    = PRIORITY_META[req.priority];
          return (
            <div key={req.id} className="req-item">
              <div style={{ display: "grid", gridTemplateColumns: "46px 1fr auto", gap: 14, alignItems: "flex-start" }}>
                {/* Icon */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: `var(--${typeMeta.color}-bg, var(--primary-50))`,
                  color: `var(--${typeMeta.color}, var(--primary))`,
                  display: "grid", placeItems: "center",
                }}>
                  <Icon name={typeMeta.icon} size={22} />
                </div>

                {/* Main info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{req.title}</span>
                    <Pill kind={priMeta.kind as "warn" | "success" | "danger" | "muted" | "primary"} dot>{priMeta.label}</Pill>
                    <Pill kind={statusMeta.kind as "warn" | "success" | "danger" | "muted" | "primary"}>{statusMeta.label}</Pill>
                  </div>
                  <div className="text-xs text-muted" style={{ marginBottom: 6 }}>
                    <Icon name="bed" size={11} /> Ch. {req.room} ·{" "}
                    <Icon name="user" size={11} /> {req.guest} ·{" "}
                    <Icon name="clock" size={11} /> {req.time} ·{" "}
                    {typeMeta.label}
                    {req.price > 0 && (
                      <> · <strong style={{ color: "var(--primary)" }}>{req.price.toLocaleString("fr-FR")} FCFA</strong></>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.4 }}>{req.details}</div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                  <div className="text-xs text-muted" style={{ marginBottom: 4 }}>{req.id}</div>
                  {req.status === "pending" && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ minWidth: 130 }}
                        onClick={() => showToast("Demande prise en charge", "check")}
                      >
                        <Icon name="check" size={13} /> Prendre en charge
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ minWidth: 130 }}
                        onClick={() => showToast("Message WhatsApp envoyé", "check")}
                      >
                        <Icon name="send" size={13} /> WhatsApp client
                      </button>
                    </>
                  )}
                  {req.status === "in-progress" && (
                    <>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ minWidth: 130 }}
                        onClick={() => showToast("Demande marquée terminée", "check")}
                      >
                        <Icon name="check" size={13} /> Marquer terminé
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ minWidth: 130 }}>
                        <Icon name="send" size={13} /> Mise à jour client
                      </button>
                    </>
                  )}
                  {req.status === "confirmed" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ minWidth: 130 }}
                      onClick={() => showToast("Demande finalisée", "check")}
                    >
                      <Icon name="check" size={13} /> Finaliser
                    </button>
                  )}
                  {req.status === "done" && (
                    <Pill kind="success" dot>Terminé</Pill>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {list.length === 0 && (
          <div className="empty">
            <div className="e-icon"><Icon name="list" size={24} /></div>
            <div className="e-title">Aucune demande trouvée</div>
            <div className="e-sub">Modifiez les filtres ou attendez de nouvelles demandes de l&apos;app</div>
          </div>
        )}
      </div>

      {/* ── Info card ── */}
      <div className="card" style={{ marginTop: 22, background: "var(--primary-50)", borderColor: "var(--primary-100)" }}>
        <div className="row-flex" style={{ marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center" }}>
            <Icon name="info" size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Comment fonctionnent les demandes App ?</div>
            <div className="text-xs text-muted">Flux Immo Plus · app cliente</div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 }}>
          Le client envoie une demande depuis l&apos;app Immo Plus → vous recevez une notification push + la demande apparaît ici en temps réel.
          Vous cliquez <strong>Prendre en charge</strong> → le client reçoit une confirmation dans l&apos;app. Une fois terminé, marquez la demande
          comme <strong>Terminée</strong> et le client voit l&apos;update dans son historique. Les demandes payantes sont facturées à la note de
          chambre et apparaissent dans l&apos;onglet Facturation.
        </div>
      </div>
    </div>
  );
}
