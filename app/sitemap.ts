import type { MetadataRoute } from "next";
import { SEO_PAGES, SITE_CONFIG } from "@/lib/seo/seo.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = Object.values(SEO_PAGES).filter((page) => !page.noIndex);

  return pages.map((page) => ({
    url: `${SITE_CONFIG.domain}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFreq,
    priority: page.priority,
  }));
}
