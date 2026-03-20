// ── Experience Engine — Public API ──
// Single entry point for all experience-related imports.

// Core
export type {
  ImmersionLevel,
  ExperienceMode,
  AtmosphereType,
  PerformanceTier,
  LightTemperature,
  MotionIntensity,
  ExperienceEventType,
  ExperienceEvent,
  FeedbackResponse,
  AtmosphereConfig,
  ExperienceState,
  ZoneExperiencePreset,
} from "./core/experience-types";

export { experienceEvents } from "./core/experience-events";
export { ExperienceProvider, useExperience, useAtmosphere } from "./core/experience-store";

// Presets
export { getZonePreset } from "./presets";

// Renderers
export { AmbientRenderer } from "./renderers/AmbientRenderer";
export { FeedbackLayer } from "./renderers/FeedbackLayer";
export { TransitionDirector, getTransitionStyle } from "./renderers/TransitionDirector";

// Audio
export { soundController } from "./audio/sound-controller";

// Performance
export { detectPerformanceTier, getExperienceCapabilities } from "./performance/capability-tier";
export { AdaptiveQualityMonitor } from "./performance/adaptive-quality";
