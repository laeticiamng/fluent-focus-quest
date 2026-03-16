import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Map, Package, KeyRound, Shield } from "lucide-react";
import { PROG } from "@/data/content";
import { getBuilderRank } from "@/data/content";
import { ESCAPE_ZONES, CENTRAL_MISSION, CHAPTERS, ZONE_TAB_MAP, computeRoomProgress } from "@/data/escapeGame";
import { Countdown } from "@/components/Countdown";
import { XPBar, RankBadge } from "@/components/XPBar";
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
import { EscapeMap } from "@/components/EscapeMap";
import { StudioWall } from "@/components/StudioWall";
import { DailyChain } from "@/components/DailyChain";
import { EscapeReveal } from "@/components/EscapeReveal";
import { Inventory } from "@/components/Inventory";
import { useProgress } from "@/hooks/useProgress";
import { ZONES } from "@/hooks/useProgress";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats" | "atelier" | "portfolio" | "questmap" | "hq";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🏥", label: "Mission" },
  { id: "questmap", icon: "🗺️", label: "Carte" },
  { id: "vocab", icon: "🔨", label: "Forge" },
  { id: "gram", icon: "🌳", label: "Arbre" },
  { id: "iv", icon: "🎙️", label: "Studio" },
  { id: "sim", icon: "🏥", label: "Clinique" },
  { id: "atelier", icon: "⚗️", label: "Labo" },
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

  const escapeState = progress.escapeState || { solvedRooms: [], inventory: [], discoveredRooms: [], currentMissionStep: "ch1", sigilsCollected: [], newEscapeEvents: [] };
  const solvedRoomCount = escapeState.solvedRooms.length;
  const totalEscapeRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const sigilCount = escapeState.sigilsCollected.length;
  const inventoryCount = escapeState.inventory.length;

  // Find current chapter
  const currentChapter = CHAPTERS.find(ch => {
    const chapterZones = ch.zones;
    return chapterZones.some(zId => {
      const zone = ESCAPE_ZONES.find(z => z.id === zId);
      if (!zone) return false;
      return zone.rooms.some(r => !escapeState.solvedRooms.includes(r.id));
    });
  }) || CHAPTERS[CHAPTERS.length - 1];

  // Find next room to solve
  const nextRoom = (() => {
    for (const zone of ESCAPE_ZONES) {
      const zoneStatus = progress.escapeZoneStatus[zone.id];
      if (!zoneStatus?.unlocked) continue;
      for (const room of zone.rooms) {
        const roomStatus = zoneStatus.rooms.find(r => r.id === room.id);
        if (roomStatus && (roomStatus.status === "accessible" || roomStatus.status === "in_progress")) {
          const prog = computeRoomProgress(room, progress.artifacts);
          return { room, zone, progress: prog };
        }
      }
    }
    return null;
  })();

  // Find next locked room (to tease)
  const nextLockedRoom = (() => {
    for (const zone of ESCAPE_ZONES) {
      const zoneStatus = progress.escapeZoneStatus[zone.id];
      if (!zoneStatus?.unlocked) continue;
      for (const room of zone.rooms) {
        const roomStatus = zoneStatus.rooms.find(r => r.id === room.id);
        if (roomStatus && roomStatus.status === "locked") {
          return { room, zone };
        }
      }
    }
    // Find next locked zone
    for (const zone of ESCAPE_ZONES) {
      const zoneStatus = progress.escapeZoneStatus[zone.id];
      if (!zoneStatus?.unlocked) return { room: null, zone };
    }
    return null;
  })();

  const { rank, rankIndex } = getBuilderRank(progress.xp);

  return (
    <div className="min-h-screen bg-background ambient-bg">
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* Escape Game Reveal Overlay */}
      <EscapeReveal
        newEscapeEvents={escapeState.newEscapeEvents || []}
        newUnlocks={progress.questState.newUnlocks}
        onDismiss={progress.clearNewUnlocks}
      />

      {/* Sticky nav — escape game themed */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-border/30">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-hide">
          <div className="shrink-0 mr-1 flex items-center gap-1.5">
            <RankBadge xp={progress.xp} size="sm" />
            <Inventory items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} compact />
          </div>
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
            <div className="space-y-4 stagger-children">
              {/* HERO: Mission Briefing */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/12 via-card to-primary/8 border border-amber-500/15 p-5 sm:p-7"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-[4px] text-amber-400/70">Protocole Lazarus</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2">{CENTRAL_MISSION.title}</h1>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-lg">
                    {currentChapter.narrativeIntro.slice(0, 120)}...
                  </p>
                  <div className="mt-4">
                    <Countdown />
                  </div>
                </div>
              </motion.div>

              {/* Mission Progress — primary metric */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-black tracking-tight">Progression du Complexe</p>
                      <p className="text-[10px] text-muted-foreground">{currentChapter.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center text-[7px] ${
                            i < sigilCount
                              ? "bg-amber-500/20 border-amber-500/40"
                              : "bg-secondary/20 border-border/15"
                          }`}
                        >
                          {i < sigilCount ? "🏅" : "·"}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2.5 bg-secondary/40 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(solvedRoomCount / totalEscapeRooms) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500/70 to-success/50"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-amber-400">{solvedRoomCount}/{totalEscapeRooms}</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[9px] text-muted-foreground">{sigilCount}/6 Sigils</span>
                  <span className="text-[9px] text-muted-foreground/40">·</span>
                  <span className="text-[9px] text-muted-foreground">{inventoryCount} fragments collectes</span>
                  <span className="text-[9px] text-muted-foreground/40">·</span>
                  <span className="text-[9px] text-muted-foreground">{progress.totalCreations} artefacts</span>
                </div>
              </motion.div>

              {/* NEXT ROOM — primary CTA */}
              {nextRoom && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTab(ZONE_TAB_MAP[nextRoom.zone.id] as Tab || "dash")}
                  className="w-full rounded-2xl bg-gradient-to-r from-primary/12 via-primary/6 to-transparent border border-primary/20 p-5 text-left relative overflow-hidden group transition-all hover:border-primary/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                        {nextRoom.room.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-[2px] text-primary/60">Prochaine epreuve</p>
                        <p className="text-sm font-black tracking-tight">{nextRoom.room.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{nextRoom.zone.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-primary">{nextRoom.progress.current}/{nextRoom.progress.threshold}</p>
                        <p className="text-[9px] text-muted-foreground">pour resoudre</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextRoom.progress.percentage}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary/30"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{nextRoom.room.challenge}</p>
                  </div>
                </motion.button>
              )}

              {/* Inventory preview */}
              <Inventory items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} />

              {/* Streak */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className={`rounded-2xl p-3 text-center ${
                  progress.streak > 0
                    ? "bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/15"
                    : "bg-secondary/20 border border-border/20"
                }`}
              >
                {progress.streak > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-lg">🔥</motion.span>
                    <span className="text-xs font-black text-accent">{progress.streak} jour{progress.streak > 1 ? "s" : ""} de suite</span>
                    {progress.streak >= 3 && <span className="text-[8px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">Momentum</span>}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm">⚡</span>
                    <span className="text-[10px] text-muted-foreground">Cree ton premier artefact pour lancer ta serie</span>
                  </div>
                )}
              </motion.div>

              {/* Daily Mission Protocol */}
              <div className="card-elevated rounded-2xl p-5">
                <DailyChain
                  chainStatus={progress.chainStatus}
                  zoneStatus={progress.zoneStatus}
                  onNavigate={setTab}
                  completedChains={progress.questState.completedChains}
                />
              </div>

              {/* Next locked room teaser */}
              {nextLockedRoom && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="rounded-2xl bg-secondary/15 border border-border/15 p-4 relative overflow-hidden"
                >
                  <div className="absolute inset-0 backdrop-blur-[1px] bg-background/10 pointer-events-none" />
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-secondary/30 border border-border/20 flex items-center justify-center">
                      <KeyRound className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] uppercase tracking-[2px] text-muted-foreground/50">Porte verrouillee</p>
                      <p className="text-xs font-bold text-muted-foreground/60">
                        {nextLockedRoom.room ? nextLockedRoom.room.name : nextLockedRoom.zone.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 mt-0.5">
                        {nextLockedRoom.room ? nextLockedRoom.room.unlockRequirement.details : nextLockedRoom.zone.unlockRequirement.details}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Builder Rank — secondary */}
              <XPBar xp={progress.xp} />

              {/* Quick zone access — escape game style */}
              <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {ESCAPE_ZONES.map((zone, i) => {
                  const zs = progress.escapeZoneStatus[zone.id];
                  const isLocked = !zs?.unlocked;
                  const isCleared = zs?.roomsSolved === zs?.totalRooms;
                  const tabTarget = ZONE_TAB_MAP[zone.id] as Tab;

                  return (
                    <motion.button
                      key={zone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.04 }}
                      whileHover={!isLocked ? { y: -3, scale: 1.02 } : undefined}
                      whileTap={!isLocked ? { scale: 0.97 } : undefined}
                      onClick={() => { if (!isLocked) setTab(tabTarget); }}
                      disabled={isLocked}
                      className={`rounded-2xl border p-3 sm:p-4 text-center transition-all relative overflow-hidden ${
                        isLocked
                          ? "opacity-30 cursor-not-allowed bg-secondary/10 border-border/10"
                          : isCleared
                          ? "bg-gradient-to-b from-success/10 to-transparent border-success/20"
                          : "bg-gradient-to-b from-primary/8 to-transparent border-border/30 hover:border-border/50"
                      }`}
                    >
                      {isLocked && <div className="absolute inset-0 backdrop-blur-[1px] bg-background/30" />}
                      <div className="relative z-10">
                        <div className="text-xl sm:text-2xl mb-1">
                          {isLocked ? "🔒" : isCleared ? "✅" : zone.icon}
                        </div>
                        <div className="text-[9px] sm:text-[10px] font-bold tracking-tight leading-tight">
                          {zone.name.replace("Aile de la ", "").replace("Aile de l'", "").replace("Aile du ", "").replace("Aile d'", "").slice(0, 12)}
                        </div>
                        {!isLocked && zs && (
                          <div className="mt-1.5 h-1 bg-secondary/30 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isCleared ? "bg-success/50" : "bg-amber-500/40"}`}
                              style={{ width: `${zs.progress * 100}%` }}
                            />
                          </div>
                        )}
                        {!isLocked && zs && (
                          <p className="text-[8px] text-muted-foreground mt-1">{zs.roomsSolved}/{zs.totalRooms}</p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Explore map CTA */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab("questmap")}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15 p-4 text-left group transition-all hover:border-amber-500/25"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🗺️</div>
                  <div className="flex-1">
                    <p className="text-xs font-black tracking-tight">Explorer la carte du Complexe</p>
                    <p className="text-[10px] text-muted-foreground">{solvedRoomCount} salles resolues — {totalEscapeRooms - solvedRoomCount} portes encore verrouillees</p>
                  </div>
                  <Map className="w-4 h-4 text-amber-400/40 group-hover:text-amber-400 transition-colors" />
                </div>
              </motion.button>

              <MotivBanner />
            </div>
          )}

          {tab === "questmap" && (
            <EscapeMap
              escapeZoneStatus={progress.escapeZoneStatus}
              artifacts={progress.artifacts}
              onNavigate={(t) => setTab(t as Tab)}
              sigilsCollected={escapeState.sigilsCollected}
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
