"use client";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/Logo";
import {
  Profile,
  Buildings,
  Setting2,
  Lovely,
  Cup,
  Wallet,
  Flag2,
} from "iconsax-react";

interface SidebarProps {
  currentStep: number;
  goTo: (step: number) => void;
  completion: number;
  stepsDone: number;
}

const NAV_STEPS = [
  {
    step: 1,
    Icon: Profile,
    label: "Compte hôtelier",
    sub: "Identité du gérant",
  },
  {
    step: 2,
    Icon: Buildings,
    label: "Établissement",
    sub: "Carte d'identité",
  },
  {
    step: 3,
    Icon: Setting2,
    label: "Équipements",
    sub: "Services généraux",
  },
  {
    step: 4,
    Icon: Lovely,
    label: "Types de chambres",
    sub: "Inventaire & médias",
  },
  {
    step: 5,
    Icon: Cup,
    label: "Valeurs ajoutées",
    sub: "Restaurant, bar, spa…",
  },
  {
    step: 6,
    Icon: Wallet,
    label: "Tarification",
    sub: "Paiement & conditions",
  },
  {
    step: 7,
    Icon: Flag2,
    label: "Récapitulatif",
    sub: "Vérification & publication",
  },
] as const;

export function Sidebar({ currentStep, goTo, completion, stepsDone }: SidebarProps) {
  return (
    <aside className="sticky top-0 h-dvh flex flex-col items-center py-5 z-50 gap-0" aria-label="Étapes d'inscription">
      {/* Brand mark */}
      <div className="mb-12 shrink-0">
        <Logo size="lg" />
      </div>

      {/* Step icons nav */}
      <nav
        className="flex flex-col items-center gap-4 bg-white rounded-[24px] px-2 py-4 flex-1 max-h-[430px] justify-center my-auto"
        role="navigation"
        aria-label="Navigation par étape"
      >
        {NAV_STEPS.map(({ step, Icon, label, sub }) => {
          const isActive = currentStep === step;
          const isDone = stepsDone >= step && !isActive;

          return (
            <button
              key={step}
              className={cn(
                "relative w-11 h-11 rounded-[24px] grid place-items-center cursor-pointer border-0 bg-transparent text-[#9496A8] shrink-0 transition-[background-color,color] duration-180",
                "hover:bg-[rgba(39,68,222,0.06)] hover:text-primary",
                isActive && "bg-primary text-white hover:bg-primary-600",
                isDone && "bg-[rgba(39,68,222,0.07)] text-primary hover:bg-[rgba(39,68,222,0.12)]"
              )}
              aria-label={`Étape ${step} — ${label}`}
              aria-current={isActive ? "step" : undefined}
              title={`${label}\n${sub}`}
              type="button"
              onClick={() => goTo(step)}
            >
              <Icon
                size={20}
                variant={isActive ? "Bold" : "Linear"}
                color={isActive ? "#ffffff" : isDone ? "#2744DE" : "#9496A8"}
              />
            </button>
          );
        })}
      </nav>

      {/* Progress ring */}
      <div className="mt-7 shrink-0">
        <div
          className="relative w-11 h-11 grid place-items-center"
          title={`Progression : ${completion}%`}
          aria-label={`Progression ${completion}%`}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" className="absolute inset-0 overflow-visible">
            {/* Track */}
            <circle
              cx="22" cy="22" r="17"
              fill="none"
              stroke="rgba(39,68,222,0.10)"
              strokeWidth="2.5"
            />
            {/* Progress arc */}
            <circle
              cx="22" cy="22" r="17"
              fill="none"
              stroke="#2744DE"
              strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 17}`}
              strokeDashoffset={`${2 * Math.PI * 17 * (1 - completion / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 22 22)"
              style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
            />
          </svg>
          <span className="relative z-1 text-[9px] font-bold tracking-[-0.02em] text-primary tabular-nums leading-none">{completion}%</span>
        </div>
      </div>
    </aside>
  );
}
