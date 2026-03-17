import { PROG, TP_LABELS, type TaskType } from "@/data/content";
import { Check, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const TP_DOTS: Record<TaskType, string> = {
  learn: "bg-blue-400", grammar: "bg-emerald-400", speak: "bg-violet-400",
  listen: "bg-amber-400", write: "bg-green-400", review: "bg-orange-400", rest: "bg-gray-400",
};

interface TodayPlanProps {
  done: Record<string, boolean>;
  toggleTask: (date: string, idx: number) => void;
  onExpand?: () => void;
}

export function TodayPlan({ done, toggleTask, onExpand }: TodayPlanProps) {
  const tStr = new Date().toISOString().split("T")[0];
  const tP = PROG.find(d => d.date === tStr);

  // No plan for today — show next planned day
  if (!tP) {
    const futureDays = PROG.filter(d => d.date > tStr);
    if (futureDays.length === 0) return null;
    const next = futureDays[0];
    return (
      <div className="rounded-2xl p-4" style={{
        background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
        border: "1px solid hsl(var(--border) / 0.3)",
      }}>
        <p className="text-[9px] uppercase tracking-[2px] text-muted-foreground/60 font-bold">Prochain cours</p>
        <p className="text-xs font-black mt-1">{next.title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {new Date(next.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })}
        </p>
      </div>
    );
  }

  const tDone = tP.tasks.filter((_, i) => done[`${tP.date}-${i}`]).length;
  const allDone = tDone === tP.tasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: allDone
          ? "linear-gradient(145deg, hsl(142 71% 45% / 0.06), hsl(var(--card)))"
          : "linear-gradient(145deg, hsl(220 60% 50% / 0.06), hsl(var(--card)))",
        border: allDone
          ? "1px solid hsl(142 71% 45% / 0.15)"
          : "1px solid hsl(var(--border) / 0.3)",
      }}
    >
      {/* Header */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div>
          <p className="text-[9px] uppercase tracking-[2px] text-muted-foreground/60 font-bold">
            Plan du jour — S{tP.w}
          </p>
          <p className="text-xs font-black tracking-tight mt-0.5">{tP.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black ${allDone ? "text-emerald-400" : "text-primary"}`}>
            {tDone}/{tP.tasks.length}
          </span>
          {allDone && <span className="text-sm">✅</span>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-1 bg-secondary/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(tDone / tP.tasks.length) * 100}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${allDone ? "bg-emerald-500/60" : "bg-primary/50"}`}
          />
        </div>
      </div>

      {/* Compact task list */}
      <div className="px-3 pb-3 space-y-1">
        {tP.tasks.map((task, i) => {
          const k = `${tP.date}-${i}`;
          const isDone = !!done[k];
          return (
            <button
              key={i}
              onClick={() => toggleTask(tP.date, i)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-xl text-left transition-all min-h-[40px] ${
                isDone
                  ? "opacity-50 bg-emerald-500/5"
                  : "hover:bg-white/5 active:bg-white/8"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isDone ? "bg-emerald-500 border-emerald-500" : "border-border/40"
              }`}>
                {isDone && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${TP_DOTS[task.tp]}`} />
              <span className="text-[10px] font-medium text-foreground/80 leading-tight flex-1">
                <span className="font-bold text-foreground/60 mr-1">{task.t}</span>
                {task.d.length > 60 ? task.d.slice(0, 57) + "..." : task.d}
              </span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                isDone ? "bg-emerald-500/10 text-emerald-400" : "bg-secondary/30 text-muted-foreground/60"
              }`}>
                {TP_LABELS[task.tp]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expand link */}
      {onExpand && (
        <button
          onClick={onExpand}
          className="w-full flex items-center justify-center gap-1 py-2 text-[9px] text-muted-foreground/50 hover:text-muted-foreground/70 border-t border-border/10 transition-colors"
        >
          Voir le programme complet <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
}
