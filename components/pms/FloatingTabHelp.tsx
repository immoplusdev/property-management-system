"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { SETTINGS_NAV, type SettingsSection } from "@/lib/pms/settingsNav";
import { PMS_HELP, SETTINGS_HELP } from "./pmsHelpContent";
import type { NavId } from "./PMSSidebar";

export function FloatingTabHelp() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const tab = segments[2] ?? "dashboard";
  const section = segments[3];
  const slides = tab === "settings" && section && SETTINGS_NAV.some(item => item.id === section)
    ? SETTINGS_HELP[section as SettingsSection]
    : PMS_HELP[tab as NavId];

  const [open, setOpen] = useState(true);
  const [index, setIndex] = useState(0);

  if (!slides?.length) return null;
  const slide = slides[index] ?? slides[0];
  const multiple = slides.length > 1;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[12px] font-semibold text-ink-2 shadow-lg hover:border-primary hover:text-primary sm:bottom-5 sm:right-5"
        aria-label="Afficher l'aide de cet onglet"
      >
        <Icon name="info" size={17} /> Aide
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-3 right-3 z-40 w-[min(20rem,calc(100vw-1.5rem))] max-h-[min(18rem,44dvh)] overflow-y-auto rounded-[16px] border border-border bg-surface shadow-[0_14px_38px_rgba(18,19,26,0.14)] sm:bottom-5 sm:right-5 sm:max-h-[min(20rem,50dvh)]"
      aria-label="Aide de l'onglet"
    >
      <div className="relative px-4.5 pt-4 pb-3 text-center">
        <h2 className="mx-7 text-[14px] font-bold leading-snug text-ink">{slide.title}</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-surface-2 text-ink-3 hover:bg-border hover:text-ink"
          aria-label="Fermer l'aide"
        >
          <span aria-hidden="true" className="text-[19px] leading-none">×</span>
        </button>
      </div>
      <div
        className="relative grid h-27 place-items-center overflow-hidden"
        style={{ background: `radial-gradient(ellipse at center, color-mix(in srgb, ${slide.color} 15%, white) 0%, #faf9ff 76%)` }}
        aria-hidden="true"
      >
        <div className="absolute bottom-3 h-2 w-14 rounded-full bg-ink/10 blur-[6px]" />
        <div className="relative grid h-15 w-15 -rotate-6 place-items-center rounded-[18px] border border-white bg-white shadow-[0_10px_24px_rgba(18,19,26,0.13)]">
          <Icon name={slide.icon} size={34} color={slide.color} stroke={2.5} />
        </div>
      </div>
      <div className="border-t border-border-soft px-4 pt-3 pb-3" aria-live="polite">
        <p className="text-[12px] leading-[1.55] text-ink-2">{slide.description}</p>
      </div>
      {multiple && (
        <div className="flex items-center justify-between px-3.5 pb-2.5" aria-label="Fonctionnalités de l'onglet">
          <button
            type="button"
            onClick={() => setIndex(current => (current - 1 + slides.length) % slides.length)}
            className="grid h-7 w-7 place-items-center rounded-[7px] text-ink-3 hover:bg-surface-2 hover:text-primary"
            aria-label="Explication précédente"
          >
            <Icon name="chevronLeft" size={14} />
          </button>
          <div className="flex items-center gap-1.5">
            {slides.map((item, dotIndex) => (
              <button
                type="button"
                key={item.title}
                onClick={() => setIndex(dotIndex)}
                className={`h-1.5 rounded-full transition-all ${dotIndex === index ? "w-4 bg-primary" : "w-1.5 bg-border hover:bg-ink-3"}`}
                aria-label={`Afficher l'explication ${dotIndex + 1} sur ${slides.length} : ${item.title}`}
                aria-current={dotIndex === index ? "step" : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex(current => (current + 1) % slides.length)}
            className="grid h-7 w-7 place-items-center rounded-[7px] text-ink-3 hover:bg-surface-2 hover:text-primary"
            aria-label="Explication suivante"
          >
            <Icon name="chevronRight" size={14} />
          </button>
        </div>
      )}
    </aside>
  );
}
