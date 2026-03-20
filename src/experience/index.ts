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
export { InterviewStageDirector } from "./renderers/InterviewStageDirector";
export { ClinicalSituationLayer } from "./renderers/ClinicalSituationLayer";
export { ProgressEnvironmentMapper } from "./renderers/ProgressEnvironmentMapper";
export { UnlockRevealV2 } from "./renderers/UnlockRevealV2";

// Audio
export { soundController } from "./audio/sound-controller";
export { SoundBridge } from "./audio/SoundBridge";

// Performance
export { detectPerformanceTier, getExperienceCapabilities } from "./performance/capability-tier";
export { AdaptiveQualityMonitor } from "./performance/adaptive-quality";
export { QualityBridge } from "./performance/QualityBridge";
