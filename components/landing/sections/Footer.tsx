"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Facebook, Instagram, Global } from "iconsax-react";
import { reveal, stagger, staggerContainer, staggerItem, ease, hoverTapButton } from "@/lib/animations/motion";
import { SITE_CONFIG, SOCIAL_MEDIA } from "@/lib/seo/seo.config";
import { Wrap, BrandMark } from "../shared";

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.11 20.45H3.56V9h3.55v11.45Z" />
  </svg>
);

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M13.6 10.6 20.1 3h-1.55l-5.65 6.6L8.4 3H3l6.83 9.95L3 21h1.55l5.97-6.98L15.6 21H21l-7.4-10.4Zm-2.11 2.47-.69-.99L5.3 4.17h2.38l4.44 6.35.69.99 5.77 8.25h-2.38l-4.71-6.74Z" />
  </svg>
);

const SOCIALS = [
  { label: "Facebook",  Icon: Facebook,     href: `https://facebook.com/${SOCIAL_MEDIA.facebook}` },
  { label: "Instagram", Icon: Instagram,    href: `https://instagram.com/${SOCIAL_MEDIA.instagram}` },
  { label: "LinkedIn",  Icon: LinkedinIcon, href: `https://linkedin.com/company/${SOCIAL_MEDIA.linkedin}` },
  { label: "X",         Icon: XIcon,        href: `https://twitter.com/${SOCIAL_MEDIA.twitter}` },
] as const;

const FOOTER_COLUMNS = [
  { title: "Produit",    links: [["#features","Fonctionnalités"],["#showcase","Tableau de bord"],["#paiements","Paiements"],["#tarifs","Tarifs"]] },
  { title: "Ressources", links: [["/pms","Démo en ligne"],["/inscription","Créer un compte"],["/login","Se connecter"]] },
  { title: "Entreprise", links: [["#top","À propos"],["#top","Confidentialité"],["#top","Conditions"]] },
  { title: "Contact",    links: [[`mailto:${SITE_CONFIG.email}`, SITE_CONFIG.email], [`tel:${SITE_CONFIG.phone.replace(/[^0-9+]/g, "")}`, SITE_CONFIG.phone], ["#top", "Abidjan, Côte d'Ivoire"]] },
] as const;

export function Footer({ onDemo }: { onDemo: () => void }) {
  return (
    <footer className="relative" style={{ background: "#1A1423" }}>
      {/* ── Bandeau d'impact ── */}
      <div className="pt-[110px] pb-[70px] text-center max-[880px]:pt-[70px] max-[880px]:pb-[50px] max-[560px]:pt-[56px] max-[560px]:pb-10">
        <Wrap>
          <motion.h2
            className="text-[clamp(26px,8.5vw,100px)] leading-[0.95] tracking-[-0.02em] uppercase text-white m-0 whitespace-nowrap"
            style={{ fontFamily: "var(--font-display)" }}
            {...reveal(0)}
          >
            Prêt pour l&apos;impact ?
          </motion.h2>

          <motion.div className="mt-[55px]" {...reveal(0.15)}>
            <motion.button
              className="inline-flex items-center justify-center rounded-full font-bold uppercase tracking-[0.03em] text-white text-[14.5px] h-[60px] px-9"
              style={{ background: "#2744DE" }}
              onClick={onDemo}
              {...hoverTapButton}
            >
              Prendre rendez-vous
            </motion.button>
          </motion.div>

          <motion.div
            className="flex items-center justify-center gap-x-7 gap-y-2 flex-wrap mt-9 text-[13.5px] text-white/55"
            {...reveal(0.2)}
          >
            <a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white transition-colors">{SITE_CONFIG.email}</a>
            <span className="text-white/20">·</span>
            <a href={`tel:${SITE_CONFIG.phone.replace(/[^0-9+]/g, "")}`} className="hover:text-white transition-colors">{SITE_CONFIG.phone}</a>
            <span className="text-white/20">·</span>
            <span>Abidjan, Côte d&apos;Ivoire</span>
          </motion.div>
        </Wrap>
      </div>

      {/* ── Footer principal ── */}
      <div className="border-t border-white/10 py-[90px] max-[880px]:py-[60px] max-[560px]:py-[46px]">
        <Wrap>
          <motion.div
            className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 mb-16 max-[880px]:grid-cols-2 max-[880px]:gap-8 max-[880px]:mb-12 max-[560px]:grid-cols-1"
            {...staggerContainer(0.08)}
          >
            <motion.div variants={staggerItem}>
              <Link href="/" className="flex items-center gap-[11px]">
                <BrandMark />
                <span className="font-semibold text-[17px] tracking-[-0.02em] flex items-center gap-2 text-white">
                  Immo Plus{" "}
                  <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-white/70 border border-white/25 px-1.5 py-px rounded-[5px]">
                    PMS
                  </span>
                </span>
              </Link>
              <p className="text-[13.5px] text-white/50 leading-relaxed mt-4 max-w-[250px] m-0">
                Le logiciel de gestion tout-en-un pour les hôtels et résidences d&apos;Afrique de l&apos;Ouest.
              </p>
              <div className="flex items-center gap-2.5 mt-6">
                {SOCIALS.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-white/15 grid place-items-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
                  >
                    <s.Icon size={15} />
                  </a>
                ))}
              </div>
              <div className="inline-flex items-center gap-1.5 mt-7 text-[12.5px] text-white/45">
                <Global size={14} /> FR
              </div>
            </motion.div>

            {FOOTER_COLUMNS.map(col => (
              <motion.div key={col.title} variants={staggerItem}>
                <h4 className="text-[11px] uppercase tracking-[0.1em] text-white/40 m-0 mb-5 font-bold">{col.title}</h4>
                {col.links.map(([href, label]) => (
                  <motion.a
                    key={label}
                    href={href}
                    className="block text-[14.5px] text-white/85 mb-[13px]"
                    whileHover={{ color: "#2744DE", x: 2 }}
                    transition={{ duration: 0.15, ease }}
                  >
                    {label}
                  </motion.a>
                ))}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex items-center justify-between pt-[26px] border-t border-white/10 text-[13px] text-white/40 flex-wrap gap-3"
            {...reveal(0.1)}
          >
            <span>© 2026 Immo Plus. Tous droits réservés.</span>
            <div className="flex gap-5">
              <a href="#top" className="hover:text-white transition-colors">Confidentialité</a>
              <a href="#top" className="hover:text-white transition-colors">Conditions</a>
            </div>
          </motion.div>
        </Wrap>
      </div>
    </footer>
  );
}
