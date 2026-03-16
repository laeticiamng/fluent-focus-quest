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
      {/* Rank up celebration */}
      <AnimatePresence>
        {showRankUp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl bg-gradient-to-r ${rank.bg} border ${rank.border} p-5 text-center mb-2 ${rank.glow}`}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1 }}
              className="text-4xl mb-2"
            >{rank.icon}</motion.div>
            <p className={`text-sm font-black ${rank.color}`}>Rang obtenu : {rank.name} !</p>
            <p className="text-[10px] text-muted-foreground mt-1">{rank.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`card-elevated rounded-2xl p-4 relative overflow-hidden`}
      >
        {/* Subtle glow for higher ranks */}
        {rankIndex >= 2 && (
          <div className={`absolute inset-0 bg-gradient-to-r ${rank.bg} opacity-30 pointer-events-none`} />
        )}

        <div className="relative z-10 flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${rank.bg} border ${rank.border} flex items-center justify-center text-2xl cursor-default select-none shrink-0 ${rank.glow}`}
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
