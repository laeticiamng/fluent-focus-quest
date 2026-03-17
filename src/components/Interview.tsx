import { useState, useEffect, useRef, useMemo } from "react";
import { IVW } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useAICoach } from "@/hooks/useAICoach";
import { useCelebration } from "@/components/CelebrationProvider";
import { Sparkles, Copy, Check, ChevronRight, Lock, BookOpen, ChevronDown, Mic, Theater, Timer } from "lucide-react";
import { toast } from "sonner";
import type { Artifact } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";
import { AtmosphericSceneWrapper } from "./immersive/AtmosphericSceneWrapper";

type Tab = "vocab" | "gram" | "atelier" | "tools";

interface InterviewProps {
  rat: Record<number, number>;
  setRating: (qi: number, r: number) => void;
  addXp?: (n: number) => void;
  onNavigate?: (tab: Tab) => void;
  addArtifact?: (artifact: Omit<Artifact, "id" | "date">) => void;
  artifacts?: Artifact[];
}

const EMOJIS = [
  { v: 1, e: "😰", l: "Rate" },
  { v: 2, e: "😕", l: "Fragile" },
  { v: 3, e: "🙂", l: "Passable" },
  { v: 4, e: "😊", l: "Solide" },
  { v: 5, e: "🔥", l: "Maitrise" },
];

const REDIRECT_MAP: Record<string, { tab: Tab; label: string }> = {
  vocab: { tab: "vocab", label: "Forge de vocabulaire" },
  gram:  { tab: "gram",  label: "Arbre de grammaire" },
  atelier: { tab: "atelier", label: "Ateliers" },
  tools: { tab: "tools", label: "Outils" },
};

const STUDIO_NARRATION = [
  "Les projecteurs s'allument. Le jury vous attend...",
  "La salle est silencieuse. Votre reponse va tout changer...",
  "Le Chefarzt prend des notes. Chaque mot compte...",
  "Votre voix doit porter la conviction d'une professionnelle...",
  "Le moment est venu de montrer qui vous etes...",
];

const COACH_PERSONA = `Tu es le Directeur de Casting, un coach d'entretien legendaire qui prepare les medecins pour leurs moments decisifs. Tu parles avec l'intensite d'un metteur en scene : "ta performance est convaincante", "cette replique manque d'aplomb", "reprends cette scene avec plus d'assurance". Tu es exigeant mais toujours bienveillant.`;

function buildAnalysisPrompt(question: string, reference: string, said: string) {
  return `${COACH_PERSONA}

Question posee : "${question}"
Reponse de reference : "${reference}"
Ce que la candidate a construit : "${said}"

Analyse sa creation de facon structuree et bienveillante :

✅ CE QU'ELLE A BIEN CONSTRUIT (1-3 points forts, reconnais le travail)
⚠️ CE QUI MANQUE (elements importants absents de la reference)
❌ A AJUSTER (allemand a affiner, vocabulaire medical a preciser — si rien, dis-le)
🎯 A RENFORCER (un mot ou point de grammaire precis a integrer)
💡 VERSION ENRICHIE (1-2 phrases reformulees en enrichissant sa construction)

Commence TOUJOURS par reconnaitre ce que la candidate a produit. Utilise le ton d'un directeur de casting bienveillant. Maximum 150 mots.`;
}

export function Interview({ rat, setRating, addXp, onNavigate, addArtifact, artifacts = [] }: InterviewProps) {
  const { response, isLoading, error: aiError, ask, reset } = useAICoach();
  const { celebrate } = useCelebration();

  const [ii, setIi] = useState(0);
  const [sa, setSa] = useState(false);
  const [simMode, setSimMode] = useState(false);
  const [simTimer, setSimTimer] = useState(120);
  const [simRunning, setSimRunning] = useState(false);
  const [showRecorder, setShowRecorder] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [analysisSubmitted, setAnalysisSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showPrevVersions, setShowPrevVersions] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const getVersionsForQuestion = (qIdx: number) =>
    artifacts.filter(a => a.type === "interview_answer" && a.metadata?.questionIdx === qIdx)
      .sort((a, b) => a.date.localeCompare(b.date));

  const currentVersions = useMemo(() => getVersionsForQuestion(ii), [artifacts, ii]);

  const answeredQuestions = useMemo(() => {
    const uniqueQs = new Set(
      artifacts.filter(a => a.type === "interview_answer").map(a => a.metadata?.questionIdx)
    );
    return uniqueQs.size;
  }, [artifacts]);

  const ratedCount = Object.keys(rat).length;
  const avgRating = ratedCount > 0
    ? (Object.values(rat).reduce((a, b) => a + b, 0) / ratedCount).toFixed(1)
    : "—";

  useEffect(() => {
    if (simRunning && simTimer > 0) {
      timerRef.current = setTimeout(() => setSimTimer(t => t - 1), 1000);
    } else if (simRunning && simTimer === 0) {
      setSimRunning(false);
      if (ii < IVW.length - 1) {
        goToQuestion(ii + 1);
        setTimeout(() => setSimRunning(true), 500);
      } else { setSimMode(false); }
    }
    return () => clearTimeout(timerRef.current);
  }, [simRunning, simTimer, ii]);

  const goToQuestion = (i: number) => {
    setIi(i); setSa(false); setSimTimer(120);
    setTranscript(""); setAnalysisSubmitted(false); reset();
    setUserAnswer(""); setAnswerSubmitted(false);
    setShowRecorder(false); setShowPrevVersions(false);
  };

  const startSim = () => { setSimMode(true); goToQuestion(0); setSimRunning(true); };
  const stopSim = () => { setSimMode(false); setSimRunning(false); setSimTimer(120); };

  const currentQ = IVW[ii] ?? IVW[0];

  const handleSubmitAnswer = () => {
    if (!currentQ || userAnswer.trim().length < 10) return;
    const versionNum = currentVersions.length + 1;
    const isImproved = versionNum > 1;
    if (addArtifact) {
      addArtifact({
        type: "interview_answer",
        sourceModule: "interview",
        content: userAnswer,
        xpEarned: isImproved ? XP_VALUES.INTERVIEW_IMPROVED : XP_VALUES.INTERVIEW_ANSWER,
        version: versionNum,
        metadata: { questionIdx: ii, question: currentQ.q },
      });
    }
    setAnswerSubmitted(true);
    celebrate("creation");
    if (isImproved) {
      toast("🎬 Prise amelioree ! +15 XP", { description: `Version ${versionNum} — chaque reprise renforce` });
    } else {
      toast("🎬 Premiere prise enregistree ! +25 XP", { description: "Ajoutee a ton Book de casting" });
    }
  };

  const handleAnalyse = () => {
    if (!transcript.trim() || !currentQ) return;
    const prompt = buildAnalysisPrompt(currentQ.q, currentQ.r, transcript);
    ask(prompt, "interview-analysis");
    setAnalysisSubmitted(true);
    addXp?.(XP_VALUES.ANALYSIS);
    celebrate("creation");
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      toast.success("Copie !");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const narration = STUDIO_NARRATION[ii % STUDIO_NARRATION.length];

  // BOOK VIEW — Portfolio
  if (showBook) {
    const allAnswers = artifacts
      .filter(a => a.type === "interview_answer")
      .sort((a, b) => b.date.localeCompare(a.date));

    return (
      <AtmosphericSceneWrapper atmosphere="studio" intensity="low">
        <div className="space-y-4">
          <button onClick={() => setShowBook(false)} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" /> Retour au Studio
          </button>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="room-3d rounded-2xl p-5"
            style={{
              background: "linear-gradient(145deg, hsl(270 60% 55% / 0.08), hsl(var(--card)))",
              border: "1px solid hsl(270 60% 55% / 0.12)",
              boxShadow: "var(--shadow-3d-lg)",
            }}
          >
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-violet-400" /> Mon Book de Casting
            </h2>
            <p className="text-sm text-violet-400/50 mt-1">{allAnswers.length} prise{allAnswers.length > 1 ? "s" : ""} enregistree{allAnswers.length > 1 ? "s" : ""}</p>
          </motion.div>

          {allAnswers.length === 0 ? (
            <div className="room-3d rounded-2xl p-10 text-center" style={{ boxShadow: "var(--shadow-3d-md)" }}>
              <div className="text-5xl mb-4">🎬</div>
              <p className="text-sm text-muted-foreground">Le Book est vide. Enregistre ta premiere prise pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allAnswers.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="room-3d rounded-2xl p-4"
                  style={{ boxShadow: "var(--shadow-3d-sm)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-muted-foreground">
                      Scene {typeof a.metadata?.questionIdx === "number" ? a.metadata.questionIdx + 1 : "?"} · {new Date(a.date).toLocaleDateString("fr-FR")}
                    </span>
                    {a.version && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">
                        Prise {a.version}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-violet-400/70 font-medium mb-1">{String(a.metadata?.question ?? "")}</p>
                  <p className="text-xs text-foreground/85 leading-relaxed">{a.content}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </AtmosphericSceneWrapper>
    );
  }

  return (
    <AtmosphericSceneWrapper atmosphere="studio" intensity="medium">
      <div className="space-y-4">
        {/* Studio header — immersive */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-6 room-3d"
          style={{
            background: "linear-gradient(145deg, hsl(270 60% 55% / 0.08), hsl(var(--card)), hsl(270 40% 35% / 0.04))",
            border: "1px solid hsl(270 60% 55% / 0.12)",
            boxShadow: "var(--shadow-3d-xl), 0 0 60px -16px hsl(270 60% 55% / 0.12)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-40 h-40 bg-violet-500/[0.03] blur-[50px] rounded-full -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/[0.02] blur-[40px] rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-violet-400/10 to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotateY: [0, 5, -5, 0], scale: [1, 1.03, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="door-icon-3d w-14 h-14 rounded-2xl bg-violet-500/12 border border-violet-500/15 flex items-center justify-center"
                  style={{ boxShadow: "var(--shadow-3d-md), 0 0 20px -6px hsl(270 60% 55% / 0.2)" }}
                >
                  <Theater className="w-7 h-7 text-violet-400" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Le Studio</h2>
                  <p className="text-[10px] text-violet-400/50 font-medium">Scene du Directeur de Casting</p>
                </div>
              </div>
              <button
                onClick={() => setShowBook(true)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/15 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" /> Book
              </button>
            </div>
            <p className="text-xs text-muted-foreground/60">{IVW.length} scenes a tourner</p>
          </div>
        </motion.div>

        {/* Stats — studio metrics */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { v: answeredQuestions, l: "prises", cls: "text-violet-400" },
            { v: IVW.length - answeredQuestions, l: "a tourner", cls: "text-blue-400" },
            { v: avgRating, l: "note jury", cls: "text-amber-400" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="room-3d rounded-2xl p-3 text-center"
              style={{ boxShadow: "var(--shadow-3d-sm)" }}
            >
              <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
              <div className="text-[9px] font-medium text-muted-foreground/50 mt-0.5">{s.l}</div>
            </motion.div>
          ))}
        </div>

        <Progress value={(answeredQuestions / IVW.length) * 100} className="h-1.5 bg-secondary rounded-full" />

        {/* Simulation mode — intense */}
        {!simMode ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={startSim}
            className="w-full rounded-2xl p-4 text-left transition-all room-3d hover:scale-[1.01]"
            style={{
              background: "linear-gradient(145deg, hsl(270 60% 55% / 0.08), hsl(var(--card)))",
              border: "1px solid hsl(270 60% 55% / 0.15)",
              boxShadow: "var(--shadow-3d-md)",
            }}
          >
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-sm font-bold text-violet-400">Mode Audition Chrono</p>
                <p className="text-[10px] text-violet-400/50">2 min par scene — sous pression comme le jour J</p>
              </div>
            </div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="room-3d room-in-progress rounded-2xl p-4"
            style={{
              border: "1px solid hsl(270 60% 55% / 0.2)",
              boxShadow: "var(--shadow-3d-md), 0 0 20px -6px hsl(270 60% 55% / 0.15)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-violet-400 uppercase tracking-[2px]">Audition en cours</span>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-2xl font-black ${simTimer < 30 ? "text-rose-400 animate-pulse" : "text-violet-400"}`}>
                  {Math.floor(simTimer / 60)}:{String(simTimer % 60).padStart(2, "0")}
                </span>
                <Button size="sm" variant="secondary" onClick={stopSim} className="rounded-xl">Stop</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scene navigator */}
        <div className="flex gap-1.5 flex-wrap">
          {IVW.map((_, i) => {
            const hasAnswer = artifacts.some(a => a.type === "interview_answer" && a.metadata?.questionIdx === i);
            const vCount = getVersionsForQuestion(i).length;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.9 }}
                onClick={() => { goToQuestion(i); if (simMode) setSimRunning(true); }}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative room-3d ${
                  ii === i ? "room-in-progress" :
                  hasAnswer ? "" :
                  rat[i] ? "" :
                  ""
                }`}
                style={{
                  border: ii === i
                    ? "1px solid hsl(270 60% 55% / 0.3)"
                    : hasAnswer
                      ? "1px solid hsl(270 60% 55% / 0.15)"
                      : "1px solid hsl(var(--border) / 0.3)",
                  color: ii === i
                    ? "hsl(270 60% 65%)"
                    : hasAnswer
                      ? "hsl(270 60% 55%)"
                      : "hsl(var(--muted-foreground))",
                  boxShadow: ii === i ? "var(--shadow-3d-sm), 0 0 8px -2px hsl(270 60% 55% / 0.2)" : "var(--shadow-3d-sm)",
                }}
              >
                {i + 1}
                {vCount > 1 && (
                  <span className="absolute -top-1 -right-1 text-[7px] bg-violet-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                    {vCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Scene card — dramatic */}
        <motion.div
          key={ii}
          initial={{ opacity: 0, x: 16, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="room-3d rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsl(270 60% 55% / 0.05), hsl(var(--card)))",
            border: "1px solid hsl(270 60% 55% / 0.12)",
            boxShadow: "var(--shadow-3d-lg)",
          }}
        >
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-violet-400/8 to-transparent" />

          {/* Narrative whisper */}
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] italic text-violet-400/30 mb-3"
          >
            {narration}
          </motion.p>

          <div className="flex items-center justify-between mb-2 relative z-10">
            <p className="text-[9px] uppercase tracking-[3px] text-violet-400/50">Scene {ii + 1}/{IVW.length}</p>
            {currentVersions.length > 0 && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">
                Prise {currentVersions.length}
              </span>
            )}
          </div>
          <p className="text-lg font-bold leading-snug tracking-tight mb-4 relative z-10">{currentQ.q}</p>
          <div className="rounded-xl bg-violet-500/6 border border-violet-500/12 px-4 py-2.5 relative z-10">
            <p className="text-[11px] text-violet-400/70 font-medium">💡 {currentQ.h}</p>
          </div>
        </motion.div>

        {/* Writing — GATED */}
        <div className="room-3d rounded-2xl p-4 space-y-3" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            ✍️ Ecris ta replique
          </p>
          <Textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Construis ta replique en allemand... (minimum 10 caracteres)"
            className="min-h-[100px] bg-secondary/40 border-violet-500/10 rounded-xl text-sm resize-none focus:border-violet-500/25"
            disabled={answerSubmitted && !showRecorder}
          />
          {!answerSubmitted ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={userAnswer.trim().length < 10}
              className="w-full rounded-xl gap-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white h-11"
              style={{ boxShadow: "0 4px 16px -4px hsl(270 60% 55% / 0.3)" }}
            >
              🎬 Enregistrer la prise {currentVersions.length > 0 ? `(${currentVersions.length + 1})` : ""} +{currentVersions.length > 0 ? "15" : "25"} XP
            </Button>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-violet-400 font-medium text-center"
            >
              ✓ Prise enregistree — tu peux comparer avec le script de reference
            </motion.p>
          )}
        </div>

        {/* Previous versions */}
        {currentVersions.length > 0 && (
          <button
            onClick={() => setShowPrevVersions(!showPrevVersions)}
            className="w-full text-left room-3d rounded-2xl p-3 flex items-center justify-between"
            style={{ boxShadow: "var(--shadow-3d-sm)" }}
          >
            <span className="text-xs font-medium text-muted-foreground">
              Prises precedentes ({currentVersions.length})
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showPrevVersions ? "rotate-180" : ""}`} />
          </button>
        )}
        <AnimatePresence>
          {showPrevVersions && currentVersions.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              {currentVersions.map((v, i) => (
                <div key={v.id} className="rounded-xl bg-secondary/20 border border-border/15 p-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-bold text-violet-400">Prise {v.version || i + 1}</span>
                    <span className="text-[9px] text-muted-foreground">{new Date(v.date).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <p className="text-xs text-foreground/75 leading-relaxed">{v.content}</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions — GATED */}
        <div className="flex gap-2.5">
          <Button
            onClick={() => setSa(!sa)}
            className="flex-1 rounded-xl h-11"
            variant={sa ? "secondary" : "default"}
            disabled={!answerSubmitted}
          >
            {!answerSubmitted ? (
              <span className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Script de reference
              </span>
            ) : (
              sa ? "Masquer" : "🔓 Script de reference"
            )}
          </Button>
          <Button
            onClick={() => { setShowRecorder(!showRecorder); if (!showRecorder) setTranscript(""); }}
            variant={showRecorder ? "default" : "secondary"}
            className="rounded-xl h-11 px-4"
          >
            <Mic className="w-4 h-4" />
          </Button>
        </div>

        {!answerSubmitted && (
          <p className="text-[10px] text-violet-400/30 text-center italic">
            Ecris ta replique d'abord — puis compare avec le script
          </p>
        )}

        {/* Voice recorder + AI analysis */}
        <AnimatePresence>
          {showRecorder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-3"
            >
              <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
                <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground/50 mb-3 flex items-center gap-1.5">
                  <Mic className="w-3 h-3" /> Enregistrement vocal
                </p>
                <VoiceRecorder label={`Scene ${ii + 1}`} context={`Scene ${ii + 1}: ${currentQ.q.slice(0, 40)}`} />
              </div>

              <div className="room-3d rounded-2xl p-4 space-y-3" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" /> Directeur de Casting — transcris ta replique :
                </p>
                <Textarea
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder="Tape ta replique pour l'analyse du Directeur..."
                  className="min-h-[80px] bg-secondary/40 border-violet-500/10 rounded-xl text-sm resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAnalyse}
                  disabled={!transcript.trim() || isLoading}
                  className="w-full rounded-xl gap-2 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white"
                >
                  {isLoading
                    ? <><Sparkles className="w-4 h-4 animate-spin" /> Le Directeur analyse...</>
                    : <><Sparkles className="w-4 h-4" /> Analyse du Directeur +30XP</>
                  }
                </Button>
              </div>

              {aiError && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">{aiError}</div>
              )}

              {/* AI feedback — Directeur de Casting */}
              <AnimatePresence>
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="room-3d rounded-2xl p-5 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(145deg, hsl(270 60% 55% / 0.06), hsl(var(--card)))",
                      border: "1px solid hsl(270 60% 55% / 0.12)",
                      boxShadow: "var(--shadow-3d-md), 0 0 20px -6px hsl(270 60% 55% / 0.1)",
                    }}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2.5">
                        <motion.div
                          animate={{ rotateY: [0, 8, -8, 0] }}
                          transition={{ duration: 5, repeat: Infinity }}
                          className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-lg"
                        >
                          🎬
                        </motion.div>
                        <div>
                          <p className="text-[10px] font-black text-violet-400 uppercase tracking-[2px]">Directeur de Casting</p>
                          <p className="text-[9px] text-violet-400/40">Verdict artistique</p>
                        </div>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary rounded-lg px-2.5 py-1.5 transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                        {copied ? "Copie" : "Copier"}
                      </button>
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 mt-3 relative z-10">{response}</div>

                    {onNavigate && (
                      <div className="pt-3 mt-3 border-t border-border/20 space-y-1.5 relative z-10">
                        <p className="text-[10px] text-muted-foreground/50 font-semibold uppercase tracking-wider">Continuer a repeter :</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(REDIRECT_MAP).map(([key, { tab, label }]) => (
                            <button
                              key={key}
                              onClick={() => onNavigate(tab)}
                              className="flex items-center gap-1 text-xs font-semibold text-violet-400/80 hover:text-violet-400 bg-violet-500/8 hover:bg-violet-500/12 rounded-lg px-2.5 py-1.5 transition-all border border-violet-500/12"
                            >
                              <ChevronRight className="w-3 h-3" />
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Model answer — reference script */}
        {sa && answerSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="space-y-3"
          >
            <div className="room-3d rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(142 71% 45% / 0.06), hsl(var(--card)))",
                border: "1px solid hsl(142 71% 45% / 0.12)",
                boxShadow: "var(--shadow-3d-md)",
              }}
            >
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[2px] mb-2">Script de reference</p>
              <p className="text-sm leading-relaxed text-foreground/85">{currentQ.r}</p>
            </div>

            {/* Self-validation — jury score */}
            <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
              <p className="text-xs text-muted-foreground/60 mb-3 text-center">Note du Jury :</p>
              <div className="flex gap-2 justify-center">
                {EMOJIS.map(r => (
                  <motion.button
                    key={r.v}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setRating(ii, r.v); if (r.v >= 4) { addXp?.(XP_VALUES.RATING_HIGH); celebrate("creation"); } }}
                    className={`flex flex-col items-center rounded-xl p-2.5 border transition-all ${
                      rat[ii] === r.v ? "bg-violet-500/15 border-violet-500/30" : "bg-secondary/50 border-border/30"
                    }`}
                    style={rat[ii] === r.v ? { boxShadow: "0 0 12px -4px hsl(270 60% 55% / 0.3)" } : {}}
                  >
                    <span className="text-xl">{r.e}</span>
                    <span className="text-[8px] text-muted-foreground mt-0.5">{r.l}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AtmosphericSceneWrapper>
  );
}
