import { useState } from "react";
import { GRAM } from "@/data/content";
import { Check, X, Languages, Sparkles, TreePine, Leaf, GitBranch } from "lucide-react";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import { TranslationToggle } from "@/components/translation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCelebration } from "@/components/CelebrationProvider";
import { useAICoach } from "@/hooks/useAICoach";
import { toast } from "sonner";
import type { Artifact } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";
import { AtmosphericSceneWrapper } from "./immersive/AtmosphericSceneWrapper";
import { useExperience } from "@/experience";

const BRANCH_COLORS = [
  { border: "border-emerald-500/20", text: "text-emerald-400", bg: "bg-emerald-500", glow: "hsl(152 70% 50%)" },
  { border: "border-teal-500/20", text: "text-teal-400", bg: "bg-teal-500", glow: "hsl(170 70% 50%)" },
  { border: "border-green-500/20", text: "text-green-400", bg: "bg-green-500", glow: "hsl(142 70% 50%)" },
  { border: "border-lime-500/20", text: "text-lime-400", bg: "bg-lime-500", glow: "hsl(84 70% 50%)" },
  { border: "border-cyan-500/20", text: "text-cyan-400", bg: "bg-cyan-500", glow: "hsl(186 70% 50%)" },
  { border: "border-emerald-400/20", text: "text-emerald-300", bg: "bg-emerald-400", glow: "hsl(152 60% 60%)" },
];

const TREE_NARRATION = [
  "Les racines puisent dans le savoir ancestral...",
  "Une nouvelle branche germe sous ta plume...",
  "L'arbre grandit avec chaque regle maitrisee...",
  "Le vent murmure les regles entre les feuilles...",
  "La seve de la grammaire nourrit ta parole...",
];

const GARDIEN_PERSONA = `Tu es le Gardien de l'Arbre, un sage botaniste des langues. Tu parles avec la poesie d'un arboriculteur qui voit la grammaire comme un ecosysteme vivant. Tu utilises des metaphores d'arbre : "cette branche est solide", "ta phrase a pris racine", "greffe encore pour enrichir le feuillage", "cette construction pousse droit".`;

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
  const { showFr: globalTr, toggleFr: toggleGlobalTr } = useTranslationPreference();
  const { celebrate } = useCelebration();
  const { fireEvent } = useExperience();
  const { response: aiResponse, isLoading: aiLoading, error: aiError, ask: aiAsk, reset: aiReset } = useAICoach();

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
      fireEvent("TASK_COMPLETED", { type: "grammar_exercise", key });
    }
  };

  const handleAtelierSubmit = (gi: number) => {
    if (atelierPhrase.trim().length < 5) return;
    const gramItem = GRAM[gi];

    const prompt = `${GARDIEN_PERSONA}

Regle de grammaire : "${gramItem.title}"
Contexte : regles et exemples connus : ${gramItem.items.map(i => `${i.l}: ${i.e}`).join("; ")}
Phrase construite par l'apprenti : "${atelierPhrase}"

Analyse sa construction :
1. La regle grammaticale est-elle correctement appliquee ?
2. Le contexte medical est-il pertinent ?
3. Propose une version enrichie

Sois concis (max 80 mots). Commence par reconnaitre ce qui est bien construit. Utilise des metaphores d'arbre et de croissance.`;

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
    fireEvent("ARTIFACT_FORGED", { type: "grammar_phrase", category: gramItem.title });
    toast("🌿 Branche grammaticale enracinee ! +20 XP", { description: "L'Arbre grandit..." });
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
  const treeHeight = Math.min(100, grammarCreationCount * 6 + doneExercises * 2);

  return (
    <AtmosphericSceneWrapper atmosphere="grammar" intensity="medium">
      <div className="space-y-4">
        {/* Tree header — immersive */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-6 room-3d"
          style={{
            background: "linear-gradient(145deg, hsl(152 70% 50% / 0.08), hsl(var(--card)), hsl(152 50% 35% / 0.04))",
            border: "1px solid hsl(152 70% 50% / 0.12)",
            boxShadow: "var(--shadow-3d-xl), 0 0 60px -16px hsl(152 70% 50% / 0.12)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/[0.03] blur-[50px] rounded-full -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-teal-500/[0.03] blur-[40px] rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <motion.div
                animate={{ rotateZ: [-2, 2, -2], y: [0, -2, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="door-icon-3d w-14 h-14 rounded-2xl bg-emerald-500/12 border border-emerald-500/15 flex items-center justify-center"
                style={{ boxShadow: "var(--shadow-3d-md), 0 0 20px -6px hsl(152 70% 50% / 0.2)" }}
              >
                <TreePine className="w-7 h-7 text-emerald-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">L'Arbre des Regles</h2>
                <p className="text-[10px] text-emerald-400/50 font-medium">Domaine du Gardien</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TranslationToggle active={globalTr} onToggle={toggleGlobalTr} label={globalTr ? "FR ON" : "Traduire"} />
            </div>
          </div>
        </motion.div>

        {/* Stats — as forest metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="room-3d rounded-2xl p-3.5 text-center"
            style={{
              background: "linear-gradient(145deg, hsl(152 70% 50% / 0.06), hsl(var(--card)))",
              border: "1px solid hsl(152 70% 50% / 0.1)",
              boxShadow: "var(--shadow-3d-sm)",
            }}
          >
            <span className="text-lg font-black text-emerald-400">{grammarCreationCount}</span>
            <p className="text-[9px] font-medium text-emerald-400/50 mt-0.5">branches greffees</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="room-3d rounded-2xl p-3.5 text-center"
            style={{
              background: "linear-gradient(145deg, hsl(142 71% 45% / 0.06), hsl(var(--card)))",
              border: "1px solid hsl(142 71% 45% / 0.1)",
              boxShadow: "var(--shadow-3d-sm)",
            }}
          >
            <span className="text-lg font-black text-green-400">{doneExercises}/{totalExercises}</span>
            <p className="text-[9px] font-medium text-green-400/50 mt-0.5">bourgeons eclos</p>
          </motion.div>
        </div>

        {/* Living tree visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="room-3d rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(180deg, hsl(152 70% 50% / 0.04), hsl(var(--card)), hsl(30 30% 20% / 0.08))",
            border: "1px solid hsl(152 70% 50% / 0.1)",
            boxShadow: "var(--shadow-3d-md)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400/80 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Ton Arbre Vivant
            </span>
            <span className="text-[10px] text-emerald-400/40">{treeHeight}% de croissance</span>
          </div>
          <div className="flex items-end gap-1 justify-center h-20 relative">
            {/* Trunk */}
            <motion.div
              animate={{ height: `${Math.max(20, treeHeight)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-2 bg-gradient-to-t from-amber-800/60 to-emerald-600/40 rounded-t-full relative z-10"
              style={{ minHeight: "20%" }}
            />
            {/* Branches — one per grammar creation */}
            {Array.from({ length: Math.min(grammarCreationCount, 14) }).map((_, i) => {
              const side = i % 2 === 0 ? 1 : -1;
              const color = BRANCH_COLORS[i % BRANCH_COLORS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0, x: side * 5 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                  className={`w-4 h-4 rounded-full ${color.bg}/25 border ${color.border}`}
                  style={{
                    marginBottom: `${(i % 4) * 10 + 5}px`,
                    marginLeft: side > 0 ? '2px' : '0',
                    marginRight: side < 0 ? '2px' : '0',
                    boxShadow: `0 0 8px -2px ${color.glow}40`,
                  }}
                />
              );
            })}
            {/* Leaf particles for done exercises */}
            {Array.from({ length: Math.min(doneExercises, 8) }).map((_, i) => (
              <motion.div
                key={`leaf-${i}`}
                initial={{ opacity: 0, y: -5 }}
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  y: [-2, 2, -2],
                  x: [0, (i % 2 === 0 ? 3 : -3), 0],
                }}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
                className="w-2 h-2 rounded-full bg-green-400/20"
                style={{ marginBottom: `${i * 5 + 15}px` }}
              />
            ))}
          </div>
          {grammarCreationCount === 0 && doneExercises === 0 && (
            <p className="text-[10px] text-emerald-400/30 text-center mt-2 italic">La graine attend d'etre plantee...</p>
          )}
          {/* Narrative whisper */}
          {grammarCreationCount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[9px] italic text-emerald-400/30 text-center mt-3"
            >
              {TREE_NARRATION[grammarCreationCount % TREE_NARRATION.length]}
            </motion.p>
          )}
        </motion.div>

        {/* Grammar branches — rule cards */}
        {GRAM.map((g, gi) => {
          const color = BRANCH_COLORS[gi % BRANCH_COLORS.length];
          return (
            <motion.div
              key={gi}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
              className="room-3d rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${color.glow}08, hsl(var(--card)))`,
                border: `1px solid ${color.glow}18`,
                borderLeftWidth: "3px",
                boxShadow: "var(--shadow-3d-sm)",
              }}
            >
              <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />

              <div className="flex items-center gap-2 mb-3 relative z-10">
                <GitBranch className={`w-4 h-4 ${color.text}`} />
                <h3 className={`text-sm font-bold ${color.text}`}>{g.title}</h3>
              </div>

              {/* Rule leaves */}
              <div className="space-y-2 relative z-10">
                {g.items.map((c, ci) => (
                  <motion.div
                    key={ci}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ci * 0.03 }}
                    className="rounded-xl bg-secondary/40 p-3 border border-border/20"
                  >
                    <div className={`text-[11px] font-bold ${color.text}`}>{c.l}</div>
                    <div className="text-xs text-foreground/80 mt-0.5">{c.e}</div>
                  </motion.div>
                ))}
              </div>

              {/* ATELIER MODE — Greffe */}
              <div className="mt-4 pt-4 border-t border-border/20 relative z-10">
                <button
                  onClick={() => {
                    if (atelierOpen === gi) { setAtelierOpen(null); }
                    else { resetAtelier(gi); }
                  }}
                  className={`w-full rounded-xl p-3.5 text-left transition-all ${
                    atelierOpen === gi
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/8"
                  }`}
                >
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <Leaf className="w-3.5 h-3.5" /> Greffer une phrase sur cette branche
                  </span>
                  <p className="text-[10px] text-emerald-400/50 mt-0.5">
                    +20 XP — Fais pousser une phrase medicale
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
                        placeholder={`Plante une phrase medicale utilisant : ${g.title}...`}
                        className="min-h-[80px] bg-secondary/40 border-emerald-500/10 rounded-xl text-sm resize-none focus:border-emerald-500/25"
                        disabled={aiLoading}
                      />

                      {!atelierSubmitted ? (
                        <Button
                          onClick={() => handleAtelierSubmit(gi)}
                          disabled={atelierPhrase.trim().length < 5 || aiLoading}
                          className="w-full rounded-xl gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs h-11"
                          style={{ boxShadow: "0 4px 16px -4px hsl(152 70% 50% / 0.3)" }}
                        >
                          <Leaf className="w-3.5 h-3.5" /> Enraciner ma construction +20 XP
                        </Button>
                      ) : (
                        <Button
                          onClick={() => resetAtelier(gi)}
                          variant="secondary"
                          className="w-full rounded-xl text-xs"
                        >
                          Greffer une autre phrase
                        </Button>
                      )}

                      {aiError && (
                        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">{aiError}</div>
                      )}

                      {/* AI feedback — Gardien de l'Arbre */}
                      {aiResponse && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="room-3d rounded-xl p-4 relative overflow-hidden"
                          style={{
                            background: "linear-gradient(145deg, hsl(152 70% 50% / 0.06), hsl(var(--card)))",
                            border: "1px solid hsl(152 70% 50% / 0.12)",
                            boxShadow: "var(--shadow-3d-sm), 0 0 20px -6px hsl(152 70% 50% / 0.1)",
                          }}
                        >
                          <div className="flex items-center gap-2.5 mb-2.5 relative z-10">
                            <motion.div
                              animate={{ rotateZ: [-3, 3, -3] }}
                              transition={{ duration: 4, repeat: Infinity }}
                              className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm"
                            >
                              🌳
                            </motion.div>
                            <div>
                              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">Gardien de l'Arbre</p>
                              <p className="text-[9px] text-emerald-400/40">Sagesse du botaniste</p>
                            </div>
                          </div>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap text-foreground/85 relative z-10">{aiResponse}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* QCM exercises — bourgeons */}
              {g.exercises && g.exercises.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/20 relative z-10">
                  <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground/60 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Bourgeons d'echauffement
                  </p>
                  <div className="space-y-3">
                    {g.exercises.map((ex, ei) => {
                      const key = `g${gi}-e${ei}`;
                      const userAnswer = answers[key];
                      const isCorrect = userAnswer === ex.a;
                      const trKey = `${gi}-${ei}`;
                      const trVisible = isTrShown(trKey);

                      return (
                        <div key={ei} className="rounded-xl bg-background/40 p-3.5 border border-border/15">
                          <div className="flex items-start gap-2 mb-2.5">
                            <p className="text-xs font-semibold flex-1">{ex.q}</p>
                            {(ex as Record<string, unknown>).fr && (
                              <button
                                onClick={() => toggleTr(trKey)}
                                className={`shrink-0 flex items-center gap-0.5 text-[9px] font-bold rounded px-1.5 py-1 transition-all ${
                                  trVisible
                                    ? "bg-primary/12 text-primary"
                                    : "bg-secondary/70 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <Languages className="w-2.5 h-2.5" />FR
                              </button>
                            )}
                          </div>

                          <AnimatePresence>
                            {trVisible && (ex as Record<string, unknown>).fr && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden mb-2.5"
                              >
                                <div className="text-[11px] text-primary/80 bg-primary/8 border border-primary/15 rounded-lg px-3 py-2">
                                  {String((ex as Record<string, unknown>).fr)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex gap-2 flex-wrap">
                            {ex.opts.map((opt, oi) => {
                              let cls = "bg-secondary/60 border-border/40 text-foreground";
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
                            <div className={`flex items-center gap-1.5 mt-2.5 text-[11px] font-medium ${isCorrect ? "text-emerald-400" : "text-destructive"}`}>
                              {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              {isCorrect ? "Bourgeon eclos +5 XP" : `A replanter : ${ex.a}`}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </AtmosphericSceneWrapper>
  );
}
