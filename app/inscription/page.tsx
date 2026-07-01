import type { Metadata } from "next";
import { InscriptionPage } from "@/components/inscription/InscriptionPage";
import { getCurrentUser } from "@/lib/api/auth/session";
import { SEO_PAGES, SITE_CONFIG, getCanonicalUrl } from "@/lib/seo/seo.config";

export const metadata: Metadata = {
  title: SEO_PAGES.inscription.title,
  description: SEO_PAGES.inscription.description,
  keywords: SEO_PAGES.inscription.keywords,
  alternates: {
    canonical: getCanonicalUrl(SEO_PAGES.inscription.path),
  },
  openGraph: {
    type: "website",
    url: getCanonicalUrl(SEO_PAGES.inscription.path),
    title: SEO_PAGES.inscription.title,
    description: SEO_PAGES.inscription.description,
    locale: SITE_CONFIG.locale,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: `${SITE_CONFIG.domain}${SITE_CONFIG.socialImage}`,
        width: 1200,
        height: 630,
        alt: SEO_PAGES.inscription.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_PAGES.inscription.title,
    description: SEO_PAGES.inscription.description,
    images: [`${SITE_CONFIG.domain}${SITE_CONFIG.socialImage}`],
  },
};

export default async function Page() {
  const user = await getCurrentUser();
  return <InscriptionPage initialUser={user} />;
}
