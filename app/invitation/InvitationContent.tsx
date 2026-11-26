"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { acceptStaffInvitation, type StaffInvitationPreview } from "@/lib/api/pms/staff.actions";
import { registerHotel, sendOtp, verifyOtp } from "@/lib/api/auth/auth.actions";

const roleNames = { director: "Directeur", receptionist: "Réceptionniste", housekeeper: "Personnel de ménage" };

export default function InvitationContent({ token, preview, error, signedInEmail }: {
  token: string; preview: StaffInvitationPreview | null; error?: string; signedInEmail: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<"details" | "otp">("details");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const loginHref = `/login?next=${encodeURIComponent(`/invitation?token=${token}`)}`;
  const emailMatches = signedInEmail?.trim().toLowerCase() === preview?.email.toLowerCase();

  async function accept() {
    if (!preview || pending) return;
    setPending(true);
    setSubmitError("");
    const result = await acceptStaffInvitation(token);
    if (result.ok) {
      router.push("/pms");
      router.refresh();
    } else {
      setSubmitError(result.error.message);
      setPending(false);
    }
  }

  async function register() {
    if (!preview || pending) return;
    setPending(true);
    setSubmitError("");
    if (registrationStep === "details") {
      const result = await sendOtp({ email: preview.email });
      if (result.ok) setRegistrationStep("otp");
      else setSubmitError(result.error.message);
    } else {
      const verification = await verifyOtp({ email: preview.email, otp });
      if (!verification.ok) setSubmitError(verification.error.message);
      else {
        const result = await registerHotel({ email: preview.email, fullName, phoneNumber, password, token: verification.data.token });
        if (!result.ok) setSubmitError(result.error.message);
        else {
          const accepted = await acceptStaffInvitation(token);
          if (accepted.ok) {
            router.push("/pms");
            router.refresh();
            return;
          }
          setSubmitError(accepted.error.message);
        }
      }
    }
    setPending(false);
  }

  return <main className="min-h-screen bg-[#f5f6fa] flex items-center justify-center p-4 text-[#171923]">
    <section className="w-full max-w-[520px] rounded-2xl border border-[#e7e9ef] bg-white shadow-sm overflow-hidden">
      <div className="bg-[#2544e8] px-7 py-6 text-white font-bold text-xl">Immo Plus <span className="text-sm font-normal">PMS</span></div>
      <div className="p-7 sm:p-9">
        {!preview ? <>
          <h1 className="text-xl font-semibold mb-3">Invitation indisponible</h1>
          <p className="text-sm text-[#667085]">{error}</p>
          <Link href="/" className="inline-block mt-6 text-[#2544e8] font-semibold">Retour à l’accueil</Link>
        </> : <>
          <h1 className="text-2xl font-semibold leading-tight">Rejoignez {preview.hotelName}</h1>
          <p className="mt-4 text-sm leading-6 text-[#667085]">Vous êtes invité en tant que <strong className="text-[#171923]">{roleNames[preview.role]}</strong>. Cette invitation est destinée à <strong className="text-[#171923]">{preview.email}</strong>.</p>
          <p className="mt-2 text-xs text-[#667085]">Valable jusqu’au {new Date(preview.expiresAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}.</p>
          {signedInEmail && !emailMatches && <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Vous êtes connecté avec {signedInEmail}. Connectez-vous avec {preview.email} pour accepter.</p>}
          {submitError && <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
          {emailMatches ? <button type="button" disabled={pending} onClick={accept} className="mt-7 w-full rounded-lg bg-[#2544e8] px-5 py-3 text-white font-semibold disabled:opacity-60">{pending ? "Activation en cours…" : "Accepter l’invitation"}</button>
            : registering && !signedInEmail ? <form className="mt-7 space-y-3" onSubmit={event => { event.preventDefault(); void register(); }}>
                {registrationStep === "details" ? <>
                  <input required value={fullName} onChange={event => setFullName(event.target.value)} placeholder="Nom complet" aria-label="Nom complet" className="w-full rounded-lg border border-[#d5d9e2] px-3 py-3 text-sm" />
                  <input required value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} placeholder="Téléphone (ex. 2250123456789)" aria-label="Téléphone" inputMode="tel" className="w-full rounded-lg border border-[#d5d9e2] px-3 py-3 text-sm" />
                  <input required type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Mot de passe (12 caractères, majuscule, chiffre et symbole)" aria-label="Mot de passe" className="w-full rounded-lg border border-[#d5d9e2] px-3 py-3 text-sm" />
                </> : <>
                  <p className="text-sm text-[#667085]">Saisissez le code à 6 chiffres envoyé à {preview.email}.</p>
                  <input required value={otp} onChange={event => setOtp(event.target.value)} placeholder="Code de vérification" aria-label="Code de vérification" inputMode="numeric" maxLength={6} className="w-full rounded-lg border border-[#d5d9e2] px-3 py-3 text-sm" />
                </>}
                <button disabled={pending} className="w-full rounded-lg bg-[#2544e8] px-5 py-3 text-white font-semibold disabled:opacity-60">{pending ? "Veuillez patienter…" : registrationStep === "details" ? "Recevoir mon code" : "Créer mon compte et accepter"}</button>
              </form>
            : <Link href={loginHref} className="mt-7 block text-center rounded-lg bg-[#2544e8] px-5 py-3 text-white font-semibold">Se connecter pour accepter</Link>}
          {!signedInEmail && <p className="mt-4 text-center text-xs text-[#667085]">{registering ? "Vous avez déjà un compte ? " : "Pas encore de compte ? "}<button type="button" onClick={() => { setRegistering(!registering); setSubmitError(""); }} className="text-[#2544e8] font-semibold">{registering ? "Se connecter" : "Créer un compte"}</button></p>}
        </>}
      </div>
    </section>
  </main>;
}
