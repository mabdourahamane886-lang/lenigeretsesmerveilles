[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mabdourahamane886-lang/lenigeretsesmerveilles)

# Le Niger et ses Merveilles 🇳🇪

Plateforme web nigérienne de découverte, d'événements, de culture, de patrimoine, de gastronomie et de contributions citoyennes.

## Stack

- Next.js 15 + App Router
- React 19
- Supabase Auth + PostgreSQL
- Cloudflare Workers
- OpenNext for Cloudflare
- Wikimedia Commons pour une partie de la photothèque avec crédits/licences

## Déploiement Cloudflare

Le projet est préparé pour Cloudflare Workers avec OpenNext. Cloudflare documente actuellement OpenNext pour conserver une application Next.js existante avec SSR, Server Actions, Middleware et App Router.

### Secrets GitHub requis

Dans GitHub → Settings → Secrets and variables → Actions, ajouter :

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Le token Cloudflare doit être limité aux droits nécessaires pour déployer le Worker. Ne jamais le mettre dans le dépôt.

Après un push sur `main`, `.github/workflows/deploy-cloudflare.yml` construit OpenNext puis exécute Wrangler pour déployer le Worker.

### Commandes locales

```bash
npm install
npm run dev
npm run build:cloudflare
npm run preview:cloudflare
npm run deploy
```

Le déploiement Cloudflare cible par défaut un sous-domaine `*.workers.dev` lorsque le compte Cloudflare autorise Workers.dev. Un domaine personnalisé peut ensuite être associé dans Cloudflare.

## Supabase

Le site utilise :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Aucune clé Service Role ne doit être exposée au navigateur.

## Contenu

Les contenus publics sont stockés dans Supabase : régions, merveilles, événements, cultures, gastronomie, articles, médias et contributions. Les contributions publiques sont modérées avant publication.
