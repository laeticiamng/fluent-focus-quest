import { useState, useEffect } from "react";
import { TARGET } from "@/data/content";
import { motion } from "framer-motion";

interface CountdownProps {
  lastSimScore?: number | null;
  readinessPercent?: number;
}

export function Countdown({ lastSimScore, readinessPercent }: CountdownProps = {}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const diff = TARGET.getTime() - now.getTime();
  const dd = Math.max(0, Math.floor(diff / 864e5));
  const hh = Math.max(0, Math.floor((diff % 864e5) / 36e5));
  const mn = Math.max(0, Math.floor((diff % 36e5) / 6e4));
  const sc = Math.max(0, Math.floor((diff % 6e4) / 1e3));
  const totalDays = Math.ceil((TARGET.getTime() - new Date("2025-01-01").getTime()) / 864e5);
  const elapsed = totalDays - dd;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));
  const isUrgent = dd <= 3;

  const units = [
    { v: dd, l: "J", full: "jours" },
    { v: hh, l: "H", full: "heures" },
    { v: mn, l: "M", full: "min" },
    { v: sc, l: "S", full: "sec" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: isUrgent
          ? "linear-gradient(145deg, hsl(0 84% 60% / 0.06), hsl(var(--card)), hsl(0 84% 60% / 0.03))"
          : "linear-gradient(145deg, hsl(var(--card)), hsl(220 60% 8%))",
        border: isUrgent
          ? "1px solid hsl(0 84% 60% / 0.2)"
          : "1px solid hsl(var(--border) / 0.5)",
        boxShadow: "0 8px 32px -8px hsl(220 80% 5% / 0.6), inset 0 1px 0 hsl(0 0% 100% / 0.03)",
      }}
    >
      {/* Ambient glow */}
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-24 ${isUrgent ? "bg-rose-500/8" : "bg-primary/8"} blur-[40px] rounded-full pointer-events-none`} />

      <p className="text-center text-[9px] font-bold uppercase tracking-[3px] text-muted-foreground/70 mb-4 relative">
        {isUrgent ? "⚡ Countdown — Derniere ligne droite" : "🎯 Countdown"}
      </p>

      {/* Timer digits */}
      <div className="flex justify-center items-center gap-1.5 sm:gap-2 relative mb-4">
        {units.map((u, i) => (
          <div key={i} className="flex items-center gap-1.5 sm:gap-2">
            <motion.div
              className="text-center"
              animate={i === 3 ? { scale: [1, 1.03, 1] } : isUrgent && i === 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="w-[3.5rem] sm:w-16 h-14 sm:h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{
                  background: i === 0
                    ? isUrgent
                      ? "linear-gradient(180deg, hsl(0 84% 60% / 0.15), hsl(0 84% 60% / 0.05))"
                      : "linear-gradient(180deg, hsl(var(--primary) / 0.15), hsl(var(--primary) / 0.05))"
                    : "linear-gradient(180deg, hsl(0 0% 100% / 0.06), hsl(0 0% 100% / 0.02))",
                  border: i === 0
                    ? isUrgent
                      ? "1px solid hsl(0 84% 60% / 0.25)"
                      : "1px solid hsl(var(--primary) / 0.2)"
                    : "1px solid hsl(0 0% 100% / 0.06)",
                  boxShadow: i === 0
                    ? "0 4px 16px -4px hsl(var(--primary) / 0.15), inset 0 1px 0 hsl(var(--primary) / 0.1)"
                    : "inset 0 1px 0 hsl(0 0% 100% / 0.04)",
                }}
              >
                <div className="absolute left-0 right-0 top-1/2 h-px bg-black/20" />
                <span className={`font-mono text-xl sm:text-2xl font-black tracking-tight relative z-10 ${
                  i === 0 ? (isUrgent ? "text-rose-400" : "text-primary") : "text-foreground/90"
                }`}>
                  {String(u.v).padStart(2, "0")}
                </span>
              </div>
              <span className="text-[8px] font-semibold text-muted-foreground/50 uppercase tracking-widest mt-1 block">{u.full}</span>
            </motion.div>
            {i < 3 && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-muted-foreground/30 font-bold text-lg -mt-4"
              >
                :
              </motion.span>
            )}
          </div>
        ))}
      </div>

      {/* Readiness metrics */}
      {(lastSimScore !== undefined || readinessPercent !== undefined) && (
        <div className="flex justify-center gap-4 mb-3 relative">
          {readinessPercent !== undefined && readinessPercent > 0 && (
            <div className="text-center">
              <div className={`text-sm font-black ${readinessPercent >= 70 ? "text-emerald-400" : readinessPercent >= 40 ? "text-amber-400" : "text-rose-400"}`}>
                {readinessPercent}%
              </div>
              <div className="text-[7px] text-muted-foreground/50 uppercase tracking-wider">pret</div>
            </div>
          )}
          {lastSimScore !== null && lastSimScore !== undefined && (
            <div className="text-center">
              <div className={`text-sm font-black ${lastSimScore >= 70 ? "text-emerald-400" : lastSimScore >= 40 ? "text-amber-400" : "text-rose-400"}`}>
                {lastSimScore}/100
              </div>
              <div className="text-[7px] text-muted-foreground/50 uppercase tracking-wider">dernier sim</div>
            </div>
          )}
          {dd > 0 && (
            <div className="text-center">
              <div className="text-sm font-black text-primary">{dd}</div>
              <div className="text-[7px] text-muted-foreground/50 uppercase tracking-wider">jours</div>
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      <div className="relative mb-3">
        <div className="h-1 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${isUrgent ? "from-rose-500/60 to-rose-400" : "from-primary/60 to-primary"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-muted-foreground/40">Debut</span>
          <span className={`text-[8px] font-semibold ${isUrgent ? "text-rose-400/60" : "text-primary/60"}`}>{Math.round(progress)}%</span>
          <span className="text-[8px] text-muted-foreground/40">30 mars</span>
        </div>
      </div>

      <p className="text-center text-[10px] font-semibold text-primary/70 relative">
        Spitalzentrum Biel — Dr. Attias-Widmer
      </p>
    </motion.div>
  );
}
