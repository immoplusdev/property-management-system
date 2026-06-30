import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Immo Plus PMS",
  description: "Property Management System — Immo Plus Côte d'Ivoire",
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
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/ms-icon-144x144.png",
    "theme-color": "#2744DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="m-0 min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
