<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Directives d'Architecture & Optimisation des Ressources (Free-Tier & Zero-Overbudget)

L'ensemble des règles suivantes est destiné aux agents IA et aux développeurs travaillant sur ce projet. L'objectif est de garantir que le site fonctionne de façon optimale sans jamais dépasser les quotas gratuits (Database Egress Supabase < 5,5 Go, Vercel Fluid Active CPU < 4h, CDN < 100 Go).

---

## 1. RÈGLES STRICTES (NON NÉGOCIABLES)

### Règle 1 : Projection SQL Minimale Obligatoire (`select`)
- **INTERDIT** : Ne jamais exécuter `prisma.product.findMany()`, `prisma.article.findMany()` ou toute requête de liste sans clause `select` explicite.
- **APPLICATION** : Exclure systématiquement des listes, catalogues et cartes les colonnes volumineuses :
  - Corps de texte HTML/Markdown (`description`, `longDescription`, `content`).
  - Champs JSON volumineux (`attributes`, `metadata`).
  - Tableaux de données secondaires non affichés dans les vignettes.
- Ces colonnes lourdes sont réservées exclusivement aux pages de détail unique (`/produkt/[slug]`, `/blog/[slug]`).

### Règle 2 : Pagination Directe au Niveau SQL (`take` / `skip`)
- **INTERDIT** : Ne jamais charger tous les enregistrements en mémoire Node.js pour faire un `.slice()` en JavaScript.
- **APPLICATION** : La pagination doit toujours être déléguée à PostgreSQL :
  ```typescript
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: PRODUCT_CARD_SELECT,
      orderBy,
      take: limit,
      skip: (page - 1) * limit
    })
  ]);
  ```

### Règle 3 : Mise en Cache Serveur Multi-Niveaux (`unstable_cache`)
- **INTERDIT** : Ne jamais laisser des requêtes répétitives recalculer ou interroger la base sur des pages publiques marquées en `force-dynamic`.
- **APPLICATION** : Toutes les lectures fréquentes doivent être encapsulées dans `unstable_cache` (`next/cache`) avec un TTL (ex. `revalidate: 3600`) et des tags précis :
  - Paramètres globaux du site (`getCachedSettings`, tag: `['settings']`).
  - Arborescence des catégories du menu (`getCachedCategoriesTree`, tag: `['categories']`).
  - Produits et blocs de la page d'accueil (`getCachedHomepageProducts`, tag: `['products']`).
  - Données et compteurs des filtres de recherche / boutique (`getCachedShopFilterData`).
- Toute action d'administration créant, modifiant ou supprimant une ressource doit déclencher l'invalidation ciblée (`revalidatePath`, `updateTag` ou `revalidateTag`).

### Règle 4 : Métadonnées et Layouts sans Requêtes Redondantes
- **INTERDIT** : Ne jamais interroger la base de données en direct dans `generateMetadata()` ou `RootLayout` pour des paramètres déjà chargés.
- **APPLICATION** : Réutiliser systématiquement les fonctions en cache (`getCachedSettings()`). Cela garantit que la génération des en-têtes et du layout consomme **0 requête SQL supplémentaire**.

### Règle 5 : Hébergement Externe des Médias
- **INTERDIT** : Ne jamais stocker de fichiers binaires, blobs volumineux ou images base64 dans la base PostgreSQL.
- **APPLICATION** : Toutes les images et médias doivent être hébergés sur un stockage externe / CDN (Cloudinary, Cloudflare R2, S3) et optimisés via `next/image` (`webp`, `avif`).

### Règle 6 : Protection Contre les Crawlers et Bots Agressifs
- **APPLICATION** : Le fichier `src/app/robots.ts` doit systématiquement bloquer l'exploration inutile des pages de tri, recherche et filtres combinés (`/*?sort=`, `/*?filter=`, `/search`, `/admin/`, `/checkout/`). Cela évite que les robots d'indexation n'épuisent le CPU Vercel en déclenchant du SSR en continu.

---

## 2. RÈGLES NON STRICTES & BONNES PRATIQUES (RECOMMANDATIONS)

### Recommandation 1 : Résilience et Fallbacks Hors Ligne
- Pour les mécanismes de rate-limiting (Upstash Redis) ou de services tiers, prévoir un fallback local (cache en mémoire vive avec nettoyage automatique) afin que l'indisponibilité d'un service externe ne bloque jamais l'application.

### Recommandation 2 : Validation des Entrées (Server Actions & API)
- Utiliser un typage strict et/ou un validateur (ex. Zod) sur toutes les Server Actions et routes d'API pour rejeter immédiatement les requêtes malformées avant tout appel à la base de données.

### Recommandation 3 : Utilisation de Cloudflare en Bouclier DNS
- Dans la mesure du possible, positionner Cloudflare (plan gratuit) devant le domaine Vercel : il absorbe 90 % du trafic parasite (scrapers, attaques, requêtes statiques répétées) et préserve l'intégralité des 4 heures de CPU Vercel.

### Recommandation 4 : Transactions SQL Courtes
- Éviter d'englober des appels d'API externes (Stripe, PayPal, Resend) à l'intérieur d'une transaction Prisma (`prisma.$transaction`), car cela retient les connexions au pooler de la base de données trop longtemps.

### Recommandation 5 : Surveillance Périodique des Métriques
- Vérifier périodiquement l'onglet **Usage** sur Vercel et le tableau de bord de la base de données pour identifier rapidement toute anomalie ou régression introduite dans le code.



