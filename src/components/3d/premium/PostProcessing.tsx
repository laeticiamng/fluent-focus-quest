import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField, N8AO } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import type { QualityTier } from "@/hooks/useQualityTier";

/**
 * Premium post-processing — cinematic bloom + chromatic aberration + SSAO + depth of field + vignette.
 * Now tier-aware: automatically scales effects based on device capabilities.
 *
 * qualityTier overrides legacy quality prop when provided.
 */
export function PremiumPostProcessing({
  bloomIntensity = 0.8,
  bloomThreshold = 0.35,
  bloomSmoothing = 0.6,
  vignetteOpacity = 0.4,
  chromaticAberration = 0.0006,
  depthOfField = false,
  quality = "standard",
  qualityTier,
  aoRadius = 0.5,
  aoIntensity = 1.5,
}: {
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  vignetteOpacity?: number;
  chromaticAberration?: number;
  depthOfField?: boolean;
  quality?: "standard" | "high";
  qualityTier?: QualityTier;
  aoRadius?: number;
  aoIntensity?: number;
}) {
  // Resolve effective quality from tier or legacy prop
  const isHigh = qualityTier ? qualityTier === "high" : quality === "high";
  const isMobile = qualityTier === "mobile";

  const enableSSAO = isHigh;
  const enableDOF = isHigh && (depthOfField || quality === "high");
  const enableChroma = !isMobile && chromaticAberration > 0;

  // Scale bloom for lower tiers
  const effectiveBloom = isMobile
    ? bloomIntensity * 0.5
    : qualityTier === "medium"
      ? bloomIntensity * 0.75
      : bloomIntensity;

  return (
    <EffectComposer>
      <Bloom
        intensity={effectiveBloom}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      {enableSSAO && (
        <N8AO
          aoRadius={aoRadius}
          intensity={aoIntensity}
          distanceFalloff={0.8}
          quality="medium"
          halfRes
        />
      )}
      {enableChroma && (
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
