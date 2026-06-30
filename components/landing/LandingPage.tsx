"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { cva } from "class-variance-authority";
import { ArrowRight, Home2, TickCircle, TrendUp, Star, Key, Briefcase, Buildings2, SmartHome } from "iconsax-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/Logo";
import SignUpModal from "../signup/SignUpModal";
import LoginModal from "../signup/LoginModal";
import SmoothScroll from "./SmoothScroll";
import type { UserDto } from "@/lib/api/generated/model";
import {
  ease, fadeUp, reveal, stagger, float,
  staggerContainer, staggerItem, hoverTapButton,
} from "@/lib/animations/motion";

/* ──────────── Button variants (cva) ──────────── */
const btn = cva(
  "inline-flex items-center gap-2 font-semibold rounded-full transition-all whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:      "bg-primary text-white hover:bg-primary-600",
        dark:         "bg-ink text-white hover:bg-dark",
        outline:      "text-ink border border-border-strong hover:bg-surface-2",
        outlineLight: "text-white border border-white/20 hover:bg-white/10 hover:border-white/45",
      },
      size: {
        default: "text-[14.5px] py-3 px-[22px]",
        lg:      "text-[15.5px] py-[15px] px-7",
        nav:     "text-[13.5px] py-[10px] px-[18px]",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

/* ──────────── Layout wrapper ──────────── */
const Wrap = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("max-w-[1180px] mx-auto px-7 max-[560px]:px-[18px]", className)}>
    {children}
  </div>
);

/* ──────────── Brand mark ──────────── */
const BrandMark = () => (
  <Logo size="sm" showHover={false} />
);

const BrandName = () => (
  <span className="font-semibold text-[17px] tracking-[-0.02em] flex items-center gap-2">
    Immo Plus{" "}
    <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-primary border border-primary/35 px-1.5 py-px rounded-[5px]">
      PMS
    </span>
  </span>
);

/* ──────────── Animated counter ──────────── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(to / 50);
    const timer = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(timer); }
      else setVal(start);
    }, 28);
    return () => clearInterval(timer);
  }, [inView, to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ──────────── Check icon ──────────── */
const CheckIcon = ({ size = 17 }: { size?: number }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ──────────── NAV ──────────── */
function Nav({ onDemo, user }: { onDemo: () => void; user: UserDto | null }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white/[0.82] backdrop-saturate-[180%] backdrop-blur-[14px]",
      "border-b border-transparent transition-[border-color] duration-200",
      scrolled && "border-border"
    )}>
      <Wrap className="flex items-center justify-between h-[74px]">
        <Link href="/" className="flex items-center gap-[11px]">
          <BrandMark />
          <BrandName />
        </Link>

        <nav className="hidden min-[880px]:flex items-center gap-[30px]">
          {([
            ["#features", "Fonctionnalités"],
            ["#showcase", "Le produit"],
            ["#paiements", "Paiements"],
            ["#tarifs", "Tarifs"],
          ] as const).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-ink-2 hover:text-ink transition-colors duration-[120ms]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link href="/pms" className="w-10 h-10 rounded-full grid place-items-center hover:bg-surface-2 transition-colors" title={user.firstName ?? "Profil"}>
                <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center font-semibold text-[12px]">
                  {user.firstName?.[0]?.toUpperCase() ?? "U"}
                </div>
              </Link>
              <Link href="/logout" className={btn({ variant: "outline", size: "nav" })}>
                Déconnexion
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(btn({ variant: "outline", size: "nav" }), "hidden min-[560px]:inline-flex")}>
                Connexion
              </Link>
              <motion.button className={btn({ variant: "dark", size: "nav" })} onClick={onDemo} {...hoverTapButton}>
                Réserver une démo
              </motion.button>
            </>
          )}
        </div>
      </Wrap>
    </header>
  );
}

/* ──────────── HERO CARDS ──────────── */
function HeroCards() {
  return (
    <div className="relative max-w-[1100px] mx-auto mt-1 min-h-[400px] max-[760px]:min-h-0 max-[760px]:mt-7 max-[760px]:flex max-[760px]:flex-col max-[760px]:items-center max-[760px]:gap-6">

      {/* Occupation card — left, floating, tilted */}
      <motion.div
        className="absolute left-0 top-[18px] w-[296px] bg-white border border-border rounded-2xl shadow-lg p-[18px] -rotate-[5deg] max-[760px]:static max-[760px]:rotate-0 max-[760px]:w-full max-[760px]:max-w-[330px]"
        {...float(8, 6.5, 0)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-[42px] h-[42px] rounded-[10px] bg-gradient-to-br from-[#dfe3f7] to-[#eef0fb] shrink-0 grid place-items-center text-primary">
              <SmartHome size={22} variant="Outline" />
            </div>
            <div>
              <div className="font-semibold text-[14.5px]">Hotel Lagune Bleue</div>
              <div className="text-xs text-ink-3">42 chambres · Abidjan</div>
            </div>
          </div>
          <div
            className="w-[52px] h-[52px] rounded-full shrink-0 grid place-items-center"
            style={{ background: "conic-gradient(#2744DE 87%, #E8E9EE 0)" }}
          >
            <i className="w-[38px] h-[38px] rounded-full bg-white grid place-items-center not-italic font-semibold text-[12.5px]">87%</i>
          </div>
        </div>
        <div className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-ink-3 mb-1.5">
          Taux d&apos;occupation
        </div>
        <div className="h-[5px] rounded-full bg-border overflow-hidden mt-2.5">
          <i className="block h-full rounded-full bg-primary not-italic" style={{ width: "87%" }} />
        </div>
        <div className="flex items-center justify-between mt-[11px] text-xs text-ink-3">
          <span>36 occupées</span><span>6 libres</span>
        </div>
        <motion.div
          className="absolute left-[-10px] bottom-[-22px] bg-white border border-border rounded-xl shadow-lg p-[9px] pr-[13px] flex items-center gap-2.5 max-[760px]:static max-[760px]:inline-flex max-[760px]:mt-3.5"
          {...float(7, 7, 0.8)}
        >
          <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-semibold text-xs shrink-0 bg-[#6FB5A8]">AK</div>
          <div>
            <div className="font-semibold text-[13px] leading-[1.15]">Aïcha Koné</div>
            <div className="text-[11px] text-ink-3">Réceptionniste</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Invoice card — center, dashboard, overlapping the fold */}
      <motion.div
        className="relative z-10 mx-auto bg-white border border-border rounded-2xl shadow-xl w-[340px] p-[18px] max-[760px]:static max-[760px]:w-full max-[760px]:max-w-[330px]"
        {...float(10, 7, 0.5)}
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-semibold text-xs shrink-0 bg-[#7B8DFF]">DK</div>
            <div>
              <div className="font-semibold text-sm">Facture séjour</div>
              <div className="text-[11.5px] text-ink-3 font-mono">RES-2026-0518-004</div>
            </div>
          </div>
          <span className="font-mono text-[11px] font-semibold tracking-[0.04em] text-success border-[1.5px] border-success rounded-[6px] px-2 py-[3px] rotate-[-7deg] uppercase inline-block">
            Payé
          </span>
        </div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <div className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-ink-3">Montant</div>
            <div className="font-semibold text-[17px] mt-[3px]">
              380 000 <span className="text-[11px] text-ink-3 font-medium">FCFA</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-ink-3">Méthode</div>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-[#e8f0ff] text-[#1a6dff] mt-[5px]">
              Wave
            </span>
          </div>
        </div>
        <div className="border-t border-border pt-3">
          <div className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-ink-3 mb-[9px]">Statut réservation</div>
          <div className="flex items-center gap-3.5 flex-wrap">
            {([
              { label: "Confirmée", state: "on",   muted: false },
              { label: "Check-in",  state: "half", muted: false },
              { label: "Facturée",  state: "off",  muted: true  },
            ] as const).map(({ label, state, muted }) => (
              <span key={label} className={cn("flex items-center gap-[7px] text-xs", muted && "text-ink-3")}>
                <span className={cn(
                  "w-4 h-4 rounded-full grid place-items-center shrink-0",
                  state === "on"   && "bg-primary text-white",
                  state === "half" && "[background:color-mix(in_srgb,#2744DE_22%,#fff)]",
                  state === "off"  && "border-[1.5px] border-border"
                )}>
                  {state === "on" && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ width: 9, height: 9 }}>
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>
        <motion.div
          className="absolute right-[-10px] bottom-[-22px] bg-white border border-border rounded-xl shadow-lg p-[9px] pr-[13px] flex items-center gap-2.5 max-[760px]:static max-[760px]:inline-flex max-[760px]:mt-3.5"
          {...float(8, 5.5, 1.4)}
        >
          <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-semibold text-xs shrink-0 bg-[#B57BE6]">DK</div>
          <div>
            <div className="font-semibold text-[13px] leading-[1.15]">Daniel Kouassi</div>
            <div className="text-[11px] text-ink-3">Suite Junior</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Revenue card — right, floating, tilted */}
      <motion.div
        className="absolute right-0 top-[46px] w-[218px] bg-white border border-border rounded-2xl shadow-lg p-4 rotate-[5deg] max-[760px]:static max-[760px]:rotate-0 max-[760px]:w-full max-[760px]:max-w-[330px]"
        {...float(9, 6, 1)}
      >
        <div className="flex items-center justify-between mb-[9px]">
          <span className="text-[10.5px] font-semibold tracking-[0.06em] uppercase text-ink-3">Revenu net · mai</span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-success-bg text-success">
            À jour
          </span>
        </div>
        <div className="text-[23px] font-semibold tracking-[-0.03em]">
          4 250 000<span className="text-[13px] text-ink-3 font-medium ml-[3px]">FCFA</span>
        </div>
        <div className="inline-flex items-center gap-[3px] text-success text-xs font-semibold mt-[5px]">
          <TrendUp size={13} variant="Outline" />
          +18% vs avril
        </div>
        <div className="flex items-end gap-[5px] h-[38px] mt-3.5">
          {[42, 58, 50, 72, 64, 88, 78].map((h, i) => (
            <b
              key={i}
              className={cn(
                "flex-1 rounded-t-sm block",
                i === 6 ? "bg-primary" : "[background:color-mix(in_srgb,#2744DE_24%,#fff)]"
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </motion.div>

    </div>
  );
}

/* ──────────── HERO ──────────── */
function Hero({ onDemo }: { onDemo: () => void }) {
  return (
    <section className="relative overflow-hidden pt-[46px]" id="top">
      <div className="absolute inset-0 z-0 pointer-events-none bg-white" />
      <div className="relative z-[1] max-w-[1220px] mx-auto px-7 pb-[40px] max-[1080px]:pb-[24px]">
        <div className="relative z-[6] max-w-[760px] mx-auto text-center pt-[18px]">

          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center bg-white border border-border rounded-full py-[5px] px-[6px] pl-[5px] text-[13px] shadow-xs mb-[22px]">
              <span className="bg-primary-50 text-primary font-semibold rounded-full px-[11px] py-1.5 text-xs">Nouveau</span>
              <span className="px-3 pl-[11px] text-ink-2 flex items-center gap-2 font-medium">
               Pensé pour l'hôtellerie ouest-africaine
                <ArrowRight size={14} />
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-[clamp(40px,6vw,72px)] leading-[1.02] font-semibold tracking-[-0.035em] m-0"
            {...fadeUp(0.06)}
          >
            Tout votre hôtel,<br />dans un seul <span className="text-primary">logiciel.</span>
          </motion.h1>

          <motion.p
            className="text-[clamp(16px,2vw,19px)] leading-[1.5] text-ink-2 max-w-[560px] mx-auto mt-5 m-0 whitespace-nowrap max-[640px]:whitespace-normal"
            {...fadeUp(0.12)}
          >
            Réservations, paiements mobile money, et finances réunis en un seul endroit.
          </motion.p>

          <motion.div className="flex gap-[13px] justify-center mt-7 flex-wrap" {...fadeUp(0.18)}>
            <motion.button className={btn({ variant: "primary", size: "lg" })} onClick={onDemo} {...hoverTapButton}>
              Démarrer gratuitement
            </motion.button>
          </motion.div>

          <motion.div
            className="mt-3.5 text-[12px] text-ink-3 flex gap-3.5 justify-center flex-wrap"
            {...fadeUp(0.24)}
          >
            {["Gratuit", "Facile à utiliser", "Rentable"].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <TickCircle size={13} className="text-success" variant="Outline" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.32 }}>
          <HeroCards />
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────── FEATURES ──────────── */
const FEATS = [
  { icon: "calendar", iconClass: "bg-primary-50 text-primary",  title: "Réservations",        desc: "Encaissez les réservations directes et synchronisez vos canaux. Vue claire des arrivées et départs du jour." },
  { icon: "grid",     iconClass: "bg-teal-bg text-teal",        title: "Planning chambres",   desc: "Un planning visuel par étage : libre, occupée, ménage, départ. Glissez-déposez pour réattribuer en un geste." },
  { icon: "key",      iconClass: "bg-violet-bg text-violet",    title: "Check-in express",    desc: "Enregistrez vos clients en moins d'une minute. Pièce d'identité, signature et fiche de police générées automatiquement." },
  { icon: "card",     iconClass: "bg-coral-bg text-coral",      title: "Encaissements",       desc: "Wave, Orange Money, MTN, espèces ou carte. Chaque paiement est rattaché à la bonne facture, sans saisie double." },
  { icon: "chart",    iconClass: "bg-amber-bg text-amber",      title: "Finances & rapports", desc: "Chiffre d'affaires, RevPAR, taux d'occupation et dépenses en temps réel. Exportez vos rapports en un clic." },
  { icon: "users",    iconClass: "bg-success-bg text-success",  title: "Clients & fidélité",  desc: "Historique des séjours, préférences et statut VIP. Reconnaissez vos habitués et personnalisez l'accueil." },
] as const;

const FEAT_ICONS: Record<string, React.ReactElement> = {
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  grid:     <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M8 14h3M8 17h6" /></>,
  key:      <><path d="M15 7a4 4 0 1 0-4 4M11 11l-7 7v3h3l1-1h2v-2h2l2-2" /></>,
  card:     <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
  chart:    <><path d="M3 3v18h18M7 14l3-4 3 3 5-6" /></>,
  users:    <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></>,
};

function Features() {
  return (
    <section className="py-24 max-[560px]:py-16" id="features">
      <Wrap>
        <motion.div className="max-w-[680px] mx-auto mb-14 text-center" {...reveal(0)}>
          <div className="text-[12.5px] font-semibold tracking-[0.1em] uppercase text-primary mb-3.5">
            Une plateforme, tous vos outils
          </div>
          <h2 className="text-[clamp(30px,4vw,46px)] leading-[1.06] font-semibold tracking-[-0.03em] m-0">
            Arrêtez de jongler entre dix outils.
          </h2>
          <p className="text-[17px] leading-[1.55] text-ink-2 mt-[18px] max-w-[560px] mx-auto m-0">
            Cahier de réservations, registre, caisse, Excel, WhatsApp… Immo Plus réunit tout ce qui fait tourner votre établissement au même endroit.
          </p>
        </motion.div>

        <div className="grid grid-cols-3 gap-5 max-[880px]:grid-cols-2 max-[560px]:grid-cols-1">
          {FEATS.map((f, i) => (
            <motion.div
              key={f.title}
              className="bg-white border border-border rounded-[28px] p-[30px] px-[28px] transition-all duration-[180ms] cursor-default hover:shadow-lg"
              {...stagger(i)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.18, ease }}
            >
              <div className={cn("w-[50px] h-[50px] rounded-[14px] grid place-items-center mb-[22px] [&>svg]:w-6 [&>svg]:h-6", f.iconClass)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                  {FEAT_ICONS[f.icon]}
                </svg>
              </div>
              <h3 className="text-[19px] font-semibold tracking-[-0.02em] m-0 mb-[9px]">{f.title}</h3>
              <p className="text-[14.5px] leading-[1.55] text-ink-2 m-0">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ──────────── DASHBOARD SHOWCASE ──────────── */
function DashboardShowcase() {
  return (
    <section className="py-24 bg-white border-y border-border-soft max-[560px]:py-16" id="showcase">
      <Wrap>
        <div className="grid grid-cols-[1fr_1.15fr] gap-16 items-center max-[880px]:grid-cols-1 max-[880px]:gap-10">

          <motion.div {...reveal(0)}>
            <div className="text-[12.5px] font-semibold tracking-[0.1em] uppercase text-primary mb-3.5">Le tableau de bord</div>
            <h2 className="text-[clamp(28px,3.4vw,40px)] leading-[1.06] font-semibold tracking-[-0.03em] m-0">
              Pilotez votre établissement d&apos;un coup d&apos;œil.
            </h2>
            <p className="text-[16.5px] leading-[1.55] text-ink-2 mt-4 m-0">
              Occupation, recettes du jour, arrivées et départs : l&apos;essentiel s&apos;affiche dès la connexion. Plus besoin de fouiller dix écrans pour savoir où vous en êtes.
            </p>
            <div className="mt-7 flex flex-col gap-4">
              {([
                ["Indicateurs en temps réel",  "Taux d'occupation, RevPAR et recettes mis à jour automatiquement."],
                ["Plan des chambres en direct", "Visualisez l'état de chaque chambre par étage et par statut."],
                ["Arrivées & départs du jour",  "Préparez l'accueil sans rien oublier, chaque matin."],
              ] as const).map(([b, p]) => (
                <div key={b} className="flex gap-[13px] items-start">
                  <span className="w-6 h-6 rounded-[7px] bg-primary-50 text-primary grid place-items-center shrink-0 mt-px">
                    <CheckIcon size={13} />
                  </span>
                  <div>
                    <b className="font-semibold text-[15px] block">{b}</b>
                    <p className="m-0 mt-[3px] text-[13.5px] text-ink-2 leading-[1.5]">{p}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal(0.1)}>
            <div className="bg-white border border-border rounded-[22px] shadow-xl overflow-hidden">
              <div className="flex items-center gap-[7px] p-[13px] px-4 border-b border-border-soft bg-white">
                {[0, 1, 2].map(k => <div key={k} className="w-[11px] h-[11px] rounded-full bg-border-strong" />)}
                <span className="ml-3 font-mono text-[11.5px] text-ink-3 bg-white border border-border rounded-[7px] px-3 py-1">
                  pms.immoplus.ci/tableau-de-bord
                </span>
              </div>
              <div className="p-[22px]">
                <div className="grid grid-cols-4 gap-3 mb-4 max-[880px]:grid-cols-2">
                  {([["Occupation","87%",""],["Recettes / j","1,2","M FCFA"],["Arrivées","8",""],["Départs","5",""]] as const).map(([k, v, s]) => (
                    <div key={k} className="border border-border rounded-xl p-[13px]">
                      <div className="text-[9.5px] font-semibold tracking-[0.06em] uppercase text-ink-3 mb-[7px]">{k}</div>
                      <div className="text-[21px] font-semibold tracking-[-0.03em]">{v}<small className="text-[11px] text-ink-3 font-medium">{s}</small></div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-[1.4fr_1fr] gap-3.5 max-[880px]:grid-cols-1">
                  <div className="border border-border rounded-xl p-[15px]">
                    <div className="text-[13px] font-semibold mb-3.5 flex items-center justify-between">
                      Recettes · 7 derniers jours
                      <span className="text-success text-[10.5px] font-mono">+18%</span>
                    </div>
                    <div className="flex items-end gap-[9px] h-[104px]">
                      {[48, 62, 54, 78, 70, 92, 64].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-[5px]">
                          <b
                            className={cn("block rounded-[5px_5px_2px_2px]", i === 6 ? "[background:color-mix(in_srgb,#2744DE_22%,#fff)]" : "bg-primary")}
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[9.5px] text-ink-4 text-center font-mono">{"LMMJVSD"[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-border rounded-xl p-[15px]">
                    <div className="text-[13px] font-semibold mb-3.5">Chambres · étage 2</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {([
                        ["201","bg-primary"],["202","bg-primary"],["203","bg-surface-2 text-ink-3"],
                        ["204","bg-primary"],["205","bg-primary"],["206","bg-amber"],
                        ["207","bg-primary"],["208","bg-surface-2 text-ink-3"],["209","bg-coral"],["210","bg-primary"],
                      ] as const).map(([n, c]) => (
                        <span key={n} className={cn("w-[30px] h-[30px] rounded-[7px] grid place-items-center text-[9.5px] font-semibold font-mono text-white", c)}>
                          {n}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3.5 mt-3 text-[11px] text-ink-3 flex-wrap">
                      {([
                        ["bg-primary",   "Occupée"],
                        ["bg-surface-2 border border-border", "Libre"],
                        ["bg-amber",     "Ménage"],
                        ["bg-coral",     "HS"],
                      ] as const).map(([c, l]) => (
                        <span key={l} className="flex items-center gap-1">
                          <i className={cn("w-[9px] h-[9px] rounded-[3px] inline-block not-italic", c)} />{l}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Wrap>
    </section>
  );
}

/* ──────────── PAYMENTS ──────────── */
const PAYS = [
  { logo: "Wave", bg: "#1A6DFF",                    name: "Wave",            ds: "Confirmé · il y a 2 min",  amt: "+114 000" },
  { logo: "OM",   bg: "#FF7900",                    name: "Orange Money",    ds: "Confirmé · il y a 18 min", amt: "+38 000"  },
  { logo: "MTN",  bg: "#FFCC00", textColor:"#1a1a1a", name: "MTN MoMo",    ds: "Confirmé · il y a 1 h",    amt: "+475 000" },
  { logo: "CB",   bg: "#0D0D17",                    name: "Carte & espèces", ds: "Caisse réconciliée",        amt: "+330 000" },
];

function Payments() {
  return (
    <section className="py-24 max-[560px]:py-16" id="paiements">
      <Wrap>
        <div className="grid grid-cols-[1.1fr_1fr] gap-14 items-center max-[880px]:grid-cols-1 max-[880px]:gap-10">

          <motion.div {...reveal(0)}>
            <div className="text-[12.5px] font-semibold tracking-[0.1em] uppercase text-primary mb-3.5">
              Pensé pour l&apos;Afrique de l&apos;Ouest
            </div>
            <h2 className="text-[clamp(28px,3.4vw,40px)] leading-[1.06] font-semibold tracking-[-0.03em] m-0">
              Le mobile money, nativement.
            </h2>
            <p className="text-[16.5px] leading-[1.55] text-ink-2 mt-4 m-0">
              Vos clients paient déjà par Wave et Orange Money. Immo Plus encaisse ces paiements directement et les réconcilie avec la bonne facture — sans tableur, sans erreur de caisse.
            </p>
            <div className="mt-[26px]">
              <Link href="/inscription" className={btn({ variant: "primary" })}>
                Configurer mes paiements
              </Link>
            </div>
          </motion.div>

          <div className="flex flex-col gap-3.5">
            {PAYS.map((p, i) => (
              <motion.div
                key={p.name}
                className="flex items-center gap-3.5 bg-white border border-border rounded-2xl px-[18px] py-4 shadow-xs transition-[border-color] duration-150 hover:border-border-strong"
                {...stagger(i)}
                whileHover={{ borderColor: "#C8C8E0", x: 2 }}
              >
                <div
                  className="w-[46px] h-[46px] rounded-xl grid place-items-center font-bold text-[13px] shrink-0 font-mono tracking-[-0.02em]"
                  style={{ background: p.bg, color: p.textColor ?? "#fff" }}
                >
                  {p.logo}
                </div>
                <div>
                  <div className="font-semibold text-[15px]">{p.name}</div>
                  <div className="text-[13px] text-ink-3 mt-0.5">{p.ds}</div>
                </div>
                <span className="ml-auto font-semibold font-mono text-sm text-success">{p.amt}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/* ──────────── STATS ──────────── */
const STATS = [
  { to: 42,  suffix: "",    label: "chambres gérées en démo" },
  { to: 1,   suffix: "min", label: "par check-in client" },
  { to: 100, suffix: "%",   label: "des paiements réconciliés" },
  { to: 24,  suffix: "/7",  label: "support en français" },
];

function Stats() {
  return (
    <section className="py-16 bg-white border-y border-border-soft">
      <Wrap>
        <motion.div
          className="grid grid-cols-4 gap-6 text-center max-[880px]:grid-cols-2 max-[880px]:gap-8"
          {...reveal(0)}
        >
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...stagger(i)}>
              <div className="text-[clamp(34px,4.4vw,50px)] font-semibold tracking-[-0.04em] leading-none text-primary">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <div className="text-[13.5px] text-ink-2 mt-2.5 leading-[1.4]">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </Wrap>
    </section>
  );
}

/* ──────────── STEPS ──────────── */
const STEPS = [
  { n: "1", title: "Créez votre établissement", desc: "Nom, chambres, types et tarifs. Notre assistant vous guide pas à pas en quelques minutes." },
  { n: "2", title: "Importez vos réservations",  desc: "Reprenez votre cahier ou vos canaux existants. Vos données arrivent prêtes à l'emploi." },
  { n: "3", title: "Encaissez & pilotez",        desc: "Check-in, paiements mobile money et rapports : tout tourne dès le premier jour." },
];

function Steps() {
  return (
    <section className="py-24 max-[560px]:py-16">
      <Wrap>
        <motion.div className="max-w-[680px] mx-auto mb-14 text-center" {...reveal(0)}>
          <div className="text-[12.5px] font-semibold tracking-[0.1em] uppercase text-primary mb-3.5">Démarrage immédiat</div>
          <h2 className="text-[clamp(30px,4vw,46px)] leading-[1.06] font-semibold tracking-[-0.03em] m-0">
            Opérationnel en trois étapes.
          </h2>
        </motion.div>
        <div className="grid grid-cols-3 gap-6 max-[880px]:grid-cols-1">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="border border-border rounded-[22px] p-[30px] px-[26px] bg-white transition-all duration-[180ms]"
              {...stagger(i)}
              whileHover={{ borderColor: "#C8C8E0", y: -3 }}
            >
              <div className="font-mono text-[13px] font-semibold text-primary w-[34px] h-[34px] rounded-[9px] bg-primary-50 grid place-items-center mb-[18px]">
                {s.n}
              </div>
              <h3 className="text-[18px] font-semibold tracking-[-0.02em] m-0 mb-2">{s.title}</h3>
              <p className="text-sm text-ink-2 leading-[1.55] m-0">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ──────────── PRICING ──────────── */
const PLANS = [
  {
    name: "Découverte", desc: "Pour tester et gérer une petite structure.",
    price: "0",         sub: "jusqu'à 5 chambres",
    items: ["Réservations & planning", "Check-in & fiches clients", "1 utilisateur", "Commission 8% par réservation"],
    cta: "Commencer", href: "/inscription", pop: false,
  },
  {
    name: "Partenaire",  desc: "Pour les établissements d'envergure avec besoins spécifiques.",
    price: "Sur devis",  sub: "tarif personnalisé",
    items: ["Tout Découverte, sans limite", "Mobile money & finances", "Rapports & exports", "Utilisateurs illimités", "Accompagnement dédié"],
    cta: "Nous contacter", href: "#", pop: false, external: true,
  },
] as const;

function Pricing() {
  return (
    <section className="py-24 bg-white border-y border-border-soft max-[560px]:py-16" id="tarifs">
      <Wrap>
        <motion.div className="max-w-[680px] mx-auto mb-14 text-center" {...reveal(0)}>
          <div className="text-[12.5px] font-semibold tracking-[0.1em] uppercase text-primary mb-3.5">Tarifs simples</div>
          <h2 className="text-[clamp(30px,4vw,46px)] leading-[1.06] font-semibold tracking-[-0.03em] m-0">
            Un prix par chambre. Sans surprise.
          </h2>
          <p className="text-[17px] leading-[1.55] text-ink-2 mt-[18px] max-w-[560px] mx-auto m-0">
            Commencez gratuitement, passez à la vitesse supérieure quand vous êtes prêt.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-6 items-stretch max-[880px]:grid-cols-1 max-[560px]:grid-cols-1 max-w-[900px] mx-auto">
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              className="flex flex-col bg-white border border-border rounded-[28px] p-[32px] px-[28px] transition-all duration-[180ms] hover:border-border-strong hover:y-[-4px]"
              {...stagger(i)}
            >
              <div className="text-[15px] font-semibold">{p.name}</div>
              <div className="text-[13px] text-ink-3 mt-[5px] min-h-[38px]">{p.desc}</div>
              <div className="text-[38px] font-semibold tracking-[-0.04em] my-4 mb-0.5 leading-none">
                {p.price}<small className="text-sm text-ink-3 font-medium tracking-normal"> {p.price !== "Sur devis" ? "FCFA" : ""}</small>
              </div>
              <div className="text-[12.5px] text-ink-3">{p.sub}</div>
              <ul className="list-none p-0 my-[22px] mb-[26px] flex flex-col gap-[11px] flex-1 m-0">
                {p.items.map(item => (
                  <li key={item} className="flex gap-2.5 items-start text-sm text-ink-2">
                    <svg
                      width="17" height="17"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round"
                      className="text-primary shrink-0 mt-px"
                      aria-hidden="true"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              {p.external ? (
                <a
                  href="mailto:contact@immoplus.io?subject=Demande%20d%27information%20Pack%20Partenaire"
                  className={cn(
                    btn({ variant: "outline" }),
                    "justify-center text-center"
                  )}
                >
                  {p.cta}
                </a>
              ) : (
                <Link
                  href={p.href}
                  className={cn(
                    btn({ variant: "primary" }),
                    "justify-center text-center"
                  )}
                >
                  {p.cta}
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}

/* ──────────── CTA ──────────── */
function CTA({ onDemo }: { onDemo: () => void }) {
  return (
    <section className="py-24 pt-0 max-[560px]:py-16 max-[560px]:pt-0">
      <Wrap>
        <motion.div
          className="bg-ink text-white rounded-[28px] py-16 px-12 text-center relative overflow-hidden max-[560px]:px-6 max-[560px]:py-[46px]"
          {...reveal(0)}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(70% 120% at 50% -10%, color-mix(in srgb, #2744DE 55%, transparent), transparent 60%)" }}
          />
          <div className="relative">
            <h2 className="text-[clamp(30px,4vw,46px)] leading-[1.06] font-semibold tracking-[-0.03em] m-0 text-white">
              Prêt à tout gérer depuis un seul écran ?
            </h2>
            <p className="text-white/70 text-[17px] mt-[18px] mx-auto mb-8 max-w-[480px] leading-[1.6] m-0">
              Rejoignez les établissements qui ont arrêté de jongler. Mise en route en quelques minutes.
            </p>
            <div className="flex gap-[13px] justify-center flex-wrap">
              <motion.button className={btn({ variant: "primary", size: "lg" })} onClick={onDemo} {...hoverTapButton}>
                Démarrer gratuitement
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Wrap>
    </section>
  );
}

/* ──────────── FOOTER ──────────── */
function Footer() {
  return (
    <footer className="border-t border-border pt-[60px] pb-10">
      <Wrap>
        <motion.div
          className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 mb-12 max-[880px]:grid-cols-2 max-[880px]:gap-8 max-[560px]:grid-cols-1"
          {...staggerContainer(0.08)}
        >
          <motion.div variants={staggerItem}>
            <Link href="/" className="flex items-center gap-[11px]">
              <BrandMark />
              <BrandName />
            </Link>
            <p className="text-[13.5px] text-ink-2 leading-relaxed mt-4 max-w-[280px] m-0">
              Le logiciel de gestion tout-en-un pour les hôtels et résidences d&apos;Afrique de l&apos;Ouest.
            </p>
          </motion.div>

          {([
            { title: "Produit",    links: [["#features","Fonctionnalités"],["#showcase","Tableau de bord"],["#paiements","Paiements"],["#tarifs","Tarifs"]] },
            { title: "Ressources", links: [["/pms","Démo en ligne"],["/inscription","Créer un compte"],["#top","Centre d'aide"],["#top","Nous contacter"]] },
            { title: "Entreprise", links: [["#top","À propos"],["#top","Confidentialité"],["#top","Conditions"]] },
          ] as const).map(col => (
            <motion.div key={col.title} variants={staggerItem}>
              <h4 className="text-xs uppercase tracking-[0.08em] text-ink-3 m-0 mb-4 font-semibold">{col.title}</h4>
              {col.links.map(([href, label]) => (
                <a
                  key={label}
                  href={href}
                  className="block text-sm text-ink-2 mb-[11px] hover:text-ink hover:translate-x-[2px] transition-[color,transform] duration-[120ms]"
                >
                  {label}
                </a>
              ))}
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex items-center justify-between pt-[26px] border-t border-border-soft text-[13px] text-ink-3 flex-wrap gap-3"
          {...reveal(0.1)}
        >
          <span>© 2026 Immo Plus. Tous droits réservés.</span>
          <span>Abidjan · Dakar · Lomé</span>
        </motion.div>
      </Wrap>
    </footer>
  );
}

/* ──────────── MAIN EXPORT ──────────── */
export default function LandingPage({ user }: { user: UserDto | null }) {
  const [demoOpen,  setDemoOpen]  = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Open login modal automatically when redirected from a protected route.
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("login") === "1") {
      setLoginOpen(true);
      // Clean the query param without reloading.
      const url = new URL(window.location.href);
      url.searchParams.delete("login");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const openDemo  = () => { setLoginOpen(false); setDemoOpen(true);  };
  const openLogin = () => { setDemoOpen(false);  setLoginOpen(true); };

  return (
    <>
      <SmoothScroll />
      <Nav onDemo={openDemo} user={user} />
      <Hero onDemo={openDemo} />
      <Features />
      <DashboardShowcase />
      <Payments />
      <Stats />
      <Steps />
      <Pricing />
      <CTA onDemo={openDemo} />
      <Footer />
      {demoOpen  && <SignUpModal onClose={() => setDemoOpen(false)} />}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSwitchToSignUp={() => { setLoginOpen(false); setDemoOpen(true); }}
        />
      )}
    </>
  );
}
