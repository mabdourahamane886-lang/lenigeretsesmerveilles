# SMS AUTH

Plateforme indépendante d'authentification par numéro, WhatsApp et API de vérification. Interface en français, conçue pour le Niger (+227) et les numéros internationaux.

## Fonctionnalités réellement codées
- Dashboard professionnel responsive avec connexion Supabase Auth (e-mail / mot de passe).
- Création de projets isolés par compte, génération de clés API affichées **une seule fois**, révocation des clés.
- Envoi réel de codes OTP 6 chiffres avec **Meta WhatsApp Cloud API** et modèle d'authentification approuvé (bouton « Copier le code »).
- API serveur : POST /api/v1/otp/send et POST /api/v1/otp/verify.
- Codes non conservés en clair (HMAC), expiration 5 minutes, 5 essais maximum.
- Rate limit en base : un code par minute et numéro/projet, maximum 5 codes/heure/numéro, maximum 300 codes/heure/projet.
- Historique, statistiques et états de livraison fournis par webhook Meta signé.
- Test d'envoi et de validation depuis le dashboard.
- Aucune clé secrète n'est transmise au navigateur.

## Installation

Prérequis : Node.js 22, le projet Supabase **Bickri service agency** (tables indépendantes `sms_auth_*`), une application Meta Business avec un numéro WhatsApp Business Platform autorisé.

1. Copier les fichiers du dossier sms-auth dans un dépôt GitHub distinct ou définir **Root Directory = sms-auth** sur Vercel.
2. Exécuter npm install et npm run dev depuis le dossier sms-auth.
3. Le projet Supabase **Bickri service agency** (`okdohokhlkxrmxpevees`) possède déjà les trois tables `sms_auth_*`, créées avec RLS et sans accès public aux OTP ni aux clés. Ne pas réexécuter les migrations sans vérifier leur état. Activer l'authentification e-mail et la confirmation d'e-mail.
4. Configurer les variables d'environnement dans Vercel et dans les secrets Cloudflare : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (serveur seulement), `OTP_PEPPER`, les identifiants Meta. Le service role possède des accès très étendus aux autres données du projet partagé : le limiter aux environnements de production contrôlés et ne jamais le divulguer.
5. Créer un modèle Meta de catégorie **AUTHENTICATION** avec bouton **COPY_CODE**, le faire approuver. Renseigner son nom et sa langue.
6. Définir le webhook Meta avec l'URL https://VOTRE-DOMAINE/api/webhooks/whatsapp, le même WHATSAPP_VERIFY_TOKEN et s'abonner aux événements messages.
7. Configurer le token Meta de longue durée avec les permissions adéquates, puis tester l'envoi sur un numéro WhatsApp réel ayant consenti à recevoir un code.
8. Déployer sur Vercel ou sur un runtime Next.js compatible. Ne pas exposer SUPABASE_SERVICE_ROLE_KEY, OTP_PEPPER, META_APP_SECRET ou WHATSAPP_ACCESS_TOKEN.

L'interface ne simule **jamais** un message envoyé : sans configuration Meta valide, elle affiche une erreur explicite.

## API — Envoyer un code

Requête serveur à serveur :

POST /api/v1/otp/send
Authorization: Bearer sa_live_...
Content-Type: application/json

{"phone":"+22790000000","consent":true}

Réponse 202 (après acceptation de Meta) :

{"success":true,"challenge_id":"UUID","expires_in":300,"status":"sent"}

L'authentification du partenaire se fait par **clé API de son projet**. Le numéro doit être au format E.164 et le destinataire doit avoir demandé le code.

## API — Vérifier un code

POST /api/v1/otp/verify
Authorization: Bearer sa_live_...
Content-Type: application/json

{"challenge_id":"UUID","code":"123456"}

Réponse 200 : {"verified":true,"phone":"+22790000000"} en cas de succès.

Ne jamais appeler les endpoints partenaires directement depuis un navigateur avec la clé API. L'application cliente doit utiliser **son propre backend**.

## Intégration avec Supabase Auth d'une autre application

Les OTP émis par SMS AUTH prouvent **la possession du numéro** après validation, mais ne créent pas automatiquement de session Supabase Auth dans une application tierce. L'application intégratrice doit associer le résultat vérifié à un compte connecté, ou configurer un hook Supabase Send SMS avec vérification de la signature du hook. Une intégration de hook est une phase distincte; ne pas copier une clé service_role d'un autre projet dans le frontend.

## Limitations assumées

- **WhatsApp fonctionne avec Meta Business Platform configurée** : un compte gratuit WhatsApp ordinaire ne suffit pas; les messages peuvent être facturés.
- **SMS téléphonique classique n'est pas encore branché** : il faut ajouter une passerelle d'opérateur pour ce canal. Ne pas le confondre avec le canal WhatsApp déjà implémenté.
- La base et les identifiants Meta doivent être configurés avant une utilisation réelle.
- La livraison reste asynchrone : « accepted by Meta » n'implique pas « delivered ». Le webhook met à jour l'état.
- Pour un usage à grande échelle, ajouter des quotas par IP, un suivi antifraude avancé et des alertes de dépenses.

Documentation : Meta WhatsApp Business Platform et Supabase Auth (https://supabase.com/docs/guides/auth/phone-login).

## Déploiements du 24 novembre 2026

- **Cloudflare Workers** : `https://sms-auth.bickriservice-agency.workers.dev` — version Next.js/OpenNext publiée sur le compte Cloudflare `bickriservice-agency` et vérifiée via Cloudflare Browser Rendering. La plateforme est visible, mais les API sécurisées attendent les secrets serveur et la configuration Meta.
- **Vercel** : projet `sms-auth` créé avec `Root Directory = sms-auth` ; le premier build a échoué à cause du plugin PostCSS hérité. La configuration a été corrigée dans la branche `sms-auth-platform`, mais une nouvelle publication a été bloquée par la limite quotidienne des déploiements API Vercel. Ne pas déclarer Vercel opérationnel avant un déploiement READY.
- **Supabase** : URL publique liée à `https://okdohokhlkxrmxpevees.supabase.co`. Migration des trois tables et isolation RLS confirmées. Les secrets `SUPABASE_SERVICE_ROLE_KEY` et Meta doivent être définis dans chaque plateforme avant d'activer les envois réels.
- Dans Supabase Auth → URL Configuration, autoriser les URL de callback des domaines déployés (Cloudflare et Vercel) pour terminer la confirmation d'e-mail.
