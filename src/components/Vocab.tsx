import { useState, useCallback } from "react";
import { DECKS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VocabProps { addXp: (n: number) => void; }

type Mode = "list" | "flashcard" | "quiz";

export function Vocab({ addXp }: VocabProps) {
  const [di, setDi] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [ci, setCi] = useState(0);
  const [flip, setFlip] = useState(false);
  const [qO, setQO] = useState<string[]>([]);
  const [qA, setQA] = useState<{ sel: string; correct: string; ok: boolean } | "done" | null>(null);
  const [qS, setQS] = useState({ c: 0, t: 0 });

  const mkO = useCallback((dkIdx: number, cardIdx: number) => {
    const dk = DECKS[dkIdx];
    const c = dk.cards[cardIdx];
    const o = [c.fr];
    const pool = dk.cards.map(x => x.fr).filter(f => f !== c.fr);
    while (o.length < Math.min(4, dk.cards.length)) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (!o.includes(r)) o.push(r);
    }
    return o.sort(() => Math.random() - 0.5);
  }, []);

  const startFC = (i: number) => { setDi(i); setMode("flashcard"); setCi(0); setFlip(false); };
  const startQuiz = (i: number) => { setDi(i); setMode("quiz"); setCi(0); setQS({ c: 0, t: 0 }); setQA(null); setQO(mkO(i, 0)); };

  const answer = (a: string) => {
    if (di === null || qA) return;
    const correct = DECKS[di].cards[ci].fr;
    const ok = a === correct;
    setQA({ sel: a, correct, ok });
    setQS(s => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    if (ok) addXp(10);
    setTimeout(() => {
      if (ci < DECKS[di].cards.length - 1) {
        const n = ci + 1; setCi(n); setQA(null); setQO(mkO(di, n));
      } else setQA("done");
    }, 900);
  };

  if (mode === "quiz" && di !== null) {
    const dk = DECKS[di];
    const isDone = qA === "done";
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setMode("list")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        {isDone ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">{qS.c === qS.t ? "🏆" : "💪"}</div>
            <h2 className="text-2xl font-black mb-2">Quiz terminé!</h2>
            <div className={`text-4xl font-black ${qS.c === qS.t ? "text-success" : "text-accent"}`}>{qS.c}/{qS.t}</div>
            <p className="text-muted-foreground text-sm mt-2">+{qS.c * 10} XP</p>
            <div className="flex gap-2 justify-center mt-5">
              <Button onClick={() => startQuiz(di)} className="bg-primary">Recommencer</Button>
              <Button variant="secondary" onClick={() => setMode("list")}>Autres decks</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-3">
              <span className="font-bold text-sm">{dk.icon} {dk.name}</span>
              <span className="text-muted-foreground text-xs">{ci + 1}/{dk.cards.length}</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 text-center mb-4">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">Traduire</p>
              <p className="text-2xl font-black">{dk.cards[ci].de}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {qO.map((o, i) => {
                let cls = "bg-secondary border-border";
                if (qA && qA !== "done") {
                  if (o === qA.correct) cls = "bg-success/20 border-success";
                  else if (o === qA.sel && !qA.ok) cls = "bg-primary/20 border-primary";
                }
                return (
                  <button key={i} onClick={() => answer(o)}
                    className={`${cls} border rounded-lg p-3 text-sm font-medium transition-all`}
                    disabled={!!qA}
                  >{o}</button>
                );
              })}
            </div>
            <Progress value={(ci / dk.cards.length) * 100} className="h-1.5 mt-4 bg-muted" />
          </div>
        )}
      </div>
    );
  }

  if (mode === "flashcard" && di !== null) {
    const dk = DECKS[di];
    return (
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setMode("list")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <div className="flex justify-between mb-2">
          <span className="font-bold text-sm">{dk.icon} {dk.name}</span>
          <span className="text-muted-foreground text-xs">{ci + 1}/{dk.cards.length}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={ci + (flip ? "-flip" : "")}
            initial={{ opacity: 0, rotateY: flip ? 180 : 0 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setFlip(!flip)}
            className={`rounded-xl border p-10 text-center cursor-pointer min-h-[180px] flex flex-col items-center justify-center select-none transition-colors ${
              flip ? "bg-primary/5 border-primary/30" : "bg-card border-border"
            }`}
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              {flip ? "Français" : "Deutsch"}
            </p>
            <p className="text-2xl font-black">{flip ? dk.cards[ci].fr : dk.cards[ci].de}</p>
            {!flip && <p className="text-[11px] text-muted-foreground mt-4">Tap pour révéler</p>}
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setCi(ci - 1); setFlip(false); }} disabled={ci === 0} size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              addXp(5);
              if (ci < dk.cards.length - 1) { setCi(ci + 1); setFlip(false); }
              else setMode("list");
            }}
          >
            {ci === dk.cards.length - 1 ? "Terminé ✓" : "Suivant →"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">🧠 Vocabulaire — {DECKS.reduce((a, d) => a + d.cards.length, 0)} mots</h2>
      {DECKS.map((dk, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{dk.icon}</span>
            <div className="flex-1">
              <div className="font-bold text-sm">{dk.name}</div>
              <div className="text-[10px] text-muted-foreground">{dk.cards.length} mots</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => startFC(i)}>
              📇 Flashcards
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => startQuiz(i)}>
              ⚡ Quiz
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
