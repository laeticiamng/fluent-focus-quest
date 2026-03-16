import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, RotateCcw, Sparkles, FileText, Copy, Check, PenTool } from "lucide-react";
import { toast } from "sonner";

const SCRIBE_PERSONA = `Tu es le Scribe Royal, gardien des protocoles medicaux. Tu analyses les scripts avec l'oeil d'un redacteur professionnel hospitalier. Utilise des metaphores d'ecriture : "ce paragraphe est cisele", "ta plume manque de precision", "excellente formulation — digne d'un Arztbrief professionnel".`;

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
    const prompt = `${SCRIBE_PERSONA}\n\nType de parchemin: ${selected.title}\nConsigne: ${selected.prompt}\n\nTexte de l'apprenti scribe:\n"${text}"\n\nAnalyse ce script : structure, langue, contenu medical. Propose une version enrichie. Sois concis (max 100 mots).`;
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
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(270 60% 55% / 0.08), hsl(var(--card)), hsl(270 40% 35% / 0.04))",
          border: "1px solid hsl(270 60% 55% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(270 60% 55% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-violet-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotateY: [0, 8, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-violet-500/12 border border-violet-500/15 flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(270 60% 55% / 0.2)" }}
          >
            <PenTool className="w-6 h-6 text-violet-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Le Scriptorium</h2>
            <p className="text-[10px] text-violet-400/50 font-medium">Salle du Scribe Royal</p>
          </div>
        </div>
      </motion.div>

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
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-400">{error}</div>
          )}

          {response && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className="room-3d rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(270 60% 55% / 0.06), hsl(var(--card)))",
                border: "1px solid hsl(270 60% 55% / 0.12)",
                boxShadow: "var(--shadow-3d-sm), 0 0 20px -6px hsl(270 60% 55% / 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ rotateY: [0, 8, -8, 0] }} transition={{ duration: 5, repeat: Infinity }}
                    className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-sm">
                    ✍️
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-[2px]">Scribe Royal</p>
                    <p className="text-[9px] text-violet-400/40">Verdict du parchemin</p>
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
