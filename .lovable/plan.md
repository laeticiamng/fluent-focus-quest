

# Plan : Corriger les erreurs de build + Améliorer l'immersion 3D

## Partie 1 — Corriger les erreurs de build (5 fichiers)

### 1. `src/components/3d/LazarusScene.tsx` (lignes 119, 150)
Les refs `innerRingRef` et `outerRingRef` sont typées `THREE.Mesh` mais passées à des `<group>`. Changer le type des refs en `THREE.Group` — ou bien remplacer les `<group ref={...}>` par des `<mesh ref={...}>` selon ce qui englobe les enfants. Ici, les `<group>` contiennent plusieurs `<mesh>` enfants, donc on change le type des refs :
- `innerRingRef = useRef<THREE.Group>(null)`
- `outerRingRef = useRef<THREE.Group>(null)`

### 2. `src/components/Grammar.tsx` (ligne 448)
Le cast `(ex as Record<string, unknown>).fr` retourne `unknown`. Ajouter un cast en `string` :
```tsx
{String((ex as Record<string, unknown>).fr)}
```

### 3. `src/components/InterviewSimulator.tsx` (ligne 347)
`celebrate("achievement")` — le type `CelebrationEvent.type` n'inclut pas `"achievement"`. Changer en `celebrate("milestone")` qui est le plus proche sémantiquement.

### 4. `src/components/InterviewSimulator.tsx` (ligne 909)
Comparaison `simState === "full_sim"` alors que `simState` est `"results"` dans ce contexte. Vérifier le type union de `simState` et corriger la logique — probablement stocker un flag séparé `isFullSim` plutôt que comparer directement le state actuel.

### 5. `src/hooks/useProgress.ts` (lignes 468-478)
`safeQuestState` et `safeEscapeState` sont typés `{}` (objet vide). Ajouter des assertions de type :
```ts
const safeEscapeState = (loaded.escapeState && typeof loaded.escapeState === "object"
  ? loaded.escapeState : {}) as Partial<EscapeState>;
const safeQuestState = (loaded.questState && typeof loaded.questState === "object"
  ? loaded.questState : {}) as Partial<QuestState>;
```

---

## Partie 2 — Améliorer l'immersion 3D

L'infrastructure 3D actuelle est déjà riche (PremiumLighting, PostProcessing, DecorativeElements, 4 scènes). Voici les améliorations pour passer au niveau supérieur :

### A. Effets atmosphériques avancés (DecorativeElements.tsx)
- **Brouillard volumétrique** : Ajouter `<fog>` ou `<fogExp2>` dans chaque Canvas pour donner de la profondeur atmosphérique et masquer les bords.
- **Particules ambiantes améliorées** : Augmenter le count des `AmbientParticles`, ajouter des variations de taille et de vitesse, et introduire des "fireflies" (points lumineux erratiques avec emissive fort).
- **Dust motes / cendres** : Nouveaux systèmes de particules thématiques par zone (braises pour la Forge, spores vertes pour Grammar, éclats violets pour Studio).

### B. Caméra cinématique (nouveau : CinematicCamera.tsx)
- Créer un composant `CinematicCamera` qui fait un lent mouvement orbital automatique (auto-rotate très lent) avec un léger effet de breathing (zoom in/out subtil) pour donner vie à la scène même quand l'utilisateur n'interagit pas.
- Ajouter un smooth damping au OrbitControls existant (augmenter `dampingFactor`).

### C. Post-processing renforcé (PostProcessing.tsx)
- Ajouter un effet **ChromaticAberration** très subtil (offset 0.001) pour un look cinématique.
- Ajouter **DepthOfField** (léger, bokeh large) pour focaliser l'attention sur les éléments centraux.
- Affiner le bloom : abaisser le threshold pour que les éléments emissifs brillent davantage.

### D. Matériaux premium (tous les fichiers 3D)
- Remplacer certains `meshStandardMaterial` par `meshPhysicalMaterial` pour les éléments clés (autel, sigils, portails) — ajouter `clearcoat`, `transmission`, et `iridescence` pour un rendu plus premium.
- Ajouter des effets Fresnel visibles sur les bords des objets importants.

### E. Éclairage dynamique (PremiumLighting.tsx)
- Ajouter des lumières qui pulsent lentement en fonction de l'état du jeu (plus de sigils = lumières plus intenses/colorées).
- Introduire un `useFrame` dans le lighting pour des variations subtiles d'intensité au fil du temps (respiration lumineuse).

### F. Skybox amélioré (PremiumLighting.tsx)
- Passer la résolution du canvas de 512 à 1024.
- Ajouter des étoiles (points blancs aléatoires) et des nébuleuses plus colorées.
- Ajouter une animation lente de rotation du skybox.

---

## Fichiers impactés

| Fichier | Action |
|---------|--------|
| `src/components/3d/LazarusScene.tsx` | Fix types refs |
| `src/components/Grammar.tsx` | Fix ReactNode cast |
| `src/components/InterviewSimulator.tsx` | Fix celebrate type + simState comparison |
| `src/hooks/useProgress.ts` | Fix type assertions |
| `src/components/3d/premium/PostProcessing.tsx` | Ajouter ChromaticAberration, DepthOfField |
| `src/components/3d/premium/PremiumLighting.tsx` | Skybox HD + étoiles + breathing lights |
| `src/components/3d/premium/DecorativeElements.tsx` | Particules thématiques, fireflies |
| `src/components/3d/HubScene.tsx` | Fog, caméra cinématique, matériaux physiques |
| `src/components/3d/MapScene.tsx` | Fog, matériaux physiques |
| `src/components/3d/LazarusScene.tsx` | Fog, matériaux physiques pour l'autel |
| `src/components/3d/Inventory3DScene.tsx` | Fog, matériaux physiques pour les artefacts |

