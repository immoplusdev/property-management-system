import { redirect } from "next/navigation";
import { getOnboardingStatus } from "@/lib/api/onboarding/onboarding.actions";
import { PmsStatusProvider } from "@/lib/pms/PmsStatusContext";
import { PmsStatusBanner } from "@/components/pms/PmsStatusBanner";
import type { OnboardingStatus } from "@/lib/api/onboarding/onboarding.actions";

const BANNER_STATUSES = new Set<OnboardingStatus>(["submitted", "under_review", "rejected"]);

export default async function PmsLayout({ children }: { children: React.ReactNode }) {
  const result = await getOnboardingStatus();

  // If we can't reach the API, allow access (fail-open) so a backend glitch
  // doesn't lock out hotel managers.
  if (!result.ok) {
    return (
      <PmsStatusProvider hasBanner={false}>
        {children}
      </PmsStatusProvider>
    );
  }

  const { status, rejectionReason } = result.data;

  // Onboarding not done — redirect to the inscription flow.
  if (status === "draft") {
    redirect("/inscription");
  }

  const hasBanner = BANNER_STATUSES.has(status as OnboardingStatus);

  return (
    <PmsStatusProvider hasBanner={hasBanner}>
      {hasBanner && (
        <PmsStatusBanner
          status={status as Exclude<OnboardingStatus, "draft" | "published">}
          rejectionReason={rejectionReason}
        />
      )}
      {/* Push page content below the fixed banner (h-11 = 44px). */}
      <div className={hasBanner ? "pt-11" : undefined}>
        {children}
      </div>
    </PmsStatusProvider>
  );
}
