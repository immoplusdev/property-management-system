"use client";
import type { StepProps, PricingState } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField, CONTROL, SELECT_CHEVRON } from "../ui/FormFields";
import { Toggle } from "../ui/Toggle";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";
import { PageHead } from "../ui/PageHead";
import { InsCard } from "../ui/InsCard";
import { Tip } from "../ui/Tip";
import { RadioMark } from "../ui/RadioMark";
import { cn } from "@/lib/utils/cn";

const PAY_METHODS = [
  { id: "payWave",  name: "Wave",              image: "/wave.png", desc: "Paiement instantané · sans frais" },
  { id: "payOM",   name: "Orange Money",       image: "/om.png", desc: "Orange Money Côte d'Ivoire" },
  { id: "payCard", name: "Carte bancaire",     image: "creditCard", desc: "Visa, Mastercard" },
  { id: "payCash", name: "Espèces à l'arrivée", image: "banknote", desc: "Paiement au check-in" },
] as const;

const CANCEL_OPTS = [
  { id: "Flexible", sub: "Remboursement 100% jusqu'à 24h avant",       badge: "bg-success-bg text-success", recommend: "Idéal voyages affaires" },
  { id: "Modérée",  sub: "Remboursement 50% jusqu'à 3 jours avant",    badge: "bg-amber-bg text-amber",     recommend: "Équilibre risque / réservations" },
  { id: "Stricte",  sub: "Aucun remboursement après réservation",       badge: "bg-danger-bg text-danger",   recommend: "Suites et villas" },
] as const;

const optBox = (checked: boolean) =>
  cn(
    "relative text-left border rounded-xl p-3.5 cursor-pointer transition-[border-color,background] duration-120",
    checked ? "border-primary-200 bg-primary-50" : "border-border bg-surface hover:border-border-strong hover:bg-surface-2"
  );

export function Step6({ state, update }: StepProps) {
  const p = state.pricing;
  const set = <K extends keyof PricingState>(k: K, v: PricingState[K]) =>
    update("pricing", { ...p, [k]: v });

  return (
    <div className="animate-insc-fade">
      <PageHead
        eyebrow="Étape 6 sur 7"
        title="Politique tarifaire & conditions"
        desc="Définissez les modes de paiement acceptés, l'acompte requis et vos conditions d'accueil. Ces règles s'appliquent à toutes vos chambres."
      />

      <div className="grid grid-cols-1 gap-5 w-full">

        {/* 1. Modes de paiement */}
        <InsCard flat className="">
          <SectionHead icon="creditCard" title="Modes de paiement acceptés" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 mt-4">
            {PAY_METHODS.map((m) => {
              const checked = !!p[m.id as keyof PricingState];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => set(m.id as keyof PricingState, !checked as PricingState[keyof PricingState])}
                  className="text-left border border-border rounded-2xl p-3.5 cursor-pointer bg-white"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="w-10 h-10 rounded-[10px] grid place-items-center shrink-0 bg-white text-primary">
                      {m.image.startsWith("/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.image} alt={m.name} className="w-6 h-6 object-contain" />
                      ) : (
                        <Icon name={m.image as any} size={20} />
                      )}
                    </div>
                    <div className={cn("w-5 h-5 rounded-sm border-2 grid place-items-center transition-all duration-150", checked ? "border-success bg-success" : "border-border-strong bg-transparent")}>
                      {checked && <Icon name="check" size={12} stroke={3} className="text-white" />}
                    </div>
                  </div>
                  <div className="text-[13px] font-bold tracking-[-0.015em]">{m.name}</div>
                  <div className="text-[11px] text-ink-3 mt-0.75 leading-[1.4]">{m.desc}</div>
                </button>
              );
            })}
          </div>
          <Tip>Au moins un mode <strong>mobile money</strong> est obligatoire en Côte d&apos;Ivoire  Wave et Orange Money représentent 87% des paiements.</Tip>
        </InsCard>

        {/* 2. Acompte & 3. Politique d'annulation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InsCard flat>
          <SectionHead
            icon="moneyBill"
            title="Acompte à la réservation"
            right={p.depositRequired ? <Pill kind="primary" dot>{p.depositPct}%</Pill> : undefined}
          />

          <div className="grid grid-cols-2 gap-2 mt-4">
            {([
              { v: true,  label: "Oui, requis",           sub: "Sécurise vos réservations" },
              { v: false, label: "Paiement à l'arrivée",  sub: "100% au check-in" },
            ] as const).map(({ v, label, sub }) => (
              <button key={String(v)} type="button" className={optBox(p.depositRequired === v)} onClick={() => set("depositRequired", v)}>
                <RadioMark checked={p.depositRequired === v} className="absolute top-3 right-3" />
                <div className="text-[13px] font-bold pr-6.5">{label}</div>
                <div className="text-[11.5px] text-ink-3 mt-0.75">{sub}</div>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[13px] text-ink-2 font-medium mb-2.5">
              <span>Pourcentage à la réservation</span>
              <strong className="text-[22px] font-extrabold tracking-tighter text-ink tabular-nums">{p.depositRequired ? `${p.depositPct}%` : "—"}</strong>
            </div>
            <input
              type="range" min={0} max={100} step={5}
              value={Number(p.depositPct)}
              onChange={(e) => set("depositPct", Number(e.target.value))}
              disabled={!p.depositRequired}
              className="w-full accent-primary disabled:opacity-50"
            />
            <div className="flex justify-between text-[11px] text-ink-3 mt-1">
              <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
            </div>
            <div className="text-[11.5px] text-ink-3 mt-1.5 leading-[1.4]">Le solde est encaissé au check-in</div>
          </div>

          <Tip>Un acompte de <strong>30–50%</strong> réduit les no-shows de 42% selon les données Immo Plus.</Tip>
          </InsCard>

          {/* 3. Politique d'annulation */}
          <InsCard flat>
          <SectionHead icon="shield" title="Politique d'annulation globale" />
          <div className="flex flex-col gap-2 mt-4">
            {CANCEL_OPTS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => set("cancelPolicy", opt.id)}
                className={cn(
                  "flex items-center justify-between gap-3 p-3.5 border rounded-xl cursor-pointer transition-[border-color,background] duration-120",
                  p.cancelPolicy === opt.id ? "border-primary-200 bg-primary-50" : "border-border bg-surface hover:border-border-strong hover:bg-surface-2"
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <RadioMark checked={p.cancelPolicy === opt.id} className="shrink-0 mt-0.75" />
                  <div className="text-left">
                    <div className="text-[14px] font-bold tracking-[-0.015em]">{opt.id}</div>
                    <div className="text-[12px] text-ink-3 mt-0.5 leading-[1.4]">{opt.sub}</div>
                  </div>
                </div>
                <span className={cn("shrink-0 text-[10.5px] font-semibold px-2.5 py-0.75 rounded-full whitespace-nowrap", opt.badge)}>{opt.recommend}</span>
              </button>
            ))}
          </div>
          <Tip>La politique <strong>Flexible</strong> augmente le taux de conversion de +18% sur les fiches Immo Plus.</Tip>
          </InsCard>
        </div>

        {/* 4. Politiques d'accueil & 5. Check-in / Check-out */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InsCard flat className="flex flex-col">
            <SectionHead icon="users" title="Politiques d'accueil" />

            <PolicyRow icon="baby" iconBg="var(--violet-bg)" iconColor="var(--violet)" title="Enfants"
              sub={<>Gratuits jusqu&apos;à <strong>{p.kidsFree} ans</strong> partageant la chambre</>}>
              <TextField type="number" value={String(p.kidsFree)} onChange={(e) => set("kidsFree", e.target.value)} style={{ width: 72 }} />
              <Toggle on={p.cribAvailable} onChange={(v) => set("cribAvailable", v)} />
              <span className="text-[13px]">Lit bébé</span>
            </PolicyRow>

            <PolicyRow icon="paw" iconBg="var(--amber-bg)" iconColor="var(--amber)" title="Animaux de compagnie"
              sub="Acceptés sous conditions ou refusés">
              <Toggle on={p.pets} onChange={(v) => set("pets", v)} />
              <span className="text-[13px]">{p.pets ? "Acceptés (10 000 FCFA / séjour)" : "Non acceptés"}</span>
            </PolicyRow>

            <PolicyRow icon="smoke" iconBg="var(--surface-2)" iconColor="var(--color-ink-3)" title="Politique fumeurs" sub={p.smoking}>
              <select
                className={`${CONTROL} appearance-none bg-no-repeat bg-position-[right_14px_center] pr-9 w-55`}
                style={{ backgroundImage: `url("${SELECT_CHEVRON}")` }}
                value={p.smoking}
                onChange={(e) => set("smoking", e.target.value)}
              >
                <option>Interdit dans tout l&apos;établissement</option>
                <option>Zone extérieure uniquement</option>
                <option>Chambres fumeurs disponibles</option>
              </select>
            </PolicyRow>

            <PolicyRow icon="moneyBill" iconBg="var(--teal-bg)" iconColor="var(--teal)" title="Taxe de séjour"
              sub="Frais additionnels collectés au check-in">
              <span className="text-[13px] text-ink-3">Par nuit :</span>
              <TextField type="number" value={String(p.cityTax)} onChange={(e) => set("cityTax", e.target.value)} style={{ width: 100 }} />
              <span className="text-[13px]">FCFA</span>
            </PolicyRow>
          </InsCard>

          <InsCard flat className="flex flex-col">
            <SectionHead icon="clock" title="Check-in / Check-out flexibles" />
            <div className="flex flex-col flex-1">
              {(["earlyCheckin", "lateCheckout"] as const).map((key, i) => (
                <div key={key} className="py-4.5 border-b border-border first:pt-2 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-1.75 text-[13px] font-bold text-ink-2 mb-2.5">
                    <Icon name={i === 0 ? "arrowRight" : "arrowLeft"} size={14} />
                    {i === 0 ? "Check-in anticipé" : "Check-out tardif"}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["Gratuit", "Sur disponibilité", "+ frais"] as const).map((o) => {
                      const active = p[key] === o;
                      return (
                        <button
                          key={o}
                          onClick={() => set(key, o)}
                          className={cn(
                            "px-2 py-2 text-[11.5px] font-semibold rounded-xl border-[1.5px] transition-colors text-center leading-snug",
                            active ? "bg-primary text-white border-primary" : "bg-surface text-ink border-border hover:border-border-strong"
                          )}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </InsCard>
        </div>

      </div>
    </div>
  );
}

function PolicyRow({ icon, iconBg, iconColor, title, sub, children }: {
  icon: string; iconBg: string; iconColor: string; title: string; sub: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border first:pt-0 last:pb-0 last:border-b-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-[10px] shrink-0 grid place-items-center" style={{ background: iconBg, color: iconColor }}>
          <Icon name={icon} size={18} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[14px]">{title}</div>
          <div className="text-[12px] text-ink-3">{sub}</div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">{children}</div>
    </div>
  );
}
