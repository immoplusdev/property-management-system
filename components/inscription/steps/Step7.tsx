"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { StepProps } from "../types";
import { submitOnboarding } from "@/lib/api/onboarding/onboarding.actions";
import { SectionHead } from "../ui/SectionHead";
import { Pill } from "../ui/Pill";
import { Fcfa } from "../ui/Fcfa";
import { Icon } from "../ui/Icon";
import { InsCard } from "../ui/InsCard";
import { cn } from "@/lib/utils/cn";
import { fileUrl } from "@/lib/utils/fileUrl";

const STATUS_ICON: Record<string, string> = {
  ok:   "border-[rgba(31,138,91,0.18)] bg-success-bg text-success",
  warn: "border-[rgba(184,107,10,0.22)] bg-warn-bg text-warn",
  info: "border-[rgba(39,68,222,0.18)] bg-primary-50 text-primary",
};

export function Step7({ state, completion = 89, goTo }: StepProps) {
  const router = useRouter();
  const { account, hotel, equip, roomTypes, valueAdds, pricing } = state;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState<string | null>(null);

  const equipChecked = Object.values(equip).filter((v) => v === true).length;
  const totalRooms = roomTypes.reduce((s, r) => s + Number(r.totalRooms), 0);
  const completeRooms = roomTypes.filter((r) => r.complete).length;
  const VA_FIXED_KEYS = ["restaurant", "bar", "pool", "gym", "spa", "conference", "outdoor"] as const;
  const vaFixed = VA_FIXED_KEYS.filter((k) => valueAdds[k].configured).length;
  const vaConfigured = vaFixed + valueAdds.customSpaces.length;
  const totalRevPerNight = roomTypes.reduce((s, r) => s + r.basePrice * Number(r.totalRooms), 0);
  const payMethods = [
    pricing.payWave && "Wave",
    pricing.payOM && "Orange Money",
    pricing.payCard && "Carte",
    pricing.payCash && "Espèces",
  ].filter(Boolean).join(" · ");

  const hotelOk      = !!(hotel.name && hotel.type);
  const mediaCount   = hotel.galleryFileIds.length + (hotel.coverFileId ? 1 : 0);
  const pricingOk    = payMethods.length > 0 && !!pricing.cancelPolicy;
  const hasMobileMoney = pricing.payWave || pricing.payOM;
  const canSubmit    = (completion ?? 0) >= 60 && hasMobileMoney;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setSubmitError(
        !hasMobileMoney
          ? "Wave ou Orange Money est requis pour recevoir vos paiements."
          : "Votre dossier doit atteindre au moins 60% avant soumission."
      );
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await submitOnboarding();
    setIsSubmitting(false);
    if (result.ok) {
      // Redirect to PMS with success notification
      router.push("/pms");
    } else {
      setSubmitError(result.error.message);
    }
  };

  const sections = [
    {
      id: 1, title: "Compte hôtelier", icon: "user",
      status: account.acceptedTerms ? "ok" : "warn",
      info: [account.fullName, account.phone].filter(Boolean).join(" · ") || "—",
      action: account.acceptedTerms ? "Validé" : "Accepter les CGU",
    },
    {
      id: 2, title: "Établissement", icon: "building",
      status: hotelOk ? "ok" : "warn",
      info: [hotel.name, hotel.stars ? `${hotel.stars}★` : null, hotel.address || null, `${mediaCount} média${mediaCount !== 1 ? "s" : ""}`].filter(Boolean).join(" · ") || "—",
      action: hotelOk ? "Validé" : "Compléter",
    },
    {
      id: 3, title: "Équipements & services", icon: "sparkles",
      status: equipChecked >= 5 ? "ok" : "info",
      info: `${equipChecked} équipement${equipChecked !== 1 ? "s" : ""} sélectionné${equipChecked !== 1 ? "s" : ""}`,
      action: equipChecked >= 5 ? "Validé" : "Aucun sélectionné",
    },
    {
      id: 4, title: "Types de chambres", icon: "bed",
      status: roomTypes.length > 0 && completeRooms === roomTypes.length ? "ok" : roomTypes.length === 0 ? "warn" : "warn",
      info: roomTypes.length > 0
        ? `${roomTypes.length} type${roomTypes.length !== 1 ? "s" : ""} · ${totalRooms} chambre${totalRooms !== 1 ? "s" : ""} · ${completeRooms}/${roomTypes.length} complet${completeRooms !== 1 ? "s" : ""}`
        : "Aucun type ajouté",
      action: roomTypes.length === 0 ? "Ajouter des types" : completeRooms === roomTypes.length ? "Validé" : `Compléter ${roomTypes.length - completeRooms} type(s)`,
    },
    {
      id: 5, title: "Espaces valorisés", icon: "utensils",
      status: vaConfigured >= 3 ? "ok" : "info",
      info: `${vaConfigured} espace${vaConfigured !== 1 ? "s" : ""} sélectionné${vaConfigured !== 1 ? "s" : ""}`,
      action: vaConfigured >= 3 ? "Validé" : "Recommandé : 3+ espaces",
    },
    {
      id: 6, title: "Tarification & conditions", icon: "creditCard",
      status: pricingOk ? "ok" : "warn",
      info: [payMethods || "Aucun mode de paiement", pricing.cancelPolicy ? `Annulation ${pricing.cancelPolicy}` : null, pricing.depositRequired ? `Acompte ${pricing.depositPct}%` : "Paiement à l'arrivée"].filter(Boolean).join(" · "),
      action: pricingOk ? "Validé" : "Compléter",
    },
  ] as const;

  const metrics = [
    ["Chambres", totalRooms],
    ["Types", roomTypes.length],
    ["Équip.", equipChecked],
    ["Espaces", vaConfigured],
  ] as const;

  const activationItems = [
    { i: "eye", t: "Mise en ligne immédiate", d: "Visible dans le feed avec badge « Hôtel »" },
    { i: "bell", t: "Notifications WhatsApp + SMS", d: "À chaque réservation, sans email obligatoire" },
    { i: "trendingUp", t: "Tableau de bord PMS", d: "Réservations, occupation, revenus, avis" },
    { i: "users", t: "Stories clients UGC", d: "Vos clients postent et lient votre fiche" },
  ] as const;

  return (
    <div className="animate-insc-fade">
      {/* Custom page head (12-col) */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-3 items-end mb-7.5">
        <div className="col-span-12 flex items-center gap-3 text-[10px] font-bold tracking-[0.18em] uppercase text-ink-3 before:content-[''] before:w-5 before:h-px before:bg-primary before:rounded-px before:shrink-0">
          Étape 7 sur 7 — dernière étape
        </div>
        <h1 className="col-span-12 lg:col-span-7 text-[clamp(40px,4.2vw,58px)] font-extrabold tracking-[-0.048em] leading-[0.98] m-0 text-balance">
          Tout est prêt — vérifions ensemble
        </h1>
        <p className="col-span-12 lg:col-start-8 lg:col-span-5 max-w-[560px] lg:justify-self-end text-[14px] text-ink-3 leading-[1.7] m-0 text-pretty">
          Voici le résumé complet de votre fiche. Notre équipe vérifie sous 24–48h et vous notifie par WhatsApp + SMS à la validation.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">

        {/* Completion */}
        <InsCard flat className="col-span-12 lg:col-span-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)] gap-7 items-stretch bg-[#FBFBFA] min-h-73">
          <div className="min-w-0 flex flex-col justify-between">
            <div>
              <div className="font-mono text-[11px] font-bold tracking-[0.08em] uppercase text-ink-3">Score de complétion</div>
              <div className="mt-4 text-[clamp(58px,6vw,86px)] font-extrabold tracking-[-0.05em] leading-[0.95] text-ink tabular-nums">{completion}%</div>
              <p className="max-w-[620px] mt-3.5 mb-6 text-ink-2 text-[15px] leading-[1.55] text-pretty">
                {completion >= 95
                  ? "Votre fiche est exemplaire. Vous pouvez soumettre."
                  : "Ajoutez une vidéo de présentation pour atteindre 100% et débloquer le badge « Premium »."}
              </p>
            </div>
            <div className="h-2.5 overflow-hidden border border-border rounded-full bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion}>
              <div className="h-full rounded-[inherit] bg-ink" style={{ width: `${completion}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 content-start" aria-label="Statistiques de la fiche">
            {metrics.map(([label, value], i) => (
              <div
                key={label}
                className={cn(
                  "min-h-[90px] flex flex-col justify-center px-4 py-3.5 border-b border-border",
                  i % 2 === 0 && "border-r pl-0",
                  i >= 2 && "border-b-0 pb-0"
                )}
              >
                <div className="text-[34px] font-extrabold tracking-tighter leading-none tabular-nums">{value}</div>
                <div className="mt-1.75 text-ink-3 text-[12px] font-semibold">{label}</div>
              </div>
            ))}
          </div>
        </InsCard>

        {/* Activation */}
        <InsCard flat className="col-span-12 lg:col-span-4 flex flex-col">
          <SectionHead icon="sparkles" title="Ce qui s'active après publication" />
          <div className="flex flex-col flex-1">
            {activationItems.map((it) => (
              <div key={it.t} className="flex items-start gap-3 border-b border-border py-3.5 first:pt-1 last:border-b-0 last:pb-0">
                <div className="w-8.5 h-8.5 shrink-0 grid place-items-center border border-[rgba(39,68,222,0.14)] rounded-[10px] bg-primary-50 text-primary">
                  <Icon name={it.i} size={16} />
                </div>
                <div>
                  <div className="text-[13.5px] font-bold tracking-[-0.015em]">{it.t}</div>
                  <div className="mt-0.5 text-ink-3 text-[12px] leading-[1.4]">{it.d}</div>
                </div>
              </div>
            ))}
          </div>
        </InsCard>

        {/* Sections recap */}
        <InsCard flat className="col-span-12 lg:col-span-7 flex flex-col">
          <SectionHead icon="list" title="Récapitulatif par section" />
          <div className="flex flex-col flex-1">
            {sections.map((s) => (
              <article key={s.id} className="flex items-center justify-between gap-4 border-b border-border py-3.25 last:border-b-0 last:pb-0">
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <div className={cn("w-9 h-9 shrink-0 grid place-items-center border rounded-[10px]", STATUS_ICON[s.status])}>
                    <Icon name={s.icon} size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold tracking-[-0.02em] text-ink">Étape {s.id} · {s.title}</div>
                    <div className="mt-1 text-ink-3 text-[12.5px] leading-[1.45]">{s.info}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Pill kind={s.status === "ok" ? "success" : s.status === "warn" ? "warn" : "primary"} dot>
                    {s.status === "ok" ? "OK" : s.status === "warn" ? "À compléter" : "Optionnel"}
                  </Pill>
                  <button
                    onClick={() => goTo?.(s.id)}
                    className="inline-flex items-center gap-1.75 h-8.5 px-3.5 text-[12.5px] font-semibold rounded-lg border-[1.5px] border-border bg-surface text-ink hover:bg-surface-2 hover:border-border-strong"
                  >
                    <Icon name="edit" size={13} /> Modifier
                  </button>
                </div>
              </article>
            ))}
          </div>
        </InsCard>

        {/* Feed preview */}
        <InsCard flat className="col-span-12 lg:col-span-5 flex flex-col">
          <SectionHead icon="eye" title="Prévisualisation dans le feed" sub="Voici comment votre hôtel apparaîtra aux voyageurs" />
          <div className="flex flex-1 mt-3">
            <div className="w-full flex-1 flex flex-col border border-border rounded-[20px] overflow-hidden">
              <div
                className="relative min-h-[clamp(250px,24vw,340px)] p-3 bg-[#DCE8EE] flex flex-col justify-between bg-cover bg-center overflow-hidden"
                style={hotel.coverFileId ? { backgroundImage: `url('${fileUrl(hotel.coverFileId)}')` } : undefined}
              >
                {/* Gradient overlay for text readability */}
                {hotel.coverFileId && (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
                )}
                <div className="relative flex justify-between items-start">
                  <div className="flex gap-1.5">
                    <span className="bg-white/95 text-ink text-[10px] font-bold px-2 py-0.75 rounded-md inline-flex items-center gap-1 border border-[rgba(10,10,15,0.08)]"><Icon name="building" size={11} /> HÔTEL</span>
                    <span className="bg-amber-bg text-amber text-[10px] font-bold px-2 py-0.75 rounded-md inline-flex items-center gap-1 border border-[rgba(10,10,15,0.08)]">
                      {Array.from({ length: hotel.stars }).map((_, i) => <span key={i}>★</span>)}
                    </span>
                  </div>
                  <div className="w-7.5 h-7.5 rounded-lg bg-white/90 grid place-items-center text-ink-3 border border-[rgba(10,10,15,0.08)]"><Icon name="star" size={16} /></div>
                </div>
                <div className="relative text-white text-[11px] font-medium flex items-center gap-1 drop-shadow-sm"><Icon name="mapPin" size={12} /> {hotel.communeName}{hotel.villeName ? `, ${hotel.villeName}` : ""}</div>
              </div>
              <div className="p-3.5">
                <div className="text-[15px] font-bold tracking-[-0.015em]">{hotel.name}</div>
                <div className="text-[12px] text-ink-3 mt-1 leading-[1.4]">{hotel.shortDesc}</div>
                <div className="flex gap-1 mt-2.5 flex-wrap">
                  {hotel.strengths.slice(0, 3).map((s) => (
                    <span key={s} className="border border-border rounded-lg bg-white text-ink-2 px-2 py-0.75 text-[10.5px] font-semibold">{s}</span>
                  ))}
                </div>
                <div className="flex items-end justify-between mt-3.5 pt-3 border-t border-border">
                  <div>
                    <div className="text-[13px] font-bold tabular-nums">
                      {roomTypes.length > 0
                        ? <>à partir de <Fcfa value={Math.min(...roomTypes.map((r) => r.basePrice))} /></>
                        : <span className="text-ink-3">—</span>}
                    </div>
                    <div className="text-[10px] text-ink-3">par nuit · {roomTypes.length} type{roomTypes.length !== 1 ? "s" : ""} disponible{roomTypes.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div className="flex items-center gap-1 text-[13px] font-semibold">
                    <Icon name="star" size={13} color="var(--amber)" /> 4.8 <span className="text-ink-3">(0 avis)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </InsCard>

        {/* Revenue projection */}
        <InsCard flat className="col-span-12 flex flex-col">
          <SectionHead icon="trendingUp" title="Projection de revenus" sub="Basé sur les prix saisis et un taux d'occupation de 65%" />
          <div className="grid grid-cols-1 md:grid-cols-3 flex-1 items-stretch">
            {[
              { icon: "moneyBill", iconBg: "var(--primary-50)", iconColor: "var(--primary)", pill: <Pill kind="success" dot>Brut</Pill>, value: <Fcfa value={totalRevPerNight} />, label: "Revenu max / nuit (100%)" },
              { icon: "calendar", iconBg: "var(--teal-bg)", iconColor: "var(--teal)", pill: <Pill kind="teal" dot>Moyenne</Pill>, value: <Fcfa value={Math.round(totalRevPerNight * 0.65 * 30)} />, label: "Estimation mensuelle (65%)" },
              { icon: "award", iconBg: "var(--violet-bg)", iconColor: "var(--violet)", pill: <Pill kind="violet" dot>Net</Pill>, value: <Fcfa value={Math.round(totalRevPerNight * 0.65 * 30 * 0.92)} />, label: "Après commission Immo Plus (8%)" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-border px-0 py-4 md:px-6 md:py-5 first:pt-0 md:first:pl-0 last:border-b-0 md:last:border-r-0 last:pb-0 md:last:pr-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-[9px] grid place-items-center border border-border-soft" style={{ background: s.iconBg, color: s.iconColor }}><Icon name={s.icon} size={16} /></div>
                  {s.pill}
                </div>
                <div className="text-[28px] font-extrabold tracking-tighter leading-none tabular-nums">{s.value}</div>
                <div className="text-[12px] text-ink-3 mt-1.5">{s.label}</div>
              </div>
            ))}
          </div>
        </InsCard>

        {/* Submit */}
        <InsCard flat className="col-span-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] items-center gap-7 border-[rgba(31,138,91,0.24)]">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-13.5 h-13.5 shrink-0 grid place-items-center border border-[rgba(31,138,91,0.22)] rounded-xl bg-success-bg text-success">
              <Icon name="check" size={24} stroke={3} />
            </div>
            <div className="min-w-0">
              <div className="text-[22px] font-bold tracking-tight">Prêt à soumettre votre fiche</div>
              <p className="max-w-190 mt-2.25 text-ink-2 text-[14px] leading-[1.55]">
                Notre équipe vérifie votre dossier sous 24 à 48h. Vous recevrez une notification WhatsApp + SMS dès validation.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {submitError && (
              <div className="flex items-start gap-2 text-[12.5px] text-danger bg-danger-bg border border-[rgba(193,56,56,0.18)] rounded-xl px-3.5 py-2.5 leading-[1.4]">
                <Icon name="alertTriangle" size={14} className="shrink-0 mt-px" />
                {submitError}
              </div>
            )}
            {!canSubmit && !submitError && (
              <div className="text-[11.5px] text-ink-3 leading-[1.4]">
                {!hasMobileMoney
                  ? "⚠ Wave ou Orange Money requis pour la soumission."
                  : `Score actuel : ${completion}% — minimum 60% requis.`}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 min-h-13.5 px-5.5 rounded-2xl bg-primary text-white border-[1.5px] border-primary text-[14.5px] font-semibold hover:bg-primary-600 hover:border-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Soumission en cours…
                </>
              ) : (
                <><Icon name="send" size={16} /> Soumettre pour validation</>
              )}
            </button>
          </div>
        </InsCard>
      </div>
    </div>
  );
}
