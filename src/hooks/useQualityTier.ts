import { useState, useEffect, useMemo, useCallback } from "react";
import { logger } from "@/utils/logger";

// ── Quality tier system ──
// Determines rendering quality based on device capabilities.
// Three tiers: "high" (desktop GPU), "medium" (weak desktop / tablet), "mobile" (phone / fallback).

export type QualityTier = "high" | "medium" | "mobile";

interface QualityCapabilities {
  tier: QualityTier;
  dpr: [number, number];
  enableSSAO: boolean;
  enableDOF: boolean;
  enableBloom: boolean;
  enableChromaticAberration: boolean;
  enableReflections: boolean;
  enableContactShadows: boolean;
  enableParticles: boolean;
  enableFogLayers: boolean;
  enableEnergyTrails: boolean;
  enableFireflies: boolean;
  enableBackgroundStructures: boolean;
  particleMultiplier: number;
  bloomIntensityMultiplier: number;
  shadowMapSize: number;
  maxPointLights: number;
}

const TIER_CAPABILITIES: Record<QualityTier, QualityCapabilities> = {
  high: {
    tier: "high",
    dpr: [1, 1.5],
    enableSSAO: true,
    enableDOF: true,
    enableBloom: true,
    enableChromaticAberration: true,
    enableReflections: true,
    enableContactShadows: true,
    enableParticles: true,
    enableFogLayers: true,
    enableEnergyTrails: true,
    enableFireflies: true,
    enableBackgroundStructures: true,
    particleMultiplier: 1,
    bloomIntensityMultiplier: 1,
    shadowMapSize: 1024,
    maxPointLights: 16,
  },
  medium: {
    tier: "medium",
    dpr: [1, 1.25],
    enableSSAO: false,
    enableDOF: false,
    enableBloom: true,
    enableChromaticAberration: false,
    enableReflections: false,
    enableContactShadows: true,
    enableParticles: true,
    enableFogLayers: true,
    enableEnergyTrails: false,
    enableFireflies: true,
    enableBackgroundStructures: true,
    particleMultiplier: 0.5,
    bloomIntensityMultiplier: 0.75,
    shadowMapSize: 512,
    maxPointLights: 8,
  },
  mobile: {
    tier: "mobile",
    dpr: [1, 1],
    enableSSAO: false,
    enableDOF: false,
    enableBloom: true,
    enableChromaticAberration: false,
    enableReflections: false,
    enableContactShadows: false,
    enableParticles: true,
    enableFogLayers: false,
    enableEnergyTrails: false,
    enableFireflies: false,
    enableBackgroundStructures: false,
    particleMultiplier: 0.3,
    bloomIntensityMultiplier: 0.5,
    shadowMapSize: 256,
    maxPointLights: 4,
  },
};

function detectTier(): QualityTier {
  try {
    // Check for mobile via touch + small screen
    const isMobileDevice =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 768);

    if (isMobileDevice) return "mobile";

    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 2;

    // Check device memory (Chrome only)
    const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4;

    // Check WebGL renderer info for GPU classification
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    let gpuTier: "high" | "medium" | "low" = "medium";

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        // Known weak GPUs
        const weakGPU =
          renderer.includes("intel hd") ||
          renderer.includes("intel uhd") ||
          renderer.includes("mali-4") ||
          renderer.includes("adreno 3") ||
          renderer.includes("adreno 4") ||
          renderer.includes("swiftshader") ||
          renderer.includes("llvmpipe");

        const strongGPU =
          renderer.includes("nvidia") ||
          renderer.includes("radeon") ||
          renderer.includes("geforce") ||
          renderer.includes("apple m") ||
          renderer.includes("apple gpu");

        if (weakGPU) gpuTier = "low";
        else if (strongGPU) gpuTier = "high";
      }
    }

    // Determine tier from combined signals
    if (gpuTier === "low" || (cores <= 2 && memory <= 2)) return "mobile";
    if (gpuTier === "high" && cores >= 4 && memory >= 4) return "high";
    if (cores >= 4 || memory >= 8) return "high";
    return "medium";
  } catch {
    return "medium";
  }
}

// Allow URL override for testing: ?quality=high|medium|mobile
function getOverrideTier(): QualityTier | null {
  try {
    const param = new URLSearchParams(window.location.search).get("quality");
    if (param === "high" || param === "medium" || param === "mobile") return param;
  } catch {
    // ignore
  }
  return null;
}

// Module-level cache
let cachedTier: QualityTier | null = null;

export function getQualityTier(): QualityTier {
  if (cachedTier) return cachedTier;
  cachedTier = getOverrideTier() || detectTier();
  return cachedTier;
}

export function getCapabilities(tier?: QualityTier): QualityCapabilities {
  return TIER_CAPABILITIES[tier || getQualityTier()];
}

export function useQualityTier(): QualityCapabilities & { downgrade: () => void } {
  const [tier, setTier] = useState<QualityTier>(() => getOverrideTier() || getQualityTier());

  useEffect(() => {
    setTier(getQualityTier());
  }, []);

  const downgrade = useCallback(() => {
    setTier(current => {
      if (current === "high") {
        logger.warn("QualityTier", "Auto-downgrading from high to medium due to performance");
        cachedTier = "medium";
        return "medium";
      }
      if (current === "medium") {
        logger.warn("QualityTier", "Auto-downgrading from medium to mobile due to performance");
        cachedTier = "mobile";
        return "mobile";
      }
      return current;
    });
  }, []);

  const capabilities = useMemo(() => TIER_CAPABILITIES[tier], [tier]);
  return useMemo(() => ({ ...capabilities, downgrade }), [capabilities, downgrade]);
}
