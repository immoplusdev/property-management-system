"use client";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { OnboardingStatus } from "@/lib/api/onboarding/onboarding.actions";

const BANNER_CONFIG: Record<
  Exclude<OnboardingStatus, "draft" | "published">,
  { bg: string; border: string; text: string; icon: React.ReactNode; message: string }
> = {
  submitted: {
    bg:     "bg-warn-bg",
    border: "border-warn",
    text:   "text-warn",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    message: "Votre dossier a été soumis et est en attente de vérification par notre équipe. Nous reviendrons vers vous sous 48h.",
  },
  under_review: {
    bg:     "bg-primary-50",
    border: "border-primary-200",
    text:   "text-primary-700",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    message: "Votre dossier est en cours d'examen par notre équipe. Votre hôtel n'est pas encore visible sur nos plateformes.",
  },
  rejected: {
    bg:     "bg-danger-bg",
    border: "border-danger",
    text:   "text-danger",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
    message: "Votre dossier a été refusé. Contactez notre support pour connaître les raisons et soumettre un nouveau dossier.",
  },
};

interface PmsStatusBannerProps {
  status: Exclude<OnboardingStatus, "draft" | "published">;
  rejectionReason?: string;
}

export function PmsStatusBanner({ status, rejectionReason }: PmsStatusBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const cfg = BANNER_CONFIG[status];

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[9990] flex items-center gap-3 px-5 h-11 border-b text-[12.5px] font-medium",
        cfg.bg, cfg.border, cfg.text,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="shrink-0">{cfg.icon}</span>
      <span className="flex-1 truncate">
        {cfg.message}
        {status === "rejected" && rejectionReason && (
          <span className="ml-1.5 font-semibold">Motif : {rejectionReason}</span>
        )}
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fermer"
        className={cn(
          "shrink-0 w-6 h-6 rounded-md grid place-items-center transition-colors",
          "hover:bg-black/10"
        )}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
