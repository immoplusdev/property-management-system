"use client";
import React from "react";
import { motion } from "framer-motion";
import { Calendar, Grid1, Key, Card, Chart, People } from "iconsax-react";
import { cn } from "@/lib/utils/cn";
import { reveal, stagger, ease } from "@/lib/animations/motion";
import { Wrap } from "../shared";

const FEATS = [
  { Icon: Calendar, iconClass: "bg-primary-50 text-primary",  color: "var(--color-primary)",  title: "Réservations",        desc: "Encaissez les réservations directes et synchronisez vos canaux. Vue claire des arrivées et départs du jour." },
  { Icon: Grid1,    iconClass: "bg-teal-bg text-teal",        color: "var(--color-teal)",    title: "Planning chambres",   desc: "Un planning visuel par étage : libre, occupée, ménage, départ. Glissez-déposez pour réattribuer en un geste." },
  { Icon: Key,      iconClass: "bg-violet-bg text-violet",    color: "var(--color-violet)",  title: "Check-in express",    desc: "Enregistrez vos clients en moins d'une minute. Pièce d'identité, signature et fiche de police générées automatiquement." },
  { Icon: Card,     iconClass: "bg-coral-bg text-coral",      color: "var(--color-coral)",   title: "Encaissements",       desc: "Wave, Orange Money, MTN, espèces ou carte. Chaque paiement est rattaché à la bonne facture, sans saisie double." },
  { Icon: Chart,    iconClass: "bg-amber-bg text-amber",      color: "var(--color-amber)",   title: "Finances & rapports", desc: "Chiffre d'affaires, RevPAR, taux d'occupation et dépenses en temps réel. Exportez vos rapports en un clic." },
  { Icon: People,   iconClass: "bg-success-bg text-success",  color: "var(--color-success)", title: "Clients & fidélité",  desc: "Historique des séjours, préférences et statut VIP. Reconnaissez vos habitués et personnalisez l'accueil." },
] as const;

export function Features() {
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
              <div className={cn("w-[50px] h-[50px] rounded-[14px] grid place-items-center mb-[22px]", f.iconClass)}>
                <f.Icon size={24} variant="Bold" color={f.color} />
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
