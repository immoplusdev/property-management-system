"use client";
import React, { useState, useMemo } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, StarRating, toastPromise, Icon, KPICard, Button } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import type { Review } from "../data";
import { useReviews, useReplyToReview, useSuggestReviewReply } from "@/lib/hooks/pms/useReviews";

const AV_COLORS = ["#E89060","#6FB5A8","#7B8DFF","#B57BE6","#F5C572","#6FCC92","#FF8585","#6FB5DD"];

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-2 rounded-lg animate-pulse ${className}`} />;
}

export function Reviews() {
  const [filter,   setFilter]   = useState("all");
  const [period,   setPeriod]   = useState<"week"|"month"|"year">("month");
  const [search,   setSearch]   = useState("");
  const [replying, setReplying] = useState<string | null>(null);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const suggestMut = useSuggestReviewReply();
  const replyMut   = useReplyToReview();

  const { data, isLoading } = useReviews({ limit: 100 });
  const allReviews: Review[] = data?.data ?? [];

  const guestName = (r: Review) => `${r.guest.firstName} ${r.guest.lastName}`;

  const list = useMemo(() => {
    let res = [...allReviews];
    if (filter === "needs-reply") res = res.filter(r => !r.response);
    if (filter === "replied")     res = res.filter(r => !!r.response);
    if (filter === "high")        res = res.filter(r => r.rating >= 4);
    if (filter === "low")         res = res.filter(r => r.rating <= 3);
    if (search) res = res.filter(r =>
      guestName(r).toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
    );
    return res;
  }, [allReviews, filter, search]);

  const needsReplyCount  = allReviews.filter(r => !r.response).length;
  const avgRating        = allReviews.length > 0
    ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    : 0;
  const monthAvg         = avgRating;
  const responseRate     = allReviews.length > 0
    ? Math.round((allReviews.filter(r => !!r.response).length / allReviews.length) * 100)
    : 0;

  // Distribution
  const distribution = [5,4,3,2,1].map(n => ({
    n,
    count: allReviews.filter(r => Math.round(r.rating) === n).length
  }));

  // Category averages from reviews that have scores
  const withScores = allReviews.filter(r => r.scores);
  function catAvg(key: keyof NonNullable<Review["scores"]>) {
    if (!withScores.length) return 0;
    return withScores.reduce((s, r) => s + (r.scores?.[key] ?? 0), 0) / withScores.length;
  }

  async function handleSuggest(r: Review) {
    try {
      const res = await toastPromise(suggestMut.mutateAsync(r.id), {
        loading: "Génération de la suggestion IA…",
        success: "Suggestion générée",
        error: (e) => (e as Error)?.message || "Erreur lors de la suggestion IA",
      });
      setReplyDrafts(d => ({ ...d, [r.id]: res.suggestion }));
    } catch { /* toast déjà affiché */ }
  }

  async function handleReply(r: Review) {
    const text = replyDrafts[r.id] ?? "";
    if (!text.trim()) return;
    try {
      await toastPromise(replyMut.mutateAsync({ id: r.id, response: text }), {
        loading: "Publication…",
        success: "Réponse publiée",
        error: (e) => (e as Error)?.message || "Erreur lors de la publication",
      });
      setReplying(null);
    } catch { /* toast déjà affiché */ }
  }

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
      {isLoading ? (
        <div className="grid gap-3.5 mb-5.5" style={{ gridTemplateColumns: "1fr 1.4fr 1fr" }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <div className="grid gap-3.5 mb-5.5" style={{ gridTemplateColumns: "1fr 1.4fr 1fr" }}>
          {/* Global score */}
          <div className="bg-ink text-white border-transparent rounded-[18px] p-5.5 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/8" />
            <div className="relative">
              <div className="text-[11px] opacity-85 font-semibold tracking-wider uppercase">Note globale</div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <div className="text-[54px] font-extrabold tracking-[-0.03em] leading-none">{avgRating.toFixed(1)}</div>
                <div className="text-[18px] opacity-85">/5</div>
              </div>
              <div className="mt-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="starFilled" size={18} color={i < Math.round(avgRating) ? "#FFCB47" : "rgba(255,255,255,0.25)"} />
                ))}
              </div>
              <div className="mt-3 text-[12.5px] opacity-90">
                <strong>{allReviews.length} avis</strong> au total
              </div>
            </div>
          </div>

          {/* Distribution */}
          <div className="bg-surface border border-border rounded-[18px] p-5.5">
            <SectionHead icon="barChart" title="Distribution des notes" sub={`${allReviews.length} avis cumulés`} />
            {distribution.map(({ n, count }) => {
              const pct = allReviews.length > 0 ? Math.round((count / allReviews.length) * 100) : 0;
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
              ] as [string, keyof NonNullable<Review["scores"]>, string][]).map(([label, key, icon]) => {
                const v = catAvg(key);
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
      )}

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3 mb-5.5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          : <>
              <KPICard value={monthAvg.toFixed(1)} unit="/5" label="Note moyenne" sub="Avis collectés"
                icon="trendingUp" iconBg="var(--color-success-bg)" iconColor="var(--color-success)" />
              <KPICard value={`${responseRate}%`} label="Taux de réponse" sub="Cible : 95%"
                icon="send" iconBg="var(--color-primary-50)" iconColor="var(--color-primary)"
                trend={`${allReviews.filter(r => !!r.response).length} répondus`} trendUp />
              <KPICard value={allReviews.length} label="Total des avis" sub="Tous périodes confondus"
                icon="star" iconBg="var(--color-amber-bg)" iconColor="var(--color-amber)" />
              <KPICard value={needsReplyCount} label="Sans réponse" sub="À traiter sous 24h"
                icon="bell" iconBg="var(--color-amber-bg)" iconColor="var(--color-amber)"
                trend={`${needsReplyCount} à traiter`} trendUp={false}
                trendStyle={{ background: "var(--color-warn-bg)", color: "var(--color-warn)" }} />
            </>
        }
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
              ["replied",     "Répondu",      allReviews.filter(r => !!r.response).length],
              ["high",        "4★ et +",      allReviews.filter(r => r.rating >= 4).length],
              ["low",         "3★ et −",      allReviews.filter(r => r.rating <= 3).length],
            ] as [string, string, number][]).map(([id, label, count]) => (
              <Chip key={id} label={label} count={count} active={filter === id} onClick={() => setFilter(id)} />
            ))}
          </ChipGroup>
        </div>
      </div>

      {/* Review cards */}
      <div className="grid gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)
          : list.map(r => {
              const initials = `${r.guest.firstName[0] ?? ""}${r.guest.lastName[0] ?? ""}`.toUpperCase();
              const avatarBg = AV_COLORS[(r.guest.firstName.charCodeAt(0) ?? 0) % 8];
              const draft    = replyDrafts[r.id] ?? `Bonjour ${r.guest.firstName}, merci pour votre retour ! `;

              return (
                <div
                  key={r.id}
                  className={`bg-surface border rounded-[18px] p-5 ${!r.response ? "border-warn" : "border-border"}`}
                >
                  {/* Head */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11.5 h-11.5 rounded-full inline-grid place-items-center text-white font-semibold text-[15px] shrink-0"
                        style={{ background: avatarBg }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-[14px]">{guestName(r)}</div>
                        <div className="text-[11.5px] text-ink-3 mt-0.5">
                          {r.guest.nationality}
                          {r.roomType && ` · ${r.roomType}`}
                          {r.stays && ` · ${r.stays} séjour${r.stays > 1 ? "s" : ""}`}
                          {" · "}{r.date}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[22px] font-semibold tracking-[-0.03em] inline-flex items-baseline gap-1">
                        {r.rating}<small className="text-[12px] text-ink-3 font-medium">/5</small>
                      </div>
                      <StarRating value={r.rating} size={14} />
                    </div>
                  </div>

                  {r.title && <div className="text-[15px] font-semibold mb-1.5 tracking-[-0.01em]">{r.title}</div>}
                  <div className="text-[13.5px] leading-[1.6] text-ink-2">{r.comment}</div>

                  {r.photos !== undefined && r.photos > 0 && (
                    <div className="flex gap-1.5 mt-3">
                      {Array.from({ length: r.photos }).map((_, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg bg-surface-2" />
                      ))}
                    </div>
                  )}

                  {/* Sub-scores */}
                  {r.scores && (
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
                  )}

                  {/* Existing reply */}
                  {r.response && (
                    <div className="mt-3 px-4 py-3.5 bg-surface-2 rounded-[10px] border-l-2 border-primary">
                      <div className="text-[10.5px] text-ink-3 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Icon name="send" size={12} /> Votre réponse · publique
                      </div>
                      <div className="text-[13px] leading-[1.55] text-ink">{r.response}</div>
                      {r.responseDate && (
                        <div className="text-[11px] text-ink-3 mt-1">Publié le {r.responseDate}</div>
                      )}
                    </div>
                  )}

                  {/* Awaiting reply */}
                  {!r.response && replying !== r.id && (
                    <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border-soft text-[12px] text-ink-3">
                      <div className="text-warn font-semibold inline-flex items-center gap-1.5">
                        <Icon name="bell" size={13} /> Cet avis attend votre réponse
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost" size="sm"
                          disabled={suggestMut.isPending}
                          onClick={() => handleSuggest(r)}
                        >
                          <Icon name="sparkles" size={13} /> {suggestMut.isPending ? "…" : "Suggérer IA"}
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => setReplying(r.id)}>
                          <Icon name="send" size={13} /> Répondre
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Reply form */}
                  {replying === r.id && (
                    <div className="mt-3.5 p-3.5 bg-primary-50 rounded-xl border-[1.5px] border-dashed border-primary">
                      <div className="text-[12px] font-bold text-primary mb-2">Écrire une réponse publique</div>
                      <textarea
                        className="w-full bg-surface border border-border rounded-[9px] px-3 py-2.5 text-[13.5px] text-ink outline-none focus:border-ink-3 resize-vertical min-h-22 leading-normal placeholder:text-ink-4"
                        rows={3}
                        placeholder="Soyez chaleureux, personnel, court. Évitez le copier-coller."
                        value={draft}
                        onChange={e => setReplyDrafts(d => ({ ...d, [r.id]: e.target.value }))}
                      />
                      <div className="flex justify-between items-center mt-2.5">
                        <div className="text-[11.5px] text-ink-3"><Icon name="info" size={11} /> Réponse visible dans le feed et l&apos;app</div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplying(null)}>Annuler</Button>
                          <Button
                            variant="primary" size="sm"
                            disabled={replyMut.isPending || !draft.trim()}
                            onClick={() => handleReply(r)}
                          >
                            <Icon name="send" size={13} /> {replyMut.isPending ? "Publication…" : "Publier"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer for replied */}
                  {r.response && (
                    <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border-soft text-[12px] text-ink-3">
                      <div className="inline-flex items-center gap-1.5">
                        <Icon name="users" size={12} /> {r.helpful ?? 0} personnes ont trouvé cet avis utile
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setReplying(r.id)}>
                        <Icon name="edit" size={12} /> Modifier réponse
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
