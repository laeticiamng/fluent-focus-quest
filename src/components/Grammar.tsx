import { useState } from "react";
import { GRAM } from "@/data/content";
import { Check, X, Languages, Sparkles, TreePine } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCelebration } from "@/components/CelebrationProvider";
import { useAICoach } from "@/hooks/useAICoach";
import { toast } from "sonner";
import type { Artifact } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";

const COLORS = [
  "border-info/20 text-info",
  "border-grammar/20 text-grammar",
  "border-success/20 text-success",
  "border-clinical/20 text-clinical",
  "border-primary/20 text-primary",
  "border-accent/20 text-accent",
];

interface GrammarProps {
  grammarDone: Record<string, boolean>;
  toggleGrammarExercise: (key: string) => void;
  addArtifact?: (artifact: Omit<Artifact, "id" | "date">) => void;
  artifacts?: Artifact[];
  addXp?: (n: number) => void;
}

export function Grammar({ grammarDone, toggleGrammarExercise, addArtifact, artifacts = [], addXp }: GrammarProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showTr, setShowTr] = useState<Record<string, boolean>>({});
  const [globalTr, setGlobalTr] = useState(false);
  const { celebrate } = useCelebration();
  const { response: aiResponse, isLoading: aiLoading, error: aiError, ask: aiAsk, reset: aiReset } = useAICoach();

  // Atelier mode state
  const [atelierOpen, setAtelierOpen] = useState<number | null>(null);
  const [atelierPhrase, setAtelierPhrase] = useState("");
  const [atelierSubmitted, setAtelierSubmitted] = useState(false);

  const grammarCreationCount = artifacts.filter(a =>
    a.type === "grammar_phrase" || a.type === "grammar_rule" || a.type === "grammar_transform"
  ).length;

  const handleAnswer = (gi: number, ei: number, selected: string, correct: string) => {
    const key = `g${gi}-e${ei}`;
    if (answers[key]) return;
    setAnswers(prev => ({ ...prev, [key]: selected }));
    if (selected === correct && !grammarDone[key]) {
      toggleGrammarExercise(key);
      celebrate("grammar");
    }
  };

  const handleAtelierSubmit = (gi: number) => {
    if (atelierPhrase.trim().length < 5) return;
    const gramItem = GRAM[gi];

    const prompt = `Tu es un coach d'atelier de grammaire allemande medicale. Tu accompagnes la construction d'une medecin.

Regle de grammaire : "${gramItem.title}"
Contexte : regles et exemples connus : ${gramItem.items.map(i => `${i.l}: ${i.e}`).join("; ")}
Phrase construite par l'utilisateur : "${atelierPhrase}"

Analyse sa construction :
1. La regle grammaticale est-elle correctement appliquee ?
2. Le contexte medical est-il pertinent ?
3. Propose une version enrichie

Sois concis (max 80 mots). Commence par reconnaitre ce qui est bien construit. Dis "ta construction" et "version enrichie", jamais "correction".`;

    aiAsk(prompt, "phrase-lab");
    setAtelierSubmitted(true);

    if (addArtifact) {
      addArtifact({
        type: "grammar_phrase",
        sourceModule: "grammar",
        content: atelierPhrase,
        xpEarned: XP_VALUES.GRAMMAR_PHRASE,
        metadata: { category: gramItem.title, gramIdx: gi },
      });
    }

    celebrate("creation");
    toast("⚙️ Construction grammaticale validee ! +20 XP", { description: "Ajoutee a ton cahier de regles" });
  };

  const resetAtelier = (gi: number) => {
    setAtelierPhrase("");
    setAtelierSubmitted(false);
    aiReset();
    setAtelierOpen(gi);
  };

  const toggleTr = (key: string) => setShowTr(prev => ({ ...prev, [key]: !prev[key] }));
  const isTrShown = (key: string) => globalTr || !!showTr[key];

  const totalExercises = GRAM.reduce((a, g) => a + (g.exercises?.length || 0), 0);
  const doneExercises = Object.keys(grammarDone).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <TreePine className="w-6 h-6 text-grammar" /> Atelier grammaire
        </h2>
        <button
          onClick={() => setGlobalTr(v => !v)}
          className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
            globalTr
              ? "bg-primary/12 border-primary/25 text-primary"
              : "bg-secondary border-border/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          🇫🇷 Tout traduire
        </button>
      </div>

      {/* Creation stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="card-elevated rounded-2xl p-3 text-center">
          <span className="text-lg font-black text-grammar">{grammarCreationCount}</span>
          <p className="text-[9px] font-medium text-muted-foreground mt-0.5">regles construites</p>
        </div>
        <div className="card-elevated rounded-2xl p-3 text-center">
          <span className="text-lg font-black text-success">{doneExercises}/{totalExercises}</span>
          <p className="text-[9px] font-medium text-muted-foreground mt-0.5">echauffements</p>
        </div>
      </div>

      {/* Grammar tree visualization */}
      {grammarCreationCount > 0 && (
        <div className="rounded-2xl bg-grammar/5 border border-grammar/15 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-grammar">🌳 Ton arbre de grammaire</span>
            <span className="text-[10px] text-grammar/70">{grammarCreationCount} branche{grammarCreationCount > 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-end gap-1 justify-center h-16">
            {/* Simple tree visualization */}
            <div className="w-1.5 bg-grammar/40 rounded-t-full" style={{ height: `${Math.min(100, grammarCreationCount * 8)}%` }} />
            {Array.from({ length: Math.min(grammarCreationCount, 12) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-3 h-3 rounded-full bg-grammar/30 border border-grammar/20"
                style={{ marginBottom: `${(i % 3) * 8}px` }}
              />
            ))}
          </div>
        </div>
      )}

      {GRAM.map((g, gi) => (
        <motion.div
          key={gi}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06 }}
          className={`card-elevated rounded-2xl p-5 border-l-[3px] ${COLORS[gi % COLORS.length].split(" ")[0]}`}
        >
          <h3 className={`text-sm font-bold mb-3 ${COLORS[gi % COLORS.length].split(" ")[1]}`}>{g.title}</h3>
          <div className="space-y-2">
            {g.items.map((c, ci) => (
              <div key={ci} className="rounded-xl bg-secondary/50 p-3">
                <div className={`text-[11px] font-bold ${COLORS[gi % COLORS.length].split(" ")[1]}`}>{c.l}</div>
                <div className="text-xs text-foreground/80 mt-0.5">{c.e}</div>
              </div>
            ))}
          </div>

          {/* ATELIER MODE — Construction */}
          <div className="mt-4 pt-4 border-t border-border/40">
            <button
              onClick={() => {
                if (atelierOpen === gi) { setAtelierOpen(null); }
                else { resetAtelier(gi); }
              }}
              className={`w-full rounded-xl p-3 text-left transition-all ${
                atelierOpen === gi
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-grammar/5 border border-grammar/15 hover:bg-grammar/10"
              }`}
            >
              <span className="text-xs font-bold text-amber-400">
                🔨 Construire une phrase avec cette regle
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                +20 XP — Forge une phrase medicale appliquant cette regle
              </p>
            </button>

            <AnimatePresence>
              {atelierOpen === gi && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 space-y-3"
                >
                  <Textarea
                    value={atelierPhrase}
                    onChange={e => setAtelierPhrase(e.target.value)}
                    placeholder={`Ecris une phrase medicale utilisant : ${g.title}...`}
                    className="min-h-[80px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
                    disabled={aiLoading}
                  />

                  {!atelierSubmitted ? (
                    <Button
                      onClick={() => handleAtelierSubmit(gi)}
                      disabled={atelierPhrase.trim().length < 5 || aiLoading}
                      className="w-full rounded-xl gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs"
                    >
                      ⚙️ Forger ma construction +20 XP
                    </Button>
                  ) : (
                    <Button
                      onClick={() => resetAtelier(gi)}
                      variant="secondary"
                      className="w-full rounded-xl text-xs"
                    >
                      Construire une autre phrase
                    </Button>
                  )}

                  {aiError && (
                    <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">{aiError}</div>
                  )}

                  {aiResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-grammar/5 border border-grammar/15 p-4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-grammar" />
                        <span className="text-[10px] font-bold text-grammar uppercase tracking-wider">Coach d'atelier</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground/85">{aiResponse}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* QCM exercises — now labeled as "warmup" */}
          {g.exercises && g.exercises.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Echauffement rapide</p>
              <div className="space-y-3">
                {g.exercises.map((ex, ei) => {
                  const key = `g${gi}-e${ei}`;
                  const userAnswer = answers[key];
                  const isCorrect = userAnswer === ex.a;
                  const trKey = `${gi}-${ei}`;
                  const trVisible = isTrShown(trKey);

                  return (
                    <div key={ei} className="rounded-xl bg-background/50 p-3.5">
                      <div className="flex items-start gap-2 mb-2.5">
                        <p className="text-xs font-semibold flex-1">{ex.q}</p>
                        {(ex as any).fr && (
                          <button
                            onClick={() => toggleTr(trKey)}
                            className={`shrink-0 flex items-center gap-0.5 text-[9px] font-bold rounded px-1.5 py-1 transition-all ${
                              trVisible
                                ? "bg-primary/12 text-primary"
                                : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Languages className="w-2.5 h-2.5" />🇫🇷
                          </button>
                        )}
                      </div>

                      <AnimatePresence>
                        {trVisible && (ex as any).fr && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden mb-2.5"
                          >
                            <div className="text-[11px] text-primary/80 bg-primary/8 border border-primary/15 rounded-lg px-3 py-2">
                              🇫🇷 {(ex as any).fr}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex gap-2 flex-wrap">
                        {ex.opts.map((opt, oi) => {
                          let cls = "bg-secondary border-border/40 text-foreground";
                          if (userAnswer) {
                            if (opt === ex.a) cls = "bg-success/15 border-success/30 text-success";
                            else if (opt === userAnswer && !isCorrect) cls = "bg-destructive/15 border-destructive/30 text-destructive";
                          }
                          return (
                            <motion.button
                              key={oi}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAnswer(gi, ei, opt, ex.a)}
                              disabled={!!userAnswer}
                              className={`${cls} border rounded-lg px-3.5 py-2 text-xs font-medium transition-all`}
                            >
                              {opt}
                            </motion.button>
                          );
                        })}
                      </div>
                      {userAnswer && (
                        <div className={`flex items-center gap-1.5 mt-2.5 text-[11px] font-medium ${isCorrect ? "text-success" : "text-destructive"}`}>
                          {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {isCorrect ? "Construite ✓ +5 XP" : `A ajuster : ${ex.a}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
