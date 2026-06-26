"use client";
import type { StepProps, PricingState } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField } from "../ui/FormFields";
import { Toggle } from "../ui/Toggle";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";

const PAY_METHODS = [
  { id: "payWave",  name: "Wave",              color: "#1BA1F2", icon: "📱", desc: "Paiement instantané · sans frais" },
  { id: "payOM",   name: "Orange Money",       color: "#FF7900", icon: "🟧", desc: "Orange Money Côte d'Ivoire" },
  { id: "payMTN",  name: "MTN Money",          color: "#FFCC00", icon: "🟨", desc: "MTN Mobile Money" },
  { id: "payCard", name: "Carte bancaire",     color: "#2744DE", icon: "💳", desc: "Visa, Mastercard" },
  { id: "payCash", name: "Espèces à l'arrivée", color: "#16A26B", icon: "💵", desc: "Paiement au check-in" },
] as const;

const CANCEL_OPTS = [
  { id: "Flexible", sub: "Remboursement 100% jusqu'à 24h avant",       color: "success", recommend: "Idéal voyages affaires" },
  { id: "Modérée",  sub: "Remboursement 50% jusqu'à 3 jours avant",    color: "amber",   recommend: "Équilibre risque / réservations" },
  { id: "Stricte",  sub: "Aucun remboursement après réservation",       color: "danger",  recommend: "Suites et villas" },
] as const;

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="step6-tip">
      <div className="step6-tip-dot"><Icon name="sparkles" size={12} /></div>
      <p className="step6-tip-text">{children}</p>
    </div>
  );
}

export function Step6({ state, update }: StepProps) {
  const p = state.pricing;
  const set = <K extends keyof PricingState>(k: K, v: PricingState[K]) =>
    update("pricing", { ...p, [k]: v });

  return (
    <div className="step6-shell fade-in">
      <div className="page-head">
        <div className="page-eyebrow">Étape 6 sur 7</div>
        <h1 className="page-title">Politique tarifaire & conditions</h1>
        <p className="page-desc">
          Définissez les modes de paiement acceptés, l&apos;acompte requis et vos conditions
          d&apos;accueil. Ces règles s&apos;appliquent à toutes vos chambres.
        </p>
      </div>

      <div className="step6-bento">

        {/* ── 1. Modes de paiement ── */}
        <section className="card step6-card step6-pay-card">
          <SectionHead icon="creditCard" title="Modes de paiement acceptés" />
          <div className="step6-pay-grid">
            {PAY_METHODS.map((m) => {
              const checked = !!p[m.id as keyof PricingState];
              return (
                <div
                  key={m.id}
                  className={`step6-pay-item${checked ? " checked" : ""}`}
                  onClick={() => set(m.id as keyof PricingState, !checked as PricingState[keyof PricingState])}
                >
                  <div className="step6-pay-top">
                    <div className="step6-pay-icon" style={{ background: m.color }}>{m.icon}</div>
                    <div className={`step6-pay-check${checked ? " checked" : ""}`}>
                      {checked && <Icon name="check" size={12} stroke={3} />}
                    </div>
                  </div>
                  <div className="step6-pay-name">{m.name}</div>
                  <div className="step6-pay-desc">{m.desc}</div>
                </div>
              );
            })}
          </div>
          <Tip>Au moins un mode <strong>mobile money</strong> est obligatoire en Côte d&apos;Ivoire — Wave et Orange Money représentent 87% des paiements.</Tip>
        </section>

        {/* ── 2. Acompte ── */}
        <section className="card step6-card step6-deposit-card">
          <SectionHead
            icon="moneyBill"
            title="Acompte à la réservation"
            right={p.depositRequired ? <Pill kind="primary" dot>{p.depositPct}%</Pill> : undefined}
          />

          <div className="step6-deposit-opts">
            {([
              { v: true,  label: "Oui, requis",           sub: "Sécurise vos réservations" },
              { v: false, label: "Paiement à l'arrivée",  sub: "100% au check-in" },
            ] as const).map(({ v, label, sub }) => (
              <div
                key={String(v)}
                className={`step6-opt${p.depositRequired === v ? " checked" : ""}`}
                onClick={() => set("depositRequired", v)}
              >
                <div className="rc-mark" />
                <div className="step6-opt-label">{label}</div>
                <div className="step6-opt-sub">{sub}</div>
              </div>
            ))}
          </div>

          <div className="step6-slider-block">
            <div className="step6-slider-head">
              <span>Pourcentage à la réservation</span>
              <strong className="step6-slider-pct">{p.depositRequired ? `${p.depositPct}%` : "—"}</strong>
            </div>
            <input
              type="range" min={0} max={100} step={5}
              value={Number(p.depositPct)}
              onChange={(e) => set("depositPct", Number(e.target.value))}
              disabled={!p.depositRequired}
              className="step6-range"
            />
            <div className="step6-slider-ticks">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
            <div className="field-help">Le solde est encaissé au check-in</div>
          </div>

          <Tip>Un acompte de <strong>30–50%</strong> réduit les no-shows de 42% selon les données Immo Plus.</Tip>
        </section>

        {/* ── 3. Politique d'annulation ── */}
        <section className="card step6-card step6-cancel-card">
          <SectionHead icon="shield" title="Politique d'annulation globale" />
          <div className="step6-cancel-list">
            {CANCEL_OPTS.map((opt) => (
              <div
                key={opt.id}
                className={`step6-cancel-row${p.cancelPolicy === opt.id ? " checked" : ""}`}
                onClick={() => set("cancelPolicy", opt.id)}
              >
                <div className="step6-cancel-left">
                  <div className="rc-mark" />
                  <div>
                    <div className="step6-cancel-title">{opt.id}</div>
                    <div className="step6-cancel-sub">{opt.sub}</div>
                  </div>
                </div>
                <span className={`step6-cancel-badge step6-cancel-${opt.color}`}>{opt.recommend}</span>
              </div>
            ))}
          </div>
          <Tip>La politique <strong>Flexible</strong> augmente le taux de conversion de +18% sur les fiches Immo Plus.</Tip>
        </section>

        {/* ── 4. Politiques d'accueil ── */}
        <section className="card step6-card step6-policies-card">
          <SectionHead icon="users" title="Politiques d'accueil" />

          <div className="row">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="step6-policy-icon" style={{ background: "var(--violet-bg)", color: "var(--violet)" }}>
                <Icon name="baby" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Enfants</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>
                  Gratuits jusqu&apos;à <strong>{p.kidsFree} ans</strong> partageant la chambre
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TextField type="number" value={String(p.kidsFree)}
                onChange={(e) => set("kidsFree", e.target.value)} style={{ width: 72 }} />
              <Toggle on={p.cribAvailable} onChange={(v) => set("cribAvailable", v)} />
              <span style={{ fontSize: 13 }}>Lit bébé</span>
            </div>
          </div>

          <div className="row">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="step6-policy-icon" style={{ background: "var(--amber-bg)", color: "var(--amber)" }}>
                <Icon name="paw" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Animaux de compagnie</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>Acceptés sous conditions ou refusés</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle on={p.pets} onChange={(v) => set("pets", v)} />
              <span style={{ fontSize: 13 }}>{p.pets ? "Acceptés (10 000 FCFA / séjour)" : "Non acceptés"}</span>
            </div>
          </div>

          <div className="row">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="step6-policy-icon" style={{ background: "var(--bg-2)", color: "var(--text-3)" }}>
                <Icon name="smoke" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Politique fumeurs</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{p.smoking}</div>
              </div>
            </div>
            <select className="select" style={{ width: 220 }} value={p.smoking}
              onChange={(e) => set("smoking", e.target.value)}>
              <option>Interdit dans tout l&apos;établissement</option>
              <option>Zone extérieure uniquement</option>
              <option>Chambres fumeurs disponibles</option>
            </select>
          </div>

          <div className="row">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="step6-policy-icon" style={{ background: "var(--teal-bg)", color: "var(--teal)" }}>
                <Icon name="moneyBill" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Taxe de séjour</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>Frais additionnels collectés au check-in</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>Par nuit :</span>
              <TextField type="number" value={String(p.cityTax)}
                onChange={(e) => set("cityTax", e.target.value)} style={{ width: 100 }} />
              <span style={{ fontSize: 13 }}>FCFA</span>
            </div>
          </div>
        </section>

        {/* ── 5. Check-in / Check-out ── */}
        <section className="card step6-card step6-checkin-card">
          <SectionHead icon="clock" title="Check-in / Check-out flexibles" />
          <div className="step6-checkin-body">
            {(["earlyCheckin", "lateCheckout"] as const).map((key, i) => (
              <div key={key} className="step6-checkin-block">
                <div className="step6-checkin-label">
                  <Icon name={i === 0 ? "arrowRight" : "arrowLeft"} size={14} />
                  {i === 0 ? "Check-in anticipé" : "Check-out tardif"}
                </div>
                <div className="step6-btn-group">
                  {(["Gratuit", "Sur disponibilité", "+ frais"] as const).map((o) => (
                    <button
                      key={o}
                      className={`btn btn-sm ${p[key] === o ? "btn-primary" : "btn-ghost"}`}
                      onClick={() => set(key, o)}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
