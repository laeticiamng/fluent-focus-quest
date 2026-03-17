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

---

## Nettoyage de texte — safety guard obligatoire

Toute fonction de nettoyage de texte (`normalizePuzzleAnswer`, `normalizeGerman`, `normalizeReference`, `lookupTranslation`, `getCacheKey`, ou tout équivalent regex) **DOIT** être enveloppée avec `safeClean` (`src/utils/safeClean.ts`).

### Règle

- `safeClean` calcule `cleaned.length / Math.max(1, original.length)`
- Si le ratio est `< 0.3` (plus de 70 % du texte supprimé), le nettoyage est **annulé**
- Fallback immédiat sur le texte original
- Un warning explicite est loggué dans la console

### Pattern attendu

```ts
import { safeClean } from "@/utils/safeClean";

const result = safeClean(
  rawText,
  (t) => t.trim().toLowerCase().replace(/pattern/g, ""),
  "functionName",
);
```

### Fonctions actuellement protégées

| Fonction | Fichier |
|---|---|
| `normalizePuzzleAnswer` | `src/data/puzzleEngine.ts` |
| `normalizeGerman` | `src/components/PhraseGate.tsx` |
| `normalizeReference` | `src/components/PhraseGate.tsx` |
| `lookupTranslation` | `src/components/Clinical.tsx` |
| `getCacheKey` | `src/hooks/useAICoach.ts` |

**Toute nouvelle fonction de nettoyage DOIT utiliser `safeClean`.**
