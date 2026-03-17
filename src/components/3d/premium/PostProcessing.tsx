import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Premium post-processing stack.
 * Bloom for glow, vignette for cinematic framing.
 */
export function PremiumPostProcessing({
  bloomIntensity = 0.6,
  bloomThreshold = 0.4,
  bloomSmoothing = 0.5,
  vignetteOpacity = 0.3,
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
        offset={0.15}
        darkness={vignetteOpacity}
      />
    </EffectComposer>
  );
}
