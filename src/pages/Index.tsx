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
import { useProgress } from "@/hooks/useProgress";
import { Progress } from "@/components/ui/progress";

type Tab = "dash" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🎯", label: "Mission" },
  { id: "today", icon: "📋", label: "Jour" },
  { id: "vocab", icon: "🧠", label: "Vocab" },
  { id: "gram", icon: "📐", label: "Gram." },
  { id: "iv", icon: "💼", label: "Entretien" },
  { id: "sim", icon: "🏥", label: "Clinique" },
  { id: "tools", icon: "🛠️", label: "Outils" },
  { id: "cal", icon: "📅", label: "Plan" },
];

const Index = () => {
  const [tab, setTab] = useState<Tab>("dash");
  const progress = useProgress();

  const tStr = new Date().toISOString().split("T")[0];
  const dNum = (PROG.findIndex(d => d.date === tStr) + 1) || 1;
  const totDone = Object.values(progress.done).filter(Boolean).length;
  const totTasks = PROG.reduce((a, d) => a + d.tasks.length, 0);
  const pct = Math.round((totDone / totTasks) * 100);

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

            <div className="grid grid-cols-3 gap-2">
              {[
                { t: "today" as Tab, i: "📋", l: "Aujourd'hui" },
                { t: "vocab" as Tab, i: "🧠", l: "Vocab" },
                { t: "iv" as Tab, i: "💼", l: "Entretien" },
                { t: "sim" as Tab, i: "🏥", l: "Cas cliniques" },
                { t: "tools" as Tab, i: "🛠️", l: "Outils" },
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
        {tab === "vocab" && <Vocab addXp={progress.addXp} />}
        {tab === "gram" && <Grammar />}
        {tab === "iv" && <Interview rat={progress.rat} setRating={progress.setRating} />}
        {tab === "sim" && <Clinical />}
        {tab === "tools" && <Tools addXp={progress.addXp} cl={progress.cl} toggleChecklist={progress.toggleChecklist} />}
        {tab === "cal" && <CalendarView done={progress.done} toggleTask={progress.toggleTask} />}
      </main>
    </div>
  );
};

export default Index;
