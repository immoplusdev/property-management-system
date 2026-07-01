"use client";
import type { StepProps, EquipState } from "../types";
import { EQUIP_GROUPS } from "../constants";
import { SectionHead } from "../ui/SectionHead";
import { Checkbox } from "../ui/Checkbox";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";
import { PageHead } from "../ui/PageHead";
import { InsCard } from "../ui/InsCard";
import { Tip } from "../ui/Tip";
import { Btn } from "../ui/Btn";
import type { UpdateFn } from "../types";

type EquipGroup = typeof EQUIP_GROUPS[number];

const checkAll = (g: EquipGroup): Partial<EquipState> => {
  const patch: Partial<EquipState> = {};
  g.items.forEach((it) => { (patch as Record<string, boolean>)[it.id] = true; });
  return patch;
};

const GRID_COLS: Record<number, string> = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

function EquipCard({ group, span, cols, e, update, children }: {
  group: EquipGroup; span: string; cols: 2 | 3 | 4; e: EquipState; update: UpdateFn; children?: React.ReactNode;
}) {
  const count = group.items.filter((it) => e[it.id as keyof EquipState] === true).length;
  return (
    <InsCard flat className={span}>
      <SectionHead
        icon={group.icon}
        title={group.title}
        sub={`${count}/${group.items.length} cochés`}
        right={<Btn variant="text" size="sm" onClick={() => update("equip", { ...e, ...checkAll(group) })}>Tout cocher</Btn>}
      />
      <div className={`grid gap-1.75 ${GRID_COLS[cols]}`}>
        {group.items.map((it) => (
          <Checkbox
            key={it.id}
            checked={!!e[it.id as keyof EquipState]}
            onChange={(v) => update("equip", { ...e, [it.id]: v })}
            label={it.label}
            sub={it.sub}
          />
        ))}
      </div>
      {children}
    </InsCard>
  );
}

export function Step3({ state, update }: StepProps) {
  const e = state.equip;

  const totalChecked = Object.values(e).filter((v) => v === true).length;
  const towardsBadge = Math.max(0, 18 - totalChecked);
  const badgeReached = towardsBadge === 0;

  const groupColor = (g: EquipGroup) => ({
    bg: `var(--${g.color === "primary" ? "primary-50" : g.color + "-bg"})`,
    fg: `var(--${g.color === "primary" ? "primary" : g.color})`,
  });

  return (
    <div className="flex flex-col gap-5 animate-insc-fade">
      <PageHead
        eyebrow="Étape 3 sur 7"
        title="Équipements & services de l'établissement"
        desc="Ces équipements s'appliquent à tout l'hôtel (pas par chambre). Cochez ce qui est disponible les options non cochées seront marquées comme indisponibles."
      />

      {/* Stats */}
      <InsCard flat className="!p-0 overflow-hidden">
        <div className="flex items-stretch">
          {EQUIP_GROUPS.map((g) => {
            const count = g.items.filter((it) => e[it.id as keyof EquipState] === true).length;
            const c = groupColor(g);
            return (
              <div key={g.id} className="flex-1 px-5 py-4.5 border-r border-border last:border-r-0 flex flex-col gap-1.75">
                <div className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: c.bg, color: c.fg }}>
                  <Icon name={g.icon} size={15} />
                </div>
                <div className="text-[22px] font-extrabold tracking-tighter tabular-nums text-ink leading-none">
                  {count}<span className="text-[14px] font-medium text-ink-3">/{g.items.length}</span>
                </div>
                <div className="text-[11px] text-ink-3 font-medium leading-[1.3]">{g.title}</div>
              </div>
            );
          })}
        </div>
      </InsCard>

      <Tip>Un établissement avec <strong>15+ équipements cochés</strong> reçoit 40% de demandes de réservation en plus dans le feed Immo Plus.</Tip>

      {/* Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <EquipCard group={EQUIP_GROUPS[0]} span="" cols={2} e={e} update={update} />
        <EquipCard group={EQUIP_GROUPS[1]} span="" cols={3} e={e} update={update} />
        <EquipCard group={EQUIP_GROUPS[2]} span="lg:col-span-2" cols={4} e={e} update={update}>
          <Tip>La <strong>réception 24h/24</strong> et le <strong>room service</strong> sont les 2 critères les plus filtrés par les voyageurs d&apos;affaires.</Tip>
        </EquipCard>
        <EquipCard group={EQUIP_GROUPS[3]} span="" cols={3} e={e} update={update} />
        <EquipCard group={EQUIP_GROUPS[4]} span="" cols={2} e={e} update={update} />
      </div>

      {/* Badge Confort 4 étoiles */}
      <InsCard flat className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <div className="shrink-0 w-12 h-12 rounded-xl bg-primary text-white grid place-items-center">
            <Icon name="award" size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-ink">{totalChecked} équipement{totalChecked > 1 ? "s" : ""} activé{totalChecked > 1 ? "s" : ""}</div>
            <div className="text-[12.5px] text-ink-2 mt-0.75 leading-[1.5]">
              {badgeReached
                ? <>Félicitations — vous avez atteint le badge <strong>«&nbsp;Confort 4 étoiles&nbsp;»</strong>.</>
                : <>Plus que <strong>{towardsBadge} équipement{towardsBadge > 1 ? "s" : ""}</strong> pour décrocher le badge <strong>«&nbsp;Confort 4 étoiles&nbsp;»</strong>.</>
              }
            </div>
          </div>
          <Pill kind={badgeReached ? "success" : "primary"} dot>
            {badgeReached ? "Validé ✓" : `+${towardsBadge}`}
          </Pill>
        </div>
        <Tip>Le badge <strong>«&nbsp;Confort 4 étoiles&nbsp;»</strong> s&apos;affiche en avant sur votre fiche publique  il augmente le taux de clic de <strong>+23%</strong>.</Tip>
      </InsCard>

    </div>
  );
}
