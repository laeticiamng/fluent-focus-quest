import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const PROMPTS = [
  { id: "identite", icon: "🪪", title: "Mon identité médicale", prompt: "Décris-toi en tant que médecin suisse en allemand : spécialité, lieu, style, valeurs.", placeholder: "Ich bin Angiologin am Spitalzentrum Biel. Ich spezialisiere mich auf..." },
  { id: "vision", icon: "🔭", title: "Ma vision à 5 ans", prompt: "Décris ta vision de carrière en Suisse dans 5 ans, en allemand.", placeholder: "In fünf Jahren möchte ich meinen FMH in Angiologie abgeschlossen haben..." },
  { id: "valeurs", icon: "💎", title: "Mes valeurs médicales", prompt: "Quelles sont tes valeurs en tant que médecin ? Écris-les en allemand.", placeholder: "Meine wichtigsten Werte als Ärztin sind..." },
  { id: "patient", icon: "🤝", title: "Mon médecin idéal", prompt: "Décris le médecin que tu veux devenir pour tes patients, en allemand.", placeholder: "Für meine Patienten möchte ich eine Ärztin sein, die..." },
];

const ORACLE_PERSONA = `Tu es l'Oracle du Parcours, guide spirituel des medecins en devenir. Tu analyses les visions de carriere avec sagesse. Utilise des metaphores de voyage : "ta boussole pointe dans la bonne direction", "ce chemin est trace avec clarte", "ta vision est lumineuse". Max 80 mots.`;

export function IdentityBuilder({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [selected, setSelected] = useState<typeof PROMPTS[0] | null>(null);
  const [text, setText] = useState("");
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

  const handleSubmit = () => {
    if (!text.trim() || !selected) return;
    ask(`${ORACLE_PERSONA}\n\nTheme de reflexion: ${selected.title}\nConsigne: ${selected.prompt}\n\nTexte de la candidate:\n"${text}"\n\nCorrige l'allemand, enrichis le style. Propose une version plus professionnelle. Commence par valoriser sa vision.`, "script-builder");
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

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(142 71% 45% / 0.08), hsl(var(--card)), hsl(38 92% 50% / 0.04))",
          border: "1px solid hsl(142 71% 45% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(142 71% 45% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -3, 0], rotateZ: [-2, 2, -2] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-emerald-500/12 border border-emerald-500/15 flex items-center justify-center text-2xl"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(142 71% 45% / 0.2)" }}
          >
            🔮
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Le Miroir de l'Oracle</h2>
            <p className="text-[10px] text-emerald-400/50 font-medium">Chambre de Reflexion</p>
          </div>
        </div>
      </motion.div>

      {!selected ? (
        <div className="grid grid-cols-2 gap-3">
          {PROMPTS.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(p)}
              className="rounded-2xl bg-gradient-to-b from-success/8 to-transparent border border-border/40 p-5 text-left hover:border-success/30 transition-all"
            >
              <div className="text-2xl mb-2">{p.icon}</div>
              <div className="text-sm font-bold tracking-tight">{p.title}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{p.prompt.slice(0, 50)}...</div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-gradient-to-r from-success/10 to-primary/5 border border-success/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{selected.icon}</span>
              <span className="font-bold text-sm">{selected.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">{selected.prompt}</p>
          </motion.div>

          <div className="card-elevated rounded-2xl p-5">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={selected.placeholder}
              className="min-h-[120px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
              disabled={submitted && isLoading}
            />
            <div className="flex justify-end mt-1 mb-1">
              <span className={`text-[10px] font-medium ${text.length > 0 ? "text-success/70" : "text-muted-foreground/40"}`}>
                {text.length} caractères
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              <Button onClick={handleSubmit} disabled={!text.trim() || isLoading} className="flex-1 rounded-xl gap-2">
                {isLoading ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyse...</> : <><Send className="w-4 h-4" /> Soumettre</>}
              </Button>
              <Button variant="secondary" onClick={handleReset} className="rounded-xl">Autre</Button>
            </div>
          </div>

          {error && <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-400">{error}</div>}
          {response && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className="room-3d rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(142 71% 45% / 0.06), hsl(var(--card)))",
                border: "1px solid hsl(142 71% 45% / 0.12)",
                boxShadow: "var(--shadow-3d-sm), 0 0 20px -6px hsl(142 71% 45% / 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}
                    className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm">
                    🔮
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">Oracle</p>
                    <p className="text-[9px] text-emerald-400/40">Vision eclairee</p>
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
