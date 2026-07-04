"use client";
import { useEffect, useState } from "react";
import { Cal_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { cn } from "@/lib/utils/cn";
import SignUpModal from "../signup/SignUpModal";
import LoginModal from "../signup/LoginModal";
import SmoothScroll from "./SmoothScroll";
import type { UserDto } from "@/lib/api/generated/model";
import {
  AnnounceBar, Nav, Hero, Features, DashboardShowcase, Payments,
  Security, SplitShowcase, Stats, Steps, Pricing, FAQ, Footer,
} from "./sections";

/* ──────────── Typography (landing page only) ────────────
 * Cal Sans   → display/titrage (H1, H2, H3, gros chiffres)
 * Plus Jakarta Sans → tout le reste (corps, UI, nav, boutons)
 * Cal Sans n'existe que dans un seul poids réel côté Google Fonts (400) —
 * on ne force pas de font-weight:600 dessus pour éviter un faux-gras
 * synthétisé par le navigateur ; le dessin de la police est déjà "impactant".
 */
const calSans = Cal_Sans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const jakarta = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

/* ──────────── MAIN EXPORT ──────────── */
export default function LandingPage({ user }: { user: UserDto | null }) {
  const [demoOpen,  setDemoOpen]  = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Open login modal automatically when redirected from a protected route.
  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("login") === "1") {
      setLoginOpen(true);
      // Clean the query param without reloading.
      const url = new URL(window.location.href);
      url.searchParams.delete("login");
      window.history.replaceState(null, "", url.toString());
    }
  }, []);

  const openDemo  = () => { setLoginOpen(false); setDemoOpen(true);  };
  const openLogin = () => { setDemoOpen(false);  setLoginOpen(true); };

  return (
    <div className={cn(calSans.variable, jakarta.variable)} style={{ fontFamily: "var(--font-jakarta)" }}>
      <SmoothScroll />
      <AnnounceBar />
      <Nav onDemo={openDemo} user={user} />
      <Hero onDemo={openDemo} />
      <DashboardShowcase />
      <Features />
      <SplitShowcase />
      <Payments />
      <Security />
      <Stats />
      <Steps />
      <Pricing />
      <FAQ />
      <Footer onDemo={openDemo} />
      {demoOpen  && <SignUpModal onClose={() => setDemoOpen(false)} />}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onSwitchToSignUp={() => { setLoginOpen(false); setDemoOpen(true); }}
        />
      )}
    </div>
  );
}
