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
    <div className="min-h-screen bg-background ambient-bg">
      {/* Ambient floating orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* Sticky nav — Apple frosted glass */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-border/30">
        <div className="max-w-5xl mx-auto flex justify-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-hide">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 sm:px-4 py-1.5 rounded-xl text-[10px] sm:text-[11px] transition-all duration-200 shrink-0 relative ${
                tab === n.id
                  ? "font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              {tab === n.id && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="text-sm sm:text-base relative z-10">{n.icon}</span>
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
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {tab === "dash" && (
            <div className="space-y-5 stagger-children">
              {/* Hero section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-card to-grammar/10 border border-primary/15 p-6 sm:p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <Countdown />
                </div>
              </motion.div>

              <XPBar xp={progress.xp} />

              {/* Streak */}
              {progress.streak > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-2xl bg-gradient-to-r from-accent/12 via-accent/6 to-warning/8 border border-accent/20 p-4 text-center glow-accent"
                >
                  <span className="text-2xl">🔥</span>
                  <span className="text-sm font-bold text-accent ml-2">{progress.streak} jour{progress.streak > 1 ? "s" : ""} de suite!</span>
                </motion.div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { v: `J${dNum}`, l: "/20", cls: "text-info", bg: "from-info/10 to-info/5" },
                  { v: `${pct}%`, l: "fait", cls: "text-success", bg: "from-success/10 to-success/5" },
                  { v: String(totDone), l: `/${totTasks}`, cls: "text-grammar", bg: "from-grammar/10 to-grammar/5" },
                  { v: String(DECKS.reduce((a, d) => a + d.cards.length, 0)), l: "mots", cls: "text-clinical", bg: "from-clinical/10 to-clinical/5" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className={`rounded-2xl bg-gradient-to-br ${s.bg} border border-border/40 p-4 text-center`}
                  >
                    <div className={`text-2xl sm:text-3xl font-black tracking-tight ${s.cls}`}>{s.v}</div>
                    <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1">{s.l}</div>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="card-elevated rounded-2xl p-5">
                <div className="flex justify-between mb-3">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Progression globale</span>
                  <span className="text-xs sm:text-sm font-bold text-success">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2 bg-secondary rounded-full" />
              </div>

              <MotivBanner />

              {/* Today's tasks preview */}
              <div className="card-elevated rounded-2xl p-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm sm:text-base font-bold tracking-tight">📋 Aujourd'hui — {todayProg.title}</h3>
                  <span className="text-xs sm:text-sm font-bold text-success">{todayDone}/{todayProg.tasks.length}</span>
                </div>
                <div className="space-y-3">
                  {todayProg.tasks.map((task, i) => {
                    const isDone = !!progress.done[`${todayProg.date}-${i}`];
                    return (
                      <div key={i} className="flex items-center gap-3 group">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isDone ? "bg-success border-success glow-success" : "border-muted-foreground/30 group-hover:border-muted-foreground/50"
                        }`}>
                          {isDone && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                        </div>
                        <span className={`text-xs sm:text-sm leading-relaxed ${isDone ? "line-through text-muted-foreground" : ""}`}>
                          <span className="font-semibold">{task.t}:</span> {task.d}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button onClick={() => setTab("today")} className="text-xs sm:text-sm text-primary font-semibold mt-4 hover:underline transition-all">
                  Voir tout →
                </button>
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { t: "vocab" as Tab, i: "🧠", l: "Vocab", bg: "from-info/8 to-transparent" },
                  { t: "iv" as Tab, i: "💼", l: "Entretien", bg: "from-accent/8 to-transparent" },
                  { t: "sim" as Tab, i: "🏥", l: "Cas cliniques", bg: "from-clinical/8 to-transparent" },
                  { t: "tools" as Tab, i: "🛠️", l: "Outils", bg: "from-grammar/8 to-transparent" },
                  { t: "stats" as Tab, i: "📊", l: "Stats", bg: "from-success/8 to-transparent" },
                  { t: "cal" as Tab, i: "📅", l: "Planning", bg: "from-warning/8 to-transparent" },
                ].map((a, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTab(a.t)}
                    className={`rounded-2xl bg-gradient-to-b ${a.bg} border border-border/40 p-4 sm:p-5 text-center transition-all hover:border-border/60`}
                  >
                    <div className="text-2xl sm:text-3xl mb-2">{a.i}</div>
                    <div className="text-[10px] sm:text-xs font-semibold tracking-tight">{a.l}</div>
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
