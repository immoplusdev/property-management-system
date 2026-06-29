"use client";
import { useState } from "react";
import type { StepProps, RoomType } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField, SelectField, Field } from "../ui/FormFields";
import { Pill } from "../ui/Pill";
import { Fcfa } from "../ui/Fcfa";
import { Icon } from "../ui/Icon";
import { PageHead } from "../ui/PageHead";
import { InsCard } from "../ui/InsCard";
import { Tip } from "../ui/Tip";
import { Btn } from "../ui/Btn";
import { InsModal } from "../ui/InsModal";
import { PhotoGallery } from "../ui/PhotoGallery";
import { RadioMark } from "../ui/RadioMark";

const CARD_COLORS = [
  { bg: "var(--primary-50)", fg: "var(--primary)" },
  { bg: "var(--violet-bg)",  fg: "var(--violet)" },
  { bg: "var(--teal-bg)",    fg: "var(--teal)" },
  { bg: "var(--amber-bg)",   fg: "var(--amber)" },
];

const BREAKFAST_LABELS: Record<RoomType["breakfastOption"], string> = {
  included:      "Inclus",
  available:     "En option",
  not_available: "Non disponible",
};

function RoomCard({ room, idx, onEdit, onRemove }: {
  room: RoomType; idx: number; onEdit: () => void; onRemove: () => void;
}) {
  const c = CARD_COLORS[idx % 4];
  return (
    <div className="rounded-[20px] bg-surface overflow-hidden shadow-card transition-[transform,box-shadow] duration-220 hover:shadow-card-hover hover:-translate-y-0.75 flex flex-col">
      <div
        className="relative h-36 flex flex-col items-center justify-center gap-1.5 shrink-0"
        style={{ background: c.bg, color: c.fg }}
      >
        <Icon name="bed" size={38} />
        {room.bedType && (
          <div className="text-[10.5px] font-bold tracking-wider uppercase" style={{ opacity: 0.55 }}>
            {room.bedType}
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <Pill kind={room.complete ? "success" : "warn"} dot>
            {room.complete ? "Complet" : "À compléter"}
          </Pill>
        </div>
        {room.imageIds.length > 0 && (
          <div className="absolute top-2.5 right-2.5 rounded-lg px-1.5 py-0.75 text-[10px] font-semibold flex items-center gap-1" style={{ background: "rgba(0,0,0,0.15)" }}>
            <Icon name="image" size={11} /> {room.imageIds.length}
          </div>
        )}
      </div>

      <div className="p-4 bg-surface flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2">
          <div className="text-[14.5px] font-bold tracking-[-0.015em] leading-snug">{room.name}</div>
          <div className="text-right shrink-0 text-[15px] font-bold text-ink tabular-nums">
            <Fcfa value={room.basePrice} />
            <span className="block text-[9.5px] text-ink-3 font-semibold uppercase tracking-wider mt-0.5">/nuit</span>
          </div>
        </div>

        <div className="text-[11px] text-ink-2 mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-0.75"><Icon name="users" size={12} /> ×{room.maxOccupancy}</span>
          {room.surface !== "" && room.surface !== 0 && (
            <>
              <span className="text-ink-4">·</span>
              <span>{room.surface} m²</span>
            </>
          )}
          {Number(room.totalRooms) > 0 && (
            <>
              <span className="text-ink-4">·</span>
              <span>{room.totalRooms} ch.</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-1.25 mt-auto pt-2 mb-2.5">
          <span className="text-[9px] font-semibold px-1.5 py-0.75 bg-surface-2 rounded-sm text-ink-2 uppercase tracking-wider">
            {BREAKFAST_LABELS[room.breakfastOption]}
          </span>
        </div>

        <div className="flex gap-1.5 pt-2.5 border-t border-border-soft">
          <Btn variant="ghost" size="sm" className="flex-1 h-7 text-[11.5px] justify-center" onClick={onEdit}>
            <Icon name="edit" size={13} /> Modifier
          </Btn>
          <Btn variant="icon" size="sm" className="w-7 h-7" onClick={onRemove} aria-label="Supprimer">
            <Icon name="trash" size={13} />
          </Btn>
        </div>
      </div>
    </div>
  );
}

function RadioCard({ checked, title, sub, onClick }: {
  checked: boolean; title: string; sub: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left border-[1.5px] rounded-2xl p-4 cursor-pointer transition-all duration-220 active:scale-[0.99] ${
        checked
          ? "border-primary-200 bg-primary-50"
          : "border-border bg-surface hover:border-border-strong hover:bg-surface-2 hover:-translate-y-px hover:shadow-sm"
      }`}
    >
      <RadioMark checked={checked} className="absolute top-3.5 right-3.5" />
      <div className="font-semibold text-[13px] pr-6">{title}</div>
      <div className="text-[11px] text-ink-3 mt-0.5">{sub}</div>
    </button>
  );
}

function RoomModal({ room, setRoom, onSave, onClose }: {
  room: RoomType;
  setRoom: (r: RoomType) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = <K extends keyof RoomType>(k: K, v: RoomType[K]) => setRoom({ ...room, [k]: v });

  const BREAKFAST_SUB: Record<RoomType["breakfastOption"], string> = {
    included:      "Inclus dans la nuitée",
    available:     "+ 4 000 FCFA / pers.",
    not_available: "Non proposé",
  };

  return (
    <InsModal
      eyebrow={room.isNew ? "Nouveau type de chambre" : "Modifier le type"}
      title={room.name || "Nouveau type de chambre"}
      onClose={onClose}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={onSave}>
            <Icon name="check" size={15} />
            {room.isNew ? "Ajouter le type" : "Enregistrer"}
          </Btn>
        </>
      }
    >
      <div className="flex flex-col gap-5">

        {/* Identification */}
        <div>
          <SectionHead icon="bed" title="Identification" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Nom du type" required
              value={room.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Suite Junior Vue Lagune"
              span={2}
            />
            <TextField
              label="Nombre de chambres" required
              type="number"
              value={String(room.totalRooms || "")}
              onChange={(e) => set("totalRooms", Number(e.target.value))}
              placeholder="10"
            />
            <TextField
              label="Surface (m²)"
              type="number"
              value={String(room.surface || "")}
              onChange={(e) => set("surface", e.target.value)}
              placeholder="22"
            />
          </div>
        </div>

        <hr className="border-0 border-t border-border" />

        {/* Configuration du lit */}
        <div>
          <SectionHead icon="bed" title="Configuration du lit" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <SelectField
              label="Type de lit"
              value={room.bedType}
              onChange={(e) => set("bedType", e.target.value)}
              options={[
                { value: "",                        label: "Sélectionner…" },
                { value: "Grand lit (King)",         label: "Grand lit (King)" },
                { value: "Grand lit (Queen)",        label: "Grand lit (Queen)" },
                { value: "Lits jumeaux",             label: "Lits jumeaux" },
                { value: "Lit simple",               label: "Lit simple" },
                { value: "Lits superposés",          label: "Lits superposés" },
                { value: "Canapé-lit",               label: "Canapé-lit" },
              ]}
            />
            <TextField
              label="Nombre de lits"
              type="number"
              value={String(room.bedCount || "")}
              onChange={(e) => set("bedCount", Number(e.target.value))}
              placeholder="1"
            />
            <TextField
              label="Capacité max (pers.)"
              type="number"
              value={String(room.maxOccupancy || "")}
              onChange={(e) => set("maxOccupancy", Number(e.target.value))}
              placeholder="2"
            />
          </div>
        </div>

        <hr className="border-0 border-t border-border" />

        {/* Tarification */}
        <div>
          <SectionHead icon="moneyBill" title="Tarification" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <TextField
              label="Prix / nuit (FCFA)" required
              type="number"
              value={String(room.basePrice || "")}
              onChange={(e) => set("basePrice", Number(e.target.value))}
              placeholder="35 000"
            />
            <TextField
              label="Prix week-end (FCFA)"
              type="number"
              value={String(room.weekendPrice || "")}
              onChange={(e) => set("weekendPrice", e.target.value)}
              hint="Si différent du prix standard"
              placeholder="40 000"
            />
            <TextField
              label="Longue durée (FCFA)"
              type="number"
              value={String(room.longStayPrice || "")}
              onChange={(e) => set("longStayPrice", e.target.value)}
              hint="À partir de 7 nuits"
              placeholder="30 000"
            />
          </div>

          <Field label="Petit-déjeuner" className="mt-4.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-1.5">
              {(["included", "available", "not_available"] as const).map((opt) => (
                <RadioCard
                  key={opt}
                  checked={room.breakfastOption === opt}
                  title={BREAKFAST_LABELS[opt]}
                  sub={BREAKFAST_SUB[opt]}
                  onClick={() => set("breakfastOption", opt)}
                />
              ))}
            </div>
          </Field>
        </div>

        <hr className="border-0 border-t border-border" />

        {/* Photos */}
        <div>
          <SectionHead icon="image" title="Photos de la chambre" />
          <PhotoGallery
            imageIds={room.imageIds}
            onChange={(ids) => set("imageIds", ids)}
            hint="Minimum 4 photos recommandées par type de chambre"
          />
        </div>

      </div>
    </InsModal>
  );
}

export function Step4({ state, update }: StepProps) {
  const rooms = state.roomTypes;
  const [editing, setEditing] = useState<RoomType | null>(null);

  const totalRooms = rooms.reduce((sum, r) => sum + Number(r.totalRooms), 0);
  const avgPrice = rooms.length
    ? Math.round(rooms.reduce((s, r) => s + r.basePrice, 0) / rooms.length)
    : 0;

  const openNew = () =>
    setEditing({
      id: "rt-" + Date.now(),
      name: "",
      totalRooms: 0,
      surface: "",
      bedType: "",
      bedCount: 1,
      maxOccupancy: 2,
      basePrice: 0,
      weekendPrice: "",
      longStayPrice: "",
      breakfastOption: "not_available",
      imageIds: [],
      amenities: [],
      complete: false,
      isNew: true,
    });

  const save = () => {
    if (!editing) return;
    const complete = !!editing.name && editing.basePrice > 0;
    if (editing.isNew) {
      update("roomTypes", [...rooms, { ...editing, complete, isNew: false }]);
    } else {
      update("roomTypes", rooms.map((r) => r.id === editing.id ? { ...editing, complete } : r));
    }
    setEditing(null);
  };

  const remove = (id: string) => update("roomTypes", rooms.filter((r) => r.id !== id));

  const stats = [
    { icon: "layers",    color: "primary-50", col: "primary", val: rooms.length,                                  label: "Types de chambres" },
    { icon: "bed",       color: "violet-bg",  col: "violet",  val: totalRooms,                                    label: "Chambres au total" },
    { icon: "moneyBill", color: "teal-bg",    col: "teal",    val: <Fcfa value={avgPrice} />,                     label: "Prix moyen / nuit" },
    { icon: "image",     color: "amber-bg",   col: "amber",   val: rooms.reduce((s, r) => s + r.imageIds.length, 0), label: "Photos uploadées" },
  ] as const;

  return (
    <div className="flex flex-col gap-5 animate-insc-fade">

      <div className="flex items-end justify-between gap-6">
        <PageHead
          eyebrow="Étape 4 sur 7 — cœur du flow"
          title="Vos types de chambres"
          desc="Chaque « type » est une entité indépendante avec ses propres prix, photos et calendrier. Un hôtel de 30 chambres avec 4 types remplit ce formulaire 4 fois."
        />
        <Btn variant="primary" className="shrink-0" onClick={openNew}>
          <Icon name="plus" size={16} /> Ajouter un type
        </Btn>
      </div>

      {/* Stats */}
      <InsCard flat className="p-0! overflow-hidden">
        <div className="flex items-stretch">
          {stats.map((s) => (
            <div key={s.label} className="flex-1 px-6 py-5.5 border-r border-border last:border-r-0 flex flex-col gap-2">
              <div
                className="w-8.5 h-8.5 rounded-xl grid place-items-center shrink-0"
                style={{ background: `var(--${s.color})`, color: `var(--${s.col})` }}
              >
                <Icon name={s.icon} size={16} />
              </div>
              <div className="text-[26px] font-extrabold tracking-tighter tabular-nums leading-none text-ink">{s.val}</div>
              <div className="text-[11.5px] text-ink-3 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </InsCard>

      <Tip>Nommez vos types avec le lit + la vue : <strong>«&nbsp;Suite King Lagune&nbsp;»</strong> convertit 2× mieux que «&nbsp;Suite Deluxe&nbsp;».</Tip>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((r, idx) => (
          <RoomCard
            key={r.id}
            room={r}
            idx={idx}
            onEdit={() => setEditing({ ...r })}
            onRemove={() => remove(r.id)}
          />
        ))}
        <button
          type="button"
          onClick={openNew}
          className="group border-[1.5px] border-dashed border-border-strong rounded-[20px] bg-surface flex flex-col items-center justify-center gap-3.5 min-h-70 cursor-pointer transition-colors duration-150 p-7 text-center hover:border-primary hover:bg-primary-50"
        >
          <div className="w-13 h-13 rounded-full bg-surface-2 text-ink-2 grid place-items-center transition-colors duration-150 group-hover:bg-primary group-hover:text-white">
            <Icon name="plus" size={22} />
          </div>
          <div className="font-bold text-[14px] text-ink transition-colors duration-150 group-hover:text-primary">
            Ajouter un type de chambre
          </div>
          <div className="text-[12px] text-ink-3 leading-normal">
            Suite Junior, Familiale, Communicante, Dortoir…
          </div>
        </button>
      </div>

      <InsCard flat className="flex flex-col gap-4 px-6 py-5.5">
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-amber-bg text-amber grid place-items-center">
            <Icon name="calendar" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-[14px] text-ink">Pensez à charger un calendrier par type de chambre</div>
            <div className="text-[12.5px] text-ink-3 mt-0.75 leading-normal">
              Pour chaque type, vous pourrez bloquer des dates indisponibles directement depuis le tableau de bord PMS.
            </div>
          </div>
        </div>
        <Tip>Un prix week-end <strong>+15%</strong> est standard pour les hôtels urbains en Côte d&apos;Ivoire — activez-le dans chaque type de chambre.</Tip>
      </InsCard>

      {editing && (
        <RoomModal
          room={editing}
          setRoom={setEditing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
