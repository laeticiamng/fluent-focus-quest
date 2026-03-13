import { useState } from "react";
import { GRAM } from "@/data/content";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = [
  "border-info/20 text-info",
  "border-grammar/20 text-grammar",
  "border-success/20 text-success",
  "border-clinical/20 text-clinical",
  "border-primary/20 text-primary",
];

interface GrammarProps {
  grammarDone: Record<string, boolean>;
  toggleGrammarExercise: (key: string) => void;
}

export function Grammar({ grammarDone, toggleGrammarExercise }: GrammarProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (gi: number, ei: number, selected: string, correct: string) => {
    const key = `g${gi}-e${ei}`;
    if (answers[key]) return;
    setAnswers(prev => ({ ...prev, [key]: selected }));
    if (selected === correct && !grammarDone[key]) {
      toggleGrammarExercise(key);
    }
  };

  const totalExercises = GRAM.reduce((a, g) => a + (g.exercises?.length || 0), 0);
  const doneExercises = Object.keys(grammarDone).length;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black tracking-tight">📐 Grammaire</h2>

      <div className="card-elevated rounded-2xl p-4 flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">Exercices réussis</span>
        <span className="text-sm font-bold text-success">{doneExercises}/{totalExercises}</span>
      </div>

      {GRAM.map((g, gi) => (
        <motion.div
          key={gi}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.06 }}
          className={`card-elevated rounded-2xl p-5 border-l-[3px] ${COLORS[gi].split(" ")[0]}`}
        >
          <h3 className={`text-sm font-bold mb-3 ${COLORS[gi].split(" ")[1]}`}>{g.title}</h3>
          <div className="space-y-2">
            {g.items.map((c, ci) => (
              <div key={ci} className="rounded-xl bg-secondary/50 p-3">
                <div className={`text-[11px] font-bold ${COLORS[gi].split(" ")[1]}`}>{c.l}</div>
                <div className="text-xs text-foreground/80 mt-0.5">{c.e}</div>
              </div>
            ))}
          </div>

          {g.exercises && g.exercises.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Exercices</p>
              <div className="space-y-3">
                {g.exercises.map((ex, ei) => {
                  const key = `g${gi}-e${ei}`;
                  const userAnswer = answers[key];
                  const isCorrect = userAnswer === ex.a;

                  return (
                    <div key={ei} className="rounded-xl bg-background/50 p-3.5">
                      <p className="text-xs font-semibold mb-2.5">{ex.q}</p>
                      <div className="flex gap-2 flex-wrap">
                        {ex.opts.map((opt, oi) => {
                          let cls = "bg-secondary border-border/40 text-foreground";
                          if (userAnswer) {
                            if (opt === ex.a) cls = "bg-success/15 border-success/30 text-success";
                            else if (opt === userAnswer && !isCorrect) cls = "bg-primary/15 border-primary/30 text-primary";
                          }
                          return (
                            <motion.button
                              key={oi}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleAnswer(gi, ei, opt, ex.a)}
                              disabled={!!userAnswer}
                              className={`${cls} border rounded-lg px-3.5 py-2 text-xs font-medium transition-all`}
                            >
                              {opt}
                            </motion.button>
                          );
                        })}
                      </div>
                      {userAnswer && (
                        <div className={`flex items-center gap-1.5 mt-2.5 text-[11px] font-medium ${isCorrect ? "text-success" : "text-primary"}`}>
                          {isCorrect ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                          {isCorrect ? "Richtig! +10 XP" : `Correct: ${ex.a}`}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
