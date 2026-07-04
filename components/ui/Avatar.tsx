import React from "react";
import { AV_COLORS } from "@/lib/utils/avatarColor";

interface AvatarProps {
  name: string;
  index: number;
  size?: number;
}

export function Avatar({ name, index, size = 32 }: AvatarProps) {
  const initials = name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
  const bg = AV_COLORS[index % AV_COLORS.length];
  return (
    <div
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "var(--color-surface)",
        display: "inline-grid",
        placeItems: "center",
        fontWeight: 600,
        fontSize: size * 0.35,
        flexShrink: 0,
      }}
    >
      <span aria-hidden="true">{initials}</span>
    </div>
  );
}
