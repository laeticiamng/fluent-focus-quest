import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, CheckCircle2, XCircle, Zap, RotateCcw } from "lucide-react";

// ── Medical German phrase challenges (escape-game "gate" style) ──
interface PhraseChallenge {
  id: string;
  prompt: string;        // What to translate / complete
  hint: string;          // French hint
  answer: string;        // Expected German answer (normalized for comparison)
  keywords: string[];    // Partial-credit keywords
  xpReward: number;
  difficulty: 1 | 2 | 3;
}

const DAILY_CHALLENGES: PhraseChallenge[] = [
  {
    id: "gate-vorstellung-1",
    prompt: "Completez : \"Ich bin ___ und arbeite als ___ in der ___.\"",
    hint: "Presentez-vous : nom, poste, service",
    answer: "ich bin ärztin und arbeite als assistenzärztin in der angiologie",
    keywords: ["ärztin", "assistenzärztin", "angiologie", "arbeite", "ich bin"],
    xpReward: 15,
    difficulty: 1,
  },
  {
    id: "gate-anamnese-1",
    prompt: "Traduisez : \"Ou avez-vous mal exactement ?\"",
    hint: "Frage nach der Schmerzlokalisation",
    answer: "wo haben sie genau schmerzen",
    keywords: ["wo", "schmerzen", "genau", "haben"],
    xpReward: 15,
    difficulty: 1,
  },
  {
    id: "gate-diagnose-1",
    prompt: "Completez : \"Der Patient hat eine ___ im linken ___.\"",
    hint: "Le patient a une stenose dans la jambe gauche",
    answer: "der patient hat eine stenose im linken bein",
    keywords: ["stenose", "bein", "linken", "patient"],
    xpReward: 20,
    difficulty: 2,
  },
  {
    id: "gate-therapie-1",
    prompt: "Traduisez : \"Nous devons faire une echographie duplex.\"",
    hint: "Diagnostikmethode empfehlen",
    answer: "wir müssen eine duplexsonographie durchführen",
    keywords: ["duplexsonographie", "durchführen", "müssen", "wir"],
    xpReward: 20,
    difficulty: 2,
  },
  {
    id: "gate-notfall-1",
    prompt: "Traduisez : \"Le patient souffre d'une embolie pulmonaire aigue.\"",
    hint: "Akute Notfalldiagnose beschreiben",
    answer: "der patient leidet an einer akuten lungenembolie",
    keywords: ["lungenembolie", "akuten", "leidet", "patient"],
    xpReward: 25,
    difficulty: 3,
  },
  {
    id: "gate-übergabe-1",
    prompt: "Completez le SBAR : \"Situation: Der Patient, ___ Jahre alt, wurde mit ___ aufgenommen.\"",
    hint: "Patient de 65 ans admis pour douleur thoracique",
    answer: "der patient 65 jahre alt wurde mit brustschmerzen aufgenommen",
    keywords: ["patient", "jahre", "aufgenommen", "brustschmerzen"],
    xpReward: 25,
    difficulty: 3,
  },
];

function getDailyChallenge(solvedIds: string[]): PhraseChallenge {
  // Pick the first unsolved challenge, cycling through by day
  const unsolved = DAILY_CHALLENGES.filter(c => !solvedIds.includes(c.id));
  if (unsolved.length === 0) {
    // All solved: cycle based on day-of-year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);
    return DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];
  }
  return unsolved[0];
}

function evaluateAnswer(userInput: string, challenge: PhraseChallenge): {
  score: number; // 0-100
  matchedKeywords: string[];
  missedKeywords: string[];
  passed: boolean;
} {
  const normalized = userInput.trim().toLowerCase().replace(/[?.!,;:'"]/g, "").replace(/\s+/g, " ");
  const matchedKeywords = challenge.keywords.filter(kw => normalized.includes(kw.toLowerCase()));
  const missedKeywords = challenge.keywords.filter(kw => !normalized.includes(kw.toLowerCase()));

  // Exact match bonus
  const exactMatch = normalized === challenge.answer.toLowerCase().replace(/[?.!,;:'"]/g, "").replace(/\s+/g, " ");

  const keywordScore = challenge.keywords.length > 0
    ? (matchedKeywords.length / challenge.keywords.length) * 80
    : 0;
  const score = Math.round(exactMatch ? 100 : keywordScore + (normalized.length > 5 ? 10 : 0));
  const passed = score >= 50;

  return { score, matchedKeywords, missedKeywords, passed };
}

interface PhraseGateProps {
  solvedGateIds: string[];
  onSolve: (challengeId: string, xpReward: number) => void;
}

export function PhraseGate({ solvedGateIds, onSolve }: PhraseGateProps) {
  const challenge = useMemo(() => getDailyChallenge(solvedGateIds), [solvedGateIds]);
  const alreadySolved = solvedGateIds.includes(challenge.id);

  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState<{
    score: number;
    matchedKeywords: string[];
    missedKeywords: string[];
    passed: boolean;
  } | null>(null);
  const [submitted, setSubmitted] = useState(alreadySolved);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!userInput.trim()) return;
    const evaluation = evaluateAnswer(userInput, challenge);
    setResult(evaluation);
    setSubmitted(true);
    if (evaluation.passed && !alreadySolved) {
      onSolve(challenge.id, challenge.xpReward);
    }
  }, [userInput, challenge, alreadySolved, onSolve]);

  const handleRetry = useCallback(() => {
    setUserInput("");
    setResult(null);
    setSubmitted(false);
    setShowHint(false);
  }, []);

  const difficultyLabel = challenge.difficulty === 1 ? "Base" : challenge.difficulty === 2 ? "Intermediaire" : "Avance";
  const difficultyColor = challenge.difficulty === 1 ? "text-emerald-400" : challenge.difficulty === 2 ? "text-amber-400" : "text-rose-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, hsl(270 50% 20% / 0.12), hsl(var(--card)), hsl(38 92% 50% / 0.04))",
        border: result?.passed
          ? "2px solid hsl(142 71% 45% / 0.3)"
          : "1px solid hsl(270 50% 55% / 0.2)",
        boxShadow: result?.passed
          ? "0 0 20px -6px hsl(142 71% 45% / 0.15)"
          : "0 0 20px -8px hsl(270 50% 55% / 0.1)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <motion.div
          animate={result?.passed ? { rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] } : { scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            result?.passed
              ? "bg-emerald-500/15 border border-emerald-500/25"
              : "bg-violet-500/15 border border-violet-500/25"
          }`}
        >
          {result?.passed ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <KeyRound className="w-5 h-5 text-violet-400" />
          )}
        </motion.div>
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-[2px] text-violet-400/80 font-bold">
            {result?.passed ? "Porte deverrouillee" : "Defi Medical — Porte de Garde"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[8px] font-bold ${difficultyColor}`}>{difficultyLabel}</span>
            <span className="text-[8px] text-muted-foreground/40">·</span>
            <span className="text-[8px] text-amber-400/60 font-bold">+{challenge.xpReward} XP</span>
          </div>
        </div>
        {result && !result.passed && (
          <button
            onClick={handleRetry}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-muted-foreground transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reessayer
          </button>
        )}
      </div>

      {/* Challenge prompt */}
      <div className="px-4 pb-3">
        <p className="text-sm font-bold leading-relaxed text-foreground/90">{challenge.prompt}</p>

        <AnimatePresence>
          {showHint && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[10px] text-muted-foreground mt-1 italic"
            >
              Indice : {challenge.hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Input & Submit */}
      {!submitted ? (
        <div className="px-4 pb-4 space-y-2">
          <div className="relative">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="Ecris ta reponse en allemand..."
              className="w-full px-3 py-2.5 rounded-xl bg-secondary/30 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-colors"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Valider
            </button>
            {!showHint && (
              <button
                onClick={() => setShowHint(true)}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] text-muted-foreground/70 transition-colors"
              >
                Indice
              </button>
            )}
          </div>
        </div>
      ) : result && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 pb-4 space-y-2"
        >
          {/* Score feedback */}
          <div className={`rounded-xl p-3 ${
            result.passed
              ? "bg-emerald-500/8 border border-emerald-500/15"
              : "bg-rose-500/8 border border-rose-500/15"
          }`}>
            <div className="flex items-center gap-2 mb-1.5">
              {result.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400" />
              )}
              <span className={`text-xs font-black ${result.passed ? "text-emerald-400" : "text-rose-400"}`}>
                {result.score >= 90 ? "Parfait !" : result.passed ? "Porte ouverte !" : "Pas encore..."}
              </span>
              <span className="ml-auto text-[10px] font-bold text-muted-foreground">{result.score}/100</span>
            </div>
            {result.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {result.matchedKeywords.map(kw => (
                  <span key={kw} className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-[9px] text-emerald-400 font-bold">{kw}</span>
                ))}
              </div>
            )}
            {result.missedKeywords.length > 0 && !result.passed && (
              <div className="flex flex-wrap gap-1">
                {result.missedKeywords.map(kw => (
                  <span key={kw} className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[9px] text-rose-400/70 font-bold">{kw}</span>
                ))}
              </div>
            )}
          </div>

          {/* Reference answer */}
          <div className="rounded-xl p-3 bg-secondary/20 border border-border/20">
            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-bold mb-1">Reponse de reference</p>
            <p className="text-xs text-foreground/80 font-medium leading-relaxed">
              {challenge.answer.charAt(0).toUpperCase() + challenge.answer.slice(1)}
            </p>
          </div>

          {result.passed && !alreadySolved && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-1"
            >
              <span className="text-[10px] text-amber-400 font-bold">+{challenge.xpReward} XP gagnes</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
