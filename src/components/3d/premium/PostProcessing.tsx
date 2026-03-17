import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField, N8AO } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";

/**
 * Premium post-processing — cinematic bloom + chromatic aberration + SSAO + depth of field + vignette.
 * Tuned for dramatic glow on emissive elements with film-grade polish.
 * quality="high" enables SSAO and DepthOfField for AAA look.
 */
export function PremiumPostProcessing({
  bloomIntensity = 0.8,
  bloomThreshold = 0.35,
  bloomSmoothing = 0.6,
  vignetteOpacity = 0.4,
  chromaticAberration = 0.0006,
  depthOfField = false,
  quality = "standard",
}: {
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  vignetteOpacity?: number;
  chromaticAberration?: number;
  depthOfField?: boolean;
  quality?: "standard" | "high";
}) {
  const enableSSAO = quality === "high";
  const enableDOF = depthOfField || quality === "high";

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      {enableSSAO && (
        <N8AO
          aoRadius={0.5}
          intensity={1.5}
          distanceFalloff={0.8}
          quality="medium"
          halfRes
        />
      )}
      {chromaticAberration > 0 && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new Vector2(chromaticAberration, chromaticAberration)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}
      {enableDOF && (
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
