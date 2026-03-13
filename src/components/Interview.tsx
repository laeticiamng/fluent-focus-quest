import { useState, useEffect, useRef, useMemo } from "react";
import { IVW } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useAICoach } from "@/hooks/useAICoach";
import { useCelebration } from "@/components/CelebrationProvider";
import { Sparkles, Copy, Check, ChevronRight, Lock, BookOpen, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Artifact } from "@/hooks/useProgress";
import { XP_VALUES } from "@/hooks/useProgress";

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
  { v: 1, e: "😰", l: "Raté" },
  { v: 2, e: "😕", l: "Fragile" },
  { v: 3, e: "🙂", l: "Passable" },
  { v: 4, e: "😊", l: "Solide" },
  { v: 5, e: "🔥", l: "Maîtrisé" },
];

const REDIRECT_MAP: Record<string, { tab: Tab; label: string }> = {
  vocab: { tab: "vocab", label: "Forge de vocabulaire" },
  gram:  { tab: "gram",  label: "Atelier grammaire" },
  atelier: { tab: "atelier", label: "Ateliers" },
  tools: { tab: "tools", label: "Outils" },
};

function buildAnalysisPrompt(question: string, reference: string, said: string) {
  return `Tu es un coach d'atelier bienveillant et expert. Tu accompagnes la construction d'une medecin qui forge ses reponses d'entretien en allemand pour le Spitalzentrum Biel (Suisse).

Question posee : "${question}"
Reponse de reference : "${reference}"
Ce que la candidate a construit : "${said}"

Analyse sa creation de facon structuree et bienveillante :

✅ CE QU'ELLE A BIEN CONSTRUIT (1-3 points forts, reconnais le travail)
⚠️ CE QUI MANQUE (elements importants absents de la reference)
❌ A AJUSTER (allemand a affiner, vocabulaire medical a preciser — si rien, dis-le)
🎯 A RENFORCER (un mot ou point de grammaire precis a integrer)
💡 VERSION ENRICHIE (1-2 phrases reformulees en enrichissant sa construction)

Commence TOUJOURS par reconnaitre ce que la candidate a produit. Ne dis jamais "correction" ou "c'est incorrect". Dis "ta construction", "ta version", "version enrichie". Sois concis, positif, oriente progression. Maximum 150 mots.`;
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
  // Gating: user MUST write before seeing model
  const [userAnswer, setUserAnswer] = useState("");
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Compute versions from artifacts for each question
  const getVersionsForQuestion = (qIdx: number) =>
    artifacts.filter(a => a.type === "interview_answer" && a.metadata?.questionIdx === qIdx)
      .sort((a, b) => a.date.localeCompare(b.date));

  const currentVersions = useMemo(() => getVersionsForQuestion(ii), [artifacts, ii]);

  // Count total unique questions answered
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

  const handleSubmitAnswer = () => {
    if (userAnswer.trim().length < 10) return;

    const versionNum = currentVersions.length + 1;
    const isImproved = versionNum > 1;

    // Create artifact
    if (addArtifact) {
      addArtifact({
        type: "interview_answer",
        sourceModule: "interview",
        content: userAnswer,
        xpEarned: isImproved ? XP_VALUES.INTERVIEW_IMPROVED : XP_VALUES.INTERVIEW_ANSWER,
        version: versionNum,
        metadata: { questionIdx: ii, question: IVW[ii].q },
      });
    }

    setAnswerSubmitted(true);
    celebrate("creation");

    if (isImproved) {
      toast("🔄 Version amelioree ! +15 XP", { description: `Version ${versionNum} de ta reponse` });
    } else {
      toast("💬 Reponse creee ! +25 XP", { description: "Ajoutee a ton Book d'entretien" });
    }
  };

  const handleAnalyse = () => {
    if (!transcript.trim()) return;
    const prompt = buildAnalysisPrompt(IVW[ii].q, IVW[ii].r, transcript);
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

  // BOOK VIEW
  if (showBook) {
    const allAnswers = artifacts
      .filter(a => a.type === "interview_answer")
      .sort((a, b) => b.date.localeCompare(a.date));

    return (
      <div className="space-y-4">
        <button onClick={() => setShowBook(false)} className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" /> Retour aux questions
        </button>
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-accent" /> Mon Book d'entretien
        </h2>
        <p className="text-sm text-muted-foreground">{allAnswers.length} reponse{allAnswers.length > 1 ? "s" : ""} creee{allAnswers.length > 1 ? "s" : ""}</p>

        {allAnswers.length === 0 ? (
          <div className="card-elevated rounded-2xl p-10 text-center">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-sm text-muted-foreground">Ton Book est vide. Cree ta premiere reponse pour commencer a le remplir.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allAnswers.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card-elevated rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">
                    Q{(a.metadata?.questionIdx as number) + 1} · {new Date(a.date).toLocaleDateString("fr-FR")}
                  </span>
                  {a.version && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
                      v{a.version}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-primary font-medium mb-1">{(a.metadata?.question as string) || ""}</p>
                <p className="text-xs text-foreground/85 leading-relaxed">{a.content}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">💼 Le Studio</h2>
          <p className="text-sm text-muted-foreground -mt-0.5">{IVW.length} reponses a forger</p>
        </div>
        <button
          onClick={() => setShowBook(true)}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/15 transition-all"
        >
          <BookOpen className="w-3.5 h-3.5" /> Mon Book
        </button>
      </div>

      {/* Stats — creation focused */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { v: answeredQuestions, l: "creees", cls: "text-amber-400" },
          { v: IVW.length - answeredQuestions, l: "a creer", cls: "text-info" },
          { v: avgRating, l: "moyenne", cls: "text-accent" },
        ].map((s, i) => (
          <div key={i} className="card-elevated rounded-2xl p-3 text-center">
            <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <Progress value={(answeredQuestions / IVW.length) * 100} className="h-1.5 bg-secondary rounded-full" />

      {/* Simulation mode */}
      {!simMode ? (
        <button onClick={startSim} className="w-full rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/15 p-3.5 text-sm font-semibold text-accent text-center transition-all hover:from-accent/15">
          🎯 Mode simulation chronometree (2min/question)
        </button>
      ) : (
        <div className="rounded-2xl bg-accent/8 border border-accent/15 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-accent">🎯 SIMULATION EN COURS</span>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-xl font-black ${simTimer < 30 ? "text-primary animate-pulse" : "text-accent"}`}>
                {Math.floor(simTimer / 60)}:{String(simTimer % 60).padStart(2, "0")}
              </span>
              <Button size="sm" variant="secondary" onClick={stopSim} className="rounded-xl">Stop</Button>
            </div>
          </div>
        </div>
      )}

      {/* Mission navigator */}
      <div className="flex gap-1.5 flex-wrap">
        {IVW.map((_, i) => {
          const hasAnswer = artifacts.some(a => a.type === "interview_answer" && a.metadata?.questionIdx === i);
          const vCount = getVersionsForQuestion(i).length;
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => { goToQuestion(i); if (simMode) setSimRunning(true); }}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative ${
                ii === i ? "bg-primary/15 border border-primary/30 text-primary" :
                hasAnswer ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                rat[i] ? "bg-success/10 border border-success/20 text-success" :
                "bg-secondary border border-border/40 text-muted-foreground"
              }`}
            >
              {i + 1}
              {vCount > 1 && (
                <span className="absolute -top-1 -right-1 text-[7px] bg-amber-500 text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                  {vCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Mission card */}
      <motion.div
        key={ii}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="card-elevated rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] uppercase tracking-[3px] text-primary/70">Question {ii + 1}/{IVW.length}</p>
          {currentVersions.length > 0 && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">
              v{currentVersions.length}
            </span>
          )}
        </div>
        <p className="text-lg font-bold leading-snug tracking-tight mb-4">{IVW[ii].q}</p>
        <div className="rounded-xl bg-accent/8 border border-accent/15 px-4 py-2.5">
          <p className="text-[11px] text-accent font-medium">💡 {IVW[ii].h}</p>
        </div>
      </motion.div>

      {/* GATING: User must write their answer FIRST */}
      <div className="card-elevated rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-foreground">
          ✍️ Redige ta reponse d'abord
        </p>
        <Textarea
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value)}
          placeholder="Construis ta reponse en allemand... (minimum 10 caracteres)"
          className="min-h-[100px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
          disabled={answerSubmitted && !showRecorder}
        />
        {!answerSubmitted ? (
          <Button
            onClick={handleSubmitAnswer}
            disabled={userAnswer.trim().length < 10}
            className="w-full rounded-xl gap-2 bg-amber-500 hover:bg-amber-600 text-white"
          >
            💬 Soumettre ma creation {currentVersions.length > 0 ? `(v${currentVersions.length + 1})` : ""} +{currentVersions.length > 0 ? "15" : "25"} XP
          </Button>
        ) : (
          <p className="text-[10px] text-amber-400 font-medium text-center">
            ✓ Reponse soumise — tu peux maintenant comparer avec la reference
          </p>
        )}
      </div>

      {/* Previous versions */}
      {currentVersions.length > 0 && (
        <button
          onClick={() => setShowPrevVersions(!showPrevVersions)}
          className="w-full text-left card-elevated rounded-2xl p-3 flex items-center justify-between"
        >
          <span className="text-xs font-medium text-muted-foreground">
            Mes versions precedentes ({currentVersions.length})
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
              <div key={v.id} className="rounded-xl bg-secondary/30 border border-border/20 p-3">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] font-bold text-amber-400">v{v.version || i + 1}</span>
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
              <Lock className="w-3.5 h-3.5" /> Compare avec ta creation
            </span>
          ) : (
            sa ? "Masquer" : "🔓 Compare avec ta creation"
          )}
        </Button>
        <Button
          onClick={() => { setShowRecorder(!showRecorder); if (!showRecorder) setTranscript(""); }}
          variant={showRecorder ? "default" : "secondary"}
          className="rounded-xl h-11 px-4"
        >
          🎙️
        </Button>
      </div>

      {!answerSubmitted && (
        <p className="text-[10px] text-muted-foreground text-center italic">
          Construis ta version d'abord — puis compare avec la reference
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
            <div className="card-elevated rounded-2xl p-4">
              <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">🎙️ Enregistre ta reponse</p>
              <VoiceRecorder label={`Question ${ii + 1}`} context={`Question ${ii + 1}: ${IVW[ii].q.slice(0, 40)}`} />
            </div>

            {/* Transcript + AI analysis */}
            <div className="card-elevated rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">
                🤖 Coach IA — ecris ce que tu as construit :
              </p>
              <Textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Tape ici ta reponse pour que le coach l'analyse..."
                className="min-h-[80px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleAnalyse}
                disabled={!transcript.trim() || isLoading}
                className="w-full rounded-xl gap-2"
              >
                {isLoading
                  ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyse en cours...</>
                  : <><Sparkles className="w-4 h-4" /> Analyser ma creation +30XP</>
                }
              </Button>
            </div>

            {/* AI error */}
            {aiError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">{aiError}</div>
            )}

            {/* AI feedback */}
            <AnimatePresence>
              {response && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-elevated rounded-2xl p-5 border-l-[3px] border-clinical/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-clinical" />
                      <p className="text-xs font-bold text-clinical uppercase tracking-wider">Coach d'atelier</p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copie" : "Copier"}
                    </button>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{response}</div>

                  {/* Smart redirects */}
                  {onNavigate && (
                    <div className="pt-2 border-t border-border/30 space-y-1.5">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Continuer a construire :</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(REDIRECT_MAP).map(([key, { tab, label }]) => (
                          <button
                            key={key}
                            onClick={() => onNavigate(tab)}
                            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 bg-primary/8 hover:bg-primary/12 rounded-lg px-2.5 py-1.5 transition-all border border-primary/15"
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

      {/* Model answer — only visible after submission */}
      {sa && answerSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="card-elevated rounded-2xl p-5 border-l-[3px] border-success/40">
            <p className="text-[10px] text-success font-bold uppercase tracking-wider mb-2">Reponse de reference</p>
            <p className="text-sm leading-relaxed text-foreground/85">{IVW[ii].r}</p>
          </div>

          {/* Self-validation */}
          <div className="card-elevated rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-3 text-center">🏆 Evalue ta creation :</p>
            <div className="flex gap-2 justify-center">
              {EMOJIS.map(r => (
                <motion.button
                  key={r.v}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setRating(ii, r.v); if (r.v >= 4) { addXp?.(XP_VALUES.RATING_HIGH); celebrate("creation"); } }}
                  className={`flex flex-col items-center rounded-xl p-2.5 border transition-all ${
                    rat[ii] === r.v ? "bg-success/15 border-success/30 glow-success" : "bg-secondary border-border/40"
                  }`}
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
  );
}
