"use client";
import React, { useState, useEffect } from "react";
import { PMSSidebar, type NavId } from "./PMSSidebar";
import { Toasts } from "./shared";
import { Dashboard } from "./Dashboard";
import { Rooms } from "./modules/Rooms";
import { Reservations } from "./modules/Reservations";
import { CheckIn } from "./modules/CheckIn";
import { Requests } from "./modules/Requests";
import { Planning } from "./modules/Planning";
import { Finances } from "./modules/Finances";
import { Clients } from "./modules/Clients";
import { Reviews } from "./modules/Reviews";
import { Settings } from "./modules/Settings";

export function PMSApp() {
  const [active, setActive] = useState<NavId>("dashboard");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [active]);

  const go = (id: NavId) => setActive(id);

  return (
    <div className="pms-root">
      <div className="pms-app">
        <PMSSidebar active={active} setActive={setActive} />
        <main className="pms-main">
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
        </main>
        <Toasts />
      </div>
    </div>
  );
}
