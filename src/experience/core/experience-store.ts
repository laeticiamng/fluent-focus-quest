// ── Experience Store ──
// React context + provider for the experience engine.
// Manages global experience state, atmosphere switching, and feedback dispatch.

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { createElement } from "react";
import type {
  ExperienceState,
  AtmosphereConfig,
  AtmosphereType,
  ImmersionLevel,
  ExperienceMode,
  FeedbackResponse,
  PerformanceTier,
  ExperienceEventType,
} from "./experience-types";
import { experienceEvents } from "./experience-events";
import { getZonePreset } from "../presets";
import { detectPerformanceTier } from "../performance/capability-tier";

// ── Default state ──

const DEFAULT_ATMOSPHERE: AtmosphereConfig = {
  type: "neutral",
  immersionLevel: 0,
  mode: "ambient",
  light: { temperature: "warm", intensity: 0.6, direction: { x: 0.3, y: -0.5 } },
  motion: "calm",
  depth: { parallaxStrength: 0, blurLayers: 0, perspectiveOrigin: "50% 50%" },
  colors: { primary: "225 14% 20%", secondary: "225 14% 15%", accent: "215 90% 58%", glow: "215 90% 58%" },
  particles: { enabled: false, density: 0, speed: 0 },
};

const INITIAL_STATE: ExperienceState = {
  atmosphere: DEFAULT_ATMOSPHERE,
  performanceTier: "medium",
  reducedMotion: false,
  soundEnabled: false,
  immersionOverride: null,
  activeFeedbacks: [],
  ready: false,
};

// ── Actions ──

type ExperienceAction =
  | { type: "SET_ATMOSPHERE"; atmosphere: AtmosphereConfig }
  | { type: "SET_PERFORMANCE_TIER"; tier: PerformanceTier }
  | { type: "SET_REDUCED_MOTION"; enabled: boolean }
  | { type: "SET_SOUND_ENABLED"; enabled: boolean }
  | { type: "SET_IMMERSION_OVERRIDE"; level: ImmersionLevel | null }
  | { type: "PUSH_FEEDBACK"; feedback: FeedbackResponse }
  | { type: "CLEAR_FEEDBACK"; index: number }
  | { type: "CLEAR_ALL_FEEDBACKS" }
  | { type: "SET_READY" };

function experienceReducer(state: ExperienceState, action: ExperienceAction): ExperienceState {
  switch (action.type) {
    case "SET_ATMOSPHERE":
      return { ...state, atmosphere: action.atmosphere };
    case "SET_PERFORMANCE_TIER":
      return { ...state, performanceTier: action.tier };
    case "SET_REDUCED_MOTION":
      return { ...state, reducedMotion: action.enabled };
    case "SET_SOUND_ENABLED":
      return { ...state, soundEnabled: action.enabled };
    case "SET_IMMERSION_OVERRIDE":
      return { ...state, immersionOverride: action.level };
    case "PUSH_FEEDBACK":
      return { ...state, activeFeedbacks: [...state.activeFeedbacks, action.feedback] };
    case "CLEAR_FEEDBACK":
      return { ...state, activeFeedbacks: state.activeFeedbacks.filter((_, i) => i !== action.index) };
    case "CLEAR_ALL_FEEDBACKS":
      return { ...state, activeFeedbacks: [] };
    case "SET_READY":
      return { ...state, ready: true };
    default:
      return state;
  }
}

// ── Context ──

interface ExperienceContextValue {
  state: ExperienceState;
  /** Switch to a zone's atmosphere */
  setZoneAtmosphere: (zone: AtmosphereType, mode?: ExperienceMode) => void;
  /** Fire an experience event (triggers feedback) */
  fireEvent: (type: ExperienceEventType, payload?: Record<string, unknown>) => void;
  /** Toggle sound */
  toggleSound: () => void;
  /** Override immersion level */
  setImmersionLevel: (level: ImmersionLevel | null) => void;
  /** Get effective immersion level (override > zone default) */
  effectiveImmersion: ImmersionLevel;
  /** Whether effects should be reduced (perf or a11y) */
  shouldReduceEffects: boolean;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

// ── Provider ──

interface ExperienceProviderProps {
  children: ReactNode;
}

export function ExperienceProvider({ children }: ExperienceProviderProps) {
  const [state, dispatch] = useReducer(experienceReducer, INITIAL_STATE);

  // Detect performance tier and reduced motion on mount
  useEffect(() => {
    const tier = detectPerformanceTier();
    dispatch({ type: "SET_PERFORMANCE_TIER", tier });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dispatch({ type: "SET_REDUCED_MOTION", enabled: prefersReducedMotion });

    // Listen for changes
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      dispatch({ type: "SET_REDUCED_MOTION", enabled: e.matches });
    };
    mq.addEventListener("change", handler);

    dispatch({ type: "SET_READY" });
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Auto-clear feedbacks after their duration
  useEffect(() => {
    if (state.activeFeedbacks.length === 0) return;
    const timers = state.activeFeedbacks.map((fb, i) => {
      const duration = fb.visual?.duration || fb.motion?.duration || fb.light?.duration || 800;
      return setTimeout(() => {
        dispatch({ type: "CLEAR_FEEDBACK", index: i });
      }, duration);
    });
    return () => timers.forEach(clearTimeout);
  }, [state.activeFeedbacks.length]);

  const setZoneAtmosphere = useCallback((zone: AtmosphereType, mode?: ExperienceMode) => {
    const preset = getZonePreset(zone);
    const atmosphere: AtmosphereConfig = {
      type: zone,
      immersionLevel: state.immersionOverride ?? preset.immersionLevel,
      mode: mode || preset.defaultMode,
      light: {
        temperature: preset.light.temperature,
        intensity: preset.light.intensity,
        direction: { x: 0.3, y: -0.5 },
      },
      motion: preset.motion,
      depth: {
        parallaxStrength: preset.immersionLevel >= 1 ? 0.02 + preset.immersionLevel * 0.01 : 0,
        blurLayers: preset.immersionLevel >= 2 ? 2 : preset.immersionLevel >= 1 ? 1 : 0,
        perspectiveOrigin: "50% 50%",
      },
      colors: preset.colors,
      particles: {
        enabled: preset.immersionLevel >= 2,
        density: preset.immersionLevel * 0.3,
        speed: preset.motion === "calm" ? 0.3 : preset.motion === "focus" ? 0.5 : 0.8,
      },
    };
    dispatch({ type: "SET_ATMOSPHERE", atmosphere });
    experienceEvents.emit("ZONE_ENTERED", { zone, mode });
  }, [state.immersionOverride]);

  const fireEvent = useCallback((type: ExperienceEventType, payload?: Record<string, unknown>) => {
    experienceEvents.emit(type, payload);

    // Look up feedback from current zone preset
    const preset = getZonePreset(state.atmosphere.type);
    const feedback = preset.feedbacks[type];
    if (feedback) {
      dispatch({ type: "PUSH_FEEDBACK", feedback });
    }
  }, [state.atmosphere.type]);

  const toggleSound = useCallback(() => {
    dispatch({ type: "SET_SOUND_ENABLED", enabled: !state.soundEnabled });
  }, [state.soundEnabled]);

  const setImmersionLevel = useCallback((level: ImmersionLevel | null) => {
    dispatch({ type: "SET_IMMERSION_OVERRIDE", level });
  }, []);

  const effectiveImmersion = useMemo(() => {
    if (state.immersionOverride !== null) return state.immersionOverride;
    return state.atmosphere.immersionLevel;
  }, [state.immersionOverride, state.atmosphere.immersionLevel]);

  const shouldReduceEffects = useMemo(() => {
    return state.reducedMotion || state.performanceTier === "low";
  }, [state.reducedMotion, state.performanceTier]);

  const value = useMemo<ExperienceContextValue>(() => ({
    state,
    setZoneAtmosphere,
    fireEvent,
    toggleSound,
    setImmersionLevel,
    effectiveImmersion,
    shouldReduceEffects,
  }), [state, setZoneAtmosphere, fireEvent, toggleSound, setImmersionLevel, effectiveImmersion, shouldReduceEffects]);

  return createElement(ExperienceContext.Provider, { value }, children);
}

// ── Hook ──

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience must be used within ExperienceProvider");
  }
  return ctx;
}

/** Lightweight hook for components that only need to read atmosphere */
export function useAtmosphere() {
  const { state, effectiveImmersion, shouldReduceEffects } = useExperience();
  return {
    atmosphere: state.atmosphere,
    immersion: effectiveImmersion,
    reducedEffects: shouldReduceEffects,
    performanceTier: state.performanceTier,
  };
}
