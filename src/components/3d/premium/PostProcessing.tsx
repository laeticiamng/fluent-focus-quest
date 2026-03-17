import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField, N8AO } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Vector2 } from "three";
import type { QualityTier } from "@/hooks/useQualityTier";

/**
 * Premium post-processing — cinematic bloom + chromatic aberration + SSAO + depth of field + vignette.
 * Tier-aware: automatically scales effects based on device capabilities.
 *
 * Calibrated for readability and platform-grade polish:
 * - Bloom supports emissive accents without veiling the image
 * - AO reinforces contact/depth without muddying dark regions
 * - DOF enhances composition, never obscures interactables
 * - Chromatic aberration is near-imperceptible
 * - Vignette frames the scene without crushing edges
 *
 * qualityTier overrides legacy quality prop when provided.
 */
export function PremiumPostProcessing({
  bloomIntensity = 0.7,
  bloomThreshold = 0.38,
  bloomSmoothing = 0.65,
  vignetteOpacity = 0.3,
  chromaticAberration = 0.0004,
  depthOfField = false,
  quality = "standard",
  qualityTier,
  aoRadius = 0.45,
  aoIntensity = 1.2,
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
  const enableDOF = isHigh && depthOfField;
  const enableChroma = !isMobile && chromaticAberration > 0;

  // Scale bloom for lower tiers — avoid bloom veiling on weaker devices
  const effectiveBloom = isMobile
    ? bloomIntensity * 0.5
    : qualityTier === "medium"
      ? bloomIntensity * 0.75
      : bloomIntensity;

  // Scale vignette — lighter on mobile to preserve edge readability
  const effectiveVignette = isMobile
    ? vignetteOpacity * 0.6
    : qualityTier === "medium"
      ? vignetteOpacity * 0.85
      : vignetteOpacity;

  // Clamp chromatic aberration to near-imperceptible levels
  const effectiveChroma = Math.min(chromaticAberration, 0.0006);

  // AO calibration — lower intensity to avoid dirtying dark regions
  const effectiveAOIntensity = aoIntensity * 0.85;
  const effectiveAORadius = aoRadius;

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
          aoRadius={effectiveAORadius}
          intensity={effectiveAOIntensity}
          distanceFalloff={0.9}
          quality="medium"
          halfRes
        />
      )}
      {enableChroma && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new Vector2(effectiveChroma, effectiveChroma)}
          radialModulation={true}
          modulationOffset={0.5}
        />
      )}
      {enableDOF && (
        <DepthOfField
          focusDistance={0.025}
          focalLength={0.08}
          bokehScale={2.5}
        />
      )}
      <Vignette
        eskil={false}
        offset={0.15}
        darkness={effectiveVignette}
      />
    </EffectComposer>
  );
}
