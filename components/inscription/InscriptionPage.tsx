"use client";
import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import { Step4 } from "./steps/Step4";
import { Step5 } from "./steps/Step5";
import { Step6 } from "./steps/Step6";
import { Step7 } from "./steps/Step7";
import { Icon } from "./ui/Icon";
import { INITIAL_STATE } from "./constants";
import type { InscriptionState, UpdateFn } from "./types";

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
  if (hotel.galleryCount >= 5) score += 5;
  if (hotel.hasVideo) score += 3;

  // Step 3 — 10 pts
  const equipCount = Object.values(equip).filter((v) => v === true).length;
  score += Math.min(10, Math.round((equipCount / 18) * 10));

  // Step 4 — 25 pts
  if (roomTypes.length > 0) score += 5;
  const completeRooms = roomTypes.filter((r) => r.complete).length;
  if (completeRooms === roomTypes.length && roomTypes.length > 0) score += 10;
  const photosTotal = roomTypes.reduce((s, r) => s + (r.photos ?? 0), 0);
  if (photosTotal >= 10) score += 5;
  if (roomTypes.some((r) => r.hasVideo)) score += 5;

  // Step 5 — 10 pts
  const vaCount = Object.values(valueAdds).filter((x) => x.configured).length;
  score += Math.min(10, vaCount * 2);

  // Step 6 — 10 pts
  if (pricing.payWave || pricing.payOM || pricing.payCard) score += 5;
  if (pricing.cancelPolicy) score += 3;
  if (pricing.depositRequired !== undefined) score += 2;

  // Step 7 — 10 pts (when all above is done)
  if (score >= 85) score += 4;

  return Math.min(100, score);
}

const STEP_COMPONENTS = [Step1, Step2, Step3, Step4, Step5, Step6, Step7];

export function InscriptionPage() {
  const [state, setState] = useState<InscriptionState>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState(1);

  const update: UpdateFn = useCallback(<K extends keyof InscriptionState>(
    key: K,
    value: InscriptionState[K]
  ) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const completion = computeCompletion(state);
  const stepsDone = Math.min(currentStep - 1, 7);

  const goTo = (step: number) => setCurrentStep(Math.max(1, Math.min(7, step)));
  const prev = () => goTo(currentStep - 1);
  const next = () => goTo(currentStep + 1);

  const StepComponent = STEP_COMPONENTS[currentStep - 1];

  return (
    <div className="insc-root">
      <div className="insc-app">
        <Sidebar
          currentStep={currentStep}
          goTo={goTo}
          completion={completion}
          stepsDone={stepsDone}
        />

        <div className={`insc-main${currentStep === 7 ? " insc-main-wide" : ""}`}>
          <div className={`insc-content${currentStep === 7 ? " insc-content-wide" : ""}`}>
            <div key={currentStep} className="step-content">
              <StepComponent
                state={state}
                update={update}
                completion={completion}
                goTo={goTo}
              />
            </div>
          </div>

          <div className="insc-nav">
            <div className="insc-nav-left">
              {currentStep > 1 && (
                <button className="btn btn-ghost" onClick={prev}>
                  <Icon name="chevronLeft" size={16} /> Précédent
                </button>
              )}
              <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: "var(--mono)" }}>
                {String(currentStep).padStart(2, "0")}
                <span style={{ opacity: 0.38 }}> / 07</span>
              </span>
            </div>

            <div className="insc-nav-center">
              <div className="insc-nav-dots">
                {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                  <div
                    key={s}
                    className={`nav-dot${s === currentStep ? " active" : s < currentStep ? " done" : ""}`}
                    onClick={() => s <= currentStep ? goTo(s) : undefined}
                    title={`Étape ${s}`}
                  />
                ))}
              </div>
            </div>

            <div className="insc-nav-right">
              <button className="btn btn-ghost btn-sm">
                <Icon name="fileText" size={14} /> Brouillon
              </button>
              {currentStep < 7 ? (
                <button className="btn btn-primary" onClick={next}>
                  Continuer
                  <span className="btn-trail">
                    <Icon name="chevronRight" size={13} />
                  </span>
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
