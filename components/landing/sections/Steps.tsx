"use client";
import React from "react";
import { motion } from "framer-motion";
import { reveal, stagger } from "@/lib/animations/motion";
import { Wrap } from "../shared";

const STEPS = [
  { n: "1", title: "Créez votre établissement", desc: "Nom, chambres, types et tarifs. Notre assistant vous guide pas à pas en quelques minutes." },
  { n: "2", title: "Importez vos réservations",  desc: "Reprenez votre cahier ou vos canaux existants. Vos données arrivent prêtes à l'emploi." },
  { n: "3", title: "Encaissez & pilotez",        desc: "Check-in, paiements mobile money et rapports : tout tourne dès le premier jour." },
];

export function Steps() {
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
