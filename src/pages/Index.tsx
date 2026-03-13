import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, BookOpen, Map, Zap } from "lucide-react";
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
import { AtelierHub } from "@/components/AtelierHub";
import { Portfolio } from "@/components/Portfolio";
import { QuestMap } from "@/components/QuestMap";
import { StudioWall } from "@/components/StudioWall";
import { DailyChain } from "@/components/DailyChain";
import { UnlockReveal, NextUnlockCard } from "@/components/UnlockSystem";
import { useProgress } from "@/hooks/useProgress";
import { ZONES } from "@/hooks/useProgress";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats" | "atelier" | "portfolio" | "questmap" | "hq";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🎯", label: "QG" },
  { id: "questmap", icon: "🗺️", label: "Carte" },
  { id: "atelier", icon: "✨", label: "Creer" },
  { id: "vocab", icon: "🔨", label: "Forge" },
  { id: "gram", icon: "🌳", label: "Arbre" },
  { id: "iv", icon: "💼", label: "Studio" },
  { id: "sim", icon: "🏥", label: "Hopital" },
  { id: "portfolio", icon: "📚", label: "Archives" },
  { id: "tools", icon: "🛠️", label: "Outils" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "cal", icon: "📅", label: "Plan" },
  { id: "motiv", icon: "🔥", label: "Vision" },
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
  const unlockedZoneCount = Object.values(progress.zoneStatus).filter(z => z.unlocked).length;

  return (
    <div className="min-h-screen bg-background ambient-bg">
      {/* Ambient floating orbs */}
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* Unlock Reveal Overlay */}
      <UnlockReveal
        newUnlocks={progress.questState.newUnlocks}
        onDismiss={progress.clearNewUnlocks}
      />

      {/* Sticky nav */}
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
              {/* Hero section — Mission Control */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/15 via-card to-grammar/10 border border-amber-500/15 p-6 sm:p-8"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <Countdown />
                </div>
              </motion.div>

              {/* Quest Status Bar */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏰</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <motion.span
                          key={progress.creationsToday}
                          initial={{ scale: 1.5, color: "rgb(245 158 11)" }}
                          animate={{ scale: 1, color: "inherit" }}
                          transition={{ duration: 0.5, type: "spring" }}
                          className="text-xl font-black text-amber-400"
                        >
                          {progress.creationsToday}
                        </motion.span>
                        <span className="text-xs text-muted-foreground">creations aujourd'hui</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {progress.totalCreations} au total · {unlockedZoneCount}/{ZONES.length} zones
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTab("questmap")}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 rounded-full px-3 py-1.5 border border-amber-500/20 hover:bg-amber-500/15 transition-all"
                    >
                      <Map className="w-3 h-3" /> Carte
                    </button>
                    <button
                      onClick={() => setTab("portfolio")}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-secondary/50 rounded-full px-3 py-1.5 border border-border/30 hover:text-foreground transition-all"
                    >
                      <BookOpen className="w-3 h-3" /> Archives
                    </button>
                  </div>
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

              {/* Stats grid — Quest focused */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { v: `J${dNum}`, l: "/20", cls: "text-info", bg: "from-info/10 to-info/5" },
                  { v: `${unlockedZoneCount}/${ZONES.length}`, l: "zones", cls: "text-amber-400", bg: "from-amber-500/10 to-amber-500/5" },
                  { v: String(progress.totalCreations), l: "forgees", cls: "text-success", bg: "from-success/10 to-success/5" },
                  { v: String(progress.artifacts.filter(a => a.type === "interview_answer").length), l: "reponses", cls: "text-clinical", bg: "from-clinical/10 to-clinical/5" },
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

              {/* Daily Chain — replaces DailyJourney */}
              <div className="card-elevated rounded-2xl p-5 sm:p-6">
                <DailyChain
                  chainStatus={progress.chainStatus}
                  zoneStatus={progress.zoneStatus}
                  onNavigate={setTab}
                  completedChains={progress.questState.completedChains}
                />
              </div>

              {/* Next Unlock Card */}
              <NextUnlockCard artifacts={progress.artifacts} zoneStatus={progress.zoneStatus} />

              {/* Progress bar */}
              <div className="card-elevated rounded-2xl p-5">
                <div className="flex justify-between mb-3">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground">Progression globale</span>
                  <span className="text-xs sm:text-sm font-bold text-success">{pct}%</span>
                </div>
                <Progress value={pct} className="h-2 bg-secondary rounded-full" />
              </div>

              <MotivBanner />

              {/* Quest Map CTA */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab("questmap")}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500/15 via-grammar/10 to-accent/12 border border-amber-500/25 p-5 text-left relative overflow-hidden group transition-all hover:border-amber-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">🗺️</div>
                  <div className="flex-1">
                    <p className="text-sm font-black tracking-tight">Explorer la carte des quetes</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{unlockedZoneCount} zone{unlockedZoneCount > 1 ? "s" : ""} debloquee{unlockedZoneCount > 1 ? "s" : ""} — chaque creation ouvre de nouvelles zones</p>
                  </div>
                  <span className="text-amber-400 font-bold text-lg opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </motion.button>

              {/* Quick Zone Access */}
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { t: "vocab" as Tab, i: "🔨", l: "Forge", bg: "from-amber-500/8 to-transparent", zone: "forge" as const },
                  { t: "gram" as Tab, i: "🌳", l: "Arbre", bg: "from-emerald-500/8 to-transparent", zone: "grammar" as const },
                  { t: "iv" as Tab, i: "💼", l: "Studio", bg: "from-violet-500/8 to-transparent", zone: "studio" as const },
                  { t: "sim" as Tab, i: "🏥", l: "Hopital", bg: "from-rose-500/8 to-transparent", zone: "clinical" as const },
                  { t: "atelier" as Tab, i: "✨", l: "Ateliers", bg: "from-blue-500/8 to-transparent", zone: "atelier" as const },
                  { t: "portfolio" as Tab, i: "📚", l: "Archives", bg: "from-cyan-500/8 to-transparent", zone: "archive" as const },
                ].map((a, i) => {
                  const isLocked = !progress.zoneStatus[a.zone]?.unlocked;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.04 }}
                      whileHover={!isLocked ? { y: -3, scale: 1.02 } : undefined}
                      whileTap={!isLocked ? { scale: 0.97 } : undefined}
                      onClick={() => { if (!isLocked) setTab(a.t); }}
                      disabled={isLocked}
                      className={`rounded-2xl bg-gradient-to-b ${a.bg} border border-border/40 p-4 sm:p-5 text-center transition-all ${
                        isLocked ? "opacity-40 cursor-not-allowed" : "hover:border-border/60"
                      }`}
                    >
                      <div className="text-2xl sm:text-3xl mb-2">{isLocked ? "🔒" : a.i}</div>
                      <div className="text-[10px] sm:text-xs font-semibold tracking-tight">{a.l}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "questmap" && (
            <QuestMap
              zoneStatus={progress.zoneStatus}
              currentZoneId={progress.questState.currentZoneId}
              onSelectZone={progress.setCurrentZone}
              onNavigate={setTab}
            />
          )}
          {tab === "hq" && (
            <StudioWall
              artifacts={progress.artifacts}
              zoneStatus={progress.zoneStatus}
              earnedBadges={progress.earnedBadges || []}
              streak={progress.streak}
              xp={progress.xp}
            />
          )}
          {tab === "atelier" && <AtelierHub addXp={progress.addXp} xp={progress.xp} />}
          {tab === "portfolio" && <Portfolio artifacts={progress.artifacts} earnedBadges={progress.earnedBadges || []} />}
          {tab === "motiv" && <VisionBoard />}
          {tab === "today" && <DayView done={progress.done} toggleTask={progress.toggleTask} />}
          {tab === "vocab" && (
            <Vocab
              addXp={progress.addXp}
              addQuizScore={progress.addQuizScore}
              toggleHardCard={progress.toggleHardCard}
              hardCards={progress.hardCards}
              addArtifact={progress.addArtifact}
              artifacts={progress.artifacts}
            />
          )}
          {tab === "gram" && (
            <Grammar
              grammarDone={progress.grammarDone}
              toggleGrammarExercise={progress.toggleGrammarExercise}
              addArtifact={progress.addArtifact}
              artifacts={progress.artifacts}
              addXp={progress.addXp}
            />
          )}
          {tab === "iv" && (
            <Interview
              rat={progress.rat}
              setRating={progress.setRating}
              addXp={progress.addXp}
              onNavigate={(t) => setTab(t as Tab)}
              addArtifact={progress.addArtifact}
              artifacts={progress.artifacts}
            />
          )}
          {tab === "sim" && (
            <Clinical
              addArtifact={progress.addArtifact}
              artifacts={progress.artifacts}
              addXp={progress.addXp}
            />
          )}
          {tab === "tools" && <Tools addXp={progress.addXp} cl={progress.cl} toggleChecklist={progress.toggleChecklist} notes={progress.notes} setNotes={progress.setNotes} addPomodoro={progress.addPomodoro} pomodoroCount={progress.pomodoroCount} />}
          {tab === "stats" && (
            <Stats
              xp={progress.xp}
              quizScores={progress.quizScores}
              hardCards={progress.hardCards}
              pomodoroCount={progress.pomodoroCount}
              streak={progress.streak}
              done={progress.done}
              grammarDone={progress.grammarDone}
              rat={progress.rat}
              artifacts={progress.artifacts}
              zoneStatus={progress.zoneStatus}
            />
          )}
          {tab === "cal" && <CalendarView done={progress.done} toggleTask={progress.toggleTask} />}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
