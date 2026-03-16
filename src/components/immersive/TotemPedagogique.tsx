import { motion } from "framer-motion";

interface TotemPedagogiqueProps {
  type: "vocabulaire" | "grammaire" | "clinique" | "entretien" | "raisonnement" | "creation" | "archive";
  size?: "sm" | "md" | "lg";
  animate?: boolean;
  className?: string;
}

const TOTEM_CONFIG: Record<string, { icon: string; label: string; color: string; glowColor: string }> = {
  vocabulaire: { icon: "📖", label: "Vocabulaire", color: "from-amber-500/20 to-amber-400/5", glowColor: "32 95% 55%" },
  grammaire: { icon: "🌳", label: "Grammaire", color: "from-emerald-500/20 to-emerald-400/5", glowColor: "152 60% 48%" },
  clinique: { icon: "🩺", label: "Clinique", color: "from-rose-500/20 to-rose-400/5", glowColor: "350 65% 55%" },
  entretien: { icon: "🎙️", label: "Entretien", color: "from-violet-500/20 to-violet-400/5", glowColor: "265 55% 62%" },
  raisonnement: { icon: "🧠", label: "Raisonnement", color: "from-blue-500/20 to-blue-400/5", glowColor: "215 90% 58%" },
  creation: { icon: "⚗️", label: "Creation", color: "from-cyan-500/20 to-cyan-400/5", glowColor: "185 70% 48%" },
  archive: { icon: "📚", label: "Archives", color: "from-indigo-500/20 to-indigo-400/5", glowColor: "240 60% 55%" },
};

const SIZES = {
  sm: { container: "w-10 h-10", icon: "text-lg", label: "text-[8px]" },
  md: { container: "w-14 h-14", icon: "text-2xl", label: "text-[9px]" },
  lg: { container: "w-20 h-20", icon: "text-3xl", label: "text-[10px]" },
};

export function TotemPedagogique({ type, size = "md", animate = true, className = "" }: TotemPedagogiqueProps) {
  const config = TOTEM_CONFIG[type] || TOTEM_CONFIG.vocabulaire;
  const sizeConfig = SIZES[size];

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <motion.div
        animate={animate ? { y: [0, -4, 0], rotateY: [0, 8, -8, 0] } : undefined}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className={`totem-pedestal ${sizeConfig.container} rounded-2xl bg-gradient-to-br ${config.color} border border-white/[0.06] flex items-center justify-center relative`}
        style={{
          boxShadow: `var(--shadow-3d-md), 0 0 20px -6px hsl(${config.glowColor} / 0.25)`,
        }}
      >
        {/* Top highlight */}
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className={sizeConfig.icon}>{config.icon}</span>
      </motion.div>
      <span className={`${sizeConfig.label} font-bold text-muted-foreground/70`}>{config.label}</span>
    </div>
  );
}
