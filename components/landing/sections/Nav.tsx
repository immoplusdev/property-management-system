"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import type { UserDto } from "@/lib/api/generated/model";
import { hoverTapButton } from "@/lib/animations/motion";
import { Wrap, BrandMark, BrandName, btn } from "../shared";

export function Nav({ onDemo, user }: { onDemo: () => void; user: UserDto | null }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <header className={cn(
      "sticky top-11 z-50 bg-white/[0.82] backdrop-saturate-[180%] backdrop-blur-[14px]",
      "border-b border-transparent transition-[border-color] duration-200",
      scrolled && "border-border"
    )}>
      <Wrap className="flex items-center justify-between h-[74px]">
        <Link href="/" className="flex items-center gap-[11px]">
          <BrandMark />
          <BrandName />
        </Link>

        <nav className="hidden min-[880px]:flex items-center gap-[30px]">
          {([
            ["#features", "Fonctionnalités"],
            ["#showcase", "Le produit"],
            ["#paiements", "Paiements"],
            ["#tarifs", "Tarifs"],
          ] as const).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-ink-2 hover:text-ink transition-colors duration-[120ms]"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link href="/pms" className="w-10 h-10 rounded-full grid place-items-center hover:bg-surface-2 transition-colors" title={user.firstName ?? "Profil"}>
                <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center font-semibold text-[12px]">
                  {user.firstName?.[0]?.toUpperCase() ?? "U"}
                </div>
              </Link>
              <Link href="/logout" className={btn({ variant: "outline", size: "nav" })}>
                Déconnexion
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className={cn(btn({ variant: "outline", size: "nav" }), "hidden min-[560px]:inline-flex")}>
                Connexion
              </Link>
              <motion.button className={btn({ variant: "dark", size: "nav" })} onClick={onDemo} {...hoverTapButton}>
                Réserver une démo
              </motion.button>
            </>
          )}
        </div>
      </Wrap>
    </header>
  );
}
