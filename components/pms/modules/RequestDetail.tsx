"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { Pill, Icon, Button, toastPromise, showToast } from "../shared";
import { REQUEST_TYPES, formatDate } from "../data";
import { useUpdateRequestStatus } from "@/lib/hooks/pms/useRequests";
import type { AppRequest, RequestStatus } from "@/lib/api/pms/requests.actions";
import { useHotel } from "@/lib/pms/HotelContext";

const STATUS_META: Record<RequestStatus, { label: string; kind: string }> = {
  pending:     { label: "En attente", kind: "warn"    },
  in_progress: { label: "En cours",   kind: "primary" },
  completed:   { label: "Terminé",    kind: "success" },
  cancelled:   { label: "Annulée",    kind: "danger"  },
};

export function RequestDetail({ request }: { request: AppRequest }) {
  const router = useRouter();
  const hotel = useHotel();
  const updateStatus = useUpdateRequestStatus();
  const typeMeta = REQUEST_TYPES[request.type] ?? { label: request.type, icon: "list", color: "ink" };
  const statusMeta = STATUS_META[request.status] ?? { label: request.status, kind: "muted" };

  async function handleUpdateStatus(status: RequestStatus) {
    const labels: Record<string, string> = {
      in_progress: "prise en charge",
      completed:   "marquée terminée",
    };
    try {
      await toastPromise(updateStatus.mutateAsync({ id: request.id, payload: { status } }), {
        loading: "Mise à jour…",
        success: `Demande ${labels[status] ?? "mise à jour"}`,
        error: (e) => (e as Error)?.message || "Erreur lors de la mise à jour",
      });
    } catch { /* toast déjà affiché */ }
  }

  return (
    <div className="animate-pms-fade-up">
      <Link href={`/pms/${hotel}/requests`} className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 hover:text-ink mb-3">
        <Icon name="arrowLeft" size={12} /> Demandes clients
      </Link>

      <PMSHeader
        title={request.title}
        sub={`Ch. ${request.roomNumber} · ${request.guestName}`}
        search={false}
        actions={
          <>
            {request.status === "pending" && (
              <>
                <Button variant="ghost" size="sm" onClick={() => showToast("Message WhatsApp envoyé", "check")}>
                  <Icon name="send" size={13} /> WhatsApp client
                </Button>
                <Button variant="primary" size="sm" disabled={updateStatus.isPending} onClick={() => handleUpdateStatus("in_progress")}>
                  <Icon name="check" size={13} /> Prendre en charge
                </Button>
              </>
            )}
            {request.status === "in_progress" && (
              <Button variant="primary" size="sm" disabled={updateStatus.isPending} onClick={() => handleUpdateStatus("completed")}>
                <Icon name="check" size={13} /> Marquer terminé
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-2.5 mb-4">
        <Pill kind={statusMeta.kind as "warn" | "success" | "primary" | "danger" | "muted"}>{statusMeta.label}</Pill>
      </div>

      <div className="bg-surface border border-border rounded-[18px] p-5.5 max-w-[560px]">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11.5 h-11.5 rounded-xl shrink-0 grid place-items-center"
            style={{ background: `var(--color-${typeMeta.color}-bg, var(--color-primary-50))`, color: `var(--color-${typeMeta.color}, var(--color-primary))` }}
          >
            <Icon name={typeMeta.icon} size={22} />
          </div>
          <div>
            <div className="font-bold text-[15px]">{typeMeta.label}</div>
            <div className="text-[11.5px] text-ink-3">{request.id.slice(0, 8)}</div>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
            <span className="text-ink-3 text-[13px]">Chambre</span>
            <strong>{request.roomNumber}</strong>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
            <span className="text-ink-3 text-[13px]">Client</span>
            <strong>{request.guestName}</strong>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
            <span className="text-ink-3 text-[13px]">Reçue le</span>
            <strong>{formatDate(request.createdAt)}</strong>
          </div>
          {!!request.amount && request.amount > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border border-border rounded-[10px]">
              <span className="text-ink-3 text-[13px]">Montant</span>
              <strong style={{ color: "var(--color-primary)" }}>{request.amount.toLocaleString("fr-FR")} FCFA</strong>
            </div>
          )}
        </div>

        {request.description && (
          <div className="mt-4 p-3.5 bg-surface-2 rounded-[10px] text-[12.5px] text-ink-2 leading-normal">
            {request.description}
          </div>
        )}
      </div>
    </div>
  );
}
