// ── InterviewStageDirector ──
// Wraps interview simulator content with tension-aware atmosphere.
// Adapts light, color, motion based on interview stage and timer state.

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useExperience, useAtmosphere } from "../core/experience-store";
import { getExperienceCapabilities } from "../performance/capability-tier";

type InterviewStage = "preparation" | "answering" | "pressure" | "evaluating" | "results";
type Urgency = "calm" | "moderate" | "critical";

interface InterviewStageDirectorProps {
  children: ReactNode;
  stage: InterviewStage;
  timerSeconds?: number;
  timerRunning?: boolean;
  score?: number | null;
  pressureMode?: boolean;
}

function getUrgency(timerSeconds: number, timerRunning: boolean): Urgency {
  if (!timerRunning) return "calm";
  if (timerSeconds < 15) return "critical";
  if (timerSeconds < 30) return "moderate";
  return "calm";
}

const STAGE_CONFIG: Record<InterviewStage, {
  borderColor: string;
  glowColor: string;
  glowIntensity: number;
  bgGradient: string;
}> = {
  preparation: {
    borderColor: "hsl(265 55% 62% / 0.12)",
    glowColor: "265 55% 62%",
    glowIntensity: 0.03,
    bgGradient: "linear-gradient(145deg, hsl(265 55% 62% / 0.04), transparent 60%)",
  },
  answering: {
    borderColor: "hsl(265 55% 62% / 0.15)",
    glowColor: "265 55% 62%",
    glowIntensity: 0.05,
    bgGradient: "linear-gradient(145deg, hsl(265 55% 62% / 0.06), transparent 50%)",
  },
  pressure: {
    borderColor: "hsl(0 72% 51% / 0.2)",
    glowColor: "0 72% 51%",
    glowIntensity: 0.08,
    bgGradient: "linear-gradient(145deg, hsl(0 72% 51% / 0.06), hsl(265 55% 62% / 0.03), transparent 60%)",
  },
  evaluating: {
    borderColor: "hsl(265 55% 62% / 0.1)",
    glowColor: "265 55% 62%",
    glowIntensity: 0.04,
    bgGradient: "linear-gradient(145deg, hsl(265 55% 62% / 0.03), transparent 70%)",
  },
  results: {
    borderColor: "hsl(142 71% 45% / 0.15)",
    glowColor: "142 71% 45%",
    glowIntensity: 0.05,
    bgGradient: "linear-gradient(145deg, hsl(142 71% 45% / 0.05), transparent 60%)",
  },
};

const URGENCY_VIGNETTE: Record<Urgency, { color: string; opacity: number; pulse: boolean }> = {
  calm: { color: "transparent", opacity: 0, pulse: false },
  moderate: { color: "hsl(32 95% 55%)", opacity: 0.06, pulse: false },
  critical: { color: "hsl(0 72% 51%)", opacity: 0.1, pulse: true },
};

export function InterviewStageDirector({
  children,
  stage,
  timerSeconds = 120,
  timerRunning = false,
  score,
  pressureMode = false,
}: InterviewStageDirectorProps) {
  const { shouldReduceEffects, state: { performanceTier } } = useExperience();
  const caps = getExperienceCapabilities(performanceTier);
  const vignetteControls = useAnimationControls();
  const prevStage = useRef(stage);

  const effectiveStage = pressureMode && stage === "answering" ? "pressure" : stage;
  const urgency = getUrgency(timerSeconds, timerRunning);
  const config = STAGE_CONFIG[effectiveStage];
  const vignette = URGENCY_VIGNETTE[urgency];

  // Score-based results color
  const resultsConfig = score !== null && score !== undefined && stage === "results"
    ? {
      glowColor: score >= 70 ? "142 71% 45%" : score >= 40 ? "32 95% 55%" : "0 72% 51%",
      glowIntensity: 0.06,
    }
    : null;

  // Animate vignette on urgency change
  useEffect(() => {
    if (shouldReduceEffects) return;
    if (vignette.pulse) {
      vignetteControls.start({
        opacity: [vignette.opacity, vignette.opacity * 1.8, vignette.opacity],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
      });
    } else {
      vignetteControls.start({
        opacity: vignette.opacity,
        transition: { duration: 0.6 },
      });
    }
  }, [urgency, shouldReduceEffects]);

  // Stage transition flash
  useEffect(() => {
    if (prevStage.current !== stage && !shouldReduceEffects) {
      prevStage.current = stage;
    }
  }, [stage]);

  const glowColor = resultsConfig?.glowColor || config.glowColor;
  const glowIntensity = resultsConfig?.glowIntensity || config.glowIntensity;

  return (
    <div className="interview-stage-director relative" style={{ isolation: "isolate" }}>
      {/* Atmospheric background gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0 rounded-2xl"
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ background: config.bgGradient }}
      />

      {/* Directional light glow */}
      {!shouldReduceEffects && (
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full pointer-events-none z-0"
          animate={{
            opacity: [glowIntensity, glowIntensity * 1.3, glowIntensity],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(ellipse, hsl(${glowColor} / ${glowIntensity * 2}), transparent 70%)`,
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Urgency vignette — edges darken/redden under pressure */}
      {!shouldReduceEffects && urgency !== "calm" && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[1] rounded-2xl"
          animate={vignetteControls}
          initial={{ opacity: 0 }}
          style={{
            background: `
              radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, ${vignette.color} / 0.15 100%)
            `,
          }}
        />
      )}

      {/* Timer tension bar (critical only) */}
      {!shouldReduceEffects && urgency === "critical" && timerRunning && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-0.5 z-[3] rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500/80 to-rose-400/60"
            animate={{ width: ["100%", "0%"] }}
            transition={{ duration: timerSeconds, ease: "linear" }}
          />
        </motion.div>
      )}

      {/* Content */}
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
