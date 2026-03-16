import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AtmosphericSceneWrapperProps {
  children: ReactNode;
  atmosphere?: "forge" | "grammar" | "studio" | "clinical" | "laboratory" | "archive" | "aerzterat" | "neutral";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

const ATMO_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  forge: { primary: "32 95% 55%", secondary: "25 80% 45%", accent: "38 92% 50%" },
  grammar: { primary: "152 60% 48%", secondary: "142 50% 40%", accent: "160 70% 55%" },
  studio: { primary: "265 55% 62%", secondary: "275 50% 50%", accent: "255 65% 68%" },
  clinical: { primary: "350 65% 55%", secondary: "340 55% 45%", accent: "0 70% 60%" },
  laboratory: { primary: "215 90% 58%", secondary: "225 80% 48%", accent: "205 85% 62%" },
  archive: { primary: "185 70% 48%", secondary: "195 60% 40%", accent: "175 75% 55%" },
  aerzterat: { primary: "240 60% 55%", secondary: "230 55% 45%", accent: "250 65% 60%" },
  neutral: { primary: "225 14% 20%", secondary: "225 14% 15%", accent: "215 90% 58%" },
};

const INTENSITY_OPACITY: Record<string, { orb: number; gradient: number }> = {
  low: { orb: 0.04, gradient: 0.03 },
  medium: { orb: 0.07, gradient: 0.05 },
  high: { orb: 0.1, gradient: 0.08 },
};

export function AtmosphericSceneWrapper({
  children,
  atmosphere = "neutral",
  intensity = "medium",
  className = "",
}: AtmosphericSceneWrapperProps) {
  const colors = ATMO_COLORS[atmosphere] || ATMO_COLORS.neutral;
  const opacities = INTENSITY_OPACITY[intensity];

  return (
    <div className={`atmo-scene relative ${className}`}>
      {/* Background atmospheric gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 20% 20%, hsl(${colors.primary} / ${opacities.gradient}), transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 70%, hsl(${colors.secondary} / ${opacities.gradient * 0.7}), transparent 50%),
            radial-gradient(ellipse 40% 30% at 50% 50%, hsl(${colors.accent} / ${opacities.gradient * 0.4}), transparent 40%)
          `,
        }}
      />

      {/* Floating ambient orbs */}
      <motion.div
        animate={{ x: [0, 15, -10, 0], y: [0, -10, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -left-20 w-64 h-64 rounded-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, hsl(${colors.primary} / ${opacities.orb}), transparent 70%)`,
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -12, 8, 0], y: [0, 12, -6, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none z-0"
        style={{
          background: `radial-gradient(circle, hsl(${colors.secondary} / ${opacities.orb * 0.8}), transparent 70%)`,
          filter: "blur(50px)",
        }}
      />

      {/* Content */}
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
