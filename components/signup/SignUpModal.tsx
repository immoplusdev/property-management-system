"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Calendar, CardPos, Star1, Buildings2 } from "iconsax-react";
import { cn } from "@/lib/utils/cn";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { Logo } from "@/components/Logo";
import {
  sendOtp,
  verifyOtp,
  registerCustomer,
} from "@/lib/api/auth/auth.actions";
import { startOnboarding } from "@/lib/api/onboarding/onboarding.actions";

/* ── Types ── */
type Phase = "signup" | "otp" | "success";

interface Form {
  fullName: string; phoneNumber: string;
  hotelName: string;
  email: string; pwd: string; pwd2: string; cgv: boolean;
}

/** Données du formulaire passées à l'écran OTP pour finaliser l'inscription. */
interface PendingForm {
  fullName: string; phoneNumber: string;
  hotelName: string;
  email: string; password: string;
}

interface PwdChecks {
  len: boolean; upper: boolean; lower: boolean; digit: boolean; special: boolean;
}

/* ── Validation ── */
const getChecks = (v: string): PwdChecks => ({
  len:     v.length >= 12,
  upper:   /[A-Z]/.test(v),
  lower:   /[a-z]/.test(v),
  digit:   /[0-9]/.test(v),
  special: /[^A-Za-z0-9]/.test(v),
});
const pwdOk   = (v: string) => Object.values(getChecks(v)).every(Boolean);
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk = (v: string) => /^\+?\d[\d\s\-]{6,}$/.test(v.trim());

const OTP_LEN   = 6;
const OTP_DELAY = 60;

/* ── Minimal inline icons ── */
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
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
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckMark = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

/* ── Shared input class ── */
const inputBase = "w-full h-10 bg-white border border-border-strong rounded-[9px] px-3 text-[13.5px] text-ink transition-[border-color] outline-none hover:border-ink-3 focus:border-primary focus:[box-shadow:0_0_0_3px_var(--color-primary-50)] placeholder:text-ink-4";

/* ── Brand pane ── */
function BrandPane() {
  const VALUES = [
    {
      icon: <Calendar size={20} variant="Outline" color="currentColor" />,
      title: "Planning & chambres en temps réel",
      desc:  "Visualisez l'occupation, les arrivées et les départs d'un seul coup d'œil.",
    },
    {
      icon: <CardPos size={20} variant="Outline" color="currentColor" />,
      title: "Paiements & facturation intégrés",
      desc:  "Wave, Orange Money, carte et espèces — réconciliés automatiquement.",
    },
    {
      icon: <Star1 size={20} variant="Outline" color="currentColor" />,
      title: "Avis & réputation centralisés",
      desc:  "Répondez à vos clients et suivez votre note depuis votre tableau de bord.",
    },
  ];

  return (
    <section
      className="relative px-10 flex flex-col h-full overflow-y-auto scrollbar-none hidden min-[1080px]:flex"
      style={{
        background: "var(--gradient-auth-hero)"
      }}
    >
      {/* Décor cercles en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }} />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex flex-col h-full justify-between py-8">

        {/* Haut : eyebrow, titre, description */}
        <div>
          <div className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-white/60 shrink-0">
            Plateforme hôtelière
          </div>

          <h2 className="text-[clamp(26px,2.8vw,34px)] font-semibold tracking-[-0.03em] leading-[1.12] mt-4 m-0 text-white max-w-[420px]">
            Gérez tout votre établissement depuis une seule plateforme.
          </h2>
          <p className="text-[15px] text-white/70 leading-[1.6] mt-4 max-w-[420px] m-0">
            Réservations, planning des chambres, encaissements et avis clients réunis dans un outil pensé pour les hôteliers.
          </p>
        </div>

        {/* Milieu : feature cards */}
        <div className="flex flex-col gap-5 py-4">
          {VALUES.map(v => (
            <div key={v.title} className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-[13px] border border-white/20 grid place-items-center shrink-0 bg-white/10 text-white">
                {v.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold tracking-[-0.01em] text-white">{v.title}</div>
                <div className="text-[13px] text-white/70 mt-1 leading-[1.5]">{v.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bas : social proof */}
        <div className="flex items-center gap-3.5 px-4 py-4 border border-white/15 rounded-2xl bg-white/10 shrink-0">
          <div className="flex gap-2">
            {["KB", "NF", "AD", "ST"].map((init) => (
              <div
                key={init}
                className="w-9 h-9 rounded-full border border-white/20 bg-white/15 grid place-items-center text-white font-semibold text-[10px]"
              >
                {init}
              </div>
            ))}
          </div>
          <div>
            <div className="text-[14px] font-bold tracking-[-0.02em] text-white">500+ établissements</div>
            <div className="text-[12px] text-white/70 mt-px">nous font déjà confiance en Côte d&apos;Ivoire.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Sign-up form ── */
function SignUpForm({ onSubmit }: { onSubmit: (pending: PendingForm) => void }) {
  const [form, setForm] = useState<Form>({
    fullName: "", phoneNumber: "", hotelName: "", email: "", pwd: "", pwd2: "", cgv: false,
  });
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const checks     = getChecks(form.pwd);
  const showRules  = pwdFocused || form.pwd.length > 0;
  const emailError = form.email.length > 0 && !emailOk(form.email);
  const pwd2Error  = form.pwd2.length > 0 && form.pwd !== form.pwd2;
  const phoneError = form.phoneNumber.length > 0 && !/^\d{10,15}$/.test(form.phoneNumber.trim());

  const canSubmit =
    form.fullName.trim().length >= 2 &&
    form.hotelName.trim().length >= 5 &&
    /^\d{10,15}$/.test(form.phoneNumber.trim()) &&
    emailOk(form.email) &&
    pwdOk(form.pwd) && form.pwd === form.pwd2 && form.pwd2.length > 0 &&
    form.cgv;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    setSubmitError("");
    // Étape 1 — envoyer l'OTP par e-mail.
    const res = await sendOtp({ email: form.email.trim() });
    setLoading(false);
    if (res.ok) {
      onSubmit({
        fullName:    form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        hotelName:   form.hotelName.trim(),
        email:       form.email.trim(),
        password:    form.pwd,
      });
    } else {
      setSubmitError(res.error.message);
    }
  }

  const RULES: Array<{ key: keyof PwdChecks; label: string }> = [
    { key: "len",     label: "12 caractères" },
    { key: "upper",   label: "1 majuscule"   },
    { key: "lower",   label: "1 minuscule"   },
    { key: "digit",   label: "1 chiffre"     },
    { key: "special", label: "1 spécial"     },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center py-4 px-0 max-w-[420px] mx-auto w-full">
      <div className="text-[10.5px] font-semibold tracking-[0.09em] uppercase text-ink-3 mb-2.5">
        Espace hôtelier
      </div>
      <h1 className="text-[26px] font-semibold tracking-[-0.03em] leading-[1.1] m-0 text-ink">
        Créez votre compte
      </h1>
      <p className="text-[13px] text-ink-3 leading-[1.5] mt-[7px] m-0">
        Rejoignez Immo Plus et gérez votre établissement en une seule plateforme.
      </p>

      <form className="mt-5 flex flex-col gap-3" onSubmit={handleSubmit} noValidate>

        {/* Nom complet */}
        <div className="flex flex-col gap-[5px]">
          <label className="text-xs font-medium text-ink flex items-center gap-1">
            Nom complet <span className="text-primary">*</span>
          </label>
          <input
            className={inputBase}
            type="text" autoComplete="name"
            placeholder="Aïcha Diabaté"
            value={form.fullName}
            onChange={set("fullName")}
          />
        </div>

        {/* Nom de l'hôtel */}
        <div className="flex flex-col gap-[5px]">
          <label className="text-xs font-medium text-ink flex items-center gap-1">
            Nom de l'établissement <span className="text-primary">*</span>
          </label>
          <input
            className={inputBase}
            type="text"
            placeholder="Hôtel des Palmiers"
            value={form.hotelName}
            onChange={set("hotelName")}
          />
          {form.hotelName.length > 0 && form.hotelName.length < 5 && (
            <div className="text-[11px] text-danger min-h-[1em]">Minimum 5 caractères requis</div>
          )}
        </div>

        {/* Téléphone */}
        <div className="flex flex-col gap-[5px]">
          <label className="text-xs font-medium text-ink flex items-center gap-1">
            Téléphone <span className="text-primary">*</span>
          </label>
          <input
            className={cn(inputBase, phoneError && "border-danger")}
            type="tel" autoComplete="tel"
            placeholder="2250123456789"
            value={form.phoneNumber} onChange={set("phoneNumber")}
          />
          {phoneError && (
            <div className="text-[11px] text-danger min-h-[1em]">Format invalide. Exemple : 2250123456789</div>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-[5px]">
          <label className="text-xs font-medium text-ink flex items-center gap-1">
            E-mail <span className="text-primary">*</span>
          </label>
          <input
            className={cn(inputBase, emailError && "border-danger")}
            type="email" autoComplete="email"
            placeholder="aicha@hotel.ci"
            value={form.email} onChange={set("email")}
          />
          {emailError && <div className="text-[11px] text-danger min-h-[1em]">Adresse e-mail invalide.</div>}
        </div>

        {/* Mot de passe */}
        <div className="flex flex-col gap-[5px]">
          <label className="text-xs font-medium text-ink flex items-center gap-1">
            Mot de passe <span className="text-primary">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              className={cn(inputBase, "pr-[42px]")}
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={form.pwd} onChange={set("pwd")}
              onFocus={() => setPwdFocused(true)}
              onBlur={() => setPwdFocused(false)}
            />
            <button
              type="button"
              className="absolute right-[5px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-[7px] grid place-items-center text-ink-3 transition-[color,background] hover:text-ink hover:bg-surface-2"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPwd ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {!showRules && (
            <div className="text-[11.5px] text-ink-3 leading-[1.45] mt-[2px]">
              12 car. min. · majuscule, chiffre, spécial.
            </div>
          )}
          {showRules && (
            <div className="flex flex-wrap gap-1 gap-x-3 mt-[3px]">
              {RULES.map(r => (
                <span
                  key={r.key}
                  className={cn(
                    "inline-flex items-center gap-[5px] text-[11px] font-medium transition-colors",
                    checks[r.key] ? "text-success" : "text-ink-3"
                  )}
                >
                  <span className={cn(
                    "w-[13px] h-[13px] rounded-full border border-border-strong grid place-items-center shrink-0 transition-all",
                    checks[r.key] && "bg-success border-success text-white"
                  )}>
                    {checks[r.key] && <CheckMark />}
                  </span>
                  {r.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Confirmer mot de passe */}
        <div className="flex flex-col gap-[5px]">
          <label className="text-xs font-medium text-ink flex items-center gap-1">
            Confirmer <span className="text-primary">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              className={cn(inputBase, "pr-[42px]", pwd2Error && "border-danger")}
              type={showPwd2 ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={form.pwd2} onChange={set("pwd2")}
            />
            <button
              type="button"
              className="absolute right-[5px] top-1/2 -translate-y-1/2 w-[30px] h-[30px] rounded-[7px] grid place-items-center text-ink-3 transition-[color,background] hover:text-ink hover:bg-surface-2"
              onClick={() => setShowPwd2(v => !v)}
              aria-label={showPwd2 ? "Masquer la confirmation" : "Afficher la confirmation"}
            >
              {showPwd2 ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {pwd2Error && <div className="text-[11px] text-danger min-h-[1em]">Les mots de passe ne correspondent pas.</div>}
        </div>

        {/* CGV */}
        <div
          className="flex items-start gap-2.5 cursor-pointer select-none"
          onClick={() => setForm(f => ({ ...f, cgv: !f.cgv }))}
          role="checkbox"
          aria-checked={form.cgv}
          tabIndex={0}
          onKeyDown={e => { if (e.key === " " || e.key === "Enter") setForm(f => ({ ...f, cgv: !f.cgv })); }}
        >
          <div className={cn(
            "w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-border-strong bg-white grid place-items-center shrink-0 mt-[1px] text-transparent transition-all",
            form.cgv && "bg-primary border-primary text-white"
          )}>
            {form.cgv && <CheckMark />}
          </div>
          <div className="text-[12.5px] text-ink-2 leading-[1.5]">
            J&apos;accepte les{" "}
            <a href="#" onClick={e => e.preventDefault()} className="text-ink font-medium underline underline-offset-[2px]">
              conditions générales
            </a>
            {" "}<span className="text-primary">*</span>
          </div>
        </div>

        {submitError && (
          <div
            role="alert"
            className="text-[12px] text-danger bg-danger-bg border border-danger/30 rounded-lg px-3 py-2 leading-[1.45]"
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          className="h-[46px] w-full rounded-[9px] bg-primary text-white text-sm font-semibold tracking-[-0.01em] flex items-center justify-center gap-[7px] transition-[background,opacity] mt-[2px] hover:enabled:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!canSubmit || loading}
          aria-busy={loading}
        >
          {loading ? "Création du compte…" : <><span>Continuer</span><ArrowRight /></>}
        </button>

        <div className="text-[12.5px] text-ink-3 text-center mt-3.5">
          Déjà un compte ?{" "}
          <a href="/pms" className="text-primary font-semibold" onClick={e => { e.preventDefault(); window.location.href = "/pms"; }}>
            Se connecter
          </a>
        </div>
      </form>
    </div>
  );
}

/* ── OTP screen ── */
function OtpScreen({
  pending, onBack, onVerified,
}: {
  pending: PendingForm;
  onBack: () => void;
  onVerified: () => void;
}) {
  const { email } = pending;
  const [digits, setDigits]   = useState<string[]>(Array(OTP_LEN).fill(""));
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer]     = useState(OTP_DELAY);
  const canResend = timer <= 0;
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // L'OTP a déjà été envoyé lors de la soumission du formulaire.
  // Le timer démarre directement.
  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  function handleInput(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = v; setDigits(next); setError("");
    if (v && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (digits[i]) { const n = [...digits]; n[i] = ""; setDigits(n); }
      else if (i > 0) inputRefs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft"  && i > 0)            inputRefs.current[i - 1]?.focus();
    else if   (e.key === "ArrowRight" && i < OTP_LEN - 1)  inputRefs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LEN).fill("").map((_, i) => pasted[i] ?? "");
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus();
  }

  const code     = digits.join("");
  const complete = code.length === OTP_LEN;

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!complete || loading) return;
    setLoading(true);
    setError("");

    // Étape 2 — vérifier l'OTP → récupérer le token.
    const verifyRes = await verifyOtp({ email, otp: code });
    if (!verifyRes.ok) {
      setLoading(false);
      setError(verifyRes.error.message);
      setDigits(Array(OTP_LEN).fill(""));
      inputRefs.current[0]?.focus();
      return;
    }

    // Étape 3 — inscription finale avec le token OTP.
    const registerRes = await registerCustomer({
      fullName:    pending.fullName,
      phoneNumber: pending.phoneNumber,
      email,
      password:    pending.password,
      token:       verifyRes.data.token,
    });
    setLoading(false);
    if (registerRes.ok) {
      onVerified();
    } else {
      setError(registerRes.error.message);
    }
  }

  async function handleResend() {
    if (!canResend) return;
    setError("");
    setDigits(Array(OTP_LEN).fill(""));
    inputRefs.current[0]?.focus();
    const res = await sendOtp({ email });
    if (res.ok) {
      setTimer(OTP_DELAY);
    } else {
      setError(res.error.message);
    }
  }

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  return (
    <div className="flex-1 flex flex-col justify-center py-4 px-0 max-w-[420px] mx-auto w-full">
      <div className="text-[10.5px] font-semibold tracking-[0.09em] uppercase text-ink-3 mb-2.5">Vérification</div>
      <h1 className="text-[26px] font-semibold tracking-[-0.03em] leading-[1.1] m-0 text-ink">Code de confirmation</h1>

      <p className="text-[13px] text-ink-2 leading-[1.55] my-5 m-0">
        Code envoyé à <strong className="text-ink">{email}</strong>. Vérifiez aussi vos spams.
      </p>

      <form onSubmit={handleVerify}>
        <div className="flex gap-2.5 mb-[22px]" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              className={cn(
                "w-[52px] h-[58px] border-[1.5px] border-border-strong rounded-[11px] bg-white",
                "text-[22px] font-bold tracking-[-0.02em] text-center text-ink",
                "transition-[border-color,box-shadow] outline-none caret-primary",
                "focus:border-primary focus:[box-shadow:0_0_0_3px_var(--color-primary-50)]",
                "max-[600px]:w-[44px] max-[600px]:h-[50px] max-[600px]:text-[18px]",
                d     && "border-primary bg-primary-50 text-primary",
                error && "border-danger bg-danger-bg"
              )}
              type="text" inputMode="numeric" maxLength={1}
              value={d}
              onChange={e => handleInput(i, e)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoComplete="one-time-code"
              aria-label={`Chiffre ${i + 1}`}
            />
          ))}
        </div>

        {error && <div className="text-xs text-danger min-h-[1em] mb-3">{error}</div>}

        <button
          type="submit"
          className="h-[46px] w-full rounded-[9px] bg-primary text-white text-sm font-semibold tracking-[-0.01em] flex items-center justify-center gap-[7px] transition-[background,opacity] hover:enabled:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!complete || loading}
          aria-busy={loading}
        >
          {loading ? "Vérification…" : <><span>Valider</span><ArrowRight /></>}
        </button>

        <div className="text-[12.5px] text-ink-3 mt-4 leading-[1.6]">
          {canResend ? (
            <>Pas reçu ?{" "}
              <button type="button" className="text-primary font-semibold text-[12.5px] underline underline-offset-[2px]" onClick={handleResend}>
                Renvoyer le code
              </button>
            </>
          ) : (
            <>Code valable encore <strong className="text-ink">{mm}:{ss}</strong> ·{" "}
              <button type="button" disabled className="text-ink-3 text-[12.5px] cursor-default">Renvoyer</button>
            </>
          )}
        </div>

        <div className="mt-3.5">
          <button
            type="button"
            onClick={onBack}
            className="text-ink-2 font-medium text-[12.5px] inline-flex items-center gap-1 underline underline-offset-[2px]"
          >
            <ChevLeft /> Modifier mon e-mail
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Success overlay ── */
type SuccessStage = "enter" | "check" | "text";

function SuccessOverlay({ hotelName, onDone }: { hotelName: string; onDone: () => void }) {
  const [stage, setStage] = useState<SuccessStage>("enter");

  useEffect(() => {
    void startOnboarding(hotelName);
    const t1 = setTimeout(() => setStage("check"), 350);
    const t2 = setTimeout(() => setStage("text"),  800);
    const t3 = setTimeout(() => onDone(),         3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [hotelName, onDone]);

  return (
    <div className="w-full h-full flex items-center justify-center px-5">
      <div className="bg-white rounded-[28px] px-10 py-10 w-full max-w-[400px] flex flex-col items-center text-center shadow-[0_24px_72px_rgba(18,19,26,0.22)]">

        {/* Logo / hotel icon */}
        <div className="mb-7">
          <div className={cn(
            "w-[76px] h-[76px] rounded-full bg-primary text-white grid place-items-center transition-all duration-500",
            stage === "enter" ? "scale-90 opacity-70" : "scale-100 opacity-100"
          )}>
            {stage === "enter" && (
              <Logo size="lg" showHover={false} />
            )}
            {stage !== "enter" && (
              <Buildings2 size={32} variant="Outline" />
            )}
          </div>
        </div>

        {/* Texts */}
        <h2 className={cn(
          "text-[21px] font-bold tracking-[-0.03em] text-ink leading-[1.2] transition-all duration-500",
          stage === "text" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          Votre compte a été créé !
        </h2>
        <p className={cn(
          "text-[13px] text-ink-3 leading-[1.65] mt-2.5 transition-all duration-500 delay-75",
          stage === "text" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          Vous allez être redirigé vers l&apos;enregistrement de votre hôtel.
        </p>
        <div className={cn(
          "inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary mt-4 transition-all duration-500 delay-150",
          stage === "text" ? "opacity-100" : "opacity-0"
        )}>
          <ArrowRight />
          Étape 1 sur 7 · Compte hôtelier
        </div>

        {/* Progress bar */}
        <div className="w-full h-[3px] bg-surface-2 rounded-full mt-7 overflow-hidden">
          <div className={cn(
            "h-full bg-primary rounded-full transition-[width]",
            stage === "text" ? "w-full duration-[2400ms]" : "w-0"
          )} />
        </div>
      </div>
    </div>
  );
}

/* ── Modal shell ── */
export default function SignUpModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("signup");
  const [pending, setPending] = useState<PendingForm | null>(null);
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

  function handleFormComplete(data: PendingForm) {
    setPending(data);
    setPhase("otp");
  }

  function handleVerified() {
    setPhase("success");
  }

  function handleDone() {
    onClose();
    router.push("/inscription");
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-modal-fullscreen bg-[rgba(18,19,26,0.52)] backdrop-blur-[8px] flex animate-fade-in overscroll-contain"
      style={{ fontFeatureSettings: "'ss01', 'cv11'" }}
      role="dialog"
      aria-modal="true"
    >
      {phase === "success" ? (
        <SuccessOverlay hotelName={pending?.hotelName || ""} onDone={handleDone} />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] w-full h-full animate-slide-up max-[1080px]:grid-cols-1">

          {/* Left · form pane */}
          <section className="bg-white flex flex-col px-9 py-6 h-full overflow-y-auto scrollbar-thin relative max-[600px]:px-5 max-[600px]:py-5">

            {/* Top bar */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Logo size="md" showHover={false} />
                <div className="font-semibold text-sm tracking-[-0.02em] flex items-center gap-1.5 text-ink">
                  Immo Plus{" "}
                  <span className="text-[9px] font-semibold tracking-[0.08em] uppercase text-primary border border-primary-200 px-[5px] py-px rounded-[4px] leading-[1.3]">
                    PRO
                  </span>
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

            {phase === "signup" && <SignUpForm onSubmit={handleFormComplete} />}
            {phase === "otp" && pending && (
              <OtpScreen pending={pending} onBack={() => setPhase("signup")} onVerified={handleVerified} />
            )}

            <div className="shrink-0 pt-3 mt-auto">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-ink-4">
                <LockIcon /> Données chiffrées · Conforme RGPD
              </div>
            </div>
          </section>

          {/* Right · brand pane */}
          <BrandPane />
        </div>
      )}
    </div>,
    document.body
  );
}
