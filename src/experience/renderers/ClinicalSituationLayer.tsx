// ── ClinicalSituationLayer ──
// Contextual feedback layer for clinical scenarios.
// Adapts atmosphere based on clinical phase (anamnesis, hypotheses, diagnosis, note).

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience, useAtmosphere } from "../core/experience-store";

type ClinicalPhase = "reading" | "analyzing" | "hypothesizing" | "writing" | "submitted" | "feedback";

interface ClinicalSituationLayerProps {
  children: ReactNode;
  phase: ClinicalPhase;
  scenarioIndex?: number;
  narrativeText?: string;
}

const PHASE_CONFIG: Record<ClinicalPhase, {
  borderAccent: string;
  glowColor: string;
  glowIntensity: number;
  narrativeOpacity: number;
  bgOverlay: string;
}> = {
  reading: {
    borderAccent: "hsl(185 70% 48% / 0.1)",
    glowColor: "185 70% 48%",
    glowIntensity: 0.03,
    narrativeOpacity: 0.8,
    bgOverlay: "linear-gradient(180deg, hsl(185 70% 48% / 0.02), transparent 40%)",
  },
  analyzing: {
    borderAccent: "hsl(350 65% 55% / 0.12)",
    glowColor: "350 65% 55%",
    glowIntensity: 0.04,
    narrativeOpacity: 0.5,
    bgOverlay: "linear-gradient(180deg, hsl(350 65% 55% / 0.03), transparent 50%)",
  },
  hypothesizing: {
    borderAccent: "hsl(32 95% 55% / 0.15)",
    glowColor: "32 95% 55%",
    glowIntensity: 0.05,
    narrativeOpacity: 0.3,
    bgOverlay: "linear-gradient(180deg, hsl(32 95% 55% / 0.03), transparent 50%)",
  },
  writing: {
    borderAccent: "hsl(215 90% 58% / 0.12)",
    glowColor: "215 90% 58%",
    glowIntensity: 0.04,
    narrativeOpacity: 0.2,
    bgOverlay: "linear-gradient(180deg, hsl(215 90% 58% / 0.02), transparent 40%)",
  },
  submitted: {
    borderAccent: "hsl(142 71% 45% / 0.15)",
    glowColor: "142 71% 45%",
    glowIntensity: 0.05,
    narrativeOpacity: 0.6,
    bgOverlay: "linear-gradient(180deg, hsl(142 71% 45% / 0.03), transparent 50%)",
  },
  feedback: {
    borderAccent: "hsl(265 55% 62% / 0.12)",
    glowColor: "265 55% 62%",
    glowIntensity: 0.04,
    narrativeOpacity: 0.7,
    bgOverlay: "linear-gradient(180deg, hsl(265 55% 62% / 0.03), transparent 50%)",
  },
};

// Ambient monitor sounds — visual representation
const MONITOR_DOTS = [
  { delay: 0, size: 3 },
  { delay: 0.3, size: 2.5 },
  { delay: 0.6, size: 3 },
  { delay: 0.9, size: 2 },
  { delay: 1.2, size: 3 },
  { delay: 1.5, size: 2.5 },
];

export function ClinicalSituationLayer({
  children,
  phase,
  scenarioIndex = 0,
  narrativeText,
}: ClinicalSituationLayerProps) {
  const { shouldReduceEffects } = useExperience();
  const config = PHASE_CONFIG[phase];

  return (
    <div className="clinical-situation relative" style={{ isolation: "isolate" }}>
      {/* Background clinical atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{ background: config.bgOverlay }}
      />

      {/* Clinical narrative — ambient text */}
      <AnimatePresence mode="wait">
        {narrativeText && !shouldReduceEffects && (
          <motion.div
            key={`narrative-${scenarioIndex}-${phase}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: config.narrativeOpacity * 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute top-2 left-4 right-4 z-0 pointer-events-none"
          >
            <p className="text-[9px] italic text-muted-foreground/40 leading-relaxed">
              {narrativeText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clinical monitor heartbeat indicator */}
      {!shouldReduceEffects && (phase === "reading" || phase === "analyzing") && (
        <div className="absolute top-3 right-3 flex items-center gap-0.5 z-0 pointer-events-none">
          {MONITOR_DOTS.map((dot, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              style={{
                width: dot.size,
                height: dot.size,
                backgroundColor: `hsl(${config.glowColor} / 0.3)`,
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                delay: dot.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Submission success glow */}
      <AnimatePresence>
        {phase === "submitted" && !shouldReduceEffects && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            transition={{ duration: 1.5 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full pointer-events-none z-0"
            style={{
              background: `radial-gradient(ellipse, hsl(${config.glowColor} / 0.15), transparent 80%)`,
              filter: "blur(30px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
