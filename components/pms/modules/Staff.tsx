"use client";
import React, { useState } from "react";
import { PMSHeader } from "../PMSHeader";
import { SectionHead, Icon, showToast, toastPromise, Button } from "../shared";
import { Pill } from "@/components/ui/Pill";
import { Modal } from "@/components/ui/Modal";
import { useStaff, useInviteStaff, useRevokeStaff } from "@/lib/hooks/pms/useStaff";
import type { StaffRole, StaffMember } from "@/lib/api/pms/staff.actions";

const ROLE_CONFIG: Record<StaffRole, { label: string; color: string; bg: string }> = {
  director:     { label: "Directeur",      color: "var(--color-primary)", bg: "var(--color-primary-50)"  },
  receptionist: { label: "Réceptionniste", color: "var(--color-teal)",    bg: "var(--color-teal-bg)"     },
  housekeeper:  { label: "Ménage",         color: "var(--color-violet)",  bg: "var(--color-violet-bg)"   },
};

const AV_COLORS = ["#E89060","#6FB5A8","#7B8DFF","#B57BE6","#F5C572","#6FCC92","#FF8585","#6FB5DD"];
const avatarBg  = (id: string) => AV_COLORS[id.charCodeAt(1) % AV_COLORS.length];
const initials  = (m: StaffMember) =>
  `${m.user.firstName[0] ?? ""}${m.user.lastName[0] ?? ""}`.toUpperCase();

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-2 rounded-lg animate-pulse ${className}`} />;
}

export function Staff() {
  const { data, isLoading } = useStaff();
  const inviteM  = useInviteStaff();
  const revokeM  = useRevokeStaff();

  const staff    = data?.staff ?? [];
  const active   = staff.filter(s => s.status === "active");
  const pending  = staff.filter(s => s.status === "pending");

  const [filter,       setFilter]       = useState<"all" | StaffRole>("all");
  const [inviteOpen,   setInviteOpen]   = useState(false);
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [inviteRole,   setInviteRole]   = useState<StaffRole>("receptionist");
  const [revokeTarget, setRevokeTarget] = useState<StaffMember | null>(null);

  const list = filter === "all"
    ? staff.filter(s => s.status !== "revoked")
    : staff.filter(s => s.role === filter && s.status !== "revoked");

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    try {
      await toastPromise(inviteM.mutateAsync({ email: inviteEmail.trim(), role: inviteRole }), {
        loading: "Envoi de l'invitation…",
        success: `Invitation envoyée à ${inviteEmail}`,
        error: (e) => (e as Error)?.message || "Erreur lors de l'invitation",
      });
      setInviteOpen(false);
      setInviteEmail("");
    } catch { /* toast déjà affiché */ }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    const who = `${revokeTarget.user.firstName} ${revokeTarget.user.lastName}`;
    try {
      await toastPromise(revokeM.mutateAsync(revokeTarget.id), {
        loading: "Révocation…",
        success: `Accès révoqué pour ${who}`,
        error: (e) => (e as Error)?.message || "Erreur lors de la révocation",
      });
      setRevokeTarget(null);
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Personnel"
        sub={
          isLoading
            ? "Chargement…"
            : `${active.length} membres actifs · ${pending.length} invitation${pending.length !== 1 ? "s" : ""} en attente`
        }
        search={false}
        actions={
          <Button variant="primary" size="sm" onClick={() => setInviteOpen(true)}>
            <Icon name="plus" size={14} /> Inviter un membre
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-3 mb-5.5">
        <KPIBox icon="users"  label="Membres actifs"         value={active.length}  color="var(--color-primary)" bg="var(--color-primary-50)" />
        <KPIBox icon="clock"  label="Invitations en attente" value={pending.length} color="var(--color-amber)"   bg="var(--color-amber-bg)"   />
        <KPIBox icon="shield" label="Rôles configurés"       value={3}              color="var(--color-teal)"    bg="var(--color-teal-bg)"    />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["all", "director", "receptionist", "housekeeper"] as const).map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border transition-colors ${
              filter === r
                ? "bg-ink text-white border-ink"
                : "bg-surface text-ink-2 border-border hover:border-ink-3"
            }`}
          >
            {r === "all" ? "Tous" : ROLE_CONFIG[r].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-[18px] overflow-hidden">
        {isLoading ? (
          <div className="p-4 grid gap-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {["Membre", "Rôle", "Statut", "Invité le", "Dernière activité", ""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-ink-3 font-semibold text-[11.5px] uppercase tracking-[0.04em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((m, idx) => {
                const rc = ROLE_CONFIG[m.role];
                return (
                  <tr key={m.id} className={`border-b border-border last:border-0 ${idx % 2 === 0 ? "" : "bg-surface-2/40"}`}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-full inline-grid place-items-center text-white font-semibold text-[13px] shrink-0"
                          style={{ background: avatarBg(m.id) }}
                        >
                          {m.status === "pending" ? <Icon name="mail" size={14} /> : initials(m)}
                        </div>
                        <div>
                          <div className="font-semibold">{m.user.firstName} {m.user.lastName}</div>
                          <div className="text-[11.5px] text-ink-3">{m.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold"
                        style={{ background: rc.bg, color: rc.color }}
                      >
                        {rc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {m.status === "active"  && <Pill kind="success" dot>Actif</Pill>}
                      {m.status === "pending" && <Pill kind="warn" dot>En attente</Pill>}
                    </td>
                    <td className="px-4 py-3.5 text-ink-3">
                      {new Date(m.invitedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3.5 text-ink-3">—</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        {m.status === "pending" && (
                          <Button variant="ghost" size="sm" onClick={() => showToast("Invitation renvoyée", "check")}>
                            <Icon name="send" size={13} /> Renvoyer
                          </Button>
                        )}
                        {m.role !== "director" && (
                          <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(m)}>
                            <Icon name="trash" size={13} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!isLoading && list.length === 0 && (
          <div className="py-12 text-center text-ink-3 text-[13px]">Aucun membre trouvé</div>
        )}
      </div>

      {/* Roles reference */}
      <div className="mt-5">
        <SectionHead icon="shield" title="Permissions par rôle" />
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(ROLE_CONFIG) as [StaffRole, typeof ROLE_CONFIG[StaffRole]][]).map(([role, rc]) => (
            <div key={role} className="bg-surface border border-border rounded-[14px] p-4">
              <div className="font-bold text-[14px] mb-2.5" style={{ color: rc.color }}>{rc.label}</div>
              <div className="grid gap-1.5">
                {ROLE_PERMISSIONS[role].map(p => (
                  <div key={p.label} className="flex items-center gap-2 text-[12px]">
                    <Icon name={p.ok ? "check" : "x"} size={12} color={p.ok ? "var(--color-success)" : "var(--color-ink-3)"} />
                    <span className={p.ok ? "text-ink" : "text-ink-3"}>{p.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <Modal
          open
          onClose={() => setInviteOpen(false)}
          maxWidth={480}
          footer={
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={() => setInviteOpen(false)}>Annuler</Button>
              <Button variant="primary" size="sm" disabled={inviteM.isPending} onClick={handleInvite}>
                <Icon name="send" size={13} /> {inviteM.isPending ? "Envoi…" : "Envoyer l'invitation"}
              </Button>
            </div>
          }
        >
          <div className="mb-5">
            <div className="font-bold text-[18px] tracking-[-0.02em] mb-1">Inviter un membre</div>
            <div className="text-[13px] text-ink-3">Un email d&apos;invitation sera envoyé à l&apos;adresse indiquée.</div>
          </div>
          <div className="grid gap-3.5">
            <div>
              <label className="text-[12px] font-semibold text-ink-2 mb-1.5 block">Adresse email</label>
              <input
                type="email"
                className="w-full h-10 border border-border rounded-[9px] px-3 text-[13.5px] text-ink outline-none focus:border-primary bg-surface"
                placeholder="prenom.nom@hotelpalace.ci"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleInvite()}
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-ink-2 mb-1.5 block">Rôle</label>
              <div className="grid grid-cols-3 gap-2">
                {(["receptionist", "housekeeper", "director"] as StaffRole[]).map(r => {
                  const rc = ROLE_CONFIG[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      className={`p-3 rounded-[10px] border-[1.5px] text-left transition-colors ${
                        inviteRole === r ? "border-primary bg-primary-50" : "border-border hover:border-ink-3"
                      }`}
                    >
                      <div className="font-semibold text-[12.5px]">{rc.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Revoke confirm */}
      {revokeTarget && (
        <Modal
          open
          onClose={() => setRevokeTarget(null)}
          maxWidth={420}
          footer={
            <div className="flex gap-2 ml-auto">
              <Button variant="ghost" size="sm" onClick={() => setRevokeTarget(null)}>Annuler</Button>
              <Button variant="primary" size="sm" disabled={revokeM.isPending} onClick={handleRevoke}>
                <Icon name="trash" size={13} /> {revokeM.isPending ? "Révocation…" : "Révoquer l'accès"}
              </Button>
            </div>
          }
        >
          <div className="mb-2">
            <div className="font-bold text-[17px] tracking-[-0.02em] mb-1">Révoquer l&apos;accès ?</div>
            <div className="text-[13px] text-ink-3">
              {revokeTarget.user.firstName} {revokeTarget.user.lastName} n&apos;aura plus accès au PMS.
              Cette action est irréversible — un nouvel accès nécessitera une nouvelle invitation.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

const ROLE_PERMISSIONS: Record<StaffRole, { label: string; ok: boolean }[]> = {
  director: [
    { label: "Tableau de bord",   ok: true  },
    { label: "Réservations",      ok: true  },
    { label: "Check-in / out",    ok: true  },
    { label: "Finances",          ok: true  },
    { label: "Gestion personnel", ok: true  },
    { label: "Paramètres",        ok: true  },
  ],
  receptionist: [
    { label: "Tableau de bord",   ok: true  },
    { label: "Réservations",      ok: true  },
    { label: "Check-in / out",    ok: true  },
    { label: "Finances",          ok: false },
    { label: "Gestion personnel", ok: false },
    { label: "Paramètres",        ok: false },
  ],
  housekeeper: [
    { label: "Tableau de bord",   ok: false },
    { label: "Réservations",      ok: false },
    { label: "Tâches ménage",     ok: true  },
    { label: "Statuts chambres",  ok: true  },
    { label: "Gestion personnel", ok: false },
    { label: "Paramètres",        ok: false },
  ],
};

function KPIBox({ icon, label, value, color, bg }: { icon: string; label: string; value: number; color: string; bg: string }) {
  return (
    <div className="bg-surface border border-border rounded-[18px] p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl inline-grid place-items-center shrink-0" style={{ background: bg }}>
        <Icon name={icon} size={20} color={color} />
      </div>
      <div>
        <div className="font-extrabold text-[28px] tracking-[-0.03em] leading-none">{value}</div>
        <div className="text-[12px] text-ink-3 mt-0.5">{label}</div>
      </div>
    </div>
  );
}
