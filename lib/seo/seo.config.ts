export const SITE_CONFIG = {
  name: "Immo Plus Pro",
  domain: process.env.NEXT_PUBLIC_SITE_URL || "https://pro.immoplus.ci",
  defaultTitle: "Immo Plus Pro · Plateforme Hôtelière",
  defaultDescription: "Plateforme de gestion hôtelière pour les hôtels en Côte d'Ivoire. Gérez vos réservations, tarifs et occupancy en temps réel.",
  language: "fr-CI",
  keywords: "hôtel, gestion hôtelière, réservations, Côte d'Ivoire, PMS, property management",
  author: "Immo Plus",
  email: "support@immoplus.ci",
  phone: "+225 07 XX XX XX XX",
  locale: "fr_CI",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  appleTouchIconUrl: "/apple-icon-180x180.png",
  msapplicationTileUrl: "/ms-icon-144x144.png",
  msapplicationTileColor: "#ffffff",
  themeColor: "#2744DE",
  backgroundColor: "#ffffff",
  socialImage: "/og-image.png",
  twitterHandle: "@immoplus_ci",
};

export type SeoPageConfig = {
  title: string;
  description: string;
  path: string;
  priority: number;
  changeFreq: "weekly" | "monthly" | "daily";
  keywords: string;
  noIndex?: boolean;
};

export const SEO_PAGES: Record<string, SeoPageConfig> = {
  home: {
    title: "Immo Plus Pro · Plateforme Hôtelière pour la Côte d'Ivoire",
    description: "Gérez votre hôtel facilement avec Immo Plus Pro. Réservations, tarifs, occupancy et paiements en temps réel.",
    path: "/",
    priority: 1.0,
    changeFreq: "weekly",
    keywords: "gestion hôtelière, plateforme hôtels, Côte d'Ivoire",
  },
  login: {
    title: "Connexion | Immo Plus Pro",
    description: "Connectez-vous à votre espace hôtelier Immo Plus Pro.",
    path: "/login",
    priority: 0.8,
    changeFreq: "monthly",
    keywords: "connexion, authentification",
  },
  inscription: {
    title: "Inscription Hôtelier | Immo Plus Pro",
    description: "Enregistrez votre hôtel sur Immo Plus Pro en 7 étapes simples. Commencez à gérer vos réservations dès maintenant.",
    path: "/inscription",
    priority: 0.9,
    changeFreq: "monthly",
    keywords: "inscription, enregistrement hôtel, création compte",
  },
  pms: {
    title: "Tableau de Bord PMS | Immo Plus Pro",
    description: "Gérez votre hôtel en temps réel. Réservations, tarifs, occupancy, paiements et rapports d'activité.",
    path: "/pms",
    priority: 0.8,
    changeFreq: "daily",
    keywords: "tableau de bord, PMS, gestion réservations",
    noIndex: true,
  },
};

export const SOCIAL_MEDIA = {
  twitter: "immoplus_ci",
  facebook: "immoplusci",
  linkedin: "immoplus",
  instagram: "immoplus_ci",
};

export function getMetadataTitle(pageTitle?: string): string {
  if (!pageTitle) return SITE_CONFIG.defaultTitle;
  return `${pageTitle} | ${SITE_CONFIG.name}`;
}

export function getMetadataDescription(desc?: string): string {
  return desc || SITE_CONFIG.defaultDescription;
}

export function getCanonicalUrl(path: string): string {
  return `${SITE_CONFIG.domain}${path}`;
}
