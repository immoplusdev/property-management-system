import { SITE_CONFIG, getCanonicalUrl } from "./seo.config";

export interface PageMetaParams {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  noIndex?: boolean;
  type?: "website" | "article" | "product";
  publishedDate?: string;
  modifiedDate?: string;
  author?: string;
}

export function generateMetadata(params: PageMetaParams) {
  const {
    title,
    description,
    path,
    keywords,
    image = SITE_CONFIG.socialImage,
    imageAlt = title,
    noIndex = false,
    type = "website",
    publishedDate,
    modifiedDate,
    author = SITE_CONFIG.author,
  } = params;

  const fullTitle = `${title} | ${SITE_CONFIG.name}`;
  const imageUrl = image.startsWith("http")
    ? image
    : `${SITE_CONFIG.domain}${image}`;
  const canonicalUrl = getCanonicalUrl(path);

  return {
    title: fullTitle,
    description,
    keywords: keywords || SITE_CONFIG.keywords,
    canonical: canonicalUrl,
    alternates: { canonical: canonicalUrl },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    openGraph: {
      type,
      url: canonicalUrl,
      title: fullTitle,
      description,
      locale: SITE_CONFIG.locale,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
          type: "image/png",
        },
      ],
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: author ? [author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      site: `@${SITE_CONFIG.twitterHandle}`,
      creator: `@${SITE_CONFIG.twitterHandle}`,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.domain}${item.url}`,
    })),
  };
}

export function generateJsonLd(schema: Record<string, any>) {
  return {
    __html: JSON.stringify(schema),
  };
}
