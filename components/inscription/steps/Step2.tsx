"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { StepProps } from "../types";
import { SectionHead } from "../ui/SectionHead";
import { TextField, TextArea, SelectField, Field } from "../ui/FormFields";
import { StarRate } from "../ui/StarRate";
import { TagInput } from "../ui/TagInput";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";
import { LocationMap } from "../ui/LocationMap";
import { PageHead } from "../ui/PageHead";
import { InsCard } from "../ui/InsCard";
import { Tip } from "../ui/Tip";
import { Btn } from "../ui/Btn";
import { Thumb, ThumbAdd } from "../ui/Thumb";
import { uploadFile } from "@/lib/api/files/files.client";
import { fileUrl } from "@/lib/utils/fileUrl";
import type { VilleDto, CommuneDto } from "@/lib/api/generated/model";

// ─── BFF hooks ──────────────────────────────────────────────────────────────

function useVilles() {
  return useQuery<VilleDto[]>({
    queryKey: ["villes"],
    queryFn: async () => {
      const res = await fetch("/bff/villes", { credentials: "include" });
      const json = await res.json();
      return (json.data ?? []) as VilleDto[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useCommunes() {
  return useQuery<CommuneDto[]>({
    queryKey: ["communes"],
    queryFn: async () => {
      const res = await fetch("/bff/communes", { credentials: "include" });
      const json = await res.json();
      return (json.data ?? []) as CommuneDto[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Local upload state ──────────────────────────────────────────────────────

type SlotStatus = "idle" | "loading" | "done" | "error";

interface MediaSlot {
  status: SlotStatus;
  fileId: string | null;
  fileName: string;
  fileSize: number;
  previewUrl: string | null;
  mimeType: string;
  error: string;
}

const emptySlot = (): MediaSlot => ({
  status: "idle", fileId: null, fileName: "", fileSize: 0,
  previewUrl: null, mimeType: "", error: "",
});

interface GalleryItem {
  fileId: string;
  previewUrl: string | null;
  fileName: string;
  fileSize: number;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

// ─── Single-file upload zone (cover, video, drone) ───────────────────────────

function MediaUploadSlot({
  slot,
  accept,
  idleIcon,
  idleTitle,
  idleSub,
  aspect = "16/9",
  onPick,
  onRemove,
}: {
  slot: MediaSlot;
  accept: string;
  idleIcon: string;
  idleTitle: string;
  idleSub?: string;
  aspect?: "4/3" | "16/9";
  onPick: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = slot.mimeType.startsWith("image/");

  if (slot.status === "loading") {
    return (
      <div className={`w-full ${aspect === "16/9" ? "aspect-video" : "aspect-4/3"} rounded-2xl border-2 border-dashed border-primary/40 bg-primary-50 flex flex-col items-center justify-center gap-2`}>
        <svg className="animate-spin w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div className="text-[13px] font-semibold text-primary">Envoi en cours…</div>
      </div>
    );
  }

  if (slot.status === "done") {
    return (
      <div className={`relative w-full ${aspect === "16/9" ? "aspect-video" : "aspect-4/3"} rounded-2xl overflow-hidden bg-surface-2 group`}>
        {isImage && slot.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slot.previewUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-3">
            <Icon name={idleIcon} size={36} />
            <div className="text-[12px] font-medium text-center px-4 truncate max-w-full">{slot.fileName}</div>
            <div className="text-[11px]">{fmtSize(slot.fileSize)}</div>
          </div>
        )}
        {/* Overlay avec label et remove */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200">
          <div className="absolute top-2 left-2">
            <Pill kind="success" dot>Uploadé</Pill>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Retirer"
            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/50 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer hover:bg-black/75"
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      </div>
    );
  }

  // idle or error
  return (
    <>
      <input
        ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`w-full ${aspect === "16/9" ? "aspect-video" : "aspect-4/3"} rounded-2xl border-2 border-dashed border-border-strong bg-surface-2 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all duration-220 hover:border-primary hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-md`}
      >
        <div className="w-12 h-12 rounded-[13px] bg-primary-50 text-primary grid place-items-center shadow-[0_0_0_1px_var(--color-primary-100)]">
          <Icon name={idleIcon} size={22} />
        </div>
        <div className="text-center">
          <div className="text-[14px] font-bold text-ink">{idleTitle}</div>
          {idleSub && <div className="text-[12px] text-ink-3 mt-0.5">{idleSub}</div>}
          {slot.status === "error" && <div className="text-[11px] text-danger mt-1">{slot.error}</div>}
        </div>
      </button>
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function Step2({ state, update }: StepProps) {
  const h = state.hotel;
  const set = <K extends keyof typeof h>(k: K, v: typeof h[K]) =>
    update("hotel", (prev) => ({ ...prev, [k]: v }));

  // API data
  const { data: villes = [], isLoading: villesLoading } = useVilles();
  const { data: allCommunes = [], isLoading: communesLoading } = useCommunes();

  // Filter communes by selected ville — CommuneDto.ville may be villeId or villeName
  const communes = h.villeId
    ? allCommunes.filter((c) => c.ville === h.villeId || c.ville === h.villeName)
    : allCommunes;

  // Local upload state — initialized from restored state when fileIds already exist.
  const [coverSlot, setCoverSlot] = useState<MediaSlot>(() =>
    h.coverFileId
      ? { status: "done", fileId: h.coverFileId, fileName: "Photo de couverture", fileSize: 0, previewUrl: fileUrl(h.coverFileId), mimeType: "image/jpeg", error: "" }
      : emptySlot()
  );
  const [videoSlot, setVideoSlot] = useState<MediaSlot>(() =>
    h.videoFileId
      ? { status: "done", fileId: h.videoFileId, fileName: "Vidéo", fileSize: 0, previewUrl: null, mimeType: "video/mp4", error: "" }
      : emptySlot()
  );
  const [droneSlot, setDroneSlot] = useState<MediaSlot>(() =>
    h.droneVideoFileId
      ? { status: "done", fileId: h.droneVideoFileId, fileName: "Vidéo drone", fileSize: 0, previewUrl: null, mimeType: "video/mp4", error: "" }
      : emptySlot()
  );
  const [gallery, setGallery] = useState<GalleryItem[]>(() =>
    h.galleryFileIds.map((id) => ({ fileId: id, previewUrl: fileUrl(id), fileName: "", fileSize: 0 }))
  );
  const [galleryUploading, setGalleryUploading] = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Revoke blob: objectURLs on unmount (BFF URLs are regular strings — no-op safe to call but skip for clarity).
  useEffect(() => {
    return () => {
      if (coverSlot.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(coverSlot.previewUrl);
      if (videoSlot.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(videoSlot.previewUrl);
      if (droneSlot.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(droneSlot.previewUrl);
      gallery.forEach((g) => { if (g.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(g.previewUrl); });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Single-slot upload handler ─────────────────────────────────────────────
  async function handleSingleUpload(
    file: File,
    setSlot: React.Dispatch<React.SetStateAction<MediaSlot>>,
    onSuccess: (id: string) => void,
  ) {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setSlot({ status: "loading", fileId: null, fileName: file.name, fileSize: file.size, previewUrl, mimeType: file.type, error: "" });
    try {
      const uploaded = await uploadFile(file);
      setSlot((p) => ({ ...p, status: "done", fileId: uploaded.id }));
      onSuccess(uploaded.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Échec de l'envoi.";
      setSlot((p) => ({ ...p, status: "error", error: msg }));
    }
  }

  function handleSingleRemove(
    slot: MediaSlot,
    setSlot: React.Dispatch<React.SetStateAction<MediaSlot>>,
    onRemove: () => void,
  ) {
    if (slot.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(slot.previewUrl);
    setSlot(emptySlot());
    onRemove();
  }

  // ── Gallery upload handler ─────────────────────────────────────────────────
  const handleGalleryFiles = useCallback(async (files: FileList) => {
    const arr = Array.from(files);
    setGalleryUploading((n) => n + arr.length);
    await Promise.all(arr.map(async (file) => {
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      try {
        const uploaded = await uploadFile(file);
        setGallery((prev) => [...prev, { fileId: uploaded.id, previewUrl, fileName: file.name, fileSize: file.size }]);
        update("hotel", (prev) => ({ ...prev, galleryFileIds: [...prev.galleryFileIds, uploaded.id] }));
      } catch {
        // silently skip failed files — user can retry by adding again
      } finally {
        setGalleryUploading((n) => n - 1);
      }
    }));
  }, [update]);

  function handleGalleryRemove(fileId: string) {
    const item = gallery.find((g) => g.fileId === fileId);
    if (item?.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
    setGallery((prev) => prev.filter((g) => g.fileId !== fileId));
    update("hotel", (prev) => ({ ...prev, galleryFileIds: prev.galleryFileIds.filter((id) => id !== fileId) }));
  }

  const totalMedia = (h.coverFileId ? 1 : 0) + gallery.length + (h.videoFileId ? 1 : 0);

  return (
    <div className="flex flex-col gap-5 animate-insc-fade">
      <PageHead
        eyebrow="Étape 2 sur 7"
        title="La carte d'identité de votre hôtel"
        desc="Ces informations alimentent votre fiche publique dans le feed. La photo de couverture est ce que les voyageurs verront en premier."
      />

      <div className="grid grid-cols-12 gap-4.5">

        {/* 1. Informations de base */}
        <InsCard flat className="col-span-12">
          <SectionHead
            icon="building"
            title="Informations de base"
            right={<Pill kind="primary" dot>Public</Pill>}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Nom de l'établissement" required
              value={h.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Résidence Lagune Bleue"
            />
            <SelectField
              label="Type d'établissement" required
              value={h.type} onChange={(e) => set("type", e.target.value)}
              options={[
                { value: "", label: "Sélectionner un type…" },
                { value: "hotel",       label: "Hôtel" },
                { value: "auberge",     label: "Auberge" },
                { value: "apart_hotel", label: "Apart-hôtel" },
                { value: "residence",   label: "Résidence hôtelière" },
                { value: "boutique",    label: "Hôtel boutique" },
              ]}
            />
            <Field label="Catégorie étoiles">
              <div className="flex items-center gap-3 mt-1">
                <StarRate value={h.stars} onChange={(v) => set("stars", v)} />
                <Btn variant="text" size="sm" onClick={() => set("stars", 0)}>Non classé</Btn>
              </div>
            </Field>
            <TextField
              label="Année d'ouverture"
              value={h.yearOpened} onChange={(e) => set("yearOpened", e.target.value)}
              placeholder="2019"
            />
            <TextField
              label="Téléphone de réception"
              prefix="CI +225"
              value={String(h.phone).replace("+225 ", "").replace("+225", "")}
              onChange={(e) => set("phone", "+225 " + e.target.value)}
            />
            <TextField
              label="Email établissement"
              value={h.email} onChange={(e) => set("email", e.target.value)}
              placeholder="contact@hotel.ci"
            />
            <TextField
              label="Site web" prefix="https://"
              value={String(h.website).replace(/^https?:\/\//, "")}
              onChange={(e) => set("website", e.target.value)}
              placeholder="hotel.ci"
            />
            <TextField
              label="Capacité totale (chambres)" type="number"
              value={String(h.capacity)} onChange={(e) => set("capacity", e.target.value)}
              placeholder="42"
            />
            <TextField
              label="Instagram" prefix="@"
              value={String(h.instagram).replace(/^@/, "")}
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
          <Tip>Le nom s&apos;affiche tel quel dans le feed — évitez les noms génériques ; préférez un nom distinctif et mémorable.</Tip>
        </InsCard>

        {/* 2. Adresse & géolocalisation */}
        <InsCard flat className="col-span-12 md:col-span-6">
          <SectionHead
            icon="mapPin"
            title="Adresse & géolocalisation"
            sub="Le pin GPS est obligatoire pour la recherche par carte"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Rue / boulevard"
              value={h.address} onChange={(e) => set("address", e.target.value)}
              placeholder="Boulevard Lagunaire"
              span={2}
            />

            {/* Ville */}
            <SelectField
              label="Ville"
              value={h.villeId ?? ""}
              onChange={(e) => {
                const id = e.target.value;
                const found = villes.find((v) => v.id === id);
                set("villeId", id || null);
                set("villeName", found?.name ?? "");
                // reset commune when ville changes
                set("communeId", null);
                set("communeName", "");
              }}
              options={[
                { value: "", label: villesLoading ? "Chargement…" : "Sélectionner une ville…" },
                ...villes.map((v) => ({ value: v.id, label: v.name })),
              ]}
            />

            {/* Commune */}
            <SelectField
              label="Commune"
              value={h.communeId ?? ""}
              onChange={(e) => {
                const id = e.target.value;
                const found = communes.find((c) => c.id === id);
                set("communeId", id || null);
                set("communeName", found?.name ?? "");
              }}
              options={[
                { value: "", label: communesLoading ? "Chargement…" : "Sélectionner une commune…" },
                ...communes.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
          </div>

          <div className="mt-4">
            <div className="text-[11px] font-bold tracking-wider uppercase text-ink-2 mb-2">
              Position sur la carte <span className="text-danger">*</span>
            </div>
            <LocationMap
              lat={h.lat}
              lng={h.lng}
              label={h.communeName || h.villeName || "Position"}
              subLabel={h.address ? `${h.address}${h.communeName ? `, ${h.communeName}` : ""}` : undefined}
              onPositionChange={(lat, lng) => update("hotel", (prev) => ({ ...prev, lat, lng }))}
            />
          </div>
        </InsCard>

        {/* 3. Description & positionnement */}
        <InsCard flat className="col-span-12 md:col-span-6">
          <SectionHead icon="edit" title="Description & positionnement" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextArea
              label="Description courte" required
              hint="1 phrase accroche — s'affiche dans le feed (max 120 caractères)"
              value={h.shortDesc} onChange={(e) => set("shortDesc", e.target.value)}
              rows={2} span={2}
              maxLength={120}
              placeholder="Hôtel de charme face à la lagune Ébrié, à 15min de l'aéroport."
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
              <div className="flex gap-1.5 flex-wrap mt-2.5">
                {["Sécurité 24/7", "Climatisation", "Wi-Fi haut débit", "Parking", "Vue mer", "Centre-ville", "Vue lagune", "Calme"]
                  .filter((x) => !h.strengths.includes(x))
                  .map((tag) => (
                    <Btn key={tag} variant="soft" size="sm"
                      onClick={() => set("strengths", [...h.strengths, tag])}>
                      <Icon name="plus" size={12} /> {tag}
                    </Btn>
                  ))}
              </div>
            </Field>
          </div>
          <Tip>La description courte est votre accroche dans le feed — commencez par <strong>l&apos;émotion</strong>, pas par les équipements.</Tip>
        </InsCard>

        {/* 4. Médias */}
        <InsCard flat className="col-span-12">
          <SectionHead
            icon="image"
            title="Médias de l'établissement"
            sub="Façade, réception, espaces communs — minimum 5 photos"
            right={
              <Pill kind={gallery.length >= 5 ? "success" : "primary"}>
                {totalMedia} média{totalMedia !== 1 ? "s" : ""}
              </Pill>
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Couverture */}
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-ink-2 mb-2">
                Photo de couverture <span className="text-danger">*</span>
              </div>
              <MediaUploadSlot
                slot={coverSlot}
                accept="image/*"
                idleIcon="image"
                idleTitle="Choisir la photo de couverture"
                idleSub="Format paysage 16:9 · min 1920px · JPG ou PNG"
                aspect="16/9"
                onPick={(f) => handleSingleUpload(f, setCoverSlot, (id) => set("coverFileId", id))}
                onRemove={() => handleSingleRemove(coverSlot, setCoverSlot, () => set("coverFileId", null))}
              />
            </div>

            {/* Vidéo */}
            <div>
              <div className="text-[11px] font-bold tracking-wider uppercase text-ink-2 mb-2">
                Vidéo de présentation
              </div>
              <MediaUploadSlot
                slot={videoSlot}
                accept="video/*"
                idleIcon="video"
                idleTitle="Ajouter une vidéo"
                idleSub="MP4 · 30s à 1min · max 500 Mo"
                aspect="16/9"
                onPick={(f) => handleSingleUpload(f, setVideoSlot, (id) => set("videoFileId", id))}
                onRemove={() => handleSingleRemove(videoSlot, setVideoSlot, () => set("videoFileId", null))}
              />
            </div>
          </div>

          {/* Galerie */}
          <div className="flex justify-between items-center mb-2.5">
            <div className="text-[11px] font-bold tracking-wider uppercase text-ink-2">
              Galerie établissement <span className="text-danger">*</span>
            </div>
            <div className="text-[11.5px] text-ink-3">
              {gallery.length} / minimum 5 photos
              {galleryUploading > 0 && (
                <span className="ml-2 text-primary font-medium">· {galleryUploading} en cours…</span>
              )}
            </div>
          </div>
          <div className="grid gap-2.5 grid-cols-[repeat(auto-fill,minmax(120px,1fr))]">
            {gallery.map((item) => (
              <Thumb key={item.fileId} onRemove={() => handleGalleryRemove(item.fileId)}>
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt={item.fileName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Icon name="image" size={28} className="text-ink-3" />
                )}
              </Thumb>
            ))}
            {/* Loading placeholders */}
            {Array.from({ length: galleryUploading }).map((_, i) => (
              <div key={`loading-${i}`} className="aspect-4/3 rounded-xl bg-primary-50 flex items-center justify-center">
                <svg className="animate-spin w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </div>
            ))}
            {/* Add button */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) handleGalleryFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <ThumbAdd onClick={() => galleryInputRef.current?.click()} />
          </div>

          <Tip>Les hôtels avec <strong>vidéo drone</strong> reçoivent 3× plus de clics dans le feed — le studio Immo Plus se déplace à Abidjan dès <strong>75 000 FCFA</strong>.</Tip>
        </InsCard>

      </div>
    </div>
  );
}
