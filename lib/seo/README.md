# SEO Implementation Guide

Cette directory contient tous les fichiers et helpers nécessaires pour maintenir une implémentation SEO complète et professionnelle.

## 📋 Structure

- `seo.config.ts` - Configuration centralisée du site et des pages
- `structured-data.ts` - Schémas JSON-LD réutilisables
- `meta-helpers.ts` - Helpers pour générer les métadonnées
- `README.md` - Ce fichier

## 🚀 Configuration Centrale (`seo.config.ts`)

Tous les paramètres SEO du site sont centralisés ici:
- **SITE_CONFIG** - Informations générales du site (domaine, description, réseaux sociaux)
- **SEO_PAGES** - Configuration par page (titre, description, priorité dans le sitemap)
- **SOCIAL_MEDIA** - Handles des réseaux sociaux

### Utilisation

```typescript
import { SITE_CONFIG, SEO_PAGES, getMetadataTitle } from "@/lib/seo/seo.config";

// Dans une page
export const metadata: Metadata = {
  title: SEO_PAGES.home.title,
  description: SEO_PAGES.home.description,
};
```

## 📄 Ajouter une nouvelle page

### Étape 1: Ajouter la configuration

```typescript
// Dans seo.config.ts - SEO_PAGES
nomPage: {
  title: "Titre | Immo Plus Pro",
  description: "Description courte et pertinente",
  path: "/nom-page",
  priority: 0.8,
  changeFreq: "monthly" as const,
  keywords: "mot-clé1, mot-clé2",
}
```

### Étape 2: Ajouter les métadonnées à la page

```typescript
// Dans app/nom-page/page.tsx
import type { Metadata } from "next";
import { SEO_PAGES, SITE_CONFIG, getCanonicalUrl } from "@/lib/seo/seo.config";

export const metadata: Metadata = {
  title: SEO_PAGES.nomPage.title,
  description: SEO_PAGES.nomPage.description,
  keywords: SEO_PAGES.nomPage.keywords,
  canonical: getCanonicalUrl(SEO_PAGES.nomPage.path),
  openGraph: {
    type: "website",
    url: getCanonicalUrl(SEO_PAGES.nomPage.path),
    title: SEO_PAGES.nomPage.title,
    description: SEO_PAGES.nomPage.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_PAGES.nomPage.title,
    description: SEO_PAGES.nomPage.description,
  },
};

export default function Page() {
  // ...
}
```

## 📊 Fichiers de site

### sitemap.ts
Généré automatiquement via `/app/sitemap.ts` - Liste toutes les pages indexables du site.

### robots.ts
Généré automatiquement via `/app/robots.ts` - Définit les règles d'indexation.

## 🏷️ Données structurées (JSON-LD)

Disponibles dans `structured-data.ts`:

- **breadcrumb** - Chemin de navigation
- **faq** - Questions fréquemment posées
- **article** - Articles de blog
- **localBusiness** - Entreprise locale
- **softwareApplication** - Application logicielle

### Utilisation

```typescript
import { schemas } from "@/lib/seo/structured-data";

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas.faq([
            { question: "Q1?", answer: "A1" },
            { question: "Q2?", answer: "A2" },
          ])),
        }}
      />
      {/* ... */}
    </>
  );
}
```

## 🔗 Canonical URLs

Toujours utiliser `getCanonicalUrl()` pour les URLs canoniques:

```typescript
import { getCanonicalUrl } from "@/lib/seo/seo.config";

getCanonicalUrl("/ma-page") // https://pro.immoplus.ci/ma-page
```

## 📱 Open Graph & Twitter Cards

Automatiquement générés dans le layout racine et chaque page. Les images utilisent:
- **Image par défaut**: `/og-image.png`
- **Dimensions recommandées**: 1200x630px
- **Format**: PNG, JPG

## ✅ Checklist de mise en place

- [ ] Configurer `SITE_CONFIG` avec le domaine réel
- [ ] Ajouter/mettre à jour les réseaux sociaux dans `SOCIAL_MEDIA`
- [ ] Créer les images social media (og-image.png, etc.)
- [ ] Ajouter les métadonnées à chaque nouvelle page
- [ ] Configurer le domaine dans les variables d'environnement (`NEXT_PUBLIC_SITE_URL`)
- [ ] Tester avec les validateurs:
  - Google Search Console
  - Facebook Sharing Debugger
  - Twitter Card Validator
- [ ] Soumettre le sitemap à Google Search Console

## 🔍 Variables d'environnement

```env
NEXT_PUBLIC_SITE_URL=https://pro.immoplus.ci
```

## 📞 Support & Maintenance

### Mise à jour régulière
- Vérifier l'exactitude des titres/descriptions
- Mettre à jour les images social media saisonnièrement
- Surveiller les erreurs d'indexation dans Google Search Console
- Mettre à jour les changements de fréquence des pages (changeFreq)

### Outils recommandés
- Google Search Console
- Google PageSpeed Insights
- Lighthouse
- Schema.org Validator
- Facebook Sharing Debugger

---

*Dernière mise à jour: 2026*
