"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StepProps } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { Pill } from "../ui/Pill";
import { Fcfa } from "../ui/Fcfa";
import { Icon } from "../ui/Icon";

function SubmittedView({ hotelName }: { hotelName: string }) {
  return (
    <div className="submitted-view fade-in">
      <div style={{
        width: 110, height: 110, borderRadius: "50%",
        background: "var(--success)", color: "#fff",
        display: "grid", placeItems: "center",
        boxShadow: "0 20px 60px rgba(22,162,107,0.35)",
        marginBottom: 28, position: "relative",
      }}>
        <Icon name="check" size={48} stroke={3} />
        <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "3px solid rgba(22,162,107,0.2)" }} />
        <div style={{ position: "absolute", inset: -20, borderRadius: "50%", border: "2px solid rgba(22,162,107,0.1)" }} />
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--success)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        Dossier soumis
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", margin: "8px 0 12px", maxWidth: 600 }}>
        Bienvenue dans Immo Plus Pro,<br />
        <span style={{ color: "var(--primary)" }}>{hotelName}</span>
      </h1>
      <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 540, lineHeight: 1.55 }}>
        Votre fiche est en cours de vérification. Notre équipe revient vers vous sous <strong>24 à 48h</strong>.
        Vous recevrez une notification WhatsApp et un SMS dès qu&apos;elle sera mise en ligne.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 32, width: "100%", maxWidth: 720 }}>
        {[
          { i: "fileText", t: "Référence du dossier", v: "IPP-2026-0518-AJ47" },
          { i: "clock", t: "Délai de validation", v: "24–48h ouvrées" },
          { i: "bell", t: "Notification", v: "WhatsApp + SMS" },
        ].map((c) => (
          <div key={c.t} className="card" style={{ padding: 16, textAlign: "left" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--primary-50)", color: "var(--primary)", display: "grid", placeItems: "center", marginBottom: 10 }}>
              <Icon name={c.i} size={16} />
            </div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)", fontWeight: 500 }}>{c.t}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{c.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button className="btn btn-primary" onClick={() => { window.location.href = process.env.NEXT_PUBLIC_PMS_URL || "http://localhost:3001"; }}><Icon name="home" size={15} /> Accéder au PMS</button>
        <button className="btn btn-ghost"><Icon name="download" size={15} /> Télécharger le dossier</button>
      </div>
    </div>
  );
}

export function Step7({ state, completion = 89, goTo }: StepProps) {
  const { account, hotel, equip, roomTypes, valueAdds, pricing } = state;
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const equipChecked = Object.values(equip).filter((v) => v === true).length;
  const totalRooms = roomTypes.reduce((s, r) => s + Number(r.totalRooms), 0);
  const completeRooms = roomTypes.filter((r) => r.complete).length;
  const vaConfigured = Object.values(valueAdds).filter((x) => x.configured).length;
  const totalRevPerNight = roomTypes.reduce((s, r) => s + r.basePrice * Number(r.totalRooms), 0);
  const payMethods = [
    pricing.payWave && "Wave",
    pricing.payOM && "Orange Money",
    pricing.payCard && "Carte",
  ].filter(Boolean).join(" · ");

  if (submitted) return <SubmittedView hotelName={hotel.name} />;

  const sections = [
    {
      id: 1, title: "Compte hôtelier", icon: "user",
      status: account.acceptedTerms ? "ok" : "warn",
      info: `${account.fullName} · ${account.phone}`,
      action: account.acceptedTerms ? "Validé" : "Accepter les CGU",
    },
    {
      id: 2, title: "Établissement", icon: "building",
      status: "ok",
      info: `${hotel.name} · ${hotel.stars}★ · ${hotel.commune}, ${hotel.city} · ${hotel.galleryCount + 1} médias`,
      action: "Validé",
    },
    {
      id: 3, title: "Équipements & services", icon: "sparkles",
      status: "ok",
      info: `${equipChecked} équipements activés · badge « Confort 4★ »`,
      action: "Validé",
    },
    {
      id: 4, title: "Types de chambres", icon: "bed",
      status: completeRooms === roomTypes.length ? "ok" : "warn",
      info: `${roomTypes.length} types · ${totalRooms} chambres · ${completeRooms}/${roomTypes.length} complets`,
      action: completeRooms === roomTypes.length ? "Validé" : `Compléter ${roomTypes.length - completeRooms} type(s)`,
    },
    {
      id: 5, title: "Valeurs ajoutées", icon: "utensils",
      status: vaConfigured >= 3 ? "ok" : "info",
      info: `${vaConfigured} espaces configurés`,
      action: vaConfigured >= 3 ? "Validé" : "Recommandé : 3+ espaces",
    },
    {
      id: 6, title: "Tarification & conditions", icon: "creditCard",
      status: "ok",
      info: `${payMethods} · acompte ${pricing.depositPct}% · ${pricing.cancelPolicy}`,
      action: "Validé",
    },
  ] as const;

  const metrics = [
    ["Chambres", totalRooms],
    ["Types", roomTypes.length],
    ["Équip.", equipChecked],
    ["Espaces", vaConfigured],
  ] as const;

  const activationItems = [
    { i: "eye", t: "Mise en ligne immédiate", d: "Visible dans le feed avec badge « Hôtel »" },
    { i: "bell", t: "Notifications WhatsApp + SMS", d: "À chaque réservation, sans email obligatoire" },
    { i: "trendingUp", t: "Tableau de bord PMS", d: "Réservations, occupation, revenus, avis" },
    { i: "users", t: "Stories clients UGC", d: "Vos clients postent et lient votre fiche" },
  ] as const;

  return (
    <div className="step7-shell fade-in">
      <div className="page-head">
        <div className="page-eyebrow">Étape 7 sur 7 — dernière étape</div>
        <h1 className="page-title">Tout est prêt — vérifions ensemble</h1>
        <p className="page-desc">
          Voici le résumé complet de votre fiche. Notre équipe vérifie sous 24–48h
          et vous notifie par WhatsApp + SMS à la validation.
        </p>
      </div>

      <div className="step7-bento">
        {/* Completion */}
        <section className="card step7-card step7-score-card">
          <div className="step7-score-main">
            <div className="step7-kicker">Score de complétion</div>
            <div className="step7-score-value">{completion}%</div>
            <p className="step7-score-copy">
              {completion >= 95
                ? "Votre fiche est exemplaire. Vous pouvez soumettre."
                : "Ajoutez une vidéo de présentation pour atteindre 100% et débloquer le badge « Premium »."}
            </p>
            <div
              className="step7-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion}
            >
              <div className="step7-progress-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="step7-metrics" aria-label="Statistiques de la fiche">
            {metrics.map(([label, value]) => (
              <div key={label} className="step7-metric">
                <div className="step7-metric-value">{value}</div>
                <div className="step7-metric-label">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Activation */}
        <section className="card step7-card step7-activation-card">
          <SectionHead icon="sparkles" title="Ce qui s'active après publication" />
          <div className="step7-activation-list">
            {activationItems.map((it) => (
              <div key={it.t} className="step7-activation-item">
                <div className="step7-activation-icon">
                  <Icon name={it.i} size={16} />
                </div>
                <div>
                  <div className="step7-activation-title">{it.t}</div>
                  <div className="step7-activation-copy">{it.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sections recap */}
        <section className="card step7-card step7-recap-card">
          <SectionHead icon="list" title="Récapitulatif par section" />
          <div className="step7-recap-grid">
            {sections.map((s) => (
              <article key={s.id} className="step7-recap-tile">
                <div className="step7-recap-main">
                  <div className="step7-status-icon" data-status={s.status}>
                    <Icon name={s.icon} size={17} />
                  </div>
                  <div className="step7-recap-text">
                    <div className="step7-recap-title">Étape {s.id} · {s.title}</div>
                    <div className="step7-recap-info">{s.info}</div>
                  </div>
                </div>
                <div className="step7-recap-actions">
                  <Pill kind={s.status === "ok" ? "success" : s.status === "warn" ? "warn" : "primary"} dot>
                    {s.status === "ok" ? "OK" : s.status === "warn" ? "À compléter" : "Optionnel"}
                  </Pill>
                  <button className="btn btn-ghost btn-sm" onClick={() => goTo?.(s.id)}>
                    <Icon name="edit" size={13} /> Modifier
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Feed preview */}
        <section className="card step7-card step7-feed-preview-card">
          <SectionHead
            icon="eye"
            title="Prévisualisation dans le feed"
            sub="Voici comment votre hôtel apparaîtra aux voyageurs"
          />
          <div className="feed-preview">
            <div className="feed-card">
              <div className="fc-cover">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="fc-badges">
                    <span className="fc-badge"><Icon name="building" size={11} /> HÔTEL</span>
                    <span className="fc-badge step7-star-badge">
                      {Array.from({ length: hotel.stars }).map((_, i) => <span key={i}>★</span>)}
                    </span>
                  </div>
                  <div className="fc-fav"><Icon name="star" size={16} /></div>
                </div>
                <div className="fc-loc"><Icon name="mapPin" size={12} /> {hotel.commune}, {hotel.city}</div>
              </div>
              <div className="fc-body">
                <div className="fc-title">{hotel.name}</div>
                <div className="fc-desc">{hotel.shortDesc}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 10, flexWrap: "wrap" }}>
                  {hotel.strengths.slice(0, 3).map((s) => (
                    <span key={s} className="step7-feed-tag">{s}</span>
                  ))}
                </div>
                <div className="fc-foot">
                  <div>
                    <div className="fc-price">
                      à partir de <Fcfa value={Math.min(...roomTypes.map((r) => r.basePrice))} />
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-3)" }}>par nuit · {roomTypes.length} types disponibles</div>
                  </div>
                  <div className="fc-rating">
                    <Icon name="star" size={13} color="var(--amber)" /> 4.8 <span style={{ color: "var(--text-3)" }}>(0 avis)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue projection */}
        <section className="card step7-card step7-revenue-card">
          <SectionHead icon="trendingUp" title="Projection de revenus" sub="Basé sur les prix saisis et un taux d'occupation de 65%" />
          <div className="stat-grid step7-revenue-grid">
            <div className="stat">
              <div className="s-top">
                <div className="s-icon" style={{ background: "var(--primary-50)", color: "var(--primary)" }}><Icon name="moneyBill" size={16} /></div>
                <Pill kind="success" dot>Brut</Pill>
              </div>
              <div className="s-value"><Fcfa value={totalRevPerNight} /></div>
              <div className="s-label">Revenu max / nuit (100%)</div>
            </div>
            <div className="stat">
              <div className="s-top">
                <div className="s-icon" style={{ background: "var(--teal-bg)", color: "var(--teal)" }}><Icon name="calendar" size={16} /></div>
                <Pill kind="teal" dot>Moyenne</Pill>
              </div>
              <div className="s-value"><Fcfa value={Math.round(totalRevPerNight * 0.65 * 30)} /></div>
              <div className="s-label">Estimation mensuelle (65%)</div>
            </div>
            <div className="stat">
              <div className="s-top">
                <div className="s-icon" style={{ background: "var(--violet-bg)", color: "var(--violet)" }}><Icon name="award" size={16} /></div>
                <Pill kind="violet" dot>Net</Pill>
              </div>
              <div className="s-value"><Fcfa value={Math.round(totalRevPerNight * 0.65 * 30 * 0.92)} /></div>
              <div className="s-label">Après commission Immo Plus (8%)</div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <section className="card step7-card step7-submit-card">
          <div className="step7-submit-top">
            <div className="step7-submit-icon">
              <Icon name="check" size={24} stroke={3} />
            </div>
            <div>
              <div className="step7-submit-title">Prêt à soumettre votre fiche</div>
              <p className="step7-submit-copy">
                Notre équipe vérifie votre dossier sous 24 à 48h. Vous recevrez une notification WhatsApp + SMS dès validation.
              </p>
            </div>
          </div>
          <button
            className="btn btn-primary step7-submit-btn"
            onClick={() => router.push("/pms")}
          >
            <Icon name="send" size={16} /> Soumettre pour validation
          </button>
        </section>
      </div>
    </div>
  );
}
