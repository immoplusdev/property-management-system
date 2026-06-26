"use client";
import React from "react";
import {
  Add, ArrowDown2, ArrowLeft, ArrowLeft2, ArrowRight, ArrowRight2,
  ArrowUp2, Award, Briefcase, Building, Calendar, Call,
  Camera, Card, Clock, CloseCircle, DocumentDownload,
  DocumentText1, DocumentUpload, Edit2, Eye, Facebook,
  Flag, Gallery, Grid2, Home, Image, InfoCircle, Instagram,
  Layer, Location, Lock, MagicStar, Menu, Moneys, Notification,
  Pet, Profile2User, Send, Setting2, Shield, Sms, Star1,
  TickSquare, Trash, TrendUp, Tree, User, Video, WeightMeter, Wifi,
} from "iconsax-react";
/* ── Iconsax mapping ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICONSAX: Record<string, React.ComponentType<any>> = {
  check:        TickSquare,
  chevronRight: ArrowRight2,
  chevronLeft:  ArrowLeft2,
  chevronDown:  ArrowDown2,
  chevronUp:    ArrowUp2,
  arrowRight:   ArrowRight,
  arrowLeft:    ArrowLeft,
  plus:         Add,
  x:            CloseCircle,
  upload:       DocumentUpload,
  image:        Image,
  gallery:      Gallery,
  video:        Video,
  camera:       Camera,
  user:         User,
  users:        Profile2User,
  phone:        Call,
  mail:         Sms,
  lock:         Lock,
  building:     Building,
  star:         Star1,
  starFilled:   Star1,       // rendered with variant="Bold"
  mapPin:       Location,
  pin:          Location,
  home:         Home,
  wifi:         Wifi,
  shield:       Shield,
  sparkles:     MagicStar,
  briefcase:    Briefcase,
  creditCard:   Card,
  edit:         Edit2,
  trash:        Trash,
  eye:          Eye,
  bell:         Notification,
  info:         InfoCircle,
  fileText:     DocumentText1,
  calendar:     Calendar,
  clock:        Clock,
  moneyBill:    Moneys,
  trendingUp:   TrendUp,
  paw:          Pet,
  download:     DocumentDownload,
  send:         Send,
  award:        Award,
  layers:       Layer,
  list:         Menu,
  instagram:    Instagram,
  facebook:     Facebook,
  palmtree:     Tree,
  dumbbell:     WeightMeter,
  grid:         Grid2,
  settings:     Setting2,
  flag:         Flag,
};

/* ── Custom SVG paths for icons absent from Iconsax ── */
const CUSTOM: Record<string, React.ReactNode> = {
  barChart: (
    <>
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="16" />
    </>
  ),
  pieChart: (
    <>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </>
  ),
  refresh: (
    <>
      <polyline points="23 4 23 10 17 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </>
  ),
  car: (
    <>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5"  cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </>
  ),
  droplet: <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />,
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
  bed: (
    <>
      <path d="M2 4v16" />
      <path d="M22 12H2" />
      <path d="M22 20V12" />
      <path d="M2 12c0-3 1-5 4-5h12c3 0 4 2 4 5" />
      <path d="M6 12V9" />
    </>
  ),
  utensils: (
    <>
      <path d="M3 2v7c0 1.1.9 2 2 2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </>
  ),
  waves: (
    <>
      <path d="M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
      <path d="M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
      <path d="M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  smoke: (
    <>
      <path d="M2 12h18" />
      <path d="M2 8h14" />
      <path d="M2 16h12" />
      <circle cx="21" cy="12" r="1" />
    </>
  ),
  baby: (
    <>
      <path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      <path d="M9 11a3 3 0 0 0 6 0" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </>
  ),
  chefHat: (
    <>
      <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </>
  ),
  martini: (
    <>
      <path d="M8 22h8" />
      <path d="M12 11v11" />
      <path d="M19 3H5l3 8h8l3-8z" />
    </>
  ),
  dumbbell: (
    <>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M3 8v8" />
      <path d="M21 8v8" />
      <path d="M6 12h12" />
    </>
  ),
};

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  stroke?: number;
  style?: React.CSSProperties;
  className?: string;
}

export function Icon({ name, size = 18, color, stroke = 1.7, style, className }: IconProps) {
  const clr = color ?? "currentColor";
  const variant = name === "starFilled" ? "Bold" : stroke >= 2.5 ? "Bold" : "Linear";

  const IsxComp = ICONSAX[name];
  if (IsxComp) {
    return (
      <span
        style={{ display: "inline-flex", width: size, height: size, flexShrink: 0, ...style }}
        className={className}
      >
        <IsxComp variant={variant} color={clr} size={size} />
      </span>
    );
  }

  /* Fallback: custom SVG */
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={clr}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: size, height: size, flexShrink: 0, ...style }}
      className={className}
    >
      {CUSTOM[name] ?? null}
    </svg>
  );
}
