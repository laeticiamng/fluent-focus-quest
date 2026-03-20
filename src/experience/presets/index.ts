// ── Experience Presets ──
// Default experience configurations per zone.
// Each preset defines atmosphere, immersion level, and feedback mappings.

import type { AtmosphereType, ZoneExperiencePreset } from "../core/experience-types";

const forgePreset: ZoneExperiencePreset = {
  atmosphere: "forge",
  immersionLevel: 1,
  defaultMode: "focus",
  light: { temperature: "warm", intensity: 0.7 },
  motion: "calm",
  colors: {
    primary: "32 95% 55%",
    secondary: "25 80% 45%",
    accent: "38 92% 50%",
    glow: "32 85% 50%",
  },
  feedbacks: {
    ARTIFACT_FORGED: {
      visual: { type: "bloom", color: "hsl(32, 95%, 55%)", intensity: 0.8, duration: 1200 },
      light: { temperature: "warm", intensity: 1.2, duration: 800 },
      motion: { type: "pulse", intensity: 0.6, duration: 600 },
    },
    QUIZ_CORRECT: {
      visual: { type: "shimmer", color: "hsl(38, 92%, 50%)", intensity: 0.4, duration: 400 },
      motion: { type: "pulse", intensity: 0.3, duration: 300 },
    },
    QUIZ_INCORRECT: {
      visual: { type: "flash", color: "hsl(0, 60%, 50%)", intensity: 0.2, duration: 200 },
      motion: { type: "shake", intensity: 0.2, duration: 300 },
    },
  },
};

const grammarPreset: ZoneExperiencePreset = {
  atmosphere: "grammar",
  immersionLevel: 2,
  defaultMode: "focus",
  light: { temperature: "neutral", intensity: 0.65 },
  motion: "calm",
  colors: {
    primary: "152 60% 48%",
    secondary: "142 50% 40%",
    accent: "160 70% 55%",
    glow: "152 55% 45%",
  },
  feedbacks: {
    ARTIFACT_FORGED: {
      visual: { type: "bloom", color: "hsl(152, 60%, 48%)", intensity: 0.7, duration: 1000 },
      light: { temperature: "neutral", intensity: 1.1, duration: 600 },
    },
    TASK_COMPLETED: {
      visual: { type: "shimmer", color: "hsl(160, 70%, 55%)", intensity: 0.5, duration: 600 },
    },
  },
};

const studioPreset: ZoneExperiencePreset = {
  atmosphere: "studio",
  immersionLevel: 2,
  defaultMode: "simulation",
  light: { temperature: "cool", intensity: 0.6 },
  motion: "focus",
  colors: {
    primary: "265 55% 62%",
    secondary: "275 50% 50%",
    accent: "255 65% 68%",
    glow: "265 50% 58%",
  },
  feedbacks: {
    SIMULATION_START: {
      visual: { type: "bloom", color: "hsl(265, 55%, 62%)", intensity: 0.6, duration: 1500 },
      light: { temperature: "cool", intensity: 0.8, duration: 1200 },
    },
    SIMULATION_SUCCESS: {
      visual: { type: "bloom", color: "hsl(142, 71%, 45%)", intensity: 1.0, duration: 2000 },
      light: { temperature: "warm", intensity: 1.3, duration: 1500 },
      motion: { type: "expand", intensity: 0.7, duration: 1000 },
    },
    INTERVIEW_TIMER_LOW: {
      visual: { type: "glow", color: "hsl(0, 72%, 51%)", intensity: 0.5, duration: 600 },
      light: { temperature: "dramatic", intensity: 0.9, duration: 400 },
      motion: { type: "pulse", intensity: 0.4, duration: 500 },
    },
  },
};

const clinicalPreset: ZoneExperiencePreset = {
  atmosphere: "clinical",
  immersionLevel: 2,
  defaultMode: "simulation",
  light: { temperature: "cool", intensity: 0.55 },
  motion: "focus",
  colors: {
    primary: "350 65% 55%",
    secondary: "340 55% 45%",
    accent: "0 70% 60%",
    glow: "350 60% 50%",
  },
  feedbacks: {
    CLINICAL_WARNING: {
      visual: { type: "glow", color: "hsl(0, 70%, 50%)", intensity: 0.6, duration: 800 },
      light: { temperature: "dramatic", intensity: 0.9, duration: 600 },
      motion: { type: "pulse", intensity: 0.5, duration: 400 },
    },
    TASK_COMPLETED: {
      visual: { type: "shimmer", color: "hsl(185, 70%, 48%)", intensity: 0.4, duration: 500 },
    },
  },
};

const laboratoryPreset: ZoneExperiencePreset = {
  atmosphere: "laboratory",
  immersionLevel: 2,
  defaultMode: "focus",
  light: { temperature: "cool", intensity: 0.6 },
  motion: "calm",
  colors: {
    primary: "215 90% 58%",
    secondary: "225 80% 48%",
    accent: "205 85% 62%",
    glow: "215 80% 55%",
  },
  feedbacks: {
    ARTIFACT_FORGED: {
      visual: { type: "bloom", color: "hsl(215, 90%, 58%)", intensity: 0.7, duration: 1000 },
    },
  },
};

const archivePreset: ZoneExperiencePreset = {
  atmosphere: "archive",
  immersionLevel: 1,
  defaultMode: "ambient",
  light: { temperature: "warm", intensity: 0.5 },
  motion: "calm",
  colors: {
    primary: "185 70% 48%",
    secondary: "195 60% 40%",
    accent: "175 75% 55%",
    glow: "185 65% 45%",
  },
  feedbacks: {},
};

const aerzteratPreset: ZoneExperiencePreset = {
  atmosphere: "aerzterat",
  immersionLevel: 2,
  defaultMode: "focus",
  light: { temperature: "cool", intensity: 0.55 },
  motion: "focus",
  colors: {
    primary: "240 60% 55%",
    secondary: "230 55% 45%",
    accent: "250 65% 60%",
    glow: "240 55% 52%",
  },
  feedbacks: {
    TASK_COMPLETED: {
      visual: { type: "shimmer", color: "hsl(240, 60%, 55%)", intensity: 0.5, duration: 600 },
    },
  },
};

const neutralPreset: ZoneExperiencePreset = {
  atmosphere: "neutral",
  immersionLevel: 0,
  defaultMode: "ambient",
  light: { temperature: "warm", intensity: 0.6 },
  motion: "calm",
  colors: {
    primary: "225 14% 20%",
    secondary: "225 14% 15%",
    accent: "215 90% 58%",
    glow: "215 80% 55%",
  },
  feedbacks: {
    LEVEL_UP: {
      visual: { type: "bloom", color: "hsl(38, 92%, 50%)", intensity: 1.0, duration: 2000 },
      light: { temperature: "warm", intensity: 1.5, duration: 1500 },
      motion: { type: "expand", intensity: 0.8, duration: 1200 },
    },
    STREAK_CONTINUED: {
      visual: { type: "shimmer", color: "hsl(32, 95%, 55%)", intensity: 0.5, duration: 800 },
    },
    SIGIL_COLLECTED: {
      visual: { type: "bloom", color: "hsl(38, 92%, 50%)", intensity: 1.2, duration: 2500 },
      light: { temperature: "warm", intensity: 1.4, duration: 2000 },
      motion: { type: "expand", intensity: 1.0, duration: 1500 },
    },
    ROOM_SOLVED: {
      visual: { type: "bloom", color: "hsl(142, 71%, 45%)", intensity: 0.9, duration: 1800 },
      light: { temperature: "warm", intensity: 1.2, duration: 1200 },
    },
  },
};

const PRESETS: Record<AtmosphereType, ZoneExperiencePreset> = {
  forge: forgePreset,
  grammar: grammarPreset,
  studio: studioPreset,
  clinical: clinicalPreset,
  laboratory: laboratoryPreset,
  archive: archivePreset,
  aerzterat: aerzteratPreset,
  neutral: neutralPreset,
};

export function getZonePreset(zone: AtmosphereType): ZoneExperiencePreset {
  return PRESETS[zone] || PRESETS.neutral;
}
