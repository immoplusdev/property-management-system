"use client";
import { useRef, useState, useEffect } from "react";
import type { StepProps } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField } from "../ui/FormFields";
import { UploadZone } from "../ui/UploadZone";
import { Checkbox } from "../ui/Checkbox";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";
import { PageHead } from "../ui/PageHead";
import { InsCard } from "../ui/InsCard";
import { Tip } from "../ui/Tip";
import { Btn } from "../ui/Btn";
import { uploadFile } from "@/lib/api/files/files.client";
import { fileUrl } from "@/lib/utils/fileUrl";

type SlotStatus = "idle" | "loading" | "done" | "error";

interface SlotState {
  status: SlotStatus;
  fileId: string | null;
  fileName: string;
  fileSize: number;
  previewUrl: string | null;
  mimeType: string;
  error: string;
}

const emptySlot = (): SlotState => ({
  status: "idle",
  fileId: null,
  fileName: "",
  fileSize: 0,
  previewUrl: null,
  mimeType: "",
  error: "",
});

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

function UploadLoading() {
  return (
    <div className="w-full flex flex-col items-center gap-2 text-center px-5 py-8 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-50">
      <div className="w-13 h-13 rounded-[14px] bg-white/70 grid place-items-center shadow-[0_0_0_1px_rgba(var(--color-primary-rgb),0.12)]">
        <svg
          className="animate-spin w-6 h-6 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            className="opacity-20"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="3"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </div>
      <div className="text-[13px] font-semibold text-primary">Envoi en cours…</div>
    </div>
  );
}

function UploadDone({
  slot,
  onRemove,
}: {
  slot: SlotState;
  onRemove: () => void;
}) {
  const isImage = slot.mimeType.startsWith("image/");
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 border-[1.5px] border-success bg-success-bg rounded-2xl">
      <div className="shrink-0 w-10 h-10 rounded-[10px] overflow-hidden bg-white border border-success/20 grid place-items-center text-success">
        {isImage && slot.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slot.previewUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <Icon name="fileText" size={20} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[13px] text-ink truncate leading-tight">
          {slot.fileName}
        </div>
        <div className="text-[11px] text-ink-3 mt-0.5">{fmtSize(slot.fileSize)}</div>
      </div>
      <Pill kind="success" dot>Reçu</Pill>
      <Btn
        variant="icon"
        size="sm"
        onClick={onRemove}
        aria-label="Retirer le fichier"
      >
        <Icon name="x" size={14} />
      </Btn>
    </div>
  );
}

function IdCardSlot({
  label,
  slot,
  onPick,
  onRemove,
}: {
  label: string;
  slot: SlotState;
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (slot.status === "loading") return <UploadLoading />;
  if (slot.status === "done") return <UploadDone slot={slot} onRemove={onRemove} />;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          // reset so the same file can be re-selected after removal
          e.target.value = "";
        }}
      />
      <UploadZone
        icon="camera"
        title={label}
        square
        onClick={() => inputRef.current?.click()}
      />
      {slot.status === "error" && (
        <p className="text-[11px] text-danger mt-1 pl-0.5">{slot.error}</p>
      )}
    </>
  );
}

export function Step1({ state, update }: StepProps) {
  const s = state.account;
  const set = <K extends keyof typeof s>(k: K, v: typeof s[K]) =>
    update("account", { ...s, [k]: v });

  const [frontSlot, setFrontSlot] = useState<SlotState>(() =>
    s.idCardFrontFileId
      ? { status: "done", fileId: s.idCardFrontFileId, fileName: "Pièce d'identité (recto)", fileSize: 0, previewUrl: fileUrl(s.idCardFrontFileId), mimeType: "image/jpeg", error: "" }
      : emptySlot()
  );
  const [backSlot, setBackSlot] = useState<SlotState>(() =>
    s.idCardBackFileId
      ? { status: "done", fileId: s.idCardBackFileId, fileName: "Pièce d'identité (verso)", fileSize: 0, previewUrl: fileUrl(s.idCardBackFileId), mimeType: "image/jpeg", error: "" }
      : emptySlot()
  );

  // Revoke preview objectURLs when the component unmounts (only blob: URLs, BFF URLs are no-ops)
  useEffect(() => {
    return () => {
      if (frontSlot.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(frontSlot.previewUrl);
      if (backSlot.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(backSlot.previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePick(file: File, side: "front" | "back") {
    const setSlot = side === "front" ? setFrontSlot : setBackSlot;
    const previewUrl = file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null;

    setSlot({
      status: "loading",
      fileId: null,
      fileName: file.name,
      fileSize: file.size,
      previewUrl,
      mimeType: file.type,
      error: "",
    });

    try {
      const uploaded = await uploadFile(file);
      setSlot((prev) => ({ ...prev, status: "done", fileId: uploaded.id }));
      if (side === "front") set("idCardFrontFileId", uploaded.id);
      else set("idCardBackFileId", uploaded.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Échec de l'envoi. Réessayez.";
      setSlot((prev) => ({ ...prev, status: "error", error: message }));
    }
  }

  function handleRemove(side: "front" | "back") {
    const slot = side === "front" ? frontSlot : backSlot;
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
    if (side === "front") {
      setFrontSlot(emptySlot());
      set("idCardFrontFileId", null);
    } else {
      setBackSlot(emptySlot());
      set("idCardBackFileId", null);
    }
  }

  const bothUploaded = frontSlot.status === "done" && backSlot.status === "done";
  const anyUploaded  = frontSlot.status === "done" || backSlot.status === "done";

  return (
    <div className="flex flex-col gap-5 animate-insc-fade w-full">
      <PageHead
        eyebrow="Étape 1 sur 7"
        title="Créons votre compte hôtelier"
        desc="Ce compte est distinct du compte agence immobilière. Vos informations restent en attente de vérification jusqu'à validation de votre pièce d'identité (24–48h)."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 items-stretch w-full">

        {/* LIGNE 1 - Bi-colonne */}
        {/* 1. Identité du gérant */}
        <InsCard flat className="flex flex-col">
          <SectionHead
            icon="user"
            title="Identité du gérant"
            sub="Le responsable principal de l'établissement"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Tip>
            Ce numéro doit être lié à un compte{" "}
            <strong>Wave</strong>, <strong>Orange Money</strong> ou <strong>MTN Money</strong>{" "}
            — il sert à recevoir vos paiements de réservations.
          </Tip>
        </InsCard>

        {/* 2. Vérification d'identité */}
        <InsCard flat className="flex flex-col">
          <SectionHead
            icon="shield"
            title="Vérification d'identité"
            sub="Obligatoire pour passer en statut « Vérifié »"
            right={
              <Pill kind={bothUploaded ? "success" : "warn"} dot>
                {bothUploaded ? "Complet" : anyUploaded ? "Incomplet" : "En attente"}
              </Pill>
            }
          />

          <div className="flex flex-col gap-4">
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-ink-2 mb-2">
                Pièce d&apos;identité du propriétaire{" "}
                <span className="text-danger">*</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div className="text-[12px] text-ink-3 font-semibold mb-2.5">
                    Recto (face avant)
                  </div>
                  <div className="aspect-square shrink-0">
                    <IdCardSlot
                      label="Face avant"
                      slot={frontSlot}
                      onPick={(f) => handlePick(f, "front")}
                      onRemove={() => handleRemove("front")}
                    />
                  </div>
                  <div className="text-[10px] text-ink-4 mt-2.5 leading-[1.4]">
                    JPG, PNG ou PDF · max 5 Mo
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[12px] text-ink-3 font-semibold mb-2.5">
                    Verso (face arrière)
                  </div>
                  <div className="aspect-square shrink-0">
                    <IdCardSlot
                      label="Face arrière"
                      slot={backSlot}
                      onPick={(f) => handlePick(f, "back")}
                      onRemove={() => handleRemove("back")}
                    />
                  </div>
                  <div className="text-[10px] text-ink-4 mt-2.5 leading-[1.4]">
                    JPG, PNG ou PDF · max 5 Mo
                  </div>
                </div>
              </div>
              <div className="text-[11.5px] text-ink-3 mt-1.5 leading-[1.4]">
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
          <Tip>
            La vérification est traitée en <strong>24–48h</strong>  vous recevrez un SMS
            de confirmation dès validation de votre dossier.
          </Tip>
        </InsCard>

        {/* LIGNE 2 - Pleine largeur */}
        {/* 3. Conditions d'utilisation */}
        <InsCard flat className="lg:col-span-2">
          <SectionHead icon="fileText" title="Conditions d'utilisation" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Commission bloc */}
            <div className="lg:col-span-1 flex items-center gap-4 px-5 py-4.5 border-[1.5px] border-border rounded-[16px] bg-primary-50">
              <div className="text-[36px] font-black tracking-tighter text-primary shrink-0 leading-none">
                8%
              </div>
              <div>
                <div className="font-bold text-[13px] text-ink">
                  Commission
                </div>
                <div className="text-[11px] text-ink-3 mt-0.5 leading-[1.3]">
                  Par réservation<br />
                  Automatique
                </div>
              </div>
            </div>

            {/* CGU & Checkbox */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Checkbox
                checked={s.acceptedTerms}
                onChange={(v) => set("acceptedTerms", v)}
                label="J'accepte les CGU hôteliers d'Immo Plus Pro et la commission de 8% par réservation."
                sub="Vous pouvez consulter le contrat hôtelier complet et la grille tarifaire avant de signer."
              />

              <div className="flex gap-4">
                <a className="flex items-center gap-1.75 text-primary text-[12px] font-medium cursor-pointer no-underline transition-opacity duration-120 hover:opacity-70">
                  <Icon name="fileText" size={13} /> Voir les CGU
                </a>
                <a className="flex items-center gap-1.75 text-primary text-[12px] font-medium cursor-pointer no-underline transition-opacity duration-120 hover:opacity-70">
                  <Icon name="fileText" size={13} /> Grille des commissions
                </a>
              </div>
            </div>
          </div>
        </InsCard>

      </div>
    </div>
  );
}
