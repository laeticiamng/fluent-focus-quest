import { useRef, forwardRef } from "react";
import { EffectComposer, Bloom, Vignette, ChromaticAberration, DepthOfField, N8AO, GodRays } from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { Vector2 } from "three";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import type { QualityTier } from "@/hooks/useQualityTier";

/**
 * God Ray light source — an emissive sphere placed behind the scene.
 * Must be transparent and NOT write to depth buffer for GodRays to work.
 */
export const GodRaySource = forwardRef<THREE.Mesh, {
  position?: [number, number, number];
  color?: string;
  intensity?: number;
  radius?: number;
}>(({ position = [0, 5, -8], color = "#ffeedd", intensity = 1.0, radius = 1.2 }, ref) => {
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={intensity * 0.4}
      />
    </mesh>
  );
});
GodRaySource.displayName = "GodRaySource";

/**
 * Premium post-processing — cinematic bloom + chromatic aberration + SSAO + 
 * God Rays + depth of field + vignette.
 * 
 * Tier-aware: automatically scales effects based on device capabilities.
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
  godRaysSunRef,
  godRaysEnabled = true,
  godRaysDensity = 0.96,
  godRaysDecay = 0.93,
  godRaysWeight = 0.3,
  godRaysExposure = 0.55,
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
  godRaysSunRef?: React.RefObject<THREE.Mesh>;
  godRaysEnabled?: boolean;
  godRaysDensity?: number;
  godRaysDecay?: number;
  godRaysWeight?: number;
  godRaysExposure?: number;
}) {
  const isHigh = qualityTier ? qualityTier === "high" : quality === "high";
  const isMobile = qualityTier === "mobile";

  const enableSSAO = isHigh;
  const enableDOF = isHigh && depthOfField;
  const enableChroma = !isMobile && chromaticAberration > 0;
  const enableGodRays = isHigh && godRaysEnabled && godRaysSunRef?.current;

  const effectiveBloom = isMobile
    ? bloomIntensity * 0.5
    : qualityTier === "medium"
      ? bloomIntensity * 0.75
      : bloomIntensity;

  const effectiveVignette = isMobile
    ? vignetteOpacity * 0.6
    : qualityTier === "medium"
      ? vignetteOpacity * 0.85
      : vignetteOpacity;

  const effectiveChroma = Math.min(chromaticAberration, 0.0006);

  const effectiveAOIntensity = aoIntensity * 0.85;

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
          intensity={effectiveAOIntensity}
          distanceFalloff={0.9}
          quality="medium"
          halfRes
        />
      )}
      {enableGodRays && godRaysSunRef.current && (
        <GodRays
          sun={godRaysSunRef.current}
          blendFunction={BlendFunction.SCREEN}
          samples={isMobile ? 30 : 50}
          density={godRaysDensity}
          decay={godRaysDecay}
          weight={godRaysWeight}
          exposure={godRaysExposure}
          clampMax={1}
          kernelSize={KernelSize.SMALL}
          blur
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
