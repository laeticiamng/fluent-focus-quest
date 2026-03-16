import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";

interface HintLevel {
  level: number;
  label: string;
  xpPenalty: number;
}

const HINT_LEVELS: HintLevel[] = [
  { level: 1, label: "Orientation", xpPenalty: 5 },
  { level: 2, label: "Direction", xpPenalty: 15 },
  { level: 3, label: "Solution partielle", xpPenalty: 30 },
];

interface SmartHintProps {
  /** Current context — what zone/room/puzzle the user is in */
  context: {
    zone: string;
    room?: string;
    puzzle?: string;
  };
  /** Number of failed attempts */
  failedAttempts: number;
  /** Hints specific to the current challenge */
  hints: string[];
  /** Callback when a hint is consumed */
  onHintUsed: (level: number, xpPenalty: number) => void;
  /** Max base XP for this challenge */
  maxXp: number;
  /** Already used hint levels */
  usedLevels?: number[];
}

export function SmartHintSystem({
  context,
  failedAttempts,
  hints,
  onHintUsed,
  maxXp,
  usedLevels = [],
}: SmartHintProps) {
  const [expanded, setExpanded] = useState(false);
  const [revealedLevel, setRevealedLevel] = useState(0);

  // Smart recommendation: suggest hints based on failed attempts
  const shouldSuggest = failedAttempts >= 3 && usedLevels.length === 0;
  const shouldUrge = failedAttempts >= 5 && usedLevels.length < 2;

  const totalPenalty = useMemo(() => {
    return HINT_LEVELS
      .filter(h => usedLevels.includes(h.level) || h.level <= revealedLevel)
      .reduce((sum, h) => sum + h.xpPenalty, 0);
  }, [usedLevels, revealedLevel]);

  const remainingXp = Math.max(5, maxXp - totalPenalty);

  const handleRevealHint = (level: number) => {
    if (level <= revealedLevel || usedLevels.includes(level)) return;
    setRevealedLevel(level);
    const hint = HINT_LEVELS.find(h => h.level === level);
    if (hint) {
      onHintUsed(level, hint.xpPenalty);
    }
  };

  return (
    <div className="space-y-2">
      {/* Smart suggestion banner */}
      <AnimatePresence>
        {shouldSuggest && !expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 cursor-pointer hover:bg-amber-500/15 transition-colors"
            onClick={() => setExpanded(true)}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
            </motion.div>
            <p className="text-[11px] text-amber-400 flex-1">
              {shouldUrge
                ? "Tu sembles bloque. Un indice pourrait t'aider sans trop d'impact sur ton score."
                : "Besoin d'un coup de pouce ? Des indices sont disponibles."}
            </p>
            <ChevronDown className="w-3 h-3 text-amber-400/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint toggle button */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all w-full ${
          expanded
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
            : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-transparent"
        }`}
      >
        <Lightbulb className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">
          Systeme d'indices ({usedLevels.length + (revealedLevel > Math.max(...usedLevels, 0) ? 1 : 0)}/3 utilises)
        </span>
        {expanded ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {/* Hint panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            {/* XP impact preview */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-black/20 border border-white/5">
              <span className="text-[10px] text-muted-foreground">XP restant si resolu maintenant</span>
              <span className={`text-xs font-bold ${
                totalPenalty > 0 ? "text-amber-400" : "text-emerald-400"
              }`}>
                {remainingXp} / {maxXp} XP
              </span>
            </div>

            {/* Hint levels */}
            {HINT_LEVELS.map((hintLevel, idx) => {
              const isRevealed = hintLevel.level <= revealedLevel || usedLevels.includes(hintLevel.level);
              const isNext = !isRevealed && (idx === 0 || HINT_LEVELS[idx - 1].level <= revealedLevel || usedLevels.includes(HINT_LEVELS[idx - 1].level));
              const hintText = hints[idx] || "Indice non disponible pour ce niveau.";

              return (
                <motion.div
                  key={hintLevel.level}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-xl border p-3 transition-all ${
                    isRevealed
                      ? "bg-amber-500/10 border-amber-500/20"
                      : isNext
                      ? "bg-white/5 border-white/10 hover:border-amber-500/20 cursor-pointer"
                      : "bg-white/[0.02] border-white/5 opacity-40"
                  }`}
                  onClick={() => isNext && handleRevealHint(hintLevel.level)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${
                        isRevealed ? "text-amber-400" : "text-muted-foreground"
                      }`}>
                        Niveau {hintLevel.level} — {hintLevel.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400/50" />
                      <span className="text-[9px] text-rose-400/70">-{hintLevel.xpPenalty} XP</span>
                    </div>
                  </div>

                  {isRevealed ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] text-white/70 leading-relaxed"
                    >
                      {hintText}
                    </motion.p>
                  ) : isNext ? (
                    <p className="text-[10px] text-muted-foreground/50">
                      Clique pour reveler cet indice (-{hintLevel.xpPenalty} XP)
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground/30">
                      Revele l'indice precedent d'abord
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
