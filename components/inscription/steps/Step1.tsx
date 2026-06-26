"use client";
import type { StepProps } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField } from "../ui/FormFields";
import { UploadZone } from "../ui/UploadZone";
import { Checkbox } from "../ui/Checkbox";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="step1-tip">
      <div className="step1-tip-dot"><Icon name="sparkles" size={12} /></div>
      <p className="step1-tip-text">{children}</p>
    </div>
  );
}

export function Step1({ state, update }: StepProps) {
  const s = state.account;
  const set = <K extends keyof typeof s>(k: K, v: typeof s[K]) =>
    update("account", { ...s, [k]: v });

  return (
    <div className="step1-shell fade-in">

      {/* ── En-tête ── */}
      <div className="page-head">
        <div className="page-eyebrow">Étape 1 sur 7</div>
        <h1 className="page-title">Créons votre compte hôtelier</h1>
        <p className="page-desc">
          Ce compte est distinct du compte agence immobilière. Vos informations restent en attente
          de vérification jusqu&apos;à validation de votre pièce d&apos;identité (24–48h).
        </p>
      </div>

      <div className="step1-bento">

        {/* ── 1. Identité du gérant (pleine largeur) ── */}
        <section className="card step1-card step1-id-card">
          <SectionHead
            icon="user"
            title="Identité du gérant"
            sub="Le responsable principal de l'établissement"
          />
          <div className="grid-2">
            <TextField
              label="Nom complet du gérant" required
              value={s.fullName} onChange={(e) => set("fullName", e.target.value)}
              placeholder="Nom et prénom"
            />
            <TextField
              label="Email professionnel" required type="email"
              value={s.email} onChange={(e) => set("email", e.target.value)}
              placeholder="contact@hotel.ci"
            />
            <TextField
              label="Téléphone (WhatsApp + Mobile Money)" required
              prefix="CI +225"
              value={s.phone.replace("+225 ", "")}
              onChange={(e) => set("phone", "+225 " + e.target.value)}
            />
            <TextField
              label="Mot de passe" required type="password"
              value={s.password} onChange={(e) => set("password", e.target.value)}
              placeholder="Min. 8 caractères"
            />
          </div>
          <Tip>Ce numéro doit être lié à un compte <strong>Wave</strong>, <strong>Orange Money</strong> ou <strong>MTN Money</strong> — il sert à recevoir vos paiements de réservations.</Tip>
        </section>

        {/* ── 2. Vérification d'identité (7 cols) ── */}
        <section className="card step1-card step1-kyc-card">
          <SectionHead
            icon="shield"
            title="Vérification d'identité"
            sub="Obligatoire pour passer en statut « Vérifié »"
            right={<Pill kind={s.cniUploaded ? "success" : "warn"} dot>{s.cniUploaded ? "Document reçu" : "En attente"}</Pill>}
          />
          <div className="step1-kyc-stack">
            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>
                Pièce d&apos;identité du propriétaire <span className="req">*</span>
              </div>
              {s.cniUploaded ? (
                <div className="step1-upload-done">
                  <div className="step1-upload-icon">
                    <Icon name="fileText" size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="step1-upload-name">CNI_Aicha_Diabate.pdf</div>
                    <div className="step1-upload-meta">1,4 Mo · uploadé il y a 2 min</div>
                  </div>
                  <Pill kind="success" dot>Reçu</Pill>
                  <button className="btn-icon" onClick={() => set("cniUploaded", false)}>
                    <Icon name="x" size={14} />
                  </button>
                </div>
              ) : (
                <UploadZone
                  icon="camera"
                  title="Photo CNI ou passeport"
                  sub="JPG ou PDF, max 5 Mo · les deux faces"
                  onClick={() => set("cniUploaded", true)}
                />
              )}
              <div className="field-help" style={{ marginTop: 6 }}>
                Acceptés : CNI ivoirienne, passeport, attestation d&apos;identité
              </div>
            </div>
            <TextField
              label="Numéro RCCM"
              hint="Optionnel — si enregistré au registre du commerce"
              value={s.rccm}
              onChange={(e) => set("rccm", e.target.value)}
              placeholder="CI-ABJ-2024-B-XXXXX"
            />
          </div>
          <Tip>La vérification est traitée en <strong>24–48h</strong> — vous recevrez un SMS de confirmation dès validation de votre dossier.</Tip>
        </section>

        {/* ── 3. Conditions d'utilisation (5 cols) ── */}
        <section className="card step1-card step1-cgu-card">
          <SectionHead icon="fileText" title="Conditions d'utilisation" />

          {/* Commission */}
          <div className="step1-commission">
            <div className="step1-commission-rate">8%</div>
            <div>
              <div className="step1-commission-label">Commission par réservation</div>
              <div className="step1-commission-sub">Prélevée automatiquement — aucune avance requise</div>
            </div>
          </div>

          <Checkbox
            checked={s.cgu}
            onChange={(v) => set("cgu", v)}
            label="J'accepte les CGU hôteliers d'Immo Plus Pro et la commission de 8% par réservation."
            sub="Vous pouvez consulter le contrat hôtelier complet et la grille tarifaire avant de signer."
          />

          <div className="step1-cgu-links">
            <a className="step1-cgu-link">
              <Icon name="fileText" size={13} /> Voir les CGU
            </a>
            <a className="step1-cgu-link">
              <Icon name="fileText" size={13} /> Grille des commissions
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
