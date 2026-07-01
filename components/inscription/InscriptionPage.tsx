"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import { Step4 } from "./steps/Step4";
import { Step5 } from "./steps/Step5";
import { Step6 } from "./steps/Step6";
import { Step7 } from "./steps/Step7";
import { Icon } from "./ui/Icon";
import { Btn, BtnTrail } from "./ui/Btn";
import { cn } from "@/lib/utils/cn";
import { INITIAL_STATE } from "./constants";
import type { InscriptionState, UpdateFn } from "./types";
import type { UserDto } from "@/lib/api/generated/model";
import {
  submitStep1, submitStep2, submitStep3,
  submitStep4, submitStep5, submitStep6,
  getOnboardingProgress,
} from "@/lib/api/onboarding/onboarding.actions";
import { mapProgressToState } from "@/lib/api/onboarding/progress.mapper";

// ─── localStorage cache ───────────────────────────────────────────────────────

const CACHE_KEY = "immoplus_ob_v1";
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 h

interface CachedOnboarding {
  state: InscriptionState;
  step:  number;
  score: number;
  ts:    number;
}

function readCache(): CachedOnboarding | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedOnboarding = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(state: InscriptionState, step: number, score: number) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ state, step, score, ts: Date.now() }));
  } catch { /* ignore quota errors */ }
}

function clearCache() {
  try { localStorage.removeItem(CACHE_KEY); } catch { /* */ }
}

// ─── Score ────────────────────────────────────────────────────────────────────

function computeCompletion(state: InscriptionState): number {
  let score = 0;
  const { account, hotel, equip, roomTypes, valueAdds, pricing } = state;

  // Step 1 — 15 pts
  if (account.fullName) score += 3;
  if (account.email) score += 3;
  if (account.phone) score += 3;
  if (account.idCardFrontFileId && account.idCardBackFileId) score += 4;
  if (account.acceptedTerms) score += 2;

  // Step 2 — 20 pts
  if (hotel.name) score += 3;
  if (hotel.type) score += 2;
  if (hotel.stars > 0) score += 2;
  if (hotel.address) score += 2;
  if (hotel.shortDesc) score += 3;
  if (hotel.galleryFileIds.length >= 5) score += 5;
  if (hotel.videoFileId) score += 3;

  // Step 3 — 10 pts
  const equipCount = Object.values(equip).filter((v) => v === true).length;
  score += Math.min(10, Math.round((equipCount / 18) * 10));

  // Step 4 — 25 pts
  if (roomTypes.length > 0) score += 5;
  const completeRooms = roomTypes.filter((r) => r.complete).length;
  if (completeRooms === roomTypes.length && roomTypes.length > 0) score += 10;
  const imagesTotal = roomTypes.reduce((s, r) => s + (r.imageIds?.length ?? 0), 0);
  if (imagesTotal >= 10) score += 10;

  // Step 5 — 10 pts
  const vaFixed = (["restaurant","bar","pool","gym","spa","conference","outdoor"] as const)
    .filter((k) => valueAdds[k].configured).length;
  const vaCount = vaFixed + valueAdds.customSpaces.length;
  score += Math.min(10, vaCount * 2);

  // Step 6 — 10 pts
  if (pricing.payWave || pricing.payOM || pricing.payCard) score += 5;
  if (pricing.cancelPolicy) score += 3;
  if (pricing.depositRequired !== undefined) score += 2;

  // Step 7 bonus
  if (score >= 85) score += 4;

  return Math.min(100, score);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];

function buildInitialState(user: UserDto | null | undefined): InscriptionState {
  if (!user) return INITIAL_STATE;
  const rawPhone  = user.phoneNumber ?? "";
  const localPhone = rawPhone.startsWith("225") ? rawPhone.slice(3) : rawPhone;
  const phone = localPhone ? `+225 ${localPhone}` : INITIAL_STATE.account.phone;
  return {
    ...INITIAL_STATE,
    account: {
      ...INITIAL_STATE.account,
      fullName: [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
        || INITIAL_STATE.account.fullName,
      email: user.email || INITIAL_STATE.account.email,
      phone,
      rccm: "",
      idCardFrontFileId: null,
      idCardBackFileId: null,
      acceptedTerms: false,
    },
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props { initialUser?: UserDto | null; }

export function InscriptionPage({ initialUser }: Props) {
  const [state, setState]             = useState<InscriptionState>(() => buildInitialState(initialUser));
  const [currentStep, setCurrentStep] = useState(1);
  const [completionScore, setCompletionScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError]     = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  // ── Restore progress on mount ─────────────────────────────────────────────
  useEffect(() => {
    async function restore() {
      // 1. Fresh localStorage cache → instant restore, no API call
      const cached = readCache();
      if (cached) {
        setState(cached.state);
        setCurrentStep(cached.step);
        setCompletionScore(cached.score ?? computeCompletion(cached.state));
        setIsRestoring(false);
        return;
      }

      // 2. Stale/missing cache → fetch from API
      try {
        const result = await getOnboardingProgress();
        if (result.ok && result.data) {
          const base = buildInitialState(initialUser);
          const { state: restored, currentStep: step } = mapProgressToState(result.data, base);
          const score = result.data.completionScore ?? 0;
          setState(restored);
          setCurrentStep(step);
          setCompletionScore(score);
          writeCache(restored, step, score);
        }
      } catch {
        // API unreachable — just keep the initial state, no crash
      }

      setIsRestoring(false);
    }
    restore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debounced save to localStorage on every state/step change ─────────────
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (isRestoring) return; // don't overwrite cache during restore phase
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => writeCache(state, currentStep, completionScore), 2000);
    return () => clearTimeout(saveTimer.current);
  }, [state, currentStep, completionScore, isRestoring]);

  // ── Clear cache when dossier is submitted (Step7 calls setSubmitted) ───────
  // Step7 handles the submitted view internally; we expose clearCache for it
  // via a noop here — Step7 already shows SubmittedView on success.

  const update: UpdateFn = useCallback(<K extends keyof InscriptionState>(
    key: K,
    value: InscriptionState[K] | ((prev: InscriptionState[K]) => InscriptionState[K]),
  ) => {
    setState((prev) => ({
      ...prev,
      [key]: typeof value === "function"
        ? (value as (p: InscriptionState[K]) => InscriptionState[K])(prev[key])
        : value,
    }));
  }, []);

  // Backend score is authoritative — updated after every step save and on initial API load.
  const completion = completionScore;
  const stepsDone  = Math.min(currentStep - 1, 7);

  const goTo = (step: number) => {
    setStepError(null);
    setCurrentStep(Math.max(1, Math.min(7, step)));
  };
  const prev = () => goTo(currentStep - 1);

  const handleContinue = useCallback(async () => {
    setStepError(null);

    let savedScore: number | undefined;

    if (currentStep === 1) {
      setIsSubmitting(true);
      const result = await submitStep1(state.account);
      setIsSubmitting(false);
      if (!result.ok) { setStepError(result.error.message); return; }
      savedScore = result.data.completionScore;
    }

    if (currentStep === 2) {
      setIsSubmitting(true);
      const result = await submitStep2(state.hotel);
      setIsSubmitting(false);
      if (!result.ok) { setStepError(result.error.message); return; }
      savedScore = result.data.completionScore;
    }

    if (currentStep === 3) {
      setIsSubmitting(true);
      const result = await submitStep3(state.equip);
      setIsSubmitting(false);
      if (!result.ok) { setStepError(result.error.message); return; }
      savedScore = result.data.completionScore;
    }

    if (currentStep === 4) {
      setIsSubmitting(true);
      const result = await submitStep4(state.roomTypes);
      setIsSubmitting(false);
      if (!result.ok) { setStepError(result.error.message); return; }
      savedScore = result.data.completionScore;
    }

    if (currentStep === 5) {
      const va = state.valueAdds;
      const fixedKeys = ["restaurant", "bar", "pool", "gym", "spa", "conference", "outdoor"] as const;
      const fixedSpaces = fixedKeys
        .filter((k) => va[k].configured)
        .map((k) => {
          const entry = va[k] as unknown as Record<string, unknown>;
          return {
            spaceKey:       k,
            id:             k,
            isOpenToPublic: !!entry.isOpenToPublic,
            imageIds:       (entry.imageIds as string[]) ?? [],
            name:           entry.name        as string | undefined,
            description:    entry.description as string | undefined,
            cuisine:        entry.cuisine     as string | undefined,
            priceAvg:       entry.priceAvg    as number | undefined,
            capacity:       entry.capacity    as string | number | undefined,
            type:           entry.type        as string | undefined,
            depth:          entry.depth       as number | undefined,
            rooms:          entry.rooms       as number | undefined,
            hours:          entry.hours       as string | undefined,
          };
        });
      setIsSubmitting(true);
      const result = await submitStep5({ fixedSpaces, customSpaces: va.customSpaces });
      setIsSubmitting(false);
      if (!result.ok) { setStepError(result.error.message); return; }
      savedScore = result.data.completionScore;
    }

    if (currentStep === 6) {
      setIsSubmitting(true);
      const result = await submitStep6(state.pricing);
      setIsSubmitting(false);
      if (!result.ok) { setStepError(result.error.message); return; }
      savedScore = result.data.completionScore;
    }

    if (savedScore !== undefined) {
      setCompletionScore(savedScore);
    }

    goTo(currentStep + 1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, state.account, state.hotel, state.equip, state.roomTypes, state.valueAdds, state.pricing]);

  const StepComponent = STEP_COMPONENTS[currentStep - 1];
  const isWide = currentStep === 7;
  const isMultiCol = currentStep === 1 || currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5 || currentStep === 6;

  return (
    <div className="insc-root">
      <div className="grid grid-cols-[88px_1fr] min-h-dvh bg-[#F4F5F9] text-ink font-sans antialiased tracking-[-0.008em] font-features-['ss01','cv11','kern']">
        <Sidebar
          currentStep={currentStep}
          goTo={goTo}
          completion={completion}
          stepsDone={stepsDone}
        />

        <div
          className={cn(
            "min-w-0 flex flex-col bg-white rounded-[20px] overflow-hidden shadow-[0_0_0_1px_rgba(10,10,15,0.05),0_4px_24px_rgba(10,10,15,0.06)]",
            isWide ? "mt-2.5 mr-3 mb-3 ml-0" : "m-4 ml-0"
          )}
        >
          <div
            className={cn(
              isWide
                ? "w-full max-w-[1560px] mx-auto px-[clamp(24px,3vw,48px)] pt-8 pb-27"
                : isMultiCol
                ? "flex-1 w-full px-13 pt-10 pb-25"
                : "flex-1 max-w-230 px-13 pt-10 pb-25"
            )}
          >
            {isRestoring ? (
              /* ── Restoring progress — brief skeleton overlay ── */
              <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-4 animate-insc-fade">
                <div className="w-10 h-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
                <p className="text-[13px] text-ink-3">Restauration de votre progression…</p>
              </div>
            ) : (
              <div key={currentStep} className="animate-insc-step-enter">
                <StepComponent
                  state={state}
                  update={update}
                  completion={completion}
                  goTo={goTo}
                />
              </div>
            )}
          </div>

          <div className="sticky bottom-0 z-100 flex items-center justify-between gap-4 px-13 py-3 bg-white/90 backdrop-blur-lg backdrop-saturate-160 border-t border-[rgba(10,10,15,0.05)] shadow-[0_-1px_0_rgba(10,10,15,0.04),0_-8px_24px_rgba(10,10,4,0.03)]">
            <div className="flex-1 flex items-center gap-3">
              {currentStep > 1 && (
                <Btn variant="ghost" onClick={prev} disabled={isSubmitting || isRestoring}>
                  <Icon name="chevronLeft" size={16} /> Précédent
                </Btn>
              )}
              <span className="text-[11px] text-ink-3 font-semibold tracking-widest uppercase font-mono">
                {String(currentStep).padStart(2, "0")}
                <span className="opacity-38"> / 07</span>
              </span>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex gap-0.75 items-center">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-label={`Étape ${s}`}
                    className={cn(
                      "w-5.5 h-0.5 rounded-[1px] cursor-pointer transition-colors duration-250",
                      s === currentStep ? "bg-ink" : s < currentStep ? "bg-[rgba(10,10,15,0.22)]" : "bg-[rgba(10,10,15,0.10)]"
                    )}
                    onClick={() => (s <= currentStep ? goTo(s) : undefined)}
                  />
                ))}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-end gap-2.5">
              {stepError && (
                <span className="text-[12px] text-danger font-medium max-w-55 text-right leading-tight">
                  {stepError}
                </span>
              )}
              <Btn variant="ghost" size="sm" disabled={isSubmitting || isRestoring}>
                <Icon name="fileText" size={14} /> Brouillon
              </Btn>
              {currentStep < 7 && (
                <Btn
                  variant="primary"
                  className="group"
                  onClick={handleContinue}
                  disabled={isSubmitting || isRestoring}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      Continuer
                      <BtnTrail>
                        <Icon name="chevronRight" size={13} />
                      </BtnTrail>
                    </>
                  )}
                </Btn>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
