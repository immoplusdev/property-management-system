import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api/auth/session";
import LandingPage from "@/components/landing/LandingPage";
import { SEO_PAGES, SITE_CONFIG, getCanonicalUrl } from "@/lib/seo/seo.config";

export const metadata: Metadata = {
  title: SEO_PAGES.home.title,
  description: SEO_PAGES.home.description,
  keywords: SEO_PAGES.home.keywords,
  alternates: {
    canonical: getCanonicalUrl(SEO_PAGES.home.path),
  },
  openGraph: {
    type: "website",
    url: getCanonicalUrl(SEO_PAGES.home.path),
    title: SEO_PAGES.home.title,
    description: SEO_PAGES.home.description,
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.domain}${SITE_CONFIG.socialImage}`,
        width: 1200,
        height: 630,
        alt: SEO_PAGES.home.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_PAGES.home.title,
    description: SEO_PAGES.home.description,
    images: [`${SITE_CONFIG.domain}${SITE_CONFIG.socialImage}`],
  },
};

export default async function Home() {
  const user = await getCurrentUser();
  return <LandingPage user={user} />;
}
