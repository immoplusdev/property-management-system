"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown2, MessageQuestion } from "iconsax-react";
import { reveal, stagger, ease } from "@/lib/animations/motion";
import { Wrap } from "../shared";

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
          style={{ background: "rgba(250,159,66,0.15)" }}
        >
          <ArrowDown2 size={14} variant="Bold" color="#fa9f42" />
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

export function FAQ() {
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
