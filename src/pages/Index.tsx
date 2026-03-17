import { useState, useRef, useEffect, Component, type ReactNode, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Map, Package, KeyRound, Shield, Rocket, Zap } from "lucide-react";
import { PROG } from "@/data/content";
import { getBuilderRank } from "@/data/content";
import { WebGLGate } from "@/components/3d/WebGLDetect";

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
import { PhraseGate } from "@/components/PhraseGate";

// Lazy-loaded 3D scenes (only loaded when WebGL available)
const HubScene = lazy(() => import("@/components/3d/HubScene").then(m => ({ default: m.HubScene })));
const MapScene = lazy(() => import("@/components/3d/MapScene").then(m => ({ default: m.MapScene })));
const Inventory3DScene = lazy(() => import("@/components/3d/Inventory3DScene").then(m => ({ default: m.Inventory3DScene })));
const LazarusScene = lazy(() => import("@/components/3d/LazarusScene").then(m => ({ default: m.LazarusScene })));

type Tab = "dash" | "motiv" | "today" | "vocab" | "gram" | "iv" | "sim" | "tools" | "cal" | "stats" | "atelier" | "portfolio" | "questmap" | "hq" | "puzzles" | "lazarus" | "achievements" | "leaderboard" | "simulator";

// Primary tabs: visible in main nav, ordered by interview-prep priority
const NAV_PRIMARY: { id: Tab; icon: string; label: string }[] = [
  { id: "dash", icon: "🏥", label: "Mission" },
  { id: "simulator", icon: "🎯", label: "Entretien" },
  { id: "iv", icon: "🎙️", label: "Studio" },
  { id: "vocab", icon: "🔨", label: "Forge" },
  { id: "gram", icon: "🌳", label: "Arbre" },
  { id: "sim", icon: "🏥", label: "Clinique" },
  { id: "questmap", icon: "🗺️", label: "Carte" },
];

// Secondary tabs: accessible via "Plus" expandable section
const NAV_SECONDARY: { id: Tab; icon: string; label: string }[] = [
  { id: "atelier", icon: "⚗️", label: "Labo" },
  { id: "portfolio", icon: "📚", label: "Archives" },
  { id: "puzzles", icon: "🧩", label: "Enigmes" },
  { id: "lazarus", icon: "🔮", label: "Lazarus" },
  { id: "achievements", icon: "🏆", label: "Succes" },
  { id: "stats", icon: "📊", label: "Stats" },
  { id: "tools", icon: "🛠️", label: "Outils" },
  { id: "cal", icon: "📅", label: "Plan" },
  { id: "motiv", icon: "🔥", label: "Vision" },
  { id: "leaderboard", icon: "🥇", label: "Classement" },
];

const NAV = [...NAV_PRIMARY, ...NAV_SECONDARY];

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

// Lazarus wrapper that combines 3D scene with puzzle controls
function LazarusWithScene({ sigilsCollected, onActivateProtocol }: { sigilsCollected: string[]; onActivateProtocol: () => void }) {
  const [arrangement, setArrangement] = useState<string[]>([]);
  const [activated, setActivated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleAddToArrangement = (id: string) => {
    if (arrangement.includes(id)) return;
    setArrangement([...arrangement, id]);
    setFeedback(null);
  };
  const handleRemoveFromArrangement = (id: string) => {
    setArrangement(arrangement.filter(x => x !== id));
    setFeedback(null);
  };
  const handleValidate = () => {
    const expectedOrder = ["meta-forge", "meta-grammar", "meta-studio", "meta-clinical", "meta-lab", "meta-archive", "meta-aerzterat"];
    const isCorrect = arrangement.length >= 6 && arrangement.every((id, i) => id === expectedOrder[i]);
    if (isCorrect) {
      setActivated(true);
      setFeedback(null);
      onActivateProtocol();
    } else {
      setFeedback("L'ordre n'est pas correct. Pense a la progression logique : des bases linguistiques jusqu'au Conseil.");
    }
  };

  return (
    <div className="space-y-4">
      <Suspense fallback={
        <div className="h-[300px] flex items-center justify-center bg-card/50 rounded-2xl">
          <p className="text-[10px] text-muted-foreground animate-pulse">Chargement du Protocole Lazarus...</p>
        </div>
      }>
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(270 60% 55% / 0.15)" }}>
          <LazarusScene
            sigilsCollected={sigilsCollected}
            arrangement={arrangement}
            onAddToArrangement={handleAddToArrangement}
            onRemoveFromArrangement={handleRemoveFromArrangement}
            activated={activated}
            feedback={feedback}
          />
        </div>
      </Suspense>

      {/* Controls below the 3D scene */}
      {!activated && (
        <div className="rounded-2xl p-4 space-y-3" style={{
          background: "linear-gradient(145deg, hsl(270 60% 60% / 0.08), hsl(var(--card)))",
          border: "1px solid hsl(270 60% 60% / 0.15)",
        }}>
          <p className="text-[10px] text-muted-foreground">
            Clique sur les sigils dans la scene 3D pour les placer dans l'ordre correct. L'ordre suit la progression logique de ta formation.
          </p>
          {arrangement.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {arrangement.map((id, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/25 text-[10px] text-amber-400 font-bold">
                  #{i + 1}
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleValidate}
              disabled={arrangement.length < 6}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition-all disabled:opacity-30"
            >
              Activer le Protocole
            </button>
            <button
              onClick={() => { setArrangement([]); setFeedback(null); }}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm"
            >
              Reset
            </button>
          </div>
          {feedback && (
            <p className="text-rose-400 text-[11px] p-3 rounded-lg bg-rose-500/10 border border-rose-500/15">{feedback}</p>
          )}
        </div>
      )}
      {activated && (
        <div className="rounded-2xl p-6 text-center" style={{
          background: "linear-gradient(145deg, hsl(38 92% 50% / 0.1), hsl(var(--card)))",
          border: "1px solid hsl(38 92% 50% / 0.2)",
        }}>
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-lg font-black text-amber-400">Protocole Lazarus Active</h3>
          <p className="text-[11px] text-muted-foreground mt-2">
            Le Complexe Medical est rouvert. Tu es reconnue comme Assistenzarztin du Gefasszentrum.
          </p>
        </div>
      )}
    </div>
  );
}

const Index = () => {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("dash");
  const prevTabRef = useRef<Tab>("dash");
  const progress = useProgress();
  const [tutorialCompleted, setTutorialCompleted] = useState(() => {
    return safeLocalGet(TUTORIAL_STORAGE_KEY) === "true";
  });
  const [mapSelectedZone, setMapSelectedZone] = useState<string | null>(null);
  const [inventorySelectedItem, setInventorySelectedItem] = useState<string | null>(null);
  const [showMoreTabs, setShowMoreTabs] = useState(false);

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

      {/* Sticky nav — focused on interview prep priority */}
      <nav className="sticky top-0 z-50 glass-nav border-b border-border/30">
        <div className="max-w-5xl mx-auto flex items-center gap-0.5 px-2 py-2 overflow-x-auto scrollbar-hide">
          <div className="shrink-0 mr-1 flex items-center gap-1.5">
            <RankBadge xp={progress.xp} size="sm" />
          </div>
          {NAV_PRIMARY.map(n => (
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
          {/* More tabs toggle */}
          <button
            onClick={() => setShowMoreTabs(!showMoreTabs)}
            className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl text-[10px] sm:text-[11px] transition-all duration-200 shrink-0 relative ${
              showMoreTabs || NAV_SECONDARY.some(n => n.id === tab)
                ? "font-bold text-foreground"
                : "text-muted-foreground hover:text-foreground/70"
            }`}
          >
            <span className="text-sm sm:text-base relative z-10">...</span>
            <span className="relative z-10">Plus</span>
          </button>
          <button onClick={signOut} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] text-muted-foreground hover:text-foreground/70 shrink-0">
            <LogOut className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Sortir</span>
          </button>
        </div>
        {/* Expanded secondary tabs */}
        {showMoreTabs && (
          <div className="max-w-5xl mx-auto flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-hide border-t border-border/15">
            {NAV_SECONDARY.map(n => (
              <button
                key={n.id}
                onClick={() => { handleTabChange(n.id); setShowMoreTabs(false); }}
                className={`flex flex-col items-center gap-0.5 px-2.5 sm:px-3 py-1 rounded-lg text-[9px] sm:text-[10px] transition-all duration-200 shrink-0 ${
                  tab === n.id
                    ? "font-bold text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                <span className="text-xs sm:text-sm">{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Content — with camera transitions */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <CameraTransitionLayer transitionKey={tab} direction={cameraDirection}>
          <TabErrorBoundary tabName={tab} key={tab}>
          {tab === "dash" && (
            <AtmosphericSceneWrapper atmosphere="neutral" intensity="low">
              <div className="space-y-4 stagger-children">
                {/* PRIORITY 1: SPRINT ENTRETIEN — Objectif 30 mars */}
                <motion.button
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -3, scale: 1.005 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabChange("simulator")}
                  className="w-full rounded-2xl p-4 sm:p-5 text-left relative overflow-hidden group transition-all"
                  style={{
                    background: "linear-gradient(145deg, hsl(270 60% 55% / 0.12), hsl(var(--card)), hsl(0 84% 60% / 0.05))",
                    border: "2px solid hsl(270 60% 55% / 0.25)",
                    boxShadow: "0 0 30px -8px hsl(270 60% 55% / 0.2)",
                  }}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0"
                    >
                      <Rocket className="w-6 h-6 text-violet-400" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-violet-400 tracking-tight">Sprint Entretien — 30 mars</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Lancer une session d'entrainement maintenant
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-violet-400">{readinessPercent}%</p>
                      <p className="text-[8px] text-muted-foreground">pret</p>
                    </div>
                  </div>
                </motion.button>

                {/* PRIORITY 2: COUNTDOWN + readiness */}
                <Countdown lastSimScore={lastSimScore} readinessPercent={readinessPercent} />

                {/* PRIORITY 3: Daily Mission Protocol — what to do today */}
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

                {/* ESCAPE-GAME MICRO-LOOP: Daily Phrase Gate */}
                <PhraseGate
                  solvedGateIds={escapeState.solvedPuzzles || []}
                  onSolve={(challengeId, xpReward) => progress.solvePuzzle(challengeId, xpReward)}
                />

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

                {/* PRIMARY CTA — Next Room */}
                {nextRoom && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTabChange(ZONE_TAB_MAP[nextRoom.zone.id] as Tab || "dash")}
                    className="w-full rounded-2xl p-5 text-left relative overflow-hidden group transition-all room-3d room-in-progress"
                    style={{
                      background: "linear-gradient(145deg, hsl(var(--primary) / 0.1), hsl(var(--card)), hsl(var(--primary) / 0.04))",
                      border: "2px solid hsl(var(--primary) / 0.25)",
                      boxShadow: "0 0 20px -6px hsl(var(--primary) / 0.2)",
                    }}
                  >
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
                          <p className="text-[9px] uppercase tracking-[2px] text-primary font-bold">Continuer l'aventure</p>
                          <p className="text-sm font-black tracking-tight">{nextRoom.room.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{nextRoom.zone.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black text-primary">{nextRoom.progress.current}/{nextRoom.progress.threshold}</p>
                          <p className="text-[9px] text-muted-foreground">pour resoudre</p>
                        </div>
                      </div>
                      <div className="h-2 bg-secondary/40 rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${nextRoom.progress.percentage}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary/40 relative"
                        >
                          {nextRoom.progress.percentage > 0 && nextRoom.progress.percentage < 100 && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/20 blur-[3px]" />
                          )}
                        </motion.div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] text-muted-foreground leading-relaxed flex-1">{nextRoom.room.challenge}</p>
                        <span className="text-primary text-xs font-bold ml-3 shrink-0 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Lancer
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )}

                {/* Inventory preview — Real 3D when available */}
                <WebGLGate fallback={
                  <InventoryArtifact3D items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} />
                }>
                  {escapeState.inventory.length > 0 ? (
                    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(32 95% 55% / 0.12)" }}>
                      <Suspense fallback={
                        <InventoryArtifact3D items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} />
                      }>
                        <Inventory3DScene
                          items={escapeState.inventory}
                          sigilsCollected={escapeState.sigilsCollected}
                          selectedItemId={inventorySelectedItem}
                          onSelectItem={setInventorySelectedItem}
                        />
                      </Suspense>
                    </div>
                  ) : (
                    <InventoryArtifact3D items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} />
                  )}
                </WebGLGate>

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

                {/* 3D Hub Scene — interactive zone portal map */}
                <WebGLGate fallback={
                  <div className="rounded-2xl p-4 space-y-3" style={{
                    background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
                    border: "1px solid hsl(32 95% 55% / 0.12)",
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">🏛️</span>
                      <p className="text-xs font-black tracking-tight">Hub du Complexe Medical</p>
                      <span className="text-[8px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400/70 font-bold ml-auto">Mode 2D</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {ESCAPE_ZONES.map((zone) => {
                        const zs = progress.escapeZoneStatus[zone.id];
                        const isLocked = !zs?.unlocked;
                        return (
                          <button
                            key={zone.id}
                            onClick={() => { if (!isLocked) handleTabChange(ZONE_TAB_MAP[zone.id] as Tab); }}
                            disabled={isLocked}
                            className={`rounded-xl p-3 text-center transition-all ${isLocked ? "opacity-30 cursor-not-allowed" : "hover:scale-[1.04] hover:bg-white/5"}`}
                            style={{
                              background: isLocked ? "hsl(225 14% 10%)" : "linear-gradient(145deg, hsl(var(--primary) / 0.06), hsl(var(--card)))",
                              border: isLocked ? "1px solid hsl(225 14% 12%)" : "1px solid hsl(var(--border) / 0.3)",
                            }}
                          >
                            <div className="text-xl mb-1">{isLocked ? "🔒" : zone.icon}</div>
                            <div className="text-[9px] font-bold">{zone.name.replace(/Aile d[eu']?\s*/i, "").slice(0, 12)}</div>
                            {!isLocked && zs && (
                              <div className="mt-1 h-1 bg-secondary/30 rounded-full overflow-hidden">
                                <div className="h-full rounded-full bg-amber-500/40" style={{ width: `${zs.progress * 100}%` }} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                }>
                  <Suspense fallback={
                    <div className="rounded-2xl overflow-hidden h-[320px] flex items-center justify-center" style={{
                      background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
                      border: "1px solid hsl(32 95% 55% / 0.12)",
                    }}>
                      <div className="text-center">
                        <div className="text-2xl mb-2 animate-pulse">🏛️</div>
                        <p className="text-[10px] text-muted-foreground animate-pulse">Chargement du Hub 3D...</p>
                      </div>
                    </div>
                  }>
                    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid hsl(32 95% 55% / 0.12)" }}>
                      <HubScene
                        escapeZoneStatus={progress.escapeZoneStatus}
                        onNavigate={(t) => handleTabChange(t as Tab)}
                        sigilCount={sigilCount}
                      />
                    </div>
                  </Suspense>
                </WebGLGate>

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
            <div className="space-y-4">
              {/* 3D Map Scene */}
              <WebGLGate fallback={
                <EscapeMap
                  escapeZoneStatus={progress.escapeZoneStatus}
                  artifacts={progress.artifacts}
                  onNavigate={(t) => handleTabChange(t as Tab)}
                  sigilsCollected={escapeState.sigilsCollected}
                />
              }>
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-3xl overflow-hidden"
                  style={{
                    border: "1px solid hsl(32 95% 55% / 0.12)",
                    boxShadow: "var(--shadow-3d-lg)",
                  }}
                >
                  <div className="relative">
                    <div className="absolute top-3 left-4 z-10 pointer-events-none">
                      <h2 className="text-lg font-black text-white/90 drop-shadow-lg">Carte du Complexe</h2>
                      <p className="text-[9px] text-white/50">{Object.values(progress.escapeZoneStatus).reduce((a, z) => a + z.roomsSolved, 0)}/{ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0)} salles · {escapeState.sigilsCollected.length}/7 sigils</p>
                    </div>
                    <Suspense fallback={
                      <div className="h-[400px] flex items-center justify-center bg-card/50">
                        <p className="text-[10px] text-muted-foreground animate-pulse">Chargement de la carte 3D...</p>
                      </div>
                    }>
                      <MapScene
                        escapeZoneStatus={progress.escapeZoneStatus}
                        artifacts={progress.artifacts}
                        onNavigate={(t) => handleTabChange(t as Tab)}
                        sigilsCollected={escapeState.sigilsCollected}
                        selectedZone={mapSelectedZone}
                        onSelectZone={setMapSelectedZone}
                      />
                    </Suspense>
                  </div>
                </motion.div>
              </WebGLGate>

              {/* Zone details panel (when a zone is selected) */}
              {mapSelectedZone && (() => {
                const zone = ESCAPE_ZONES.find(z => z.id === mapSelectedZone);
                const zoneStatus = progress.escapeZoneStatus[mapSelectedZone];
                if (!zone || !zoneStatus) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl p-4 space-y-3"
                    style={{
                      background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
                      border: "1px solid hsl(var(--border) / 0.4)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{zone.icon}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-black">{zone.name}</h3>
                        <p className="text-[10px] text-muted-foreground">{zone.subtitle}</p>
                      </div>
                      {zoneStatus.unlocked && (
                        <button
                          onClick={() => handleTabChange(ZONE_TAB_MAP[zone.id] as Tab)}
                          className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] font-bold hover:bg-primary/25 transition-colors"
                        >
                          Entrer
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {zone.rooms.map(room => {
                        const rs = zoneStatus.rooms.find(r => r.id === room.id);
                        return (
                          <div key={room.id} className={`rounded-lg p-2 text-center text-[9px] ${
                            rs?.status === "solved" ? "bg-emerald-500/10 border border-emerald-500/20" :
                            rs?.status === "in_progress" ? "bg-amber-500/10 border border-amber-500/20" :
                            rs?.status === "accessible" ? "bg-primary/10 border border-primary/20" :
                            "bg-secondary/10 border border-border/20 opacity-40"
                          }`}>
                            <span className="text-sm">{room.icon}</span>
                            <p className="font-bold mt-0.5 leading-tight">{room.name.slice(0, 16)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })()}
            </div>
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
              <WebGLGate fallback={
                <MetaPuzzle
                  sigilsCollected={escapeState.sigilsCollected}
                  onActivateProtocol={progress.activateProtocol}
                />
              }>
                <LazarusWithScene
                  sigilsCollected={escapeState.sigilsCollected}
                  onActivateProtocol={progress.activateProtocol}
                />
              </WebGLGate>
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
