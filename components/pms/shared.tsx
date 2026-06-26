"use client";
import React from "react";
import { Icon } from "@/components/inscription/ui/Icon";
import { STATUS_CONFIG, type RoomStatus } from "./data";

export { Icon };

/* ─── StatusPill ─── */
export function StatusPill({ status }: { status: RoomStatus }) {
  const conf = STATUS_CONFIG[status];
  return (
    <span
      className={"pill dot status-" + status}
      style={{ background: conf.bg, color: conf.color }}
    >
      {conf.label}
    </span>
  );
}

/* ─── BookingStatusPill ─── */
const BOOKING_STATUS_MAP: Record<string, { label: string; kind: string }> = {
  pending:      { label: "En attente",  kind: "warn" },
  confirmed:    { label: "Confirmée",   kind: "primary" },
  "checked-in": { label: "Sur place",   kind: "success" },
  "checking-out":{ label: "Départ",     kind: "amber" },
  completed:    { label: "Terminée",    kind: "" },
  cancelled:    { label: "Annulée",     kind: "danger" },
};
export function BookingStatusPill({ status }: { status: string }) {
  const c = BOOKING_STATUS_MAP[status] ?? { label: status, kind: "" };
  return <span className={"pill " + c.kind + " dot"}>{c.label}</span>;
}

/* ─── PayBadge ─── */
const PAY_MAP: Record<string, { label: string; cls: string }> = {
  wave: { label: "Wave", cls: "pay-wave" },
  om:   { label: "OM",   cls: "pay-om"   },
  mtn:  { label: "MTN",  cls: "pay-mtn"  },
  card: { label: "CB",   cls: "pay-card" },
  cash: { label: "ESP",  cls: "pay-cash" },
};
export function PayBadge({ method }: { method: string }) {
  const c = PAY_MAP[method];
  if (!c) return <span className="text-muted text-sm">—</span>;
  return <span className={"pay-icon " + c.cls}>{c.label}</span>;
}

/* ─── AppBadge ─── */
export function AppBadge({ size = "md", solid = false }: { size?: "sm" | "md"; solid?: boolean }) {
  return (
    <span
      className={"app-badge app-badge-" + size + (solid ? " solid" : "")}
      title="Via l'app Immo Plus"
    >
      <Icon name="smartphone" size={size === "sm" ? 9 : 10} />
      <span>App</span>
    </span>
  );
}

/* ─── SourceBadge ─── */
export function SourceBadge({ source }: { source: string }) {
  if (source === "App")  return <AppBadge />;
  if (source === "Corp") return <span className="src-badge src-corp"><Icon name="briefcase" size={10} /> Corp</span>;
  return <span className="src-badge src-direct"><Icon name="phone" size={10} /> Direct</span>;
}

/* ─── StarRating ─── */
export function StarRating({ value, size = 13, showValue = false, max = 5 }: { value: number; size?: number; showValue?: boolean; max?: number }) {
  return (
    <span className="star-rating">
      {Array.from({ length: max }).map((_, i) => (
        <Icon
          key={i}
          name={i < Math.round(value) ? "starFilled" : "star"}
          size={size}
          color={i < Math.round(value) ? "var(--amber)" : "var(--text-4)"}
        />
      ))}
      {showValue && (
        <span style={{ fontSize: size - 1, fontWeight: 600, marginLeft: 5 }}>
          {value.toFixed(1)}
        </span>
      )}
    </span>
  );
}

/* ─── SectionHead ─── */
export function SectionHead({
  icon, title, sub, right,
}: {
  icon?: string; title: string; sub?: string; right?: React.ReactNode;
}) {
  return (
    <div className="sec-head">
      <div className="sh-left">
        {icon && (
          <div className="sh-icon">
            <Icon name={icon} size={16} />
          </div>
        )}
        <div>
          <div className="sh-title">{title}</div>
          {sub && <div className="sh-sub">{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}

/* ─── Avatar ─── */
export function Avatar({ name, index, size = 32 }: { name: string; index: number; size?: number }) {
  const initials = name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
  const cls = "av av-" + ((index % 8) + 1);
  return (
    <div className={cls} style={{ width: size, height: size, fontSize: size * 0.35, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

/* ─── Pill ─── */
export function Pill({ kind = "", dot, children }: { kind?: string; dot?: boolean; children: React.ReactNode }) {
  return (
    <span className={"pill " + kind + (dot ? " dot" : "")}>{children}</span>
  );
}

/* ─── Donut chart ─── */
export function Donut({ data, centerValue, centerLabel }: {
  data: { label: string; value: number; color: string }[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const r = 62, c = 80, sw = 16;
  const circ = 2 * Math.PI * r;
  return (
    <div className="donut">
      <svg viewBox="0 0 160 160">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--bg-2)" strokeWidth={sw} />
        {data.map((d, i) => {
          const len = (d.value / total) * circ;
          const offset = cum;
          cum += len;
          return (
            <circle
              key={i} cx={c} cy={c} r={r} fill="none"
              stroke={d.color} strokeWidth={sw}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <div className="donut-text">
        <div className="dt-value">{centerValue}</div>
        <div className="dt-label">{centerLabel}</div>
      </div>
    </div>
  );
}

/* ─── Toast store (module-level singleton) ─── */
type Toast = { id: number; msg: string; icon: string; kind: string };
let _setToasts: ((t: Toast[]) => void) | null = null;
let _queue: Toast[] = [];

export function showToast(msg: string, icon = "check", kind = "success") {
  if (!_setToasts) return;
  const id = Date.now() + Math.random();
  _queue = [..._queue, { id, msg, icon, kind }];
  _setToasts([..._queue]);
  setTimeout(() => {
    _queue = _queue.filter(t => t.id !== id);
    _setToasts?.([..._queue]);
  }, 3500);
}

export function Toasts() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  React.useEffect(() => { _setToasts = setToasts; return () => { _setToasts = null; }; }, []);
  return (
    <div className="pms-toasts">
      {toasts.map(t => (
        <div key={t.id} className={"pms-toast " + t.kind}>
          <div
            className="t-icon"
            style={{
              background: t.kind === "success" ? "var(--success-bg)" : "var(--primary-50)",
              color: t.kind === "success" ? "var(--success)" : "var(--primary)",
            }}
          >
            <Icon name={t.icon} size={15} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{t.msg}</div>
        </div>
      ))}
    </div>
  );
}
