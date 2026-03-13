import { useState } from "react";
import { GRAM } from "@/data/content";
import { Check, X } from "lucide-react";

const COLORS = [
  "border-info/30 text-info",
  "border-grammar/30 text-grammar",
  "border-success/30 text-success",
  "border-clinical/30 text-clinical",
  "border-primary/30 text-primary",
];

interface GrammarProps {
  grammarDone: Record<string, boolean>;
  toggleGrammarExercise: (key: string) => void;
}

export function Grammar({ grammarDone, toggleGrammarExercise }: GrammarProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (gi: number, ei: number, selected: string, correct: string) => {
    const key = `g${gi}-e${ei}`;
    if (answers[key]) return; // already answered
    setAnswers(prev => ({ ...prev, [key]: selected }));
    if (selected === correct && !grammarDone[key]) {
      toggleGrammarExercise(key);
    }
  };

  const totalExercises = GRAM.reduce((a, g) => a + (g.exercises?.length || 0), 0);
  const doneExercises = Object.keys(grammarDone).length;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-black">📐 Grammaire essentielle</h2>

      <div className="rounded-lg bg-card border border-border p-3">
        <div className="flex justify-between">
          <span className="text-xs text-muted-foreground">Exercices réussis</span>
          <span className="text-xs font-bold text-success">{doneExercises}/{totalExercises}</span>
        </div>
      </div>

      {GRAM.map((g, gi) => (
        <div key={gi} className={`rounded-xl border bg-card p-4 ${COLORS[gi].split(" ")[0]}`}>
          <h3 className={`text-sm font-bold mb-3 ${COLORS[gi].split(" ")[1]}`}>{g.title}</h3>
          <div className="space-y-1.5">
            {g.items.map((c, ci) => (
              <div key={ci} className="rounded-lg bg-secondary p-2.5">
                <div className={`text-[11px] font-bold ${COLORS[gi].split(" ")[1]}`}>{c.l}</div>
                <div className="text-xs">{c.e}</div>
              </div>
            ))}
          </div>

          {/* Exercices interactifs */}
          {g.exercises && g.exercises.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                ✍️ Exercices
              </p>
              <div className="space-y-3">
                {g.exercises.map((ex, ei) => {
                  const key = `g${gi}-e${ei}`;
                  const userAnswer = answers[key];
                  const isCorrect = userAnswer === ex.a;
                  const isDone = !!grammarDone[key];

                  return (
                    <div key={ei} className="rounded-lg bg-background/50 p-3">
                      <p className="text-xs font-semibold mb-2">{ex.q}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {ex.opts.map((opt, oi) => {
                          let cls = "bg-secondary border-border text-foreground";
                          if (userAnswer) {
                            if (opt === ex.a) cls = "bg-success/20 border-success text-success";
                            else if (opt === userAnswer && !isCorrect) cls = "bg-primary/20 border-primary text-primary";
                          }
                          return (
                            <button
                              key={oi}
                              onClick={() => handleAnswer(gi, ei, opt, ex.a)}
                              disabled={!!userAnswer}
                              className={`${cls} border rounded-md px-3 py-1.5 text-xs font-medium transition-all`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {userAnswer && (
                        <div className={`flex items-center gap-1.5 mt-2 text-[11px] ${isCorrect ? "text-success" : "text-primary"}`}>
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
        </div>
      ))}
    </div>
  );
}
