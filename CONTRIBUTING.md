# Contributing

## Supabase Auth — règle impérative

**Ne jamais créer de validation d'environnement custom côté client pour Supabase sur Lovable.**

Utiliser uniquement la source de vérité du client auto-généré (`src/integrations/supabase/client.ts`).

### Ce qui est interdit

- Vérifier `import.meta.env.VITE_SUPABASE_URL` ou `VITE_SUPABASE_PUBLISHABLE_KEY` dans `App.tsx`, `main.tsx`, `Auth.tsx` ou `useAuth.tsx`.
- Créer des guards de type `EnvValidationGuard`, `validateClientEnv`, ou `isAuthConfigured` qui bloquent le login.
- Remapper les erreurs d'authentification Supabase vers un message générique de type "service non configuré".

### Ce qui est autorisé

- Utiliser `supabaseAvailable` depuis `@/integrations/supabase/client` pour la dégradation gracieuse de fonctionnalités non-auth (IA, health checks).
- Laisser `supabase.auth.signInWithPassword()` s'exécuter et afficher les vraies erreurs d'authentification à l'utilisateur.

### Test anti-régression

Un test automatisé (`src/test/no-env-guard-auth.test.ts`) vérifie que ces fichiers protégés ne contiennent aucun guard d'environnement bloquant. Ce test doit rester vert.
