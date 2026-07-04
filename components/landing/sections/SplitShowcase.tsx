"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Link as LinkIcon, Calendar, TickCircle } from "iconsax-react";
import { cn } from "@/lib/utils/cn";
import { reveal, stagger, float, ease } from "@/lib/animations/motion";
import { Wrap } from "../shared";

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

export function SplitShowcase() {
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
