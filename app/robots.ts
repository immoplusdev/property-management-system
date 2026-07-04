import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo/seo.config";

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/inscription"],
        disallow: [
          "/pms",
          "/admin",
          "/api",
          "/*.json$",
          "/search",
          "/tags",
          "/draft",
          "/preview",
        ],
      },
      {
        userAgent: "AdsBot-Google",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
    ],
    sitemap: `${SITE_CONFIG.domain}/sitemap.xml`,
    host: SITE_CONFIG.domain,
  };
}
