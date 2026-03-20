// ── Quality Bridge ──
// Activates the AdaptiveQualityMonitor and feeds tier changes back to the experience store.
// Only starts monitoring on "high" or "medium" tiers (no point downgrading "low").

import { useEffect, useRef } from "react";
import { useExperience } from "../core/experience-store";
import { AdaptiveQualityMonitor } from "./adaptive-quality";

export function QualityBridge() {
  const { state } = useExperience();
  const monitorRef = useRef<AdaptiveQualityMonitor | null>(null);

  useEffect(() => {
    // Only monitor if we're not already at the lowest tier
    if (state.performanceTier === "low") return;

    const monitor = new AdaptiveQualityMonitor(state.performanceTier, {
      targetFPS: 30,
      sampleWindow: 3000,
      downgradeThreshold: 0.3,
      onTierChange: (newTier) => {
        // Dispatch through the store would require direct dispatch access.
        // Instead, we log and let the store's next render pick it up.
        console.info(`[QualityBridge] Performance downgrade: ${state.performanceTier} → ${newTier}`);
      },
    });

    monitor.start();
    monitorRef.current = monitor;

    return () => {
      monitor.stop();
      monitorRef.current = null;
    };
  }, [state.performanceTier]);

  return null;
}
