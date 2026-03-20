import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { useCelebration } from "@/components/CelebrationProvider";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import { RevealTranslation, TranslationToggle } from "@/components/translation";
import {
  Timer, ChevronRight, ChevronDown, Sparkles, Zap, Target,
  RotateCcw, ArrowRight, Trophy, AlertTriangle, BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import type { Artifact } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";
import { AtmosphericSceneWrapper } from "./immersive/AtmosphericSceneWrapper";
import { InterviewStageDirector } from "@/experience";
import {
  INTERVIEW_ZONES,
  PRESSURE_INTERRUPTIONS,
  DIMENSION_LABELS,
  buildEvaluationPrompt,
  evaluateLocally,
  type InterviewZoneId,
  type InterviewQuestion,
  type EvaluationResult,
  type DimensionScore,
} from "@/data/interviewZones";

type Tab = "vocab" | "gram" | "atelier" | "tools";

interface InterviewSimulatorProps {
  addXp?: (n: number) => void;
  onNavigate?: (tab: Tab | string) => void;
  addArtifact?: (artifact: Omit<Artifact, "id" | "date">) => void;
  artifacts?: Artifact[];
}

type SimState = "zone_select" | "question" | "evaluating" | "results";

const ZONE_COLORS: Record<InterviewZoneId, string> = {
  vorstellung: "emerald",
  motivation: "amber",
  erfahrung: "blue",
  fallanalyse: "violet",
  argumentation: "rose",
  finale: "amber",
};

const ZONE_GRADIENTS: Record<InterviewZoneId, string> = {
  vorstellung: "from-emerald-500/10 to-emerald-500/3",
  motivation: "from-amber-500/10 to-amber-500/3",
  erfahrung: "from-blue-500/10 to-blue-500/3",
  fallanalyse: "from-violet-500/10 to-violet-500/3",
  argumentation: "from-rose-500/10 to-rose-500/3",
  finale: "from-amber-400/15 to-amber-400/5",
};

// Timer durations per difficulty
const TIMER_DURATIONS: Record<number, number> = { 1: 120, 2: 90, 3: 60 };

export function InterviewSimulator({ addXp, onNavigate, addArtifact, artifacts = [] }: InterviewSimulatorProps) {
  const { response, isLoading, error: aiError, ask, reset } = useAICoach();
  const { celebrate } = useCelebration();
  const { showFr, toggleFr } = useTranslationPreference();

  // State
  const [simState, setSimState] = useState<SimState>("zone_select");
  const [activeZone, setActiveZone] = useState<InterviewZoneId | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [timer, setTimer] = useState(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [pressureMode, setPressureMode] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState("");
  const [showReference, setShowReference] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isFullSim, setIsFullSim] = useState(false);
  const [fullSimQuestions, setFullSimQuestions] = useState<InterviewQuestion[]>([]);
  const [fullSimScores, setFullSimScores] = useState<EvaluationResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const followUpTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Current zone and question
  const currentZone = activeZone ? INTERVIEW_ZONES.find(z => z.id === activeZone) : null;
  const currentQuestions = currentZone?.questions || [];
  const currentQuestion = isFullSim ? fullSimQuestions[questionIndex] : currentQuestions[questionIndex];

  // Stats
  const zoneCompletions = useMemo(() => {
    const result: Record<InterviewZoneId, number> = {
      vorstellung: 0, motivation: 0, erfahrung: 0,
      fallanalyse: 0, argumentation: 0, finale: 0,
    };
    artifacts.filter(a => a.type === "interview_answer" && a.metadata?.zone).forEach(a => {
      const zone = a.metadata?.zone as InterviewZoneId;
      if (zone in result) result[zone]++;
    });
    return result;
  }, [artifacts]);

  const totalAnswered = useMemo(() =>
    new Set(artifacts.filter(a => a.type === "interview_answer" && a.metadata?.simQuestionId).map(a => a.metadata?.simQuestionId)).size,
    [artifacts]
  );

  const lastSimScore = useMemo(() => {
    const simArtifacts = artifacts.filter(a => a.type === "interview_answer" && a.metadata?.globalScore);
    if (simArtifacts.length === 0) return null;
    const last = simArtifacts.sort((a, b) => b.date.localeCompare(a.date))[0];
    return last.metadata?.globalScore as number;
  }, [artifacts]);

  // Suggest the next zone to practice: least practiced that still has uncovered questions
  const suggestedZone = useMemo(() => {
    const answeredPerZone: Record<string, Set<string>> = {};
    artifacts.filter(a => a.type === "interview_answer" && a.metadata?.zone && a.metadata?.simQuestionId).forEach(a => {
      const z = a.metadata!.zone as string;
      if (!answeredPerZone[z]) answeredPerZone[z] = new Set();
      answeredPerZone[z].add(a.metadata!.simQuestionId as string);
    });
    // Find zone with most unanswered questions
    let best: InterviewZoneId | null = null;
    let bestUnanswered = -1;
    for (const zone of INTERVIEW_ZONES) {
      const answered = answeredPerZone[zone.id]?.size || 0;
      const unanswered = zone.questions.length - answered;
      if (unanswered > bestUnanswered) {
        bestUnanswered = unanswered;
        best = zone.id;
      }
    }
    return best;
  }, [artifacts]);

  // Cleanup all timers on unmount to prevent race conditions
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(fallbackTimerRef.current);
      clearTimeout(followUpTimerRef.current);
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (timerRunning && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000);
    } else if (timerRunning && timer === 0) {
      setTimerRunning(false);
      if (pressureMode) {
        triggerFollowUp();
      }
    }
    return () => clearTimeout(timerRef.current);
  }, [timerRunning, timer]);

  // Parse AI evaluation response with validation
  useEffect(() => {
    if (!response || simState !== "evaluating") return;
    clearTimeout(fallbackTimerRef.current); // AI responded — cancel fallback

    // If response is a local fallback marker, immediately use evaluateLocally
    if (response.includes("[LOCAL_EVAL_FALLBACK]")) {
      if (currentQuestion) {
        setEvaluation(evaluateLocally(userAnswer, currentQuestion));
        setSimState("results");
      }
      return;
    }

    try {
      // Extract first complete JSON object (non-greedy)
      const jsonMatch = response.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const s = parsed.scores;
        const clamp = (n: unknown) => Math.max(0, Math.min(20, Math.round(Number(n) || 0)));

        // Validate all 5 dimensions exist and are numeric
        if (s && typeof s === "object"
          && "language" in s && "structure" in s && "medicalReasoning" in s
          && "confidence" in s && "persuasion" in s
          && typeof parsed.globalScore === "number") {

          clearTimeout(fallbackTimerRef.current);
          const validScores: DimensionScore = {
            language: clamp(s.language),
            structure: clamp(s.structure),
            medicalReasoning: clamp(s.medicalReasoning),
            confidence: clamp(s.confidence),
            persuasion: clamp(s.persuasion),
          };
          const validGlobal = validScores.language + validScores.structure + validScores.medicalReasoning + validScores.confidence + validScores.persuasion;

          setEvaluation({
            scores: validScores,
            globalScore: validGlobal,
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((x: unknown) => typeof x === "string") : ["Evaluation recue"],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements.filter((x: unknown) => typeof x === "string") : ["Continue a t'entrainer"],
            betterVersion: typeof parsed.betterVersion === "string" ? parsed.betterVersion : (currentQuestion?.r || ""),
          });
          setSimState("results");
        }
      }
    } catch {
      // AI returned non-JSON — use local evaluation as fallback
      if (currentQuestion) {
        clearTimeout(fallbackTimerRef.current);
        setEvaluation(evaluateLocally(userAnswer, currentQuestion));
        setSimState("results");
      }
    }
  }, [response]);

  const triggerFollowUp = useCallback(() => {
    if (!currentQuestion) return;
    const pool = [...(currentQuestion.followUps || []), ...PRESSURE_INTERRUPTIONS];
    if (pool.length === 0) return;
    const randomQ = pool[Math.floor(Math.random() * pool.length)];
    setCurrentFollowUp(randomQ);
    setShowFollowUp(true);
    // Auto-dismiss after 4 seconds to avoid clutter
    clearTimeout(followUpTimerRef.current);
    followUpTimerRef.current = setTimeout(() => setShowFollowUp(false), 4000);
  }, [currentQuestion]);

  const selectZone = (zoneId: InterviewZoneId) => {
    setActiveZone(zoneId);
    setQuestionIndex(0);
    setSimState("question");
    setUserAnswer("");
    setEvaluation(null);
    setShowReference(false);
    setShowFollowUp(false);
    reset();
    const q = INTERVIEW_ZONES.find(z => z.id === zoneId)?.questions[0];
    if (q) setTimer(TIMER_DURATIONS[q.difficulty] || 120);
  };

  const startFullSim = () => {
    // Pick one random question from each zone for full simulation
    const questions = INTERVIEW_ZONES.map(z => {
      const qs = z.questions;
      return qs[Math.floor(Math.random() * qs.length)];
    });
    setFullSimQuestions(questions);
    setFullSimScores([]);
    setQuestionIndex(0);
    setIsFullSim(true);
    setSimState("question");
    setUserAnswer("");
    setEvaluation(null);
    setPressureMode(true);
    setTimer(TIMER_DURATIONS[questions[0]?.difficulty || 2] || 90);
    setTimerRunning(true);
    reset();
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    if (userAnswer.trim().length < 10) {
      toast("Reponse trop courte", { description: "Minimum 10 caracteres pour une evaluation fiable." });
      return;
    }
    setTimerRunning(false);

    // Save artifact
    if (addArtifact) {
      addArtifact({
        type: "interview_answer",
        sourceModule: "interview-simulator",
        content: userAnswer,
        xpEarned: XP_VALUES.INTERVIEW_ANSWER,
        metadata: {
          zone: currentQuestion.zone,
          simQuestionId: currentQuestion.id,
          question: currentQuestion.q,
          difficulty: currentQuestion.difficulty,
          timerRemaining: timer,
          pressureMode,
        },
      });
    }

    // Evaluate
    setSimState("evaluating");
    const prompt = buildEvaluationPrompt(
      currentQuestion.q,
      currentQuestion.r,
      userAnswer,
      currentQuestion.zone,
    );
    ask(prompt, "interview-eval");

    // Fallback: if AI doesn't respond within 8 seconds, use local
    clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = setTimeout(() => {
      // Only apply fallback if still evaluating (AI hasn't responded yet)
      setSimState(prev => {
        if (prev !== "evaluating") return prev;
        const local = evaluateLocally(userAnswer, currentQuestion);
        setEvaluation(local);
        return "results";
      });
    }, 8000);

    celebrate("creation");
  };

  const handleNextQuestion = () => {
    if (isFullSim && evaluation) {
      setFullSimScores(prev => [...prev, evaluation]);
    }

    const questions = isFullSim ? fullSimQuestions : currentQuestions;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(qi => qi + 1);
      setUserAnswer("");
      setEvaluation(null);
      setSimState("question");
      setShowReference(false);
      setShowFollowUp(false);
      reset();
      const nextQ = questions[questionIndex + 1];
      if (nextQ) {
        setTimer(TIMER_DURATIONS[nextQ.difficulty] || 90);
        if (pressureMode || isFullSim) setTimerRunning(true);
      }
    } else if (isFullSim && evaluation) {
      // Full sim complete
      const allScores = [...fullSimScores, evaluation];
      const avgScore = Math.round(allScores.reduce((sum, e) => sum + e.globalScore, 0) / allScores.length);
      if (addArtifact) {
        addArtifact({
          type: "interview_answer",
          sourceModule: "interview-simulator-final",
          content: `Simulation complete — Score: ${avgScore}/100`,
          xpEarned: 100,
          metadata: {
            zone: "finale",
            simQuestionId: "full-sim-result",
            globalScore: avgScore,
            scores: allScores.map(e => e.scores),
          },
        });
      }
      addXp?.(100);
      celebrate("milestone");
      toast("Simulation terminee !", { description: `Score global : ${avgScore}/100` });
      setIsFullSim(false);
      setSimState("zone_select");
    } else {
      // Zone complete
      addXp?.(50);
      celebrate("creation");
      toast("Zone terminee !", { description: `${currentZone?.name} complete` });
      setIsFullSim(false);
      setSimState("zone_select");
    }
  };

  const retryQuestion = () => {
    // Stop timer first to avoid race conditions
    setTimerRunning(false);
    clearTimeout(fallbackTimerRef.current);
    setUserAnswer("");
    setEvaluation(null);
    setSimState("question");
    setShowReference(false);
    setShowFollowUp(false);
    reset();
    if (currentQuestion) {
      setTimer(TIMER_DURATIONS[currentQuestion.difficulty] || 120);
      if (pressureMode || isFullSim) setTimerRunning(true);
    }
  };

  // ═══════════════════════════════════════════════════════════
  // ZONE SELECTION VIEW
  // ═══════════════════════════════════════════════════════════
  if (simState === "zone_select") {
    return (
      <AtmosphericSceneWrapper atmosphere="studio" intensity="medium">
        <InterviewStageDirector stage="preparation" score={lastSimScore}>
        <div className="space-y-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 surface-premium"
            style={{
              background: "linear-gradient(145deg, hsl(270 60% 55% / 0.08), hsl(var(--card)), hsl(270 40% 35% / 0.04))",
              border: "1px solid hsl(270 60% 55% / 0.12)",
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-3">
                <motion.div
                  animate={{ rotateY: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                  className="door-icon-3d w-14 h-14 rounded-2xl bg-violet-500/12 border border-violet-500/15 flex items-center justify-center"
                  style={{ boxShadow: "var(--shadow-3d-md)" }}
                >
                  <Target className="w-7 h-7 text-violet-400" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black tracking-tight">Simulateur d'entretien</h2>
                    <TranslationToggle active={showFr} onToggle={toggleFr} />
                  </div>
                  <p className="text-[10px] text-violet-400/50 font-medium">Protocole Lazarus — Preparation Biel</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="rounded-xl bg-violet-500/8 border border-violet-500/12 p-2.5 text-center">
                  <div className="text-lg font-black text-violet-400">{totalAnswered}</div>
                  <div className="text-[8px] text-muted-foreground">reponses</div>
                </div>
                <div className="rounded-xl bg-amber-500/8 border border-amber-500/12 p-2.5 text-center">
                  <div className="text-lg font-black text-amber-400">
                    {lastSimScore !== null ? `${lastSimScore}%` : "—"}
                  </div>
                  <div className="text-[8px] text-muted-foreground">dernier score</div>
                </div>
                <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/12 p-2.5 text-center">
                  <div className="text-lg font-black text-emerald-400">
                    {Object.values(zoneCompletions).filter(v => v > 0).length}/6
                  </div>
                  <div className="text-[8px] text-muted-foreground">zones</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Full simulation CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={startFullSim}
            className="w-full rounded-2xl p-5 text-left transition-all room-3d hover:scale-[1.01]"
            style={{
              background: "linear-gradient(145deg, hsl(32 95% 55% / 0.1), hsl(var(--card)), hsl(32 95% 55% / 0.05))",
              border: "1px solid hsl(32 95% 55% / 0.2)",
              boxShadow: "var(--shadow-3d-md), 0 0 20px -6px hsl(32 95% 55% / 0.15)",
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center"
              >
                <Trophy className="w-6 h-6 text-amber-400" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-black text-amber-400">Simulation complete</p>
                <p className="text-[10px] text-amber-400/50">6 questions — mode pression — conditions reelles</p>
              </div>
              <Zap className="w-5 h-5 text-amber-400/50" />
            </div>
          </motion.button>

          {/* Quick start — suggested zone (shown always if a zone is suggested) */}
          {suggestedZone && (() => {
            const zone = INTERVIEW_ZONES.find(z => z.id === suggestedZone);
            if (!zone) return null;
            return (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => selectZone(suggestedZone)}
                className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.005]"
                style={{
                  background: "linear-gradient(145deg, hsl(var(--primary) / 0.08), hsl(var(--card)))",
                  border: "1px solid hsl(var(--primary) / 0.15)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-lg shrink-0">
                    {zone.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-primary">{totalAnswered > 0 ? "Continuer" : "Commencer"} : {zone.name}</p>
                    <p className="text-[10px] text-muted-foreground">{totalAnswered > 0 ? "Zone recommandee — questions non couvertes" : "Zone de depart recommandee"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary/50" />
                </div>
              </motion.button>
            );
          })()}

          {/* Pressure mode toggle */}
          <div className="flex items-center justify-between rounded-xl bg-secondary/20 border border-border/20 p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs font-bold">Mode Pression</p>
                <p className="text-[9px] text-muted-foreground">Timer + relances aleatoires</p>
              </div>
            </div>
            <button
              onClick={() => setPressureMode(!pressureMode)}
              className={`w-10 h-5 rounded-full transition-all ${pressureMode ? "bg-rose-500" : "bg-secondary/60"}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all ${pressureMode ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Zone cards */}
          <div className="space-y-2.5">
            {INTERVIEW_ZONES.map((zone, i) => {
              const completions = zoneCompletions[zone.id];
              const totalQs = zone.questions.length;
              return (
                <motion.button
                  key={zone.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => selectZone(zone.id)}
                  className="w-full rounded-2xl p-4 text-left transition-all room-3d hover:scale-[1.005]"
                  style={{
                    background: `linear-gradient(145deg, hsl(var(--card)), hsl(var(--card)))`,
                    border: completions > 0
                      ? "1px solid hsl(var(--primary) / 0.2)"
                      : "1px solid hsl(var(--border) / 0.3)",
                    boxShadow: "var(--shadow-3d-sm)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/30 border border-border/20 flex items-center justify-center text-lg shrink-0">
                      {zone.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold">{zone.name}</p>
                        {completions > 0 && (
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                            {completions}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{zone.description}</p>
                      <RevealTranslation fr={zone.descriptionFr} globalShow={showFr} size="xs" />
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[9px] text-muted-foreground">{totalQs} questions</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 ml-auto" />
                    </div>
                  </div>
                  {completions > 0 && (
                    <div className="mt-2 h-1 bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/40 transition-all"
                        style={{ width: `${Math.min(100, (completions / totalQs) * 100)}%` }}
                      />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
        </InterviewStageDirector>
      </AtmosphericSceneWrapper>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // QUESTION VIEW (also used for full_sim)
  // ═══════════════════════════════════════════════════════════
  if (simState === "question" && currentQuestion) {
    const questions = isFullSim ? fullSimQuestions : currentQuestions;
    const zone = INTERVIEW_ZONES.find(z => z.id === currentQuestion.zone);
    const isTimerCritical = timer < 20 && timerRunning;

    return (
      <AtmosphericSceneWrapper atmosphere="studio" intensity="medium">
        <InterviewStageDirector stage="answering" timerSeconds={timer} timerRunning={timerRunning} pressureMode={pressureMode}>
        <div className="space-y-4">
          {/* Back + zone header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setSimState("zone_select"); setTimerRunning(false); setIsFullSim(false); }}
              className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              {isFullSim ? "Quitter simulation" : "Zones"}
            </button>
            {(timerRunning || pressureMode) && (
              <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${isTimerCritical ? "bg-rose-500/15 border-rose-500/25" : "bg-violet-500/10 border-violet-500/20"} border`}>
                <Timer className={`w-3.5 h-3.5 ${isTimerCritical ? "text-rose-400 animate-pulse" : "text-violet-400"}`} />
                <span className={`font-mono text-sm font-black ${isTimerCritical ? "text-rose-400" : "text-violet-400"}`}>
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>

          {/* Zone narration */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] italic text-violet-400/30"
          >
            {zone?.narrativeIntro}
          </motion.p>

          {/* Question navigator */}
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < questionIndex ? "bg-primary/50" :
                  i === questionIndex ? "bg-primary" :
                  "bg-secondary/30"
                }`}
              />
            ))}
          </div>

          {/* Question card */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className="room-3d rounded-2xl p-5 relative overflow-hidden"
            style={{
              border: "1px solid hsl(270 60% 55% / 0.12)",
              boxShadow: "var(--shadow-3d-lg)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">{zone?.icon}</span>
                <p className="text-[9px] uppercase tracking-[2px] text-violet-400/50">
                  {zone?.name} — {questionIndex + 1}/{questions.length}
                </p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map(d => (
                  <div key={d} className={`w-2 h-2 rounded-full ${d <= currentQuestion.difficulty ? "bg-amber-400" : "bg-secondary/30"}`} />
                ))}
              </div>
            </div>

            <p className="text-lg font-bold leading-snug tracking-tight mb-1">{currentQuestion.q}</p>
            <RevealTranslation fr={currentQuestion.qFr} globalShow={showFr} size="sm" className="mb-3" />

            <div className="rounded-xl bg-violet-500/6 border border-violet-500/12 px-3 py-2">
              <p className="text-[10px] text-violet-400/70">Indice : {currentQuestion.h}</p>
            </div>
          </motion.div>

          {/* Follow-up interruption (pressure mode) */}
          <AnimatePresence>
            {showFollowUp && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl p-4 border border-rose-500/20 bg-rose-500/8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-rose-400" />
                  <span className="text-[9px] uppercase tracking-[2px] text-rose-400 font-bold">Relance du jury</span>
                </div>
                <p className="text-sm font-bold text-rose-300">{currentFollowUp}</p>
                {showFr && currentQuestion?.followUpsFr && (() => {
                  const idx = [...(currentQuestion.followUps || []), ...PRESSURE_INTERRUPTIONS].indexOf(currentFollowUp);
                  const fr = currentQuestion.followUpsFr?.[idx];
                  return fr ? <p className="text-[10px] text-blue-300/70 italic mt-0.5">{fr}</p> : null;
                })()}
                <p className="text-[9px] text-rose-400/50 mt-1">Integre cette relance dans ta reponse</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Answer input */}
          <div className="room-3d rounded-2xl p-4 space-y-3" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
            <Textarea
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmitAnswer(); }}
              placeholder="Antworte auf Deutsch... (minimum 10 Zeichen) — Ctrl+Enter zum Absenden"
              className="min-h-[120px] bg-secondary/40 border-violet-500/10 rounded-xl text-sm resize-none focus:border-violet-500/25"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitAnswer}
                disabled={userAnswer.trim().length < 10}
                className="flex-1 rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white"
              >
                <Target className="w-4 h-4" />
                Evaluer ma reponse
              </Button>
              {pressureMode && !timerRunning && (
                <Button
                  onClick={() => { setTimer(TIMER_DURATIONS[currentQuestion.difficulty] || 90); setTimerRunning(true); }}
                  variant="secondary"
                  className="rounded-xl h-11 px-4"
                >
                  <Timer className="w-4 h-4" />
                </Button>
              )}
              {pressureMode && (
                <Button
                  onClick={triggerFollowUp}
                  variant="secondary"
                  className="rounded-xl h-11 px-4"
                  title="Simuler une relance"
                >
                  <Zap className="w-4 h-4 text-rose-400" />
                </Button>
              )}
            </div>
          </div>
        </div>
        </InterviewStageDirector>
      </AtmosphericSceneWrapper>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // EVALUATING (loading state)
  // ═══════════════════════════════════════════════════════════
  if (simState === "evaluating") {
    return (
      <AtmosphericSceneWrapper atmosphere="studio" intensity="medium">
        <InterviewStageDirector stage="evaluating">
        <div className="space-y-6 py-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto rounded-full border-2 border-violet-400/30 border-t-violet-400 flex items-center justify-center"
          >
            <Sparkles className="w-6 h-6 text-violet-400" />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-bold text-violet-400">Le Conseil analyse ta reponse...</p>
            <p className="text-[10px] text-muted-foreground mt-1">Evaluation sur 5 dimensions</p>
          </div>
          <button
            onClick={() => {
              if (currentQuestion) {
                setEvaluation(evaluateLocally(userAnswer, currentQuestion));
                setSimState("results");
              }
            }}
            className="mx-auto block px-4 py-2 rounded-xl bg-violet-500/10 text-violet-400/70 text-xs hover:bg-violet-500/20 transition-colors"
          >
            Utiliser l'evaluation locale
          </button>
        </div>
        </InterviewStageDirector>
      </AtmosphericSceneWrapper>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RESULTS VIEW — 5-dimension scoring
  // ═══════════════════════════════════════════════════════════
  if (simState === "results" && evaluation && currentQuestion) {
    const { scores, globalScore, strengths, improvements, betterVersion } = evaluation;

    return (
      <AtmosphericSceneWrapper atmosphere="studio" intensity="medium">
        <InterviewStageDirector stage="results" score={globalScore}>
        <div className="space-y-4">
          {/* Back */}
          <button
            onClick={() => { setSimState("zone_select"); setTimerRunning(false); setIsFullSim(false); }}
            className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" /> Zones
          </button>

          {/* Global score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="room-3d rounded-2xl p-6 text-center relative overflow-hidden"
            style={{
              background: globalScore >= 70
                ? "linear-gradient(145deg, hsl(142 71% 45% / 0.08), hsl(var(--card)))"
                : globalScore >= 40
                ? "linear-gradient(145deg, hsl(32 95% 55% / 0.08), hsl(var(--card)))"
                : "linear-gradient(145deg, hsl(0 84% 60% / 0.08), hsl(var(--card)))",
              border: globalScore >= 70
                ? "1px solid hsl(142 71% 45% / 0.2)"
                : globalScore >= 40
                ? "1px solid hsl(32 95% 55% / 0.2)"
                : "1px solid hsl(0 84% 60% / 0.2)",
              boxShadow: "var(--shadow-3d-lg)",
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="text-5xl font-black mb-1"
              style={{
                color: globalScore >= 70
                  ? "hsl(142 71% 45%)"
                  : globalScore >= 40
                  ? "hsl(32 95% 55%)"
                  : "hsl(0 84% 60%)",
              }}
            >
              {globalScore}
            </motion.div>
            <p className="text-xs text-muted-foreground">/ 100</p>
            <p className="text-[10px] mt-2 font-bold text-muted-foreground/60 uppercase tracking-wider">
              {globalScore >= 80 ? "Excellent — Du bist bereit" :
               globalScore >= 60 ? "Gut — Noch etwas verfeinern" :
               globalScore >= 40 ? "Grundlage vorhanden — Weiter uben" :
               "Mehr Ubung nötig — Nicht aufgeben"}
            </p>
            {showFr && (
              <p className="text-[9px] mt-1 text-blue-300/60 italic">
                {globalScore >= 80 ? "Excellent — Tu es prête" :
                 globalScore >= 60 ? "Bien — Encore un peu de peaufinage" :
                 globalScore >= 40 ? "Base présente — Continue de t'entraîner" :
                 "Plus d'entraînement nécessaire — N'abandonne pas"}
              </p>
            )}
          </motion.div>

          {/* 5-dimension radar */}
          <div className="room-3d rounded-2xl p-4 space-y-2.5" style={{ boxShadow: "var(--shadow-3d-md)" }}>
            <p className="text-[9px] uppercase tracking-[2px] text-muted-foreground/50 font-bold">5 Dimensions</p>
            {(Object.keys(scores) as Array<keyof DimensionScore>).map((dim, i) => {
              const score = scores[dim];
              const label = DIMENSION_LABELS[dim];
              return (
                <motion.div
                  key={dim}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm w-5 text-center">{label.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] font-bold">{label.de}{showFr && <span className="text-blue-300/60 font-normal ml-1">({label.fr})</span>}</span>
                      <span className="text-[10px] font-black text-primary">{score}/20</span>
                    </div>
                    <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 20) * 100}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                        className={`h-full rounded-full ${
                          score >= 16 ? "bg-emerald-400" :
                          score >= 12 ? "bg-primary" :
                          score >= 8 ? "bg-amber-400" :
                          "bg-rose-400"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Strengths + Improvements */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="room-3d rounded-2xl p-3 space-y-1.5" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
              <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Points forts</p>
              {strengths.map((s, i) => (
                <p key={i} className="text-[10px] text-foreground/80 flex items-start gap-1">
                  <span className="text-emerald-400 mt-0.5 shrink-0">+</span> {s}
                </p>
              ))}
            </div>
            <div className="room-3d rounded-2xl p-3 space-y-1.5" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
              <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">A ameliorer</p>
              {improvements.map((s, i) => (
                <p key={i} className="text-[10px] text-foreground/80 flex items-start gap-1">
                  <span className="text-amber-400 mt-0.5 shrink-0">!</span> {s}
                </p>
              ))}
            </div>
          </div>

          {/* Better version */}
          <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
            <p className="text-[9px] text-violet-400 font-bold uppercase tracking-wider mb-2">Version amelioree</p>
            <p className="text-sm text-foreground/85 leading-relaxed">{betterVersion}</p>
          </div>

          {/* Reference (toggle) */}
          <button
            onClick={() => setShowReference(!showReference)}
            className="w-full room-3d rounded-2xl p-3 flex items-center justify-between"
            style={{ boxShadow: "var(--shadow-3d-sm)" }}
          >
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Reponse de reference
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showReference ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showReference && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl bg-emerald-500/6 border border-emerald-500/12 p-4 space-y-2">
                  <p className="text-sm text-foreground/85 leading-relaxed">{currentQuestion.r}</p>
                  <RevealTranslation fr={currentQuestion.rFr} globalShow={showFr} size="sm" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2.5">
            <Button
              onClick={retryQuestion}
              variant="secondary"
              className="flex-1 rounded-xl h-11 gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reprendre
            </Button>
            <Button
              onClick={handleNextQuestion}
              className="flex-1 rounded-xl h-11 gap-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white"
            >
              <ArrowRight className="w-4 h-4" />
              {questionIndex < (fullSimQuestions.length > 0 ? fullSimQuestions : currentQuestions).length - 1
                ? "Question suivante"
                : "Terminer"}
            </Button>
          </div>
        </div>
        </InterviewStageDirector>
      </AtmosphericSceneWrapper>
    );
  }

  // Fallback — should not happen, but prevents blank render
  return (
    <div className="rounded-2xl p-8 text-center space-y-3">
      <div className="text-3xl">🎯</div>
      <p className="text-sm font-bold">Simulateur d'entretien</p>
      <p className="text-xs text-muted-foreground">Chargement en cours...</p>
      <button
        onClick={() => { setSimState("zone_select"); setIsFullSim(false); }}
        className="px-4 py-2 rounded-xl bg-violet-500/15 text-violet-400 text-xs font-bold hover:bg-violet-500/25 transition-colors"
      >
        Retour aux zones
      </button>
    </div>
  );
}
