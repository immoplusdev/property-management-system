"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, StarRating, showToast, Icon } from "../shared";
import { REVIEWS, REVIEW_STATS } from "../data";

export function Reviews() {
  const [filter,   setFilter]   = useState("all");
  const [period,   setPeriod]   = useState("month");
  const [search,   setSearch]   = useState("");
  const [replying, setReplying] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let list: any[] = [...REVIEWS];
  if (filter === "needs-reply") list = list.filter(r => !r.reply);
  if (filter === "replied")     list = list.filter(r => r.reply);
  if (filter === "high")        list = list.filter(r => r.overall >= 4);
  if (filter === "low")         list = list.filter(r => r.overall <= 3);
  if (search) list = list.filter(r =>
    r.guest.toLowerCase().includes(search.toLowerCase()) ||
    r.text.toLowerCase().includes(search.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allReviews = REVIEWS as any[];
  const needsReplyCount = allReviews.filter(r => !r.reply).length;

  return (
    <div className="fade-in">
      <PMSHeader
        title="Avis clients"
        sub="Tous les avis sont collectés via l'app Immo Plus · contribue à la confiance de votre fiche dans le feed"
        actions={
          <>
            <div className="tabs">
              {(["week", "month", "year"] as const).map(p => (
                <div key={p} className={"tab" + (period === p ? " active" : "")} onClick={() => setPeriod(p)}>
                  {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={14} /> Export</button>
          </>
        }
      />

      {/* ── Overview 3-col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 1fr", gap: 14, marginBottom: 22 }}>

        {/* Global score — dark card */}
        <div className="card" style={{ background: "var(--text)", color: "#fff", borderColor: "transparent", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Note globale</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
              <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1 }}>
                {REVIEW_STATS.overall.toFixed(1)}
              </div>
              <div style={{ fontSize: 18, opacity: 0.85 }}>/5</div>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="starFilled" size={18} color={i < Math.round(REVIEW_STATS.overall) ? "#FFCB47" : "rgba(255,255,255,0.25)"} />
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12.5, opacity: 0.9 }}>
              <strong>{REVIEW_STATS.count} avis</strong> au total ·{" "}
              <span style={{ color: "#A8FFCB" }}>↑ {REVIEW_STATS.monthCount} ce mois</span>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="card">
          <SectionHead icon="barChart" title="Distribution des notes" sub={`${REVIEW_STATS.count} avis cumulés`} />
          {([5, 4, 3, 2, 1] as const).map(n => {
            const count = REVIEW_STATS.distribution[n];
            const pct   = Math.round((count / REVIEW_STATS.count) * 100);
            return (
              <div key={n} className="rate-bar-row">
                <span style={{ fontWeight: 600, fontSize: 11 }}>{n}★</span>
                <div className="rate-bar"><div style={{ width: pct + "%" }} /></div>
                <span className="text-num text-muted" style={{ fontSize: 11, textAlign: "right" }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* By category */}
        <div className="card">
          <SectionHead icon="award" title="Détail par catégorie" />
          <div style={{ display: "grid", gap: 10 }}>
            {([
              ["Propreté",          "cleanliness",    "droplet"   ],
              ["Personnel",         "staff",          "users"     ],
              ["Confort",           "comfort",        "bed"       ],
              ["Emplacement",       "location",       "mapPin"    ],
              ["Rapport qualité/prix","valueForMoney","moneyBill" ],
            ] as [string, keyof typeof REVIEW_STATS.byCategory, string][]).map(([label, key, icon]) => {
              const v = REVIEW_STATS.byCategory[key];
              return (
                <div key={key} style={{ display: "grid", gridTemplateColumns: "16px 1fr auto auto", gap: 8, alignItems: "center", fontSize: 12 }}>
                  <Icon name={icon} size={12} color="var(--text-3)" />
                  <div>{label}</div>
                  <StarRating value={v} size={10} />
                  <div style={{ fontWeight: 700, fontSize: 12, width: 28, textAlign: "right" }}>{v.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}><Icon name="trendingUp" size={18} /></div>
            <span className="kpi-trend up">↑ 0.3</span>
          </div>
          <div className="kpi-value">{REVIEW_STATS.monthAvg.toFixed(1)}<span style={{ fontSize: 16, color: "var(--text-3)", fontWeight: 500 }}>/5</span></div>
          <div className="kpi-label">Note moyenne ce mois</div>
          <div className="kpi-sub">vs 4.4 le mois dernier</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--primary-50)", color: "var(--primary)" }}><Icon name="send" size={18} /></div>
            <span className="kpi-trend up">+12</span>
          </div>
          <div className="kpi-value">{REVIEW_STATS.responseRate}%</div>
          <div className="kpi-label">Taux de réponse</div>
          <div className="kpi-sub">Cible : 95% — répondez aux 2 derniers</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--violet-bg)", color: "var(--violet)" }}><Icon name="clock" size={18} /></div>
            <span className="kpi-trend up" style={{ background: "var(--success-bg)", color: "var(--success)" }}>−1h</span>
          </div>
          <div className="kpi-value">{REVIEW_STATS.avgResponseTime}</div>
          <div className="kpi-label">Délai moyen de réponse</div>
          <div className="kpi-sub">Excellent · benchmark 24h</div>
        </div>
        <div className="kpi">
          <div className="kpi-top">
            <div className="kpi-icon" style={{ background: "var(--amber-bg)", color: "var(--amber)" }}><Icon name="bell" size={18} /></div>
            <span className="kpi-trend down" style={{ background: "var(--warn-bg)", color: "var(--warn)" }}>{needsReplyCount} à traiter</span>
          </div>
          <div className="kpi-value">{needsReplyCount}</div>
          <div className="kpi-label">Avis sans réponse</div>
          <div className="kpi-sub">Répondez sous 24h pour rester top du feed</div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div className="search-bar" style={{ width: 320 }}>
            <Icon name="eye" size={14} color="var(--text-3)" />
            <input placeholder="Rechercher dans les avis…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="chips">
            {([
              ["all",         "Tous",         allReviews.length],
              ["needs-reply", "Sans réponse", needsReplyCount],
              ["replied",     "Répondu",      allReviews.filter(r => r.reply).length],
              ["high",        "4★ et +",      allReviews.filter(r => r.overall >= 4).length],
              ["low",         "3★ et −",      allReviews.filter(r => r.overall <= 3).length],
            ] as [string, string, number][]).map(([id, label, count]) => (
              <div key={id} className={"chip" + (filter === id ? " active" : "")} onClick={() => setFilter(id)}>
                {label} <span className="chip-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Review cards ── */}
      <div>
        {list.map(r => (
          <div key={r.id} className={"review-card" + (!r.reply ? " needs-reply" : "")}>
            <div className="rev-head">
              <div className="rev-author">
                <div className={"av av-" + r.avatar} style={{ width: 46, height: 46, fontSize: 15 }}>
                  {(r.guest as string).split(" ").map((x: string) => x[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="rev-name">{r.guest}</div>
                  <div className="rev-meta">
                    {r.country} · {r.roomType} · {r.stays} séjour{r.stays > 1 ? "s" : ""} · {r.date}
                  </div>
                </div>
              </div>
              <div className="rev-stars-block">
                <div className="rev-overall">{r.overall}<small>/5</small></div>
                <StarRating value={r.overall} size={14} />
              </div>
            </div>

            <div className="rev-title">{r.title}</div>
            <div className="rev-text">{r.text}</div>

            {r.photos > 0 && (
              <div className="rev-photos">
                {Array.from({ length: r.photos as number }).map((_, i) => <div key={i} className="rev-photo" />)}
              </div>
            )}

            {/* Sub-scores */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 14, padding: "10px 14px", background: "var(--surface-soft)", borderRadius: 10, fontSize: 11.5 }}>
              {([
                ["Propreté",    r.scores.cleanliness],
                ["Personnel",   r.scores.staff],
                ["Confort",     r.scores.comfort],
                ["Emplacement", r.scores.location],
                ["Rapport Q/P", r.scores.valueForMoney],
              ] as [string, number][]).map(([label, score]) => (
                <div key={label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "var(--text-3)" }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{score}</span>
                  <Icon name="starFilled" size={10} color="var(--amber)" />
                </div>
              ))}
            </div>

            {/* Existing reply */}
            {r.reply && (
              <div className="rev-reply">
                <div className="rev-reply-head"><Icon name="send" size={12} /> Votre réponse · publique</div>
                <div className="rev-reply-text">{r.reply}</div>
                <div className="rev-reply-date">Publié le {r.replyDate} · visible dans le feed et l&apos;app Immo Plus</div>
              </div>
            )}

            {/* Awaiting reply */}
            {!r.reply && replying !== r.id && (
              <div className="rev-foot">
                <div style={{ color: "var(--warn)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Icon name="bell" size={13} /> Cet avis attend votre réponse
                </div>
                <div className="row-flex">
                  <button className="btn btn-ghost btn-sm"><Icon name="sparkles" size={13} /> Suggérer IA</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setReplying(r.id)}>
                    <Icon name="send" size={13} /> Répondre
                  </button>
                </div>
              </div>
            )}

            {/* Reply form */}
            {replying === r.id && (
              <div style={{ marginTop: 14, padding: 14, background: "var(--primary-50)", borderRadius: 12, border: "1.5px dashed var(--primary)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>
                  ✍️ Écrire une réponse publique
                </div>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Soyez chaleureux, personnel, court. Évitez le copier-coller."
                  defaultValue={`Bonjour ${(r.guest as string).split(" ")[0]}, merci pour votre retour ! `}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                  <div className="text-xs text-muted"><Icon name="info" size={11} /> Réponse visible dans le feed et l&apos;app</div>
                  <div className="row-flex">
                    <button className="btn btn-ghost btn-sm" onClick={() => setReplying(null)}>Annuler</button>
                    <button className="btn btn-primary btn-sm" onClick={() => { setReplying(null); showToast("Réponse publiée", "check"); }}>
                      <Icon name="send" size={13} /> Publier
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer for replied reviews */}
            {r.reply && (
              <div className="rev-foot">
                <div className="text-xs text-muted">
                  <Icon name="users" size={12} /> {r.helpful} personnes ont trouvé cet avis utile
                </div>
                <div className="row-flex">
                  <button className="btn btn-ghost btn-sm"><Icon name="edit" size={12} /> Modifier réponse</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
