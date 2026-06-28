"use client";
import type { StepProps } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField, TextArea, SelectField, Field } from "../ui/FormFields";
import { StarRate } from "../ui/StarRate";
import { TagInput } from "../ui/TagInput";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";
import { LocationMap } from "../ui/LocationMap";

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="step2-tip">
      <div className="step2-tip-dot"><Icon name="sparkles" size={12} /></div>
      <p className="step2-tip-text">{children}</p>
    </div>
  );
}

export function Step2({ state, update }: StepProps) {
  const h = state.hotel;
  const set = <K extends keyof typeof h>(k: K, v: typeof h[K]) =>
    update("hotel", { ...h, [k]: v });

  return (
    <div className="step2-shell fade-in">

      {/* ── En-tête ── */}
      <div className="page-head">
        <div className="page-eyebrow">Étape 2 sur 7</div>
        <h1 className="page-title">La carte d&apos;identité de votre hôtel</h1>
        <p className="page-desc">
          Ces informations alimentent votre fiche publique dans le feed. La photo de couverture
          est ce que les voyageurs verront en premier.
        </p>
      </div>

      <div className="step2-bento">

        {/* ── 1. Informations de base (pleine largeur) ── */}
        <section className="card step2-card step2-info-card">
          <SectionHead
            icon="building"
            title="Informations de base"
            right={<Pill kind="primary" dot>Public</Pill>}
          />
          <div className="grid-2">
            <TextField
              label="Nom de l'établissement" required
              value={h.name} onChange={(e) => set("name", e.target.value)}
            />
            <SelectField
              label="Type d'établissement" required
              value={h.type} onChange={(e) => set("type", e.target.value)}
              options={[
                { value: "hotel",       label: "Hôtel" },
                { value: "auberge",     label: "Auberge" },
                { value: "apart_hotel", label: "Apart-hôtel" },
                { value: "residence",   label: "Résidence hôtelière" },
                { value: "boutique",    label: "Hôtel boutique" },
              ]}
            />
            <Field label="Catégorie étoiles" required>
              <div className="step2-stars-row">
                <StarRate value={h.stars} onChange={(v) => set("stars", v)} />
                <button className="btn btn-text btn-sm" onClick={() => set("stars", 0)}>Non classé</button>
              </div>
            </Field>
            <TextField
              label="Année d'ouverture"
              value={h.yearOpened} onChange={(e) => set("yearOpened", e.target.value)}
              placeholder="2019"
            />
            <TextField
              label="Téléphone de réception" required
              prefix="🇨🇮 +225"
              value={String(h.phone).replace("+225 ", "")}
              onChange={(e) => set("phone", "+225 " + e.target.value)}
            />
            <TextField
              label="Email établissement" required
              value={h.email} onChange={(e) => set("email", e.target.value)}
            />
            <TextField
              label="Site web"
              prefix="https://"
              value={String(h.website).replace("www.", "")}
              onChange={(e) => set("website", "www." + e.target.value)}
            />
            <TextField
              label="Capacité totale (chambres)" type="number" required
              value={String(h.capacity)} onChange={(e) => set("capacity", e.target.value)}
            />
            <TextField
              label="Instagram" prefix="@"
              value={String(h.instagram).replace("@", "")}
              onChange={(e) => set("instagram", "@" + e.target.value)}
            />
            <TextField
              label="Facebook"
              value={h.facebook} onChange={(e) => set("facebook", e.target.value)}
            />
            <Field label="Langues parlées par le personnel" span={2}>
              <TagInput
                tags={h.languages}
                onChange={(v) => set("languages", v)}
                placeholder="Ajouter une langue…"
              />
            </Field>
          </div>
          <Tip>Le nom s&apos;affiche tel quel dans le feed — évitez les noms génériques comme «&nbsp;Hôtel Abidjan&nbsp;» ; préférez un nom distinctif et mémorable.</Tip>
        </section>

        {/* ── 2. Adresse (6 cols) ── */}
        <section className="card step2-card step2-addr-card">
          <SectionHead
            icon="mapPin"
            title="Adresse & géolocalisation"
            sub="Le pin GPS est obligatoire pour la recherche par carte"
          />
          <div className="grid-2">
            <TextField
              label="Rue / boulevard"
              value={h.address} onChange={(e) => set("address", e.target.value)}
              span={2}
            />
            <SelectField
              label="Commune"
              value={h.commune} onChange={(e) => set("commune", e.target.value)}
              options={["Cocody", "Plateau", "Marcory", "Treichville", "Yopougon", "Abobo", "Bingerville", "Grand-Bassam"]}
            />
            <SelectField
              label="Ville"
              value={h.city} onChange={(e) => set("city", e.target.value)}
              options={["Abidjan", "Yamoussoukro", "Bouaké", "San Pedro", "Korhogo", "Grand-Bassam", "Assinie"]}
            />
          </div>
          <div className="step2-map-wrap">
            <div className="field-label" style={{ marginBottom: 8 }}>
              Position sur la carte <span className="req">*</span>
            </div>
            <LocationMap
              lat={h.lat}
              lng={h.lng}
              label={`${h.commune}, ${h.city}`}
              subLabel={h.address ? `${h.address}, ${h.commune}` : undefined}
              onPositionChange={(lat, lng) => { set("lat", lat); set("lng", lng); }}
            />
          </div>
        </section>

        {/* ── 3. Description (6 cols) ── */}
        <section className="card step2-card step2-desc-card">
          <SectionHead icon="edit" title="Description & positionnement" />
          <div className="grid-2">
            <TextArea
              label="Description courte" required
              hint="1 phrase accroche — s'affiche dans le feed (max 120 caractères)"
              value={h.shortDesc} onChange={(e) => set("shortDesc", e.target.value)}
              rows={2} span={2}
            />
            <TextArea
              label="Description longue"
              hint="Histoire, ambiance, positionnement — minimum 200 caractères"
              value={h.longDesc} onChange={(e) => set("longDesc", e.target.value)}
              rows={5} span={2}
            />
            <Field label="Points forts de l'établissement" hint="Cliquez sur les suggestions ou ajoutez les vôtres" span={2}>
              <TagInput
                tags={h.strengths}
                onChange={(v) => set("strengths", v)}
                placeholder="Ajouter un point fort…"
              />
              <div className="step2-suggestions">
                {["Sécurité 24/7", "Climatisation", "Wi-Fi haut débit", "Parking", "Vue mer", "Centre-ville"]
                  .filter((x) => !h.strengths.includes(x))
                  .map((tag) => (
                    <button
                      key={tag}
                      className="btn btn-soft btn-sm"
                      onClick={() => set("strengths", [...h.strengths, tag])}
                    >
                      <Icon name="plus" size={12} /> {tag}
                    </button>
                  ))}
              </div>
            </Field>
          </div>
          <Tip>La description courte est votre accroche dans le feed — commencez par <strong>l&apos;émotion</strong>, pas par les équipements.</Tip>
        </section>

        {/* ── 4. Médias (pleine largeur) ── */}
        <section className="card step2-card step2-media-card">
          <SectionHead
            icon="image"
            title="Médias de l'établissement"
            sub="Façade, réception, espaces communs — minimum 5 photos"
            right={<Pill kind="primary">{h.galleryCount + 1} médias</Pill>}
          />

          <div className="grid-2" style={{ marginBottom: 20 }}>
            {/* Couverture */}
            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>
                Photo de couverture <span className="req">*</span>
              </div>
              <div className="thumb" style={{ aspectRatio: "16/9", background: "var(--bg-2)" }}>
                <div className="ribbon" style={{ background: "var(--primary)" }}>Couverture · feed</div>
                <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "rgba(255,255,255,0.8)" }}>
                  <Icon name="image" size={40} />
                </div>
              </div>
              <div className="field-help" style={{ marginTop: 6 }}>Format paysage 16:9 · min 1920px</div>
            </div>

            {/* Vidéo */}
            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>Vidéo de présentation</div>
              {h.hasVideo ? (
                <div className="thumb" style={{ aspectRatio: "16/9", background: "var(--bg-2)" }}>
                  <Icon name="video" size={40} />
                </div>
              ) : (
                <div className="step2-video-empty">
                  <div className="step2-video-icon">
                    <Icon name="video" size={20} />
                  </div>
                  <div className="step2-video-title">Pas de vidéo ?</div>
                  <div className="step2-video-sub">Notre studio production peut s&apos;en charger — tarif flexible selon votre formule.</div>
                  <button className="btn btn-soft btn-sm" style={{ marginTop: 4 }} onClick={() => set("hasVideo", true)}>
                    <Icon name="sparkles" size={13} /> Demander un devis studio
                  </button>
                </div>
              )}
              <div className="field-help" style={{ marginTop: 6 }}>30s à 1min · format vertical compatible feed</div>
            </div>
          </div>

          {/* Galerie */}
          <div className="step2-gallery-head">
            <div className="field-label">Galerie établissement <span className="req">*</span></div>
            <div style={{ fontSize: 11.5, color: "var(--text-3)" }}>{h.galleryCount} / minimum 5 photos</div>
          </div>
          <div className="thumbs">
            {["Façade", "Réception", "Couloir étage 3", "Piscine extérieure", "Jardin tropical", "Vue depuis suite", "Restaurant", "Spa"].map((label, i) => (
              <div key={i} className="thumb" style={{ background: "var(--bg-2)" }}>
                <div className="ribbon">{label}</div>
                <div className="x"><Icon name="x" size={14} /></div>
              </div>
            ))}
            <div className="thumb placeholder">
              <div style={{ textAlign: "center" }}>
                <Icon name="plus" size={22} />
                <div style={{ fontSize: 11, marginTop: 4, fontWeight: 500 }}>Ajouter</div>
              </div>
            </div>
          </div>

          <Tip>Les hôtels avec <strong>vidéo drone</strong> reçoivent 3× plus de clics dans le feed — le studio Immo Plus se déplace à Abidjan dès <strong>75 000 FCFA</strong>.</Tip>
        </section>

      </div>
    </div>
  );
}
