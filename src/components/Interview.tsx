import { useState, useEffect, useRef } from "react";
import { IVW } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useAICoach } from "@/hooks/useAICoach";
import { useCelebration } from "@/components/CelebrationProvider";
import { Sparkles, Copy, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Tab = "vocab" | "gram" | "atelier" | "tools";

interface InterviewProps {
  rat: Record<number, number>;
  setRating: (qi: number, r: number) => void;
  addXp?: (n: number) => void;
  onNavigate?: (tab: Tab) => void;
}

const EMOJIS = [
  { v: 1, e: "😰", l: "Raté" },
  { v: 2, e: "😕", l: "Fragile" },
  { v: 3, e: "🙂", l: "Passable" },
  { v: 4, e: "😊", l: "Solide" },
  { v: 5, e: "🔥", l: "Maîtrisé" },
];

const REDIRECT_MAP: Record<string, { tab: Tab; label: string }> = {
  vocab: { tab: "vocab", label: "Vocabulaire médical" },
  gram:  { tab: "gram",  label: "Grammaire" },
  atelier: { tab: "atelier", label: "Ateliers" },
  tools: { tab: "tools", label: "Outils" },
};

function buildAnalysisPrompt(question: string, reference: string, said: string) {
  return `Tu es un coach médical bienveillant et expert. Une médecin se prépare à son entretien en allemand pour le Spitalzentrum Biel (Suisse).

Question posée : "${question}"
Réponse de référence : "${reference}"
Ce que la candidate a dit : "${said}"

Analyse sa réponse de façon structurée et concise :

✅ CE QU'ELLE A BIEN DIT (1-3 points forts, sois encourageant)
⚠️ CE QUI MANQUE (points importants absents de la réponse de référence)
❌ ERREURS (allemand incorrect, vocabulaire médical inexact — si aucune erreur, dis-le)
🎯 À TRAVAILLER (un mot ou point de grammaire précis à mémoriser)
💡 VERSION AMÉLIORÉE (1-2 phrases reformulées correctement en allemand)

Sois concis, positif, orienté progression. Maximum 150 mots.`;
}

export function Interview({ rat, setRating, addXp, onNavigate }: InterviewProps) {
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
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

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
  };

  const startSim = () => { setSimMode(true); goToQuestion(0); setSimRunning(true); };
  const stopSim = () => { setSimMode(false); setSimRunning(false); setSimTimer(120); };

  const handleAnalyse = () => {
    if (!transcript.trim()) return;
    const prompt = buildAnalysisPrompt(IVW[ii].q, IVW[ii].r, transcript);
    ask(prompt, "interview-analysis");
    setAnalysisSubmitted(true);
    addXp?.(30);
    celebrate("grammar");
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      toast.success("Copié !");
      setTimeout(() => (() => setCopied(false))(), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight">💼 Entretien</h2>
        <p className="text-sm text-muted-foreground -mt-0.5">{IVW.length} missions à maîtriser</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { v: ratedCount, l: "validées", cls: "text-success" },
          { v: IVW.length - ratedCount, l: "restantes", cls: "text-info" },
          { v: avgRating, l: "moyenne", cls: "text-accent" },
        ].map((s, i) => (
          <div key={i} className="card-elevated rounded-2xl p-3 text-center">
            <div className={`text-xl font-black ${s.cls}`}>{s.v}</div>
            <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>

      <Progress value={(ratedCount / IVW.length) * 100} className="h-1.5 bg-secondary rounded-full" />

      {/* Simulation mode */}
      {!simMode ? (
        <button onClick={startSim} className="w-full rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/15 p-3.5 text-sm font-semibold text-accent text-center transition-all hover:from-accent/15">
          🎯 Mode simulation chronométrée (2min/mission)
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
        {IVW.map((_, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => { goToQuestion(i); if (simMode) setSimRunning(true); }}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              ii === i ? "bg-primary/15 border border-primary/30 text-primary" :
              rat[i] ? "bg-success/10 border border-success/20 text-success" :
              "bg-secondary border border-border/40 text-muted-foreground"
            }`}
          >{i + 1}</motion.button>
        ))}
      </div>

      {/* Mission card */}
      <motion.div
        key={ii}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="card-elevated rounded-2xl p-5"
      >
        <p className="text-[9px] uppercase tracking-[3px] text-primary/70 mb-2">Mission {ii + 1}/{IVW.length}</p>
        <p className="text-lg font-bold leading-snug tracking-tight mb-4">{IVW[ii].q}</p>
        <div className="rounded-xl bg-accent/8 border border-accent/15 px-4 py-2.5">
          <p className="text-[11px] text-accent font-medium">💡 {IVW[ii].h}</p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-2.5">
        <Button
          onClick={() => setSa(!sa)}
          className="flex-1 rounded-xl h-11"
          variant={sa ? "secondary" : "default"}
        >
          {sa ? "Masquer" : "🔓 Voir la réponse modèle"}
        </Button>
        <Button
          onClick={() => { setShowRecorder(!showRecorder); if (!showRecorder) setTranscript(""); }}
          variant={showRecorder ? "default" : "secondary"}
          className="rounded-xl h-11 px-4"
        >
          🎙️
        </Button>
      </div>

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
              <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">🎙️ Enregistre ta réponse</p>
              <VoiceRecorder label={`Mission ${ii + 1}`} context={`Mission ${ii + 1}: ${IVW[ii].q.slice(0, 40)}`} />
            </div>

            {/* Transcript + AI analysis */}
            <div className="card-elevated rounded-2xl p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">
                🤖 Analyse IA — écris ce que tu as dit :
              </p>
              <Textarea
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Tape ici ta réponse (en allemand si possible) pour que l'IA l'analyse..."
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
                  : <><Sparkles className="w-4 h-4" /> Analyser ma réponse +30XP</>
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
                      <p className="text-xs font-bold text-clinical uppercase tracking-wider">Coach IA</p>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-secondary/60 hover:bg-secondary rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copié" : "Copier"}
                    </button>
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{response}</div>

                  {/* Smart redirects */}
                  {onNavigate && (
                    <div className="pt-2 border-t border-border/30 space-y-1.5">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Continuer sur :</p>
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

      {/* Model answer */}
      {sa && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="card-elevated rounded-2xl p-5 border-l-[3px] border-success/40">
            <p className="text-[10px] text-success font-bold uppercase tracking-wider mb-2">Réponse modèle</p>
            <p className="text-sm leading-relaxed text-foreground/85">{IVW[ii].r}</p>
          </div>

          {/* Self-validation */}
          <div className="card-elevated rounded-2xl p-4">
            <p className="text-xs text-muted-foreground mb-3 text-center">🏆 Valide ce niveau :</p>
            <div className="flex gap-2 justify-center">
              {EMOJIS.map(r => (
                <motion.button
                  key={r.v}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setRating(ii, r.v); if (r.v >= 4) { addXp?.(20); celebrate("grammar"); } }}
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
