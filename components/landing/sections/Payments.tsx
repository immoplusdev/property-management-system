"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Money } from "iconsax-react";
import { reveal, stagger, ease } from "@/lib/animations/motion";
import { Wrap, btn } from "../shared";

const PAYS = [
  { type: "image", image: "/wave.png", name: "Wave",            ds: "Confirmé · il y a 2 min",  amt: "+114 000" },
  { type: "image", image: "/om.png",   name: "Orange Money",    ds: "Confirmé · il y a 18 min", amt: "+38 000"  },
  { type: "image", image: "/mtn.jpeg", name: "MTN MoMo",       ds: "Confirmé · il y a 1 h",    amt: "+475 000" },
  { type: "icon",  icon: "Wallet",      name: "Carte & espèces", ds: "Caisse réconciliée",        amt: "+330 000" },
] as const;

export function Payments() {
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
                    <Money size={24} variant="Bold" color="var(--color-ink)" />
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
