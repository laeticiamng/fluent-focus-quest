import { useState, useCallback } from "react";
import { DECKS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Shuffle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [di, setDi] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("list");
  const [ci, setCi] = useState(0);
  const [flip, setFlip] = useState(false);
  const [qO, setQO] = useState<string[]>([]);
  const [qA, setQA] = useState<{ sel: string; correct: string; ok: boolean } | "done" | null>(null);
  const [qS, setQS] = useState({ c: 0, t: 0 });
  const [reversed, setReversed] = useState(false); // FR→DE mode
  const [shuffled, setShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState<number[]>([]);
  const [globalQuiz, setGlobalQuiz] = useState(false);
  const [globalCards, setGlobalCards] = useState<{ de: string; fr: string; deckIdx: number; cardIdx: number }[]>([]);

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
    const shuffledAll = shuffleArray(all).slice(0, 30); // 30 cards from all decks
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
    if (ok) addXp(10);
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
      <div className="space-y-3">
        <Button variant="ghost" size="sm" onClick={() => setMode("list")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        <div className="flex gap-2 mb-2">
          <Button size="sm" variant={reversed ? "default" : "secondary"} onClick={() => setReversed(!reversed)}>
            {reversed ? "FR→DE" : "DE→FR"}
          </Button>
        </div>
        {isDone ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-3">{qS.c === qS.t ? "🏆" : "💪"}</div>
            <h2 className="text-2xl font-black mb-2">Quiz terminé!</h2>
            <div className={`text-4xl font-black ${qS.c === qS.t ? "text-success" : "text-accent"}`}>{qS.c}/{qS.t}</div>
            <p className="text-muted-foreground text-sm mt-2">+{qS.c * 10} XP</p>
            <div className="flex gap-2 justify-center mt-5">
              {globalQuiz ? (
                <Button onClick={startGlobalQuiz} className="bg-primary">Recommencer</Button>
              ) : (
                <Button onClick={() => startQuiz(di!)} className="bg-primary">Recommencer</Button>
              )}
              <Button variant="secondary" onClick={() => setMode("list")}>Autres decks</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-3">
              <span className="font-bold text-sm">{label}</span>
              <span className="text-muted-foreground text-xs">{ci + 1}/{total}</span>
            </div>
            <div className="rounded-xl border border-border bg-card p-8 text-center mb-4">
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
                {reversed ? "Traduire en Deutsch" : "Traduire en français"}
              </p>
              <p className="text-2xl font-black">{card[questionField]}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {qO.map((o, i) => {
                let cls = "bg-secondary border-border";
                if (qA && typeof qA !== "string") {
                  if (o === qA.correct) cls = "bg-success/20 border-success";
                  else if (o === qA.sel && !qA.ok) cls = "bg-primary/20 border-primary";
                }
                return (
                  <button key={i} onClick={() => answer(o)}
                    className={`${cls} border rounded-lg p-3 text-sm font-medium transition-all`}
                    disabled={qA !== null}
                  >{o}</button>
                );
              })}
            </div>
            <Progress value={(ci / total) * 100} className="h-1.5 mt-4 bg-muted" />
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
              {flip ? (reversed ? "Deutsch" : "Français") : (reversed ? "Français" : "Deutsch")}
            </p>
            <p className="text-2xl font-black">
              {flip ? (reversed ? card.de : card.fr) : (reversed ? card.fr : card.de)}
            </p>
            {!flip && <p className="text-[11px] text-muted-foreground mt-4">Tap pour révéler</p>}
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setCi(ci - 1); setFlip(false); }} disabled={ci === 0} size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant={isHard ? "destructive" : "outline"}
            size="sm"
            onClick={() => toggleHardCard(di, realIdx)}
            title={isHard ? "Retirer des difficiles" : "Marquer difficile"}
          >
            <Star className={`w-4 h-4 ${isHard ? "fill-current" : ""}`} />
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
        <div className="flex gap-2">
          <Button size="sm" variant={reversed ? "default" : "secondary"} onClick={() => setReversed(!reversed)}>
            {reversed ? "FR→DE" : "DE→FR"}
          </Button>
          <Button size="sm" variant={shuffled ? "default" : "secondary"} onClick={() => {
            setShuffled(!shuffled);
            const newOrder = !shuffled ? shuffleArray(dk.cards.map((_, i) => i)) : dk.cards.map((_, i) => i);
            setCardOrder(newOrder); setCi(0); setFlip(false);
          }}>
            <Shuffle className="w-3.5 h-3.5 mr-1" /> Mélanger
          </Button>
        </div>
      </div>
    );
  }

  // LIST MODE
  const totalWords = DECKS.reduce((a, d) => a + d.cards.length, 0);
  const hardCount = Object.values(hardCards).filter(Boolean).length;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">🧠 Vocabulaire — {totalWords} mots</h2>

      {/* Mode toggles */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={reversed ? "default" : "secondary"} onClick={() => setReversed(!reversed)}>
          {reversed ? "🇫🇷→🇩🇪 Actif" : "🇩🇪→🇫🇷 Normal"}
        </Button>
        <Button size="sm" variant="outline" onClick={startGlobalQuiz}>
          🌍 Quiz Global (30 mots)
        </Button>
      </div>

      {hardCount > 0 && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs font-bold text-primary">⭐ {hardCount} mots marqués difficiles</p>
        </div>
      )}

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
