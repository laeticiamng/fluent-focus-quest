import { PROG, TP_LABELS, type TaskType } from "@/data/content";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

const TP_COLORS: Record<TaskType, string> = {
  learn: "bg-info/20 text-info",
  grammar: "bg-grammar/20 text-grammar",
  speak: "bg-primary/20 text-primary",
  listen: "bg-accent/20 text-accent",
  write: "bg-success/20 text-success",
  review: "bg-warning/20 text-warning",
  rest: "bg-muted-foreground/20 text-muted-foreground",
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

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-info/30 bg-card p-4">
        <p className="text-[10px] uppercase text-muted-foreground">Semaine {tP.w}</p>
        <h2 className="text-xl font-black mt-1 mb-2">{tP.title}</h2>
        <div className="flex items-center gap-3">
          <Progress value={(tDone / tP.tasks.length) * 100} className="h-2 flex-1 bg-muted" />
          <span className="text-success font-bold text-xs">{tDone}/{tP.tasks.length}</span>
        </div>
      </div>

      {tP.tasks.map((task, i) => {
        const k = `${tP.date}-${i}`;
        const isDone = !!done[k];
        return (
          <div
            key={i}
            onClick={() => toggleTask(tP.date, i)}
            className={`rounded-xl p-3.5 cursor-pointer border transition-all ${
              isDone ? "bg-success/5 border-success/20 opacity-60" : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                isDone ? "bg-success border-success" : CHECK_COLORS[task.tp]
              }`}>
                {isDone && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs">{task.t}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TP_COLORS[task.tp]}`}>
                    {TP_LABELS[task.tp]}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${isDone ? "line-through text-muted-foreground" : ""}`}>
                  {task.d}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {tDone === tP.tasks.length && (
        <div className="rounded-xl bg-success/10 border border-success/30 p-5 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <div className="text-lg font-black text-success">Journée complète!</div>
        </div>
      )}
    </div>
  );
}
