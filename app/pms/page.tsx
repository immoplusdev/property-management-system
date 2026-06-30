import type { Metadata } from "next";
import { PMSApp } from "@/components/pms/PMSApp";
import { PmsPending } from "@/components/pms/PmsPending";
import { getCurrentUser } from "@/lib/api/auth/session";
import { getOnboardingStatus, type OnboardingStatus } from "@/lib/api/onboarding/onboarding.actions";
import { getHotelSettings } from "@/lib/api/pms/settings.actions";

export const metadata: Metadata = {
  title: "Tableau de bord PMS · Immo Plus",
  description: "Property Management System",
};

export default async function PMSPage() {
  const [user, statusRes, settingsRes] = await Promise.all([
    getCurrentUser(),
    getOnboardingStatus(),
    getHotelSettings(),
  ]);

  const hotelName = settingsRes.ok ? settingsRes.data.name : "Hôtel";

  return <PMSApp user={user} hotelName={hotelName} />;
}
