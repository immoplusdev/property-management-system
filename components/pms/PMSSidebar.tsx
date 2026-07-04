"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Logo } from "@/components/Logo";
import { Icon } from "./shared";
import { logout } from "@/lib/api/auth/auth.actions";
import { useRooms } from "@/lib/hooks/pms/useRooms";
import type { UserDto } from "@/lib/api/generated/model";
import { usePmsStatus } from "@/lib/pms/PmsStatusContext";
import { useHotel } from "@/lib/pms/HotelContext";

export const NAV = [
  { id: "dashboard",    icon: "home",      label: "Tableau de bord",      badge: null,  section: "main",   fromApp: false },
  { id: "rooms",        icon: "bed",       label: "Chambres",              badge: "35",  section: "main",   fromApp: false },
  { id: "reservations", icon: "calendar",  label: "Réservations",          badge: "14",  section: "main",   fromApp: false },
  { id: "checkin",      icon: "fileText",  label: "Check-in",               badge: "5",   section: "main",   fromApp: false },
  { id: "checkout",     icon: "arrowRight",label: "Check-out",              badge: "3",   section: "main",   fromApp: false },
  { id: "requests",     icon: "bell",      label: "Demandes clients",       badge: "3",   section: "main",   fromApp: true  },
  { id: "planning",     icon: "grid",      label: "Planning",               badge: null,  section: "main",   fromApp: false },
  { id: "finances",     icon: "moneyBill", label: "Finances",               badge: null,  section: "manage", fromApp: false },
  { id: "clients",      icon: "users",     label: "Clients",                badge: null,  section: "manage", fromApp: false },
  { id: "reviews",      icon: "star",      label: "Avis clients",           badge: "2",   section: "manage", fromApp: true  },
  { id: "staff",        icon: "users",     label: "Personnel",              badge: null,  section: "manage", fromApp: false },
  { id: "settings",     icon: "settings",  label: "Paramètres",             badge: null,  section: "manage", fromApp: false },
] as const;

export type NavId = typeof NAV[number]["id"];

interface Props {
  user: UserDto | null;
  hotelName: string;
}

export function PMSSidebar({ user, hotelName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const hotel = useHotel();
  const active = (pathname.split("/")[3] ?? "dashboard") as NavId;
  const { hasBanner } = usePmsStatus();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: roomsData } = useRooms();
  const rooms    = roomsData?.rooms ?? [];
  const occupied = rooms.filter(r => r.status === "occupied" || r.status === "departure").length;
  const total    = rooms.length || 1;
  const occupancy = Math.round((occupied / total) * 100);

  async function handleLogout() {
    setLoggingOut(true);
    await logout();
    router.push("/");
    router.refresh();
  }

  const renderNav = (section: "main" | "manage") =>
    NAV.filter(n => n.section === section).map(n => {
      const isActive = active === n.id;
      return (
        <Link
          key={n.id}
          href={`/pms/${hotel}/${n.id}`}
          className={cn(
            "flex items-center gap-2.5 py-2.5 rounded-full text-[13px] font-medium cursor-pointer transition-all duration-[150ms] relative whitespace-nowrap border-none text-left w-full",
            collapsed ? "justify-center px-2.5" : "px-3.5",
            isActive
              ? "bg-primary text-white"
              : "bg-transparent text-ink-2 hover:bg-(--primary-soft) hover:text-primary"
          )}
          title={collapsed ? n.label : undefined}
        >
          <Icon name={n.icon} size={16} stroke={isActive ? 2.5 : 1.6} />
          {!collapsed && <span className="overflow-hidden text-ellipsis flex-1 min-w-0">{n.label}</span>}
          {!collapsed && n.fromApp && (
            <span
              className={cn("w-1.5 h-1.5 rounded-full ml-auto", isActive ? "bg-white" : "bg-primary")}
              title="Flux depuis l'app Immo Plus"
            />
          )}
          {!collapsed && n.badge && (
            <span className={cn(
              "ml-auto text-[10.5px] font-semibold px-1.75 py-px rounded-full min-w-[20px] text-center",
              isActive ? "bg-white/20 text-white" : "bg-surface-2 text-ink-2"
            )}>
              {n.badge}
            </span>
          )}
          {collapsed && n.badge && (
            <span className={cn(
              "absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2",
              isActive ? "bg-white border-primary" : "bg-primary border-surface"
            )} />
          )}
        </Link>
      );
    });

  return (
    <aside className={cn(
      "group/side sticky bg-surface border-r border-border flex flex-col overflow-visible shrink-0 transition-[width] duration-220 ease-in-out",
      hasBanner ? "top-11 h-[calc(100dvh-2.75rem)]" : "top-0 h-screen",
      collapsed ? "w-[68px]" : "w-[280px]"
    )}>

      {/* ── Toggle notch ── */}
      <button
        className={cn(
          "absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 rounded-full bg-surface border border-border",
          "grid place-items-center cursor-pointer z-20 text-ink-3 transition-all duration-150",
          "opacity-0 pointer-events-none",
          "group-hover/side:opacity-100 group-hover/side:pointer-events-auto",
          collapsed && "opacity-100 pointer-events-auto"
        )}
        style={{ boxShadow: "0 2px 8px rgba(18,19,26,0.10), 0 0 0 1px rgba(18,19,26,0.04)" }}
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? "Agrandir la barre latérale" : "Réduire"}
        aria-label={collapsed ? "Agrandir" : "Réduire"}
        onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={e => { if (!collapsed) e.currentTarget.style.opacity = "0"; }}
      >
        <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={12} />
      </button>

      {/* ── Scrollable content ── */}
      <div className={cn(
        "flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pt-5.5 pb-3.5",
        collapsed ? "px-2" : "px-3.5"
      )}>

        {/* Brand */}
        <div className={cn(
          "flex items-center pb-4.5 border-b border-border mb-3.5",
          collapsed ? "justify-center gap-0 px-0" : "gap-3 px-2.5"
        )}>
          <div className="shrink-0">
            <Logo size="sm" showHover={false} />
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="font-semibold tracking-[-0.02em] text-[14.5px] text-ink flex items-center gap-1.5 whitespace-nowrap">
                Immo Plus
                <span className="inline-block text-[9px] font-semibold tracking-[0.08em] uppercase text-ink-3 bg-surface-2 px-1.5 py-px rounded-[4px] leading-none">
                  PMS
                </span>
              </div>
              <div className="text-[11.5px] text-ink-3 mt-0.5">{hotelName}</div>
            </div>
          )}
        </div>

        {/* Opérations */}
        {!collapsed
          ? <div className="text-[10.5px] uppercase tracking-[0.10em] font-semibold text-ink-4 px-3 pt-1 pb-1.5">Opérations</div>
          : <div className="h-2.5" />
        }
        {renderNav("main")}

        {/* Occupation */}
        {!collapsed ? (
          <div className="mx-1 mt-3.5 mb-2 p-3.5 pb-3 rounded-[12px] bg-surface-2 border border-border">
            <div className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-ink-3">Occupation</div>
            <div className="text-[28px] font-semibold text-ink tracking-[-0.035em] mt-1.5 leading-none">{occupancy}%</div>
            <div className="mt-3 h-[3px] bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: occupancy + "%" }} />
            </div>
            <div className="text-[11px] text-ink-3 mt-[9px]">{occupied} / {total} chambres · objectif 75%</div>
          </div>
        ) : (
          <div
            title={`Occupation : ${occupancy}% (${occupied}/${total} chambres)`}
            className="my-1.5 py-2 text-center text-[11px] font-extrabold text-primary bg-primary-50 rounded-[10px] cursor-default tracking-[-0.01em]"
          >
            {occupancy}%
          </div>
        )}

        {/* Gestion */}
        {!collapsed
          ? <div className="text-[10.5px] uppercase tracking-[0.10em] font-semibold text-ink-4 px-3 pt-1 pb-1.5">Gestion</div>
          : <div className="h-1.5" />
        }
        {renderNav("manage")}

        {/* User + logout */}
        {(() => {
          const firstName = user?.firstName ?? "";
          const lastName  = user?.lastName  ?? "";
          const initials  = firstName && lastName
            ? `${firstName[0]}${lastName[0]}`.toUpperCase()
            : (firstName || lastName || "?")[0]?.toUpperCase() ?? "?";
          const displayName = firstName || lastName
            ? `${firstName} ${lastName}`.trim()
            : "Utilisateur";

          return (
            <div
              className={cn(
                "mt-auto flex items-center gap-2.5 px-2 pt-3.5 border-t border-border",
                collapsed && "justify-center flex-col gap-1.5"
              )}
              title={collapsed ? displayName : undefined}
            >
              <div
                className="w-8 h-8 rounded-full inline-grid place-items-center text-white font-semibold text-[11.5px] shrink-0 bg-primary"
              >
                {initials}
              </div>
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ink truncate">{displayName}</div>
                    <div className="text-[11px] text-ink-3 mt-px truncate">{user?.email ?? ""}</div>
                  </div>
                </>
              )}
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                title="Se déconnecter"
                aria-label="Se déconnecter"
                className={cn(
                  "w-7 h-7 rounded-[7px] grid place-items-center text-ink-3 transition-[color,background] shrink-0",
                  "hover:bg-danger/10 hover:text-danger disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          );
        })()}

      </div>
    </aside>
  );
}
