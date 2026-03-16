import { useState, useCallback } from "react";
import { DECKS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shuffle, Star, Sparkles, Hammer, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCelebration } from "@/components/CelebrationProvider";
import { useAICoach } from "@/hooks/useAICoach";
import { toast } from "sonner";
import type { Artifact, ArtifactType } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";
import { AtmosphericSceneWrapper } from "./immersive/AtmosphericSceneWrapper";

interface VocabProps {
  addXp: (n: number) => void;
  addQuizScore: (deckName: string, correct: number, total: number) => void;
  toggleHardCard: (deckIdx: number, cardIdx: number) => void;
  hardCards: Record<string, boolean>;
  addArtifact?: (artifact: Omit<Artifact, "id" | "date">) => void;
  artifacts?: Artifact[];
}

type Mode = "list" | "forge" | "flashcard" | "quiz";

const FORGE_NARRATION = [
  "Le metal brut attend d'etre faconne...",
  "L'enclume vibre sous ta determination...",
  "Chaque mot forge renforce ton arsenal...",
  "La chaleur du savoir illumine l'atelier...",
  "Ton marteau frappe avec precision...",
];

const FORGE_AI_PERSONA = `Tu es le Maitre Forgeron, un artisan linguistique legendaire. Tu parles avec la sagesse d'un forgeron qui connait chaque nuance du metal des mots. Tu utilises des metaphores de forge : "cette phrase est bien trempee", "ta construction a la solidite de l'acier", "forge encore pour obtenir un alliage parfait".`;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function Vocab({ addXp, addQuizScore, toggleHardCard, hardCards, addArtifact, artifacts = [] }: VocabProps) {
  const { celebrate } = useCelebration();
  const { response: aiResponse, isLoading: aiLoading, error: aiError, ask: aiAsk, reset: aiReset } = useAICoach();
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
  const [forgePhrase, setForgePhrase] = useState("");
  const [forgeSubmitted, setForgeSubmitted] = useState(false);
  const [forgeBrickAnim, setForgeBrickAnim] = useState(false);

  const forgedPhraseCount = artifacts.filter(a => a.type === "phrase_forged").length;

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

  const startForge = (i: number) => {
    const order = getCards(i);
    setDi(i); setMode("forge"); setCi(0);
    setCardOrder(order); setForgePhrase(""); setForgeSubmitted(false); aiReset();
  };

  const startGlobalQuiz = (size = 30) => {
    const all: { de: string; fr: string; deckIdx: number; cardIdx: number }[] = [];
    DECKS.forEach((dk, di) => dk.cards.forEach((c, ci) => all.push({ ...c, deckIdx: di, cardIdx: ci })));
    const shuffledAll = shuffleArray(all).slice(0, size);
    setGlobalCards(shuffledAll);
    setGlobalQuiz(true); setGlobalFlashcard(false); setMode("quiz"); setCi(0); setQS({ c: 0, t: 0 }); setQA(null);
    setDi(null); setRevisionSize(size);
    const answerField = reversed ? "de" : "fr";
    const o = [shuffledAll[0][answerField]];
    const pool = shuffledAll.map(x => x[answerField]).filter(f => f !== shuffledAll[0][answerField]);
    while (o.length < 4 && pool.length > 0) {
      const r = pool[Math.floor(Math.random() * pool.length)];
      if (!o.includes(r)) { o.push(r); pool.splice(pool.indexOf(r), 1); }
    }
    setQO(o.sort(() => Math.random() - 0.5));
  };

  const startGlobalFlashcard = (size = 40) => {
    const all: { de: string; fr: string; deckIdx: number; cardIdx: number }[] = [];
    DECKS.forEach((dk, di) => dk.cards.forEach((c, ci) => all.push({ ...c, deckIdx: di, cardIdx: ci })));
    const shuffledAll = shuffleArray(all).slice(0, size);
    setGlobalCards(shuffledAll);
    setGlobalFlashcard(true); setGlobalQuiz(false); setMode("flashcard"); setCi(0); setFlip(false);
    setDi(null); setRevisionSize(size);
  };

  const startHardCardsReview = () => {
    const all: { de: string; fr: string; deckIdx: number; cardIdx: number }[] = [];
    DECKS.forEach((dk, di) => dk.cards.forEach((c, ci) => {
      if (hardCards[`${di}-${ci}`]) all.push({ ...c, deckIdx: di, cardIdx: ci });
    }));
    if (all.length === 0) return;
    const shuffledAll = shuffleArray(all);
    setGlobalCards(shuffledAll);
    setGlobalFlashcard(true); setGlobalQuiz(false); setMode("flashcard"); setCi(0); setFlip(false);
    setDi(null); setRevisionSize(shuffledAll.length);
  };

  const handleForgeSubmit = () => {
    if (!forgePhrase.trim() || forgePhrase.trim().length < 5 || di === null) return;
    const card = DECKS[di].cards[cardOrder[ci]];
    const prompt = `${FORGE_AI_PERSONA}

Mot a forger : "${card.de}" (${card.fr})
Phrase forgee par l'apprenti : "${forgePhrase}"

Analyse sa creation de facon bienveillante et concise :
1. Ta construction est-elle grammaticalement correcte ?
2. Le mot est-il bien utilise dans un contexte medical ?
3. Propose une version enrichie de sa phrase (garde sa structure, ameliore-la)

Sois concis (max 80 mots). Commence par reconnaitre ce qu'il a bien forge. Ne dis jamais "correction" ou "incorrect". Dis "ta forge" et "version enrichie". Utilise des metaphores de forge.`;

    aiAsk(prompt, "phrase-lab");
    setForgeSubmitted(true);

    if (addArtifact) {
      addArtifact({
        type: "phrase_forged",
        sourceModule: "vocab",
        content: forgePhrase,
        xpEarned: XP_VALUES.PHRASE_FORGED,
        metadata: { word: card.de, translation: card.fr, deckIdx: di, cardIdx: cardOrder[ci] },
      });
    }

    celebrate("creation");
    toast("🔨 Phrase forgee ! +20 XP", { description: "Une nouvelle brique dans ton mur de maitrise" });

    setForgeBrickAnim(true);
    setTimeout(() => setForgeBrickAnim(false), 1500);
  };

  const nextForgeWord = () => {
    const total = DECKS[di!].cards.length;
    if (ci < total - 1) {
      setCi(ci + 1);
      setForgePhrase("");
      setForgeSubmitted(false);
      aiReset();
    } else {
      setMode("list");
    }
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
    if (ok) { addXp(XP_VALUES.QCM_CORRECT); celebrate("quiz"); }
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

  // FORGE MODE
  if (mode === "forge" && di !== null) {
    const card = DECKS[di].cards[cardOrder[ci]];
    const total = DECKS[di].cards.length;
    const narration = FORGE_NARRATION[ci % FORGE_NARRATION.length];

    return (
      <AtmosphericSceneWrapper atmosphere="forge" intensity="high">
        <div className="space-y-4">
          <button onClick={() => setMode("list")} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quitter la Forge
          </button>

          {/* Forge header with narrative */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-5 room-3d"
            style={{
              background: "linear-gradient(145deg, hsl(32 95% 55% / 0.12), hsl(var(--card)), hsl(32 95% 55% / 0.04))",
              border: "1px solid hsl(32 95% 55% / 0.2)",
              boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(32 95% 55% / 0.2)",
            }}
          >
            <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotateY: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="door-icon-3d w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center"
                  style={{ boxShadow: "var(--shadow-3d-md), 0 0 16px -4px hsl(32 95% 55% / 0.3)" }}
                >
                  <Hammer className="w-5 h-5 text-amber-400" />
                </motion.div>
                <div>
                  <span className="font-black text-sm tracking-tight">La Forge — {DECKS[di].icon} {DECKS[di].name}</span>
                  <p className="text-[10px] text-amber-400/60 font-medium">{ci + 1}/{total} minerais</p>
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-5 h-5 text-amber-500/70" />
              </motion.div>
            </div>
            {/* Narrative whisper */}
            <motion.p
              key={ci}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] italic text-amber-400/50 mt-1"
            >
              {narration}
            </motion.p>
          </motion.div>

          {/* Word to forge — anvil card */}
          <motion.div
            key={ci}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="room-3d room-accessible rounded-2xl p-6 text-center relative overflow-hidden"
            style={{ boxShadow: "var(--shadow-3d-lg)" }}
          >
            {/* Inner forge glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-amber-500/[0.06] blur-[30px] rounded-full" />
            </div>
            <p className="text-[9px] uppercase tracking-[4px] text-amber-400/70 mb-3 relative z-10">Forge une phrase avec</p>
            <motion.p
              className="text-3xl font-black tracking-tight relative z-10"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {card.de}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-2 relative z-10">{card.fr}</p>

            <AnimatePresence>
              {forgeBrickAnim && (
                <motion.div
                  initial={{ y: -30, opacity: 0, scale: 0.7, rotateZ: -10 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotateZ: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="absolute top-2 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] px-3 py-1.5 rounded-full font-bold z-20"
                  style={{ boxShadow: "0 0 20px -4px hsl(32 95% 55% / 0.5)" }}
                >
                  +1 brique forgee
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Forge textarea */}
          <div className="space-y-3">
            <div className="relative">
              <Textarea
                value={forgePhrase}
                onChange={e => setForgePhrase(e.target.value)}
                placeholder="Place le mot sur l'enclume... forge ta phrase medicale en allemand..."
                className="min-h-[90px] bg-secondary/50 border-amber-500/10 rounded-xl text-sm resize-none focus:border-amber-500/30 transition-colors"
                disabled={aiLoading}
              />
              {forgePhrase.length > 0 && !forgeSubmitted && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-2 right-2"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500/40" />
                </motion.div>
              )}
            </div>

            {!forgeSubmitted ? (
              <Button
                onClick={handleForgeSubmit}
                disabled={forgePhrase.trim().length < 5 || aiLoading}
                className="w-full rounded-xl gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white h-12 text-sm font-bold"
                style={{ boxShadow: "0 4px 20px -4px hsl(32 95% 55% / 0.4)" }}
              >
                <Hammer className="w-4 h-4" /> Frapper l'enclume +20 XP
              </Button>
            ) : (
              <Button onClick={nextForgeWord} className="w-full rounded-xl h-11">
                {ci < total - 1 ? "Prochain minerai →" : "Sortir de la Forge"}
              </Button>
            )}
          </div>

          {aiError && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">{aiError}</div>
          )}

          {/* AI feedback — Forge Master */}
          <AnimatePresence>
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="room-3d rounded-2xl p-5 relative overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, hsl(32 95% 55% / 0.08), hsl(var(--card)))",
                  border: "1px solid hsl(32 95% 55% / 0.15)",
                  boxShadow: "var(--shadow-3d-md), 0 0 30px -8px hsl(32 95% 55% / 0.15)",
                }}
              >
                <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
                <div className="flex items-center gap-2.5 mb-3 relative z-10">
                  <motion.div
                    animate={{ rotateY: [0, 10, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-lg"
                  >
                    🔨
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-[3px]">Maitre Forgeron</p>
                    <p className="text-[9px] text-amber-400/50">Verdict de l'artisan</p>
                  </div>
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 relative z-10">{aiResponse}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brick wall progress — 3D */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="room-3d rounded-2xl p-4"
            style={{
              background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
              border: "1px solid hsl(var(--border) / 0.4)",
              boxShadow: "var(--shadow-3d-sm)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[3px] text-amber-400/60 mb-3">Mur de Maitrise</p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: Math.min(forgedPhraseCount, 50) }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotateZ: -10 }}
                  animate={{ scale: 1, rotateZ: 0 }}
                  transition={{ delay: i * 0.02, type: "spring", stiffness: 200 }}
                  className="w-5 h-3 rounded-sm bg-gradient-to-b from-amber-500/70 to-amber-600/50 border border-amber-500/30"
                  style={{ boxShadow: "0 1px 3px -1px hsl(32 95% 55% / 0.3)" }}
                />
              ))}
              {forgedPhraseCount === 0 && (
                <p className="text-[10px] text-muted-foreground/50 italic">Le mur attend sa premiere brique...</p>
              )}
            </div>
            {forgedPhraseCount > 0 && (
              <p className="text-[10px] text-amber-400/70 mt-2 font-medium">{forgedPhraseCount} brique{forgedPhraseCount > 1 ? "s" : ""} forgee{forgedPhraseCount > 1 ? "s" : ""}</p>
            )}
          </motion.div>

          <Progress value={((ci + 1) / total) * 100} className="h-1.5 bg-secondary rounded-full" />
        </div>
      </AtmosphericSceneWrapper>
    );
  }

  // QUIZ MODE — Arena of Trials
  if (mode === "quiz") {
    const cards = globalQuiz ? globalCards : DECKS[di!]?.cards || [];
    const total = cards.length;
    const cardIdx = globalQuiz ? ci : cardOrder[ci];
    const card = cards[cardIdx];
    const isDone = qA === "done";
    const questionField = reversed ? "fr" : "de";
    const label = globalQuiz ? "Defi Global" : `${DECKS[di!].icon} ${DECKS[di!].name}`;

    return (
      <AtmosphericSceneWrapper atmosphere="forge" intensity="low">
        <div className="space-y-4">
          <button onClick={() => setMode("list")} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quitter l'Arene
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
              className="room-3d rounded-3xl p-10 text-center relative overflow-hidden"
              style={{
                background: qS.c === qS.t
                  ? "linear-gradient(145deg, hsl(142 71% 45% / 0.1), hsl(var(--card)))"
                  : "linear-gradient(145deg, hsl(32 95% 55% / 0.08), hsl(var(--card)))",
                border: `1px solid ${qS.c === qS.t ? "hsl(142 71% 45% / 0.2)" : "hsl(var(--border) / 0.4)"}`,
                boxShadow: "var(--shadow-3d-xl)",
              }}
            >
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 2, delay: 0.3 }}
              >
                {qS.c === qS.t ? "🏆" : "💪"}
              </motion.div>
              <h2 className="text-2xl font-black tracking-tight mb-2">Epreuve terminee !</h2>
              <div className={`text-5xl font-black ${qS.c === qS.t ? "text-success" : "text-accent"}`}>{qS.c}/{qS.t}</div>
              <p className="text-muted-foreground text-sm mt-3">+{qS.c * XP_VALUES.QCM_CORRECT} XP gagnes dans l'arene</p>
              <p className="text-[10px] text-amber-400/60 mt-1 italic">Le mode Forge rapporte 4x plus d'XP</p>
              <div className="flex gap-3 justify-center mt-6">
                {globalQuiz ? (
                  <Button onClick={() => startGlobalQuiz(revisionSize)} className="rounded-xl">Nouvelle epreuve</Button>
                ) : (
                  <Button onClick={() => startQuiz(di!)} className="rounded-xl">Recommencer</Button>
                )}
                <Button variant="secondary" onClick={() => setMode("list")} className="rounded-xl">Retour a la Forge</Button>
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
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="room-3d room-accessible rounded-2xl p-8 text-center mb-4 relative overflow-hidden"
                style={{ boxShadow: "var(--shadow-3d-md)" }}
              >
                <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <p className="text-[9px] uppercase tracking-[3px] text-muted-foreground mb-4">
                  {reversed ? "Traduire en Deutsch" : "Traduire en francais"}
                </p>
                <p className="text-2xl font-black tracking-tight">{card[questionField]}</p>
              </motion.div>
              <div className="grid grid-cols-2 gap-2.5">
                {qO.map((o, i) => {
                  let cls = "bg-secondary/80 border-border/50 text-foreground";
                  if (qA && typeof qA !== "string") {
                    if (o === qA.correct) cls = "bg-success/15 border-success/40 text-success";
                    else if (o === qA.sel && !qA.ok) cls = "bg-destructive/15 border-destructive/40 text-destructive";
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
      </AtmosphericSceneWrapper>
    );
  }

  // FLASHCARD MODE
  if (mode === "flashcard" && (di !== null || globalFlashcard)) {
    const isGlobal = globalFlashcard;
    const totalCards = isGlobal ? globalCards.length : DECKS[di!].cards.length;
    const card = isGlobal ? globalCards[ci] : DECKS[di!].cards[cardOrder.length ? cardOrder[ci] : ci];
    const realIdx = isGlobal ? ci : (cardOrder.length ? cardOrder[ci] : ci);
    const deckIdx = isGlobal ? globalCards[ci]?.deckIdx : di!;
    const cardIdx = isGlobal ? globalCards[ci]?.cardIdx : realIdx;
    const isHard = !!hardCards[`${deckIdx}-${cardIdx}`];
    const label = isGlobal ? "Revision aleatoire" : `${DECKS[di!].icon} ${DECKS[di!].name}`;
    const deckInfo = isGlobal && card ? DECKS[globalCards[ci].deckIdx] : null;

    return (
      <AtmosphericSceneWrapper atmosphere="forge" intensity="low">
        <div className="space-y-4">
          <button onClick={() => { setMode("list"); setGlobalFlashcard(false); }} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour a la Forge
          </button>
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm">{label}</span>
            <span className="text-muted-foreground text-xs font-medium">{ci + 1}/{totalCards}</span>
          </div>
          <p className="text-[10px] text-amber-400/50 italic">Mode contemplatif — la Forge forge mieux que l'observation</p>
          {isGlobal && deckInfo && (
            <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded-lg px-3 py-1.5 inline-block">
              {deckInfo.icon} {deckInfo.name}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={ci + (flip ? "-flip" : "")}
              initial={{ opacity: 0, rotateY: flip ? 90 : 0 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setFlip(!flip)}
              className={`room-3d rounded-2xl p-10 text-center cursor-pointer min-h-[200px] flex flex-col items-center justify-center select-none transition-colors ${
                flip ? "bg-gradient-to-br from-amber-500/8 to-amber-400/3 room-accessible" : ""
              }`}
              style={{ boxShadow: "var(--shadow-3d-md)" }}
            >
              <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-4">
                {flip ? (reversed ? "Deutsch" : "Francais") : (reversed ? "Francais" : "Deutsch")}
              </p>
              <p className="text-2xl font-black tracking-tight">
                {card ? (flip ? (reversed ? card.de : card.fr) : (reversed ? card.fr : card.de)) : ""}
              </p>
              {!flip && <p className="text-[11px] text-muted-foreground/50 mt-5">Tap pour reveler</p>}
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2.5">
            <Button variant="secondary" onClick={() => { setCi(ci - 1); setFlip(false); }} disabled={ci === 0} size="sm" className="rounded-xl">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <button
              onClick={() => toggleHardCard(deckIdx, cardIdx)}
              className={`p-2 rounded-xl border transition-all ${isHard ? "bg-primary/15 border-primary/30 text-primary" : "bg-secondary border-border/50 text-muted-foreground"}`}
            >
              <Star className={`w-4 h-4 ${isHard ? "fill-current" : ""}`} />
            </button>
            <Button
              className="flex-1 rounded-xl"
              onClick={() => {
                addXp(XP_VALUES.FLASHCARD_FLIP);
                if (ci < totalCards - 1) { setCi(ci + 1); setFlip(false); }
                else { setMode("list"); setGlobalFlashcard(false); }
              }}
            >
              {ci === totalCards - 1 ? "Termine" : "Suivant →"}
            </Button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setReversed(!reversed)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${reversed ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
            >
              {reversed ? "FR→DE" : "DE→FR"}
            </button>
            {!isGlobal && (
              <button onClick={() => {
                setShuffled(!shuffled);
                const dk = DECKS[di!];
                const newOrder = !shuffled ? shuffleArray(dk.cards.map((_, i) => i)) : dk.cards.map((_, i) => i);
                setCardOrder(newOrder); setCi(0); setFlip(false);
              }} className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${shuffled ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                <Shuffle className="w-3 h-3" /> Melanger
              </button>
            )}
          </div>
          <Progress value={((ci + 1) / totalCards) * 100} className="h-1 bg-secondary rounded-full" />
        </div>
      </AtmosphericSceneWrapper>
    );
  }

  // LIST MODE — Forge Hub
  const totalWords = DECKS.reduce((a, d) => a + d.cards.length, 0);
  const hardCount = Object.values(hardCards).filter(Boolean).length;

  return (
    <AtmosphericSceneWrapper atmosphere="forge" intensity="medium">
      <div className="space-y-4">
        {/* Forge header — immersive */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-6 room-3d"
          style={{
            background: "linear-gradient(145deg, hsl(32 95% 55% / 0.1), hsl(var(--card)), hsl(32 60% 40% / 0.05))",
            border: "1px solid hsl(32 95% 55% / 0.15)",
            boxShadow: "var(--shadow-3d-xl), 0 0 60px -16px hsl(32 95% 55% / 0.15)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/[0.04] blur-[50px] rounded-full -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-500/[0.03] blur-[40px] rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <motion.div
                animate={{ rotateY: [0, 10, -10, 0], y: [0, -3, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="door-icon-3d w-14 h-14 rounded-2xl bg-amber-500/12 border border-amber-500/15 flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-3d-md), 0 0 20px -6px hsl(32 95% 55% / 0.25)" }}
              >
                <Hammer className="w-7 h-7 text-amber-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">La Forge des Mots</h2>
                <p className="text-[10px] text-amber-400/50 font-medium">Atelier du Maitre Forgeron</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              {totalWords} minerais dans l'arsenal · {forgedPhraseCount} phrases forgees
            </p>
          </div>
        </motion.div>

        {/* Action bar */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setReversed(!reversed)}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-all ${reversed ? "bg-primary/15 text-primary border border-primary/20" : "bg-secondary text-muted-foreground"}`}
          >
            {reversed ? "🇫🇷→🇩🇪 Actif" : "🇩🇪→🇫🇷 Normal"}
          </button>
          <button onClick={() => startGlobalQuiz(30)} className="text-xs font-semibold px-4 py-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-all">
            ⚔️ Arene Globale (30)
          </button>
          <button onClick={() => startGlobalFlashcard(40)} className="text-xs font-semibold px-4 py-2 rounded-full bg-secondary/60 text-muted-foreground/70 hover:text-foreground transition-all">
            🔮 Contemplation (40)
          </button>
        </div>

        {hardCount > 0 && (
          <button onClick={startHardCardsReview} className="w-full rounded-xl bg-primary/8 border border-primary/15 p-3 text-left hover:bg-primary/12 transition-all">
            <p className="text-xs font-semibold text-primary">⭐ {hardCount} minerais rebelles — tap pour re-forger</p>
          </button>
        )}

        {/* Brick wall summary */}
        {forgedPhraseCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="room-3d rounded-2xl p-4"
            style={{
              background: "linear-gradient(145deg, hsl(32 95% 55% / 0.06), hsl(var(--card)))",
              border: "1px solid hsl(32 95% 55% / 0.12)",
              boxShadow: "var(--shadow-3d-sm)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400/80">Mur de Maitrise</span>
              <span className="text-[10px] text-amber-400/50">{forgedPhraseCount} briques</span>
            </div>
            <div className="flex flex-wrap gap-0.5">
              {Array.from({ length: Math.min(forgedPhraseCount, 60) }).map((_, i) => (
                <div key={i} className="w-4 h-2.5 rounded-[2px] bg-gradient-to-b from-amber-500/60 to-amber-600/40 border border-amber-500/25" />
              ))}
            </div>
          </motion.div>
        )}

        {/* Deck cards — forge anvils */}
        <div className="space-y-3">
          {DECKS.map((dk, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="room-3d room-accessible rounded-2xl p-4 relative overflow-hidden"
              style={{ boxShadow: "var(--shadow-3d-md)" }}
            >
              <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <motion.div
                  whileHover={{ rotateY: 15, scale: 1.05 }}
                  className="door-icon-3d w-10 h-10 rounded-xl bg-amber-500/8 border border-amber-500/10 flex items-center justify-center text-xl"
                  style={{ boxShadow: "var(--shadow-3d-sm)" }}
                >
                  {dk.icon}
                </motion.div>
                <div className="flex-1">
                  <div className="font-bold text-sm tracking-tight">{dk.name}</div>
                  <div className="text-[10px] text-muted-foreground/60">{dk.cards.length} minerais</div>
                </div>
              </div>
              <div className="flex gap-2 relative z-10">
                <Button size="sm" className="flex-1 rounded-xl text-xs bg-gradient-to-r from-amber-500/15 to-amber-600/10 text-amber-400 border border-amber-500/20 hover:from-amber-500/25 hover:to-amber-600/15" variant="outline" onClick={() => startForge(i)}>
                  🔨 Forger
                </Button>
                <Button variant="secondary" size="sm" className="rounded-xl text-xs" onClick={() => startFC(i)}>
                  🔮 Observer
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => startQuiz(i)}>
                  ⚔️ Arene
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AtmosphericSceneWrapper>
  );
}
