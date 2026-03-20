// ── ProgressEnvironmentMapper ──
// Translates user progression metrics into ambient environmental state.
// Maps XP, streak, artifacts, rooms solved → atmosphere intensity, warmth, energy.

import { useMemo, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useExperience, useAtmosphere } from "../core/experience-store";

interface ProgressEnvironmentMapperProps {
  children: ReactNode;
  /** Current XP total */
  xp: number;
  /** Current streak days */
  streak: number;
  /** Number of artifacts created */
  artifactCount: number;
  /** Rooms solved / total rooms ratio (0-1) */
  progressRatio: number;
  /** Days until interview */
  daysRemaining: number;
}

interface EnvironmentState {
  /** Ambient energy level (0-1) */
  energy: number;
  /** Warmth intensity (0-1) */
  warmth: number;
  /** Urgency level (0-1) */
  urgency: number;
  /** Achievement glow intensity (0-1) */
  achievementGlow: number;
  /** Momentum indicator — based on recent activity */
  momentum: "dormant" | "steady" | "building" | "surging";
}

function computeEnvironment(props: Omit<ProgressEnvironmentMapperProps, "children">): EnvironmentState {
  const { xp, streak, artifactCount, progressRatio, daysRemaining } = props;

  // Energy: composite of XP rank and progress
  const xpNormalized = Math.min(1, xp / 5000);
  const energy = xpNormalized * 0.4 + progressRatio * 0.4 + Math.min(1, artifactCount / 100) * 0.2;

  // Warmth: streak and consistency
  const warmth = Math.min(1, streak / 14) * 0.6 + Math.min(1, artifactCount / 50) * 0.4;

  // Urgency: time pressure
  const urgency = daysRemaining <= 3 ? 0.9 : daysRemaining <= 7 ? 0.6 : daysRemaining <= 14 ? 0.3 : 0.1;

  // Achievement glow: milestone detection
  const achievementGlow =
    progressRatio >= 0.9 ? 0.8 :
    progressRatio >= 0.7 ? 0.5 :
    progressRatio >= 0.5 ? 0.3 : 0.1;

  // Momentum
  const momentum: EnvironmentState["momentum"] =
    streak >= 7 && artifactCount > 50 ? "surging" :
    streak >= 3 && artifactCount > 20 ? "building" :
    streak >= 1 ? "steady" : "dormant";

  return { energy, warmth, urgency, achievementGlow, momentum };
}

const MOMENTUM_ORBS: Record<EnvironmentState["momentum"], { count: number; speed: number; opacity: number }> = {
  dormant: { count: 0, speed: 0, opacity: 0 },
  steady: { count: 1, speed: 25, opacity: 0.03 },
  building: { count: 2, speed: 20, opacity: 0.04 },
  surging: { count: 3, speed: 15, opacity: 0.06 },
};

export function ProgressEnvironmentMapper({
  children,
  xp,
  streak,
  artifactCount,
  progressRatio,
  daysRemaining,
}: ProgressEnvironmentMapperProps) {
  const { shouldReduceEffects } = useExperience();

  const env = useMemo(() =>
    computeEnvironment({ xp, streak, artifactCount, progressRatio, daysRemaining }),
    [xp, streak, artifactCount, progressRatio, daysRemaining]
  );

  const orbConfig = MOMENTUM_ORBS[env.momentum];

  // Urgency color blend: warm → orange → red
  const urgencyHue = 32 - env.urgency * 32; // 32 (amber) → 0 (red)
  const urgencyColor = `${urgencyHue} ${70 + env.urgency * 25}% 52%`;

  return (
    <div
      className="progress-env-mapper relative"
      style={{
        "--env-energy": env.energy,
        "--env-warmth": env.warmth,
        "--env-urgency": env.urgency,
      } as React.CSSProperties}
    >
      {/* Warmth baseline — subtle warm glow */}
      {!shouldReduceEffects && env.warmth > 0.2 && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000"
          style={{
            opacity: env.warmth * 0.4,
            background: `radial-gradient(ellipse 80% 60% at 30% 20%, hsl(32 80% 50% / ${env.warmth * 0.03}), transparent 70%)`,
          }}
        />
      )}

      {/* Urgency vignette — edges tighten as deadline approaches */}
      {!shouldReduceEffects && env.urgency > 0.3 && (
        <div
          className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000"
          style={{
            opacity: env.urgency * 0.5,
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, transparent 30%, hsl(${urgencyColor} / ${env.urgency * 0.04}) 100%)`,
          }}
        />
      )}

      {/* Momentum orbs — more orbs = more activity momentum */}
      {!shouldReduceEffects && orbConfig.count > 0 && (
        <>
          {Array.from({ length: orbConfig.count }).map((_, i) => (
            <motion.div
              key={`momentum-${i}`}
              className="absolute rounded-full pointer-events-none z-0"
              style={{
                width: 180 + i * 40,
                height: 180 + i * 40,
                top: `${20 + i * 25}%`,
                left: i % 2 === 0 ? "-15%" : "auto",
                right: i % 2 !== 0 ? "-15%" : "auto",
                background: `radial-gradient(circle, hsl(32 80% 50% / ${orbConfig.opacity}), transparent 70%)`,
                filter: "blur(50px)",
              }}
              animate={
                shouldReduceEffects ? {} : {
                  x: [0, (i % 2 === 0 ? 10 : -10), 0],
                  y: [0, -8, 0],
                }
              }
              transition={{
                duration: orbConfig.speed + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}

      {/* Achievement glow — subtle center light when progress is high */}
      {!shouldReduceEffects && env.achievementGlow > 0.3 && (
        <motion.div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-24 rounded-full pointer-events-none z-0"
          animate={{ opacity: [env.achievementGlow * 0.3, env.achievementGlow * 0.5, env.achievementGlow * 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background: `radial-gradient(ellipse, hsl(38 92% 50% / ${env.achievementGlow * 0.04}), transparent 80%)`,
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
