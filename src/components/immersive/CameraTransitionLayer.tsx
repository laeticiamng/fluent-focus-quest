import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useMemo } from "react";

type CameraDirection = "zoom-in" | "zoom-out" | "slide-left" | "slide-right" | "rise" | "descend";

interface CameraTransitionLayerProps {
  children: ReactNode;
  transitionKey: string;
  direction?: CameraDirection;
  duration?: number;
}

const CAMERA_VARIANTS: Record<CameraDirection, {
  initial: Record<string, number | string>;
  animate: Record<string, number | string>;
  exit: Record<string, number | string>;
}> = {
  "zoom-in": {
    initial: { opacity: 0, scale: 0.92, y: 20, filter: "blur(4px)" },
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.05, y: -10, filter: "blur(2px)" },
  },
  "zoom-out": {
    initial: { opacity: 0, scale: 1.08, y: -10, filter: "blur(3px)" },
    animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 0.94, y: 15, filter: "blur(2px)" },
  },
  "slide-left": {
    initial: { opacity: 0, x: 50, scale: 0.97 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 0.97 },
  },
  "slide-right": {
    initial: { opacity: 0, x: -50, scale: 0.97 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 50, scale: 0.97 },
  },
  "rise": {
    initial: { opacity: 0, y: 40, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 1.02 },
  },
  "descend": {
    initial: { opacity: 0, y: -30, scale: 1.03 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 30, scale: 0.97 },
  },
};

// Map tabs to camera directions for spatial consistency
const TAB_CAMERA_MAP: Record<string, CameraDirection> = {
  dash: "zoom-out",
  questmap: "zoom-in",
  vocab: "slide-right",
  gram: "slide-right",
  iv: "slide-right",
  sim: "slide-right",
  atelier: "zoom-in",
  portfolio: "slide-left",
  puzzles: "zoom-in",
  lazarus: "rise",
  tools: "slide-left",
  stats: "slide-left",
  cal: "slide-left",
  motiv: "rise",
};

export function getCameraDirection(tab: string): CameraDirection {
  return TAB_CAMERA_MAP[tab] || "zoom-in";
}

export function CameraTransitionLayer({
  children,
  transitionKey,
  direction = "zoom-in",
  duration = 0.5,
}: CameraTransitionLayerProps) {
  const variants = useMemo(() => CAMERA_VARIANTS[direction], [direction]);

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
