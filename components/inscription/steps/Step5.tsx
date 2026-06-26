"use client";
import { useState } from "react";
import type { StepProps, ValueAddsState, ServicesState } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField, SelectField, Field } from "../ui/FormFields";
import { Checkbox } from "../ui/Checkbox";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";

const VA_DEFS = [
  { id: "restaurant", title: "Restaurant",           desc: "Cuisine, carte, photos & vidéo ambiance",   icon: "utensils",  color: "amber"   },
  { id: "bar",        title: "Bar / Lounge",          desc: "Cocktails, happy hour, soirées DJ",         icon: "martini",   color: "pink"    },
  { id: "pool",       title: "Piscine",               desc: "Type, horaires, service de serviettes",     icon: "waves",     color: "primary" },
  { id: "gym",        title: "Salle de sport",        desc: "Équipements, coach, accès",                 icon: "dumbbell",  color: "violet"  },
  { id: "spa",        title: "Spa & bien-être",       desc: "Massages, hammam, soins",                   icon: "sparkles",  color: "teal"    },
  { id: "conference", title: "Salles de conférence",  desc: "Capacité, équipement A/V, tarifs",          icon: "briefcase", color: "primary" },
  { id: "outdoor",    title: "Espaces extérieurs",    desc: "Jardin, terrasse, rooftop, privatisation",  icon: "palmtree",  color: "teal"    },
] as const;

const SERVICES = [
  { id: "transferAirport", label: "Transfert aéroport" },
  { id: "rental",          label: "Location voiture / moto",   sub: "Partenaire ou sur place" },
  { id: "laundryService",  label: "Laverie / pressing" },
  { id: "babysit",         label: "Baby-sitting",              sub: "Sur réservation" },
  { id: "excursions",      label: "Excursions organisées",     sub: "Bassam, Yamoussoukro…" },
  { id: "infirmary",       label: "Pharmacie / infirmerie",    sub: "Sur place" },
  { id: "exchange",        label: "Change de devises" },
  { id: "atm",             label: "Distributeur (DAB)",        sub: "Dans le lobby" },
  { id: "shop",            label: "Boutique / kiosque" },
  { id: "printing",        label: "Imprimerie / photocopies" },
] as const;

type VaDef = typeof VA_DEFS[number];

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="step5-tip">
      <div className="step5-tip-dot"><Icon name="sparkles" size={12} /></div>
      <p className="step5-tip-text">{children}</p>
    </div>
  );
}

function ValueAddModal({ def, data, onSave, onClose }: {
  def: VaDef;
  data: Record<string, unknown>;
  onSave: (d: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState<Record<string, unknown>>({ ...data });
  const set = (k: string, v: unknown) => setD((prev) => ({ ...prev, [k]: v }));
  const colorBg = def.color === "primary" ? "var(--primary-50)" : `var(--${def.color}-bg)`;
  const colorFg = def.color === "primary" ? "var(--primary)" : `var(--${def.color})`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: colorBg, color: colorFg, display: "grid", placeItems: "center" }}>
              <Icon name={def.icon} size={20} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{def.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{def.desc}</div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div className="modal-body">
          {def.id === "restaurant" && (
            <div className="grid-2">
              <TextField label="Nom du restaurant" required value={String(d.name ?? "")} onChange={(e) => set("name", e.target.value)} />
              <SelectField label="Type de cuisine" value={String(d.cuisine ?? "Africaine & internationale")} onChange={(e) => set("cuisine", e.target.value)}
                options={["Africaine & internationale", "Ivoirienne traditionnelle", "Française", "Libanaise", "Asiatique", "Méditerranéenne"]} />
              <TextField label="Prix moyen / personne (FCFA)" type="number" value={String(d.priceAvg ?? "")} onChange={(e) => set("priceAvg", Number(e.target.value))} />
              <SelectField label="Capacité (couverts)" value={String(d.capacity ?? "50 couverts")} onChange={(e) => set("capacity", e.target.value)}
                options={["Moins de 30", "30–50 couverts", "50–100 couverts", "Plus de 100"]} />
            </div>
          )}
          {def.id === "bar" && (
            <div className="grid-2">
              <TextField label="Nom du bar" value={String(d.name ?? "")} onChange={(e) => set("name", e.target.value)} />
              <SelectField label="Type" value={String(d.type ?? "Rooftop bar")} onChange={(e) => set("type", e.target.value)}
                options={["Bar lobby", "Rooftop bar", "Pool bar", "Sports bar", "Lounge"]} />
            </div>
          )}
          {def.id === "pool" && (
            <div className="grid-2">
              <SelectField label="Type de piscine" value={String(d.type ?? "Extérieure")} onChange={(e) => set("type", e.target.value)}
                options={["Extérieure", "Intérieure", "Piscine à débordement", "Mixte"]} />
              <TextField label="Profondeur max (m)" type="number" value={String(d.depth ?? "")} onChange={(e) => set("depth", e.target.value)} />
            </div>
          )}
          {def.id === "conference" && (
            <div className="grid-2">
              <TextField label="Nombre de salles" type="number" value={String(d.rooms ?? "")} onChange={(e) => set("rooms", Number(e.target.value))} />
              <TextField label="Capacité max (personnes)" type="number" value={String(d.capacity ?? "")} onChange={(e) => set("capacity", Number(e.target.value))} />
            </div>
          )}
          {(def.id === "gym" || def.id === "spa" || def.id === "outdoor") && (
            <div className="grid-2">
              <TextField label="Description courte" value={String(d.description ?? "")} onChange={(e) => set("description", e.target.value)} />
              <TextField label="Horaires d'accès" value={String(d.hours ?? "")} onChange={(e) => set("hours", e.target.value)} placeholder="Ex: 06:00 – 22:00" />
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <Field label="Photos">
              <div className="thumbs" style={{ marginTop: 6 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="thumb" style={{ background: "var(--bg-2)" }}>
                    <Icon name="image" size={24} />
                  </div>
                ))}
                <div className="thumb placeholder">
                  <div style={{ textAlign: "center" }}>
                    <Icon name="plus" size={22} />
                    <div style={{ fontSize: 11, marginTop: 4 }}>Ajouter</div>
                  </div>
                </div>
              </div>
            </Field>
          </div>
        </div>

        <div className="modal-foot">
          <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="info" size={13} /> Une vidéo augmente l&apos;engagement de 2.5× dans le feed
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary" onClick={() => onSave(d)}>
              <Icon name="check" size={15} /> Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Step5({ state, update }: StepProps) {
  const va = state.valueAdds;
  const sv = state.services;
  const [open, setOpen] = useState<VaDef | null>(null);

  const setVa = <K extends keyof ValueAddsState>(k: K, v: ValueAddsState[K]) =>
    update("valueAdds", { ...va, [k]: v });
  const setSv = <K extends keyof ServicesState>(k: K, v: ServicesState[K]) =>
    update("services", { ...sv, [k]: v });

  const configured = Object.values(va).filter((x) => x.configured).length;

  return (
    <div className="step5-shell fade-in">
      <div className="page-head">
        <div className="page-eyebrow">Étape 5 sur 7</div>
        <h1 className="page-title">Ce qui fait votre différence</h1>
        <p className="page-desc">
          Restaurant, bar, piscine, spa… chaque espace mérite sa fiche avec photos et vidéo pour
          créer de l&apos;engagement dans le feed. Cliquez sur un espace pour le configurer.
        </p>
      </div>

      <div className="step5-bento">

        {/* ── Espaces à valoriser ── */}
        <section className="card step5-card step5-va-card">
          <SectionHead
            icon="sparkles"
            title="Espaces à valoriser"
            sub="Cliquez sur un espace pour ouvrir sa fiche de configuration"
            right={configured > 0 ? <Pill kind="success" dot>{configured}/{VA_DEFS.length} configurés</Pill> : undefined}
          />
          <div className="step5-va-grid">
            {VA_DEFS.map((d) => {
              const colorBg = d.color === "primary" ? "var(--primary-50)" : `var(--${d.color}-bg)`;
              const colorFg = d.color === "primary" ? "var(--primary)" : `var(--${d.color})`;
              const conf = va[d.id]?.configured;
              return (
                <div
                  key={d.id}
                  className={`step5-va-item${conf ? " configured" : ""}`}
                  onClick={() => setOpen(d)}
                >
                  <div className="step5-va-icon" style={{ background: colorBg, color: colorFg }}>
                    <Icon name={d.icon} size={20} />
                  </div>
                  <div className="step5-va-title">{d.title}</div>
                  <div className="step5-va-desc">{d.desc}</div>
                  <div className="step5-va-status">
                    <span className="step5-va-dot" />
                    {conf ? "Configuré" : "À configurer"}
                  </div>
                </div>
              );
            })}

            <div className="step5-va-item step5-va-add">
              <div className="step5-va-icon step5-va-icon-add">
                <Icon name="plus" size={20} />
              </div>
              <div className="step5-va-title">Autre espace</div>
              <div className="step5-va-desc">Boutique, galerie d&apos;art, cave…</div>
            </div>
          </div>
          <Tip>Chaque espace configuré obtient sa propre fiche dans le feed — les stories clients viennent s&apos;y attacher et génèrent du trafic organique vers votre hôtel.</Tip>
        </section>

        {/* ── 2. Espaces configurés ── */}
        {configured > 0 && (
          <section className="card step5-card step5-configured-card">
            <SectionHead
              icon="check"
              title="Espaces configurés"
              sub={`${configured} espace${configured > 1 ? "s" : ""} ajouté${configured > 1 ? "s" : ""} à votre fiche publique`}
              right={<Pill kind="success">{configured}/{VA_DEFS.length}</Pill>}
            />
            <div className="step5-configured-list">
              {VA_DEFS.filter((d) => va[d.id]?.configured).map((d) => {
                const colorBg = d.color === "primary" ? "var(--primary-50)" : `var(--${d.color}-bg)`;
                const colorFg = d.color === "primary" ? "var(--primary)" : `var(--${d.color})`;
                const data = va[d.id] as Record<string, unknown>;
                return (
                  <div key={d.id} className="row">
                    <div className="step5-conf-left">
                      <div className="step5-conf-icon" style={{ background: colorBg, color: colorFg }}>
                        <Icon name={d.icon} size={18} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="step5-conf-title">{d.title}</div>
                        <div className="step5-conf-meta">
                          {d.id === "restaurant" && `${data.name} · Cuisine ${data.cuisine}`}
                          {d.id === "bar"         && `${data.name} · ${data.type}`}
                          {d.id === "pool"        && `${data.type ?? "Extérieure"} · accès inclus`}
                          {d.id === "conference"  && `${data.rooms} salle(s) · ${data.capacity} pers. max`}
                          {(d.id === "gym" || d.id === "spa" || d.id === "outdoor") && "Configuré"}
                        </div>
                      </div>
                    </div>
                    <div className="step5-conf-actions">
                      <Pill kind="success" dot>Public</Pill>
                      <button className="btn btn-ghost btn-sm" onClick={() => setOpen(d)}>
                        <Icon name="edit" size={13} /> Modifier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 3. Services additionnels ── */}
        <section className="card step5-card step5-services-card">
          <SectionHead
            icon="grid"
            title="Services additionnels"
            sub="Visibles sur la fiche hôtel, sans fiche dédiée"
          />
          <div className="step5-services-grid">
            {SERVICES.map((it) => (
              <Checkbox
                key={it.id}
                checked={!!sv[it.id as keyof ServicesState]}
                onChange={(v) => setSv(it.id as keyof ServicesState, v as ServicesState[keyof ServicesState])}
                label={it.label}
                sub={"sub" in it ? it.sub : undefined}
              />
            ))}
          </div>
          <Tip>Ces services apparaissent en badges sur votre fiche — pas de fiche dédiée, mais visibles dans les filtres de recherche.</Tip>
        </section>

      </div>

      {open && (
        <ValueAddModal
          def={open}
          data={va[open.id] as Record<string, unknown>}
          onSave={(d) => {
            setVa(open.id, { ...d, configured: true } as ValueAddsState[typeof open.id]);
            setOpen(null);
          }}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}
