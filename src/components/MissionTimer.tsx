import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Zap, Pause, Play, RotateCcw } from "lucide-react";

const TIMER_STORAGE_KEY = "fluent-focus-mission-timer";

interface TimerPersisted {
  missionId: string;
  remaining: number;
  paused: boolean;
  finished: boolean;
  savedAt: number; // timestamp
}

function loadTimerState(missionId: string, totalSeconds: number): { remaining: number; paused: boolean; finished: boolean } | null {
  try {
    const raw = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return null;
    const data: TimerPersisted = JSON.parse(raw);
    if (data.missionId !== missionId) return null;
    // If finished, restore as-is
    if (data.finished) return { remaining: 0, paused: false, finished: true };
    // If paused, restore remaining as-is
    if (data.paused) return { remaining: Math.max(0, data.remaining), paused: true, finished: false };
    // If was running, subtract elapsed time since save
    const elapsed = Math.floor((Date.now() - data.savedAt) / 1000);
    const remaining = Math.max(0, data.remaining - elapsed);
    return { remaining, paused: false, finished: remaining <= 0 };
  } catch {
    return null;
  }
}

function saveTimerState(missionId: string, remaining: number, paused: boolean, finished: boolean) {
  try {
    const data: TimerPersisted = { missionId, remaining, paused, finished, savedAt: Date.now() };
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded */ }
}

interface MissionTimerProps {
  missionId: string;
  durationMinutes: number;
  onTimeUp?: () => void;
  onBonusXp?: (bonus: number) => void;
  isActive?: boolean;
  compact?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function calculateBonus(remainingSeconds: number, totalSeconds: number): number {
  const ratio = remainingSeconds / totalSeconds;
  if (ratio > 0.75) return 50;
  if (ratio > 0.5) return 30;
  if (ratio > 0.25) return 15;
  if (ratio > 0) return 5;
  return 0;
}

export function MissionTimer({
  missionId,
  durationMinutes,
  onTimeUp,
  onBonusXp,
  isActive = true,
  compact = false,
}: MissionTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [remaining, setRemaining] = useState(() => {
    const saved = loadTimerState(missionId, totalSeconds);
    return saved ? saved.remaining : totalSeconds;
  });
  const [paused, setPaused] = useState(() => {
    const saved = loadTimerState(missionId, totalSeconds);
    return saved ? saved.paused : false;
  });
  const [finished, setFinished] = useState(() => {
    const saved = loadTimerState(missionId, totalSeconds);
    return saved ? saved.finished : false;
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Reset when mission changes
  useEffect(() => {
    const saved = loadTimerState(missionId, durationMinutes * 60);
    if (saved) {
      setRemaining(saved.remaining);
      setPaused(saved.paused);
      setFinished(saved.finished);
    } else {
      setRemaining(durationMinutes * 60);
      setFinished(false);
      setPaused(false);
    }
  }, [missionId, durationMinutes]);

  // Persist state on changes
  useEffect(() => {
    saveTimerState(missionId, remaining, paused, finished);
  }, [missionId, remaining, paused, finished]);

  useEffect(() => {
    if (!isActive || paused || finished) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setFinished(true);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive, paused, finished, onTimeUp]);

  const handleComplete = useCallback(() => {
    setFinished(true);
    clearInterval(intervalRef.current);
    const bonus = calculateBonus(remaining, totalSeconds);
    if (bonus > 0) {
      onBonusXp?.(bonus);
    }
  }, [remaining, totalSeconds, onBonusXp]);

  const handleReset = () => {
    setRemaining(totalSeconds);
    setFinished(false);
    setPaused(false);
    saveTimerState(missionId, totalSeconds, false, false);
  };

  const percentage = (remaining / totalSeconds) * 100;
  const isUrgent = remaining < totalSeconds * 0.25 && remaining > 0;
  const bonus = calculateBonus(remaining, totalSeconds);

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
        finished
          ? "bg-muted/20 text-muted-foreground/50"
          : isUrgent
          ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      }`}>
        <Timer className="w-3 h-3" />
        <span>{formatTime(remaining)}</span>
        {!finished && bonus > 0 && (
          <span className="text-[8px] text-emerald-400">+{bonus}</span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 room-3d"
      style={{
        background: isUrgent
          ? "linear-gradient(145deg, hsl(0 72% 51% / 0.08), hsl(var(--card)))"
          : "linear-gradient(145deg, hsl(32 95% 55% / 0.06), hsl(var(--card)))",
        border: isUrgent
          ? "1px solid hsl(0 72% 51% / 0.2)"
          : "1px solid hsl(32 95% 55% / 0.15)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isUrgent && !finished ? { scale: [1, 1.2, 1] } : undefined}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Timer className={`w-4 h-4 ${isUrgent ? "text-rose-400" : "text-amber-400"}`} />
          </motion.div>
          <div>
            <p className="text-[10px] uppercase tracking-[2px] text-muted-foreground">Timer Mission</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!finished && (
            <button
              onClick={() => setPaused(p => !p)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              {paused ? (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          )}
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Timer display */}
      <div className="text-center mb-3">
        <motion.span
          key={remaining}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-black tracking-tight ${
            finished
              ? "text-muted-foreground/50"
              : isUrgent
              ? "text-rose-400"
              : "text-foreground"
          }`}
        >
          {formatTime(remaining)}
        </motion.span>
        {paused && (
          <p className="text-[10px] text-amber-400 mt-1">En pause</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-secondary/30 rounded-full overflow-hidden mb-2">
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full rounded-full transition-colors ${
            isUrgent
              ? "bg-gradient-to-r from-rose-500/70 to-rose-400/40"
              : "bg-gradient-to-r from-amber-500/60 to-emerald-500/40"
          }`}
        />
      </div>

      {/* Bonus indicator */}
      <AnimatePresence>
        {!finished && bonus > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-1.5 mt-2"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">
              Bonus vitesse : +{bonus} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {finished && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-2"
        >
          <span className="text-[10px] text-muted-foreground">
            Temps ecoule — pas de bonus vitesse
          </span>
        </motion.div>
      )}

      {/* Complete button */}
      {!finished && (
        <button
          onClick={handleComplete}
          className="w-full mt-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all"
        >
          Mission terminee — Collecter le bonus
        </button>
      )}
    </div>
  );
}
