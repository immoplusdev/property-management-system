import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SITE_CONFIG, SOCIAL_MEDIA, getCanonicalUrl } from "@/lib/seo/seo.config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.domain),
  title: {
    template: "%s | " + SITE_CONFIG.name,
    default: SITE_CONFIG.defaultTitle,
  },
  description: SITE_CONFIG.defaultDescription,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: SITE_CONFIG.author, url: SITE_CONFIG.domain }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { rel: "icon", type: "image/x-icon", url: "/favicon.ico" },
      { rel: "icon", type: "image/png", sizes: "16x16", url: "/favicon-16x16.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", url: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "96x96", url: "/favicon-96x96.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", url: "/android-icon-192x192.png" },
    ],
    apple: [
      { sizes: "57x57", url: "/apple-icon-57x57.png" },
      { sizes: "60x60", url: "/apple-icon-60x60.png" },
      { sizes: "72x72", url: "/apple-icon-72x72.png" },
      { sizes: "76x76", url: "/apple-icon-76x76.png" },
      { sizes: "114x114", url: "/apple-icon-114x114.png" },
      { sizes: "120x120", url: "/apple-icon-120x120.png" },
      { sizes: "144x144", url: "/apple-icon-144x144.png" },
      { sizes: "152x152", url: "/apple-icon-152x152.png" },
      { sizes: "180x180", url: "/apple-icon-180x180.png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_CONFIG.name,
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.domain,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    images: [
      {
        url: `${SITE_CONFIG.domain}${SITE_CONFIG.socialImage}`,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.defaultTitle,
        type: "image/png",
      },
      {
        url: `${SITE_CONFIG.domain}${SITE_CONFIG.socialImage}`,
        width: 800,
        height: 600,
        alt: SITE_CONFIG.defaultTitle,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: `@${SITE_CONFIG.twitterHandle}`,
    creator: `@${SITE_CONFIG.twitterHandle}`,
    title: SITE_CONFIG.defaultTitle,
    description: SITE_CONFIG.defaultDescription,
    images: [`${SITE_CONFIG.domain}${SITE_CONFIG.socialImage}`],
  },
  other: {
    "msapplication-TileColor": SITE_CONFIG.msapplicationTileColor,
    "msapplication-TileImage": SITE_CONFIG.msapplicationTileUrl,
    "theme-color": SITE_CONFIG.themeColor,
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": SITE_CONFIG.name,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.domain,
  logo: `${SITE_CONFIG.domain}${SITE_CONFIG.logoUrl}`,
  description: SITE_CONFIG.defaultDescription,
  email: SITE_CONFIG.email,
  telephone: SITE_CONFIG.phone,
  sameAs: [
    `https://twitter.com/${SOCIAL_MEDIA.twitter}`,
    `https://facebook.com/${SOCIAL_MEDIA.facebook}`,
    `https://linkedin.com/company/${SOCIAL_MEDIA.linkedin}`,
    `https://instagram.com/${SOCIAL_MEDIA.instagram}`,
  ],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_CONFIG.name,
  url: SITE_CONFIG.domain,
  description: SITE_CONFIG.defaultDescription,
  publisher: {
    "@type": "Organization",
    name: SITE_CONFIG.name,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.domain}${SITE_CONFIG.logoUrl}`,
    },
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_CONFIG.domain}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema),
          }}
        />
      </head>
      <body className="m-0 min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
