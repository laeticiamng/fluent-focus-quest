import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Send, Sparkles, Trophy, Copy, Check } from "lucide-react";
import { toast } from "sonner";

const LEVELS = [
  { level: 1, title: "Anfänger", titleFr: "Étudiante", icon: "🎓", xpReq: 0 },
  { level: 2, title: "Assistenzärztin", titleFr: "Résidente", icon: "🩺", xpReq: 100 },
  { level: 3, title: "Oberärztin", titleFr: "Senior", icon: "⭐", xpReq: 300 },
  { level: 4, title: "Leitende Ärztin", titleFr: "Chef de clinique", icon: "🏅", xpReq: 600 },
  { level: 5, title: "Chefärztin", titleFr: "Boss", icon: "👑", xpReq: 1000 },
];

const MILESTONES = [
  { id: "france", icon: "🇫🇷", from: "FFI Urgences", to: "Assistenzärztin Angiologie", fromLang: "Faisant Fonction Interne", toLang: "Assistenzärztin" },
  { id: "suisse", icon: "🇨🇭", from: "France", to: "Suisse — Biel", fromLang: "Frankreich", toLang: "Schweiz — Biel" },
  { id: "fmh", icon: "📜", from: "Angiologie", to: "FMH Angiologie", fromLang: "Weiterbildung", toLang: "Facharzt für Angiologie" },
];

const GOALS = [
  { id: "presentation", label: "Se présenter en allemand", prompt: "Stelle dich als neue Assistenzärztin im Gefäßzentrum Biel vor. Auf Deutsch." },
  { id: "motivation", label: "Pourquoi l'angiologie", prompt: "Warum hast du dich für die Angiologie entschieden? Auf Deutsch." },
  { id: "fiveYears", label: "Vision à 5 ans", prompt: "Wo siehst du dich in 5 Jahren? Auf Deutsch." },
  { id: "strengths", label: "Tes forces", prompt: "Was sind deine Stärken als Ärztin? Auf Deutsch." },
];

interface CareerBuilderProps {
  addXp: (n: number) => void;
  xp: number;
}

export function CareerBuilder({ addXp, xp }: CareerBuilderProps) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [selectedGoal, setSelectedGoal] = useState<typeof GOALS[0] | null>(null);
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

  const currentLevel = [...LEVELS].reverse().find(l => xp >= l.xpReq) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.xpReq > xp);
  const progressToNext = nextLevel ? ((xp - currentLevel.xpReq) / (nextLevel.xpReq - currentLevel.xpReq)) * 100 : 100;

  const handleSubmit = () => {
    if (!text.trim() || !selectedGoal) return;
    ask(`Karriere-Coaching.\nAufgabe: ${selectedGoal.prompt}\n\nAntwort der Studentin:\n"${text}"\n\nKorrigiere und verbessere den Text. Bewerte das Niveau.`, "script-builder");
    setSubmitted(true);
    addXp(20);
    celebrate("task");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏔️</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Builder de carrière</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Construis ton parcours France → Suisse</p>
        </div>
      </div>

      {/* Level display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-gradient-to-r from-warning/12 to-accent/8 border border-warning/20 p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentLevel.icon}</span>
            <div>
              <p className="text-sm font-black">{currentLevel.title}</p>
              <p className="text-[10px] text-muted-foreground">{currentLevel.titleFr}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-warning">{xp} XP</p>
            {nextLevel && <p className="text-[10px] text-muted-foreground">{nextLevel.xpReq - xp} XP → {nextLevel.title}</p>}
          </div>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            className="h-full bg-gradient-to-r from-warning to-accent rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2">
          {LEVELS.map(l => (
            <div key={l.level} className={`text-center ${xp >= l.xpReq ? "text-warning" : "text-muted-foreground/40"}`}>
              <span className="text-sm">{l.icon}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Milestones */}
      <div className="space-y-2">
        {MILESTONES.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-elevated rounded-2xl p-4 flex items-center gap-3"
          >
            <span className="text-xl shrink-0">{m.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{m.from}</span>
                <span className="text-success font-bold">→</span>
                <span className="font-bold text-success">{m.to}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.fromLang} → {m.toLang}</p>
            </div>
            <Trophy className="w-4 h-4 text-warning/40 shrink-0" />
          </motion.div>
        ))}
      </div>

      {/* Goal writing */}
      <div className="card-elevated rounded-2xl p-5">
        <p className="text-xs font-bold text-muted-foreground mb-3">✍️ Écris ton parcours en allemand</p>
        {!selectedGoal ? (
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(g => (
              <button
                key={g.id}
                onClick={() => { setSelectedGoal(g); setText(""); setSubmitted(false); reset(); }}
                className="rounded-xl bg-secondary/50 border border-border/40 p-3 text-left hover:border-warning/30 transition-all"
              >
                <p className="text-xs font-bold">{g.label}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{selectedGoal.prompt}</p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Schreib auf Deutsch..."
              className="min-h-[100px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
              disabled={submitted && isLoading}
            />
            <div className="flex justify-end mt-1 mb-1">
              <span className={`text-[10px] font-medium ${text.length > 0 ? "text-warning/70" : "text-muted-foreground/40"}`}>
                {text.length} caractères
              </span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit} disabled={!text.trim() || isLoading} className="flex-1 rounded-xl gap-2">
                {isLoading ? <><Sparkles className="w-4 h-4 animate-spin" /> Analyse...</> : <><Send className="w-4 h-4" /> Soumettre</>}
              </Button>
              <Button variant="secondary" onClick={() => setSelectedGoal(null)} className="rounded-xl">Autre</Button>
            </div>
          </div>
        )}
      </div>

      {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">{error}</div>}
      {response && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated rounded-2xl p-5 border-l-[3px] border-warning/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-warning" />
              <p className="text-xs font-bold text-warning uppercase tracking-wider">Coach IA</p>
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
  );
}
