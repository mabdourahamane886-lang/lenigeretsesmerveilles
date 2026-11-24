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

Prérequis : Node.js 22, un projet Supabase **dédié à SMS AUTH**, une application Meta Business avec un numéro WhatsApp Business Platform autorisé.

1. Copier les fichiers du dossier sms-auth dans un dépôt GitHub distinct ou définir **Root Directory = sms-auth** sur Vercel.
2. Exécuter npm install et npm run dev depuis le dossier sms-auth.
3. Créer un projet Supabase dédié. Dans SQL Editor, exécuter supabase/schema.sql. Activer l'authentification e-mail et la confirmation d'e-mail.
4. Copier .env.example en .env.local, puis compléter les variables d'environnement (ne jamais publier de secrets).
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
