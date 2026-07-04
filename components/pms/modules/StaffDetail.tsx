"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { Icon, Button, Skeleton, toastPromise, showToast } from "../shared";
import { Pill } from "@/components/ui/Pill";
import { useRevokeStaff } from "@/lib/hooks/pms/useStaff";
import type { StaffMember, StaffRole } from "@/lib/api/pms/staff.actions";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { useHotel } from "@/lib/pms/HotelContext";

const ROLE_CONFIG: Record<StaffRole, { label: string; color: string; bg: string }> = {
  director:     { label: "Directeur",      color: "var(--color-primary)", bg: "var(--color-primary-50)"  },
  receptionist: { label: "Réceptionniste", color: "var(--color-teal)",    bg: "var(--color-teal-bg)"     },
  housekeeper:  { label: "Ménage",         color: "var(--color-violet)",  bg: "var(--color-violet-bg)"   },
};

export function StaffDetail({ member }: { member: StaffMember }) {
  const router = useRouter();
  const hotel = useHotel();
  const revokeM = useRevokeStaff();
  const rc = ROLE_CONFIG[member.role];
  const name = `${member.user.firstName} ${member.user.lastName}`;
  const initials = `${member.user.firstName[0] ?? ""}${member.user.lastName[0] ?? ""}`.toUpperCase();

  async function handleRevoke() {
    if (!confirm(`Révoquer l'accès de ${name} ? Cette action est irréversible.`)) return;
    try {
      await toastPromise(revokeM.mutateAsync(member.id), {
        loading: "Révocation…",
        success: `Accès révoqué pour ${name}`,
        error: (e) => (e as Error)?.message || "Erreur lors de la révocation",
      });
      router.push(`/pms/${hotel}/staff`);
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="animate-pms-fade-up">
      <Link href={`/pms/${hotel}/staff`} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink mb-3">
        <Icon name="arrowLeft" size={12} /> Personnel
      </Link>

      <PMSHeader
        title={name}
        sub={member.user.email}
        search={false}
        actions={
          <>
            {member.status === "pending" && (
              <Button variant="ghost" size="sm" onClick={() => showToast("Invitation renvoyée", "check")}>
                <Icon name="send" size={13} /> Renvoyer l&apos;invitation
              </Button>
            )}
            {member.role !== "director" && (
              <Button variant="ghost" size="sm" onClick={handleRevoke} disabled={revokeM.isPending}>
                <Icon name="trash" size={13} /> {revokeM.isPending ? "Révocation…" : "Révoquer l'accès"}
              </Button>
            )}
          </>
        }
      />

      <div className="bg-surface border border-border rounded-[18px] p-5.5 max-w-[560px]">
        <div className="flex items-center gap-3.5 mb-5">
          <div
            className="w-14 h-14 rounded-full inline-grid place-items-center text-white font-bold text-[18px] shrink-0"
            style={{ background: AV_COLORS[member.id.charCodeAt(1) % AV_COLORS.length] }}
          >
            {member.status === "pending" ? <Icon name="mail" size={18} /> : initials}
          </div>
          <div>
            <div className="font-bold text-[16px]">{name}</div>
            <span
              className="inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-semibold mt-1"
              style={{ background: rc.bg, color: rc.color }}
            >
              {rc.label}
            </span>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
            <span className="text-ink-3 text-[13px]">Statut</span>
            {member.status === "active"  && <Pill kind="success" dot>Actif</Pill>}
            {member.status === "pending" && <Pill kind="warn" dot>En attente</Pill>}
            {member.status === "revoked" && <Pill kind="danger" dot>Révoqué</Pill>}
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
            <span className="text-ink-3 text-[13px]">Email</span>
            <strong className="text-[13px]">{member.user.email}</strong>
          </div>
          {member.user.phone && (
            <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
              <span className="text-ink-3 text-[13px]">Téléphone</span>
              <strong className="text-[13px]">{member.user.phone}</strong>
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
            <span className="text-ink-3 text-[13px]">Invité le</span>
            <strong>{new Date(member.invitedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
