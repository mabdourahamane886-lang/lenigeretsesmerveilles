[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/mabdourahamane886-lang/lenigeretsesmerveilles)

# Le Niger et ses Merveilles 🇳🇪

Plateforme web nigérienne de découverte, d'événements, de culture, de patrimoine, de gastronomie et de contributions citoyennes.

## Stack

- Next.js 15 + App Router
- React 19
- Authentification administrateur privée + Supabase/PostgreSQL pour les données
- Cloudflare Workers
- OpenNext for Cloudflare
- Wikimedia Commons pour une partie de la photothèque avec crédits/licences

## Déploiement Cloudflare

Le projet est préparé pour Cloudflare Workers avec OpenNext. Cloudflare documente actuellement OpenNext pour conserver une application Next.js existante avec SSR, Server Actions, Middleware et App Router.

### Secrets de déploiement requis

Configurer sur la plateforme de déploiement :

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_SALT_B64`
- `ADMIN_PASSWORD_HASH_B64`
- `ADMIN_SESSION_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SECRET_KEY` (pour les écritures serveur)

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

## Authentification et Supabase

La connexion `/admin-login` n'utilise pas Supabase Auth. L'identité administrateur est vérifiée côté serveur avec PBKDF2 et une session HMAC signée.

Supabase reste uniquement la base de données du contenu du site. Aucune connexion administrateur n'est envoyée à Supabase Auth.

## Contenu

Les contenus publics sont stockés dans Supabase : régions, merveilles, événements, cultures, gastronomie, articles, médias et contributions. Les contributions publiques sont modérées avant publication.
