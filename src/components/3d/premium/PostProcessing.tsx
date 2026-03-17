import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

/**
 * Premium post-processing — cinematic bloom + chromatic aberration + depth of field + vignette.
 * Tuned for dramatic glow on emissive elements with film-grade polish.
 */
export function PremiumPostProcessing({
  bloomIntensity = 0.8,
  bloomThreshold = 0.35,
  bloomSmoothing = 0.6,
  vignetteOpacity = 0.4,
  chromaticAberration = 0.0006,
  depthOfField = false,
}: {
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  vignetteOpacity?: number;
  chromaticAberration?: number;
  depthOfField?: boolean;
}) {
  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      {chromaticAberration > 0 && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new Vector2(chromaticAberration, chromaticAberration)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}
      {depthOfField && (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.06}
          bokehScale={3}
        />
      )}
      <Vignette
        eskil={false}
        offset={0.12}
        darkness={vignetteOpacity}
      />
    </EffectComposer>
  );
}
