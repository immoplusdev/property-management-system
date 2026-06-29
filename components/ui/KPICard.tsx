import React from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "./Icon";

interface KPICardProps {
  label?: string;
  value: React.ReactNode;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  trendStyle?: React.CSSProperties;
  sub?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  iconSize?: number;
  iconNode?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  active?: boolean;
  children?: React.ReactNode;
}

export function KPICard({
  label, value, unit, trend, trendUp = true, trendStyle,
  sub, icon, iconBg, iconColor, iconSize = 18, iconNode,
  className, style, onClick, active, children,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-[18px] px-5.5 py-5 relative",
        onClick && "cursor-pointer",
        active && "border-primary bg-primary-50",
        className
      )}
      style={style}
      onClick={onClick}
    >
      {(icon || iconNode || trend) && (
        <div className="flex items-center justify-between mb-4">
          {(icon || iconNode) && (
            <div
              className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0"
              style={{ background: iconBg ?? "var(--color-surface-2)", color: iconColor ?? "var(--color-ink-2)" }}
            >
              {iconNode ?? <Icon name={icon!} size={iconSize} />}
            </div>
          )}
          {!icon && !iconNode && <div />}
          {trend && (
            <span
              className={cn(
                "text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-0.75",
                trendUp ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
              )}
              style={trendStyle}
            >
              {trend}
            </span>
          )}
          {active && <Icon name="check" size={16} color="var(--color-primary)" />}
        </div>
      )}
      {label && !icon && !iconNode && (
        <div className="flex items-center justify-between mb-4">
          <div className="text-[12.5px] text-ink-3 font-medium overflow-hidden text-ellipsis min-w-0 flex-1 whitespace-nowrap">
            {label}
          </div>
          {trend && (
            <span
              className={cn(
                "text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-0.75",
                trendUp ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
              )}
              style={trendStyle}
            >
              {trend}
            </span>
          )}
        </div>
      )}
      <div className="text-[34px] font-semibold tracking-[-0.035em] leading-none flex items-baseline gap-1 whitespace-nowrap">
        {value}
        {unit && <span className="text-[13px] font-medium text-ink-3 tracking-normal whitespace-nowrap">{unit}</span>}
      </div>
      {label && (icon || iconNode) && (
        <div className="text-[12.5px] text-ink-3 mt-1 font-medium">{label}</div>
      )}
      {sub && <div className="text-[12px] text-ink-3 mt-2.5">{sub}</div>}
      {children}
    </div>
  );
}
