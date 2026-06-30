"use client";
import React, { useState, useEffect, lazy, Suspense } from "react";
import { PMSSidebar, type NavId } from "./PMSSidebar";
import { ToastProvider } from "./shared";
import { usePmsSocket } from "@/lib/hooks/pms/usePmsSocket";
import type { UserDto } from "@/lib/api/generated/model";

type GoProps = { go: (id: NavId) => void };
type DashboardProps = GoProps & { user: UserDto | null };

const Dashboard    = lazy<React.FC<DashboardProps>>(() => import("./Dashboard").then(m => ({ default: m.Dashboard })));
const Reservations = lazy<React.FC<GoProps>>(() => import("./modules/Reservations").then(m => ({ default: m.Reservations })));
const CheckIn      = lazy<React.FC<GoProps>>(() => import("./modules/CheckIn").then(m => ({ default: m.CheckIn })));
const Rooms        = lazy<React.FC>(() => import("./modules/Rooms").then(m => ({ default: m.Rooms })));
const Requests     = lazy<React.FC>(() => import("./modules/Requests").then(m => ({ default: m.Requests })));
const Planning     = lazy<React.FC>(() => import("./modules/Planning").then(m => ({ default: m.Planning })));
const Finances     = lazy<React.FC>(() => import("./modules/Finances").then(m => ({ default: m.Finances })));
const Clients      = lazy<React.FC>(() => import("./modules/Clients").then(m => ({ default: m.Clients })));
const Reviews      = lazy<React.FC>(() => import("./modules/Reviews").then(m => ({ default: m.Reviews })));
const Settings     = lazy<React.FC>(() => import("./modules/Settings").then(m => ({ default: m.Settings })));
const CheckOut     = lazy<React.FC>(() => import("./modules/CheckOut").then(m => ({ default: m.CheckOut })));
const Staff        = lazy<React.FC>(() => import("./modules/Staff").then(m => ({ default: m.Staff })));

function ModuleFallback() {
  return (
    <div className="py-10 text-center text-ink-3 text-[13px]">
      Chargement…
    </div>
  );
}

export function PMSApp({ user, hotelName }: { user: UserDto | null; hotelName: string }) {
  const [active, setActive] = useState<NavId>("dashboard");

  usePmsSocket();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  const go = (id: NavId) => setActive(id);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface text-ink font-sans antialiased tracking-[-0.006em] font-features-['ss01','cv11']">
        <PMSSidebar active={active} setActive={setActive} user={user} hotelName={hotelName} />
        <main className="flex-1 min-w-0 px-9 pt-7 pb-15">
          <Suspense fallback={<ModuleFallback />}>
            {active === "dashboard"    && <Dashboard go={go} user={user} />}
            {active === "rooms"        && <Rooms />}
            {active === "reservations" && <Reservations go={go} />}
            {active === "checkin"      && <CheckIn go={go} />}
            {active === "checkout"     && <CheckOut />}
            {active === "requests"     && <Requests />}
            {active === "planning"     && <Planning hotelName={hotelName} />}
            {active === "finances"     && <Finances />}
            {active === "clients"      && <Clients />}
            {active === "reviews"      && <Reviews />}
            {active === "staff"        && <Staff />}
            {active === "settings"     && <Settings />}
          </Suspense>
        </main>
      </div>
    </ToastProvider>
  );
}
