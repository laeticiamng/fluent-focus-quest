
# Plan : Immersion 3D niveau 2026 — Shaders custom, effets volumétriques, matériaux next-gen

L'infrastructure actuelle est déjà solide (lighting breathing, fireflies, post-processing, fresnel portals). Pour atteindre le "best of 2026", voici les améliorations qui font la vraie différence visuelle :

---

## A. Shader animé pour le skybox — Nebula vivante (PremiumLighting.tsx)

Remplacer le skybox statique Canvas2D par un **shader GLSL animé** directement sur la sphère. Effet : nébuleuse qui bouge en temps réel avec des courants de couleur, étoiles scintillantes, et pulsations lumineuses. Beaucoup plus immersif qu'une texture statique.

- Nouveau `ShaderMaterial` avec noise 3D simplex (implémenté en GLSL inline)
- Uniforms : `uTime`, palette de couleurs par preset
- Étoiles qui scintillent via un hash pseudo-random dans le fragment shader

## B. God Rays — Rayons volumétriques (PostProcessing.tsx)

Ajouter l'effet `GodRays` du package `postprocessing` (déjà installé). Source : un mesh sphérique émissif positionné au cœur de la scène (le core gem). Donne des rayons de lumière spectaculaires qui traversent les structures.

- Nouveau composant `<GodRaySource>` : sphère émissive invisible placée au centre
- Intégration dans `PremiumPostProcessing` avec `<GodRays>` de `@react-three/postprocessing`

## C. SSAO — Ambient Occlusion (PostProcessing.tsx)

Ajouter `<SSAO>` (Screen Space Ambient Occlusion) pour des ombres de contact réalistes dans les recoins. Donne immédiatement un look "AAA game".

## D. Matériaux avec Transmission — Cristaux translucides (HubScene, LazarusScene)

Convertir les core gems (icosahedrons centraux) en **verre/cristal** avec :
- `transmission: 0.6` + `thickness: 1.5` sur `meshPhysicalMaterial`
- `ior: 1.5` pour réfraction réaliste
- Combine avec l'iridescence déjà en place → effet diamant spectaculaire

## E. Shader animé pour les portails — Energy Vortex (HubScene.tsx)

Remplacer le simple `planeGeometry + emissive` des portails par un **shader GLSL de vortex animé** :
- Bruit de Voronoi animé pour un effet de distorsion d'énergie
- Couleur zone-spécifique avec des veines de lumière qui pulsent
- Effet de distorsion radiale depuis le centre

## F. Particle Trails — Traînées lumineuses (DecorativeElements.tsx)

Nouveau composant `EnergyTrails` : des lignes de lumière qui se déplacent le long de trajectoires courbes, laissant une traînée qui s'estompe. Utilise des `Line` de drei avec des positions animées. Donne un effet de circulation d'énergie dans la scène.

## G. Animated Fog Layers — Brume stratifiée (DecorativeElements.tsx)

Remplacer le `<fog>` linéaire par des **plans de brume animés** à différentes hauteurs :
- 2-3 `planeGeometry` horizontaux avec un shader de noise animé
- Opacity qui varie avec le temps → brume vivante qui roule
- Beaucoup plus atmosphérique que le fog linéaire standard

## H. Cinematic Auto-Camera amélioré (tous les Canvas)

Améliorer le comportement caméra avec :
- Slow breathing du FOV (±1° sur 8 secondes) pour un effet "vivant"
- Subtle parallax shift quand la souris bouge (sans cliquer)
- Transition fluide entre les scènes

---

## Fichiers impactés

| Fichier | Changements |
|---------|-------------|
| `src/components/3d/premium/PremiumLighting.tsx` | Skybox → shader GLSL animé (nebula vivante) |
| `src/components/3d/premium/PostProcessing.tsx` | + GodRays, + SSAO |
| `src/components/3d/premium/DecorativeElements.tsx` | + EnergyTrails, + AnimatedFogLayers |
| `src/components/3d/HubScene.tsx` | Portal vortex shader, cristaux transmission, camera breathing |
| `src/components/3d/LazarusScene.tsx` | Cristaux transmission, camera breathing |
| `src/components/3d/MapScene.tsx` | Camera breathing, fog layers |
| `src/components/3d/Inventory3DScene.tsx` | Cristaux transmission, camera breathing |

## Performance

- God Rays et SSAO ajoutent ~15% de coût GPU → on les rend optionnels via un prop `quality="high" | "standard"`
- Le skybox shader est très léger (un seul fullscreen quad)
- Les fog layers sont des plans simples, coût négligeable
- On garde le DPR à `[1, 1.5]` pour la compatibilité mobile
