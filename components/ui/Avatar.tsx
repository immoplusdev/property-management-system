import React from "react";

const AV_COLORS = [
  "#E89060", "#6FB5A8", "#7B8DFF", "#B57BE6",
  "#F5C572", "#6FCC92", "#FF8585", "#6FB5DD",
];

interface AvatarProps {
  name: string;
  index: number;
  size?: number;
}

export function Avatar({ name, index, size = 32 }: AvatarProps) {
  const initials = name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
  const bg = AV_COLORS[index % 8];
  return (
    <div
      role="img"
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
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
