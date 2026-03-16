import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, Sparkles, RotateCcw, FileText, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const DOCUMENTS = [
  { id: "befund", icon: "📋", title: "Befundbericht", desc: "Rapport d'examen médical", placeholder: "Befundbericht\nPatient: Herr Müller, 65J.\nUntersuchung: Duplexsonographie\nBefund: ..." },
  { id: "sbar", icon: "📝", title: "SBAR Übergabe", desc: "Transmission structurée", placeholder: "Situation: Ich übergebe Herrn Schmidt...\nBackground: Vorerkrankungen...\nAssessment: ...\nRecommendation: ..." },
  { id: "email", icon: "✉️", title: "Email médecin", desc: "Email professionnel à un collègue", placeholder: "Sehr geehrte Frau Dr. Attias-Widmer,\n\nich schreibe Ihnen bezüglich..." },
  { id: "motiv", icon: "💌", title: "Lettre de motivation", desc: "Bewerbungsschreiben", placeholder: "Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich um die Stelle als Assistenzärztin..." },
  { id: "arztbrief", icon: "🏥", title: "Arztbrief", desc: "Lettre de sortie patient", placeholder: "Sehr geehrte Kolleginnen und Kollegen,\n\nwir berichten über den stationären Aufenthalt von..." },
  { id: "konsil", icon: "🔬", title: "Konsilanforderung", desc: "Demande d'avis spécialisé", placeholder: "Konsilanforderung an: Angiologie\nPatient: ...\nFragestellung: ..." },
];

const KANZLER_PERSONA = `Tu es le Kanzler, chancelier de la documentation medicale. Tu evalues les documents avec la precision d'un redacteur en chef. Utilise des metaphores de chancellerie : "ce document est digne du sceau royal", "ta formulation officielle est precise", "ce passage necessite plus de rigueur protocolaire". Max 100 mots.`;

export function DocumentBuilder({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [selected, setSelected] = useState<typeof DOCUMENTS[0] | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = () => {
    if (!text.trim() || !selected) return;
    ask(`${KANZLER_PERSONA}\n\nType de document officiel: ${selected.title} (${selected.desc})\n\nDocument redige par la candidate:\n"${text}"\n\nEvalue le format, contenu, langue. Propose une version enrichie. Commence par les points forts.`, "script-builder");
    setSubmitted(true);
    addXp(25);
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
          background: "linear-gradient(145deg, hsl(210 70% 50% / 0.08), hsl(var(--card)), hsl(186 70% 50% / 0.04))",
          border: "1px solid hsl(210 70% 50% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(210 70% 50% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-blue-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotateY: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-blue-500/12 border border-blue-500/15 flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(210 70% 50% / 0.2)" }}
          >
            <FileText className="w-6 h-6 text-blue-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">La Chancellerie</h2>
            <p className="text-[10px] text-blue-400/50 font-medium">Bureau du Kanzler</p>
          </div>
        </div>
      </motion.div>

      {!selected ? (
        <div className="grid grid-cols-2 gap-3">
          {DOCUMENTS.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(d)}
              className="rounded-2xl bg-gradient-to-b from-info/10 to-transparent border border-border/40 p-5 text-left hover:border-info/30 transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{d.icon}</div>
              <div className="text-sm font-bold tracking-tight">{d.title}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{d.desc}</div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-gradient-to-r from-info/10 to-primary/5 border border-info/20 p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{selected.icon}</span>
              <span className="font-bold text-sm">{selected.title}</span>
              <span className="text-xs text-muted-foreground">— {selected.desc}</span>
            </div>
          </motion.div>

          <div className="card-elevated rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-info" />
              <p className="text-xs font-semibold text-muted-foreground">Ton document :</p>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={selected.placeholder}
              className="min-h-[160px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none font-mono"
              disabled={submitted && isLoading}
            />
            <div className="flex items-center justify-between mt-2 mb-3">
              <span className={`text-[10px] font-medium ${text.length > 0 ? "text-info/70" : "text-muted-foreground/40"}`}>
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

          {error && <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-400">{error}</div>}

          {response && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              className="room-3d rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(210 70% 50% / 0.06), hsl(var(--card)))",
                border: "1px solid hsl(210 70% 50% / 0.12)",
                boxShadow: "var(--shadow-3d-sm), 0 0 20px -6px hsl(210 70% 50% / 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <motion.div animate={{ rotateY: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity }}
                    className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-sm">
                    📜
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[2px]">Kanzler</p>
                    <p className="text-[9px] text-blue-400/40">Sceau officiel</p>
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
