import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { DECKS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Shuffle, Send, RotateCcw, Sparkles, Copy, Check, FlaskConical } from "lucide-react";
import { toast } from "sonner";

const ALCHEMIST_PERSONA = `Tu es l'Alchimiste des Mots, un savant excentrique qui transforme les mots bruts en phrases d'or. Tu utilises des metaphores de laboratoire : "cet alliage est prometteur", "ta formule manque d'un reactif", "excellente reaction chimique entre sujet et verbe".`;

export function PhraseLab({ addXp }: { addXp: (n: number) => void }) {
  const { celebrate } = useCelebration();
  const { response, isLoading, error, ask, reset } = useAICoach();
  const [currentWord, setCurrentWord] = useState<{ de: string; fr: string } | null>(null);
  const [sentence, setSentence] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const allCards = DECKS.flatMap(d => d.cards);

  const pickRandom = () => {
    const card = allCards[Math.floor(Math.random() * allCards.length)];
    setCurrentWord(card);
    setSentence("");
    setSubmitted(false);
    reset();
  };

  const handleSubmit = () => {
    if (!sentence.trim() || !currentWord) return;
    const prompt = `${ALCHEMIST_PERSONA}\n\nMot a transmuter: ${currentWord.de} (${currentWord.fr})\n\nFormule creee par l'apprenti:\n"${sentence}"\n\nAnalyse cette formule : grammaire, contexte medical, et propose une version enrichie. Sois concis (max 80 mots). Utilise des metaphores de laboratoire.`;
    ask(prompt, "phrase-lab");
    setSubmitted(true);
    addXp(15);
    celebrate("quiz");
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
          background: "linear-gradient(145deg, hsl(142 71% 45% / 0.08), hsl(var(--card)), hsl(186 70% 50% / 0.04))",
          border: "1px solid hsl(142 71% 45% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(142 71% 45% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotateY: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-emerald-500/12 border border-emerald-500/15 flex items-center justify-center"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(142 71% 45% / 0.2)" }}
          >
            <FlaskConical className="w-6 h-6 text-emerald-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Le Laboratoire</h2>
            <p className="text-[10px] text-emerald-400/50 font-medium">Domaine de l'Alchimiste des Mots</p>
          </div>
        </div>
      </motion.div>

      {/* Word picker */}
      {!currentWord ? (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={pickRandom}
          className="w-full rounded-2xl bg-gradient-to-br from-primary/15 via-card to-grammar/10 border border-primary/20 p-8 sm:p-12 text-center group"
        >
          <Shuffle className="w-8 h-8 mx-auto mb-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
          <p className="text-lg font-bold">Tire un mot au hasard</p>
          <p className="text-xs text-muted-foreground mt-1">Puis construis une phrase médicale avec</p>
        </motion.button>
      ) : (
        <div className="space-y-4">
          {/* Current word card — reagent */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl room-3d room-accessible p-5 sm:p-6 text-center relative overflow-hidden"
            style={{ boxShadow: "var(--shadow-3d-md)" }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-emerald-500/[0.05] blur-[25px] rounded-full" />
            </div>
            <p className="text-[10px] uppercase tracking-[3px] text-emerald-400/70 mb-2 relative z-10">Reactif</p>
            <p className="text-2xl sm:text-3xl font-black tracking-tight">{currentWord.de}</p>
            <p className="text-sm text-muted-foreground mt-1">{currentWord.fr}</p>
          </motion.div>

          {/* Sentence input */}
          <div className="card-elevated rounded-2xl p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">
              ✍️ Construis une phrase médicale avec ce mot :
            </p>
            <Textarea
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder="z.B. Der Patient hat eine Thrombose im linken Bein."
              className="min-h-[80px] bg-secondary/50 border-border/40 rounded-xl text-sm resize-none"
              disabled={submitted && isLoading}
            />
            <div className="flex items-center justify-between mt-2 mb-3">
              <span className={`text-[10px] font-medium ${sentence.length > 0 ? "text-primary/70" : "text-muted-foreground/40"}`}>
                {sentence.length} caractères
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!sentence.trim() || isLoading}
                className="flex-1 rounded-xl gap-2"
              >
                {isLoading ? (
                  <><Sparkles className="w-4 h-4 animate-spin" /> Analyse...</>
                ) : (
                  <><Send className="w-4 h-4" /> Soumettre à l'IA</>
                )}
              </Button>
              <Button variant="secondary" onClick={pickRandom} className="rounded-xl gap-1.5">
                <RotateCcw className="w-4 h-4" /> Nouveau
              </Button>
            </div>
          </div>

          {/* AI Response */}
          {error && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-400">
              {error}
            </div>
          )}

          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="room-3d rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(142 71% 45% / 0.06), hsl(var(--card)))",
                border: "1px solid hsl(142 71% 45% / 0.12)",
                boxShadow: "var(--shadow-3d-sm), 0 0 20px -6px hsl(142 71% 45% / 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    animate={{ rotateY: [0, 8, -8, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm"
                  >
                    🧪
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[2px]">Alchimiste</p>
                    <p className="text-[9px] text-emerald-400/40">Resultat de l'experience</p>
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
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {response}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
