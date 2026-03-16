import { getBuilderRank, BUILDER_RANKS } from "@/data/content";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface XPBarProps { xp: number; compact?: boolean; }

export function XPBar({ xp, compact = false }: XPBarProps) {
  const { rank, nextRank, progressToNext, xpToNext, rankIndex } = getBuilderRank(xp);
  const [showRankUp, setShowRankUp] = useState(false);
  const prevRankRef = useRef(rankIndex);

  useEffect(() => {
    if (rankIndex > prevRankRef.current) {
      setShowRankUp(true);
      const t = setTimeout(() => setShowRankUp(false), 3000);
      prevRankRef.current = rankIndex;
      return () => clearTimeout(t);
    }
    prevRankRef.current = rankIndex;
  }, [rankIndex]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{rank.icon}</span>
        <span className={`text-[10px] font-bold ${rank.color}`}>{rank.nameShort}</span>
        <div className="flex items-center gap-1">
          <Zap className="w-2.5 h-2.5 text-amber-400" />
          <span className="text-[10px] font-bold text-amber-400">{xp}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Rank up celebration — volumetric 3D */}
      <AnimatePresence>
        {showRankUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -15, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="room-3d rounded-2xl p-6 text-center mb-2 relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, hsl(var(--card)), hsl(var(--card)))`,
              boxShadow: "var(--shadow-3d-xl), 0 0 60px -12px hsl(38 92% 50% / 0.3)",
            }}
          >
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-amber-400/15 to-transparent" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-amber-500/[0.06] blur-[40px] rounded-full" />
            </div>
            <motion.div
              animate={{ rotateY: [0, 360], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5 }}
              className="text-5xl mb-3 inline-block relative z-10"
            >{rank.icon}</motion.div>
            <p className={`text-sm font-black ${rank.color} relative z-10`}>Rang obtenu : {rank.name} !</p>
            <p className="text-[10px] text-muted-foreground mt-1 relative z-10">{rank.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="room-3d rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: rankIndex >= 2
            ? `linear-gradient(145deg, hsl(38 92% 50% / 0.06), hsl(var(--card)))`
            : undefined,
          border: rankIndex >= 2 ? "1px solid hsl(38 92% 50% / 0.1)" : undefined,
          boxShadow: "var(--shadow-3d-md)",
        }}
      >
        {/* Top edge highlight */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        {/* Subtle glow for higher ranks */}
        {rankIndex >= 2 && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-16 bg-amber-500/[0.04] blur-[30px] rounded-full" />
          </div>
        )}

        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotateY: 15 }}
            className={`door-icon-3d w-14 h-14 rounded-2xl bg-gradient-to-br ${rank.bg} border ${rank.border} flex items-center justify-center text-2xl cursor-default select-none shrink-0 ${rank.glow}`}
            style={{ boxShadow: "var(--shadow-3d-md)" }}
          >
            {rank.icon}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`font-black text-sm tracking-tight ${rank.color}`}>{rank.name}</span>
                <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-current/10 ${rank.color}`}>
                  Rang {rankIndex + 1}/{BUILDER_RANKS.length}
                </span>
              </div>
              <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                <Zap className="w-3 h-3" />{xp} XP
              </span>
            </div>
            <div className="relative">
              <Progress value={progressToNext * 100} className="h-2.5 bg-secondary rounded-full" />
              {progressToNext > 0.05 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-1"
                >
                  <div className={`w-2 h-2 rounded-full bg-current ${rank.color} glow-primary`} />
                </motion.div>
              )}
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">{rank.desc}</span>
              {nextRank && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0 ml-2">
                  <ChevronRight className="w-3 h-3" />
                  {xpToNext} XP → {nextRank.icon} {nextRank.nameShort}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Standalone rank badge for use in dashboard/nav
export function RankBadge({ xp, size = "md" }: { xp: number; size?: "sm" | "md" | "lg" }) {
  const { rank, rankIndex } = getBuilderRank(xp);
  const sizeClasses = {
    sm: "w-7 h-7 text-sm rounded-lg",
    md: "w-10 h-10 text-lg rounded-xl",
    lg: "w-14 h-14 text-2xl rounded-2xl",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      className={`${sizeClasses[size]} bg-gradient-to-br ${rank.bg} border ${rank.border} flex items-center justify-center cursor-default select-none ${rank.glow}`}
      title={`${rank.name} — ${rank.desc}`}
    >
      {rank.icon}
    </motion.div>
  );
}
