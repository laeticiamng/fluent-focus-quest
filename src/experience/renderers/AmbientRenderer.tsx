// ── AmbientRenderer ──
// The baseline 2026 experience layer: depth, light, parallax, halo.
// Always-on, CSS-driven, zero-dependency. Adapts to atmosphere and performance.

import { useRef, useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { useAtmosphere } from "../core/experience-store";
import { getExperienceCapabilities } from "../performance/capability-tier";

interface AmbientRendererProps {
  children: ReactNode;
  className?: string;
}

export function AmbientRenderer({ children, className = "" }: AmbientRendererProps) {
  const { atmosphere, immersion, reducedEffects, performanceTier } = useAtmosphere();
  const containerRef = useRef<HTMLDivElement>(null);
  const caps = getExperienceCapabilities(performanceTier);

  // Parallax on mouse move (level 1+)
  useEffect(() => {
    if (!caps.enableParallax || reducedEffects || immersion < 1) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * caps.parallaxFactor * 100;
      const y = (e.clientY / window.innerHeight - 0.5) * caps.parallaxFactor * 100;
      container.style.setProperty("--parallax-x", `${x}px`);
      container.style.setProperty("--parallax-y", `${y}px`);
    };

    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [caps.enableParallax, caps.parallaxFactor, reducedEffects, immersion]);

  const { colors } = atmosphere;
  const orbDuration = caps.orbAnimationDuration;

  // Light direction as CSS gradient angle
  const lightAngle = Math.atan2(
    atmosphere.light.direction.y,
    atmosphere.light.direction.x
  ) * (180 / Math.PI) + 90;

  const lightIntensity = atmosphere.light.intensity;

  // Temperature to color offset
  const tempGlow = atmosphere.light.temperature === "warm"
    ? "32 80% 55%"
    : atmosphere.light.temperature === "cool"
    ? "215 70% 55%"
    : atmosphere.light.temperature === "dramatic"
    ? "0 60% 50%"
    : "225 20% 50%";

  return (
    <div
      ref={containerRef}
      className={`ambient-renderer relative ${className}`}
      style={{
        "--ambient-primary": colors.primary,
        "--ambient-secondary": colors.secondary,
        "--ambient-accent": colors.accent,
        "--ambient-glow": colors.glow,
        "--ambient-light-angle": `${lightAngle}deg`,
        "--ambient-light-intensity": lightIntensity,
        "--parallax-x": "0px",
        "--parallax-y": "0px",
      } as React.CSSProperties}
    >
      {/* Layer 0: Directional light gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-700"
        style={{
          opacity: immersion >= 1 ? 1 : 0.4,
          background: `
            linear-gradient(
              var(--ambient-light-angle, 135deg),
              hsl(${tempGlow} / ${0.06 * lightIntensity}),
              transparent 60%
            )
          `,
        }}
      />

      {/* Layer 1: Atmospheric gradient orbs */}
      {immersion >= 1 && (
        <>
          <motion.div
            animate={
              reducedEffects
                ? {}
                : { x: [0, 15, -10, 0], y: [0, -10, 8, 0] }
            }
            transition={
              reducedEffects
                ? {}
                : { duration: orbDuration, repeat: Infinity, ease: "easeInOut" }
            }
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle, hsl(${colors.primary} / 0.05), transparent 70%)`,
              filter: "blur(60px)",
              transform: "translate(var(--parallax-x, 0), var(--parallax-y, 0))",
            }}
          />
          <motion.div
            animate={
              reducedEffects
                ? {}
                : { x: [0, -12, 8, 0], y: [0, 12, -6, 0] }
            }
            transition={
              reducedEffects
                ? {}
                : { duration: (orbDuration || 20) + 4, repeat: Infinity, ease: "easeInOut" }
            }
            className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle, hsl(${colors.secondary} / 0.04), transparent 70%)`,
              filter: "blur(50px)",
              transform: "translate(calc(var(--parallax-x, 0) * -0.5), calc(var(--parallax-y, 0) * -0.5))",
            }}
          />
        </>
      )}

      {/* Layer 2: Accent halo (level 2+) */}
      {immersion >= 2 && !reducedEffects && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-32 rounded-full pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse, hsl(${colors.glow} / 0.04), transparent 80%)`,
            filter: "blur(40px)",
          }}
        />
      )}

      {/* Content with depth transform */}
      <div
        className="relative z-[2]"
        style={{
          transform: immersion >= 1 && !reducedEffects
            ? "translate(var(--parallax-x, 0), var(--parallax-y, 0))"
            : undefined,
          transition: "transform 0.3s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
