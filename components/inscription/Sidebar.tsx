"use client";
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
    <aside className="sidebar-pill" aria-label="Étapes d'inscription">
      {/* Brand mark */}
      <div className="sp-brand">
        <div className="sp-brand-mark" title="Immo Plus App" style={{ padding: 0, overflow: "hidden", borderRadius: "50%" }}>
          <img 
            src="/logo-immoplus.png" 
            alt="Logo Immo Plus" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Step icons nav */}
      <nav className="sp-nav" role="navigation" aria-label="Navigation par étape">
        {NAV_STEPS.map(({ step, Icon, label, sub }) => {
          const isActive = currentStep === step;
          const isDone = stepsDone >= step && !isActive;

          return (
            <button
              key={step}
              className={`sp-nav-item${isActive ? " sp-active" : ""}${isDone ? " sp-done" : ""}`}
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
              {isActive && <span className="sp-active-ring" aria-hidden="true" />}
            </button>
          );
        })}
      </nav>

      {/* Progress ring */}
      <div className="sp-footer">
        <div
          className="sp-progress-ring"
          title={`Progression : ${completion}%`}
          aria-label={`Progression ${completion}%`}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
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
          <span className="sp-progress-pct">{completion}%</span>
        </div>
      </div>
    </aside>
  );
}
