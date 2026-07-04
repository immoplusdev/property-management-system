"use client";
import React, { useId, useState } from "react";

type Placement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  placement?: Placement;
  delay?: number;
}

function getPositionStyle(placement: Placement): React.CSSProperties {
  switch (placement) {
    case "top":    return { bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
    case "bottom": return { top:    "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)" };
    case "left":   return { right:  "calc(100% + 6px)", top:  "50%", transform: "translateY(-50%)" };
    case "right":  return { left:   "calc(100% + 6px)", top:  "50%", transform: "translateY(-50%)" };
  }
}

export function Tooltip({ content, children, placement = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 500,
    background: "var(--text)",
    color: "var(--surface)",
    borderRadius: 6,
    padding: "5px 10px",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    opacity: visible ? 1 : 0,
    transition: "opacity .12s ease",
    ...getPositionStyle(placement),
  };

  const cloned = React.cloneElement(children, {
    "aria-describedby": visible ? id : undefined,
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <span
      style={{ position: "relative", display: "inline-flex" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {cloned}
      <span role="tooltip" id={id} aria-hidden={!visible} style={tooltipStyle}>
        {content}
      </span>
    </span>
  );
}
