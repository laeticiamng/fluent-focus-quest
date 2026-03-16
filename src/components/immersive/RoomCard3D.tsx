import { motion } from "framer-motion";
import { Lock, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import type { RoomStatus } from "@/data/escapeGame";

interface RoomCard3DProps {
  name: string;
  icon: string;
  status: RoomStatus;
  challenge: string;
  narrativeOnSolve?: string;
  unlockDetails?: string;
  progress?: { current: number; threshold: number; percentage: number };
  rewardIcon?: string;
  colorText?: string;
  colorGradient?: string;
  onClick?: () => void;
  delay?: number;
}

const STATUS_CONFIG: Record<string, { className: string; label: string }> = {
  undiscovered: { className: "room-locked opacity-20", label: "Non decouverte" },
  discovered: { className: "room-locked opacity-50", label: "Decouverte" },
  locked: { className: "room-locked", label: "Verrouille" },
  accessible: { className: "room-accessible", label: "Accessible" },
  in_progress: { className: "room-in-progress", label: "En cours" },
  solved: { className: "room-solved", label: "Resolue" },
  secret: { className: "room-locked", label: "Secrete" },
};

export function RoomCard3D({
  name, icon, status, challenge, narrativeOnSolve, unlockDetails,
  progress, rewardIcon, colorText = "text-primary", colorGradient = "from-primary/60 to-primary/30",
  onClick, delay = 0,
}: RoomCard3DProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.locked;
  const canNavigate = status === "accessible" || status === "in_progress" || status === "solved";
  const isLocked = status === "locked" || status === "undiscovered" || status === "discovered";

  return (
    <motion.button
      initial={{ opacity: 0, y: 12, rotateX: -3 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={canNavigate ? { y: -4, rotateX: 1, scale: 1.01 } : undefined}
      whileTap={canNavigate ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={!canNavigate}
      className={`w-full rounded-2xl p-4 text-left transition-all relative overflow-hidden group perspective-card-3d
        room-3d ${config.className}
        ${canNavigate ? "cursor-pointer" : "cursor-default"}`}
    >
      {/* Inner light for accessible/in_progress */}
      {(status === "accessible" || status === "in_progress") && (
        <div className="inner-light absolute inset-0 pointer-events-none" style={{
          "--inner-light-color": status === "in_progress"
            ? "hsl(var(--warning) / 0.1)"
            : "hsl(var(--primary) / 0.08)"
        } as React.CSSProperties} />
      )}

      {/* Locked overlay with metallic feel */}
      {isLocked && (
        <div className="absolute inset-0 rounded-2xl z-[2]">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-hsl(0,0%,0%,0.2)" />
          {/* Metallic scratch lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 2px, hsl(0 0% 50%) 2px, hsl(0 0% 50%) 3px)" }} />
        </div>
      )}

      <div className="relative z-[3] flex items-center gap-3">
        {/* Door icon with depth */}
        <div className={`door-icon-3d w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
          ${status === "solved" ? "bg-gradient-to-br from-success/20 to-success/5 border border-success/20" :
            status === "in_progress" ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20" :
            status === "accessible" ? "bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20" :
            "bg-secondary/30 border border-border/20"}`}
        >
          {status === "solved" ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-success" />
          ) : isLocked ? (
            <Lock className="w-4 h-4 text-muted-foreground/40" />
          ) : (
            <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
          )}
        </div>

        {/* Room info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold ${
              status === "solved" ? "text-success" :
              isLocked ? "text-muted-foreground/50" : ""
            }`}>
              {name}
            </span>
            {status === "in_progress" && (
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 animate-pulse">
                EN COURS
              </span>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
            {isLocked ? unlockDetails :
             status === "solved" ? (narrativeOnSolve || "").slice(0, 60) + "..." :
             challenge}
          </p>

          {/* Progress bar with glow */}
          {(status === "accessible" || status === "in_progress") && progress && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-secondary/40 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${colorGradient} relative`}
                >
                  {/* Glow tip */}
                  {progress.percentage > 0 && progress.percentage < 100 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/30 blur-[2px]" />
                  )}
                </motion.div>
              </div>
              <span className="text-[9px] font-bold text-muted-foreground">
                {progress.current}/{progress.threshold}
              </span>
            </div>
          )}
        </div>

        {/* Reward / navigation indicator */}
        {status === "solved" && rewardIcon && (
          <motion.span
            animate={{ rotateY: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-lg"
          >{rewardIcon}</motion.span>
        )}
        {canNavigate && status !== "solved" && (
          <ChevronRight className={`w-4 h-4 ${colorText} opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
        )}
      </div>

      {/* Light sweep on hover */}
      {canNavigate && (
        <div className="absolute inset-0 z-[4] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity overflow-hidden">
          <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent
            translate-x-[-100%] group-hover:translate-x-[400%] transition-transform duration-1000 ease-out" />
        </div>
      )}
    </motion.button>
  );
}
