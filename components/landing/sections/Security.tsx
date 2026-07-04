"use client";
import React from "react";
import { motion } from "framer-motion";
import { Cloud, ShieldTick, Clock, Shield } from "iconsax-react";
import { reveal, stagger } from "@/lib/animations/motion";
import { Wrap } from "../shared";

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

export function Security() {
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
                  style={{ background: "rgba(238,224,203,0.12)" }}
                >
                  <s.Icon size={19} variant="Bold" color="#eee0cb" />
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
