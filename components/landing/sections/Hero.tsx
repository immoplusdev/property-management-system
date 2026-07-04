"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, SmartHome, TrendUp, TickCircle } from "iconsax-react";
import { cn } from "@/lib/utils/cn";
import { fadeUp, float, ease, hoverTapButton } from "@/lib/animations/motion";
import { Wrap, btn } from "../shared";

const TYPING_WORDS = [
  { word: "endroit.", color: "#F72585" },
  { word: "Hub.", color: "#2744de" },
  { word: "logiciel.", color: "#35ff69" },
  { word: "Espace.", color: "#fa9f42" },
  { word: "portail.", color: "#d4c2fc" },
];

function TypingAnimation() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = TYPING_WORDS[wordIndex].word;
    const timer = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayText.length < currentWord.length) {
            setDisplayText(currentWord.substring(0, displayText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText(displayText.substring(0, displayText.length - 1));
          } else {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
          }
        }
      },
      isDeleting ? 50 : 80
    );

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, wordIndex]);

  return (
    <span style={{ color: TYPING_WORDS[wordIndex].color, fontStyle: "italic" }}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function HeroCards() {
  return (
    <div className="pt-6 relative max-w-[1100px] mx-auto mt-1 min-h-[400px] max-[760px]:min-h-0 max-[760px]:mt-7 max-[760px]:flex max-[760px]:flex-col max-[760px]:items-center max-[760px]:gap-6">

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

export function Hero({ onDemo }: { onDemo: () => void }) {
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
            Tout votre hôtel,<br />dans un seul <TypingAnimation />
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
