"use client";
import { useState } from "react";
import type { StepProps, RoomType } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField, SelectField, Field } from "../ui/FormFields";
import { Pill } from "../ui/Pill";
import { Fcfa } from "../ui/Fcfa";
import { Icon } from "../ui/Icon";

const COVER_IMAGES: Record<string, string> = {
  "rt-cover-1": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
  "rt-cover-2": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
  "rt-cover-3": "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
  "rt-cover-4": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
};
const COVERS = Object.keys(COVER_IMAGES);

const BREAKFAST_LABELS: Record<RoomType["breakfastOption"], string> = {
  included:      "Inclus",
  available:     "En option",
  not_available: "Non disponible",
};

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="step4-tip">
      <div className="step4-tip-dot"><Icon name="sparkles" size={12} /></div>
      <p className="step4-tip-text">{children}</p>
    </div>
  );
}

function RoomCard({ room, onEdit, onRemove }: { room: RoomType; onEdit: () => void; onRemove: () => void }) {
  const bgImage = COVER_IMAGES[room.cover] || COVER_IMAGES["rt-cover-1"];
  return (
    <div className="rt-card">
      <div className="rt-cover" style={{ backgroundImage: `url('${bgImage}')`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", top: 10, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Pill kind={room.complete ? "success" : "warn"} dot>
            {room.complete ? "Complet" : "À compléter"}
          </Pill>
          <div style={{ display: "flex", gap: 4 }}>
            {room.hasVideo && (
              <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", borderRadius: 8, padding: "3px 6px", color: "#fff", display: "flex", alignItems: "center" }}>
                <Icon name="video" size={11} />
              </div>
            )}
            <div style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", borderRadius: 8, padding: "3px 6px", color: "#fff", fontSize: 10, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="image" size={11} /> {room.photos}
            </div>
          </div>
        </div>
      </div>

      <div className="rt-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div className="rt-name">{room.name}</div>
          <div className="rt-price" style={{ textAlign: "right", flexShrink: 0 }}>
            <Fcfa value={room.basePrice} />
            <span style={{ fontSize: 9.5, color: "var(--text-3)", display: "block", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>/nuit</span>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="bed" size={12} /> {room.bedType.split(" ")[0]}</span>
          <span style={{ color: "var(--text-4)" }}>·</span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="users" size={12} /> ×{room.maxOccupancy}</span>
          <span style={{ color: "var(--text-4)" }}>·</span>
          <span>{room.surface} m²</span>
        </div>

        <div className="rt-feats" style={{ marginTop: "auto", marginBottom: 10 }}>
          <span className="rt-feat">{BREAKFAST_LABELS[room.breakfastOption]}</span>
        </div>

        <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid var(--border-soft)" }}>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, height: 28, fontSize: 11.5, justifyContent: "center" }} onClick={onEdit}>
            <Icon name="edit" size={13} /> Modifier
          </button>
          <button className="btn-icon" style={{ width: 28, height: 28 }} onClick={onRemove} title="Supprimer">
            <Icon name="trash" size={13} />
          </button>
          <button className="btn-icon" style={{ width: 28, height: 28 }} title="Calendrier">
            <Icon name="calendar" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomModal({ room, setRoom, onSave, onClose }: {
  room: RoomType;
  setRoom: (r: RoomType) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = <K extends keyof RoomType>(k: K, v: RoomType[K]) => setRoom({ ...room, [k]: v });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {room.isNew ? "Nouveau type" : "Modifier le type"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{room.name || "Sans nom"}</div>
          </div>
          <button className="btn-icon" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        <div className="modal-body">
          <SectionHead icon="bed" title="Identification" />
          <div className="grid-2">
            <TextField label="Nom du type" required value={room.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Suite Junior Vue Lagune" span={2} />
            <TextField label="Nombre de chambres" required type="number" value={String(room.totalRooms)} onChange={(e) => set("totalRooms", Number(e.target.value))} />
            <TextField label="Surface (m²)" type="number" value={String(room.surface)} onChange={(e) => set("surface", e.target.value)} />
            {/* Étage(s) — non supporté par l'API pour l'instant
            <TextField label="Étage(s)" value={room.floors} onChange={(e) => set("floors", e.target.value)} placeholder="Ex: 2 → 4" />
            */}
            {/* Vue — non supporté par l'API pour l'instant
            <SelectField label="Vue" value={room.view} onChange={(e) => set("view", e.target.value)}
              options={["Lagune", "Mer", "Jardin", "Piscine", "Ville", "Panoramique", "Intérieure"]} />
            */}
          </div>

          <hr className="divider" />
          <SectionHead icon="bed" title="Configuration du lit" />
          <div className="grid-3">
            <SelectField label="Type de lit" value={room.bedType} onChange={(e) => set("bedType", e.target.value)}
              options={["Grand lit (King)", "Grand lit (Queen)", "Lits jumeaux", "Lit simple", "Lits superposés"]} />
            <TextField label="Nombre de lits" type="number" value={String(room.bedCount)} onChange={(e) => set("bedCount", Number(e.target.value))} />
            <TextField label="Capacité max (pers.)" type="number" value={String(room.maxOccupancy)} onChange={(e) => set("maxOccupancy", Number(e.target.value))} />
          </div>

          <hr className="divider" />
          <SectionHead icon="moneyBill" title="Tarification" />
          <div className="grid-3">
            <TextField label="Prix / nuit (FCFA)" required type="number" value={String(room.basePrice)} onChange={(e) => set("basePrice", Number(e.target.value))} />
            <TextField label="Prix week-end (FCFA)" type="number" value={String(room.weekendPrice)} onChange={(e) => set("weekendPrice", Number(e.target.value))} hint="Si différent" />
            <TextField label="Longue durée (FCFA)" type="number" value={String(room.longStayPrice)} onChange={(e) => set("longStayPrice", Number(e.target.value))} hint="À partir de 7 nuits" />
          </div>

          <div className="mt-md">
            <Field label="Petit-déjeuner">
              <div className="grid-3" style={{ marginTop: 6 }}>
                {(["included", "available", "not_available"] as const).map((opt) => (
                  <div key={opt} className={`radio-card${room.breakfastOption === opt ? " checked" : ""}`} onClick={() => set("breakfastOption", opt)}>
                    <div className="rc-mark" />
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{BREAKFAST_LABELS[opt]}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                      {opt === "included"      && "Inclus dans la nuitée"}
                      {opt === "available"     && "+ 4 000 FCFA / pers."}
                      {opt === "not_available" && "Non proposé"}
                    </div>
                  </div>
                ))}
              </div>
            </Field>
          </div>

          <hr className="divider" />
          <SectionHead icon="image" title="Photos & médias" />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{room.photos} photo(s) uploadée(s)</div>
              <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>Minimum 4 photos par type recommandé</div>
            </div>
            <button className="btn btn-ghost btn-sm"><Icon name="upload" size={13} /> Ajouter des photos</button>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={onSave}>
            <Icon name="check" size={15} /> {room.isNew ? "Ajouter le type" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
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
      name: "", totalRooms: 1, surface: "", floors: "",
      bedType: "Grand lit (Queen)", bedCount: 1, maxOccupancy: 2,
      basePrice: 35000, weekendPrice: "", longStayPrice: "",
      breakfastOption: "included", photos: 0, hasVideo: false,
      view: "Jardin",
      complete: false, cover: COVERS[rooms.length % 4],
      isNew: true,
    });

  const save = () => {
    if (!editing) return;
    if (editing.isNew) {
      update("roomTypes", [...rooms, { ...editing, complete: true, isNew: false }]);
    } else {
      update("roomTypes", rooms.map((r) => (r.id === editing.id ? editing : r)));
    }
    setEditing(null);
  };

  const remove = (id: string) => update("roomTypes", rooms.filter((r) => r.id !== id));

  const stats = [
    { icon: "layers",     color: "primary-50", col: "primary", val: rooms.length,                                  label: "Types de chambres" },
    { icon: "bed",        color: "violet-bg",  col: "violet",  val: totalRooms,                                    label: "Chambres au total" },
    { icon: "moneyBill",  color: "teal-bg",    col: "teal",    val: <Fcfa value={avgPrice} />,                     label: "Prix moyen / nuit" },
    { icon: "image",      color: "amber-bg",   col: "amber",   val: rooms.reduce((s, r) => s + r.photos, 0),      label: "Photos uploadées" },
  ] as const;

  return (
    <div className="step4-shell fade-in">

      {/* ── En-tête + bouton ── */}
      <div className="step4-page-head">
        <div>
          <div className="page-eyebrow">Étape 4 sur 7 — cœur du flow</div>
          <h1 className="page-title">Vos types de chambres</h1>
          <p className="page-desc">
            Chaque « type » est une entité indépendante avec ses propres prix, photos et calendrier.
            Un hôtel de 30 chambres avec 4 types remplit ce formulaire 4 fois.
          </p>
        </div>
        <button className="btn btn-primary step4-add-btn" onClick={openNew}>
          <Icon name="plus" size={16} /> Ajouter un type
        </button>
      </div>

      {/* ── Stats ── */}
      <section className="card step4-card step4-stats-card">
        <div className="step4-stats-row">
          {stats.map((s) => (
            <div key={s.label} className="step4-stat">
              <div className="step4-stat-icon" style={{ background: `var(--${s.color})`, color: `var(--${s.col})` }}>
                <Icon name={s.icon} size={16} />
              </div>
              <div className="step4-stat-value">{s.val}</div>
              <div className="step4-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Tip>Nommez vos types avec le lit + la vue : <strong>«&nbsp;Suite King Lagune&nbsp;»</strong> convertit 2× mieux que «&nbsp;Suite Deluxe&nbsp;».</Tip>

      {/* ── Grille ── */}
      <div className="step4-rooms-grid">
        {rooms.map((r) => (
          <RoomCard key={r.id} room={r} onEdit={() => setEditing(r)} onRemove={() => remove(r.id)} />
        ))}
        <button className="step4-add-card" onClick={openNew}>
          <div className="step4-add-icon">
            <Icon name="plus" size={22} />
          </div>
          <div className="step4-add-label">Ajouter un type de chambre</div>
          <div className="step4-add-sub">Suite Junior, Familiale, Communicante, Dortoir…</div>
        </button>
      </div>

      {/* ── Card astuce calendrier ── */}
      <section className="card step4-card step4-cal-card">
        <div className="step4-cal-head">
          <div className="step4-cal-icon">
            <Icon name="calendar" size={20} />
          </div>
          <div className="step4-cal-text">
            <div className="step4-cal-title">Pensez à charger un calendrier par type de chambre</div>
            <div className="step4-cal-sub">
              Pour chaque type, vous pourrez bloquer des dates indisponibles directement depuis le tableau de bord PMS.
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
            <Icon name="calendar" size={14} /> Voir le planning
          </button>
        </div>
        <Tip>Un prix week-end <strong>+15%</strong> est standard pour les hôtels urbains en Côte d&apos;Ivoire — activez-le dans chaque type de chambre.</Tip>
      </section>

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
