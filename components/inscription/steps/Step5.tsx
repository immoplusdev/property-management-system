"use client";
import { useState } from "react";
import type { StepProps, ValueAddsState, SpaceKey, CustomSpace } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField, TextArea, SelectField, Field } from "../ui/FormFields";
import { Checkbox } from "../ui/Checkbox";
import { Toggle } from "../ui/Toggle";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";
import { PageHead } from "../ui/PageHead";
import { InsCard } from "../ui/InsCard";
import { Tip } from "../ui/Tip";
import { Btn } from "../ui/Btn";
import { InsModal } from "../ui/InsModal";
import { PhotoGallery } from "../ui/PhotoGallery";
import { uploadFile } from "@/lib/api/files/files.client";

// ─── Définitions des espaces fixes ──────────────────────────────────────────

const VA_DEFS = [
  { id: "restaurant", apiType: "restaurant",      title: "Restaurant",           desc: "Cuisine, carte, photos & ambiance",           icon: "utensils",  color: "amber"   },
  { id: "bar",        apiType: "bar",             title: "Bar / Lounge",          desc: "Cocktails, happy hour, soirées",              icon: "martini",   color: "pink"    },
  { id: "pool",       apiType: "piscine",         title: "Piscine",               desc: "Type, horaires, service de serviettes",       icon: "waves",     color: "primary" },
  { id: "gym",        apiType: "salle_de_sport",  title: "Salle de sport",        desc: "Équipements, coach, accès",                   icon: "dumbbell",  color: "violet"  },
  { id: "spa",        apiType: "spa",             title: "Spa & bien-être",       desc: "Massages, hammam, soins",                     icon: "sparkles",  color: "teal"    },
  { id: "conference", apiType: "salle_conference", title: "Salles de conférence", desc: "Capacité, équipement A/V, tarifs",            icon: "briefcase", color: "primary" },
  { id: "outdoor",    apiType: "terrasse",        title: "Espaces extérieurs",    desc: "Jardin, terrasse, rooftop, privatisation",    icon: "palmtree",  color: "teal"    },
] as const;

type VaDef = typeof VA_DEFS[number];

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

const CUSTOM_ICONS = [
  "sparkles", "star", "camera", "briefcase", "car", "chefHat",
  "martini", "waves", "dumbbell", "palmtree", "shield", "grid",
  "award", "flag", "layers", "smartphone",
] as const;

// ─── Helpers couleurs ────────────────────────────────────────────────────────

const vaBg = (color: string) => color === "primary" ? "var(--primary-50)" : `var(--${color}-bg)`;
const vaFg = (color: string) => color === "primary" ? "var(--primary)" : `var(--${color})`;

// ─── Types d état ouverture modal ────────────────────────────────────────────

type OpenState =
  | { kind: "space"; def: VaDef }
  | { kind: "custom-new" }
  | { kind: "custom-edit"; data: CustomSpace }
  | null;

// ─── Modal configuration espace fixe ────────────────────────────────────────

function SpaceConfigModal({ def, data, onSave, onClose }: {
  def: VaDef;
  data: Record<string, unknown>;
  onSave: (d: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState<Record<string, unknown>>({
    isOpenToPublic: true,
    imageIds: [],
    ...data,
  });
  const set = (k: string, v: unknown) => setD((prev) => ({ ...prev, [k]: v }));

  return (
    <InsModal
      title={def.title}
      head={
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0"
            style={{ background: vaBg(def.color), color: vaFg(def.color) }}>
            <Icon name={def.icon} size={20} />
          </div>
          <div>
            <div className="text-[18px] font-bold">{def.title}</div>
            <div className="text-[12px] text-ink-3">{def.desc}</div>
          </div>
        </div>
      }
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => onSave(d)}>
            <Icon name="check" size={15} /> Enregistrer
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Toggle ouvert au public */}
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-surface-2 rounded-xl">
          <div>
            <div className="font-semibold text-[13.5px]">Ouvert au public</div>
            <div className="text-[11.5px] text-ink-3 mt-0.5">Visible et réservable depuis le feed Immo Plus</div>
          </div>
          <Toggle on={!!d.isOpenToPublic} onChange={(v) => set("isOpenToPublic", v)} />
        </div>

        <hr className="border-0 border-t border-border" />

        {/* Champs spécifiques par type */}
        {def.id === "restaurant" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Nom du restaurant" required
              value={String(d.name ?? "")} onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Le Baobab" />
            <SelectField label="Type de cuisine"
              value={String(d.cuisine ?? "")}
              onChange={(e) => set("cuisine", e.target.value)}
              options={[
                { value: "", label: "Sélectionner…" },
                { value: "Africaine & internationale", label: "Africaine & internationale" },
                { value: "Ivoirienne traditionnelle",  label: "Ivoirienne traditionnelle" },
                { value: "Française",                  label: "Française" },
                { value: "Libanaise",                  label: "Libanaise" },
                { value: "Asiatique",                  label: "Asiatique" },
                { value: "Méditerranéenne",             label: "Méditerranéenne" },
              ]} />
            <TextField label="Prix moyen / personne (FCFA)" type="number"
              value={String(d.priceAvg ?? "")} onChange={(e) => set("priceAvg", Number(e.target.value))}
              placeholder="8 000" />
            <SelectField label="Capacité (couverts)"
              value={String(d.capacity ?? "")}
              onChange={(e) => set("capacity", e.target.value)}
              options={[
                { value: "", label: "Sélectionner…" },
                { value: "Moins de 30",    label: "Moins de 30" },
                { value: "30–50 couverts", label: "30–50 couverts" },
                { value: "50–100 couverts", label: "50–100 couverts" },
                { value: "Plus de 100",    label: "Plus de 100" },
              ]} />
          </div>
        )}

        {def.id === "bar" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Nom du bar"
              value={String(d.name ?? "")} onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Sky Lounge" />
            <SelectField label="Type de bar"
              value={String(d.type ?? "")}
              onChange={(e) => set("type", e.target.value)}
              options={[
                { value: "", label: "Sélectionner…" },
                { value: "Bar lobby",   label: "Bar lobby" },
                { value: "Rooftop bar", label: "Rooftop bar" },
                { value: "Pool bar",    label: "Pool bar" },
                { value: "Sports bar",  label: "Sports bar" },
                { value: "Lounge",      label: "Lounge" },
              ]} />
          </div>
        )}

        {def.id === "pool" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Type de piscine"
              value={String(d.type ?? "")}
              onChange={(e) => set("type", e.target.value)}
              options={[
                { value: "", label: "Sélectionner…" },
                { value: "Extérieure",             label: "Extérieure" },
                { value: "Intérieure",             label: "Intérieure" },
                { value: "Piscine à débordement",  label: "Piscine à débordement" },
                { value: "Mixte",                  label: "Mixte" },
              ]} />
            <TextField label="Profondeur max (m)" type="number"
              value={String(d.depth ?? "")} onChange={(e) => set("depth", e.target.value)}
              placeholder="1.8" />
          </div>
        )}

        {def.id === "conference" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Nombre de salles" type="number"
              value={String(d.rooms ?? "")} onChange={(e) => set("rooms", Number(e.target.value))}
              placeholder="2" />
            <TextField label="Capacité max (personnes)" type="number"
              value={String(d.capacity ?? "")} onChange={(e) => set("capacity", Number(e.target.value))}
              placeholder="80" />
          </div>
        )}

        {(def.id === "gym" || def.id === "spa" || def.id === "outdoor") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Description courte"
              value={String(d.description ?? "")} onChange={(e) => set("description", e.target.value)}
              placeholder="Ex: Salle entièrement équipée, coach disponible" />
            <TextField label="Horaires d'accès"
              value={String(d.hours ?? "")} onChange={(e) => set("hours", e.target.value)}
              placeholder="06:00 – 22:00" />
          </div>
        )}

        <hr className="border-0 border-t border-border" />

        {/* Photos */}
        <div>
          <SectionHead icon="image" title="Photos" />
          <PhotoGallery
            imageIds={(d.imageIds as string[] | undefined) ?? []}
            onChange={(ids) => set("imageIds", ids)}
            hint="Photos de cet espace affichées dans le feed Immo Plus"
          />
        </div>

      </div>
    </InsModal>
  );
}

// ─── Modal espace personnalisé ───────────────────────────────────────────────

function CustomSpaceModal({ initial, onSave, onClose }: {
  initial?: CustomSpace;
  onSave: (d: Omit<CustomSpace, "id">) => void;
  onClose: () => void;
}) {
  const [d, setD] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    icon: initial?.icon ?? "sparkles",
    isOpenToPublic: initial?.isOpenToPublic ?? true,
    imageIds: initial?.imageIds ?? [] as string[],
  });
  const set = (k: string, v: unknown) => setD((prev) => ({ ...prev, [k]: v }));

  return (
    <InsModal
      eyebrow="Espace personnalisé"
      title={d.title || "Nouvel espace"}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => onSave(d)} disabled={!d.title.trim()}>
            <Icon name="check" size={15} /> {initial ? "Enregistrer" : "Ajouter l'espace"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Toggle ouvert au public */}
        <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-surface-2 rounded-xl">
          <div>
            <div className="font-semibold text-[13.5px]">Ouvert au public</div>
            <div className="text-[11.5px] text-ink-3 mt-0.5">Visible et réservable depuis le feed Immo Plus</div>
          </div>
          <Toggle on={d.isOpenToPublic} onChange={(v) => set("isOpenToPublic", v)} />
        </div>

        <hr className="border-0 border-t border-border" />

        {/* Infos */}
        <div className="flex flex-col gap-4">
          <TextField
            label="Titre de l'espace" required
            value={d.title} onChange={(e) => set("title", e.target.value)}
            placeholder="Ex: Salle de jeux, Galerie d'art, Boutique…"
          />
          <TextArea
            label="Description"
            value={d.description} onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Décrivez cet espace en quelques mots…"
          />
        </div>

        <hr className="border-0 border-t border-border" />

        {/* Sélecteur d'icône */}
        <Field label="Icône de l'espace">
          <div className="flex flex-wrap gap-2 mt-1.5">
            {CUSTOM_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => set("icon", icon)}
                className={`w-10 h-10 rounded-xl grid place-items-center transition-all duration-150 ${
                  d.icon === icon
                    ? "bg-primary text-white shadow-[0_0_0_2px_var(--primary)]"
                    : "bg-surface-2 text-ink-2 hover:bg-surface-3 hover:text-ink"
                }`}
              >
                <Icon name={icon} size={18} />
              </button>
            ))}
          </div>
        </Field>

        <hr className="border-0 border-t border-border" />

        {/* Photos */}
        <div>
          <div className="text-[11px] font-bold tracking-wider uppercase text-ink-2 mb-2.5">
            Photos de l&apos;espace
          </div>
          <PhotoGallery
            fileIds={d.imageIds as string[]}
            onAdd={async (file) => {
              const uploaded = await uploadFile(file);
              set("imageIds", [...(d.imageIds as string[]), uploaded.id]);
            }}
            onRemove={(fileId) => {
              set("imageIds", (d.imageIds as string[]).filter((id) => id !== fileId));
            }}
          />
        </div>

      </div>
    </InsModal>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function Step5({ state, update }: StepProps) {
  const va = state.valueAdds;
  const sv = state.services;
  const [openModal, setOpenModal] = useState<OpenState>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const setVa = (k: SpaceKey, v: ValueAddsState[SpaceKey]) =>
    update("valueAdds", { ...va, [k]: v });

  const toggleSpace = (id: SpaceKey) => {
    const entry = va[id];
    setVa(id, { ...entry, configured: !entry.configured });
  };

  const saveSpaceConfig = (def: VaDef, d: Record<string, unknown>) => {
    setVa(def.id, { ...va[def.id], ...d, configured: true } as ValueAddsState[SpaceKey]);
    setOpenModal(null);
  };

  const addCustomSpace = (d: Omit<CustomSpace, "id">) => {
    update("valueAdds", {
      ...va,
      customSpaces: [...va.customSpaces, { id: "cs-" + Date.now(), ...d }],
    });
    setOpenModal(null);
  };

  const saveCustomSpace = (id: string, d: Omit<CustomSpace, "id">) => {
    update("valueAdds", {
      ...va,
      customSpaces: va.customSpaces.map((cs) => cs.id === id ? { ...cs, ...d } : cs),
    });
    setOpenModal(null);
  };

  const removeCustomSpace = (id: string) => {
    update("valueAdds", {
      ...va,
      customSpaces: va.customSpaces.filter((cs) => cs.id !== id),
    });
  };

  const toggleSpacePublic = (def: VaDef) => {
    const entry = va[def.id];
    setVa(def.id, { ...entry, isOpenToPublic: !entry.isOpenToPublic } as ValueAddsState[SpaceKey]);
  };

  const toggleCustomSpacePublic = (id: string) => {
    update("valueAdds", {
      ...va,
      customSpaces: va.customSpaces.map((cs) =>
        cs.id === id ? { ...cs, isOpenToPublic: !cs.isOpenToPublic } : cs
      ),
    });
  };

  // ── stats ─────────────────────────────────────────────────────────────────

  const configuredFixed  = VA_DEFS.filter((d) => va[d.id].configured).length;
  const configuredTotal  = configuredFixed + va.customSpaces.length;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 animate-insc-fade">
      <PageHead
        eyebrow="Étape 5 sur 7"
        title="Ce qui fait votre différence"
        desc="Sélectionnez les espaces disponibles dans votre établissement puis configurez chacun avec photos et détails pour créer de l'engagement dans le feed."
      />

      <div className="grid grid-cols-12 gap-5">

        {/* ── Espaces à valoriser ─────────────────────────────────────────── */}
        <InsCard flat className="col-span-12">
          <SectionHead
            icon="sparkles"
            title="Espaces à valoriser"
            sub="Cliquez sur un espace pour le sélectionner ou le désélectionner"
            right={configuredTotal > 0
              ? <Pill kind="success" dot>{configuredTotal} sélectionné{configuredTotal > 1 ? "s" : ""}</Pill>
              : undefined}
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4.5">
            {VA_DEFS.map((d) => {
              const conf = va[d.id].configured;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleSpace(d.id)}
                  className="relative text-left rounded-2xl p-4.5 cursor-pointer border border-border bg-white"
                >
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border-[1.5px] grid place-items-center transition-all duration-150 ${
                    conf
                      ? "border-primary bg-primary"
                      : "border-border-strong bg-transparent"
                  }`}>
                    {conf && <Icon name="check" size={12} stroke={3} className="text-white" />}
                  </div>
                  <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 shrink-0"
                    style={{ background: vaBg(d.color), color: vaFg(d.color) }}>
                    <Icon name={d.icon} size={20} />
                  </div>
                  <div className="text-[14px] font-bold tracking-[-0.015em] pr-6">{d.title}</div>
                  <div className="text-[11.5px] text-ink-3 mt-1 leading-[1.4]">{d.desc}</div>
                </button>
              );
            })}

            {/* Autre espace */}
            <button
              type="button"
              onClick={() => setOpenModal({ kind: "custom-new" })}
              className="text-left border border-dashed border-border rounded-2xl p-4.5 cursor-pointer transition-colors duration-150 hover:border-primary hover:bg-primary-50 group"
            >
              <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 bg-surface-2 text-ink-3 transition-colors duration-150 group-hover:bg-primary group-hover:text-white">
                <Icon name="plus" size={20} />
              </div>
              <div className="text-[14px] font-bold tracking-[-0.015em] text-ink-2 group-hover:text-primary transition-colors duration-150">
                Autre espace
              </div>
              <div className="text-[11.5px] text-ink-3 mt-1 leading-[1.4]">
                Boutique, galerie d&apos;art, cave à vins…
              </div>
            </button>

            {/* Espaces personnalisés déjà ajoutés */}
            {va.customSpaces.map((cs) => (
              <div key={cs.id}
                className="relative text-left rounded-2xl p-4.5 border border-border bg-white">
                <button
                  type="button"
                  onClick={() => removeCustomSpace(cs.id)}
                  className="absolute top-3 right-3 w-5 h-5 rounded-sm border-2 border-border-strong bg-danger text-white grid place-items-center cursor-pointer transition-all duration-150"
                  aria-label="Supprimer"
                >
                  <Icon name="x" size={12} stroke={2.5} />
                </button>
                <div className="w-11 h-11 rounded-xl grid place-items-center mb-3 bg-primary-50 text-primary">
                  <Icon name={cs.icon} size={20} />
                </div>
                <div className="text-[14px] font-bold tracking-[-0.015em] pr-6">{cs.title}</div>
                {cs.description && (
                  <div className="text-[11.5px] text-ink-3 mt-1 leading-[1.4] line-clamp-2">{cs.description}</div>
                )}
              </div>
            ))}
          </div>
          <Tip>Chaque espace configuré obtient sa propre fiche dans le feed — les stories clients viennent s&apos;y attacher et génèrent du trafic organique vers votre hôtel.</Tip>
        </InsCard>

        {/* ── Espaces à configurer ────────────────────────────────────────── */}
        {(configuredFixed > 0 || va.customSpaces.length > 0) && (
          <InsCard flat className="col-span-12 lg:col-span-6">
            <SectionHead
              icon="check"
              title="Espaces à configurer"
              sub={`${configuredTotal} espace${configuredTotal > 1 ? "s" : ""} sélectionné${configuredTotal > 1 ? "s" : ""} — ajoutez les détails pour chacun`}
              right={<Pill kind="success">{configuredTotal}</Pill>}
            />
            <div className="flex flex-col">
              {VA_DEFS.filter((d) => va[d.id].configured).map((d) => {
                const entry = va[d.id] as unknown as Record<string, unknown>;
                const isPublic = !!entry.isOpenToPublic;
                const hasDetails = !!(entry.name || entry.type || entry.rooms || entry.description);
                return (
                  <div key={d.id}
                    className="flex items-center justify-between gap-4 py-4 border-b border-border first:pt-0 last:pb-0 last:border-b-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                        style={{ background: vaBg(d.color), color: vaFg(d.color) }}>
                        <Icon name={d.icon} size={17} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold tracking-[-0.01em]">{d.title}</div>
                        <div className="text-[11.5px] text-ink-3 mt-px truncate">
                          {d.id === "restaurant" && entry.name
                            ? `${entry.name}${entry.cuisine ? ` · ${entry.cuisine}` : ""}`
                            : d.id === "bar" && entry.name
                            ? `${entry.name}${entry.type ? ` · ${entry.type}` : ""}`
                            : d.id === "pool"
                            ? (entry.type ? String(entry.type) : "Piscine")
                            : d.id === "conference" && entry.rooms
                            ? `${entry.rooms} salle(s)${entry.capacity ? ` · ${entry.capacity} pers.` : ""}`
                            : hasDetails ? "Configuré" : "À configurer — cliquez sur Modifier"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Btn variant="ghost" size="sm"
                        onClick={() => toggleSpacePublic(d)}>
                        <Icon name={isPublic ? "share" : "lock"} size={13} /> {isPublic ? "Public" : "Privé"}
                      </Btn>
                      <Btn variant="ghost" size="sm"
                        onClick={() => setOpenModal({ kind: "space", def: d })}>
                        <Icon name="edit" size={13} /> Modifier
                      </Btn>
                    </div>
                  </div>
                );
              })}

              {va.customSpaces.map((cs) => (
                <div key={cs.id}
                  className="flex items-center justify-between gap-4 py-4 border-b border-border first:pt-0 last:pb-0 last:border-b-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0 bg-surface-2 text-ink-2">
                      <Icon name={cs.icon} size={17} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold tracking-[-0.01em]">{cs.title}</div>
                      {cs.description && (
                        <div className="text-[11.5px] text-ink-3 mt-px truncate">{cs.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Btn variant="ghost" size="sm"
                      onClick={() => toggleCustomSpacePublic(cs.id)}>
                      <Icon name={cs.isOpenToPublic ? "share" : "lock"} size={13} /> {cs.isOpenToPublic ? "Public" : "Privé"}
                    </Btn>
                    <Btn variant="ghost" size="sm"
                      onClick={() => setOpenModal({ kind: "custom-edit", data: cs })}>
                      <Icon name="edit" size={13} /> Modifier
                    </Btn>
                  </div>
                </div>
              ))}
            </div>
          </InsCard>
        )}

        {/* ── Services additionnels ────────────────────────────────────────── */}
        <InsCard flat className="col-span-12 lg:col-span-6">
          <SectionHead
            icon="grid"
            title="Services additionnels"
            sub="Visibles sur la fiche hôtel, sans fiche dédiée"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-1.5">
            {SERVICES.map((it) => (
              <Checkbox
                key={it.id}
                checked={!!sv[it.id as keyof typeof sv]}
                onChange={(v) => update("services", { ...sv, [it.id]: v })}
                label={it.label}
                sub={"sub" in it ? it.sub : undefined}
              />
            ))}
          </div>
          <Tip>Ces services apparaissent en badges sur votre fiche — pas de fiche dédiée, mais visibles dans les filtres de recherche.</Tip>
        </InsCard>

      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}

      {openModal?.kind === "space" && (
        <SpaceConfigModal
          def={openModal.def}
          data={va[openModal.def.id] as unknown as Record<string, unknown>}
          onSave={(d) => saveSpaceConfig(openModal.def, d)}
          onClose={() => setOpenModal(null)}
        />
      )}

      {openModal?.kind === "custom-new" && (
        <CustomSpaceModal
          onSave={addCustomSpace}
          onClose={() => setOpenModal(null)}
        />
      )}

      {openModal?.kind === "custom-edit" && (
        <CustomSpaceModal
          initial={openModal.data}
          onSave={(d) => saveCustomSpace(openModal.data.id, d)}
          onClose={() => setOpenModal(null)}
        />
      )}
    </div>
  );
}
