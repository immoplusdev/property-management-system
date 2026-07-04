"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Cal_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { cva } from "class-variance-authority";
import {
  ArrowRight, Home2, TickCircle, TrendUp, Star, Key, Briefcase, Buildings2, SmartHome, Wallet,
  Link as LinkIcon, Calendar, Cloud, Shield, ShieldTick, Clock, ArrowDown2, Facebook, Instagram, Global, MessageQuestion,
} from "iconsax-react";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/Logo";
import SignUpModal from "../signup/SignUpModal";
import LoginModal from "../signup/LoginModal";
import SmoothScroll from "./SmoothScroll";
import type { UserDto } from "@/lib/api/generated/model";
import { SITE_CONFIG, SOCIAL_MEDIA } from "@/lib/seo/seo.config";
import {
  ease, fadeUp, reveal, stagger, float,
  staggerContainer, staggerItem, hoverTapButton,
} from "@/lib/animations/motion";

/* ──────────── Typography (landing page only) ────────────
 * Cal Sans   → display/titrage (H1, H2, H3, gros chiffres)
 * Plus Jakarta Sans → tout le reste (corps, UI, nav, boutons)
 * Cal Sans n'existe que dans un seul poids réel côté Google Fonts (400) —
 * on ne force pas de font-weight:600 dessus pour éviter un faux-gras
 * synthétisé par le navigateur ; le dessin de la police est déjà "impactant".
 */
const calSans = Cal_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

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

/* ──────────── Social icons not covered by iconsax-react ──────────── */
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.11 20.45H3.56V9h3.55v11.45Z" />
  </svg>
);

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.6 10.6 20.1 3h-1.55l-5.65 6.6L8.4 3H3l6.83 9.95L3 21h1.55l5.97-6.98L15.6 21H21l-7.4-10.4Zm-2.11 2.47-.69-.99L5.3 4.17h2.38l4.44 6.35.69.99 5.77 8.25h-2.38l-4.71-6.74Z" />
  </svg>
);

/* ──────────── ANNOUNCE BAR ──────────── */
function AnnounceBar() {
  return (
    <motion.a
      href="#"
      className="sticky top-0 z-[60] flex items-center h-11 px-6 max-[560px]:px-4"
      style={{ background: "#F72585" }}
      initial="rest"
      whileHover="hover"
      animate="rest"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
        transition={{ duration: 0.15 }}
        style={{ background: "rgba(0,0,0,0.08)" }}
      />

   

      <div className="relative flex-1 flex items-center justify-start gap-1.5 px-3 min-w-0">
        <span className="hidden min-[640px]:inline text-[13px] font-bold uppercase tracking-[0.02em] text-black whitespace-nowrap">
          Déploiement août 2026.
        </span>
        <span className="hidden min-[640px]:inline text-black/50">•</span>
        <span className="hidden min-[640px]:inline text-[13px] font-medium text-black whitespace-nowrap">
          Découvrez la Bêta Hygge
        </span>
        <span className="min-[640px]:hidden text-[12.5px] font-bold uppercase text-black truncate">
          Août 2026 • Bêta Hygge
        </span>
        <motion.span
          className="inline-flex shrink-0"
          variants={{ rest: { x: 0 }, hover: { x: 4 } }}
          transition={{ duration: 0.18, ease }}
        >
          <ArrowRight size={14} color="#000000" />
        </motion.span>
      </div>

    </motion.a>
  );
}

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
      "sticky top-11 z-50 bg-white/[0.82] backdrop-saturate-[180%] backdrop-blur-[14px]",
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
            <div className="w-[42px] h-[42px] rounded-[10px] bg-gradient-to-br from-primary-100 to-primary-50 shrink-0 grid place-items-center text-primary">
              <SmartHome size={22} variant="Outline" />
            </div>
            <div>
              <div className="font-semibold text-[14.5px]">Hotel Lagune Bleue</div>
              <div className="text-xs text-ink-3">42 chambres · Abidjan</div>
            </div>
          </div>
          <div
            className="w-[52px] h-[52px] rounded-full shrink-0 grid place-items-center"
            style={{ background: "conic-gradient(var(--color-primary) 87%, var(--color-border) 0)" }}
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
          <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-semibold text-xs shrink-0 bg-cat-2">AK</div>
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
            <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-semibold text-xs shrink-0 bg-cat-3">DK</div>
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
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-white border border-border mt-[5px]">
              <Image
                src="/wave.png"
                alt="Wave"
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
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
                  state === "half" && "[background:color-mix(in_srgb,var(--color-primary)_22%,var(--color-surface))]",
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
          <div className="w-[34px] h-[34px] rounded-full grid place-items-center text-white font-semibold text-xs shrink-0 bg-cat-4">DK</div>
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
                i === 6 ? "bg-primary" : "[background:color-mix(in_srgb,var(--color-primary)_24%,var(--color-surface))]"
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
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.i
          className="not-italic absolute -left-[10%] top-[-8%] w-[420px] h-[420px] rounded-full blur-[110px] opacity-[0.16]"
          style={{ background: "var(--color-vibrant-pink)" }}
          {...float(14, 9, 0)}
        />
        <motion.i
          className="not-italic absolute right-[2%] top-[4%] w-[380px] h-[380px] rounded-full blur-[110px] opacity-[0.14]"
          style={{ background: "var(--color-vibrant-green)" }}
          {...float(12, 8, 0.6)}
        />
        <motion.i
          className="not-italic absolute left-[32%] top-[14%] w-[460px] h-[460px] rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--color-vibrant-peach)" }}
          {...float(10, 10, 1.1)}
        />
      </div>
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
            className="text-[clamp(40px,5.2vw,56px)] leading-[1.1] tracking-[-0.02em] m-0"
            style={{ fontFamily: "var(--font-display)" }}
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
    <section className="relative overflow-hidden py-24 max-[560px]:py-16" id="features">
      <div
        className="absolute -right-[8%] -top-[12%] w-[340px] h-[340px] rounded-full blur-[110px] opacity-[0.08] pointer-events-none"
        style={{ background: "var(--color-vibrant-peach)" }}
      />
      <Wrap>
        <motion.div className="max-w-[680px] mx-auto mb-14 text-center" {...reveal(0)}>
          <div className="text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary mb-3.5">
            Une plateforme, tous vos outils
          </div>
          <h2 className="text-[clamp(32px,3.4vw,40px)] leading-[1.2] tracking-[-0.02em] m-0" style={{ fontFamily: "var(--font-display)" }}>
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
              <h3 className="text-[22px] leading-[1.3] tracking-[-0.01em] m-0 mb-[9px]" style={{ fontFamily: "var(--font-display)" }}>{f.title}</h3>
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
    <section className="relative overflow-hidden py-24 max-[560px]:py-16" id="showcase">
      <Wrap>
        <motion.div
          className="grid grid-cols-[1fr_1.15fr] rounded-[28px] overflow-hidden max-[880px]:grid-cols-1"
          {...reveal(0)}
        >
          {/* Left panel — dark, text */}
          <div className="flex flex-col justify-center p-12 pr-10 max-[880px]:p-9" style={{ background: "#1A1423" }}>
            <div
              className="text-[12.5px] font-bold tracking-[0.08em] uppercase mb-3.5"
              style={{ color: "var(--color-vibrant-pink)" }}
            >
              Le tableau de bord
            </div>
            <h2
              className="text-[clamp(28px,3vw,36px)] leading-[1.2] tracking-[-0.02em] m-0 text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Pilotez votre établissement d&apos;un coup d&apos;œil.
            </h2>
            <p className="text-[16px] leading-[1.6] text-white/65 mt-4 m-0 max-w-[420px]">
              Occupation, recettes du jour, arrivées et départs : l&apos;essentiel s&apos;affiche dès la connexion. Plus besoin de fouiller dix écrans pour savoir où vous en êtes.
            </p>
            <div className="mt-7 flex flex-col gap-4">
              {([
                ["Indicateurs en temps réel",  "Taux d'occupation, RevPAR et recettes mis à jour automatiquement."],
                ["Plan des chambres en direct", "Visualisez l'état de chaque chambre par étage et par statut."],
                ["Arrivées & départs du jour",  "Préparez l'accueil sans rien oublier, chaque matin."],
              ] as const).map(([b, p]) => (
                <div key={b} className="flex gap-[13px] items-start">
                  <span
                    className="w-6 h-6 rounded-[7px] grid place-items-center shrink-0 mt-px"
                    style={{ background: "rgba(247,37,133,0.15)", color: "var(--color-vibrant-pink)" }}
                  >
                    <CheckIcon size={13} />
                  </span>
                  <div>
                    <b className="font-semibold text-[15px] block text-white">{b}</b>
                    <p className="m-0 mt-[3px] text-[13.5px] text-white/55 leading-[1.5]">{p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — green, dashboard mockup */}
          <div className="flex items-center justify-center p-10 max-[880px]:p-7" style={{ background: "var(--color-vibrant-green)" }}>
            <div className="bg-white border border-border rounded-[22px] shadow-xl overflow-hidden w-full max-w-[480px]">
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
                            className={cn("block rounded-[5px_5px_2px_2px]", i === 6 ? "[background:color-mix(in_srgb,var(--color-primary)_22%,var(--color-surface))]" : "bg-primary")}
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
          </div>
        </motion.div>
      </Wrap>
    </section>
  );
}

/* ──────────── PAYMENTS ──────────── */
const PAYS = [
  { type: "image", image: "/wave.png", name: "Wave",            ds: "Confirmé · il y a 2 min",  amt: "+114 000" },
  { type: "image", image: "/om.png",   name: "Orange Money",    ds: "Confirmé · il y a 18 min", amt: "+38 000"  },
  { type: "image", image: "/mtn.jpeg", name: "MTN MoMo",       ds: "Confirmé · il y a 1 h",    amt: "+475 000" },
  { type: "icon",  icon: "Wallet",      name: "Carte & espèces", ds: "Caisse réconciliée",        amt: "+330 000" },
] as const;

function Payments() {
  return (
    <section className="relative overflow-hidden py-24 max-[560px]:py-16" id="paiements">
      <div
        className="absolute -right-[6%] -bottom-[16%] w-[320px] h-[320px] rounded-full blur-[110px] opacity-[0.07] pointer-events-none"
        style={{ background: "var(--color-vibrant-pink)" }}
      />
      <Wrap>
        <div className="grid grid-cols-[1.1fr_1fr] gap-14 items-center max-[880px]:grid-cols-1 max-[880px]:gap-10">

          <motion.div {...reveal(0)}>
            <div className="text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary mb-3.5">
              Pensé pour l&apos;Afrique de l&apos;Ouest
            </div>
            <h2 className="text-[clamp(32px,3.4vw,40px)] leading-[1.2] tracking-[-0.02em] m-0" style={{ fontFamily: "var(--font-display)" }}>
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
                whileHover={{ borderColor: "var(--color-border-strong)", x: 2 }}
              >
                <div className="w-[46px] h-[46px] rounded-xl grid place-items-center shrink-0 overflow-hidden bg-surface-2">
                  {p.type === "image" ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={46}
                      height={46}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Wallet size={24} className="text-ink" variant="Outline" />
                  )}
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

/* ──────────── SÉCURITÉ & FIABILITÉ ──────────── */
const SECURITY_POINTS = [
  {
    Icon: Cloud,
    title: "Hébergement cloud sécurisé",
    desc: "Vos données sont hébergées sur une infrastructure chiffrée, avec sauvegardes automatiques quotidiennes.",
  },
  {
    Icon: ShieldTick,
    title: "Confidentialité par conception",
    desc: "Fiches clients, pièces d'identité et paiements sont traités selon des règles strictes de confidentialité et de conservation.",
  },
  {
    Icon: Clock,
    title: "Disponibilité continue",
    desc: "Infrastructure surveillée en continu pour que votre PMS reste accessible — check-in du dimanche compris.",
  },
] as const;

function Security() {
  return (
    <section className="relative overflow-hidden py-24 max-[560px]:py-16">
      <Wrap>
        <motion.div
          className="grid grid-cols-2 rounded-[28px] overflow-hidden max-[880px]:grid-cols-1"
          {...reveal(0)}
        >
          {/* Left panel — cream, text */}
          <div className="flex flex-col justify-center p-12 pr-10 max-[880px]:p-9" style={{ background: "#eee0cb" }}>
            <div
              className="inline-flex items-center gap-2 w-fit text-[12.5px] font-bold tracking-[0.08em] uppercase rounded-full px-3.5 py-1.5 mb-4"
              style={{ background: "#1A1423", color: "#eee0cb" }}
            >
              <Shield size={14} variant="Bold" color="#eee0cb" />
              Sécurité & fiabilité
            </div>
            <h2
              className="text-[clamp(28px,3vw,36px)] leading-[1.2] tracking-[-0.02em] m-0"
              style={{ fontFamily: "var(--font-display)", color: "#1A1423" }}
            >
              Vos données méritent mieux qu&apos;un tableur.
            </h2>
            <p className="text-[16px] leading-[1.6] mt-4 m-0 max-w-[400px]" style={{ color: "color-mix(in srgb, #1A1423 68%, transparent)" }}>
              Un PMS gère de l&apos;argent et des informations sensibles — identités, séjours, paiements. On a construit Immo Plus en conséquence.
            </p>
          </div>

          {/* Right panel — dark, reassurance list */}
          <div className="flex flex-col justify-center gap-6 p-12 pl-10 max-[880px]:p-9" style={{ background: "#1A1423" }}>
            {SECURITY_POINTS.map((s, i) => (
              <motion.div key={s.title} className="flex gap-4 items-start" {...stagger(i)}>
                <div
                  className="w-10 h-10 rounded-[12px] grid place-items-center shrink-0"
                  style={{ background: "rgba(238,224,203,0.12)", color: "#eee0cb" }}
                >
                  <s.Icon size={19} variant="Bold" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-semibold m-0 mb-1 text-white">{s.title}</h3>
                  <p className="text-[13.5px] text-white/60 leading-[1.5] m-0">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Wrap>
    </section>
  );
}

/* ──────────── SPLIT SHOWCASE (accès partagé / planning) ──────────── */
const SPLIT_PANELS = [
  {
    tone: "dark" as const,
    icon: <LinkIcon size={19} variant="Bold" color="#1A1423" />,
    label: "Accès partagé",
    title: <>Gérez votre hôtel<br />depuis n&apos;importe quel lien.</>,
    desc: "Chaque réservation, chambre ou fiche client a sa propre adresse. Partagez-la, rafraîchissez la page, revenez en arrière — tout fonctionne comme un vrai lien web.",
    linkLabel: "Voir comment ça marche",
  },
  {
    tone: "peach" as const,
    icon: <Calendar size={19} variant="Bold" color="#F9DBBD" />,
    label: "Planning",
    title: <>Visualisez vos réservations<br />en un coup d&apos;œil.</>,
    desc: "Une grille hebdomadaire par chambre : arrivées, départs et séjours en cours, sans ouvrir dix écrans pour recomposer le planning.",
    linkLabel: "Découvrir le planning",
  },
] as const;

function ShareLinkMockup() {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-[300px] -rotate-[2deg]"
      {...float(8, 6, 0.3)}
    >
      <div className="flex items-center gap-1.5 mb-3.5">
        {[0, 1, 2].map(k => <span key={k} className="w-[7px] h-[7px] rounded-full bg-border-strong" />)}
        <span className="ml-2 font-mono text-[10.5px] text-ink-3 bg-surface-2 rounded-[6px] px-2 py-1 truncate flex-1">
          pms.immoplus.ci/hotel-auberge/…
        </span>
      </div>
      <div className="flex items-center gap-3 border border-border rounded-xl p-3">
        <div
          className="w-9 h-9 rounded-full grid place-items-center font-semibold text-[11px] shrink-0 text-white"
          style={{ background: "var(--color-vibrant-pink)" }}
        >
          DK
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[12.5px]">Réservation #0518-004</div>
          <div className="text-[10.5px] text-ink-3">Lien copié — prêt à partager</div>
        </div>
        <TickCircle size={16} className="text-success shrink-0" variant="Bold" />
      </div>
    </motion.div>
  );
}

function PlanningMockup() {
  const rows = [
    { room: "204", bars: [{ start: 0,   width: 45,  tone: "primary" }] },
    { room: "205", bars: [{ start: 15,  width: 60,  tone: "success" }] },
    { room: "206", bars: [{ start: 40,  width: 35,  tone: "warn"    }] },
    { room: "207", bars: [{ start: 5,   width: 25,  tone: "violet"  }, { start: 55, width: 30, tone: "primary" }] },
  ];
  const toneVar: Record<string, string> = {
    primary: "var(--color-primary)",
    success: "var(--color-success)",
    warn:    "var(--color-warn)",
    violet:  "var(--color-violet)",
  };
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-xl p-4 w-full max-w-[320px] rotate-[2deg]"
      {...float(9, 7, 0.6)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-[12.5px]">Semaine du 29 juin</span>
        <span className="text-[10px] text-ink-3 font-mono">7 chambres</span>
      </div>
      <div className="flex flex-col gap-2">
        {rows.map(r => (
          <div key={r.room} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-ink-3 w-6 shrink-0">{r.room}</span>
            <div className="relative flex-1 h-[16px] bg-surface-2 rounded-[5px] overflow-hidden">
              {r.bars.map((b, i) => (
                <span
                  key={i}
                  className="absolute top-0 bottom-0 rounded-[4px]"
                  style={{ left: `${b.start}%`, width: `${b.width}%`, background: toneVar[b.tone] }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function SplitShowcase() {
  return (
    <section className="py-24 max-[560px]:py-16">
      <Wrap>
        <motion.div
          className="grid grid-cols-2 rounded-[28px] overflow-hidden max-[880px]:grid-cols-1"
          {...reveal(0)}
        >
          {SPLIT_PANELS.map((p, i) => (
            <div
              key={p.label}
              className={cn(
                "flex flex-col p-10 pb-12 max-[560px]:p-7 max-[560px]:pb-9",
                p.tone === "dark" ? "text-white" : ""
              )}
              style={{ background: p.tone === "dark" ? "#1A1423" : "var(--color-vibrant-peach)" }}
            >
              <motion.div {...stagger(i)}>
                <div
                  className={cn(
                    "w-10 h-10 rounded-[12px] grid place-items-center mb-6",
                    p.tone === "dark" ? "bg-white/10" : "bg-black/[0.06]"
                  )}
                  style={{ color: "var(--color-vibrant-pink)" }}
                >
                  {p.icon}
                </div>
                <div
                  className="text-[12px] font-bold tracking-[0.08em] uppercase mb-3.5"
                  style={{ color: "var(--color-vibrant-pink)" }}
                >
                  {p.label}
                </div>
                <h3
                  className="text-[clamp(24px,2.2vw,28px)] leading-[1.3] tracking-[-0.01em] m-0"
                  style={{ color: p.tone === "dark" ? "#fff" : "#1A1423", fontFamily: "var(--font-display)" }}
                >
                  {p.title}
                </h3>
                <p
                  className={cn("text-[15px] leading-[1.55] mt-4 mb-0 max-w-[400px]", p.tone === "dark" ? "text-white/65" : "")}
                  style={{ color: p.tone === "dark" ? undefined : "color-mix(in srgb, #1A1423 68%, transparent)" }}
                >
                  {p.desc}
                </p>

                <motion.a
                  href="#"
                  className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-[0.05em] uppercase mt-7"
                  style={{ color: "var(--color-vibrant-pink)" }}
                  whileHover="hover"
                >
                  {p.linkLabel}
                  <motion.span
                    className="inline-flex"
                    variants={{ hover: { x: 4 } }}
                    transition={{ duration: 0.18, ease }}
                  >
                    <ArrowRight size={15} variant="Bold" />
                  </motion.span>
                </motion.a>
              </motion.div>

              <div className="flex-1 min-h-[40px]" />

              <div className="flex justify-center max-[560px]:mt-6">
                {p.tone === "dark" ? <ShareLinkMockup /> : <PlanningMockup />}
              </div>
            </div>
          ))}
        </motion.div>
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
              <div className="text-[clamp(38px,4.8vw,64px)] leading-[1] tracking-[-0.03em] text-primary" style={{ fontFamily: "var(--font-display)" }}>
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
    <section className="relative overflow-hidden py-24 max-[560px]:py-16">
      <Wrap>
        <motion.div
          className="grid grid-cols-2 rounded-[28px] overflow-hidden max-[880px]:grid-cols-1"
          {...reveal(0)}
        >
          {/* Left panel — lavender, text */}
          <div className="flex flex-col justify-center p-12 pr-10 max-[880px]:p-9" style={{ background: "#d4c2fc" }}>
            <div
              className="inline-flex items-center w-fit text-[12.5px] font-bold tracking-[0.08em] uppercase rounded-full px-3.5 py-1.5 mb-4"
              style={{ background: "#1A1423", color: "#d4c2fc" }}
            >
              Démarrage immédiat
            </div>
            <h2
              className="text-[clamp(28px,3vw,36px)] leading-[1.2] tracking-[-0.02em] m-0"
              style={{ fontFamily: "var(--font-display)", color: "#1A1423" }}
            >
              Opérationnel en trois étapes.
            </h2>
            <p className="text-[16px] leading-[1.6] mt-4 m-0 max-w-[380px]" style={{ color: "color-mix(in srgb, #1A1423 68%, transparent)" }}>
              De la création de votre établissement au premier encaissement : tout est prêt en quelques minutes, sans accompagnement technique.
            </p>
          </div>

          {/* Right panel — dark, steps list */}
          <div className="flex flex-col justify-center gap-5 p-12 pl-10 max-[880px]:p-9" style={{ background: "#1A1423" }}>
            {STEPS.map((s, i) => (
              <motion.div key={s.n} className="flex gap-4 items-start" {...stagger(i)}>
                <div
                  className="font-mono text-[14px] font-semibold w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                  style={{ background: "#d4c2fc", color: "#1A1423" }}
                >
                  {s.n}
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold m-0 mb-1 text-white">{s.title}</h3>
                  <p className="text-[13.5px] text-white/60 leading-[1.5] m-0">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
    <section className="relative overflow-hidden py-24 bg-white border-y border-border-soft max-[560px]:py-16" id="tarifs">
      <div
        className="absolute -right-[7%] -bottom-[20%] w-[320px] h-[320px] rounded-full blur-[110px] opacity-[0.07] pointer-events-none"
        style={{ background: "var(--color-vibrant-pink)" }}
      />
      <div
        className="absolute -left-[8%] top-[6%] w-[260px] h-[260px] rounded-full blur-[100px] opacity-[0.06] pointer-events-none"
        style={{ background: "var(--color-vibrant-peach)" }}
      />
      <Wrap>
        <motion.div className="max-w-[680px] mx-auto mb-14 text-center" {...reveal(0)}>
          <div className="text-[12.5px] font-bold tracking-[0.08em] uppercase text-primary mb-3.5">Tarifs simples</div>
          <h2 className="text-[clamp(32px,3.4vw,40px)] leading-[1.2] tracking-[-0.02em] m-0" style={{ fontFamily: "var(--font-display)" }}>
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
              <div className="text-[38px] leading-[1] tracking-[-0.03em] my-4 mb-0.5" style={{ fontFamily: "var(--font-display)" }}>
                {p.price}<small className="text-sm text-ink-3 font-medium tracking-normal" style={{ fontFamily: "var(--font-jakarta)" }}> {p.price !== "Sur devis" ? "FCFA" : ""}</small>
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

/* ──────────── FAQ ──────────── */
const FAQS = [
  {
    q: "Dois-je m'engager sur une durée minimale ?",
    a: "Non, aucun engagement. Vous pouvez arrêter à tout moment — vos données restent les vôtres et sont exportables.",
  },
  {
    q: "Puis-je reprendre mes réservations existantes ?",
    a: "Oui. Que vous partiez d'un cahier papier ou d'un fichier Excel, notre équipe vous aide à importer vos données sans rien perdre.",
  },
  {
    q: "Combien de temps avant d'être opérationnel ?",
    a: "La plupart des établissements sont opérationnels en moins d'une journée, assistant de configuration compris.",
  },
  {
    q: "Le mobile money est-il vraiment intégré, ou juste « compatible » ?",
    a: "Wave, Orange Money et MTN Money sont connectés nativement : chaque paiement est rattaché à la bonne facture automatiquement, sans ressaisie.",
  },
  {
    q: "Que se passe-t-il si je change d'avis ?",
    a: "Vous exportez vos données et fermez votre compte quand vous le souhaitez, sans frais caché ni période de préavis.",
  },
] as const;

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div className="border-b border-white/10 last:border-b-0 py-5" {...stagger(index, 0.05)}>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold text-white">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease }}
          className="shrink-0 w-7 h-7 rounded-full grid place-items-center"
          style={{ background: "rgba(250,159,66,0.15)", color: "#fa9f42" }}
        >
          <ArrowDown2 size={14} variant="Bold" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            className="overflow-hidden"
          >
            <p className="text-[13.5px] text-white/60 leading-[1.6] m-0 pt-3 pr-10">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FAQ() {
  return (
    <section className="relative overflow-hidden py-24 max-[560px]:py-16">
      <Wrap>
        <motion.div
          className="grid grid-cols-2 rounded-[28px] overflow-hidden max-[880px]:grid-cols-1"
          {...reveal(0)}
        >
          {/* Left panel — orange, text */}
          <div className="flex flex-col justify-center p-12 pr-10 max-[880px]:p-9" style={{ background: "#fa9f42" }}>
            <div
              className="inline-flex items-center gap-2 w-fit text-[12.5px] font-bold tracking-[0.08em] uppercase rounded-full px-3.5 py-1.5 mb-4"
              style={{ background: "#1A1423", color: "#fa9f42" }}
            >
              <MessageQuestion size={14} variant="Bold" color="#fa9f42" />
              Questions fréquentes
            </div>
            <h2
              className="text-[clamp(28px,3vw,36px)] leading-[1.2] tracking-[-0.02em] m-0"
              style={{ fontFamily: "var(--font-display)", color: "#1A1423" }}
            >
              On a sans doute déjà répondu à votre question.
            </h2>
            <p className="text-[16px] leading-[1.6] mt-4 m-0 max-w-[380px]" style={{ color: "color-mix(in srgb, #1A1423 70%, transparent)" }}>
              Engagement, migration de données, mobile money… voici ce que les gérants nous demandent le plus avant de se lancer.
            </p>
          </div>

          {/* Right panel — dark, accordion */}
          <div className="flex flex-col justify-center p-12 pl-10 max-[880px]:p-9" style={{ background: "#1A1423" }}>
            {FAQS.map((f, i) => (
              <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </motion.div>
      </Wrap>
    </section>
  );
}

/* ──────────── FOOTER (bandeau d'impact + footer fusionnés) ──────────── */
const SOCIALS = [
  { label: "Facebook",  Icon: Facebook,     href: `https://facebook.com/${SOCIAL_MEDIA.facebook}` },
  { label: "Instagram", Icon: Instagram,    href: `https://instagram.com/${SOCIAL_MEDIA.instagram}` },
  { label: "LinkedIn",  Icon: LinkedinIcon, href: `https://linkedin.com/company/${SOCIAL_MEDIA.linkedin}` },
  { label: "X",         Icon: XIcon,        href: `https://twitter.com/${SOCIAL_MEDIA.twitter}` },
] as const;

const FOOTER_COLUMNS = [
  { title: "Produit",    links: [["#features","Fonctionnalités"],["#showcase","Tableau de bord"],["#paiements","Paiements"],["#tarifs","Tarifs"]] },
  { title: "Ressources", links: [["/pms","Démo en ligne"],["/inscription","Créer un compte"],["/login","Se connecter"]] },
  { title: "Entreprise", links: [["#top","À propos"],["#top","Confidentialité"],["#top","Conditions"]] },
  { title: "Contact",    links: [[`mailto:${SITE_CONFIG.email}`, SITE_CONFIG.email], [`tel:${SITE_CONFIG.phone.replace(/[^0-9+]/g, "")}`, SITE_CONFIG.phone], ["#top", "Abidjan, Côte d'Ivoire"]] },
] as const;

function Footer({ onDemo }: { onDemo: () => void }) {
  return (
    <footer className="relative" style={{ background: "#1A1423" }}>
      {/* ── Bandeau d'impact ── */}
      <div className="pt-[110px] pb-[70px] text-center max-[880px]:pt-[70px] max-[880px]:pb-[50px] max-[560px]:pt-[56px] max-[560px]:pb-10">
        <Wrap>
          <motion.h2
            className="text-[clamp(26px,8.5vw,100px)] leading-[0.95] tracking-[-0.02em] uppercase text-white m-0 whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)" }}
            {...reveal(0)}
          >
            Prêt pour l&apos;impact ?
          </motion.h2>

          <motion.div className="mt-[55px]" {...reveal(0.15)}>
            <motion.button
              className="inline-flex items-center justify-center rounded-full font-bold uppercase tracking-[0.03em] text-white text-[14.5px] h-[60px] px-9"
              style={{ background: "#2744DE" }}
              onClick={onDemo}
              {...hoverTapButton}
            >
              Prendre rendez-vous
            </motion.button>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-x-7 gap-y-2 flex-wrap mt-9 text-[13.5px] text-white/55"
            {...reveal(0.2)}
          >
            <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white transition-colors">{SITE_CONFIG.email}</a>
            <span className="text-white/20">·</span>
            <a href={`tel:${SITE_CONFIG.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white transition-colors">{SITE_CONFIG.phone}</a>
            <span className="text-white/20">·</span>
            <span>Abidjan, Côte d&apos;Ivoire</span>
          </motion.div>
        </Wrap>
      </div>

      {/* ── Footer principal ── */}
      <div className="border-t border-white/10 py-[90px] max-[880px]:py-[60px] max-[560px]:py-[46px]">
        <Wrap>
          <motion.div
            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 mb-16 max-[880px]:grid-cols-2 max-[880px]:gap-8 max-[880px]:mb-12 max-[560px]:grid-cols-1"
            {...staggerContainer(0.08)}
          >
            <motion.div variants={staggerItem}>
              <Link href="/" className="flex items-center gap-[11px]">
                <BrandMark />
                <span className="font-semibold text-[17px] tracking-[-0.02em] flex items-center gap-2 text-white">
                  Immo Plus{" "}
                  <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-white/70 border border-white/25 px-1.5 py-px rounded-[5px]">
                    PMS
                  </span>
                </span>
              </Link>
              <p className="text-[13.5px] text-white/50 leading-relaxed mt-4 max-w-[250px] m-0">
                Le logiciel de gestion tout-en-un pour les hôtels et résidences d&apos;Afrique de l&apos;Ouest.
              </p>
              <div className="flex items-center gap-2.5 mt-6">
                {SOCIALS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-white/15 grid place-items-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
                  >
                    <s.Icon size={15} />
                  </a>
                ))}
              </div>
              <div className="inline-flex items-center gap-1.5 mt-7 text-[12.5px] text-white/45">
                <Global size={14} /> FR
              </div>
            </motion.div>

            {FOOTER_COLUMNS.map(col => (
              <motion.div key={col.title} variants={staggerItem}>
                <h4 className="text-[11px] uppercase tracking-[0.1em] text-white/40 m-0 mb-5 font-bold">{col.title}</h4>
                {col.links.map(([href, label]) => (
                  <motion.a
                    key={label}
                    href={href}
                    className="block text-[14.5px] text-white/85 mb-[13px]"
                    whileHover={{ color: "#2744DE", x: 2 }}
                    transition={{ duration: 0.15, ease }}
                  >
                    {label}
                  </motion.a>
                ))}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex items-center justify-between pt-[26px] border-t border-white/10 text-[13px] text-white/40 flex-wrap gap-3"
            {...reveal(0.1)}
          >
            <span>© 2026 Immo Plus. Tous droits réservés.</span>
            <div className="flex gap-5">
              <a href="#top" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#top" className="hover:text-white transition-colors">Conditions</a>
            </div>
          </motion.div>
        </Wrap>
      </div>
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
    <div className={cn(calSans.variable, jakarta.variable)} style={{ fontFamily: "var(--font-jakarta)" }}>
      <SmoothScroll />
      <AnnounceBar />
      <Nav onDemo={openDemo} user={user} />
      <Hero onDemo={openDemo} />
      <DashboardShowcase />
      <Features />
      <SplitShowcase />
      <Payments />
      <Security />
      <Stats />
      <Steps />
      <Pricing />
      <FAQ />
      <Footer onDemo={openDemo} />
      {demoOpen  && <SignUpModal onClose={() => setDemoOpen(false)} />}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSwitchToSignUp={() => { setLoginOpen(false); setDemoOpen(true); }}
        />
      )}
    </div>
  );
}
