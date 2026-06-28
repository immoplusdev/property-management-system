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

function UploadDone({ filename, onRemove }: { filename: string; onRemove: () => void }) {
  return (
    <div className="step1-upload-done">
      <div className="step1-upload-icon">
        <Icon name="fileText" size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="step1-upload-name">{filename}</div>
        <div className="step1-upload-meta">Uploadé</div>
      </div>
      <Pill kind="success" dot>Reçu</Pill>
      <button className="btn-icon" onClick={onRemove}>
        <Icon name="x" size={14} />
      </button>
    </div>
  );
}

export function Step1({ state, update }: StepProps) {
  const s = state.account;
  const set = <K extends keyof typeof s>(k: K, v: typeof s[K]) =>
    update("account", { ...s, [k]: v });

  const bothUploaded = !!s.idCardFrontFileId && !!s.idCardBackFileId;
  const anyUploaded = !!s.idCardFrontFileId || !!s.idCardBackFileId;

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

        {/* ── 1. Identité du gérant ── */}
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
          </div>
          <Tip>Ce numéro doit être lié à un compte <strong>Wave</strong>, <strong>Orange Money</strong> ou <strong>MTN Money</strong> — il sert à recevoir vos paiements de réservations.</Tip>
        </section>

        {/* ── 2. Vérification d'identité ── */}
        <section className="card step1-card step1-kyc-card">
          <SectionHead
            icon="shield"
            title="Vérification d'identité"
            sub="Obligatoire pour passer en statut « Vérifié »"
            right={
              <Pill kind={bothUploaded ? "success" : anyUploaded ? "warn" : "warn"} dot>
                {bothUploaded ? "Complet" : anyUploaded ? "Incomplet" : "En attente"}
              </Pill>
            }
          />

          <div className="step1-kyc-stack">
            {/* Recto + Verso côte à côte */}
            <div>
              <div className="field-label" style={{ marginBottom: 8 }}>
                Pièce d&apos;identité du propriétaire <span className="req">*</span>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, marginBottom: 6 }}>
                    Recto (face avant)
                  </div>
                  {s.idCardFrontFileId ? (
                    <UploadDone
                      filename="CNI_recto.jpg"
                      onRemove={() => set("idCardFrontFileId", null)}
                    />
                  ) : (
                    <UploadZone
                      icon="camera"
                      title="Face avant"
                      sub="JPG ou PDF · max 5 Mo"
                      onClick={() => set("idCardFrontFileId", "mock-front-" + Date.now())}
                    />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, marginBottom: 6 }}>
                    Verso (face arrière)
                  </div>
                  {s.idCardBackFileId ? (
                    <UploadDone
                      filename="CNI_verso.jpg"
                      onRemove={() => set("idCardBackFileId", null)}
                    />
                  ) : (
                    <UploadZone
                      icon="camera"
                      title="Face arrière"
                      sub="JPG ou PDF · max 5 Mo"
                      onClick={() => set("idCardBackFileId", "mock-back-" + Date.now())}
                    />
                  )}
                </div>
              </div>
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

        {/* ── 3. Conditions d'utilisation ── */}
        <section className="card step1-card step1-cgu-card">
          <SectionHead icon="fileText" title="Conditions d'utilisation" />

          <div className="step1-commission">
            <div className="step1-commission-rate">8%</div>
            <div>
              <div className="step1-commission-label">Commission par réservation</div>
              <div className="step1-commission-sub">Prélevée automatiquement — aucune avance requise</div>
            </div>
          </div>

          <Checkbox
            checked={s.acceptedTerms}
            onChange={(v) => set("acceptedTerms", v)}
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
