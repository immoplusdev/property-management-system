"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { OnboardingStatus } from "@/lib/api/onboarding/onboarding.actions";

const CONFIG: Record<
  Exclude<OnboardingStatus, "draft" | "published">,
  { icon: string; color: string; bg: string; title: string; message: string }
> = {
  submitted: {
    icon: "clock", color: "var(--color-warn)", bg: "var(--color-warn-bg)",
    title: "Dossier soumis",
    message: "Votre établissement a été soumis et attend la validation de notre équipe (sous 48h). Le tableau de bord PMS sera débloqué dès l'approbation.",
  },
  under_review: {
    icon: "eye", color: "var(--color-primary)", bg: "var(--color-primary-50)",
    title: "Dossier en cours d'examen",
    message: "Notre équipe vérifie actuellement votre établissement. Vous pourrez accéder à toutes les fonctionnalités du PMS une fois la validation terminée.",
  },
  rejected: {
    icon: "x", color: "var(--color-danger)", bg: "var(--color-danger-bg)",
    title: "Dossier refusé",
    message: "Votre dossier n'a pas été validé. Contactez le support pour connaître les raisons et soumettre un nouveau dossier.",
  },
};

export function PmsPending({
  status,
  rejectionReason,
}: {
  status: Exclude<OnboardingStatus, "draft" | "published">;
  rejectionReason?: string;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const cfg = CONFIG[status];

  function refresh() {
    setRefreshing(true);
    router.refresh();
    // Visual feedback only — router.refresh() re-renders the server component tree.
    setTimeout(() => setRefreshing(false), 1200);
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="w-full max-w-130 bg-surface border border-border rounded-[20px] p-8 text-center shadow-sm">
        <div
          className="w-16 h-16 rounded-[18px] grid place-items-center mx-auto mb-5"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <Icon name={cfg.icon} size={28} />
        </div>
        <h1 className="text-[20px] font-bold tracking-[-0.02em] mb-2">{cfg.title}</h1>
        <p className="text-[13.5px] text-ink-2 leading-relaxed max-w-100 mx-auto">{cfg.message}</p>
        {status === "rejected" && rejectionReason && (
          <div className="mt-4 px-4 py-3 rounded-[12px] bg-danger-bg text-danger text-[12.5px] text-left">
            <strong>Motif :</strong> {rejectionReason}
          </div>
        )}

        <div className="flex items-center justify-center gap-2.5 mt-6">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-ink text-white text-[13px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {refreshing
              ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <Icon name="refresh" size={15} />}
            {refreshing ? "Vérification…" : "Vérifier le statut"}
          </button>
          <a
            href="mailto:support@immoplus.ci"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] border border-border text-ink-2 text-[13px] font-semibold hover:bg-surface-2 transition-colors"
          >
            <Icon name="mail" size={15} /> Contacter le support
          </a>
        </div>
      </div>
    </div>
  );
}
