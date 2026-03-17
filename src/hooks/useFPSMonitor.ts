import { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/logger";

/**
 * Monitors FPS and triggers a downgrade callback when
 * frame rate stays below threshold for a sustained period.
 */
export function useFPSMonitor(options?: {
  threshold?: number;
  samplePeriodMs?: number;
  onDowngrade?: () => void;
}) {
  const { threshold = 20, samplePeriodMs = 5000, onDowngrade } = options ?? {};
  const [shouldDowngrade, setShouldDowngrade] = useState(false);
  const frameCount = useRef(0);
  const downgradeTriggered = useRef(false);

  useEffect(() => {
    let rafId: number;
    let intervalId: ReturnType<typeof setInterval>;

    const countFrame = () => {
      frameCount.current++;
      rafId = requestAnimationFrame(countFrame);
    };

    rafId = requestAnimationFrame(countFrame);

    intervalId = setInterval(() => {
      const fps = (frameCount.current * 1000) / samplePeriodMs;
      frameCount.current = 0;

      if (fps < threshold && !downgradeTriggered.current) {
        downgradeTriggered.current = true;
        logger.warn("FPSMonitor", `Low FPS detected (${fps.toFixed(1)}), triggering downgrade`, {
          threshold,
          measuredFps: fps,
        });
        setShouldDowngrade(true);
        onDowngrade?.();
        // Stop monitoring after downgrade
        cancelAnimationFrame(rafId);
        clearInterval(intervalId);
      }
    }, samplePeriodMs);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
    };
  }, [threshold, samplePeriodMs, onDowngrade]);

  return shouldDowngrade;
}
