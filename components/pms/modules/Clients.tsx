"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, StarRating, Icon, Pill } from "../shared";
import { CLIENTS, BOOKINGS, REVIEWS, formatFCFA, formatDate, type Client } from "../data";

export function Clients() {
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Client | null>(null);

  let list = CLIENTS;
  if (filter === "vip")  list = list.filter(c => c.vip);
  if (filter === "corp") list = list.filter(c => !!c.corporate);
  if (filter === "new")  list = list.filter(c => c.stays <= 1);
  if (search) list = list.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <PMSHeader
        title="Clients"
        sub={`${CLIENTS.length} fiches clients · ${CLIENTS.filter(c => c.vip).length} VIP · ${CLIENTS.filter(c => c.corporate).length} comptes corporate`}
        actions={
          <>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> Export CRM</button>
            <button className="btn btn-primary btn-sm"><Icon name="plus" size={14} /> Nouveau client</button>
          </>
        }
      />

      {/* ── Filters ── */}
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div className="search-bar" style={{ width: 320 }}>
            <Icon name="eye" size={14} color="var(--text-3)" />
            <input placeholder="Nom, email, téléphone…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="chips">
            {([
              ["all",  "Tous",      CLIENTS.length],
              ["vip",  "VIP",       CLIENTS.filter(c => c.vip).length],
              ["corp", "Corporate", CLIENTS.filter(c => c.corporate).length],
              ["new",  "Nouveaux",  CLIENTS.filter(c => c.stays <= 1).length],
            ] as [string, string, number][]).map(([id, label, count]) => (
              <div key={id} className={"chip" + (filter === id ? " active" : "")} onClick={() => setFilter(id)}>
                {label} <span className="chip-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Card grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {list.map(c => <ClientCard key={c.id} client={c} onClick={() => setSelected(c)} />)}
      </div>

      {selected && <ClientDetail client={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  return (
    <div className="card" style={{ cursor: "pointer", padding: 18 }} onClick={onClick}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div className={"av av-" + client.avatar} style={{ width: 48, height: 48, fontSize: 16 }}>
          {client.name.split(" ").map(x => x[0]).join("").slice(0, 2)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{client.name}</div>
            {client.vip && (
              <span style={{ background: "var(--amber)", color: "#fff", padding: "2px 7px", borderRadius: 99, fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3 }}>
                <Icon name="star" size={10} /> VIP
              </span>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
            {client.corporate
              ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="briefcase" size={10} /> {client.corporate}</span>
              : <>{client.country} · {client.idType}</>}
          </div>
        </div>
        <Icon name="chevronRight" size={16} color="var(--text-3)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <div>
          <div className="text-xs text-muted">Séjours</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{client.stays}</div>
        </div>
        <div>
          <div className="text-xs text-muted">Total dépensé</div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)" }}>{(client.totalSpent / 1000).toFixed(0)}k</div>
        </div>
        <div>
          <div className="text-xs text-muted">Dernier séjour</div>
          <div style={{ fontWeight: 600, fontSize: 12 }}>{client.lastStay ? formatDate(client.lastStay) : "—"}</div>
        </div>
      </div>
    </div>
  );
}

function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  const [tab, setTab] = useState("info");
  const clientBookings = BOOKINGS.filter(b => b.guestId === client.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientReviews  = (REVIEWS as any[]).filter(r => r.guest === client.name);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>

        {/* ── Dark header ── */}
        <div style={{
          padding: "24px 24px 18px",
          background: client.vip ? "var(--amber)" : "var(--text)",
          color: "#fff",
          position: "relative",
        }}>
          <button
            className="btn-icon"
            style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.2)", color: "#fff", borderColor: "rgba(255,255,255,0.2)" }}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className={"av av-" + client.avatar} style={{ width: 64, height: 64, fontSize: 22, boxShadow: "0 0 0 4px rgba(255,255,255,0.3)" }}>
              {client.name.split(" ").map(x => x[0]).join("").slice(0, 2)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{client.name}</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
                {client.vip      && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="star" size={11} /> Client VIP</span>}
                {client.corporate && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="briefcase" size={11} /> {client.corporate}</span>}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="mapPin" size={11} /> {client.country}</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Total dépensé</div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
                {(client.totalSpent / 1000).toFixed(0)}k <span style={{ fontSize: 11, opacity: 0.85 }}>FCFA</span>
              </div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>sur {client.stays} séjours</div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ padding: "0 24px" }}>
          <div className="tabs-line">
            {([
              ["info",    "Informations"],
              ["history", `Historique · ${client.stays} séjours`],
              ["reviews", "Avis postés"],
              ["prefs",   "Préférences & notes"],
            ] as [string, string][]).map(([id, label]) => (
              <div key={id} className={"tab" + (tab === id ? " active" : "")} onClick={() => setTab(id)}>{label}</div>
            ))}
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: 4 }}>

          {/* ── Info tab ── */}
          {tab === "info" && (
            <div className="grid-2">
              <div className="row" style={{ margin: 0 }}>
                <div>
                  <div className="text-xs text-muted">Téléphone (WhatsApp)</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{client.phone}</div>
                </div>
                <button className="btn btn-soft btn-sm"><Icon name="send" size={13} /> Message</button>
              </div>
              <div className="row" style={{ margin: 0 }}>
                <div>
                  <div className="text-xs text-muted">Email</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{client.email}</div>
                </div>
                <button className="btn-icon"><Icon name="mail" size={14} /></button>
              </div>
              <div className="row" style={{ margin: 0 }}>
                <div>
                  <div className="text-xs text-muted">Pièce d&apos;identité</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{client.idType} · {client.idNumber}</div>
                </div>
                <button className="btn-icon"><Icon name="eye" size={14} /></button>
              </div>
              <div className="row" style={{ margin: 0 }}>
                <div>
                  <div className="text-xs text-muted">Pays / Nationalité</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{client.country}</div>
                </div>
              </div>
              {client.corporate && (
                <div style={{ gridColumn: "span 2", padding: 16, background: "var(--bg)", border: "1px solid var(--primary-100)", borderRadius: 14 }}>
                  <div className="row-flex" style={{ marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--primary)", color: "#fff", display: "grid", placeItems: "center" }}>
                      <Icon name="briefcase" size={18} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{client.corporate}</div>
                      <div className="text-xs text-muted">Compte corporate · facturation centralisée</div>
                    </div>
                    <Pill kind="primary" dot>Contrat actif</Pill>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── History tab ── */}
          {tab === "history" && (
            <div>
              <div className="grid-3" style={{ marginBottom: 14 }}>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="s-label">Séjours total</div>
                  <div className="s-value" style={{ fontSize: 22 }}>{client.stays}</div>
                </div>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="s-label">Panier moyen</div>
                  <div className="s-value" style={{ fontSize: 20 }}>
                    {client.stays > 0 ? Math.round(client.totalSpent / client.stays / 1000) : 0}k
                    <span className="text-xs text-muted" style={{ marginLeft: 4 }}>FCFA</span>
                  </div>
                </div>
                <div className="stat" style={{ padding: 14 }}>
                  <div className="s-label">Total dépensé</div>
                  <div className="s-value" style={{ fontSize: 18, color: "var(--primary)" }}>
                    {(client.totalSpent / 1000).toFixed(0)}k
                    <span className="text-xs text-muted" style={{ marginLeft: 4 }}>FCFA</span>
                  </div>
                </div>
              </div>
              {clientBookings.length > 0 ? (
                <div className="timeline">
                  {clientBookings.map(b => (
                    <div key={b.id} className="timeline-item">
                      <div className="row-flex" style={{ marginBottom: 2 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          Chambre {b.room} · {b.roomType} · {b.nights} nuit{b.nights > 1 ? "s" : ""}
                        </div>
                        <span className="text-xs text-muted" style={{ marginLeft: "auto" }}>{formatDate(b.checkin)}</span>
                      </div>
                      <div className="text-xs text-muted">{b.ref} · via {b.source} · {b.payment.toUpperCase()}</div>
                      <div style={{ marginTop: 4, fontWeight: 700, color: "var(--primary)", fontSize: 13 }}>{formatFCFA(b.amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <div className="e-icon"><Icon name="calendar" size={24} /></div>
                  <div className="e-title">Aucun séjour enregistré</div>
                  <div className="e-sub">Les réservations de ce client apparaîtront ici</div>
                </div>
              )}
            </div>
          )}

          {/* ── Reviews tab ── */}
          {tab === "reviews" && (
            <div>
              {clientReviews.length === 0 ? (
                <div className="empty">
                  <div className="e-icon"><Icon name="star" size={24} /></div>
                  <div className="e-title">Pas encore d&apos;avis posté</div>
                  <div className="e-sub">Ce client n&apos;a pas encore évalué de séjour via l&apos;app Immo Plus</div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div className="text-sm" style={{ color: "var(--text-2)" }}>Avis postés via l&apos;app Immo Plus</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                      Note moyenne :{" "}
                      <strong style={{ color: "var(--amber)", fontSize: 14 }}>
                        {(clientReviews.reduce((s: number, r: { overall: number }) => s + r.overall, 0) / clientReviews.length).toFixed(1)}★
                      </strong>
                    </div>
                  </div>
                  {clientReviews.map((r: { id: string; overall: number; date: string; roomType: string; title: string; text: string; reply?: string }) => (
                    <div key={r.id} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 12, marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <StarRating value={r.overall} size={13} />
                          <span style={{ fontWeight: 700 }}>{r.overall}/5</span>
                        </div>
                        <span className="text-xs text-muted">{r.date} · {r.roomType}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>{r.text}</div>
                      {r.reply && (
                        <div style={{ marginTop: 10, padding: 10, background: "var(--primary-50)", borderRadius: 8, fontSize: 12, borderLeft: "3px solid var(--primary)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Votre réponse</div>
                          {r.reply}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── Preferences tab ── */}
          {tab === "prefs" && (
            <div>
              <SectionHead icon="star" title="Préférences" />
              <div className="grid-2">
                {([
                  [true,  "Chambre haut étage"],
                  [true,  "Vue lagune préférée"],
                  [false, "Lit jumeau"],
                  [true,  "Petit-déjeuner en chambre"],
                  [true,  "Ne pas déranger après 22h"],
                  [false, "Chambre fumeur"],
                ] as [boolean, string][]).map(([checked, label], i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px",
                    border: "1px solid " + (checked ? "var(--primary-100)" : "var(--border)"),
                    borderRadius: 9,
                    background: checked ? "var(--primary-50)" : "var(--surface)",
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                      background: checked ? "var(--text)" : "#fff",
                      border: "1.5px solid " + (checked ? "var(--text)" : "var(--border-strong)"),
                      display: "grid", placeItems: "center", color: "#fff",
                    }}>
                      {checked && <Icon name="check" size={12} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
              {client.notes && (
                <>
                  <div className="divider" />
                  <SectionHead icon="fileText" title="Notes équipe" />
                  <div style={{ padding: "12px 14px", background: "var(--bg-2)", borderRadius: 10, fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.5 }}>
                    {client.notes}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost btn-sm"><Icon name="trash" size={13} /> Supprimer</button>
          <div className="row-flex">
            <button className="btn btn-ghost btn-sm"><Icon name="send" size={13} /> WhatsApp</button>
            <button className="btn btn-primary btn-sm" onClick={onClose}><Icon name="plus" size={13} /> Nouvelle résa</button>
          </div>
        </div>
      </div>
    </div>
  );
}
