import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { SCENARIOS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, RotateCcw, Sparkles, ClipboardList, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = ["Anamnese", "Klinische Untersuchung", "Diagnose", "Therapie"];

export function CaseCreator({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
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

  const handleSelect = (i: number) => {
    setSelectedCase(i);
    setSections({});
    setSubmitted(false);
    reset();
  };

  const updateSection = (key: string, value: string) => {
    setSections(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (selectedCase === null) return;
    const sc = SCENARIOS[selectedCase];
    const caseText = SECTIONS.map(s => `${s}:\n${sections[s] || "(nicht ausgefüllt)"}`).join("\n\n");
    const prompt = `Klinischer Fall: ${sc.title}\nSituation: ${sc.sit}\n\nPatientenakte der Studentin:\n${caseText}\n\nBewerte den Fall.`;
    ask(prompt, "case-creator");
    setSubmitted(true);
    addXp(30);
    celebrate("task");
  };

  const filledCount = SECTIONS.filter(s => (sections[s] || "").trim().length > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🧾</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Créer ton cas patient</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Rédige un dossier patient complet en allemand</p>
        </div>
      </div>

      {selectedCase === null ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Choisis un cas clinique :</p>
          <div className="grid grid-cols-2 gap-3">
            {SCENARIOS.map((sc, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(i)}
                className="rounded-2xl card-elevated p-4 text-left hover:border-grammar/30 transition-all"
              >
                <div className="text-2xl mb-2">{sc.icon}</div>
                <div className="text-sm font-bold">{sc.title}</div>
                <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{sc.sit.slice(0, 60)}...</div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Case context */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl bg-gradient-to-r from-grammar/10 to-info/5 border border-grammar/20 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{SCENARIOS[selectedCase].icon}</span>
              <span className="font-bold text-sm">{SCENARIOS[selectedCase].title}</span>
            </div>
            <p className="text-xs text-foreground/80">{SCENARIOS[selectedCase].sit}</p>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {SCENARIOS[selectedCase].vocab.map((v, i) => (
                <span key={i} className="text-[10px] bg-grammar/10 text-grammar px-2 py-0.5 rounded-full border border-grammar/20">{v}</span>
              ))}
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-3">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card-elevated rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardList className="w-3.5 h-3.5 text-grammar" />
                  <p className="text-xs font-bold">{section}</p>
                  {(sections[section] || "").trim() && <span className="text-[10px] text-success">✓</span>}
                </div>
                <Textarea
                  value={sections[section] || ""}
                  onChange={(e) => updateSection(section, e.target.value)}
                  placeholder={
                    section === "Anamnese" ? "Der Patient berichtet über..." :
                    section === "Klinische Untersuchung" ? "Bei der Untersuchung zeigt sich..." :
                    section === "Diagnose" ? "Verdacht auf..." :
                    "Ich empfehle..."
                  }
                  className="min-h-[60px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
                  disabled={submitted && isLoading}
                />
              </motion.div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={filledCount === 0 || isLoading} className="flex-1 rounded-xl gap-2">
              {isLoading ? <><Sparkles className="w-4 h-4 animate-spin" /> Évaluation...</> : <><Send className="w-4 h-4" /> Soumettre ({filledCount}/4)</>}
            </Button>
            <Button variant="secondary" onClick={() => setSelectedCase(null)} className="rounded-xl gap-1.5">
              <RotateCcw className="w-4 h-4" /> Autre
            </Button>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">{error}</div>
          )}

          {response && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated rounded-2xl p-5 border-l-[3px] border-grammar/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-grammar" />
                  <p className="text-xs font-bold text-grammar uppercase tracking-wider">Oberarzt IA</p>
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
