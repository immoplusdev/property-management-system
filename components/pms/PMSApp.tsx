"use client";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { PMSSidebar, type NavId } from "./PMSSidebar";
import { ToastProvider } from "./shared";
import type { UserDto } from "@/lib/api/generated/model";

type GoProps = { go: (id: NavId) => void };

const Dashboard    = lazy<React.FC<GoProps>>(() => import("./Dashboard").then(m => ({ default: m.Dashboard })));
const Reservations = lazy<React.FC<GoProps>>(() => import("./modules/Reservations").then(m => ({ default: m.Reservations })));
const CheckIn      = lazy<React.FC<GoProps>>(() => import("./modules/CheckIn").then(m => ({ default: m.CheckIn })));
const Rooms        = lazy<React.FC>(() => import("./modules/Rooms").then(m => ({ default: m.Rooms })));
const Requests     = lazy<React.FC>(() => import("./modules/Requests").then(m => ({ default: m.Requests })));
const Planning     = lazy<React.FC>(() => import("./modules/Planning").then(m => ({ default: m.Planning })));
const Finances     = lazy<React.FC>(() => import("./modules/Finances").then(m => ({ default: m.Finances })));
const Clients      = lazy<React.FC>(() => import("./modules/Clients").then(m => ({ default: m.Clients })));
const Reviews      = lazy<React.FC>(() => import("./modules/Reviews").then(m => ({ default: m.Reviews })));
const Settings     = lazy<React.FC>(() => import("./modules/Settings").then(m => ({ default: m.Settings })));

function ModuleFallback() {
  return (
    <div className="py-10 text-center text-ink-3 text-[13px]">
      Chargement…
    </div>
  );
}

export function PMSApp({ user }: { user: UserDto | null }) {
  const [active, setActive] = useState<NavId>("dashboard");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  const go = (id: NavId) => setActive(id);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface text-ink font-sans antialiased tracking-[-0.006em] font-features-['ss01','cv11']">
        <PMSSidebar active={active} setActive={setActive} user={user} />
        <main className="flex-1 min-w-0 px-9 pt-7 pb-15">
          <Suspense fallback={<ModuleFallback />}>
            {active === "dashboard"    && <Dashboard go={go} />}
            {active === "rooms"        && <Rooms />}
            {active === "reservations" && <Reservations go={go} />}
            {active === "checkin"      && <CheckIn go={go} />}
            {active === "requests"     && <Requests />}
            {active === "planning"     && <Planning />}
            {active === "finances"     && <Finances />}
            {active === "clients"      && <Clients />}
            {active === "reviews"      && <Reviews />}
            {active === "settings"     && <Settings />}
          </Suspense>
        </main>
      </div>
    </ToastProvider>
  );
}
