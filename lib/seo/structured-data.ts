import { SITE_CONFIG } from "./seo.config";

export const schemas = {
  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),

  faq: (
    items: Array<{
      question: string;
      answer: string;
    }>
  ) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }),

  article: (data: {
    headline: string;
    description: string;
    image?: string;
    datePublished?: string;
    dateModified?: string;
    author?: string;
  }) => ({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: data.headline,
    description: data.description,
    image: data.image ? [data.image] : [],
    datePublished: data.datePublished || new Date().toISOString(),
    dateModified: data.dateModified || new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: data.author || SITE_CONFIG.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.author,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.domain}${SITE_CONFIG.logoUrl}`,
      },
    },
  }),

  localBusiness: () => ({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_CONFIG.name,
    image: `${SITE_CONFIG.domain}${SITE_CONFIG.logoUrl}`,
    description: SITE_CONFIG.defaultDescription,
    url: SITE_CONFIG.domain,
    telephone: SITE_CONFIG.phone,
    email: SITE_CONFIG.email,
    areaServed: "CI",
    priceRange: "$$",
  }),

  softwareApplication: () => ({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_CONFIG.name,
    applicationCategory: "BusinessApplication",
    description: SITE_CONFIG.defaultDescription,
    url: SITE_CONFIG.domain,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "XOF",
    },
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.author,
    },
  }),
};
