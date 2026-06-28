"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import "../../styles/landing.css";
import SignUpModal from "../signup/SignUpModal";

/* ──────────── Variants ──────────── */
const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial:  { opacity: 0, y: 22 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease, delay },
});

const reveal = (delay = 0) => ({
  initial:   { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport:  { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease, delay },
});

const stagger = (i: number) => reveal(i * 0.08);

const float = (amplitude = 10, duration = 6, delay = 0) => ({
  animate: { y: [0, -amplitude, 0] as number[] },
  transition: { duration, delay, repeat: Infinity, ease: "easeInOut" as const },
});

/* ──────────── Animated Counter ──────────── */
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
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/* ──────────── NAV ──────────── */
function Nav({ onDemo }: { onDemo: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={"lp-nav" + (scrolled ? " scrolled" : "")}>
      <div className="lp-wrap lp-nav-in">
        <Link href="/" className="lp-brand">
          <span className="brand-mark">IP</span>
          <span className="lp-brand-name">
            Immo Plus <span className="lp-brand-tag">PMS</span>
          </span>
        </Link>
        <nav className="lp-nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#showcase">Le produit</a>
          <a href="#paiements">Paiements</a>
          <a href="#tarifs">Tarifs</a>
        </nav>
        <div className="lp-nav-cta">
          <Link href="/pms" className="btn btn-out lp-login" style={{ fontSize: 13.5, padding: "9px 18px" }}>
            Connexion
          </Link>
          <button className="btn btn-dk" style={{ fontSize: 13.5, padding: "9px 18px" }} onClick={onDemo}>
            Réserver une démo
          </button>
        </div>
      </div>
    </header>
  );
}

/* ──────────── HERO CARDS (flex row) ──────────── */
function HeroCards() {
  return (
    <div className="lp-hero-cards">

      {/* Occupation card */}
      <motion.div className="fc hc-occ" {...float(8, 6.5, 0)}>
        <div className="between" style={{ marginBottom: 12 }}>
          <div className="row">
            <div className="fc-thumb">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5" />
              </svg>
            </div>
            <div>
              <div className="fc-addr">Résidence Lagune Bleue</div>
              <div className="fc-units">42 chambres · Abidjan</div>
            </div>
          </div>
          <div className="fc-ring-lg"><i>87%</i></div>
        </div>
        <div className="fc-k" style={{ marginBottom: 6 }}>Taux d&apos;occupation</div>
        <div className="fc-bar-lg"><i style={{ width: "87%" }} /></div>
        <div className="between" style={{ marginTop: 11, fontSize: 12, color: "var(--ink-3)" }}>
          <span>36 occupées</span><span>6 libres</span>
        </div>
        <motion.div className="fpill hc-pill-a" {...float(7, 7, 0.8)}>
          <div className="av av-2" style={{ width: 34, height: 34, fontSize: 12 }}>AK</div>
          <div>
            <div className="fpill-nm">Aïcha Koné</div>
            <div className="fpill-rl">Réceptionniste</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Invoice card */}
      <motion.div className="fc hc-invoice" {...float(10, 7, 0.5)}>
        <div className="between" style={{ marginBottom: 14 }}>
          <div className="row">
            <div className="av av-3" style={{ width: 34, height: 34, fontSize: 12 }}>DK</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Facture séjour</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontFamily: "var(--mono)" }}>RES-2026-0518-004</div>
            </div>
          </div>
          <span className="stamp">Payé</span>
        </div>
        <div className="between" style={{ marginBottom: 14 }}>
          <div>
            <div className="fc-k">Montant</div>
            <div style={{ fontWeight: 600, fontSize: 17, marginTop: 3 }}>
              380 000 <span style={{ fontSize: 11, color: "var(--ink-3)", fontWeight: 500 }}>FCFA</span>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="fc-k">Méthode</div>
            <span className="chip chip-wave" style={{ display: "inline-flex", marginTop: 5 }}>Wave</span>
          </div>
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
          <div className="fc-k" style={{ marginBottom: 9 }}>Statut réservation</div>
          <div className="lease-row">
            <span className="lease-step">
              <span className="dotc dotc-on">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ width: 9, height: 9 }}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              Confirmée
            </span>
            <span className="lease-step">
              <span className="dotc dotc-half" />
              Check-in
            </span>
            <span className="lease-step" style={{ color: "var(--ink-3)" }}>
              <span className="dotc dotc-off" />
              Facturée
            </span>
          </div>
        </div>
        <motion.div className="fpill hc-pill-b" {...float(8, 5.5, 1.4)}>
          <div className="av av-4" style={{ width: 34, height: 34, fontSize: 12 }}>DK</div>
          <div>
            <div className="fpill-nm">Daniel Kouassi</div>
            <div className="fpill-rl">Suite Junior</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Revenue card */}
      <motion.div className="fc hc-rev" {...float(9, 6, 1)}>
        <div className="between" style={{ marginBottom: 9 }}>
          <span className="fc-k">Revenu net · mai</span>
          <span className="chip chip-pay">À jour</span>
        </div>
        <div className="rev-amt">
          4 250 000<span className="rev-cfa">FCFA</span>
        </div>
        <div className="trend">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
          +18% vs avril
        </div>
        <div className="minichart">
          {[42, 58, 50, 72, 64, 88, 78].map((h, i) => (
            <b key={i} className={i === 6 ? "mc-last" : ""} style={{ height: `${h}%` }} />
          ))}
        </div>
      </motion.div>

    </div>
  );
}

/* ──────────── HERO ──────────── */
function Hero({ onDemo }: { onDemo: () => void }) {
  return (
    <section className="lp-hero" id="top">
      <div className="lp-hero-bg" />
      <div className="lp-hero-stage">
        <div className="lp-hero-center">
          <motion.div {...fadeUp(0)}>
            <div className="lp-eyebrow">
              <span className="tag">Nouveau</span>
              <span className="txt">Encaissez par Wave &amp; Orange Money
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </motion.div>

          <motion.h1 {...fadeUp(0.06)}>
            Tout votre hôtel,<br />dans un seul <span className="accent">logiciel.</span>
          </motion.h1>

          <motion.p className="lp-hero-sub" {...fadeUp(0.12)}>
            Réservations, planning, check-in, encaissements mobile money et finances — réunis dans Immo Plus. Le PMS tout-en-un pensé pour les hôtels et résidences d&apos;Afrique de l&apos;Ouest.
          </motion.p>

          <motion.div className="lp-hero-actions" {...fadeUp(0.18)}>
            <button className="btn btn-p btn-lg" onClick={onDemo}>Démarrer gratuitement</button>
            <button className="btn btn-out btn-lg" onClick={onDemo}>Réserver une démo →</button>
          </motion.div>

          <motion.div className="lp-hero-note" {...fadeUp(0.24)}>
            {["Sans carte bancaire", "Installation en 10 min", "Support en français"].map(t => (
              <span key={t}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
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

/* ──────────── STRIP ──────────── */
function Strip() {
  const logos = [
    { name: "Lagune Bleue",     svg: <circle cx="12" cy="12" r="10" /> },
    { name: "Akwaba Suites",    svg: <rect x="3" y="3" width="18" height="18" rx="5" /> },
    { name: "Hôtel Téranga",    svg: <path d="M12 2 22 20H2z" /> },
    { name: "Résidence Cocody", svg: <circle cx="12" cy="12" r="10" /> },
  ];
  return (
    <div className="lp-strip">
      <div className="lp-strip-in">
        <span className="lp-strip-lbl">La confiance des hôtels, résidences et maisons d&apos;hôtes</span>
        {logos.map(l => (
          <span key={l.name} className="logo-ghost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">{l.svg}</svg>
            {l.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ──────────── FEATURES ──────────── */
const FEATS = [
  { icon: "calendar", color: "i-blue",   title: "Réservations",        desc: "Encaissez les réservations directes et synchronisez vos canaux. Vue claire des arrivées et départs du jour." },
  { icon: "grid",     color: "i-teal",   title: "Planning chambres",   desc: "Un planning visuel par étage : libre, occupée, ménage, départ. Glissez-déposez pour réattribuer en un geste." },
  { icon: "key",      color: "i-violet", title: "Check-in express",    desc: "Enregistrez vos clients en moins d'une minute. Pièce d'identité, signature et fiche de police générées automatiquement." },
  { icon: "card",     color: "i-coral",  title: "Encaissements",       desc: "Wave, Orange Money, MTN, espèces ou carte. Chaque paiement est rattaché à la bonne facture, sans saisie double." },
  { icon: "chart",    color: "i-amber",  title: "Finances & rapports", desc: "Chiffre d'affaires, RevPAR, taux d'occupation et dépenses en temps réel. Exportez vos rapports en un clic." },
  { icon: "users",    color: "i-green",  title: "Clients & fidélité",  desc: "Historique des séjours, préférences et statut VIP. Reconnaissez vos habitués et personnalisez l'accueil." },
] as const;

const FeatIcon = ({ name }: { name: string }) => {
  const icons: Record<string, React.ReactElement> = {
    calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    grid:     <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M8 14h3M8 17h6" /></>,
    key:      <><path d="M15 7a4 4 0 1 0-4 4M11 11l-7 7v3h3l1-1h2v-2h2l2-2" /></>,
    card:     <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M6 15h4" /></>,
    chart:    <><path d="M3 3v18h18M7 14l3-4 3 3 5-6" /></>,
    users:    <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

function Features() {
  return (
    <section className="lp-sec" id="features">
      <div className="lp-wrap">
        <motion.div className="sec-head" {...reveal(0)}>
          <div className="kicker">Une plateforme, tous vos outils</div>
          <h2>Arrêtez de jongler entre dix outils.</h2>
          <p>Cahier de réservations, registre, caisse, Excel, WhatsApp… Immo Plus réunit tout ce qui fait tourner votre établissement au même endroit.</p>
        </motion.div>
        <div className="feat-grid">
          {FEATS.map((f, i) => (
            <motion.div key={f.title} className="feat-card" {...stagger(i)} whileHover={{ y: -4 }} transition={{ duration: 0.18, ease }}>
              <div className={`feat-ico ${f.color}`}><FeatIcon name={f.icon} /></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────── DASHBOARD SHOWCASE ──────────── */
function DashboardShowcase() {
  return (
    <section className="lp-sec lp-showcase" id="showcase">
      <div className="lp-wrap">
        <div className="show-grid">
          <motion.div className="show-text" {...reveal(0)}>
            <div className="kicker">Le tableau de bord</div>
            <h2>Pilotez votre établissement d&apos;un coup d&apos;œil.</h2>
            <p className="lede">Occupation, recettes du jour, arrivées et départs : l&apos;essentiel s&apos;affiche dès la connexion. Plus besoin de fouiller dix écrans pour savoir où vous en êtes.</p>
            <div className="feat-list">
              {[
                ["Indicateurs en temps réel", "Taux d'occupation, RevPAR et recettes mis à jour automatiquement."],
                ["Plan des chambres en direct", "Visualisez l'état de chaque chambre par étage et par statut."],
                ["Arrivées & départs du jour", "Préparez l'accueil sans rien oublier, chaque matin."],
              ].map(([b, p]) => (
                <div className="li" key={b}>
                  <span className="ck"><Check /></span>
                  <div><b>{b}</b><p>{p}</p></div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal(0.1)}>
            <div className="mock">
              <div className="mock-bar">
                <div className="mock-dot" /><div className="mock-dot" /><div className="mock-dot" />
                <span className="mock-url">app.immoplus.io/tableau-de-bord</span>
              </div>
              <div className="mock-body">
                <div className="mock-kpis">
                  {[["Occupation","87%",""],["Recettes / j","1,2","M FCFA"],["Arrivées","8",""],["Départs","5",""]].map(([k,v,s]) => (
                    <div className="mock-kpi" key={k}>
                      <div className="k">{k}</div>
                      <div className="v">{v}<small>{s}</small></div>
                    </div>
                  ))}
                </div>
                <div className="mock-grid">
                  <div className="mock-panel">
                    <div className="mock-ph">Recettes · 7 derniers jours <span style={{ color: "var(--success)", fontSize: 10.5, fontFamily: "var(--mono)" }}>+18%</span></div>
                    <div className="mock-chart">
                      {[48,62,54,78,70,92,64].map((h, i) => (
                        <div className="mock-col" key={i}>
                          <b className={i === 6 ? "soft" : ""} style={{ height: `${h}%` }} />
                          <span>{"LMMJVSD"[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mock-panel">
                    <div className="mock-ph">Chambres · étage 2</div>
                    <div className="mock-rooms">
                      {[["201","r-occ"],["202","r-occ"],["203","r-free"],["204","r-occ"],["205","r-occ"],["206","r-cln"],["207","r-occ"],["208","r-free"],["209","r-out"],["210","r-occ"]].map(([n,c]) => (
                        <span className={`rcell ${c}`} key={n}>{n}</span>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 13, fontSize: 11, color: "var(--ink-3)", flexWrap: "wrap" }}>
                      <span><i style={{ width: 9, height: 9, borderRadius: 3, display: "inline-block", marginRight: 5, verticalAlign: "middle", background: "var(--p)" }} />Occupée</span>
                      <span><i style={{ width: 9, height: 9, borderRadius: 3, display: "inline-block", marginRight: 5, verticalAlign: "middle", background: "var(--bg-2)", border: "1px solid var(--border)" }} />Libre</span>
                      <span><i style={{ width: 9, height: 9, borderRadius: 3, display: "inline-block", marginRight: 5, verticalAlign: "middle", background: "var(--amber)" }} />Ménage</span>
                      <span><i style={{ width: 9, height: 9, borderRadius: 3, display: "inline-block", marginRight: 5, verticalAlign: "middle", background: "var(--coral)" }} />HS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ──────────── PAYMENTS ──────────── */
const PAYS = [
  { logo: "Wave", bg: "#1A6DFF", name: "Wave",            ds: "Confirmé · il y a 2 min",  amt: "+114 000" },
  { logo: "OM",   bg: "#FF7900", name: "Orange Money",    ds: "Confirmé · il y a 18 min", amt: "+38 000"  },
  { logo: "MTN",  bg: "#FFCC00", textColor: "#1a1a1a", name: "MTN MoMo", ds: "Confirmé · il y a 1 h", amt: "+475 000" },
  { logo: "CB",   bg: "#0D0D17", name: "Carte & espèces", ds: "Caisse réconciliée",        amt: "+330 000" },
];

function Payments() {
  return (
    <section className="lp-sec" id="paiements">
      <div className="lp-wrap">
        <div className="pay-grid">
          <motion.div {...reveal(0)}>
            <div className="kicker">Pensé pour l&apos;Afrique de l&apos;Ouest</div>
            <h2 style={{ fontSize: "clamp(28px, 3.4vw, 40px)" }}>Le mobile money, nativement.</h2>
            <p className="lede" style={{ marginTop: 16 }}>Vos clients paient déjà par Wave et Orange Money. Immo Plus encaisse ces paiements directement et les réconcilie avec la bonne facture — sans tableur, sans erreur de caisse.</p>
            <div style={{ marginTop: 26 }}>
              <Link href="/inscription" className="btn btn-p">Configurer mes paiements</Link>
            </div>
          </motion.div>

          <div className="pay-cards">
            {PAYS.map((p, i) => (
              <motion.div key={p.name} className="pay-card" {...stagger(i)} whileHover={{ borderColor: "var(--border-2)", x: 2 }}>
                <div className="pay-logo" style={{ background: p.bg, color: p.textColor ?? "#fff" }}>{p.logo}</div>
                <div><div className="pay-name">{p.name}</div><div className="pay-ds">{p.ds}</div></div>
                <span className="pay-amt">{p.amt}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
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
    <section className="lp-sec-sm lp-stats-band">
      <div className="lp-wrap">
        <motion.div className="stats-grid" {...reveal(0)}>
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...stagger(i)} style={{ textAlign: "center" }}>
              <div className="stat-n"><Counter to={s.to} suffix={s.suffix} /></div>
              <div className="stat-l">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
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
    <section className="lp-sec">
      <div className="lp-wrap">
        <motion.div className="sec-head" {...reveal(0)}>
          <div className="kicker">Démarrage immédiat</div>
          <h2>Opérationnel en trois étapes.</h2>
        </motion.div>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <motion.div key={s.n} className="step-card" {...stagger(i)} whileHover={{ borderColor: "var(--border-2)", y: -3 }}>
              <div className="step-no">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────── PRICING ──────────── */
const PLANS = [
  {
    name: "Découverte", desc: "Pour tester et gérer une petite structure.",
    price: "0", sub: "jusqu'à 5 chambres",
    items: ["Réservations & planning", "Check-in & fiches clients", "1 utilisateur"],
    cta: "Commencer", href: "/inscription", pop: false,
  },
  {
    name: "Pro", desc: "Pour les hôtels et résidences en activité.",
    price: "1 500", sub: "FCFA / chambre / mois",
    items: ["Tout Découverte, sans limite", "Mobile money & finances", "Rapports & exports", "Utilisateurs illimités"],
    cta: "Démarrer l'essai", href: "/inscription", pop: true,
  },
  {
    name: "Groupe", desc: "Pour plusieurs établissements.",
    price: "Sur devis", sub: "multi-sites & centralisé",
    items: ["Tout Pro", "Vue groupe consolidée", "Accompagnement dédié"],
    cta: "Nous contacter", href: "/inscription", pop: false,
  },
];

function Pricing() {
  return (
    <section className="lp-sec lp-showcase" id="tarifs">
      <div className="lp-wrap">
        <motion.div className="sec-head" {...reveal(0)}>
          <div className="kicker">Tarifs simples</div>
          <h2>Un prix par chambre. Sans surprise.</h2>
          <p>Commencez gratuitement, passez à la vitesse supérieure quand vous êtes prêt.</p>
        </motion.div>
        <div className="price-grid">
          {PLANS.map((p, i) => (
            <motion.div key={p.name} className={"plan-card" + (p.pop ? " pop" : "")} {...stagger(i)} whileHover={!p.pop ? { y: -4, borderColor: "var(--border-2)" } : { y: -4 }}>
              {p.pop && <div className="plan-pop-badge">Le plus choisi</div>}
              <div className="plan-name">{p.name}</div>
              <div className="plan-desc">{p.desc}</div>
              <div className="plan-price">{p.price}<small> {p.price !== "Sur devis" ? "FCFA" : ""}</small></div>
              <div className="plan-sub muted">{p.sub}</div>
              <ul className="plan-ul">
                {p.items.map(item => (
                  <li key={item}><Check />{item}</li>
                ))}
              </ul>
              <Link href={p.href} className={"btn " + (p.pop ? "btn-p" : "btn-out")} style={{ textAlign: "center", justifyContent: "center" }}>
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────── CTA ──────────── */
function CTA({ onDemo }: { onDemo: () => void }) {
  return (
    <section className="lp-sec" style={{ paddingTop: 0 }}>
      <div className="lp-wrap">
        <motion.div className="cta-band" {...reveal(0)}>
          <h2>Prêt à tout gérer depuis un seul écran ?</h2>
          <p>Rejoignez les établissements qui ont arrêté de jongler. Mise en route en quelques minutes.</p>
          <div className="cta-actions">
            <button className="btn btn-p btn-lg" onClick={onDemo}>Démarrer gratuitement</button>
            <button className="btn btn-out-light btn-lg" onClick={onDemo}>Réserver une démo →</button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ──────────── FOOTER ──────────── */
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link href="/" className="lp-brand">
              <span className="brand-mark">IP</span>
              <span className="lp-brand-name">Immo Plus <span className="lp-brand-tag">PMS</span></span>
            </Link>
            <p>Le logiciel de gestion tout-en-un pour les hôtels et résidences d&apos;Afrique de l&apos;Ouest.</p>
          </div>
          <div className="foot-col">
            <h4>Produit</h4>
            <a href="#features">Fonctionnalités</a>
            <a href="#showcase">Tableau de bord</a>
            <a href="#paiements">Paiements</a>
            <a href="#tarifs">Tarifs</a>
          </div>
          <div className="foot-col">
            <h4>Ressources</h4>
            <Link href="/pms">Démo en ligne</Link>
            <Link href="/inscription">Créer un compte</Link>
            <a href="#top">Centre d&apos;aide</a>
            <a href="#top">Nous contacter</a>
          </div>
          <div className="foot-col">
            <h4>Entreprise</h4>
            <a href="#top">À propos</a>
            <a href="#top">Confidentialité</a>
            <a href="#top">Conditions</a>
          </div>
        </div>
        <div className="foot-bot">
          <span>© 2026 Immo Plus. Tous droits réservés.</span>
          <span>Abidjan · Dakar · Lomé</span>
        </div>
      </div>
    </footer>
  );
}

/* ──────────── MAIN EXPORT ──────────── */
export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = () => setDemoOpen(true);

  return (
    <div className="lp">
      <Nav onDemo={openDemo} />
      <Hero onDemo={openDemo} />
      <Strip />
      <Features />
      <DashboardShowcase />
      <Payments />
      <Stats />
      <Steps />
      <Pricing />
      <CTA onDemo={openDemo} />
      <Footer />
      {demoOpen && <SignUpModal onClose={() => setDemoOpen(false)} />}
    </div>
  );
}
