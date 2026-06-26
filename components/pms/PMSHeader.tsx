"use client";
import React from "react";
import { Icon } from "./shared";

interface PMSHeaderProps {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  search?: boolean;
}

export function PMSHeader({ title, sub, actions, search = true }: PMSHeaderProps) {
  return (
    <div className="pms-header">
      <div style={{ minWidth: 0 }}>
        <h1>{title}</h1>
        {sub && <div className="ph-sub">{sub}</div>}
      </div>
      <div className="ph-actions">
        {search && (
          <div className="search-bar">
            <Icon name="eye" size={14} color="var(--text-3)" />
            <input placeholder="Rechercher…" />
            <span className="kbd">⌘K</span>
          </div>
        )}
        {actions}
        <button className="btn-icon">
          <Icon name="bell" size={15} />
        </button>
      </div>
    </div>
  );
}
