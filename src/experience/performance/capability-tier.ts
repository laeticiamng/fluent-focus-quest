// ── Performance Capability Tier ──
// Detects device capabilities and returns a performance tier.
// Used by the experience engine to adapt rendering quality.

import type { PerformanceTier } from "../core/experience-types";

let cachedTier: PerformanceTier | null = null;

export function detectPerformanceTier(): PerformanceTier {
  if (cachedTier) return cachedTier;

  try {
    // URL override for testing
    const param = new URLSearchParams(window.location.search).get("perf");
    if (param === "high" || param === "medium" || param === "low") {
      cachedTier = param;
      return param;
    }

    // Mobile detection
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 768);

    if (isMobile) {
      cachedTier = "low";
      return "low";
    }

    const cores = navigator.hardwareConcurrency || 2;
    const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4;

    // GPU probe
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    let gpuStrength: "strong" | "medium" | "weak" = "medium";

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
        const weak =
          renderer.includes("intel hd") || renderer.includes("intel uhd") ||
          renderer.includes("mali-4") || renderer.includes("adreno 3") ||
          renderer.includes("swiftshader") || renderer.includes("llvmpipe");
        const strong =
          renderer.includes("nvidia") || renderer.includes("radeon") ||
          renderer.includes("geforce") || renderer.includes("apple m") ||
          renderer.includes("apple gpu");

        if (weak) gpuStrength = "weak";
        else if (strong) gpuStrength = "strong";
      }
    }

    if (gpuStrength === "weak" || (cores <= 2 && memory <= 2)) {
      cachedTier = "low";
    } else if (gpuStrength === "strong" || cores >= 4 || memory >= 8) {
      cachedTier = "high";
    } else {
      cachedTier = "medium";
    }
  } catch {
    cachedTier = "medium";
  }

  return cachedTier!;
}

/** Performance-aware settings for the 2D experience layer */
export function getExperienceCapabilities(tier: PerformanceTier) {
  return {
    tier,
    enableParallax: tier !== "low",
    enableParticles: tier === "high",
    enableBlurLayers: tier !== "low",
    enableAmbientOrbs: true, // CSS-only, always fine
    enableSoundEffects: tier !== "low",
    maxConcurrentAnimations: tier === "high" ? 8 : tier === "medium" ? 4 : 2,
    transitionDuration: tier === "low" ? 150 : tier === "medium" ? 250 : 350,
    orbAnimationDuration: tier === "low" ? 0 : tier === "medium" ? 20 : 25,
    parallaxFactor: tier === "high" ? 0.04 : tier === "medium" ? 0.02 : 0,
  };
}
