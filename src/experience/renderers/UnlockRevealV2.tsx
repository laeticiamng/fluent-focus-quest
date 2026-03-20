// ── UnlockRevealV2 ──
// Replaces badge/card-based reveals with environmental transformations.
// Instead of showing a popup, the environment itself transforms to show the unlock.

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useExperience } from "../core/experience-store";

interface UnlockEvent {
  type: "room" | "zone" | "sigil" | "fragment" | "achievement";
  id: string;
  name: string;
  icon: string;
  label: string;
}

interface UnlockRevealV2Props {
  events: UnlockEvent[];
  onComplete: () => void;
}

const TYPE_COLORS: Record<UnlockEvent["type"], { accent: string; glow: string }> = {
  sigil: { accent: "38 92% 50%", glow: "38 85% 50%" },
  room: { accent: "142 71% 45%", glow: "142 65% 42%" },
  zone: { accent: "215 90% 58%", glow: "215 80% 55%" },
  fragment: { accent: "32 95% 55%", glow: "32 85% 50%" },
  achievement: { accent: "265 55% 62%", glow: "265 50% 58%" },
};

export function UnlockRevealV2({ events, onComplete }: UnlockRevealV2Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const { shouldReduceEffects } = useExperience();

  const currentEvent = events[currentIndex];
  if (!currentEvent) return null;

  const colors = TYPE_COLORS[currentEvent.type];

  useEffect(() => {
    if (events.length === 0) return;
    setPhase("enter");
    const showTimer = setTimeout(() => setPhase("show"), 300);
    return () => clearTimeout(showTimer);
  }, [currentIndex, events.length]);

  const handleDismiss = () => {
    if (currentIndex < events.length - 1) {
      setPhase("exit");
      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setPhase("enter");
      }, 400);
    } else {
      setPhase("exit");
      setTimeout(onComplete, 400);
    }
  };

  const isSigil = currentEvent.type === "sigil";

  return (
    <AnimatePresence>
      <motion.div
        key="unlock-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[200] flex items-center justify-center"
        onClick={handleDismiss}
      >
        {/* Atmospheric backdrop — not just blur, actual environment shift */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 50% 40%, hsl(${colors.glow} / 0.08), transparent 60%),
              hsl(var(--background) / 0.85)
            `,
            backdropFilter: shouldReduceEffects ? "none" : "blur(16px) saturate(120%)",
            WebkitBackdropFilter: shouldReduceEffects ? "none" : "blur(16px) saturate(120%)",
          }}
        />

        {/* Light cone from above */}
        {!shouldReduceEffects && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 0.15, scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-96 pointer-events-none"
            style={{
              background: `linear-gradient(180deg, hsl(${colors.accent} / 0.2), transparent 80%)`,
              clipPath: "polygon(35% 0%, 65% 0%, 80% 100%, 20% 100%)",
              filter: "blur(20px)",
            }}
          />
        )}

        {/* Radial glow pulse */}
        {!shouldReduceEffects && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.3, 1.1],
              opacity: [0, 0.4, 0.2],
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, hsl(${colors.glow} / 0.15), transparent 70%)`,
              filter: "blur(40px)",
            }}
          />
        )}

        {/* Environmental particles — sparse, elegant */}
        {!shouldReduceEffects && Array.from({ length: isSigil ? 20 : 12 }).map((_, i) => {
          const angle = (i / (isSigil ? 20 : 12)) * Math.PI * 2;
          const dist = 50 + Math.random() * 100;
          return (
            <motion.div
              key={`p-${currentIndex}-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
                backgroundColor: `hsl(${colors.accent} / 0.6)`,
              }}
              initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 0.8, 0],
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist - 20,
              }}
              transition={{ duration: 1.6, delay: 0.2 + Math.random() * 0.4, ease: "easeOut" }}
            />
          );
        })}

        {/* Content — the reveal card */}
        <motion.div
          key={`reveal-${currentIndex}`}
          initial={{ scale: 0.6, opacity: 0, y: 30, rotateX: 15 }}
          animate={
            phase === "exit"
              ? { scale: 0.9, opacity: 0, y: -20 }
              : { scale: 1, opacity: 1, y: 0, rotateX: 0 }
          }
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 20,
            delay: phase === "enter" ? 0.1 : 0,
          }}
          className="relative z-10 max-w-sm mx-4"
        >
          <div
            className="rounded-3xl p-8 text-center relative overflow-hidden"
            style={{
              background: `linear-gradient(160deg, hsl(${colors.accent} / 0.08), hsl(var(--card)), hsl(var(--card)))`,
              border: `1px solid hsl(${colors.accent} / 0.2)`,
              boxShadow: `
                var(--shadow-3d-xl),
                0 0 60px -12px hsl(${colors.glow} / 0.2),
                inset 0 1px 0 0 hsl(0 0% 100% / 0.04)
              `,
            }}
          >
            {/* Top edge light */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

            {/* Icon with transformation animation */}
            <motion.div
              className="text-5xl mb-4 inline-block"
              initial={{ scale: 0, rotateY: -180 }}
              animate={{
                scale: 1,
                rotateY: 0,
                ...(isSigil ? { rotateY: [0, 360] } : {}),
              }}
              transition={{
                scale: { type: "spring", stiffness: 200, damping: 15, delay: 0.3 },
                rotateY: isSigil
                  ? { duration: 2, delay: 0.5, ease: "easeInOut" }
                  : { type: "spring", stiffness: 200, damping: 15, delay: 0.3 },
              }}
            >
              {currentEvent.icon}
            </motion.div>

            {/* Label */}
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-[10px] font-bold uppercase tracking-[3px] mb-2"
              style={{ color: `hsl(${colors.accent})` }}
            >
              {currentEvent.label}
            </motion.p>

            {/* Name */}
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg font-black tracking-tight"
            >
              {currentEvent.name}
            </motion.p>

            {/* Progress dots */}
            {events.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-5 flex justify-center gap-1.5"
              >
                {events.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === currentIndex ? "bg-foreground scale-125" : i < currentIndex ? "bg-foreground/40" : "bg-foreground/15"
                    }`}
                  />
                ))}
              </motion.div>
            )}

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1 }}
              className="text-[9px] text-muted-foreground mt-4"
            >
              Tape pour continuer
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
