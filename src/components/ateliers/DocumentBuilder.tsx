import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, Sparkles, RotateCcw, FileText } from "lucide-react";

const DOCUMENTS = [
  { id: "befund", icon: "📋", title: "Befundbericht", desc: "Rapport d'examen médical", placeholder: "Befundbericht\nPatient: Herr Müller, 65J.\nUntersuchung: Duplexsonographie\nBefund: ..." },
  { id: "sbar", icon: "📝", title: "SBAR Übergabe", desc: "Transmission structurée", placeholder: "Situation: Ich übergebe Herrn Schmidt...\nBackground: Vorerkrankungen...\nAssessment: ...\nRecommendation: ..." },
  { id: "email", icon: "✉️", title: "Email médecin", desc: "Email professionnel à un collègue", placeholder: "Sehr geehrte Frau Dr. Attias-Widmer,\n\nich schreibe Ihnen bezüglich..." },
  { id: "motiv", icon: "💌", title: "Lettre de motivation", desc: "Bewerbungsschreiben", placeholder: "Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich um die Stelle als Assistenzärztin..." },
  { id: "arztbrief", icon: "🏥", title: "Arztbrief", desc: "Lettre de sortie patient", placeholder: "Sehr geehrte Kolleginnen und Kollegen,\n\nwir berichten über den stationären Aufenthalt von..." },
  { id: "konsil", icon: "🔬", title: "Konsilanforderung", desc: "Demande d'avis spécialisé", placeholder: "Konsilanforderung an: Angiologie\nPatient: ...\nFragestellung: ..." },
];

export function DocumentBuilder({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [selected, setSelected] = useState<typeof DOCUMENTS[0] | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!text.trim() || !selected) return;
    ask(`Type de document médical: ${selected.title} (${selected.desc})\n\nDocument rédigé par l'étudiante:\n"${text}"\n\nCorrige et améliore ce document médical. Évalue le format, le contenu, et la langue.`, "script-builder");
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

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">📄</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Builder de documents</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Crée tes documents médicaux professionnels en allemand</p>
        </div>
      </div>

      {!selected ? (
        <div className="grid grid-cols-2 gap-3">
          {DOCUMENTS.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(d)}
              className="rounded-2xl bg-gradient-to-b from-info/8 to-transparent border border-border/40 p-5 text-left hover:border-info/30 transition-all"
            >
              <div className="text-2xl mb-2">{d.icon}</div>
              <div className="text-sm font-bold tracking-tight">{d.title}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{d.desc}</div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-gradient-to-r from-info/10 to-primary/5 border border-info/20 p-5">
            <div className="flex items-center gap-2 mb-2">
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
            <div className="flex gap-2 mt-3">
              <Button onClick={handleSubmit} disabled={!text.trim() || isLoading} className="flex-1 rounded-xl gap-2">
                {isLoading ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyse...</> : <><Send className="w-4 h-4" /> Soumettre</>}
              </Button>
              <Button variant="secondary" onClick={handleReset} className="rounded-xl gap-1.5">
                <RotateCcw className="w-4 h-4" /> Autre
              </Button>
            </div>
          </div>

          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">{error}</div>}
          {response && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated rounded-2xl p-5 border-l-[3px] border-info/40">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-info" />
                <p className="text-xs font-bold text-info uppercase tracking-wider">Coach IA</p>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{response}</div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
