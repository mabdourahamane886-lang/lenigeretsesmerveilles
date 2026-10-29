# Nouvelle architecture fonctionnelle de Niger IA

## Objectif et règles de migration

Cette architecture organise Niger IA en modules spécialisés tout en conservant le comportement existant pendant la transition. Elle ne remplace pas les tables de contenu, les dictionnaires, l'historique local ni les routes existantes. Chaque migration doit être additive, testable et réversible.

## Structure cible

```text
app/
  assistant/
    page.tsx                    # conversation principale (interface existante)
    fonctionnalites/page.tsx    # centre des modules Niger IA
    memory/page.tsx             # mémoire de compte avec consentement
    sources/page.tsx            # à construire : sources et traçabilité
    langues/page.tsx            # à construire : exploration linguistique
  api/
    assistant/route.ts          # orchestration de la réponse, limites de requête
    assistant/memory/route.ts   # CRUD de mémoire authentifiée
    assistant/feedback/route.ts # à construire : retours utilisateur
lib/
  niger-ia/
    retrieval.ts                # à extraire ensuite : recherche et classement
    citations.ts                # à construire : références vérifiables
    validation.ts               # à construire : validation des entrées
    providers.ts                # à construire : adaptateurs de modèles IA
  niger-knowledge/              # source de connaissance existante, conservée
  niger-dictionaries/           # dictionnaires existants, conservés
supabase/
  migrations/                   # migrations additives, jamais appliquées implicitement
docs/
  niger-ia-architecture.md
```

Les modules marqués « à construire » sont des cibles de l'architecture, pas des fonctionnalités déclarées comme déjà actives.

## Modules fonctionnels

1. **Conversation** — questions libres, contexte récent, démarrage de nouvelles discussions et suggestions thématiques.
2. **Connaissances du Niger** — histoire, géographie, régions, patrimoine, tourisme, gastronomie, événements et pratiques culturelles.
3. **Langues et dictionnaires** — recherche par langue, terme, traduction et prononciation; afficher le statut de vérification et la source lorsqu'ils existent. Ne jamais présenter une traduction non validée comme certifiée.
4. **Recherche documentaire** — retrouver les passages pertinents, classer les résultats, conserver le titre de la source et fournir des références ouvrables. Le système doit signaler quand aucune source fiable n'a été retrouvée.
5. **Mémoire personnelle facultative** — uniquement pour les utilisateurs connectés, consentement explicite, durée limitée, liste consultable, suppression individuelle ou totale. Ne pas enregistrer automatiquement les conversations dans cette mémoire.
6. **Historique et bibliothèque** — l'historique local existant reste intact dans la première étape. Une synchronisation cloud éventuelle nécessite un schéma distinct, des règles d'accès et un choix explicite de l'utilisateur.
7. **Retours et corrections** — permettre de signaler une erreur ou proposer une correction; conserver la proposition en attente de modération, sans modifier directement les connaissances validées.
8. **Administration éditoriale** — gestion des langues, sources et propositions avec rôles séparés, journalisation et validation humaine.
9. **Qualité multilingue** — tests en français, haoussa, zarma/sonrai, kanouri, tamasheq, fulfulde, arabe et autres langues prises en charge; les capacités doivent être mesurées, pas promises sans test.
10. **Sécurité et observabilité** — limites de taille, contrôle d'authentification, RLS, absence de clés secrètes dans le navigateur, délais d'expiration, journalisation sans contenu personnel inutile et messages d'erreur non sensibles.

## Principes de sécurité des données

- Ne pas supprimer, renommer ni réécrire les tables de contenu actuelles pendant cette refonte.
- Toute table contenant des données privées doit avoir RLS activé et des politiques testées avec deux comptes distincts.
- La mémoire doit être liée à `auth.uid()`; aucune requête cliente ne doit pouvoir lire la mémoire d'un autre compte.
- Les clés service-role ne sont utilisées que côté serveur. Aucun secret ne doit être préfixé `NEXT_PUBLIC_`.
- Les migrations sont versionnées dans Git et doivent être appliquées séparément après revue et sauvegarde. La migration de mémoire existante n'est pas appliquée automatiquement.
- Ne pas collecter de données sensibles dans les souvenirs. Prévoir expiration et suppression.
- Les propositions de dictionnaire et de contenu sont modérées avant publication.

## Ordre de livraison

### Étape A — Fondation non destructive
- Ajouter le centre des fonctionnalités et cette documentation.
- Garder les routes et composants existants.
- Vérifier lint, types, build et navigation mobile.

### Étape B — Recherche et sources
- Extraire le classement documentaire dans `lib/niger-ia/retrieval.ts`.
- Définir un format de citation stable et tester les liens.
- Ajouter des réponses de repli honnêtes lorsque les sources manquent.

### Étape C — Mémoire facultative
- Revoir la migration et la politique RLS.
- Appliquer la migration uniquement après validation.
- Tester consentement, expiration, suppression et isolation entre comptes.

### Étape D — Dictionnaire communautaire
- Workflow de proposition, révision, vérification et publication.
- Traçabilité des sources et des versions.
- Tests linguistiques par locuteurs compétents avant publication.

### Étape E — Administration et mesure qualité
- Rôles éditoriaux, audit des changements, tableau de bord d'erreurs.
- Jeux de tests multilingues et tests de non-régression.
- Déploiement progressif avec possibilité de retour arrière.

## Critères d'acceptation

- Aucune table ou donnée existante supprimée.
- Les pages et routes historiques restent accessibles.
- Les erreurs de recherche n'empêchent pas la réponse de base.
- La mémoire est désactivée tant que l'utilisateur ne donne pas son consentement et que la migration n'est pas installée.
- Les tests RLS démontrent qu'un compte ne peut pas lire ou modifier la mémoire d'un autre.
- Le lint, la vérification TypeScript et le build réussissent avant fusion.
- Aucun déploiement de production n'est considéré réussi sans URL et statut de déploiement confirmés.
