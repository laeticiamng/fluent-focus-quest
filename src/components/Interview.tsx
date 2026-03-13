import { useState, useEffect, useRef } from "react";
import { IVW } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const ratedCount = Object.keys(rat).length;
  const avgRating = ratedCount > 0 ? (Object.values(rat).reduce((a, b) => a + b, 0) / ratedCount).toFixed(1) : "—";

  // Simulation timer
  useEffect(() => {
    if (simRunning && simTimer > 0) {
      timerRef.current = setTimeout(() => setSimTimer(t => t - 1), 1000);
    } else if (simRunning && simTimer === 0) {
      // Auto-advance to next question
      setSimRunning(false);
      if (ii < IVW.length - 1) {
        setIi(ii + 1);
        setSa(false);
        setSimTimer(120);
        setTimeout(() => setSimRunning(true), 500);
      } else {
        setSimMode(false);
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [simRunning, simTimer, ii]);

  const startSim = () => {
    setSimMode(true);
    setIi(0);
    setSa(false);
    setSimTimer(120);
    setSimRunning(true);
  };

  const stopSim = () => {
    setSimMode(false);
    setSimRunning(false);
    setSimTimer(120);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">💼 Entretien — {IVW.length} questions</h2>

      {/* Stats bar */}
      <div className="rounded-lg bg-card border border-border p-3 flex justify-between">
        <div className="text-center">
          <div className="text-lg font-black text-success">{ratedCount}</div>
          <div className="text-[9px] text-muted-foreground">évaluées</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-info">{IVW.length - ratedCount}</div>
          <div className="text-[9px] text-muted-foreground">restantes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-black text-accent">{avgRating}</div>
          <div className="text-[9px] text-muted-foreground">moyenne</div>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(ratedCount / IVW.length) * 100} className="h-2 bg-muted" />

      {/* Simulation mode button */}
      {!simMode ? (
        <Button onClick={startSim} variant="outline" className="w-full border-accent text-accent">
          🎯 Simulation chronométrée (2min/question)
        </Button>
      ) : (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent">🎯 SIMULATION EN COURS</span>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xl font-black ${simTimer < 30 ? "text-primary animate-pulse" : "text-accent"}`}>
                {Math.floor(simTimer / 60)}:{String(simTimer % 60).padStart(2, "0")}
              </span>
              <Button size="sm" variant="secondary" onClick={stopSim}>Arrêter</Button>
            </div>
          </div>
        </div>
      )}

      {/* Question navigator */}
      <div className="flex gap-1.5 flex-wrap">
        {IVW.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIi(i); setSa(false); if (simMode) { setSimTimer(120); setSimRunning(true); } }}
            className={`w-8 h-8 rounded-lg border text-xs font-bold transition-all ${
              ii === i ? "border-primary bg-primary/20 text-primary" :
              rat[i] ? "border-success/30 bg-success/10 text-success" :
              "border-border bg-card text-muted-foreground"
            }`}
          >{i + 1}</button>
        ))}
      </div>

      <div className="rounded-xl border border-primary/30 bg-card p-5">
        <p className="text-[9px] uppercase tracking-widest text-primary mb-2">Frage {ii + 1}/{IVW.length}</p>
        <p className="text-lg font-bold leading-snug mb-4">{IVW[ii].q}</p>
        <div className="rounded-lg bg-accent/10 border-l-[3px] border-accent px-3 py-2">
          <p className="text-[11px] text-accent font-semibold">💡 {IVW[ii].h}</p>
        </div>
      </div>

      <Button
        onClick={() => setSa(!sa)}
        className="w-full"
        variant={sa ? "secondary" : "default"}
      >
        {sa ? "Masquer" : "🔓 Révéler la réponse"}
      </Button>

      {sa && (
        <>
          <div className="rounded-xl border border-success/30 bg-card p-4">
            <p className="text-[10px] text-success font-bold mb-2">Antwort:</p>
            <p className="text-sm leading-relaxed">{IVW[ii].r}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-3">Auto-évaluation:</p>
            <div className="flex gap-2 justify-center">
              {EMOJIS.map(r => (
                <button
                  key={r.v}
                  onClick={() => setRating(ii, r.v)}
                  className={`rounded-lg p-2.5 border transition-all text-xl ${
                    rat[ii] === r.v ? "bg-success/20 border-success" : "bg-secondary border-border"
                  }`}
                >{r.e}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
