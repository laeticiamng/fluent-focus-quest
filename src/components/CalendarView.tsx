import { useState } from "react";
import { motion } from "framer-motion";
import { PROG, TP_LABELS, type TaskType } from "@/data/content";
import { Check, ChevronRight, ChevronDown } from "lucide-react";

const TP_PILL: Record<TaskType, string> = {
  learn: "bg-info/20 text-info", grammar: "bg-grammar/20 text-grammar",
  speak: "bg-primary/20 text-primary", listen: "bg-accent/20 text-accent",
  write: "bg-success/20 text-success", review: "bg-warning/20 text-warning",
  rest: "bg-muted-foreground/20 text-muted-foreground",
};

interface CalendarProps {
  done: Record<string, boolean>;
  toggleTask: (date: string, idx: number) => void;
}

const WEEKS = [
  { w: 1, label: "S1 — Fondations (A1→A2)", cls: "border-info bg-info/5 text-info" },
  { w: 2, label: "S2 — Accélération (A2→B1)", cls: "border-accent bg-accent/5 text-accent" },
  { w: 3, label: "S3 — Performance (B1→B2)", cls: "border-success bg-success/5 text-success" },
];

export function CalendarView({ done, toggleTask }: CalendarProps) {
  const [calD, setCalD] = useState<string | null>(null);
  const tStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {/* Header — La Salle des Plans */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(270 60% 60% / 0.08), hsl(var(--card)), hsl(142 71% 45% / 0.04))",
          border: "1px solid hsl(270 60% 60% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(270 60% 60% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-violet-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="door-icon-3d w-12 h-12 rounded-xl bg-violet-500/12 border border-violet-500/15 flex items-center justify-center text-2xl"
            style={{ boxShadow: "var(--shadow-3d-sm), 0 0 14px -4px hsl(270 60% 60% / 0.2)" }}
          >
            📅
          </motion.div>
          <div>
            <h2 className="text-xl font-black tracking-tight">La Salle des Plans</h2>
            <p className="text-[10px] text-violet-400/50 font-medium">Cartographie du Stratege</p>
          </div>
        </div>
      </motion.div>
      {WEEKS.map(wk => (
        <div key={wk.w}>
          <div className={`text-xs font-bold mb-2 px-3 py-1.5 rounded-lg border-l-[3px] ${wk.cls}`}>
            {wk.label}
          </div>
          <div className="space-y-1">
            {PROG.filter(d => d.w === wk.w).map((day) => {
              const isT = day.date === tStr;
              const allD = day.tasks.every((_, ti) => done[`${day.date}-${ti}`]);
              const cnt = day.tasks.filter((_, ti) => done[`${day.date}-${ti}`]).length;
              const open = calD === day.date;
              return (
                <div key={day.date}>
                  <div
                    onClick={() => setCalD(open ? null : day.date)}
                    className={`rounded-lg px-3 py-2 cursor-pointer transition-all room-3d ${
                      isT ? "room-in-progress" : allD ? "room-solved" : "room-accessible"
                    } ${open ? "rounded-b-none" : ""}`}
                    style={{ boxShadow: isT ? "var(--shadow-3d-md)" : "var(--shadow-3d-sm)" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {allD && <Check className="w-3.5 h-3.5 text-success" />}
                        <span className={`font-bold text-xs ${isT ? "text-primary" : ""}`}>
                          {isT ? "→ " : ""}{day.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{cnt}/{day.tasks.length}</span>
                        {open ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div className="bg-card border border-t-0 border-border rounded-b-lg p-2 space-y-1">
                      {day.tasks.map((task, ti) => {
                        const k = `${day.date}-${ti}`;
                        const isDone = !!done[k];
                        return (
                          <div
                            key={ti}
                            onClick={() => toggleTask(day.date, ti)}
                            className={`rounded-lg p-2.5 cursor-pointer flex items-start gap-2.5 ${
                              isDone ? "opacity-50" : ""
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              isDone ? "bg-success border-success" : "border-muted-foreground"
                            }`}>
                              {isDone && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="font-bold text-[10px]">{task.t}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${TP_PILL[task.tp]}`}>
                                  {TP_LABELS[task.tp]}
                                </span>
                              </div>
                              <p className={`text-[11px] leading-relaxed ${isDone ? "line-through text-muted-foreground" : ""}`}>
                                {task.d}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
