import { useState } from "react";
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
import { Tools } from "@/components/Tools";
import { Stats } from "@/components/Stats";
import { useProgress } from "@/hooks/useProgress";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

type Tab = "dash" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🎯", label: "Mission" },
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
  const [tab, setTab] = useState<Tab>("dash");
  const progress = useProgress();

  const tStr = new Date().toISOString().split("T")[0];
  const dIdx = PROG.findIndex(d => d.date === tStr);
  const dNum = (dIdx + 1) || 1;
  const totDone = Object.values(progress.done).filter(Boolean).length;
  const totTasks = PROG.reduce((a, d) => a + d.tasks.length, 0);
  const pct = Math.round((totDone / totTasks) * 100);

  // Today's tasks for dashboard preview
  const todayProg = PROG.find(d => d.date === tStr) || PROG[0];
  const todayDone = todayProg.tasks.filter((_, i) => progress.done[`${todayProg.date}-${i}`]).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-xl mx-auto flex justify-center gap-0.5 px-2 py-1.5 overflow-x-auto">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-all shrink-0 ${
                tab === n.id
                  ? "bg-secondary font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-sm">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-xl mx-auto px-3 py-4 pb-20">

        {tab === "dash" && (
          <div className="space-y-3">
            <Countdown />
            <XPBar xp={progress.xp} />

            {/* Streak */}
            {progress.streak > 0 && (
              <div className="rounded-lg bg-accent/10 border border-accent/30 p-3 text-center">
                <span className="text-2xl">🔥</span>
                <span className="text-sm font-black text-accent ml-2">{progress.streak} jour{progress.streak > 1 ? "s" : ""} de suite!</span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {[
                { v: `J${dNum}`, l: "/20", cls: "text-info" },
                { v: `${pct}%`, l: "fait", cls: "text-success" },
                { v: String(totDone), l: `/${totTasks}`, cls: "text-grammar" },
                { v: String(DECKS.reduce((a, d) => a + d.cards.length, 0)), l: "mots", cls: "text-clinical" },
              ].map((s, i) => (
                <div key={i} className="rounded-lg bg-card p-2.5 text-center">
                  <div className={`text-lg font-black ${s.cls}`}>{s.v}</div>
                  <div className="text-[9px] text-muted-foreground">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-card p-3">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground">Progression globale</span>
                <span className="text-[10px] font-bold text-success">{pct}%</span>
              </div>
              <Progress value={pct} className="h-2 bg-muted" />
            </div>

            <MotivBanner />

            {/* Today's tasks preview */}
            <div className="rounded-xl border border-info/30 bg-card p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold">📋 Aujourd'hui — {todayProg.title}</h3>
                <span className="text-xs font-bold text-success">{todayDone}/{todayProg.tasks.length}</span>
              </div>
              {todayProg.tasks.map((task, i) => {
                const isDone = !!progress.done[`${todayProg.date}-${i}`];
                return (
                  <div key={i} className="flex items-center gap-2.5 py-1.5">
                    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                      isDone ? "bg-success border-success" : "border-muted-foreground"
                    }`}>
                      {isDone && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>
                    <span className={`text-xs ${isDone ? "line-through text-muted-foreground" : ""}`}>
                      <span className="font-bold">{task.t}:</span> {task.d.slice(0, 50)}{task.d.length > 50 ? "…" : ""}
                    </span>
                  </div>
                );
              })}
              <button onClick={() => setTab("today")} className="text-[11px] text-primary font-semibold mt-2">
                Voir tout →
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { t: "vocab" as Tab, i: "🧠", l: "Vocab" },
                { t: "iv" as Tab, i: "💼", l: "Entretien" },
                { t: "sim" as Tab, i: "🏥", l: "Cas cliniques" },
                { t: "tools" as Tab, i: "🛠️", l: "Outils" },
                { t: "stats" as Tab, i: "📊", l: "Stats" },
                { t: "cal" as Tab, i: "📅", l: "Planning" },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={() => setTab(a.t)}
                  className="rounded-xl bg-card border border-border p-3.5 text-center hover:border-primary/30 transition-all"
                >
                  <div className="text-xl mb-1">{a.i}</div>
                  <div className="text-[11px] font-semibold">{a.l}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {tab === "today" && <DayView done={progress.done} toggleTask={progress.toggleTask} />}
        {tab === "vocab" && <Vocab addXp={progress.addXp} addQuizScore={progress.addQuizScore} toggleHardCard={progress.toggleHardCard} hardCards={progress.hardCards} />}
        {tab === "gram" && <Grammar grammarDone={progress.grammarDone} toggleGrammarExercise={progress.toggleGrammarExercise} />}
        {tab === "iv" && <Interview rat={progress.rat} setRating={progress.setRating} />}
        {tab === "sim" && <Clinical />}
        {tab === "tools" && <Tools addXp={progress.addXp} cl={progress.cl} toggleChecklist={progress.toggleChecklist} notes={progress.notes} setNotes={progress.setNotes} addPomodoro={progress.addPomodoro} pomodoroCount={progress.pomodoroCount} />}
        {tab === "stats" && <Stats xp={progress.xp} quizScores={progress.quizScores} hardCards={progress.hardCards} pomodoroCount={progress.pomodoroCount} streak={progress.streak} done={progress.done} grammarDone={progress.grammarDone} rat={progress.rat} />}
        {tab === "cal" && <CalendarView done={progress.done} toggleTask={progress.toggleTask} />}
      </main>
    </div>
  );
};

export default Index;
