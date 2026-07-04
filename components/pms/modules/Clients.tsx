"use client";
import React, { useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PMSHeader } from "../PMSHeader";
import { Icon, Button, Skeleton } from "../shared";
import { Chip, ChipGroup } from "@/components/ui/Chip";
import { formatDate, type Guest } from "../data";
import { useGuests } from "@/lib/hooks/pms/useGuests";
import { AV_COLORS } from "@/lib/utils/avatarColor";
import { useHotel } from "@/lib/pms/HotelContext";

const avatarColor = (g: Guest) => AV_COLORS[(g.firstName.charCodeAt(0) ?? 0) % AV_COLORS.length];
const fullName = (g: Guest) => `${g.firstName} ${g.lastName}`;
const initials = (g: Guest) => `${g.firstName[0] ?? ""}${g.lastName[0] ?? ""}`.toUpperCase();

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

  const { data, isLoading } = useGuests({ limit: 100 });
  const allGuests: Guest[] = data?.data ?? [];

  const list = useMemo(() => {
    let res = allGuests;
    if (filter === "vip")  res = res.filter(c => c.type === "vip");
    if (filter === "corp") res = res.filter(c => c.type === "corporate" || !!c.corporateName);
    if (filter === "new")  res = res.filter(c => c.totalStays <= 1);
    if (search) res = res.filter(c =>
      fullName(c).toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
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
            <Button variant="ghost" size="sm"><Icon name="download" size={14} /> Export CRM</Button>
            <Button variant="primary" size="sm"><Icon name="plus" size={14} /> Nouveau client</Button>
          </>
        }
      />

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

