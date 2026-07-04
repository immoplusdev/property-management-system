# Landing Page Refactoring - Modular Architecture

## Status
Refactoring from monolithic 1450+ line file to modular component structure.

## Completed ✓

### Created Files
- `shared.tsx` - Shared utilities and components
  - `btn` - Button style variant (CVA)
  - `Wrap` - Layout wrapper component
  - `BrandMark`, `BrandName` - Brand components
  - `Counter` - Animated number counter

### Extracted Sections (4 components)
1. **AnnounceBar.tsx** - Top banner with Calendar icon and Beta Hygge announcement
2. **Nav.tsx** - Navigation header with user menu
3. **Stats.tsx** - Stats section with 4 KPIs (42 chambres, 1 min, 100%, 24/7)
4. **Pricing.tsx** - Pricing cards section with 2 plans (Découverte, Partenaire)

### Index
- `sections/index.ts` - Exports all extracted sections

## Remaining Work

### 9 Sections to Extract
- [ ] **Hero.tsx** - Hero section with HeroCards component
- [ ] **Features.tsx** - Features grid with icons
- [ ] **DashboardShowcase.tsx** - Dashboard preview section
- [ ] **Payments.tsx** - Payment methods showcase
- [ ] **Security.tsx** - Security & reliability assurance
- [ ] **SplitShowcase.tsx** - Split panels (Accès partagé / Planning) with mockups
- [ ] **Steps.tsx** - Steps section (converted to single-line title after recent changes)
- [ ] **FAQ.tsx** - FAQ accordion section with FAQItem component
- [ ] **Footer.tsx** - Footer with 3-step impact banner and multi-column layout

## Migration Steps

### For Each Remaining Section:
1. Create `sections/SectionName.tsx`
2. Copy section function and all related:
   - Constants (e.g., `PLANS`, `FAQS`, `SECURITY_POINTS`)
   - Helper components (e.g., `FAQItem`, `ShareLinkMockup`)
3. Add necessary imports:
   ```tsx
   "use client";
   import { motion } from "framer-motion";
   import { reveal, stagger, ease } from "@/lib/animations/motion";
   import { Wrap, btn } from "../shared";
   // ... other imports
   ```
4. Export main component:
   ```tsx
   export function SectionName() { /* ... */ }
   ```

### Update Main File (LandingPage.tsx):
1. Remove function definitions for extracted components
2. Remove duplicate constants
3. Add imports:
   ```tsx
   import { 
     AnnounceBar, Nav, Stats, Pricing,
     // ... other sections as they're extracted
   } from "./sections";
   ```
4. Keep only:
   - Typography setup (Cal Sans, Plus Jakarta Sans)
   - Main LandingPage component
   - useEffect for login modal handling
   - Inline JSX with minimal logic

## Dependencies

### What Goes to `shared.tsx`
- `btn` (CVA variant)
- `Wrap` (layout container)
- `BrandMark`, `BrandName` (brand components)
- `Counter` (animated counter)

### What Each Section Imports
```tsx
"use client";
import { motion } from "framer-motion";
import { ANIMATIONS } from "@/lib/animations/motion";
import { UTILITIES } from "../shared";
// ... other imports as needed
```

### Avoid Circular Dependencies
- Main file imports from `sections/`
- Section files import from `shared.tsx` (not from main file)
- `shared.tsx` imports only from external packages and utils

## File Size Before/After

**Before:**
- `LandingPage.tsx`: 1450+ lines (monolithic)

**After:**
- `LandingPage.tsx`: ~300 lines (main file only)
- `sections/AnnounceBar.tsx`: ~50 lines
- `sections/Nav.tsx`: ~80 lines
- `sections/Stats.tsx`: ~40 lines
- `sections/Pricing.tsx`: ~100 lines
- `sections/*.tsx`: Individual 100-300 line files for each section
- `shared.tsx`: ~100 lines (utilities)

## Notes

- All component files use `"use client"` directive
- Sections are independent and can be tested in isolation
- Animation utilities (`reveal`, `stagger`, `ease`, `hoverTapButton`) imported from `@/lib/animations/motion`
- Layout utilities use existing design tokens from CSS variables

## References
- Script: `../../refactor-landing.sh` - Instructions for completing refactoring
- Shared utilities: `shared.tsx`
- Section index: `sections/index.ts`
