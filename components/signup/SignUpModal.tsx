"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CardPos,
  Star1,
  ShieldTick,
} from "iconsax-react";
import "../../styles/signup.css";

/* ── Types ── */
type Phase = "signup" | "otp";

interface Form {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  pwd: string;
  pwd2: string;
  cgv: boolean;
}

interface PwdChecks {
  len: boolean; upper: boolean; lower: boolean; digit: boolean; special: boolean;
}

/* ── Validation helpers ── */
const getChecks = (v: string): PwdChecks => ({
  len:     v.length >= 12,
  upper:   /[A-Z]/.test(v),
  lower:   /[a-z]/.test(v),
  digit:   /[0-9]/.test(v),
  special: /[^A-Za-z0-9]/.test(v),
});
const pwdOk    = (v: string)  => Object.values(getChecks(v)).every(Boolean);
const emailOk  = (v: string)  => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const phoneOk  = (v: string)  => /^\+?\d[\d\s\-]{6,}$/.test(v.trim());

const OTP_LEN   = 6;
const OTP_DELAY = 60;

/* ── Minimal inline icons ── */
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const CheckMark = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* ── Brand pane with Iconsax outline icons ── */
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
    <section className="su-pane-brand">
      <div className="su-brand-eyebrow">Plateforme hôtelière</div>

      <h2 className="su-headline">
        Gérez tout votre établissement depuis une seule plateforme.
      </h2>
      <p className="su-sub">
        Réservations, planning des chambres, encaissements et avis clients — réunis dans un outil pensé pour les hôteliers.
      </p>

      <div className="su-values">
        {VALUES.map((v) => (
          <div key={v.title} className="su-value">
            <div className="su-vi">{v.icon}</div>
            <div>
              <div className="su-vt">{v.title}</div>
              <div className="su-vd">{v.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 500+ social proof — avatars en outline */}
      <div className="su-proof">
        <div className="su-avatars">
          {["KB", "NF", "AD", "ST"].map((initials) => (
            <div key={initials} className="su-av">{initials}</div>
          ))}
        </div>
        <div>
          <div className="su-proof-n">500+ établissements</div>
          <div className="su-proof-t">nous font déjà confiance en Côte d&apos;Ivoire.</div>
        </div>
      </div>
    </section>
  );
}

/* ── Sign-up form ── */
function SignUpForm({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [form, setForm] = useState<Form>({
    firstName: "", lastName: "", phoneNumber: "", email: "", pwd: "", pwd2: "", cgv: false,
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [pwdFocused, setPwdFocused] = useState(false);
  const [loading, setLoading]   = useState(false);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const checks     = getChecks(form.pwd);
  const showRules  = pwdFocused || form.pwd.length > 0;
  const emailError = form.email.length > 0 && !emailOk(form.email);
  const pwd2Error  = form.pwd2.length > 0 && form.pwd !== form.pwd2;

  const canSubmit =
    form.firstName.trim() && form.lastName.trim() &&
    phoneOk(form.phoneNumber) &&
    emailOk(form.email) &&
    pwdOk(form.pwd) &&
    form.pwd === form.pwd2 && form.pwd2.length > 0 &&
    form.cgv;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    // POST /auth/send-email-otp  { email }
    // then transition to OTP screen
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onSubmit(form.email);
  }

  const RULES: Array<{ key: keyof PwdChecks; label: string }> = [
    { key: "len",     label: "12 caractères" },
    { key: "upper",   label: "1 majuscule" },
    { key: "lower",   label: "1 minuscule" },
    { key: "digit",   label: "1 chiffre" },
    { key: "special", label: "1 spécial" },
  ];

  return (
    <div className="su-form-wrap">
      <div className="su-eyebrow">Espace hôtelier</div>
      <h1 className="su-h1">Créez votre compte</h1>
      <p className="su-lede">Rejoignez Immo Plus et gérez votre établissement en une seule plateforme.</p>

      <form className="su-form" onSubmit={handleSubmit} noValidate>

        {/* Prénom + Nom */}
        <div className="su-row2">
          <div className="su-field">
            <label className="su-label">Prénom <span className="su-req">*</span></label>
            <div className="su-control">
              <input className="su-input" type="text" autoComplete="given-name"
                placeholder="Aïcha" value={form.firstName} onChange={set("firstName")} />
            </div>
          </div>
          <div className="su-field">
            <label className="su-label">Nom <span className="su-req">*</span></label>
            <div className="su-control">
              <input className="su-input" type="text" autoComplete="family-name"
                placeholder="Diabaté" value={form.lastName} onChange={set("lastName")} />
            </div>
          </div>
        </div>

        {/* Téléphone */}
        <div className="su-field">
          <label className="su-label">Téléphone <span className="su-req">*</span></label>
          <div className="su-control">
            <input className="su-input" type="tel" autoComplete="tel"
              placeholder="+225 07 00 00 00 00" value={form.phoneNumber} onChange={set("phoneNumber")} />
          </div>
        </div>

        {/* Email */}
        <div className="su-field">
          <label className="su-label">E-mail <span className="su-req">*</span></label>
          <div className="su-control">
            <input
              className={"su-input" + (emailError ? " invalid" : "")}
              type="email" autoComplete="email"
              placeholder="aicha@hotel.ci"
              value={form.email} onChange={set("email")}
            />
          </div>
          {emailError && <div className="su-field-msg">Adresse e-mail invalide.</div>}
        </div>

        {/* Mot de passe */}
        <div className="su-field">
          <label className="su-label">Mot de passe <span className="su-req">*</span></label>
          <div className="su-control">
            <input
              className="su-input has-toggle"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={form.pwd}
              onChange={set("pwd")}
              onFocus={() => setPwdFocused(true)}
              onBlur={() => setPwdFocused(false)}
            />
            <button type="button" className="su-toggle-eye" onClick={() => setShowPwd(v => !v)}>
              {showPwd ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {!showRules && (
            <div className="su-help">12 car. min. · majuscule, chiffre, spécial.</div>
          )}
          <div className={"su-rules" + (showRules ? " show" : "")}>
            {RULES.map((r) => (
              <span key={r.key} className={"su-rule" + (checks[r.key] ? " ok" : "")}>
                <span className="su-tick">{checks[r.key] && <CheckMark />}</span>
                {r.label}
              </span>
            ))}
          </div>
        </div>

        {/* Confirmer mot de passe */}
        <div className="su-field">
          <label className="su-label">Confirmer <span className="su-req">*</span></label>
          <div className="su-control">
            <input
              className={"su-input has-toggle" + (pwd2Error ? " invalid" : "")}
              type={showPwd2 ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={form.pwd2} onChange={set("pwd2")}
            />
            <button type="button" className="su-toggle-eye" onClick={() => setShowPwd2(v => !v)}>
              {showPwd2 ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {pwd2Error && <div className="su-field-msg">Les mots de passe ne correspondent pas.</div>}
        </div>

        {/* CGV */}
        <div
          className={"su-cgv" + (form.cgv ? " checked" : "")}
          onClick={() => setForm((f) => ({ ...f, cgv: !f.cgv }))}
        >
          <div className="su-cb">{form.cgv && <CheckMark />}</div>
          <div className="su-cgv-text">
            J&apos;accepte les{" "}
            <a href="#" onClick={(e) => e.preventDefault()}>conditions générales</a>
            {" "}<span className="su-req">*</span>
          </div>
        </div>

        <button type="submit" className="su-btn" disabled={!canSubmit || loading}>
          {loading ? "Envoi du code…" : <><span>Continuer</span><ArrowRight /></>}
        </button>

        <div className="su-alt">
          Déjà un compte ?{" "}
          <a href="/pms" onClick={(e) => { e.preventDefault(); window.location.href = "/pms"; }}>
            Se connecter
          </a>
        </div>
      </form>
    </div>
  );
}

/* ── OTP screen ── */
function OtpScreen({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}) {
  const [digits, setDigits]     = useState<string[]>(Array(OTP_LEN).fill(""));
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(OTP_DELAY);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const t = setInterval(() => setTimer((v) => v - 1), 1000);
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
    } else if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
    else if (e.key === "ArrowRight" && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
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
    // POST /auth/register-customer with token = code
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    onVerified();
  }

  function handleResend() {
    setTimer(OTP_DELAY); setCanResend(false);
    setDigits(Array(OTP_LEN).fill("")); setError("");
    inputRefs.current[0]?.focus();
  }

  const mm = String(Math.floor(timer / 60)).padStart(2, "0");
  const ss = String(timer % 60).padStart(2, "0");

  return (
    <div className="su-form-wrap">
      <div className="su-eyebrow">Vérification</div>
      <h1 className="su-h1">Code de confirmation</h1>

      <div className="su-otp-sent">
        Code envoyé à <strong>{email}</strong>. Vérifiez aussi vos spams.
      </div>

      <form onSubmit={handleVerify}>
        <div className="su-otp-boxes" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className={"su-otp-input" + (d ? " filled" : "") + (error ? " error" : "")}
              type="text" inputMode="numeric" maxLength={1}
              value={d}
              onChange={(e) => handleInput(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoComplete="one-time-code"
              aria-label={`Chiffre ${i + 1}`}
            />
          ))}
        </div>

        {error && <div className="su-otp-error">{error}</div>}

        <button type="submit" className="su-btn" disabled={!complete || loading}>
          {loading ? "Vérification…" : <><span>Valider</span><ArrowRight /></>}
        </button>

        <div className="su-otp-meta">
          {canResend
            ? <>Pas reçu ? <button type="button" onClick={handleResend}>Renvoyer le code</button></>
            : <>Code valable encore <strong>{mm}:{ss}</strong> · <button type="button" disabled>Renvoyer</button></>
          }
        </div>

        <div className="su-back-link">
          <button type="button" onClick={onBack}><ChevLeft /> Modifier mon e-mail</button>
        </div>
      </form>
    </div>
  );
}

/* ── Modal shell ── */
export default function SignUpModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("signup");
  const [email, setEmail] = useState("");

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function handleSubmit(submittedEmail: string) {
    setEmail(submittedEmail);
    setPhase("otp");
  }

  function handleVerified() {
    onClose();
    router.push("/inscription");
  }

  return (
    <div className="su-overlay" role="dialog" aria-modal="true">
      <div className="su-shell">

        {/* Left · form pane */}
        <section className="su-pane-form">
          {/* Top bar */}
          <div className="su-topbar">
            <div className="su-brand">
              <div className="su-brand-mark">i+</div>
              <div className="su-brand-name">
                Immo Plus <span className="su-brand-tag">PRO</span>
              </div>
            </div>
            <button className="su-close" onClick={onClose} aria-label="Fermer">
              <XIcon />
            </button>
          </div>

          {phase === "signup" && <SignUpForm onSubmit={handleSubmit} />}
          {phase === "otp"    && (
            <OtpScreen email={email} onBack={() => setPhase("signup")} onVerified={handleVerified} />
          )}

          <div className="su-foot">
            <div className="su-secure">
              <LockIcon /> Données chiffrées · Conforme RGPD
            </div>
          </div>
        </section>

        {/* Right · brand pane */}
        <BrandPane />
      </div>
    </div>
  );
}
