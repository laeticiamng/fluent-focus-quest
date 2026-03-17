import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Premium post-processing — cinematic bloom + deep vignette.
 * Tuned for dramatic glow on emissive elements without washing out.
 */
export function PremiumPostProcessing({
  bloomIntensity = 0.8,
  bloomThreshold = 0.35,
  bloomSmoothing = 0.6,
  vignetteOpacity = 0.4,
}: {
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  vignetteOpacity?: number;
}) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      <Vignette
        eskil={false}
        offset={0.12}
        darkness={vignetteOpacity}
      />
    </EffectComposer>
  );
}
