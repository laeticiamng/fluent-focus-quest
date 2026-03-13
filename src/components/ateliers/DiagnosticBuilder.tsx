import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, RotateCcw, Sparkles, Brain, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const CASES = [
  {
    id: "case1",
    title: "Douleur au mollet",
    symptoms: ["Wadenschmerzen beim Gehen seit 3 Wochen", "Besserung in Ruhe", "Raucher seit 30 Jahren", "Diabetes mellitus Typ 2"],
    hint: "Artériel ? Veineux ? Neurologique ?",
  },
  {
    id: "case2",
    title: "Jambe enflée",
    symptoms: ["Schwellung linkes Bein seit 2 Tagen", "Rötung und Überwärmung", "Schmerzen in der Wade", "Langstreckenflug vor 5 Tagen"],
    hint: "Pense aux facteurs de risque...",
  },
  {
    id: "case3",
    title: "Pied froid",
    symptoms: ["Plötzlich kalter rechter Fuß seit 3 Stunden", "Kein Puls tastbar", "Blass und schmerzhaft", "Vorhofflimmern bekannt"],
    hint: "Urgence ? Quel mécanisme ?",
  },
  {
    id: "case4",
    title: "Ulcère de jambe",
    symptoms: ["Nicht heilende Wunde am Innenknöchel seit 6 Monaten", "Bräunliche Hautverfärbung", "Schweregefühl abends", "Krampfadern seit 20 Jahren"],
    hint: "Artériel ou veineux ? Comment distinguer ?",
  },
  {
    id: "case5",
    title: "Pulsation abdominale",
    symptoms: ["Zufallsbefund: pulsierender Tumor im Abdomen", "75 Jahre, männlich", "Hypertonus, Raucher", "Keine Beschwerden"],
    hint: "Taille ? Seuil opératoire ?",
  },
];

export function DiagnosticBuilder({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [currentCase, setCurrentCase] = useState<typeof CASES[0] | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

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
    const prompt = `Symptome des Patienten:\n${currentCase.symptoms.map(s => `- ${s}`).join("\n")}\n\nVerdachtsdiagnose der Studentin:\n"${diagnosis}"\n\nBewerte die Diagnose und das klinische Reasoning.`;
    ask(prompt, "diagnostic-builder");
    setSubmitted(true);
    addXp(25);
    celebrate("grammar");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🧠</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Diagnostic Builder</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Construis ton raisonnement clinique en allemand</p>
        </div>
      </div>

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
            <p className="text-[10px] uppercase tracking-[3px] text-clinical/70 mb-3">Symptômes du patient</p>
            <div className="space-y-2">
              {currentCase.symptoms.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-clinical text-xs mt-0.5">•</span>
                  <span className="text-sm font-medium">{s}</span>
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
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">{error}</div>
          )}

          {response && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated rounded-2xl p-5 border-l-[3px] border-clinical/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-clinical" />
                  <p className="text-xs font-bold text-clinical uppercase tracking-wider">Oberarzt IA</p>
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
