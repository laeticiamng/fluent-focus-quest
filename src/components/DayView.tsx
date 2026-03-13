import { PROG, TP_LABELS, type TaskType } from "@/data/content";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCelebration } from "@/components/CelebrationProvider";
import { useEffect, useRef } from "react";

const TP_COLORS: Record<TaskType, string> = {
  learn: "bg-info/15 text-info",
  grammar: "bg-grammar/15 text-grammar",
  speak: "bg-primary/15 text-primary",
  listen: "bg-accent/15 text-accent",
  write: "bg-success/15 text-success",
  review: "bg-warning/15 text-warning",
  rest: "bg-muted-foreground/15 text-muted-foreground",
};

const CHECK_COLORS: Record<TaskType, string> = {
  learn: "border-info", grammar: "border-grammar", speak: "border-primary",
  listen: "border-accent", write: "border-success", review: "border-warning", rest: "border-muted-foreground",
};

interface DayViewProps {
  done: Record<string, boolean>;
  toggleTask: (date: string, idx: number) => void;
}

export function DayView({ done, toggleTask }: DayViewProps) {
  const tStr = new Date().toISOString().split("T")[0];
  const tP = PROG.find(d => d.date === tStr) || PROG[0];
  const tDone = tP.tasks.filter((_, i) => done[`${tP.date}-${i}`]).length;
  const { celebrate } = useCelebration();
  const prevDone = useRef(tDone);

  useEffect(() => {
    if (tDone > prevDone.current) {
      celebrate("task");
      if (tDone === tP.tasks.length) {
        setTimeout(() => celebrate("day"), 600);
      }
    }
    prevDone.current = tDone;
  }, [tDone]);

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-elevated rounded-2xl p-5"
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Semaine {tP.w}</p>
        <h2 className="text-2xl font-black tracking-tight mt-1 mb-3">{tP.title}</h2>
        <div className="flex items-center gap-3">
          <Progress value={(tDone / tP.tasks.length) * 100} className="h-1.5 flex-1 bg-secondary rounded-full" />
          <span className="text-success font-bold text-xs">{tDone}/{tP.tasks.length}</span>
        </div>
      </motion.div>

      {tP.tasks.map((task, i) => {
        const k = `${tP.date}-${i}`;
        const isDone = !!done[k];
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleTask(tP.date, i)}
            className={`card-elevated rounded-2xl p-4 cursor-pointer transition-all ${
              isDone ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                isDone ? "bg-success border-success" : CHECK_COLORS[task.tp]
              }`}>
                {isDone && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-bold text-xs">{task.t}</span>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${TP_COLORS[task.tp]}`}>
                    {TP_LABELS[task.tp]}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isDone ? "line-through text-muted-foreground" : "text-foreground/80"}`}>
                  {task.d}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}

      {tDone === tP.tasks.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl bg-gradient-to-br from-success/15 to-success/5 border border-success/20 p-6 text-center"
        >
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-lg font-black text-success tracking-tight">Journée complète!</div>
          <p className="text-xs text-success/70 mt-1">Tu te rapproches de Bienne chaque jour.</p>
        </motion.div>
      )}
    </div>
  );
}
