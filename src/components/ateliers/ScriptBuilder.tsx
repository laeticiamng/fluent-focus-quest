import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, RotateCcw, Sparkles, FileText, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  {
    id: "patient-pres",
    title: "Présentation patient",
    icon: "🩺",
    prompt: "Écris une présentation de patient pour une Übergabe (transmission).",
    placeholder: "Guten Tag, ich möchte Ihnen den Patienten vorstellen. Herr Müller, 65 Jahre alt...",
  },
  {
    id: "befund",
    title: "Befundbericht",
    icon: "📋",
    prompt: "Rédige un compte rendu d'examen (Befundbericht) après une écho-doppler.",
    placeholder: "Befundbericht — Duplexsonographie\nPatient: ...\nBefund: ...",
  },
  {
    id: "uebergabe",
    title: "Übergabe SBAR",
    icon: "📝",
    prompt: "Fais une transmission SBAR pour un patient hospitalisé.",
    placeholder: "Situation: Ich übergebe Herrn...\nBackground: Vorerkrankungen...",
  },
  {
    id: "selbstvorstellung",
    title: "Se présenter",
    icon: "👋",
    prompt: "Présente-toi comme médecin lors de ton premier jour au Gefäßzentrum Biel.",
    placeholder: "Guten Tag, ich bin Dr. Motongane. Ich bin die neue Assistenzärztin...",
  },
];

export function ScriptBuilder({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [selected, setSelected] = useState<typeof TEMPLATES[0] | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    if (!text.trim() || !selected) return;
    const prompt = `Type de script: ${selected.title}\nConsigne: ${selected.prompt}\n\nTexte de l'étudiante:\n"${text}"\n\nCorrige et améliore ce script médical.`;
    ask(prompt, "script-builder");
    setSubmitted(true);
    addXp(20);
    celebrate("task");
  };

  const handleReset = () => {
    setSelected(null);
    setText("");
    setSubmitted(false);
    reset();
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response).then(() => {
      setCopied(true);
      toast.success("Copié dans le presse-papier !");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">✍️</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Script Builder</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Construis tes scripts médicaux en allemand</p>
        </div>
      </div>

      {!selected ? (
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map((t, i) => (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(t)}
              className="rounded-2xl bg-gradient-to-b from-accent/10 to-transparent border border-border/40 p-5 text-left hover:border-accent/30 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{t.icon}</div>
              <div className="text-sm font-bold tracking-tight">{t.title}</div>
              <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{t.prompt}</div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-r from-accent/10 to-warning/5 border border-accent/20 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{selected.icon}</span>
              <span className="font-bold text-sm">{selected.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">{selected.prompt}</p>
          </motion.div>

          <div className="card-elevated rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-accent" />
              <p className="text-xs font-semibold text-muted-foreground">Ton script :</p>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={selected.placeholder}
              className="min-h-[140px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
              disabled={submitted && isLoading}
            />
            <div className="flex items-center justify-between mt-2 mb-3">
              <span className={`text-[10px] font-medium ${text.length > 0 ? "text-accent/70" : "text-muted-foreground/40"}`}>
                {text.length} caractères
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!text.trim() || isLoading} className="flex-1 rounded-xl gap-2">
                {isLoading ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyse...</> : <><Send className="w-4 h-4" /> Soumettre</>}
              </Button>
              <Button variant="secondary" onClick={handleReset} className="rounded-xl gap-1.5">
                <RotateCcw className="w-4 h-4" /> Autre
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">{error}</div>
          )}

          {response && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated rounded-2xl p-5 border-l-[3px] border-accent/40">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <p className="text-xs font-bold text-accent uppercase tracking-wider">Coach IA</p>
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
