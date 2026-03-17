import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, RotateCcw, Sparkles, Brain, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { TranslationToggle } from "@/components/translation";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";

const CASES = [
  {
    id: "case1",
    title: "Douleur au mollet",
    symptoms: [
      { de: "Wadenschmerzen beim Gehen seit 3 Wochen", fr: "Douleurs au mollet à la marche depuis 3 semaines" },
      { de: "Besserung in Ruhe", fr: "Amélioration au repos" },
      { de: "Raucher seit 30 Jahren", fr: "Fumeur depuis 30 ans" },
      { de: "Diabetes mellitus Typ 2", fr: "Diabète de type 2" },
    ],
    hint: "Artériel ? Veineux ? Neurologique ?",
  },
  {
    id: "case2",
    title: "Jambe enflée",
    symptoms: [
      { de: "Schwellung linkes Bein seit 2 Tagen", fr: "Gonflement de la jambe gauche depuis 2 jours" },
      { de: "Rötung und Überwärmung", fr: "Rougeur et chaleur locale" },
      { de: "Schmerzen in der Wade", fr: "Douleurs dans le mollet" },
      { de: "Langstreckenflug vor 5 Tagen", fr: "Vol long-courrier il y a 5 jours" },
    ],
    hint: "Pense aux facteurs de risque...",
  },
  {
    id: "case3",
    title: "Pied froid",
    symptoms: [
      { de: "Plötzlich kalter rechter Fuß seit 3 Stunden", fr: "Pied droit soudainement froid depuis 3 heures" },
      { de: "Kein Puls tastbar", fr: "Absence de pouls palpable" },
      { de: "Blass und schmerzhaft", fr: "Pâle et douloureux" },
      { de: "Vorhofflimmern bekannt", fr: "Fibrillation auriculaire connue" },
    ],
    hint: "Urgence ? Quel mécanisme ?",
  },
  {
    id: "case4",
    title: "Ulcère de jambe",
    symptoms: [
      { de: "Nicht heilende Wunde am Innenknöchel seit 6 Monaten", fr: "Plaie non cicatrisante à la malléole interne depuis 6 mois" },
      { de: "Bräunliche Hautverfärbung", fr: "Pigmentation brunâtre de la peau" },
      { de: "Schweregefühl abends", fr: "Sensation de lourdeur le soir" },
      { de: "Krampfadern seit 20 Jahren", fr: "Varices depuis 20 ans" },
    ],
    hint: "Artériel ou veineux ? Comment distinguer ?",
  },
  {
    id: "case5",
    title: "Pulsation abdominale",
    symptoms: [
      { de: "Zufallsbefund: pulsierender Tumor im Abdomen", fr: "Découverte fortuite : masse abdominale pulsatile" },
      { de: "75 Jahre, männlich", fr: "75 ans, sexe masculin" },
      { de: "Hypertonus, Raucher", fr: "Hypertension artérielle, fumeur" },
      { de: "Keine Beschwerden", fr: "Aucune plainte / asymptomatique" },
    ],
    hint: "Taille ? Seuil opératoire ?",
  },
];

const CHEFARZT_PERSONA = `Tu es le Chefarzt, directeur du service de medecine vasculaire. Tu evalues les diagnostics avec la rigueur d'un chef de service. Utilise des metaphores medicales : "ton raisonnement est methodique", "n'oublie pas le diagnostic differentiel", "excellente demarche clinique". Sois bienveillant mais exigeant. Max 100 mots.`;

export function DiagnosticBuilder({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [currentCase, setCurrentCase] = useState<typeof CASES[0] | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showFr: showTr, toggleFr } = useTranslationPreference();

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      toast.success("Copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const pickCase = (c?: typeof CASES[0]) => {
    const selected = c || CASES[Math.floor(Math.random() * CASES.length)];
    setCurrentCase(selected);
    setDiagnosis("");
    setSubmitted(false);
    reset();
  };

  const handleSubmit = () => {
    if (!diagnosis.trim() || !currentCase) return;
    const prompt = `${CHEFARZT_PERSONA}\n\nSymptome des Patienten:\n${currentCase.symptoms.map(s => `- ${s.de}`).join("\n")}\n\nVerdachtsdiagnose der Kandidatin:\n"${diagnosis}"\n\nBewerte die Diagnose und das klinische Reasoning. Commence par reconnaitre les points forts.`;
    ask(prompt, "diagnostic-builder");
    setSubmitted(true);
    addXp(25);
    celebrate("grammar");
  };

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(346 77% 50% / 0.08), hsl(var(--card)), hsl(210 70% 50% / 0.04))",
          border: "1px solid hsl(346 77% 50% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(346 77% 50% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-rose-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-rose-500/12 border border-rose-500/15 flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(346 77% 50% / 0.2)" }}
          >
            <Brain className="w-6 h-6 text-rose-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Salle de Diagnostic</h2>
            <p className="text-[10px] text-rose-400/50 font-medium">Bureau du Chefarzt</p>
          </div>
        </div>
      </motion.div>

      {!currentCase ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Choisis un cas ou tire au hasard :</p>
          <div className="space-y-2">
            {CASES.map((c, i) => (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => pickCase(c)}
                className="w-full rounded-2xl card-elevated p-4 text-left flex items-center gap-3 hover:border-clinical/30 transition-all"
              >
                <Brain className="w-5 h-5 text-clinical shrink-0" />
                <div>
                  <span className="text-sm font-bold">{c.title}</span>
                  <span className="text-[10px] text-muted-foreground ml-2">{c.symptoms.length} symptômes</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Symptoms */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-br from-clinical/12 to-info/6 border border-clinical/20 p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] uppercase tracking-[3px] text-clinical/70">Symptômes du patient</p>
              <TranslationToggle active={showTr} onToggle={toggleFr} />
            </div>
            <div className="space-y-2">
              {currentCase.symptoms.map((s, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-start gap-2">
                    <span className="text-clinical text-xs mt-0.5">•</span>
                    <span className="text-sm font-medium">{s.de}</span>
                  </div>
                  <AnimatePresence>
                    {showTr && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden pl-4"
                      >
                        <span className="text-xs text-primary/70">🇫🇷 {s.fr}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-background/30 p-2.5">
              <p className="text-[11px] text-muted-foreground">💡 {currentCase.hint}</p>
            </div>
          </motion.div>

          {/* Diagnosis input */}
          <div className="card-elevated rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              🎯 Ta Verdachtsdiagnose + Reasoning :
            </p>
            <Textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Verdacht auf... Begründung: Die Symptome sprechen für... Differentialdiagnosen: ..."
              className="min-h-[100px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
              disabled={submitted && isLoading}
            />
            <div className="flex justify-end mt-1 mb-1">
              <span className={`text-[10px] font-medium ${diagnosis.length > 0 ? "text-clinical/70" : "text-muted-foreground/40"}`}>
                {diagnosis.length} caractères
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <Button onClick={handleSubmit} disabled={!diagnosis.trim() || isLoading} className="flex-1 rounded-xl gap-2">
                {isLoading ? <><Sparkles className="w-4 h-4 animate-spin" /> Évaluation...</> : <><Send className="w-4 h-4" /> Soumettre</>}
              </Button>
              <Button variant="secondary" onClick={() => pickCase()} className="rounded-xl gap-1.5">
                <RotateCcw className="w-4 h-4" /> Autre cas
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-400">{error}</div>
          )}

          {response && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className="room-3d rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(346 77% 50% / 0.06), hsl(var(--card)))",
                border: "1px solid hsl(346 77% 50% / 0.12)",
                boxShadow: "var(--shadow-3d-sm), 0 0 20px -6px hsl(346 77% 50% / 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}
                    className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-sm">
                    🩺
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-[2px]">Chefarzt</p>
                    <p className="text-[9px] text-rose-400/40">Evaluation diagnostique</p>
                  </div>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors bg-secondary/60 hover:bg-secondary rounded-lg px-2.5 py-1.5"
                >
                  {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copié" : "Copier"}
                </button>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{response}</div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
