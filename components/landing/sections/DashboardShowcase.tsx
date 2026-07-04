"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { reveal } from "@/lib/animations/motion";
import { Wrap } from "../shared";

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

export function DashboardShowcase() {
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
