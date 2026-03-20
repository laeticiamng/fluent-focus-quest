// ── Adaptive Quality Monitor ──
// Watches frame timing and downgrades experience quality if performance drops.

import type { PerformanceTier } from "../core/experience-types";

interface QualityMonitorConfig {
  targetFPS: number;
  sampleWindow: number; // ms
  downgradeThreshold: number; // fraction of frames below target
  onTierChange: (tier: PerformanceTier) => void;
}

export class AdaptiveQualityMonitor {
  private frameTimes: number[] = [];
  private lastTime = 0;
  private rafId = 0;
  private currentTier: PerformanceTier;
  private config: QualityMonitorConfig;
  private running = false;

  constructor(initialTier: PerformanceTier, config: Partial<QualityMonitorConfig> = {}) {
    this.currentTier = initialTier;
    this.config = {
      targetFPS: 30,
      sampleWindow: 3000,
      downgradeThreshold: 0.3,
      onTierChange: () => {},
      ...config,
    };
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.frameTimes.push(delta);

    // Keep only the sample window
    const cutoff = now - this.config.sampleWindow;
    while (this.frameTimes.length > 0 && this.frameTimes.length > 90) {
      this.frameTimes.shift();
    }

    // Evaluate every ~60 frames
    if (this.frameTimes.length >= 60) {
      this.evaluate();
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private evaluate(): void {
    const targetFrameTime = 1000 / this.config.targetFPS;
    const slowFrames = this.frameTimes.filter((t) => t > targetFrameTime * 1.5).length;
    const slowRatio = slowFrames / this.frameTimes.length;

    if (slowRatio > this.config.downgradeThreshold) {
      const nextTier = this.currentTier === "high" ? "medium" : "low";
      if (nextTier !== this.currentTier) {
        this.currentTier = nextTier;
        this.config.onTierChange(nextTier);
      }
    }

    this.frameTimes = [];
  }

  getTier(): PerformanceTier {
    return this.currentTier;
  }
}
