import { useState, useRef, useEffect, Component, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Map, Package, KeyRound, Shield } from "lucide-react";
import { PROG } from "@/data/content";
import { getBuilderRank } from "@/data/content";

// ── Tab-level Error Boundary — catches crashes in individual tabs ──
class TabErrorBoundary extends Component<{ tabName: string; children: ReactNode }, { hasError: boolean }> {
  constructor(props: { tabName: string; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error(`[TabError:${this.props.tabName}]`, error.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl p-8 text-center space-y-3 border border-border/30" style={{ background: "hsl(var(--card))" }}>
          <div className="text-3xl">🔧</div>
          <p className="text-sm font-bold">Cette section a rencontre une erreur</p>
          <p className="text-xs text-muted-foreground">Ta progression est sauvegardee. Essaie de changer d'onglet ou de recharger.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors"
          >
            Reessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function safeLocalGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeLocalSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* quota exceeded or unavailable */ }
}
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
import { InventoryArtifact3D } from "@/components/immersive/InventoryArtifact3D";
import { RewardReveal3D } from "@/components/immersive/RewardReveal3D";
import { CameraTransitionLayer, getCameraDirection } from "@/components/immersive/CameraTransitionLayer";
import { AtmosphericSceneWrapper } from "@/components/immersive/AtmosphericSceneWrapper";
import { TotemPedagogique } from "@/components/immersive/TotemPedagogique";
import { useProgress } from "@/hooks/useProgress";
import { ZONES } from "@/hooks/useProgress";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import PuzzleEngine from "@/components/PuzzleEngine";
import MetaPuzzle from "@/components/MetaPuzzle";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { MissionTimer } from "@/components/MissionTimer";
import { AchievementsPanel, ACHIEVEMENTS, type AchievementStats } from "@/components/Achievements";
import { Leaderboard } from "@/components/Leaderboard";
import { AIStatusBanner } from "@/components/AIStatusBanner";
import { InterviewSimulator } from "@/components/InterviewSimulator";

type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats" | "atelier" | "portfolio" | "questmap" | "hq" | "puzzles" | "lazarus" | "achievements" | "leaderboard" | "simulator";

const NAV: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🏥", label: "Mission" },
  { id: "questmap", icon: "🗺️", label: "Carte" },
  { id: "vocab", icon: "🔨", label: "Forge" },
  { id: "gram", icon: "🌳", label: "Arbre" },
  { id: "simulator", icon: "🎯", label: "Entretien" },
  { id: "iv", icon: "🎙️", label: "Studio" },
  { id: "sim", icon: "🏥", label: "Clinique" },
  { id: "atelier", icon: "⚗️", label: "Labo" },
  { id: "portfolio", icon: "📚", label: "Archives" },
  { id: "puzzles", icon: "🧩", label: "Enigmes" },
  { id: "lazarus", icon: "🔮", label: "Lazarus" },
  { id: "achievements", icon: "🏆", label: "Succes" },
  { id: "leaderboard", icon: "🥇", label: "Classement" },
  { id: "tools", icon: "🛠️", label: "Outils" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "cal", icon: "📅", label: "Plan" },
  { id: "motiv", icon: "🔥", label: "Vision" },
];

// Map tabs to atmosphere types for scene wrapping
const TAB_ATMOSPHERE: Record<string, "forge" | "grammar" | "studio" | "clinical" | "laboratory" | "archive" | "aerzterat" | "neutral"> = {
  dash: "neutral",
  questmap: "neutral",
  simulator: "studio",
  vocab: "forge",
  gram: "grammar",
  iv: "studio",
  sim: "clinical",
  atelier: "laboratory",
  portfolio: "archive",
  puzzles: "aerzterat",
  lazarus: "neutral",
  achievements: "neutral",
  leaderboard: "neutral",
  tools: "neutral",
  stats: "neutral",
  cal: "neutral",
  motiv: "neutral",
};

const TUTORIAL_STORAGE_KEY = "fluent-focus-tutorial-completed";

const Index = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dash");
  const prevTabRef = useRef<Tab>("dash");
  const progress = useProgress();
  const [tutorialCompleted, setTutorialCompleted] = useState(() => {
    return safeLocalGet(TUTORIAL_STORAGE_KEY) === "true";
  });

  const handleTutorialComplete = () => {
    safeLocalSet(TUTORIAL_STORAGE_KEY, "true");
    setTutorialCompleted(true);
  };

  const escapeState = progress.escapeState || { solvedRooms: [], inventory: [], discoveredRooms: [], currentMissionStep: "ch1", sigilsCollected: [], newEscapeEvents: [], solvedPuzzles: [], protocolActivated: false };
  const solvedRoomCount = escapeState.solvedRooms.length;
  const totalEscapeRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const sigilCount = escapeState.sigilsCollected.length;
  const inventoryCount = escapeState.inventory.length;

  const currentChapter = CHAPTERS.find(ch => {
    const chapterZones = ch.zones;
    return chapterZones.some(zId => {
      const zone = ESCAPE_ZONES.find(z => z.id === zId);
      if (!zone) return false;
      return zone.rooms.some(r => !escapeState.solvedRooms.includes(r.id));
    });
  }) || CHAPTERS[CHAPTERS.length - 1];

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
    for (const zone of ESCAPE_ZONES) {
      const zoneStatus = progress.escapeZoneStatus[zone.id];
      if (!zoneStatus?.unlocked) return { room: null, zone };
    }
    return null;
  })();

  const { rank, rankIndex } = getBuilderRank(progress.xp);

  // Interview readiness metrics
  const lastSimScore = (() => {
    const simArtifacts = progress.artifacts.filter(a => a.type === "interview_answer" && a.metadata?.globalScore);
    if (simArtifacts.length === 0) return null;
    const last = simArtifacts.sort((a, b) => b.date.localeCompare(a.date))[0];
    return last.metadata?.globalScore as number;
  })();

  const readinessPercent = (() => {
    const interviewAnswers = progress.artifacts.filter(a => a.type === "interview_answer");
    const uniqueQuestions = new Set(interviewAnswers.map(a => a.metadata?.simQuestionId)).size;
    const totalQuestions = 25; // total across 6 zones
    const questionCoverage = Math.min(1, uniqueQuestions / totalQuestions) * 40;
    const scoreComponent = lastSimScore ? (lastSimScore / 100) * 40 : 0;
    const practiceComponent = Math.min(1, interviewAnswers.length / 30) * 20;
    return Math.round(questionCoverage + scoreComponent + practiceComponent);
  })();

  // Achievement stats
  const achievementStats: AchievementStats = {
    totalArtifacts: progress.artifacts.length,
    totalXp: progress.xp,
    streak: progress.streak,
    solvedRooms: solvedRoomCount,
    solvedPuzzles: escapeState.solvedPuzzles?.length || 0,
    sigilsCollected: sigilCount,
    phraseCount: progress.artifacts.filter(a => a.type === "phrase_forged").length,
    grammarCount: progress.artifacts.filter(a => a.type === "grammar_phrase" || a.type === "grammar_rule" || a.type === "grammar_transform").length,
    interviewCount: progress.artifacts.filter(a => a.type === "interview_answer").length,
    clinicalCount: progress.artifacts.filter(a => a.type === "diagnostic" || a.type === "clinical_note" || a.type === "case_patient").length,
    atelierCount: progress.artifacts.filter(a => a.type === "script" || a.type === "document").length,
    completedChains: progress.questState.completedChains,
    pomodoroCount: progress.pomodoroCount,
  };

  // Compute unlocked achievements
  const unlockedAchievementIds = ACHIEVEMENTS
    .filter(a => a.condition(achievementStats))
    .map(a => a.id);

  const handleTabChange = (newTab: Tab) => {
    prevTabRef.current = tab;
    setTab(newTab);
  };

  const cameraDirection = getCameraDirection(tab);

  return (
    <div className="min-h-screen bg-background ambient-bg">
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      {/* AI Status Banner — global fallback notification */}
      <AIStatusBanner />

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        isFirstVisit={!tutorialCompleted}
        onComplete={handleTutorialComplete}
      />

      {/* Escape Game Reveal Overlay — 3D Premium */}
      <RewardReveal3D
        newEscapeEvents={escapeState.newEscapeEvents || []}
        newUnlocks={progress.questState.newUnlocks}
        onDismiss={progress.clearNewUnlocks}
      />

      {/* Sticky nav — immersive themed */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-border/30">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-hide">
          <div className="shrink-0 mr-1 flex items-center gap-1.5">
            <RankBadge xp={progress.xp} size="sm" />
            <InventoryArtifact3D items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} compact />
          </div>
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => handleTabChange(n.id)}
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

      {/* Content — with camera transitions */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <CameraTransitionLayer transitionKey={tab} direction={cameraDirection}>
          <TabErrorBoundary tabName={tab} key={tab}>
          {tab === "dash" && (
            <AtmosphericSceneWrapper atmosphere="neutral" intensity="low">
              <div className="space-y-4 stagger-children">
                {/* HERO: Mission Briefing — 3D volumetric */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative overflow-hidden rounded-3xl p-5 sm:p-7 room-3d"
                  style={{
                    background: "linear-gradient(145deg, hsl(32 95% 55% / 0.08), hsl(var(--card)), hsl(var(--primary) / 0.05))",
                    border: "1px solid hsl(32 95% 55% / 0.12)",
                    boxShadow: "var(--shadow-3d-lg)",
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-amber-500/[0.04] blur-[50px] rounded-full -translate-x-1/4 -translate-y-1/4" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/[0.03] blur-[35px] rounded-full translate-x-1/4 translate-y-1/4" />
                  </div>
                  <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-[4px] text-amber-400/70">Protocole Lazarus</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight mb-2">{CENTRAL_MISSION.title}</h1>
                    <p className="text-[11px] text-muted-foreground leading-relaxed max-w-lg">
                      {currentChapter.narrativeIntro.slice(0, 120)}...
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <Countdown lastSimScore={lastSimScore} readinessPercent={readinessPercent} />
                      <MissionTimer
                        missionId={currentChapter.id}
                        durationMinutes={30}
                        onBonusXp={progress.addXp}
                        compact
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Mission Progress — volumetric metric */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-2xl p-4 room-3d room-accessible"
                  style={{
                    background: "linear-gradient(145deg, hsl(32 95% 55% / 0.06), hsl(var(--card)), hsl(32 95% 55% / 0.03))",
                    border: "1px solid hsl(32 95% 55% / 0.18)",
                  }}
                >
                  <div className="relative z-10">
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
                          {[...Array(7)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={i < sigilCount ? { rotateY: [0, 360] } : undefined}
                              transition={{ duration: 10, repeat: Infinity, ease: "linear", delay: i * 1.4 }}
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[7px] ${
                                i < sigilCount
                                  ? "bg-amber-500/20 border-amber-500/40 sigil-3d"
                                  : "bg-secondary/20 border-border/15"
                              }`}
                            >
                              {i < sigilCount ? "🏅" : "·"}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-secondary/40 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(solvedRoomCount / totalEscapeRooms) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-amber-500/70 to-success/50 relative"
                        >
                          {solvedRoomCount > 0 && solvedRoomCount < totalEscapeRooms && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400/30 blur-[3px]" />
                          )}
                        </motion.div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400">{solvedRoomCount}/{totalEscapeRooms}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-[9px] text-muted-foreground">{sigilCount}/7 Sigils</span>
                      <span className="text-[9px] text-muted-foreground/40">·</span>
                      <span className="text-[9px] text-muted-foreground">{inventoryCount} fragments collectes</span>
                      <span className="text-[9px] text-muted-foreground/40">·</span>
                      <span className="text-[9px] text-muted-foreground">{progress.totalCreations} artefacts</span>
                    </div>
                  </div>
                </motion.div>

                {/* NEXT ROOM — 3D primary CTA */}
                {nextRoom && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -4, rotateX: 1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTabChange(ZONE_TAB_MAP[nextRoom.zone.id] as Tab || "dash")}
                    className="w-full rounded-2xl p-5 text-left relative overflow-hidden group transition-all room-3d room-in-progress"
                    style={{
                      background: "linear-gradient(145deg, hsl(var(--primary) / 0.08), hsl(var(--card)), hsl(var(--primary) / 0.04))",
                      border: "1px solid hsl(var(--primary) / 0.2)",
                    }}
                  >
                    <div className="inner-light absolute inset-0 pointer-events-none" style={{ "--inner-light-color": "hsl(var(--primary) / 0.06)" } as React.CSSProperties} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.div
                          animate={{ rotateY: [0, 8, -8, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          className="door-icon-3d w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xl shrink-0"
                          style={{ boxShadow: "var(--shadow-3d-sm)" }}
                        >
                          {nextRoom.room.icon}
                        </motion.div>
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
                      <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${nextRoom.progress.percentage}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary/30 relative"
                        >
                          {nextRoom.progress.percentage > 0 && nextRoom.progress.percentage < 100 && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/20 blur-[2px]" />
                          )}
                        </motion.div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{nextRoom.room.challenge}</p>
                    </div>
                  </motion.button>
                )}

                {/* Inventory preview — 3D */}
                <InventoryArtifact3D items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} />

                {/* Streak — volumetric */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  className={`rounded-2xl p-3 text-center room-3d ${
                    progress.streak > 0
                      ? ""
                      : ""
                  }`}
                  style={{
                    background: progress.streak > 0
                      ? "linear-gradient(145deg, hsl(var(--accent) / 0.08), hsl(var(--card)))"
                      : "linear-gradient(145deg, hsl(var(--secondary) / 0.15), hsl(var(--card)))",
                    border: progress.streak > 0
                      ? "1px solid hsl(var(--accent) / 0.15)"
                      : "1px solid hsl(var(--border) / 0.2)",
                  }}
                >
                  {progress.streak > 0 ? (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-lg">🔥</motion.span>
                      <span className="text-xs font-black text-accent">{progress.streak} jour{progress.streak > 1 ? "s" : ""} de suite</span>
                      {progress.streak >= 3 && <span className="text-[8px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-bold">Momentum</span>}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <span className="text-sm">⚡</span>
                      <span className="text-[10px] text-muted-foreground">Cree ton premier artefact pour lancer ta serie</span>
                    </div>
                  )}
                </motion.div>

                {/* Daily Mission Protocol */}
                <div className="rounded-2xl p-5 room-3d"
                  style={{
                    background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
                    border: "1px solid hsl(var(--border) / 0.4)",
                  }}
                >
                  <DailyChain
                    chainStatus={progress.chainStatus}
                    zoneStatus={progress.zoneStatus}
                    onNavigate={handleTabChange}
                    completedChains={progress.questState.completedChains}
                  />
                </div>

                {/* Mission Timer — full widget */}
                <MissionTimer
                  missionId={currentChapter.id}
                  durationMinutes={30}
                  onBonusXp={progress.addXp}
                />

                {/* Next locked room teaser — 3D locked door */}
                {nextLockedRoom && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="rounded-2xl p-4 relative overflow-hidden room-3d room-locked"
                  >
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="door-icon-3d w-10 h-10 rounded-xl bg-secondary/30 border border-border/20 flex items-center justify-center"
                        style={{ boxShadow: "var(--shadow-3d-sm)" }}>
                        <KeyRound className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[9px] uppercase tracking-[2px] text-muted-foreground/50">Porte verrouille</p>
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

                {/* Builder Rank */}
                <XPBar xp={progress.xp} />

                {/* Quick zone access — 3D escape game cards */}
                <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {ESCAPE_ZONES.map((zone, i) => {
                    const zs = progress.escapeZoneStatus[zone.id];
                    const isLocked = !zs?.unlocked;
                    const isCleared = zs?.roomsSolved === zs?.totalRooms;
                    const tabTarget = ZONE_TAB_MAP[zone.id] as Tab;

                    return (
                      <motion.button
                        key={zone.id}
                        initial={{ opacity: 0, y: 12, rotateX: -3 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        whileHover={!isLocked ? { y: -5, rotateX: 2, scale: 1.03 } : undefined}
                        whileTap={!isLocked ? { scale: 0.97 } : undefined}
                        onClick={() => { if (!isLocked) handleTabChange(tabTarget); }}
                        disabled={isLocked}
                        className={`rounded-2xl border p-3 sm:p-4 text-center transition-all relative overflow-hidden iso-building ${
                          isLocked
                            ? "opacity-30 cursor-not-allowed"
                            : isCleared
                            ? ""
                            : ""
                        }`}
                        style={{
                          background: isLocked
                            ? "linear-gradient(145deg, hsl(225 14% 10%), hsl(225 14% 8%))"
                            : isCleared
                            ? "linear-gradient(145deg, hsl(var(--success) / 0.08), hsl(var(--card)))"
                            : "linear-gradient(145deg, hsl(var(--primary) / 0.06), hsl(var(--card)))",
                          border: isLocked
                            ? "1px solid hsl(225 14% 12%)"
                            : isCleared
                            ? "1px solid hsl(var(--success) / 0.2)"
                            : "1px solid hsl(var(--border) / 0.3)",
                          boxShadow: isLocked ? "var(--shadow-3d-sm)" : "var(--shadow-3d-md)",
                        }}
                      >
                        {isLocked && <div className="fog-3d absolute inset-0 rounded-2xl" />}
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

                {/* Explore map CTA — 3D */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange("questmap")}
                  className="w-full rounded-2xl p-4 text-left group transition-all room-3d"
                  style={{
                    background: "linear-gradient(145deg, hsl(32 95% 55% / 0.06), hsl(var(--card)))",
                    border: "1px solid hsl(32 95% 55% / 0.15)",
                  }}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div
                      animate={{ rotateY: [0, 8, -8, 0] }}
                      transition={{ duration: 6, repeat: Infinity }}
                      className="door-icon-3d w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
                      style={{ boxShadow: "var(--shadow-3d-sm)" }}
                    >🗺️</motion.div>
                    <div className="flex-1">
                      <p className="text-xs font-black tracking-tight">Explorer la carte du Complexe</p>
                      <p className="text-[10px] text-muted-foreground">{solvedRoomCount} salles resolues — {totalEscapeRooms - solvedRoomCount} portes encore verrouillees</p>
                    </div>
                    <Map className="w-4 h-4 text-amber-400/40 group-hover:text-amber-400 transition-colors" />
                  </div>
                </motion.button>

                <MotivBanner />
              </div>
            </AtmosphericSceneWrapper>
          )}

          {tab === "questmap" && (
            <EscapeMap
              escapeZoneStatus={progress.escapeZoneStatus}
              artifacts={progress.artifacts}
              onNavigate={(t) => handleTabChange(t as Tab)}
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
          {tab === "portfolio" && (
            <AtmosphericSceneWrapper atmosphere="archive" intensity="low">
              <Portfolio artifacts={progress.artifacts} earnedBadges={progress.earnedBadges || []} />
            </AtmosphericSceneWrapper>
          )}
          {tab === "motiv" && <VisionBoard />}
          {tab === "today" && <DayView done={progress.done} toggleTask={progress.toggleTask} />}
          {tab === "vocab" && (
            <AtmosphericSceneWrapper atmosphere="forge" intensity="low">
              <Vocab
                addXp={progress.addXp}
                addQuizScore={progress.addQuizScore}
                toggleHardCard={progress.toggleHardCard}
                hardCards={progress.hardCards}
                addArtifact={progress.addArtifact}
                artifacts={progress.artifacts}
              />
            </AtmosphericSceneWrapper>
          )}
          {tab === "gram" && (
            <AtmosphericSceneWrapper atmosphere="grammar" intensity="low">
              <Grammar
                grammarDone={progress.grammarDone}
                toggleGrammarExercise={progress.toggleGrammarExercise}
                addArtifact={progress.addArtifact}
                artifacts={progress.artifacts}
                addXp={progress.addXp}
              />
            </AtmosphericSceneWrapper>
          )}
          {tab === "simulator" && (
            <InterviewSimulator
              addXp={progress.addXp}
              onNavigate={(t) => handleTabChange(t as Tab)}
              addArtifact={progress.addArtifact}
              artifacts={progress.artifacts}
            />
          )}
          {tab === "iv" && (
            <AtmosphericSceneWrapper atmosphere="studio" intensity="low">
              <Interview
                rat={progress.rat}
                setRating={progress.setRating}
                addXp={progress.addXp}
                onNavigate={(t) => handleTabChange(t as Tab)}
                addArtifact={progress.addArtifact}
                artifacts={progress.artifacts}
              />
            </AtmosphericSceneWrapper>
          )}
          {tab === "sim" && (
            <AtmosphericSceneWrapper atmosphere="clinical" intensity="low">
              <Clinical
                addArtifact={progress.addArtifact}
                artifacts={progress.artifacts}
                addXp={progress.addXp}
              />
            </AtmosphericSceneWrapper>
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
          {tab === "puzzles" && (
            <AtmosphericSceneWrapper atmosphere="aerzterat" intensity="low">
              <PuzzleEngine
                onPuzzleSolved={progress.solvePuzzle}
                solvedPuzzleIds={escapeState.solvedPuzzles || []}
              />
            </AtmosphericSceneWrapper>
          )}
          {tab === "lazarus" && (
            <AtmosphericSceneWrapper atmosphere="neutral" intensity="medium">
              <MetaPuzzle
                sigilsCollected={escapeState.sigilsCollected}
                onActivateProtocol={progress.activateProtocol}
              />
            </AtmosphericSceneWrapper>
          )}
          {tab === "achievements" && (
            <AtmosphericSceneWrapper atmosphere="neutral" intensity="low">
              <AchievementsPanel
                stats={achievementStats}
                unlockedIds={unlockedAchievementIds}
              />
            </AtmosphericSceneWrapper>
          )}
          {tab === "leaderboard" && (
            <AtmosphericSceneWrapper atmosphere="neutral" intensity="low">
              <Leaderboard
                currentXp={progress.xp}
                currentStreak={progress.streak}
                currentSigils={sigilCount}
                currentRooms={solvedRoomCount}
                currentArtifacts={progress.artifacts.length}
              />
            </AtmosphericSceneWrapper>
          )}
          {tab === "cal" && <CalendarView done={progress.done} toggleTask={progress.toggleTask} />}
          </TabErrorBoundary>
        </CameraTransitionLayer>
      </main>
    </div>
  );
};

export default Index;
