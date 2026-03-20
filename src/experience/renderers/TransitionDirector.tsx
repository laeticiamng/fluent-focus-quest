// ── TransitionDirector ──
// Unified transition system for tab/flow/scene changes.
// Replaces CameraTransitionLayer with atmosphere-aware transitions.

import { type ReactNode, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtmosphere } from "../core/experience-store";
import { getExperienceCapabilities } from "../performance/capability-tier";

type TransitionStyle = "zoom-in" | "zoom-out" | "slide-left" | "slide-right" | "rise" | "descend" | "dissolve";

interface TransitionDirectorProps {
  children: ReactNode;
  transitionKey: string;
  style?: TransitionStyle;
}

const TRANSITION_VARIANTS: Record<TransitionStyle, {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit: Record<string, number | string>;
}> = {
  "zoom-in": {
    initial: { opacity: 0, scale: 0.94, y: 12, filter: "blur(3px)" },
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.03, y: -8, filter: "blur(2px)" },
  },
  "zoom-out": {
    initial: { opacity: 0, scale: 1.06, y: -8, filter: "blur(2px)" },
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.95, y: 10, filter: "blur(2px)" },
  },
  "slide-left": {
    initial: { opacity: 0, x: 40, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -40, scale: 0.98 },
  },
  "slide-right": {
    initial: { opacity: 0, x: -40, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 40, scale: 0.98 },
  },
  rise: {
    initial: { opacity: 0, y: 30, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 1.02 },
  },
  descend: {
    initial: { opacity: 0, y: -25, scale: 1.02 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 25, scale: 0.97 },
  },
  dissolve: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
};

/** Map tabs to transition styles for spatial consistency */
const TAB_TRANSITION_MAP: Record<string, TransitionStyle> = {
  dash: "zoom-out",
  questmap: "zoom-in",
  simulator: "rise",
  vocab: "slide-right",
  gram: "slide-right",
  iv: "slide-right",
  sim: "slide-right",
  atelier: "zoom-in",
  portfolio: "slide-left",
  puzzles: "zoom-in",
  lazarus: "rise",
  achievements: "dissolve",
  leaderboard: "dissolve",
  tools: "slide-left",
  stats: "slide-left",
  cal: "slide-left",
  motiv: "rise",
};

export function getTransitionStyle(tab: string): TransitionStyle {
  return TAB_TRANSITION_MAP[tab] || "zoom-in";
}

export function TransitionDirector({
  children,
  transitionKey,
  style,
}: TransitionDirectorProps) {
  const { reducedEffects, performanceTier } = useAtmosphere();
  const caps = getExperienceCapabilities(performanceTier);

  const effectiveStyle = style || getTransitionStyle(transitionKey);

  const variants = useMemo(() => {
    if (reducedEffects) return TRANSITION_VARIANTS.dissolve;
    return TRANSITION_VARIANTS[effectiveStyle];
  }, [effectiveStyle, reducedEffects]);

  const duration = reducedEffects ? 0.15 : caps.transitionDuration / 1000;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={transitionKey}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{
          duration,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
