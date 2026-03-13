import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DECKS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, Volume2 } from "lucide-react";

const BPM_OPTIONS = [60, 80, 100, 120];

export function BeatLearning({ addXp }: { addXp: (n: number) => void }) {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(80);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showFr, setShowFr] = useState(false);
  const [deck, setDeck] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const audioCtxRef = useRef<AudioContext | null>(null);

  const cards = DECKS[deck]?.cards || [];

  const playTick = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch { /* audio not available */ }
  }, []);

  useEffect(() => {
    if (playing && cards.length > 0) {
      const interval = (60 / bpm) * 1000;
      timerRef.current = setInterval(() => {
        playTick();
        setShowFr(false);
        setCurrentIdx(prev => {
          const next = (prev + 1) % cards.length;
          if (next === 0) {
            setScore(s => s + 1);
            addXp(5);
          }
          return next;
        });
      }, interval);
      return () => clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, bpm, cards.length, playTick, addXp]);

  const skip = () => {
    setCurrentIdx(prev => (prev + 1) % cards.length);
    setShowFr(false);
  };

  const current = cards[currentIdx];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🎵</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Beat Learning</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Apprends au rythme — prononce chaque mot sur le beat</p>
        </div>
      </div>

      {/* Deck selection */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {DECKS.map((d, i) => (
          <button
            key={i}
            onClick={() => { setDeck(i); setCurrentIdx(0); setPlaying(false); }}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
              deck === i ? "bg-warning/15 border-warning/30 text-warning" : "border-border/40 text-muted-foreground hover:border-border/60"
            }`}
          >
            {d.icon} {d.name}
          </button>
        ))}
      </div>

      {/* Current word display */}
      {current && (
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-warning/12 via-card to-accent/8 border border-warning/20 p-8 sm:p-12 text-center relative overflow-hidden"
        >
          {/* Beat pulse */}
          {playing && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 60 / bpm, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-warning/30"
            />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{current.de}</p>
              <button onClick={() => setShowFr(!showFr)} className="mt-3">
                {showFr ? (
                  <p className="text-sm text-muted-foreground">{current.fr}</p>
                ) : (
                  <p className="text-xs text-muted-foreground/50">tap pour voir la traduction</p>
                )}
              </button>
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 text-[10px] text-muted-foreground">
            {currentIdx + 1}/{cards.length} • Tour {score + 1}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={skip}
          className="rounded-xl gap-1.5"
        >
          <SkipForward className="w-4 h-4" /> Skip
        </Button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setPlaying(!playing)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            playing
              ? "bg-warning text-warning-foreground glow-accent"
              : "bg-warning/15 border-2 border-warning/30 text-warning"
          }`}
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </motion.button>

        <div className="flex items-center gap-1.5">
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-mono font-bold text-muted-foreground">{bpm}</span>
        </div>
      </div>

      {/* BPM selector */}
      <div className="flex justify-center gap-2">
        {BPM_OPTIONS.map(b => (
          <button
            key={b}
            onClick={() => setBpm(b)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              bpm === b ? "bg-warning/15 text-warning border border-warning/30" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {b} BPM
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="card-elevated rounded-2xl p-4 text-center">
        <p className="text-[10px] text-muted-foreground">
          🧠 La mémoire musicale crée des connexions 2x plus fortes que la lecture silencieuse
        </p>
        <p className="text-[9px] text-muted-foreground/60 mt-1">— Ludke et al., Memory & Cognition, 2014</p>
      </div>
    </div>
  );
}
