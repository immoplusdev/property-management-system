"use client";
import React, { useState } from "react";
import { Icon } from "./shared";
import { ROOMS_PMS } from "./data";

export const NAV = [
  { id: "dashboard",    icon: "home",      label: "Tableau de bord",      badge: null,  section: "main",   fromApp: false },
  { id: "rooms",        icon: "bed",       label: "Chambres",              badge: "35",  section: "main",   fromApp: false },
  { id: "reservations", icon: "calendar",  label: "Réservations",          badge: "14",  section: "main",   fromApp: false },
  { id: "checkin",      icon: "fileText",  label: "Check-in / Check-out",  badge: "8",   section: "main",   fromApp: false },
  { id: "requests",     icon: "bell",      label: "Demandes clients",       badge: "3",   section: "main",   fromApp: true  },
  { id: "planning",     icon: "grid",      label: "Planning",               badge: null,  section: "main",   fromApp: false },
  { id: "finances",     icon: "moneyBill", label: "Finances",               badge: null,  section: "manage", fromApp: false },
  { id: "clients",      icon: "users",     label: "Clients",                badge: null,  section: "manage", fromApp: false },
  { id: "reviews",      icon: "star",      label: "Avis clients",           badge: "2",   section: "manage", fromApp: true  },
  { id: "settings",     icon: "settings",  label: "Paramètres",             badge: null,  section: "manage", fromApp: false },
] as const;

export type NavId = typeof NAV[number]["id"];

interface Props {
  active: NavId;
  setActive: (id: NavId) => void;
}

export function PMSSidebar({ active, setActive }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const occupied  = ROOMS_PMS.filter(r => r.status === "occupee" || r.status === "depart").length;
  const occupancy = Math.round((occupied / ROOMS_PMS.length) * 100);

  const renderNav = (section: "main" | "manage") =>
    NAV.filter(n => n.section === section).map(n => {
      const isActive = active === n.id;
      return (
        <button
          key={n.id}
          className={"nav-item" + (isActive ? " active" : "")}
          onClick={() => setActive(n.id)}
          title={collapsed ? n.label : undefined}
        >
          <Icon name={n.icon} size={16} stroke={isActive ? 2.5 : 1.6} />
          {!collapsed && <span>{n.label}</span>}
          {!collapsed && n.fromApp && <span className="nav-app-dot" title="Flux depuis l'app Immo Plus" />}
          {!collapsed && n.badge  && <span className="nav-badge">{n.badge}</span>}
          {collapsed   && n.badge  && <span className="nav-badge-dot" />}
        </button>
      );
    });

  return (
    <aside className={"pms-side" + (collapsed ? " collapsed" : "")}>

      {/* ── Toggle notch ── */}
      <button
        className="side-toggle"
        onClick={() => setCollapsed(c => !c)}
        title={collapsed ? "Agrandir la barre latérale" : "Réduire"}
        aria-label={collapsed ? "Agrandir" : "Réduire"}
      >
        <Icon name={collapsed ? "chevronRight" : "chevronLeft"} size={12} />
      </button>

      {/* ── Scrollable content ── */}
      <div className="pms-side-inner">

        {/* Brand */}
        <div className="brand">
          <img
            src="/logo-immoplus.png"
            alt="Immo Plus"
            style={{ width: 36, height: 36, borderRadius: 10, objectFit: "contain", display: "block", flexShrink: 0 }}
          />
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="brand-name">
                Immo Plus<span className="brand-pms-tag">PMS</span>
              </div>
              <div className="brand-sub">Résidence Lagune Bleue</div>
            </div>
          )}
        </div>

        {/* Opérations */}
        {!collapsed && <div className="nav-section">Opérations</div>}
        {collapsed   && <div style={{ height: 10 }} />}
        {renderNav("main")}

        {/* Occupation */}
        {!collapsed ? (
          <div className="occ-card">
            <div className="occ-label">Occupation</div>
            <div className="occ-value">{occupancy}%</div>
            <div className="occ-bar"><div style={{ width: occupancy + "%" }} /></div>
            <div className="occ-detail">{occupied} / {ROOMS_PMS.length} chambres · objectif 75%</div>
          </div>
        ) : (
          <div
            title={`Occupation : ${occupancy}% (${occupied}/${ROOMS_PMS.length} chambres)`}
            style={{
              margin: "6px 0",
              padding: "8px 0",
              textAlign: "center",
              fontSize: 11,
              fontWeight: 800,
              color: "var(--primary)",
              background: "var(--primary-50)",
              borderRadius: 10,
              cursor: "default",
              letterSpacing: "-0.01em",
            }}
          >
            {occupancy}%
          </div>
        )}

        {/* Gestion */}
        {!collapsed && <div className="nav-section">Gestion</div>}
        {collapsed   && <div style={{ height: 6 }} />}
        {renderNav("manage")}

        {/* User */}
        <div className="user-pill" title={collapsed ? "Aïcha Diabaté · Réception" : undefined}>
          <div className="av av-1">AD</div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name">Aïcha Diabaté</div>
                <div className="user-role">Réception · Quart jour</div>
              </div>
              <Icon name="chevronRight" size={14} color="var(--text-3)" />
            </>
          )}
        </div>

      </div>
    </aside>
  );
}
