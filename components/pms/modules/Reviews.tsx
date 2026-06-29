"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, StarRating, showToast, Icon, KPICard, Button } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { REVIEWS, REVIEW_STATS, type Review } from "../data";

export function Reviews() {
  const [filter,   setFilter]   = useState("all");
  const [period,   setPeriod]   = useState("month");
  const [search,   setSearch]   = useState("");
  const [replying, setReplying] = useState<string | null>(null);

  let list: Review[] = [...REVIEWS];
  if (filter === "needs-reply") list = list.filter(r => !r.reply);
  if (filter === "replied")     list = list.filter(r => r.reply);
  if (filter === "high")        list = list.filter(r => r.overall >= 4);
  if (filter === "low")         list = list.filter(r => r.overall <= 3);
  if (search) list = list.filter(r =>
    r.guest.toLowerCase().includes(search.toLowerCase()) ||
    r.text.toLowerCase().includes(search.toLowerCase())
  );

  const allReviews: Review[] = REVIEWS;
  const needsReplyCount = allReviews.filter(r => !r.reply).length;

  const AV_COLORS = ["#E89060","#6FB5A8","#7B8DFF","#B57BE6","#F5C572","#6FCC92","#FF8585","#6FB5DD"];

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Avis clients"
        sub="Tous les avis sont collectés via l'app Immo Plus · contribue à la confiance de votre fiche dans le feed"
        actions={
          <>
            <div className="flex gap-0.5 bg-surface-2 p-0.75 rounded-[9px]">
              {(["week", "month", "year"] as const).map(p => (
                <button
                  key={p}
                  className={`px-3 py-1.5 rounded-[7px] text-[12.5px] font-medium ${period===p ? "bg-surface text-ink border border-border shadow-xs" : "text-ink-2"}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export</Button>
          </>
        }
      />

      {/* Overview 3-col */}
      <div className="grid gap-3.5 mb-5.5" style={{ gridTemplateColumns: "1fr 1.4fr 1fr" }}>
        {/* Global score — dark card */}
        <div className="bg-ink text-white border-transparent rounded-[18px] p-5.5 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/[0.08]" />
          <div className="relative">
            <div className="text-[11px] opacity-85 font-semibold tracking-[0.05em] uppercase">Note globale</div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <div className="text-[54px] font-extrabold tracking-[-0.03em] leading-none">{REVIEW_STATS.overall.toFixed(1)}</div>
              <div className="text-[18px] opacity-85">/5</div>
            </div>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="starFilled" size={18} color={i < Math.round(REVIEW_STATS.overall) ? "#FFCB47" : "rgba(255,255,255,0.25)"} />
              ))}
            </div>
            <div className="mt-3 text-[12.5px] opacity-90">
              <strong>{REVIEW_STATS.count} avis</strong> au total ·{" "}
              <span style={{ color: "#A8FFCB" }}>↑ {REVIEW_STATS.monthCount} ce mois</span>
            </div>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="barChart" title="Distribution des notes" sub={`${REVIEW_STATS.count} avis cumulés`} />
          {([5, 4, 3, 2, 1] as const).map(n => {
            const count = REVIEW_STATS.distribution[n];
            const pct   = Math.round((count / REVIEW_STATS.count) * 100);
            return (
              <div key={n} className="grid gap-2.5 items-center text-[12px] mb-1.5" style={{ gridTemplateColumns: "22px 1fr 32px" }}>
                <span className="font-semibold text-[11px]">{n}★</span>
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: pct+"%" }} />
                </div>
                <span className="tabular-nums text-ink-3 text-[11px] text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {/* By category */}
        <div className="bg-surface border border-border rounded-[18px] p-5.5">
          <SectionHead icon="award" title="Détail par catégorie" />
          <div className="grid gap-2.5">
            {([
              ["Propreté",          "cleanliness",    "droplet"   ],
              ["Personnel",         "staff",          "users"     ],
              ["Confort",           "comfort",        "bed"       ],
              ["Emplacement",       "location",       "mapPin"    ],
              ["Rapport qualité/prix","valueForMoney","moneyBill" ],
            ] as [string, keyof typeof REVIEW_STATS.byCategory, string][]).map(([label, key, icon]) => {
              const v = REVIEW_STATS.byCategory[key];
              return (
                <div key={key} className="grid items-center text-[12px] gap-2" style={{ gridTemplateColumns: "16px 1fr auto auto" }}>
                  <Icon name={icon} size={12} color="var(--color-ink-3)" />
                  <div>{label}</div>
                  <StarRating value={v} size={10} />
                  <div className="font-bold text-[12px] w-7 text-right">{v.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5.5">
        <KPICard value={REVIEW_STATS.monthAvg.toFixed(1)} unit="/5" label="Note moyenne ce mois" sub="vs 4.4 le mois dernier"
          icon="trendingUp" iconBg="var(--color-success-bg)" iconColor="var(--color-success)" trend="↑ 0.3" trendUp />
        <KPICard value={`${REVIEW_STATS.responseRate}%`} label="Taux de réponse" sub="Cible : 95% — répondez aux 2 derniers"
          icon="send" iconBg="var(--color-primary-50)" iconColor="var(--color-primary)" trend="+12" trendUp />
        <KPICard value={REVIEW_STATS.avgResponseTime} label="Délai moyen de réponse" sub="Excellent · benchmark 24h"
          icon="clock" iconBg="var(--color-violet-bg)" iconColor="var(--color-violet)"
          trend="−1h" trendUp trendStyle={{ background: "var(--color-success-bg)", color: "var(--color-success)" }} />
        <KPICard value={needsReplyCount} label="Avis sans réponse" sub="Répondez sous 24h pour rester top du feed"
          icon="bell" iconBg="var(--color-amber-bg)" iconColor="var(--color-amber)"
          trend={`${needsReplyCount} à traiter`} trendUp={false} trendStyle={{ background: "var(--color-warn-bg)", color: "var(--color-warn)" }} />
      </div>

      {/* Filter bar */}
      <div className="bg-surface border border-border rounded-[18px] p-3.5 mb-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="h-9.5 w-80 bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 text-[13px] text-ink-3 focus-within:border-ink-3">
            <Icon name="eye" size={14} color="var(--color-ink-3)" />
            <input className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4" placeholder="Rechercher dans les avis…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <ChipGroup>
            {([
              ["all",         "Tous",         allReviews.length],
              ["needs-reply", "Sans réponse", needsReplyCount],
              ["replied",     "Répondu",      allReviews.filter(r => r.reply).length],
              ["high",        "4★ et +",      allReviews.filter(r => r.overall >= 4).length],
              ["low",         "3★ et −",      allReviews.filter(r => r.overall <= 3).length],
            ] as [string, string, number][]).map(([id, label, count]) => (
              <Chip key={id} label={label} count={count} active={filter === id} onClick={() => setFilter(id)} />
            ))}
          </ChipGroup>
        </div>
      </div>

      {/* Review cards */}
      <div className="grid gap-3">
        {list.map(r => (
          <div
            key={r.id}
            className={`bg-surface border rounded-[18px] p-5 ${!r.reply ? "border-warn" : "border-border"}`}
          >
            {/* Head */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-[46px] h-[46px] rounded-full inline-grid place-items-center text-white font-semibold text-[15px] shrink-0"
                  style={{ background: AV_COLORS[(r.avatar - 1) % 8] }}
                >
                  {(r.guest as string).split(" ").map((x: string) => x[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-[14px]">{r.guest}</div>
                  <div className="text-[11.5px] text-ink-3 mt-0.5">{r.country} · {r.roomType} · {r.stays} séjour{r.stays > 1 ? "s" : ""} · {r.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-semibold tracking-[-0.03em] inline-flex items-baseline gap-1">
                  {r.overall}<small className="text-[12px] text-ink-3 font-medium">/5</small>
                </div>
                <StarRating value={r.overall} size={14} />
              </div>
            </div>

            <div className="text-[15px] font-semibold mb-1.5 tracking-[-0.01em]">{r.title}</div>
            <div className="text-[13.5px] leading-[1.6] text-ink-2">{r.text}</div>

            {r.photos > 0 && (
              <div className="flex gap-1.5 mt-3">
                {Array.from({ length: r.photos as number }).map((_, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-surface-2" />
                ))}
              </div>
            )}

            {/* Sub-scores */}
            <div className="flex gap-3.5 flex-wrap mt-3.5 px-3.5 py-2.5 bg-surface-2 rounded-[10px] text-[11.5px]">
              {([
                ["Propreté",    r.scores.cleanliness],
                ["Personnel",   r.scores.staff],
                ["Confort",     r.scores.comfort],
                ["Emplacement", r.scores.location],
                ["Rapport Q/P", r.scores.valueForMoney],
              ] as [string, number][]).map(([label, score]) => (
                <div key={label} className="inline-flex items-center gap-1.25">
                  <span className="text-ink-3">{label}</span>
                  <span className="font-bold">{score}</span>
                  <Icon name="starFilled" size={10} color="var(--color-amber)" />
                </div>
              ))}
            </div>

            {/* Existing reply */}
            {r.reply && (
              <div className="mt-3 px-4 py-3.5 bg-surface-2 rounded-[10px] border-l-2 border-primary">
                <div className="text-[10.5px] text-ink-3 font-semibold uppercase tracking-[0.05em] mb-1 flex items-center gap-1.5">
                  <Icon name="send" size={12} /> Votre réponse · publique
                </div>
                <div className="text-[13px] leading-[1.55] text-ink">{r.reply}</div>
                <div className="text-[11px] text-ink-3 mt-1">Publié le {r.replyDate} · visible dans le feed et l&apos;app Immo Plus</div>
              </div>
            )}

            {/* Awaiting reply */}
            {!r.reply && replying !== r.id && (
              <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border-soft text-[12px] text-ink-3">
                <div className="text-warn font-semibold inline-flex items-center gap-1.5">
                  <Icon name="bell" size={13} /> Cet avis attend votre réponse
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><Icon name="sparkles" size={13} /> Suggérer IA</Button>
                  <Button variant="primary" size="sm" onClick={() => setReplying(r.id)}>
                    <Icon name="send" size={13} /> Répondre
                  </Button>
                </div>
              </div>
            )}

            {/* Reply form */}
            {replying === r.id && (
              <div className="mt-3.5 p-3.5 bg-primary-50 rounded-xl border-[1.5px] border-dashed border-primary">
                <div className="text-[12px] font-bold text-primary mb-2">✍️ Écrire une réponse publique</div>
                <textarea
                  className="w-full bg-surface border border-border rounded-[9px] px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink-3 resize-vertical min-h-[88px] leading-[1.5] placeholder:text-ink-4"
                  rows={3}
                  placeholder="Soyez chaleureux, personnel, court. Évitez le copier-coller."
                  defaultValue={`Bonjour ${(r.guest as string).split(" ")[0]}, merci pour votre retour ! `}
                />
                <div className="flex justify-between items-center mt-2.5">
                  <div className="text-[11.5px] text-ink-3"><Icon name="info" size={11} /> Réponse visible dans le feed et l&apos;app</div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setReplying(null)}>Annuler</Button>
                    <Button variant="primary" size="sm" onClick={() => { setReplying(null); showToast("Réponse publiée", "check"); }}>
                      <Icon name="send" size={13} /> Publier
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer for replied */}
            {r.reply && (
              <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border-soft text-[12px] text-ink-3">
                <div className="inline-flex items-center gap-1.5">
                  <Icon name="users" size={12} /> {r.helpful} personnes ont trouvé cet avis utile
                </div>
                <Button variant="ghost" size="sm"><Icon name="edit" size={12} /> Modifier réponse</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
