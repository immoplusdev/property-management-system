"use client";
import React, { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { Icon, Button, Skeleton, toastPromise } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { formatDate, type Guest } from "../data";
import { useGuests, useGuestDuplicates, useMergeGuests } from "@/lib/hooks/pms/useGuests";
import type { GuestDuplicateGroup } from "@/lib/api/pms/clients.actions";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { useHotel } from "@/lib/pms/HotelContext";
import { ExportAction } from "@/components/pms/ExportAction";

const avatarColor = (g: Guest) => AV_COLORS[(String(g.firstName ?? "?").charCodeAt(0) || 0) % AV_COLORS.length];
const fullName = (g: Pick<Guest, "firstName" | "lastName">) => `${g.firstName ?? ""} ${g.lastName ?? ""}`.trim() || "Client";
const initials = (g: Guest) => `${g.firstName?.[0] ?? ""}${g.lastName?.[0] ?? ""}`.toUpperCase() || "?";

export function Clients() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hotel = useHotel();

  const filter = searchParams.get("filter") ?? "all";
  const search = searchParams.get("q") ?? "";

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value || value === "all") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }
  const setFilter = (v: string) => updateParams({ filter: v });
  const setSearch = (v: string) => updateParams({ q: v });

  const { data, isLoading, error } = useGuests({ limit: 100 });
  const duplicatesQ = useGuestDuplicates();
  const allGuests: Guest[] = data?.data ?? [];

  const list = useMemo(() => {
    let res = allGuests;
    if (filter === "vip")  res = res.filter(c => c.type === "vip");
    if (filter === "corp") res = res.filter(c => c.type === "corporate" || !!c.corporateName);
    if (filter === "new")  res = res.filter(c => c.totalStays <= 1);
    if (search) res = res.filter(c =>
      fullName(c).toLowerCase().includes(search.toLowerCase()) ||
      String(c.email ?? "").toLowerCase().includes(search.toLowerCase())
    );
    return res;
  }, [allGuests, filter, search]);

  const vipCount  = allGuests.filter(c => c.type === "vip").length;
  const corpCount = allGuests.filter(c => !!c.corporateName).length;

  return (
    <div className="animate-pms-fade-up">
      <PMSHeader
        title="Clients"
        sub={
          isLoading
            ? "Chargement…"
            : `${allGuests.length} fiches clients · ${vipCount} VIP · ${corpCount} comptes corporate`
        }
        actions={
          <>
            <ExportAction dataset="guests" label="Export CRM" />
          </>
        }
      />

      {duplicatesQ.isError ? <div role="alert" className="mb-3 text-sm text-danger">Doublons : {(duplicatesQ.error as Error).message}</div> : duplicatesQ.data?.total ? (
        <div className="mb-3.5 p-4 border border-amber/40 rounded-xl bg-amber/5">
          <strong className="text-sm">{duplicatesQ.data.total} groupe{duplicatesQ.data.total > 1 ? "s" : ""} de doublons possibles</strong>
          <div className="grid gap-2 mt-2">{duplicatesQ.data.data.map(group => <DuplicateGroupCard key={`${group.matchType}:${group.value}`} group={group} onOpen={id => router.push(`/pms/${hotel}/clients/${id}`)} />)}</div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-surface border border-border rounded-[18px] p-3.5 mb-3.5">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="h-9.5 w-80 bg-surface border border-border rounded-[10px] px-3 flex items-center gap-2 focus-within:border-ink-3">
            <Icon name="eye" size={14} color="var(--color-ink-3)" />
            <input
              className="flex-1 border-0 outline-none bg-transparent text-[13px] text-ink placeholder:text-ink-4"
              placeholder="Nom, email, téléphone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ChipGroup>
            {([
              ["all",  "Tous",      allGuests.length],
              ["vip",  "VIP",       vipCount],
              ["corp", "Corporate", corpCount],
              ["new",  "Nouveaux",  allGuests.filter(c => c.totalStays <= 1).length],
            ] as [string, string, number][]).map(([id, label, count]) => (
              <Chip key={id} label={label} count={count} active={filter === id} onClick={() => setFilter(id)} />
            ))}
          </ChipGroup>
        </div>
      </div>

      {/* Card grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : error ? (
        <div role="alert" className="py-12 text-center text-sm text-danger">Impossible de charger les clients : {(error as Error).message}</div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {list.map(c => (
            <ClientCard key={c.id} client={c} onClick={() => router.push(`/pms/${hotel}/clients/${c.id}`)} />
          ))}
        </div>
      )}
    </div>
  );
}

function DuplicateGroupCard({ group, onOpen }: { group: GuestDuplicateGroup; onOpen: (id: string) => void }) {
  const [primaryId, setPrimaryId] = React.useState(group.guests[0]?.id ?? "");
  const [duplicateId, setDuplicateId] = React.useState(group.guests[1]?.id ?? "");
  const [reason, setReason] = React.useState("Doublon vérifié par la réception");
  const merge = useMergeGuests();
  const primary = group.guests.find(guest => guest.id === primaryId);
  const duplicate = group.guests.find(guest => guest.id === duplicateId);

  async function submit() {
    if (!primary || !duplicate || primary.id === duplicate.id || reason.trim().length < 3) return;
    if (!window.confirm(`Fusionner ${fullName(duplicate)} dans ${fullName(primary)} ? La fiche ${fullName(duplicate)} sera archivée.`)) return;
    try {
      await toastPromise(merge.mutateAsync({ primaryGuestId: primary.id, duplicateGuestId: duplicate.id, reason: reason.trim() }), {
        loading: "Fusion des fiches…", success: "Fiches fusionnées", error: error => (error as Error).message,
      });
    } catch { /* toast déjà affiché */ }
  }

  return <div className="p-3 border border-border rounded-lg bg-surface text-xs text-ink-2">
    <div className="mb-2">{group.matchType === "phone" ? "Téléphone" : "Email"} {group.value} : {group.guests.map((guest, index) => <React.Fragment key={guest.id}>{index > 0 && " · "}<button className="text-primary underline" onClick={() => onOpen(guest.id)}>{fullName(guest)}</button></React.Fragment>)}</div>
    <div className="flex flex-wrap items-end gap-2">
      <label className="grid gap-1">Fiche conservée<select aria-label="Fiche conservée" className="border border-border rounded-md p-1.5 bg-surface" value={primaryId} onChange={e => setPrimaryId(e.target.value)}>{group.guests.map(guest => <option key={guest.id} value={guest.id}>{fullName(guest)} · {guest.id.slice(0, 8)}</option>)}</select></label>
      <label className="grid gap-1">Fiche archivée<select aria-label="Fiche archivée" className="border border-border rounded-md p-1.5 bg-surface" value={duplicateId} onChange={e => setDuplicateId(e.target.value)}>{group.guests.map(guest => <option key={guest.id} value={guest.id}>{fullName(guest)} · {guest.id.slice(0, 8)}</option>)}</select></label>
      <label className="grid gap-1 flex-1 min-w-48">Motif<input aria-label="Motif de fusion" className="border border-border rounded-md p-1.5 bg-surface" value={reason} onChange={e => setReason(e.target.value)} /></label>
      <Button variant="primary" size="sm" disabled={merge.isPending || !primaryId || !duplicateId || primaryId === duplicateId || reason.trim().length < 3} onClick={submit}>Fusionner</Button>
    </div>
  </div>;
}

function ClientCard({ client, onClick }: { client: Guest; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left bg-surface border border-border rounded-[18px] p-4.5 cursor-pointer hover:border-ink-3 transition-colors duration-120"
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-full inline-grid place-items-center text-white font-semibold text-[16px] shrink-0"
          style={{ background: avatarColor(client) }}
        >
          {initials(client)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="font-bold text-[14px]">{fullName(client)}</div>
            {client.type === "vip" && (
              <span className="inline-flex items-center gap-0.75 text-white text-[10px] font-bold px-1.75 py-0.5 rounded-full bg-amber">
                <Icon name="star" size={10} /> VIP
              </span>
            )}
            {client.isBlacklisted && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                Blacklist
              </span>
            )}
          </div>
          <div className="text-[11.5px] text-ink-3 mt-0.5">
            {client.corporateName
              ? <span className="inline-flex items-center gap-1"><Icon name="briefcase" size={10} /> {client.corporateName}</span>
              : <>{client.nationality}</>}
          </div>
        </div>
        <Icon name="chevronRight" size={16} color="var(--color-ink-3)" />
      </div>

      <div className="grid grid-cols-3 gap-2.5 mt-3.5 pt-3.5 border-t border-border">
        <div>
          <div className="text-[11px] text-ink-3">Séjours</div>
          <div className="font-bold text-[15px]">{client.totalStays}</div>
        </div>
        <div>
          <div className="text-[11px] text-ink-3">Total dépensé</div>
          <div className="font-bold text-[13px] text-primary">{(client.totalSpent / 1000).toFixed(0)}k</div>
        </div>
        <div>
          <div className="text-[11px] text-ink-3">Dernier séjour</div>
          <div className="font-semibold text-[12px]">{client.lastStay ? formatDate(client.lastStay) : "—"}</div>
        </div>
      </div>
    </button>
  );
}

