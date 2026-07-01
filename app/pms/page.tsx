import type { Metadata } from "next";
import { PMSApp } from "@/components/pms/PMSApp";
import { PmsPending } from "@/components/pms/PmsPending";
import { getCurrentUser } from "@/lib/api/auth/session";
import { getOnboardingStatus, type OnboardingStatus } from "@/lib/api/onboarding/onboarding.actions";
import { getHotelSettings } from "@/lib/api/pms/settings.actions";
import { SEO_PAGES, SITE_CONFIG, getCanonicalUrl } from "@/lib/seo/seo.config";

export const metadata: Metadata = {
  title: SEO_PAGES.pms.title,
  description: SEO_PAGES.pms.description,
  keywords: SEO_PAGES.pms.keywords,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: getCanonicalUrl(SEO_PAGES.pms.path),
  },
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
