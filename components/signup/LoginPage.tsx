"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { LoginForm, BrandPane } from "./LoginModal";

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-[1080px]:grid-cols-1"
      style={{ fontFeatureSettings: "'ss01', 'cv11'" }}
    >
      {/* Left · form pane */}
      <section className="bg-white flex flex-col px-9 py-6 min-h-screen overflow-y-auto relative max-[600px]:px-5 max-[600px]:py-5">
        {/* Top bar */}
        <div className="flex items-center justify-between shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size="md" showHover={false} />
            <span className="font-semibold text-sm tracking-[-0.02em] flex items-center gap-1.5 text-ink">
              Immo Plus{" "}
              <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-primary border border-primary/35 px-[5px] py-px rounded-[4px] leading-[1.3]">
                PMS
              </span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-3 font-medium hover:text-ink transition-colors"
          >
            <BackIcon />
            Accueil
          </Link>
        </div>

        <LoginForm onSwitchToSignUp={() => router.push("/inscription")} />

        <div className="shrink-0 pt-3 mt-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-4">
            <LockIcon /> Données chiffrées · Conforme RGPD
          </div>
        </div>
      </section>

      {/* Right · brand pane */}
      <BrandPane />
    </div>
  );
}
