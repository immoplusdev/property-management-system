"use client";
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
  const occupied = ROOMS_PMS.filter(r => r.status === "occupee" || r.status === "depart").length;
  const occupancy = Math.round((occupied / ROOMS_PMS.length) * 100);

  return (
    <aside className="pms-side">
      <div className="brand">
        <div className="brand-mark accent">i+</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="brand-name">
            Immo Plus<span className="brand-pms-tag">PMS</span>
          </div>
          <div className="brand-sub">Résidence Lagune Bleue</div>
        </div>
      </div>

      <div className="nav-section">Opérations</div>
      {NAV.filter(n => n.section === "main").map(n => {
        const isActive = active === n.id;
        return (
          <button
            key={n.id}
            className={"nav-item" + (isActive ? " active" : "")}
            onClick={() => setActive(n.id)}
          >
            <Icon name={n.icon} size={16} stroke={isActive ? 2.5 : 1.6} />
            <span>{n.label}</span>
            {n.fromApp && <span className="nav-app-dot" title="Flux depuis l'app Immo Plus" />}
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </button>
        );
      })}

      <div className="occ-card">
        <div className="occ-label">Occupation</div>
        <div className="occ-value">{occupancy}%</div>
        <div className="occ-bar">
          <div style={{ width: occupancy + "%" }} />
        </div>
        <div className="occ-detail">{occupied} / {ROOMS_PMS.length} chambres · objectif 75%</div>
      </div>

      <div className="nav-section">Gestion</div>
      {NAV.filter(n => n.section === "manage").map(n => {
        const isActive = active === n.id;
        return (
          <button
            key={n.id}
            className={"nav-item" + (isActive ? " active" : "")}
            onClick={() => setActive(n.id)}
          >
            <Icon name={n.icon} size={16} stroke={isActive ? 2.5 : 1.6} />
            <span>{n.label}</span>
            {n.fromApp && <span className="nav-app-dot" title="Flux depuis l'app Immo Plus" />}
            {n.badge && <span className="nav-badge">{n.badge}</span>}
          </button>
        );
      })}

      <div className="user-pill">
        <div className="av av-1">AD</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name">Aïcha Diabaté</div>
          <div className="user-role">Réception · Quart jour</div>
        </div>
        <Icon name="chevronRight" size={14} color="var(--text-3)" />
      </div>
    </aside>
  );
}
