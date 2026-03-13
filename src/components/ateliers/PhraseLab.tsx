import { useState } from "react";
import { motion } from "framer-motion";
import { useAICoach } from "@/hooks/useAICoach";
import { DECKS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCelebration } from "@/components/CelebrationProvider";
import { Shuffle, Send, RotateCcw, Sparkles, Copy, Check } from "lucide-react";
import { toast } from "sonner";

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
    const prompt = `Mot: ${currentWord.de} (${currentWord.fr})\n\nPhrase créée par l'étudiante:\n"${sentence}"\n\nCorrige et améliore cette phrase médicale.`;
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
      <div className="flex items-center gap-3">
        <span className="text-3xl">🧪</span>
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Labo de phrases</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Crée des phrases médicales — l'IA corrige et améliore</p>
        </div>
      </div>

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
          {/* Current word card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-primary/12 to-info/8 border border-primary/20 p-5 sm:p-6 text-center"
          >
            <p className="text-[10px] uppercase tracking-[3px] text-primary/70 mb-2">Ton mot</p>
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
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive">
              {error}
            </div>
          )}

          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated rounded-2xl p-5 border-l-[3px] border-success/40"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-success" />
                  <p className="text-xs font-bold text-success uppercase tracking-wider">Coach IA</p>
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
