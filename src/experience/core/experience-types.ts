// ── Experience Engine Types ──
// The source of truth for immersion levels, atmosphere, and experience state.
// Separates the experience layer from domain logic entirely.

/** Immersion levels per the 2026 doctrine */
export type ImmersionLevel = 0 | 1 | 2 | 3;

/** Experience modes — dictate the rendering intent */
export type ExperienceMode = "ambient" | "focus" | "reveal" | "simulation" | "ceremony";

/** Atmosphere type — matches zone identity */
export type AtmosphereType =
  | "forge"
  | "grammar"
  | "studio"
  | "clinical"
  | "laboratory"
  | "archive"
  | "aerzterat"
  | "neutral";

/** Performance tier for adaptive rendering */
export type PerformanceTier = "high" | "medium" | "low";

/** Light temperature — emotional tone of the scene */
export type LightTemperature = "warm" | "neutral" | "cool" | "dramatic";

/** Motion intensity — controls animation energy */
export type MotionIntensity = "calm" | "focus" | "reveal" | "none";

/** Experience event types — domain events that trigger experience responses */
export type ExperienceEventType =
  | "TASK_COMPLETED"
  | "ZONE_ENTERED"
  | "ZONE_UNLOCKED"
  | "ARTIFACT_FORGED"
  | "INTERVIEW_TIMER_LOW"
  | "SIMULATION_START"
  | "SIMULATION_SUCCESS"
  | "SIMULATION_FAIL"
  | "CLINICAL_WARNING"
  | "STREAK_CONTINUED"
  | "LEVEL_UP"
  | "SIGIL_COLLECTED"
  | "ROOM_SOLVED"
  | "PROTOCOL_ACTIVATED"
  | "PHRASE_GATE_SOLVED"
  | "QUIZ_CORRECT"
  | "QUIZ_INCORRECT"
  | "TRANSITION_START"
  | "TRANSITION_END"
  | "IDLE_AMBIENT";

export interface ExperienceEvent {
  type: ExperienceEventType;
  payload?: Record<string, unknown>;
  timestamp: number;
}

/** Feedback response — what the experience layer does when an event occurs */
export interface FeedbackResponse {
  /** Visual pulse (glow, ripple, flash) */
  visual?: {
    type: "glow" | "ripple" | "flash" | "bloom" | "shimmer";
    color?: string;
    intensity?: number;
    duration?: number;
  };
  /** Light shift */
  light?: {
    temperature: LightTemperature;
    intensity?: number;
    duration?: number;
  };
  /** Sound cue */
  sound?: {
    id: string;
    volume?: number;
  };
  /** Motion burst */
  motion?: {
    type: "pulse" | "shake" | "float" | "expand" | "contract";
    intensity?: number;
    duration?: number;
  };
  /** Haptic (for supported devices) */
  haptic?: "light" | "medium" | "heavy";
}

/** Atmosphere configuration — full scene description */
export interface AtmosphereConfig {
  type: AtmosphereType;
  immersionLevel: ImmersionLevel;
  mode: ExperienceMode;
  light: {
    temperature: LightTemperature;
    intensity: number;
    direction: { x: number; y: number };
  };
  motion: MotionIntensity;
  depth: {
    parallaxStrength: number;
    blurLayers: number;
    perspectiveOrigin: string;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  particles: {
    enabled: boolean;
    density: number;
    speed: number;
  };
}

/** Global experience state — the single source of truth */
export interface ExperienceState {
  /** Current atmosphere configuration */
  atmosphere: AtmosphereConfig;
  /** Current performance tier (auto-detected or overridden) */
  performanceTier: PerformanceTier;
  /** Whether the user prefers reduced motion */
  reducedMotion: boolean;
  /** Whether sound is enabled */
  soundEnabled: boolean;
  /** Current immersion level override (null = use zone default) */
  immersionOverride: ImmersionLevel | null;
  /** Active feedback queue */
  activeFeedbacks: FeedbackResponse[];
  /** Whether the experience layer is ready */
  ready: boolean;
}

/** Zone experience preset — defines the default experience for a zone */
export interface ZoneExperiencePreset {
  atmosphere: AtmosphereType;
  immersionLevel: ImmersionLevel;
  defaultMode: ExperienceMode;
  light: {
    temperature: LightTemperature;
    intensity: number;
  };
  motion: MotionIntensity;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  /** Feedback mappings for this zone */
  feedbacks: Partial<Record<ExperienceEventType, FeedbackResponse>>;
}
