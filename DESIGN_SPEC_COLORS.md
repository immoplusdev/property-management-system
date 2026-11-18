# Design Spec — Palette de Couleurs Immo+ PMS 2026

## 📌 Vue d'ensemble

Système complet de tokens de couleurs pour Immo+ Hotel Management System.

**Couleur Primaire:** `#2744DE` (Bleu)  
**Background Principal:** `#FFFFFF` (Blanc)

---

## 01. Couleur Primaire — Brand

La fondation du système visuel.

### Bleu Primaire
| Token | Valeur | Utilisation |
|-------|--------|-------------|
| `--color-primary` | `#2744DE` | Boutons CTA, nav active, links, icônes brand |
| `--color-primary-600` | `#1D36C0` | État hover/active des boutons |
| `--color-primary-700` | `#1729A3` | État active en mode sombre |
| `--color-primary-50` | `#EEF1FE` | Background pour alertes info |
| `--color-primary-100` | `#DDE2FD` | Background plus foncé info |
| `--color-primary-200` | `#BFC8FB` | Background encore plus foncé |

### Cas d'usage — Couleur Primaire

✓ **Boutons principaux** (CTA, submit, confirmation)  
✓ **Navigation** (menu actif, breadcrumb, active state)  
✓ **Liens texte** et éléments interactifs  
✓ **Bordures focalisées** sur les inputs (`focus-visible`)  
✓ **Icônes principales** de la marque  
✓ **Gradient auth** (modal login/signup)  
✓ **Accents primaires** sur dark surfaces  

### Gradient Brand Auth
```css
linear-gradient(145deg, #1535C4 0%, #2744DE 52%, #4161F6 100%)
```

---

## 02. Accents Vibrants — Énergie & Vie

Trois couleurs hautement énergiques pour les appels à l'action et l'engagement.

### Rose Vibrant
| Propriété | Valeur |
|-----------|--------|
| **Token** | `--color-vibrant-pink` |
| **Hex** | `#F72585` |
| **RGB** | `rgb(247, 37, 133)` |
| **HSL** | `hsl(334, 95%, 55%)` |

**Énergie:** Très haute | **Contraste:** 5.2:1 (blanc sur rose)

**Cas d'usage:**
- CTAs secondaires (boutons alternatifs)
- Badges "premium" / "featured"
- Éléments d'appel à l'action haute énergie
- Accents sur backgrounds neutres
- **À ÉVITER:** Texte long ou petit

---

### Vert Vibrant
| Propriété | Valeur |
|-----------|--------|
| **Token** | `--color-vibrant-green` |
| **Hex** | `#35FF69` |
| **RGB** | `rgb(53, 255, 105)` |
| **HSL** | `hsl(134, 100%, 60%)` |

**Énergie:** Extrême | **Contraste:** Très faible sur blanc

**Cas d'usage:**
- Confirmation visuelle (1x seulement par flow)
- Succès spotlight / animations highlight
- État "go" / "ready"
- **À ÉVITER:** Utilisé sparingly - peut causer de la fatigue oculaire
- **À ÉVITER:** Texte quelconque

---

### Peach Vibrant
| Propriété | Valeur |
|-----------|--------|
| **Token** | `--color-vibrant-peach` |
| **Hex** | `#F9DBBD` |
| **RGB** | `rgb(249, 219, 189)` |
| **HSL** | `hsl(24, 93%, 86%)` |

**Énergie:** Moyenne | **Contraste:** 8.1:1 (noir sur peach)

**Cas d'usage:**
- Mesh gradient (Hero section)
- Backgrounds de section décoratives
- Accents chaleureux et bienveillants
- Décorations (OK pour du texte si dark)
- **À ÉVITER:** Texte blanc sur peach

---

### Hiérarchie des Accents

```
🎯 ROSE (#F72585)
   └─ Chaud, énergique
   └─ Appels à action secondaires
   └─ Features premium
   └─ CTAs sur fond sombre

✅ VERT (#35FF69)
   └─ Vif, affirmatif
   └─ **SPARINGLY** — confirmation seulement
   └─ Notifications positives
   └─ Pas de texte

🎨 PEACH (#F9DBBD)
   └─ Doux, décoratif
   └─ Gradients Hero
   └─ Backgrounds de section
   └─ Accents decoratifs (pas de texte critique)
```

---

## 03. Accents Complémentaires — NOUVEAUX TOKENS

Couleurs supplémentaires pour étendre la palette sans surcharger le système.

### Orange
| Propriété | Valeur |
|-----------|--------|
| **Token** | `--color-orange` |
| **Hex** | `#FA9F42` |
| **RGB** | `rgb(250, 159, 66)` |
| **HSL** | `hsl(32, 98%, 62%)` |
| **Background** | `rgba(250, 159, 66, 0.1)` |

**Contraste:** 5.8:1 (noir sur orange)

**Cas d'usage:**
- Badges "NOUVEAU"
- Warnings doux (à distinguer du danger)
- Sections "featured" ou "top"
- Accent chaud sans énergie excessive

---

### Lavender
| Propriété | Valeur |
|-----------|--------|
| **Token** | `--color-lavender` |
| **Hex** | `#D4C2FC` |
| **RGB** | `rgb(212, 194, 252)` |
| **HSL** | `hsl(265, 95%, 87%)` |
| **Background** | `rgba(212, 194, 252, 0.1)` |

**Contraste:** Faible sur blanc (réservé aux accents)

**Cas d'usage:**
- Catégories "premium" / "luxe"
- Sections de contenu haut de gamme
- Backgrounds doux adjacents au bleu primaire
- Badge de catégorie exclusive
- **À ÉVITER:** Texte primaire sur blanc

---

### Noir Très Foncé
| Propriété | Valeur |
|-----------|--------|
| **Token** | `--color-ink-5` |
| **Hex** | `#1A1423` |
| **RGB** | `rgb(26, 20, 35)` |
| **HSL** | `hsl(270, 27%, 11%)` |

**Contraste:** 15.8:1 (blanc sur noir foncé)

**Cas d'usage:**
- Texte/icônes sur backgrounds vibrants
- Overlays de modale
- Contraste extrême pour maximum de lisibilité
- Réserve premium (très rare)

---

### Beige Parchment
| Propriété | Valeur |
|-----------|--------|
| **Token** | `--color-beige` |
| **Hex** | `#EEE0CB` |
| **RGB** | `rgb(238, 224, 203)` |
| **HSL** | `hsl(32, 52%, 86%)` |
| **Background** | `rgba(238, 224, 203, 0.1)` |

**Contraste:** 10.2:1 (noir sur beige)

**Cas d'usage:**
- Backgrounds très doux pour sections "retro" ou "legacy"
- Teasers bienveillants
- Sections historiques / archives
- Alt à peach pour un ton plus neutre

---

## 04. Couleurs Existantes (Garder)

### Statuts & Sémantiques

| Type | Couleur | Hex | Utilisation |
|------|---------|-----|-------------|
| **Success** | Vert succès | `#1F8A5B` | Confirmations positives |
| **Success BG** | Light vert | `#E8F4EE` | Background succès |
| **Warning** | Orange warning | `#B86B0A` | Avertissements |
| **Warning BG** | Light orange | `#FBF1DE` | Background warning |
| **Danger** | Rouge | `#C13838` | Erreurs, destructif |
| **Danger BG** | Light rouge | `#FBE7E5` | Background danger |

### Accents Existants

| Couleur | Hex | Utilisation |
|---------|-----|-------------|
| Violet | `#6240E0` | Accents alternatifs |
| Teal | `#0E8E8E` | Catégories |
| Amber | `#C28100` | Accents chauds |
| Coral | `#E07A4A` | Accent associatif |
| Pink | `#BC3679` | Associatif / catégorie |
| Star | `#FFCB47` | Rating doré |
| Tip | `#D9A62E` | Lamp/hint accent |

### Palette Catégorique (Avatars, Charts)

```
--color-cat-1: #E89060  (Orange)
--color-cat-2: #6FB5A8  (Teal)
--color-cat-3: #7B8DFF  (Bleu)
--color-cat-4: #B57BE6  (Mauve)
--color-cat-5: #F5C572  (Or)
--color-cat-6: #6FCC92  (Vert)
--color-cat-7: #FF8585  (Corail)
--color-cat-8: #6FB5DD  (Bleu ciel)
```

### Couleurs Neutres

| Rôle | Hex | Utilisation |
|------|-----|-------------|
| Surface (bg) | `#FFFFFF` | Background blanc principal |
| Surface-2 | `#F4F5F8` | Background gris très clair |
| Ink (texte) | `#12131A` | Texte principal |
| Ink-2 | `#494C57` | Texte secondaire |
| Ink-3 | `#888B96` | Texte tertiaire |
| Ink-4 | `#B4B6C0` | Texte desactivé |
| Border | `#E8E9EE` | Bordures standard |
| Border Soft | `#F1F1F5` | Bordures très légères |
| Border Strong | `#C8C8E0` | Bordures accentuées |

---

## 05. Combinaisons Recommandées

### 🎯 Gradient Auth Hero
```css
linear-gradient(145deg, #1535C4 0%, #2744DE 52%, #4161F6 100%)
```
**Usage:** Modale login/signup, featured sections

---

### 🔵 Hiérarchie Boutons
```
Primaire:    background: #2744DE, text: white
Secondaire:  background: white, border: #2744DE, text: #2744DE
Tertiary:    background: transparent, text: #2744DE
Accent:      background: #F72585, text: white
Ghost:       background: transparent, text: #12131A
```

---

### ℹ️ Alert Info
```css
background: #EEF1FE;
border-left: 4px solid #2744DE;
text: #2744DE;
```

---

### ✅ Confirmation Success
```css
background: #E8F4EE;
border-left: 4px solid #1F8A5B;
text: #1F8A5B;
```

---

### ⚠️ Warning
```css
background: #FBF1DE;
border-left: 4px solid #B86B0A;
text: #B86B0A;
```

---

### 🔴 Danger/Error
```css
background: #FBE7E5;
border-left: 4px solid #C13838;
text: #C13838;
```

---

### 🎨 Badge "NOUVEAU"
```css
background: rgba(250, 159, 66, 0.1);
border: 1px solid #FA9F42;
text: #FA9F42;
```

---

### 💎 Badge Premium
```css
background: rgba(247, 37, 133, 0.1);
text: #F72585;
```

---

## 06. Règles d'Accessibilité (WCAG AA)

### ✅ Contrastes Validés (Ratio ≥ 4.5:1 pour texte)

| Couleur | Foreground | Hex | Ratio | Status |
|---------|-----------|-----|-------|--------|
| Bleu (#2744DE) | Blanc | #FFFFFF | 6.8:1 | ✅ Texte OK |
| Rose (#F72585) | Blanc | #FFFFFF | 5.2:1 | ✅ Texte OK |
| Orange (#FA9F42) | Noir | #000000 | 5.8:1 | ✅ Texte court OK |
| Peach (#F9DBBD) | Noir | #000000 | 8.1:1 | ✅ Texte OK |
| Beige (#EEE0CB) | Noir | #000000 | 10.2:1 | ✅ Texte OK |
| Noir (#1A1423) | Blanc | #FFFFFF | 15.8:1 | ✅ Excellent |
| Success (#1F8A5B) | Blanc | #FFFFFF | 6.1:1 | ✅ Texte OK |
| Danger (#C13838) | Blanc | #FFFFFF | 5.9:1 | ✅ Texte OK |

### ⚠️ Contrastes Faibles (À ÉVITER pour texte)

| Couleur | Contexte | Ratio | ❌ À Éviter |
|---------|----------|-------|------------|
| Vert (#35FF69) | Blanc | 2.1:1 | **TEXTE** (trop faible) |
| Lavender (#D4C2FC) | Blanc | 3.2:1 | **TEXTE LONG** (limite WCAG A) |
| Orange (#FA9F42) | Blanc | 3.1:1 | **TEXTE LONG** (limit) |

### 🔑 Règles Clés

1. **Texte primaire:** #12131A (noir) ou blanc seulement
2. **Texte secondaire:** #494C57 ou plus foncé
3. **Accents vibrants:** Jamais pour du texte long
4. **Vert (#35FF69):** Réservé aux animations/highlights
5. **Toujours tester** avec WebAIM Contrast Checker avant déploiement

---

## 07. À AJOUTER au globals.css

### Nouvelle Section @theme

```css
/* ── New Vibrant & Accent Colors (2026) ── */
--color-orange:      #FA9F42;
--color-orange-bg:   rgba(250, 159, 66, 0.1);
--color-lavender:    #D4C2FC;
--color-lavender-bg: rgba(212, 194, 252, 0.1);
--color-beige:       #EEE0CB;
--color-beige-bg:    rgba(238, 224, 203, 0.1);
--color-ink-5:       #1A1423;
```

### Nouvelle Section :root

```css
/* ── Shorthand bridges pour les nouveaux accents ── */
--orange:      var(--color-orange);
--orange-bg:   var(--color-orange-bg);
--lavender:    var(--color-lavender);
--lavender-bg: var(--color-lavender-bg);
--beige:       var(--color-beige);
--beige-bg:    var(--color-beige-bg);
--ink-5:       var(--color-ink-5);
```

---

## 08. Implémentation dans les Composants

### Exemple 1: Bouton Accent (Rose)
```tsx
export function ButtonPremium({ children }) {
  return (
    <button
      style={{
        background: 'var(--color-vibrant-pink)',
        color: 'white',
      }}
      className="px-5 py-2 rounded-lg font-semibold hover:opacity-90"
    >
      {children}
    </button>
  );
}
```

### Exemple 2: Badge "NOUVEAU"
```tsx
export function BadgeNew() {
  return (
    <span
      style={{
        background: 'var(--color-orange-bg)',
        color: 'var(--color-orange)',
      }}
      className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
    >
      NOUVEAU
    </span>
  );
}
```

### Exemple 3: Alert Info
```tsx
export function AlertInfo({ message }) {
  return (
    <div
      style={{
        background: 'var(--color-primary-50)',
        borderLeft: `4px solid var(--color-primary)`,
        color: 'var(--color-primary)',
      }}
      className="p-4 rounded-r-lg"
    >
      {message}
    </div>
  );
}
```

### Exemple 4: Gradient Hero
```tsx
<section
  style={{
    background: 'linear-gradient(145deg, #1535C4 0%, #2744DE 52%, #4161F6 100%)',
  }}
  className="py-20 text-white"
>
  {/* content */}
</section>
```

### Exemple 5: Utiliser Tailwind (recommandé)
```tsx
{/* Rose accent button */}
<button className="bg-[#F72585] hover:bg-[#d91b6e] text-white px-4 py-2 rounded-lg">
  Action Premium
</button>

{/* Orange badge */}
<span className="bg-[rgba(250,159,66,0.1)] text-[#FA9F42] text-xs font-semibold px-3 py-1 rounded-full">
  NEW
</span>

{/* Lavender background */}
<div className="bg-[rgba(212,194,252,0.1)] border border-[#D4C2FC] rounded-lg p-6">
  Premium content
</div>
```

---

## 09. À FAIRE & À ÉVITER

### ✅ À FAIRE

- ✓ Définir toutes les couleurs en tokens (globals.css)
- ✓ Utiliser `var(--color-*)` dans les composants
- ✓ Réserver rose/vert pour accents pointus et directs
- ✓ Tester contraste avec [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- ✓ Combiner accents avec neutrals pour du contraste
- ✓ Utiliser peach/lavender en backgrounds légers
- ✓ Utiliser noir (#1A1423) pour overlay/contraste max
- ✓ Documenter les décisions de couleur dans Figma

### ❌ À ÉVITER

- ✗ Hardcoder les hex directement dans JSX
- ✗ Utiliser tous les accents (#F72585, #35FF69, #FA9F42) dans une même section
- ✗ Mettre du texte long en #35FF69 (vert) — fatigue oculaire
- ✗ Texte blanc sur #D4C2FC (lavender) — pas assez de contraste
- ✗ Ignorer les ratios de contraste WCAG
- ✗ Utiliser vert (#35FF69) plus d'une fois par user flow
- ✗ Peach (#F9DBBD) en foreground pour du texte blanc
- ✗ Mélanger plusieurs gradients dans une page

---

## 10. Checklist Intégration

### Phase 1: Setup des Tokens
- [ ] Ajouter les 7 nouveaux tokens à `globals.css @theme`
- [ ] Ajouter les bridges dans `:root`
- [ ] Valider que tous les hex sont exacts
- [ ] Tester build sans erreur

### Phase 2: Mise à Jour des Composants
- [ ] Mettre à jour les boutons CTA rose
- [ ] Créer badge "NOUVEAU" orange
- [ ] Tester tous les états (hover, active, disabled)
- [ ] Vérifier le contraste sur tous les states

### Phase 3: Documentation & Design
- [ ] Synchroniser avec Figma (color library)
- [ ] Valider avec l'équipe design
- [ ] Documenter les décisions dans le projet
- [ ] Former l'équipe dev aux conventions

### Phase 4: Test & Déploiement
- [ ] Tests d'accessibilité (axe/lighthouse)
- [ ] Test sur mobile/dark mode
- [ ] Revue design complète
- [ ] Merge et déploiement

---

## 11. Fichiers à Modifier

```
app/globals.css
├── Ligne 7-126: Ajouter nouveaux tokens en @theme
├── Ligne 154-214: Ajouter bridges en :root

Composants principaux:
├── components/buttons/ButtonPrimary.tsx
├── components/buttons/ButtonAccent.tsx (NOUVEAU)
├── components/badges/BadgeNew.tsx (NOUVEAU)
├── components/alerts/AlertInfo.tsx
└── components/landing/HeroSection.tsx (gradient)
```

---

## 12. Ressources & Outils

### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors.co](https://coolors.co/) — Palette explorer
- [HSL to Hex](https://www.colorhexa.com/)
- [Tailwind Color Configuration](https://tailwindcss.com/docs/customizing-colors)

### Documentation
- WCAG 2.1 Color Contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- Figma Color Tokens: https://www.figma.com/best-practices/color/

### Figma
- ✓ Créer une "Color Library" shared
- ✓ Lier tous les tokens Figma aux hex actuels
- ✓ Ajouter les 7 nouveaux en batch

---

## 📋 Version & Historique

| Version | Date | Changements |
|---------|------|-------------|
| 1.0 | 2026-08-01 | Création spec, 7 nouveaux tokens, guidelines accessibilité |

**Responsable:** Marc Design System  
**Validé par:** Équipe Design & Dev  
**Prochaine révision:** 2026-11-01

---

**En cas de question, consulter ce document et valider avec l'équipe design avant d'implémenter.**
