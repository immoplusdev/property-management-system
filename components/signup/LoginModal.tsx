"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Calendar, CardPos, Star1 } from "iconsax-react";
import { cn } from "@/lib/utils/cn";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Logo } from "@/components/Logo";
import { login } from "@/lib/api/auth/auth.actions";

/* ── Icons ── */
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const inputBase =
  "w-full h-10 bg-white border border-border-strong rounded-[9px] px-3 text-[13.5px] text-ink transition-[border-color] outline-none hover:border-ink-3 focus:border-primary focus:[box-shadow:0_0_0_3px_var(--color-primary-50)] placeholder:text-ink-4";

/* ── Brand pane (shared with SignUpModal) ── */
export function BrandPane() {
  const VALUES = [
    {
      icon: <Calendar size={20} variant="Bold" color="white" />,
      title: "Planning en temps réel",
      desc: "Visualisez occupation, arrivées et départs d'un seul coup d'œil.",
    },
    {
      icon: <CardPos size={20} variant="Bold" color="white" />,
      title: "Paiements intégrés",
      desc: "Wave, Orange Money, carte — réconciliés automatiquement.",
    },
    {
      icon: <Star1 size={20} variant="Bold" color="white" />,
      title: "Réputation centralisée",
      desc: "Répondez aux avis et suivez votre note depuis le tableau de bord.",
    },
  ];

  return (
    <section
      className="relative overflow-hidden hidden min-[1080px]:flex flex-col h-full px-10 pt-9 pb-8"
      style={{ background: "var(--gradient-auth-hero)" }}
    >
      {/* Decorative circles */}
      <div aria-hidden className="absolute -top-28 -right-16 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.06)" }} />
      <div aria-hidden className="absolute -bottom-20 -left-14 w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />
      <div aria-hidden className="absolute top-[42%] right-[8%] w-24 h-24 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Content */}
      <div className="relative flex flex-col flex-1">
        {/* Eyebrow */}
        <div className="text-[10.5px] font-black tracking-[0.16em] uppercase shrink-0" style={{ color: "rgba(255,255,255,0.50)" }}>
          Plateforme hôtelière
        </div>

        {/* Headline */}
        <h2 className="text-[clamp(26px,2.6vw,38px)] font-bold tracking-[-0.03em] leading-[1.1] mt-5 m-0 text-white max-w-[380px]">
          Gérez tout votre établissement depuis une seule plateforme.
        </h2>
        <p className="text-[13.5px] leading-[1.65] mt-4 max-w-[360px] m-0" style={{ color: "rgba(255,255,255,0.60)" }}>
          Réservations, planning, encaissements et avis réunis dans un outil pensé pour les hôteliers ivoiriens.
        </p>

        {/* Feature cards */}
        <div className="mt-8 flex flex-col gap-2.5">
          {VALUES.map(v => (
            <div
              key={v.title}
              className="flex items-center gap-3.5 px-4 py-3.5 rounded-[13px]"
              style={{ background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              <div
                className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                style={{ background: "rgba(255,255,255,0.16)" }}
              >
                {v.icon}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white leading-tight">{v.title}</div>
                <div className="text-[11.5px] mt-0.5 leading-[1.45]" style={{ color: "rgba(255,255,255,0.55)" }}>{v.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social proof */}
      <div
        className="relative shrink-0 flex items-center gap-3.5 px-4 py-4 rounded-[13px] mt-6"
        style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.16)" }}
      >
        <div className="flex shrink-0">
          {["KB", "NF", "AD", "ST"].map((init, i) => (
            <div
              key={init}
              className="w-9 h-9 rounded-full grid place-items-center text-white font-semibold text-[11px]"
              style={{ marginLeft: i === 0 ? 0 : -10, background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(255,255,255,0.30)" }}
            >
              {init}
            </div>
          ))}
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-[-0.02em] text-white">500+ établissements</div>
          <div className="text-[11.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
            nous font déjà confiance en Côte d&apos;Ivoire.
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Login form ── */
export function LoginForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = emailOk && password.length >= 6 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    const res = await login({ email: email.trim(), password });
    if (res.ok) {
      router.push("/pms");
      router.refresh();
    } else {
      setLoading(false);
      setError(res.error.message);
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center py-4 px-0 max-w-[420px] mx-auto w-full">
      <div className="text-[10.5px] font-semibold tracking-[0.09em] uppercase text-ink-3 mb-2.5">Espace hôtelier</div>
      <h1 className="text-[26px] font-semibold tracking-[-0.03em] leading-[1.1] m-0 text-ink">Connectez-vous</h1>
      <p className="text-[13px] text-ink-3 leading-[1.5] mt-[7px] m-0">
        Accédez à votre tableau de bord et gérez votre établissement.
      </p>

      <form className="mt-6 flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-[5px]">
          <label className="text-xs font-medium text-ink flex items-center gap-1">
            E-mail <span className="text-primary">*</span>
          </label>
          <input
            className={cn(inputBase, email.length > 0 && !emailOk && "border-danger")}
            type="email"
            autoComplete="email"
            placeholder="aicha@hotel.ci"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-[5px]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-ink flex items-center gap-1">
              Mot de passe <span className="text-primary">*</span>
            </label>
            <button
              type="button"
              className="text-[11.5px] text-primary font-medium hover:underline underline-offset-[2px]"
              onClick={() => {/* mot de passe oublié — à implémenter */}}
            >
              Oublié ?
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              className={cn(inputBase, "pr-[42px]")}
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
            />
            <button
              type="button"
              className="absolute right-[5px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-[7px] grid place-items-center text-ink-3 transition-[color,background] hover:text-ink hover:bg-surface-2"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? "Masquer" : "Afficher"}
            >
              {showPwd ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="text-[12px] text-danger bg-danger-bg border border-danger/30 rounded-lg px-3 py-2 leading-[1.45]">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="h-[46px] w-full rounded-[9px] bg-primary text-white text-sm font-semibold tracking-[-0.01em] flex items-center justify-center gap-[7px] transition-[background,opacity] mt-[2px] hover:enabled:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!canSubmit}
          aria-busy={loading}
        >
          {loading ? "Connexion…" : <><span>Se connecter</span><ArrowRight /></>}
        </button>

        <div className="text-[12.5px] text-ink-3 text-center mt-3.5">
          Pas encore de compte ?{" "}
          <button
            type="button"
            className="text-primary font-semibold hover:underline underline-offset-[2px]"
            onClick={onSwitchToSignUp}
          >
            Créer un compte
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Modal shell ── */
export default function LoginModal({
  onClose,
  onSwitchToSignUp,
}: {
  onClose: () => void;
  onSwitchToSignUp: () => void;
}) {
  const mounted = useHydrated();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-modal-fullscreen bg-[rgba(18,19,26,0.52)] backdrop-blur-[8px] flex animate-fade-in overscroll-contain"
      style={{ fontFeatureSettings: "'ss01', 'cv11'" }}
      role="dialog"
      aria-modal="true"
      aria-label="Connexion"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] w-full h-full animate-slide-up max-[1080px]:grid-cols-1">
        {/* Left · form pane */}
        <section className="bg-white flex flex-col px-9 py-6 h-full overflow-y-auto scrollbar-thin relative max-[600px]:px-5 max-[600px]:py-5">
          {/* Top bar */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <Logo size="md" showHover={false} />
              <div className="font-semibold text-sm tracking-[-0.02em] flex items-center gap-1.5 text-ink">
                Immo Plus{" "}
                <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-primary border border-primary-200 px-[5px] py-px rounded-[4px] leading-[1.3]">PRO</span>
              </div>
            </div>
            <button
              className="w-[34px] h-[34px] rounded-[8px] grid place-items-center text-ink-3 transition-[background,color] hover:bg-surface-2 hover:text-ink shrink-0"
              onClick={onClose}
              aria-label="Fermer"
            >
              <XIcon />
            </button>
          </div>

          <LoginForm onSwitchToSignUp={onSwitchToSignUp} />

          <div className="shrink-0 pt-3 mt-auto">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-4">
              <LockIcon /> Données chiffrées · Conforme RGPD
            </div>
          </div>
        </section>

        {/* Right · brand pane */}
        <BrandPane />
      </div>
    </div>,
    document.body
  );
}
