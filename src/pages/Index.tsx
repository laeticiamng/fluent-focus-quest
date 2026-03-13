import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut } from "lucide-react";
import { PROG, DECKS } from "@/data/content";
import { Countdown } from "@/components/Countdown";
import { XPBar } from "@/components/XPBar";
import { MotivBanner } from "@/components/MotivBanner";
import { DayView } from "@/components/DayView";
import { Vocab } from "@/components/Vocab";
import { Interview } from "@/components/Interview";
import { Grammar } from "@/components/Grammar";
import { Clinical } from "@/components/Clinical";
import { CalendarView } from "@/components/CalendarView";
import { VisionBoard } from "@/components/VisionBoard";
import { Tools } from "@/components/Tools";
import { Stats } from "@/components/Stats";
import { useProgress } from "@/hooks/useProgress";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🎯", label: "Mission" },
  { id: "motiv", icon: "🔥", label: "Motiv" },
  { id: "today", icon: "📋", label: "Jour" },
  { id: "vocab", icon: "🧠", label: "Vocab" },
  { id: "gram", icon: "📐", label: "Gram." },
  { id: "iv", icon: "💼", label: "Entretien" },
  { id: "sim", icon: "🏥", label: "Clinique" },
  { id: "tools", icon: "🛠️", label: "Outils" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "cal", icon: "📅", label: "Plan" },
];

const Index = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dash");
  const progress = useProgress();

  const tStr = new Date().toISOString().split("T")[0];
  const dIdx = PROG.findIndex(d => d.date === tStr);
  const dNum = (dIdx + 1) || 1;
  const totDone = Object.values(progress.done).filter(Boolean).length;
  const totTasks = PROG.reduce((a, d) => a + d.tasks.length, 0);
  const pct = Math.round((totDone / totTasks) * 100);

  const todayProg = PROG.find(d => d.date === tStr) || PROG[0];
  const todayDone = todayProg.tasks.filter((_, i) => progress.done[`${todayProg.date}-${i}`]).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav — Apple frosted glass */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-border/40">
        <div className="max-w-xl mx-auto flex justify-center gap-0.5 px-2 py-2 overflow-x-auto">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] transition-all duration-200 shrink-0 relative ${
                tab === n.id
                  ? "font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {tab === n.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-secondary/80 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="text-sm relative z-10">{n.icon}</span>
              <span className="relative z-10">{n.label}</span>
            </button>
          ))}
          <button onClick={signOut} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] text-muted-foreground hover:text-foreground/70 shrink-0">
            <LogOut className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Sortir</span>
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-xl mx-auto px-4 py-5 pb-20">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {tab === "dash" && (
            <div className="space-y-4 stagger-children">
              <Countdown />
              <XPBar xp={progress.xp} />

              {/* Streak */}
              {progress.streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/15 p-3.5 text-center"
                >
                  <span className="text-xl">🔥</span>
                  <span className="text-sm font-bold text-accent ml-2">{progress.streak} jour{progress.streak > 1 ? "s" : ""} de suite!</span>
                </motion.div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { v: `J${dNum}`, l: "/20", cls: "text-info" },
                  { v: `${pct}%`, l: "fait", cls: "text-success" },
                  { v: String(totDone), l: `/${totTasks}`, cls: "text-grammar" },
                  { v: String(DECKS.reduce((a, d) => a + d.cards.length, 0)), l: "mots", cls: "text-clinical" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="card-elevated rounded-2xl p-3 text-center"
                  >
                    <div className={`text-xl font-black tracking-tight ${s.cls}`}>{s.v}</div>
                    <div className="text-[9px] font-medium text-muted-foreground mt-0.5">{s.l}</div>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="card-elevated rounded-2xl p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Progression globale</span>
                  <span className="text-xs font-bold text-success">{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5 bg-secondary rounded-full" />
              </div>

              <MotivBanner />

              {/* Today's tasks preview */}
              <div className="card-elevated rounded-2xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold tracking-tight">📋 Aujourd'hui — {todayProg.title}</h3>
                  <span className="text-xs font-bold text-success">{todayDone}/{todayProg.tasks.length}</span>
                </div>
                <div className="space-y-2.5">
                  {todayProg.tasks.map((task, i) => {
                    const isDone = !!progress.done[`${todayProg.date}-${i}`];
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isDone ? "bg-success border-success" : "border-muted-foreground/40"
                        }`}>
                          {isDone && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className={`text-xs leading-relaxed ${isDone ? "line-through text-muted-foreground" : ""}`}>
                          <span className="font-semibold">{task.t}:</span> {task.d.slice(0, 55)}{task.d.length > 55 ? "…" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setTab("today")} className="text-xs text-primary font-semibold mt-3 hover:underline">
                  Voir tout →
                </button>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { t: "vocab" as Tab, i: "🧠", l: "Vocab" },
                  { t: "iv" as Tab, i: "💼", l: "Entretien" },
                  { t: "sim" as Tab, i: "🏥", l: "Cas cliniques" },
                  { t: "tools" as Tab, i: "🛠️", l: "Outils" },
                  { t: "stats" as Tab, i: "📊", l: "Stats" },
                  { t: "cal" as Tab, i: "📅", l: "Planning" },
                ].map((a, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTab(a.t)}
                    className="card-elevated rounded-2xl p-4 text-center transition-all"
                  >
                    <div className="text-2xl mb-1.5">{a.i}</div>
                    <div className="text-[11px] font-semibold tracking-tight">{a.l}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {tab === "motiv" && <VisionBoard />}
          {tab === "today" && <DayView done={progress.done} toggleTask={progress.toggleTask} />}
          {tab === "vocab" && <Vocab addXp={progress.addXp} addQuizScore={progress.addQuizScore} toggleHardCard={progress.toggleHardCard} hardCards={progress.hardCards} />}
          {tab === "gram" && <Grammar grammarDone={progress.grammarDone} toggleGrammarExercise={progress.toggleGrammarExercise} />}
          {tab === "iv" && <Interview rat={progress.rat} setRating={progress.setRating} />}
          {tab === "sim" && <Clinical />}
          {tab === "tools" && <Tools addXp={progress.addXp} cl={progress.cl} toggleChecklist={progress.toggleChecklist} notes={progress.notes} setNotes={progress.setNotes} addPomodoro={progress.addPomodoro} pomodoroCount={progress.pomodoroCount} />}
          {tab === "stats" && <Stats xp={progress.xp} quizScores={progress.quizScores} hardCards={progress.hardCards} pomodoroCount={progress.pomodoroCount} streak={progress.streak} done={progress.done} grammarDone={progress.grammarDone} rat={progress.rat} />}
          {tab === "cal" && <CalendarView done={progress.done} toggleTask={progress.toggleTask} />}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
