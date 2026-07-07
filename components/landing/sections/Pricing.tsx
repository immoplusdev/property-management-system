"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { reveal, stagger } from "@/lib/animations/motion";
import { Wrap, btn } from "../shared";

const PLANS = [
  {
    name: "Découverte", desc: "Pour tester et gérer une petite structure.",
    price: "0",         sub: "jusqu'à 5 chambres",
    items: ["Réservations & planning", "Check-in & fiches clients", "1 utilisateur", "Commission 8% par réservation"],
    cta: "Commencer", href: "/inscription", pop: false, external: false,
  },
  {
    name: "Partenaire",  desc: "Pour les établissements d'envergure avec besoins spécifiques.",
    price: "Sur devis",  sub: "tarif personnalisé",
    items: ["Tout Découverte, sans limite", "Mobile money & finances", "Rapports & exports", "Utilisateurs illimités", "Accompagnement dédié"],
    cta: "Nous contacter", href: "#", pop: false, external: true,
  },
] as const;

export function Pricing() {
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
