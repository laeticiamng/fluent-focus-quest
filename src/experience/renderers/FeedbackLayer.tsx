// ── FeedbackLayer ──
// Non-blocking visual micro-reactions overlaid on the experience.
// Renders active feedbacks from the experience store as ephemeral visual effects.

import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "../core/experience-store";

export function FeedbackLayer() {
  const { state, shouldReduceEffects } = useExperience();

  if (shouldReduceEffects || state.activeFeedbacks.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
      <AnimatePresence>
        {state.activeFeedbacks.map((fb, i) => {
          if (!fb.visual) return null;

          const { type, color, intensity = 0.5, duration = 800 } = fb.visual;

          switch (type) {
            case "glow":
              return (
                <motion.div
                  key={`fb-glow-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: intensity * 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: duration / 1000 }}
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse 80% 60% at 50% 50%, ${color || "hsl(215, 90%, 58%)"} / 0.15, transparent 70%)`,
                    filter: "blur(40px)",
                  }}
                />
              );

            case "bloom":
              return (
                <motion.div
                  key={`fb-bloom-${i}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: intensity * 0.25, scale: 1.2 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: duration / 1000, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    className="w-96 h-96 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${color || "hsl(38, 92%, 50%)"} / 0.2, transparent 70%)`,
                      filter: "blur(60px)",
                    }}
                  />
                </motion.div>
              );

            case "ripple":
              return (
                <motion.div
                  key={`fb-ripple-${i}`}
                  initial={{ opacity: intensity * 0.4, scale: 0 }}
                  animate={{ opacity: 0, scale: 3 }}
                  transition={{ duration: duration / 1000, ease: "easeOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div
                    className="w-32 h-32 rounded-full border-2"
                    style={{
                      borderColor: color || "hsl(215, 90%, 58%)",
                      opacity: 0.3,
                    }}
                  />
                </motion.div>
              );

            case "flash":
              return (
                <motion.div
                  key={`fb-flash-${i}`}
                  initial={{ opacity: intensity * 0.15 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: duration / 1000 }}
                  className="absolute inset-0"
                  style={{
                    background: color || "hsl(0, 60%, 50%)",
                  }}
                />
              );

            case "shimmer":
              return (
                <motion.div
                  key={`fb-shimmer-${i}`}
                  initial={{ opacity: 0, x: "-100%" }}
                  animate={{ opacity: intensity * 0.1, x: "100%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: duration / 1000, ease: "easeInOut" }}
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${color || "hsl(38, 92%, 50%)"} / 0.15, transparent)`,
                  }}
                />
              );

            default:
              return null;
          }
        })}
      </AnimatePresence>
    </div>
  );
}
