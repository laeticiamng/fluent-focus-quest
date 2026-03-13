import { useState, useCallback } from "react";
import { DECKS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shuffle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCelebration } from "@/components/CelebrationProvider";

interface VocabProps {
  addXp: (n: number) => void;
  addQuizScore: (deckName: string, correct: number, total: number) => void;
  toggleHardCard: (deckIdx: number, cardIdx: number) => void;
  hardCards: Record<string, boolean>;
}

type Mode = "list" | "flashcard" | "quiz";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Vocab({ addXp, addQuizScore, toggleHardCard, hardCards }: VocabProps) {
  const { celebrate } = useCelebration();
  const [di, setDi] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [ci, setCi] = useState(0);
  const [flip, setFlip] = useState(false);
  const [qO, setQO] = useState<string[]>([]);
  const [qA, setQA] = useState<{ sel: string; correct: string; ok: boolean } | "done" | null>(null);
  const [qS, setQS] = useState({ c: 0, t: 0 });
  const [reversed, setReversed] = useState(false);
  const [shuffled, setShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [globalQuiz, setGlobalQuiz] = useState(false);
  const [globalCards, setGlobalCards] = useState<{ de: string; fr: string; deckIdx: number; cardIdx: number }[]>([]);
  const [globalFlashcard, setGlobalFlashcard] = useState(false);
  const [revisionSize, setRevisionSize] = useState(30);

  const getCards = useCallback((dkIdx: number) => {
    const cards = DECKS[dkIdx].cards;
    if (!shuffled) return cards.map((_, i) => i);
    return shuffleArray(cards.map((_, i) => i));
  }, [shuffled]);

  const mkO = useCallback((cards: { de: string; fr: string }[], cardIdx: number, isReversed: boolean) => {
    const c = cards[cardIdx];
    const answerField = isReversed ? "de" : "fr";
    const o = [c[answerField]];
    const pool = cards.map(x => x[answerField]).filter(f => f !== c[answerField]);
    while (o.length < Math.min(4, cards.length)) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (!o.includes(r)) o.push(r);
    }
    return o.sort(() => Math.random() - 0.5);
  }, []);

  const startFC = (i: number) => {
    const order = getCards(i);
    setDi(i); setMode("flashcard"); setCi(0); setFlip(false);
    setCardOrder(order); setGlobalQuiz(false);
  };

  const startQuiz = (i: number) => {
    const order = getCards(i);
    setDi(i); setMode("quiz"); setCi(0); setQS({ c: 0, t: 0 }); setQA(null);
    setCardOrder(order); setGlobalQuiz(false);
    setQO(mkO(DECKS[i].cards, order[0], reversed));
  };

  const startGlobalQuiz = () => {
    const all: { de: string; fr: string; deckIdx: number; cardIdx: number }[] = [];
    DECKS.forEach((dk, di) => dk.cards.forEach((c, ci) => all.push({ ...c, deckIdx: di, cardIdx: ci })));
    const shuffledAll = shuffleArray(all).slice(0, 30);
    setGlobalCards(shuffledAll);
    setGlobalQuiz(true); setMode("quiz"); setCi(0); setQS({ c: 0, t: 0 }); setQA(null);
    setDi(null);
    const answerField = reversed ? "de" : "fr";
    const o = [shuffledAll[0][answerField]];
    const pool = shuffledAll.map(x => x[answerField]).filter(f => f !== shuffledAll[0][answerField]);
    while (o.length < 4 && pool.length > 0) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (!o.includes(r)) { o.push(r); pool.splice(pool.indexOf(r), 1); }
    }
    setQO(o.sort(() => Math.random() - 0.5));
  };

  const answer = (a: string) => {
    if (qA) return;
    const cards = globalQuiz ? globalCards : DECKS[di!].cards;
    const cardIdx = globalQuiz ? ci : cardOrder[ci];
    const card = cards[cardIdx];
    const correct = reversed ? card.de : card.fr;
    const ok = a === correct;
    setQA({ sel: a, correct, ok });
    setQS(s => ({ c: s.c + (ok ? 1 : 0), t: s.t + 1 }));
    if (ok) { addXp(10); celebrate("quiz"); }
    setTimeout(() => {
      const total = globalQuiz ? globalCards.length : DECKS[di!].cards.length;
      if (ci < total - 1) {
        const n = ci + 1;
        setCi(n);
        setQA(null);
        if (globalQuiz) {
          const nextCard = globalCards[n];
          const answerField = reversed ? "de" : "fr";
          const o = [nextCard[answerField]];
          const pool = globalCards.map(x => x[answerField]).filter(f => f !== nextCard[answerField]);
          while (o.length < 4 && pool.length > 0) {
            const r = pool[Math.floor(Math.random() * pool.length)];
            if (!o.includes(r)) { o.push(r); pool.splice(pool.indexOf(r), 1); }
          }
          setQO(o.sort(() => Math.random() - 0.5));
        } else {
          setQO(mkO(DECKS[di!].cards, cardOrder[n], reversed));
        }
      } else {
        if (!globalQuiz && di !== null) {
          addQuizScore(DECKS[di].name, qS.c + (ok ? 1 : 0), qS.t + 1);
        }
        setQA("done");
      }
    }, 900);
  };

  // QUIZ MODE
  if (mode === "quiz") {
    const cards = globalQuiz ? globalCards : DECKS[di!]?.cards || [];
    const total = cards.length;
    const cardIdx = globalQuiz ? ci : cardOrder[ci];
    const card = cards[cardIdx];
    const isDone = qA === "done";
    const questionField = reversed ? "fr" : "de";
    const label = globalQuiz ? "🌍 Quiz Global" : `${DECKS[di!].icon} ${DECKS[di!].name}`;

    return (
      <div className="space-y-4">
        <button onClick={() => setMode("list")} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setReversed(!reversed)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${reversed ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
          >
            {reversed ? "FR→DE" : "DE→FR"}
          </button>
        </div>
        {isDone ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10"
          >
            <div className="text-6xl mb-4">{qS.c === qS.t ? "🏆" : "💪"}</div>
            <h2 className="text-2xl font-black tracking-tight mb-2">Quiz terminé!</h2>
            <div className={`text-5xl font-black ${qS.c === qS.t ? "text-success" : "text-accent"}`}>{qS.c}/{qS.t}</div>
            <p className="text-muted-foreground text-sm mt-3">+{qS.c * 10} XP</p>
            <div className="flex gap-3 justify-center mt-6">
              {globalQuiz ? (
                <Button onClick={startGlobalQuiz} className="rounded-xl">Recommencer</Button>
              ) : (
                <Button onClick={() => startQuiz(di!)} className="rounded-xl">Recommencer</Button>
              )}
              <Button variant="secondary" onClick={() => setMode("list")} className="rounded-xl">Autres decks</Button>
            </div>
          </motion.div>
        ) : (
          <div>
            <div className="flex justify-between mb-3">
              <span className="font-bold text-sm">{label}</span>
              <span className="text-muted-foreground text-xs font-medium">{ci + 1}/{total}</span>
            </div>
            <motion.div
              key={ci}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="card-elevated rounded-2xl p-8 text-center mb-4"
            >
              <p className="text-[9px] uppercase tracking-[3px] text-muted-foreground mb-4">
                {reversed ? "Traduire en Deutsch" : "Traduire en français"}
              </p>
              <p className="text-2xl font-black tracking-tight">{card[questionField]}</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-2.5">
              {qO.map((o, i) => {
                let cls = "bg-secondary/80 border-border/50 text-foreground";
                if (qA && typeof qA !== "string") {
                  if (o === qA.correct) cls = "bg-success/15 border-success/40 text-success";
                  else if (o === qA.sel && !qA.ok) cls = "bg-primary/15 border-primary/40 text-primary";
                }
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => answer(o)}
                    className={`${cls} border rounded-xl p-3.5 text-sm font-medium transition-all`}
                    disabled={qA !== null}
                  >{o}</motion.button>
                );
              })}
            </div>
            <Progress value={(ci / total) * 100} className="h-1 mt-5 bg-secondary rounded-full" />
          </div>
        )}
      </div>
    );
  }

  // FLASHCARD MODE
  if (mode === "flashcard" && di !== null) {
    const dk = DECKS[di];
    const order = cardOrder.length ? cardOrder : dk.cards.map((_, i) => i);
    const realIdx = order[ci];
    const card = dk.cards[realIdx];
    const isHard = !!hardCards[`${di}-${realIdx}`];

    return (
      <div className="space-y-4">
        <button onClick={() => setMode("list")} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="flex justify-between items-center">
          <span className="font-bold text-sm">{dk.icon} {dk.name}</span>
          <span className="text-muted-foreground text-xs font-medium">{ci + 1}/{dk.cards.length}</span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={ci + (flip ? "-flip" : "")}
            initial={{ opacity: 0, rotateY: flip ? 90 : 0 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setFlip(!flip)}
            className={`card-elevated rounded-2xl p-10 text-center cursor-pointer min-h-[200px] flex flex-col items-center justify-center select-none transition-colors ${
              flip ? "bg-gradient-to-br from-primary/8 to-primary/3" : ""
            }`}
          >
            <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-4">
              {flip ? (reversed ? "Deutsch" : "Français") : (reversed ? "Français" : "Deutsch")}
            </p>
            <p className="text-2xl font-black tracking-tight">
              {flip ? (reversed ? card.de : card.fr) : (reversed ? card.fr : card.de)}
            </p>
            {!flip && <p className="text-[11px] text-muted-foreground mt-5">Tap pour révéler</p>}
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2.5">
          <Button variant="secondary" onClick={() => { setCi(ci - 1); setFlip(false); }} disabled={ci === 0} size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <button
            onClick={() => toggleHardCard(di, realIdx)}
            className={`p-2 rounded-xl border transition-all ${isHard ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary border-border/50 text-muted-foreground"}`}
          >
            <Star className={`w-4 h-4 ${isHard ? "fill-current" : ""}`} />
          </button>
          <Button
            className="flex-1 rounded-xl"
            onClick={() => {
              addXp(5);
              if (ci < dk.cards.length - 1) { setCi(ci + 1); setFlip(false); }
              else setMode("list");
            }}
          >
            {ci === dk.cards.length - 1 ? "Terminé ✓" : "Suivant →"}
          </Button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setReversed(!reversed)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${reversed ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
          >
            {reversed ? "FR→DE" : "DE→FR"}
          </button>
          <button onClick={() => {
            setShuffled(!shuffled);
            const newOrder = !shuffled ? shuffleArray(dk.cards.map((_, i) => i)) : dk.cards.map((_, i) => i);
            setCardOrder(newOrder); setCi(0); setFlip(false);
          }} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${shuffled ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
            <Shuffle className="w-3 h-3" /> Mélanger
          </button>
        </div>
      </div>
    );
  }

  // LIST MODE
  const totalWords = DECKS.reduce((a, d) => a + d.cards.length, 0);
  const hardCount = Object.values(hardCards).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight">🧠 Vocabulaire</h2>
      <p className="text-sm text-muted-foreground -mt-2">{totalWords} mots à maîtriser</p>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setReversed(!reversed)}
          className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${reversed ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary text-muted-foreground"}`}
        >
          {reversed ? "🇫🇷→🇩🇪 Actif" : "🇩🇪→🇫🇷 Normal"}
        </button>
        <button onClick={startGlobalQuiz} className="text-xs font-semibold px-4 py-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-all">
          🌍 Quiz Global
        </button>
      </div>

      {hardCount > 0 && (
        <div className="rounded-xl bg-primary/8 border border-primary/15 p-3">
          <p className="text-xs font-semibold text-primary">⭐ {hardCount} mots marqués difficiles</p>
        </div>
      )}

      <div className="space-y-3">
        {DECKS.map((dk, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card-elevated rounded-2xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{dk.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm tracking-tight">{dk.name}</div>
                <div className="text-[10px] text-muted-foreground">{dk.cards.length} mots</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 rounded-xl text-xs" onClick={() => startFC(i)}>
                📇 Flashcards
              </Button>
              <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs" onClick={() => startQuiz(i)}>
                ⚡ Quiz
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
