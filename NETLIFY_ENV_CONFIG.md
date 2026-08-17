# Configuration des Variables d'Environnement — Netlify

## 🚨 Problème Actuel

Votre site Netlify PRODUCTION pointe vers `api-dev.immoplus.ci` au lieu de `api-v2.immoplus.ci`.

```
❌ ACTUEL (PROD utilise DEV API)
https://pro.immoplus.ci → API: https://api-dev.immoplus.ci (MAUVAIS!)

✅ DEVRAIT ÊTRE
https://pro.immoplus.ci → API: https://api-v2.immoplus.ci (CORRECT)
```

---

## 🔧 Solution: Configurer Netlify Dashboard

### Étape 1: Accéder aux Settings d'Environnement

1. **Allez sur:** [Netlify Dashboard](https://app.netlify.com)
2. **Sélectionnez votre site:** `pro.immoplus.ci`
3. **Allez à:** `Settings` → `Build & deploy` → `Environment`

### Étape 2: Ajouter les Variables PRODUCTION

**Pour la branche `main` (production):**

| Variable | Valeur |
|----------|--------|
| `API_URL` | `https://api-v2.immoplus.ci` |
| `AUTH_SOURCE` | `pro_app` |
| `NEXT_PUBLIC_WS_URL` | `wss://api-v2.immoplus.ci` |
| `NEXT_PUBLIC_SITE_URL` | `https://pro.immoplus.ci` |

### Étape 3: Ajouter les Variables STAGING (optionnel)

**Pour la branche `staging` (si vous l'avez):**

| Variable | Valeur |
|----------|--------|
| `API_URL` | `https://api-staging.immoplus.ci` |
| `AUTH_SOURCE` | `pro_app` |
| `NEXT_PUBLIC_WS_URL` | `wss://api-staging.immoplus.ci` |
| `NEXT_PUBLIC_SITE_URL` | `https://staging.immoplus.ci` |

### Étape 4: Redéployer

Une fois les variables ajoutées:

```bash
# Option A: Via Netlify Dashboard
1. Settings → Deploys
2. Cliquez "Trigger deploy" → "Clear cache and redeploy"

# Option B: Via Git (meilleur)
git commit -m "chore: update env config docs"
git push origin main
# Netlify redéploiera automatiquement avec les bonnes vars
```

---

## 📋 Variables par Environnement (Référence Complète)

### 🖥️ LOCAL DEVELOPMENT (.env.local)

```env
API_URL=https://api-dev.immoplus.ci
AUTH_SOURCE=pro_app
NEXT_PUBLIC_WS_URL=wss://api-dev.immoplus.ci
NEXT_PUBLIC_SITE_URL=https://dev.immoplus.ci
```

**Usage:** `npm run dev` → utilise `.env.local`

---

### 🚀 PRODUCTION (.env.production — Netlify main branch)

```env
API_URL=https://api-v2.immoplus.ci
AUTH_SOURCE=pro_app
NEXT_PUBLIC_WS_URL=wss://api-v2.immoplus.ci
NEXT_PUBLIC_SITE_URL=https://pro.immoplus.ci
```

**Where:** Netlify Dashboard → Settings → Environment  
**Branch:** `main`

---

### 📊 STAGING (.env.staging — Netlify staging branch)

```env
API_URL=https://api-staging.immoplus.ci
AUTH_SOURCE=pro_app
NEXT_PUBLIC_WS_URL=wss://api-staging.immoplus.ci
NEXT_PUBLIC_SITE_URL=https://staging.immoplus.ci
```

**Where:** Netlify Dashboard → Settings → Environment  
**Branch:** `staging` (si créé)

---

## 🔐 Sécurité: Ce qui est exposé au navigateur

### ❌ SECRETS (Server-only, jamais exposé)

- `API_URL` — Contient le host de l'API backend
- Tous les tokens JWT/cookies

### ✅ PUBLIC (Expose au navigateur, safe)

Les variables préfixées `NEXT_PUBLIC_*` sont visibles dans le navigateur:

- `NEXT_PUBLIC_WS_URL` — URL WebSocket (pas de secrets)
- `NEXT_PUBLIC_SITE_URL` — URL canonique pour SEO

**La clé:** `API_URL` ne contient PAS de secrets (juste l'host), et elle n'est jamais accessible au client grâce au BFF proxy.

---

## 🔄 Comment Ça Marche: Next.js Build

Quand Netlify build votre site:

```
1. Netlify récupère les env vars de Dashboard
2. Next.js build (`npm run build`)
   ├─ Injecte API_URL (server-only, Next.js 13+)
   ├─ Injecte NEXT_PUBLIC_* (bundled dans le JS client)
   └─ Génère le site statique + API routes
3. Deploy sur https://pro.immoplus.ci
```

**Les variables API_URL ne sont jamais expédiées au client** — elles sont utilisées server-side dans les fonctions Next.js.

---

## ✅ Checklist: Vérifier que c'est Correct

### Dans Netlify Dashboard:

- [ ] Allez à `Settings` → `Environment`
- [ ] Vérifiez que `API_URL=https://api.immoplus.ci` (PAS `api-dev`)
- [ ] Vérifiez que `NEXT_PUBLIC_WS_URL=wss://api.immoplus.ci`
- [ ] Vérifiez que `NEXT_PUBLIC_SITE_URL=https://pro.immoplus.ci`

### Après redéploiement:

Ouvrez la console du navigateur sur `https://pro.immoplus.ci`:

```javascript
// Vérifiez dans la console
console.log(process.env.NEXT_PUBLIC_SITE_URL)
// Devrait afficher: https://pro.immoplus.ci

// Vérifiez les appels API (Network tab)
// Les requêtes devraient aller à https://api.immoplus.ci, pas api-dev
```

### Vérifier le WebSocket:

```javascript
// Dans la console, vérifiez la WebSocket connection
// DevTools → Network → WS (WebSocket)
// Devrait montrer: wss://api.immoplus.ci/socket.io/?...
```

---

## 🐛 Déboguer si ça ne marche pas

### Problème: Toujours pointe vers api-dev en prod

**Causes possibles:**

1. **Variables pas actualisées dans Netlify**
   - Allez à `Settings` → `Environment`
   - Vérifiez que les valeurs sont corrects
   - **Important:** Les changements ne prennent effet qu'après un redeploy

2. **Cache Netlify**
   - Settings → Deploys → "Clear cache and redeploy"
   - Attendez que le build finisse

3. **Ancien .env.local committé**
   - Vérifiez `.gitignore` : doit avoir `.env*`
   - Jamais ne committer `.env.local` ou `.env.production`

4. **Next.js build problem**
   - Vérifiez les logs du build Netlify
   - Cherchez "API_URL" dans les logs

### Solution rapide:

```bash
# 1. Vérifiez que .gitignore ignore les .env
grep "env" .gitignore

# 2. Vérifiez que les fichiers .env ne sont pas committés
git status | grep env

# 3. Ajoutez + committez les templates (pas les vrais fichiers)
git add .env.example .env.production .env.staging
git commit -m "docs: add env config templates"
git push origin main

# 4. Manuellement redéploirez sur Netlify
# Settings → Deploys → "Trigger deploy" → "Deploy site"
```

---

## 📚 Fichiers Impliqués

```
Project Root
├── .env.example          ← Template (COMMITTER) — pour la doc
├── .env.local            ← Dev local (IGNORER) — jamais committer
├── .env.production       ← Prod template (pour référence) — jamais committer
├── .env.staging          ← Staging template (pour référence) — jamais committer
├── .gitignore            ← Doit avoir ".env*"
└── NETLIFY_ENV_CONFIG.md ← This file
```

**Règle d'Or:** Seulement `.env.example` est commis. Les autres sont locaux ou sur Netlify Dashboard.

---

## 🎯 Résumé

| Environnement | API Host | WS Host | Site URL | Config Location |
|---------------|----------|---------|----------|-----------------|
| **Local Dev** | `api-dev` | `api-dev` | `dev` | `.env.local` |
| **Staging** | `api-staging` | `api-staging` | `staging` | Netlify Dashboard |
| **Production** | `api-v2` | `api-v2` | `pro` | Netlify Dashboard |

**L'erreur actuelle:** Prod utilise `api-dev` au lieu de `api-v2`.  
**La fix:** Ajouter/corriger les env vars dans Netlify Dashboard, puis redéployer.

---

## 🚀 Prochaines Étapes

1. **Allez sur Netlify Dashboard** et vérifiez/corrigez les env vars
2. **Trigger un redeploy** pour appliquer les changements
3. **Testez en prod** que les appels API vont bien à `api-v2.immoplus.ci`
4. **Commitez ce fichier** pour que l'équipe sache comment configurer

---

**Besoin d'aide?** Consultez:
- [Netlify Env Vars](https://docs.netlify.com/configure-builds/environment-variables/)
- [Next.js Env Vars](https://nextjs.org/docs/basic-features/environment-variables)
