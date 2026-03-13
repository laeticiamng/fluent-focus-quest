import { useState, useEffect, useRef } from "react";
import { IVW } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";

interface InterviewProps {
  rat: Record<number, number>;
  setRating: (qi: number, r: number) => void;
}

const EMOJIS = [
  { v: 1, e: "😰" }, { v: 2, e: "😕" }, { v: 3, e: "🙂" }, { v: 4, e: "😊" }, { v: 5, e: "🔥" },
];

export function Interview({ rat, setRating }: InterviewProps) {
  const [ii, setIi] = useState(0);
  const [sa, setSa] = useState(false);
  const [simMode, setSimMode] = useState(false);
  const [simTimer, setSimTimer] = useState(120);
  const [simRunning, setSimRunning] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const ratedCount = Object.keys(rat).length;
  const avgRating = ratedCount > 0 ? (Object.values(rat).reduce((a, b) => a + b, 0) / ratedCount).toFixed(1) : "—";

  useEffect(() => {
    if (simRunning && simTimer > 0) {
      timerRef.current = setTimeout(() => setSimTimer(t => t - 1), 1000);
    } else if (simRunning && simTimer === 0) {
      setSimRunning(false);
      if (ii < IVW.length - 1) {
        setIi(ii + 1); setSa(false); setSimTimer(120);
        setTimeout(() => setSimRunning(true), 500);
      } else { setSimMode(false); }
    }
    return () => clearTimeout(timerRef.current);
  }, [simRunning, simTimer, ii]);

  const startSim = () => { setSimMode(true); setIi(0); setSa(false); setSimTimer(120); setSimRunning(true); };
  const stopSim = () => { setSimMode(false); setSimRunning(false); setSimTimer(120); };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight">💼 Entretien</h2>
      <p className="text-sm text-muted-foreground -mt-2">{IVW.length} questions à maîtriser</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { v: ratedCount, l: "évaluées", cls: "text-success" },
          { v: IVW.length - ratedCount, l: "restantes", cls: "text-info" },
          { v: avgRating, l: "moyenne", cls: "text-accent" },
        ].map((s, i) => (
          <div key={i} className="card-elevated rounded-2xl p-3 text-center">
            <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <Progress value={(ratedCount / IVW.length) * 100} className="h-1.5 bg-secondary rounded-full" />

      {/* Simulation button */}
      {!simMode ? (
        <button onClick={startSim} className="w-full rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/15 p-3.5 text-sm font-semibold text-accent text-center transition-all hover:from-accent/15">
          🎯 Simulation chronométrée (2min/question)
        </button>
      ) : (
        <div className="rounded-2xl bg-accent/8 border border-accent/15 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent">🎯 SIMULATION</span>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xl font-black ${simTimer < 30 ? "text-primary animate-pulse" : "text-accent"}`}>
                {Math.floor(simTimer / 60)}:{String(simTimer % 60).padStart(2, "0")}
              </span>
              <Button size="sm" variant="secondary" onClick={stopSim} className="rounded-xl">Stop</Button>
            </div>
          </div>
        </div>
      )}

      {/* Question navigator */}
      <div className="flex gap-1.5 flex-wrap">
        {IVW.map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => { setIi(i); setSa(false); if (simMode) { setSimTimer(120); setSimRunning(true); } }}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              ii === i ? "bg-primary/15 border border-primary/30 text-primary" :
              rat[i] ? "bg-success/10 border border-success/20 text-success" :
              "bg-secondary border border-border/40 text-muted-foreground"
            }`}
          >{i + 1}</motion.button>
        ))}
      </div>

      {/* Question card */}
      <motion.div
        key={ii}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="card-elevated rounded-2xl p-5"
      >
        <p className="text-[9px] uppercase tracking-[3px] text-primary/70 mb-2">Frage {ii + 1}/{IVW.length}</p>
        <p className="text-lg font-bold leading-snug tracking-tight mb-4">{IVW[ii].q}</p>
        <div className="rounded-xl bg-accent/8 border border-accent/15 px-4 py-2.5">
          <p className="text-[11px] text-accent font-medium">💡 {IVW[ii].h}</p>
        </div>
      </motion.div>

      {/* Voice recorder toggle */}
      <div className="flex gap-2.5">
        <Button
          onClick={() => setSa(!sa)}
          className="flex-1 rounded-xl h-11"
          variant={sa ? "secondary" : "default"}
        >
          {sa ? "Masquer" : "🔓 Révéler la réponse"}
        </Button>
        <Button
          onClick={() => setShowRecorder(!showRecorder)}
          variant={showRecorder ? "default" : "secondary"}
          className="rounded-xl h-11 px-4"
        >
          🎙️
        </Button>
      </div>

      {/* Voice recorder */}
      {showRecorder && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="card-elevated rounded-2xl p-4 overflow-hidden"
        >
          <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">🎙️ Entraînement oral</p>
          <VoiceRecorder label={`Q${ii + 1}`} context={`Frage ${ii + 1}: ${IVW[ii].q.slice(0, 40)}`} />
        </motion.div>
      )}

      {sa && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="card-elevated rounded-2xl p-5 border-l-[3px] border-success/40">
            <p className="text-[10px] text-success font-bold uppercase tracking-wider mb-2">Antwort</p>
            <p className="text-sm leading-relaxed text-foreground/85">{IVW[ii].r}</p>
          </div>
          <div className="card-elevated rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-3 text-center">Auto-évaluation</p>
            <div className="flex gap-2.5 justify-center">
              {EMOJIS.map(r => (
                <motion.button
                  key={r.v}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(ii, r.v)}
                  className={`rounded-xl p-3 border transition-all text-xl ${
                    rat[ii] === r.v ? "bg-success/15 border-success/30 glow-success" : "bg-secondary border-border/40"
                  }`}
                >{r.e}</motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
