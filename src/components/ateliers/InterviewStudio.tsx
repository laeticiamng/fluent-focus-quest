import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { IVW } from "@/data/content";
import { useAICoach } from "@/hooks/useAICoach";
import { useCelebration } from "@/components/CelebrationProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Shuffle, ChevronDown, ChevronUp, Sparkles, Copy, Check, Zap } from "lucide-react";
import { toast } from "sonner";

const REGISSEUR_PERSONA = `Tu es le Regisseur, maitre de la mise en scene des entretiens medicaux. Tu analyses les performances avec l'oeil d'un directeur artistique exigeant mais bienveillant. Utilise des metaphores de theatre : "ta replique porte bien", "cette scene manque de conviction", "excellent jeu de scene".`;

function buildAnalysisPrompt(question: string, reference: string, said: string) {
  return `${REGISSEUR_PERSONA}

Tu es un coach médical bienveillant et expert. Une médecin se prépare à son entretien en allemand pour le Spitalzentrum Biel (Suisse).

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

export function InterviewStudio({ addXp }: { addXp: (n: number) => void }) {
  const { response, isLoading, error: aiError, ask, reset } = useAICoach();
  const { celebrate } = useCelebration();

  const [questionIdx, setQuestionIdx] = useState<number | null>(null);
  const [showModel, setShowModel] = useState(false);
  const [versions, setVersions] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [analysisSubmitted, setAnalysisSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const pickRandom = () => {
    setQuestionIdx(Math.floor(Math.random() * IVW.length));
    resetState();
  };

  const pickQuestion = (i: number) => {
    setQuestionIdx(i);
    resetState();
  };

  const resetState = () => {
    setShowModel(false);
    setVersions(0);
    setTranscript("");
    setAnalysisSubmitted(false);
    reset();
  };

  const handleAnalyse = () => {
    if (!transcript.trim() || questionIdx === null) return;
    const q = IVW[questionIdx];
    const prompt = buildAnalysisPrompt(q.q, q.r, transcript);
    ask(prompt, "interview-analysis");
    setAnalysisSubmitted(true);
    addXp(30);
    celebrate("grammar");
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      toast.success("Copié !");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const q = questionIdx !== null ? IVW[questionIdx] : null;

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(32 95% 55% / 0.08), hsl(var(--card)), hsl(270 60% 55% / 0.04))",
          border: "1px solid hsl(32 95% 55% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(32 95% 55% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotateY: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-amber-500/12 border border-amber-500/15 flex items-center justify-center text-2xl"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(32 95% 55% / 0.2)" }}
          >
            🎙
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Le Plateau</h2>
            <p className="text-[10px] text-amber-400/50 font-medium">Scene du Regisseur</p>
          </div>
        </div>
      </motion.div>

      {!q ? (
        <div className="space-y-4">
          {/* Random mission card */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={pickRandom}
            className="w-full rounded-2xl bg-gradient-to-br from-accent/15 via-card to-warning/10 border border-accent/20 p-8 text-center"
          >
            <Shuffle className="w-8 h-8 mx-auto mb-3 text-accent" />
            <p className="text-lg font-bold">Mission aléatoire</p>
            <p className="text-xs text-muted-foreground mt-1">Entraîne-toi comme le jour J — imprévu inclus</p>
          </motion.button>

          <p className="text-xs text-muted-foreground">Ou choisis ta mission :</p>
          <div className="space-y-2">
            {IVW.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => pickQuestion(i)}
                className="w-full rounded-xl card-elevated p-3 text-left hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-accent/60 w-5 shrink-0">#{i + 1}</span>
                  <span className="text-sm font-bold flex-1">{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors rotate-[-90deg]" />
                </div>
                <span className="text-[10px] text-muted-foreground ml-7">{item.h}</span>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mission card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-accent/12 to-warning/8 border border-accent/20 p-6 text-center"
          >
            <p className="text-[10px] uppercase tracking-[3px] text-accent/70 mb-2">Mission #{questionIdx! + 1}</p>
            <p className="text-lg sm:text-xl font-black tracking-tight">{q.q}</p>
            <p className="text-xs text-muted-foreground mt-2">💡 {q.h}</p>
          </motion.div>

          {/* Recording zone */}
          <div className="card-elevated rounded-2xl p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground">
              🎙 Enregistre ta réponse, puis écoute et analyse :
            </p>
            <VoiceRecorder label={`Mission: ${q.q}`} context={q.q} />

            {/* Version counter */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => { setVersions(v => v + 1); addXp(10); }}
                className="text-xs text-primary font-semibold hover:underline"
              >
                ✅ Marquer version {versions + 1}
              </button>
              {versions > 0 && (
                <span className="text-[10px] text-success font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3" />{versions} version{versions > 1 ? "s" : ""} enregistrée{versions > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* AI analysis */}
          <div className="card-elevated rounded-2xl p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">
              🤖 Analyse IA — écris ce que tu as dit :
            </p>
            <Textarea
              value={transcript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Tape ici ta réponse (en allemand si possible) pour que l'IA l'analyse et te dise exactement ce qui manque..."
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
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-400">{aiError}</div>
          )}

          {/* AI feedback */}
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated rounded-2xl p-5 border-l-[3px] border-clinical/40"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <motion.div animate={{ rotateY: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}
                      className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-sm">
                      🎬
                    </motion.div>
                    <div>
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-[2px]">Regisseur</p>
                      <p className="text-[9px] text-amber-400/40">Analyse de scene</p>
                    </div>
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Model answer */}
          <div className="card-elevated rounded-2xl p-5">
            <button
              onClick={() => setShowModel(!showModel)}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground w-full"
            >
              <span>📝 Réponse modèle</span>
              {showModel ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
            </button>
            <AnimatePresence>
              {showModel && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl bg-success/8 border border-success/15 p-4">
                    <p className="text-sm leading-relaxed">{q.r}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={pickRandom}
            className="text-xs text-primary font-semibold hover:underline"
          >
            → Autre mission
          </button>
        </div>
      )}
    </div>
  );
}
