"use client";
import type { StepProps, EquipState } from "../types";
import { EQUIP_GROUPS } from "../constants";
import { SectionHead } from "../ui/SectionHead";
import { Checkbox } from "../ui/Checkbox";
import { Pill } from "../ui/Pill";
import { Icon } from "../ui/Icon";

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="step3-tip">
      <div className="step3-tip-dot"><Icon name="sparkles" size={12} /></div>
      <p className="step3-tip-text">{children}</p>
    </div>
  );
}

const checkAll = (e: EquipState, g: typeof EQUIP_GROUPS[number]): Partial<EquipState> => {
  const patch: Partial<EquipState> = {};
  g.items.forEach((it) => { (patch as Record<string, boolean>)[it.id] = true; });
  return patch;
};

export function Step3({ state, update }: StepProps) {
  const e = state.equip;
  const set = <K extends keyof EquipState>(k: K, v: EquipState[K]) =>
    update("equip", { ...e, [k]: v });

  const totalChecked = Object.values(e).filter((v) => v === true).length;
  const towardsBadge = Math.max(0, 18 - totalChecked);
  const badgeReached = towardsBadge === 0;

  const groupColor = (g: typeof EQUIP_GROUPS[number]) => ({
    bg: `var(--${g.color === "primary" ? "primary-50" : g.color + "-bg"})`,
    fg: `var(--${g.color === "primary" ? "primary" : g.color})`,
  });

  return (
    <div className="step3-shell fade-in">

      {/* ── En-tête ── */}
      <div className="page-head">
        <div className="page-eyebrow">Étape 3 sur 7</div>
        <h1 className="page-title">Équipements & services de l&apos;établissement</h1>
        <p className="page-desc">
          Ces équipements s&apos;appliquent à tout l&apos;hôtel (pas par chambre). Cochez ce qui est disponible —
          les options non cochées seront marquées comme indisponibles.
        </p>
      </div>

      {/* ── Stats ── */}
      <section className="card step3-card step3-stats-card">
        <div className="step3-stats-row">
          {EQUIP_GROUPS.map((g) => {
            const count = g.items.filter((it) => e[it.id as keyof EquipState] === true).length;
            const c = groupColor(g);
            return (
              <div key={g.id} className="step3-stat">
                <div className="step3-stat-icon" style={{ background: c.bg, color: c.fg }}>
                  <Icon name={g.icon} size={15} />
                </div>
                <div className="step3-stat-value">
                  {count}<span className="step3-stat-total">/{g.items.length}</span>
                </div>
                <div className="step3-stat-label">{g.title}</div>
              </div>
            );
          })}
        </div>
      </section>

      <Tip>Un établissement avec <strong>15+ équipements cochés</strong> reçoit 40% de demandes de réservation en plus dans le feed Immo Plus.</Tip>

      {/* ── Bento ── */}
      <div className="step3-bento">

        {/* ── Connectivité (5 cols) ── */}
        {(() => {
          const g = EQUIP_GROUPS[0];
          const count = g.items.filter((it) => e[it.id as keyof EquipState] === true).length;
          const c = groupColor(g);
          return (
            <section className="card step3-card step3-conn-card">
              <SectionHead
                icon={g.icon}
                title={g.title}
                sub={`${count}/${g.items.length} cochés`}
                right={<button className="btn btn-text btn-sm" onClick={() => update("equip", { ...e, ...checkAll(e, g) })}>Tout cocher</button>}
              />
              <div className="step3-grid-2">
                {g.items.map((it) => (
                  <Checkbox
                    key={it.id}
                    checked={!!e[it.id as keyof EquipState]}
                    onChange={(v) => set(it.id as keyof EquipState, v as EquipState[keyof EquipState])}
                    label={it.label}
                    sub={it.sub}
                  />
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── Sécurité (7 cols) ── */}
        {(() => {
          const g = EQUIP_GROUPS[1];
          const count = g.items.filter((it) => e[it.id as keyof EquipState] === true).length;
          return (
            <section className="card step3-card step3-sec-card">
              <SectionHead
                icon={g.icon}
                title={g.title}
                sub={`${count}/${g.items.length} cochés`}
                right={<button className="btn btn-text btn-sm" onClick={() => update("equip", { ...e, ...checkAll(e, g) })}>Tout cocher</button>}
              />
              <div className="step3-grid-3">
                {g.items.map((it) => (
                  <Checkbox
                    key={it.id}
                    checked={!!e[it.id as keyof EquipState]}
                    onChange={(v) => set(it.id as keyof EquipState, v as EquipState[keyof EquipState])}
                    label={it.label}
                    sub={it.sub}
                  />
                ))}
              </div>

            </section>
          );
        })()}

        {/* ── Services hôteliers (pleine largeur) ── */}
        {(() => {
          const g = EQUIP_GROUPS[2];
          const count = g.items.filter((it) => e[it.id as keyof EquipState] === true).length;
          return (
            <section className="card step3-card step3-serv-card">
              <SectionHead
                icon={g.icon}
                title={g.title}
                sub={`${count}/${g.items.length} cochés`}
                right={<button className="btn btn-text btn-sm" onClick={() => update("equip", { ...e, ...checkAll(e, g) })}>Tout cocher</button>}
              />
              <div className="step3-grid-4">
                {g.items.map((it) => (
                  <Checkbox
                    key={it.id}
                    checked={!!e[it.id as keyof EquipState]}
                    onChange={(v) => set(it.id as keyof EquipState, v as EquipState[keyof EquipState])}
                    label={it.label}
                    sub={it.sub}
                  />
                ))}
              </div>
              <Tip>La <strong>réception 24h/24</strong> et le <strong>room service</strong> sont les 2 critères les plus filtrés par les voyageurs d&apos;affaires.</Tip>
            </section>
          );
        })()}

        {/* ── Loisirs & bien-être (7 cols) ── */}
        {(() => {
          const g = EQUIP_GROUPS[3];
          const count = g.items.filter((it) => e[it.id as keyof EquipState] === true).length;
          return (
            <section className="card step3-card step3-leis-card">
              <SectionHead
                icon={g.icon}
                title={g.title}
                sub={`${count}/${g.items.length} cochés`}
                right={<button className="btn btn-text btn-sm" onClick={() => update("equip", { ...e, ...checkAll(e, g) })}>Tout cocher</button>}
              />
              <div className="step3-grid-3">
                {g.items.map((it) => (
                  <Checkbox
                    key={it.id}
                    checked={!!e[it.id as keyof EquipState]}
                    onChange={(v) => set(it.id as keyof EquipState, v as EquipState[keyof EquipState])}
                    label={it.label}
                    sub={it.sub}
                  />
                ))}
              </div>
            </section>
          );
        })()}

        {/* ── Business & événements (5 cols) ── */}
        {(() => {
          const g = EQUIP_GROUPS[4];
          const count = g.items.filter((it) => e[it.id as keyof EquipState] === true).length;
          return (
            <section className="card step3-card step3-biz-card">
              <SectionHead
                icon={g.icon}
                title={g.title}
                sub={`${count}/${g.items.length} cochés`}
                right={<button className="btn btn-text btn-sm" onClick={() => update("equip", { ...e, ...checkAll(e, g) })}>Tout cocher</button>}
              />
              <div className="step3-grid-2">
                {g.items.map((it) => (
                  <Checkbox
                    key={it.id}
                    checked={!!e[it.id as keyof EquipState]}
                    onChange={(v) => set(it.id as keyof EquipState, v as EquipState[keyof EquipState])}
                    label={it.label}
                    sub={it.sub}
                  />
                ))}
              </div>
            </section>
          );
        })()}

      </div>

      {/* ── Badge Confort 4 étoiles ── */}
      <section className="card step3-card step3-badge-card">
        <div className="step3-badge-inner">
          <div className="step3-badge-icon">
            <Icon name="award" size={22} />
          </div>
          <div className="step3-badge-text">
            <div className="step3-badge-title">{totalChecked} équipement{totalChecked > 1 ? "s" : ""} activé{totalChecked > 1 ? "s" : ""}</div>
            <div className="step3-badge-sub">
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
        <Tip>Le badge <strong>«&nbsp;Confort 4 étoiles&nbsp;»</strong> s&apos;affiche en avant sur votre fiche publique — il augmente le taux de clic de <strong>+23%</strong>.</Tip>
      </section>

    </div>
  );
}
