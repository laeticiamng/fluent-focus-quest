import { useState, useRef, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslationPreference } from "@/hooks/useTranslationPreference";
import { ESCAPE_ZONES, ZONE_TAB_MAP } from "@/data/escapeGame";
import { WebGLGate, WebGLDiagnosticBadge } from "@/components/3d/WebGLDetect";
import { useExperience } from "@/experience";
import { TransitionDirector, getTransitionStyle } from "@/experience";
import { NavigationBar, TAB_ATMOSPHERE, type Tab } from "@/components/NavigationBar";
import { TabErrorBoundary } from "@/components/TabErrorBoundary";
import { DashboardView } from "@/components/DashboardView";
import { RewardReveal3D } from "@/components/immersive/RewardReveal3D";
import { AtmosphericSceneWrapper } from "@/components/immersive/AtmosphericSceneWrapper";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { AIStatusBanner } from "@/components/AIStatusBanner";
import { ACHIEVEMENTS, type AchievementStats } from "@/components/Achievements";
import { useProgress } from "@/hooks/useProgress";
import { motion } from "framer-motion";

// ── Lazy-loaded tab components (code-split) ──
const Vocab = lazy(() => import("@/components/Vocab").then(m => ({ default: m.Vocab })));
const Grammar = lazy(() => import("@/components/Grammar").then(m => ({ default: m.Grammar })));
const Interview = lazy(() => import("@/components/Interview").then(m => ({ default: m.Interview })));
const Clinical = lazy(() => import("@/components/Clinical").then(m => ({ default: m.Clinical })));
const InterviewSimulator = lazy(() => import("@/components/InterviewSimulator").then(m => ({ default: m.InterviewSimulator })));
const AtelierHub = lazy(() => import("@/components/AtelierHub").then(m => ({ default: m.AtelierHub })));
const Portfolio = lazy(() => import("@/components/Portfolio").then(m => ({ default: m.Portfolio })));
const EscapeMap = lazy(() => import("@/components/EscapeMap").then(m => ({ default: m.EscapeMap })));
const StudioWall = lazy(() => import("@/components/StudioWall").then(m => ({ default: m.StudioWall })));
const PuzzleEngine = lazy(() => import("@/components/PuzzleEngine"));
const MetaPuzzle = lazy(() => import("@/components/MetaPuzzle"));
const AchievementsPanel = lazy(() => import("@/components/Achievements").then(m => ({ default: m.AchievementsPanel })));
const Leaderboard = lazy(() => import("@/components/Leaderboard").then(m => ({ default: m.Leaderboard })));
const Tools = lazy(() => import("@/components/Tools").then(m => ({ default: m.Tools })));
const Stats = lazy(() => import("@/components/Stats").then(m => ({ default: m.Stats })));
const CalendarView = lazy(() => import("@/components/CalendarView").then(m => ({ default: m.CalendarView })));
const VisionBoard = lazy(() => import("@/components/VisionBoard").then(m => ({ default: m.VisionBoard })));
const DayView = lazy(() => import("@/components/DayView").then(m => ({ default: m.DayView })));
const TodayPlan = lazy(() => import("@/components/TodayPlan").then(m => ({ default: m.TodayPlan })));

// Lazy 3D scenes
const MapScene = lazy(() => import("@/components/3d/MapScene").then(m => ({ default: m.MapScene })));
const LazarusScene = lazy(() => import("@/components/3d/LazarusScene").then(m => ({ default: m.LazarusScene })));

function safeLocalGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeLocalSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* quota exceeded */ }
}

const TUTORIAL_STORAGE_KEY = "fluent-focus-tutorial-completed";

// ── Lazy loading fallback ──
function TabSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <div className="text-2xl animate-pulse">⏳</div>
          <p className="text-[10px] text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}

// ── Lazarus wrapper ──
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

      {!activated && (
        <div className="rounded-2xl p-4 space-y-3" style={{
          background: "linear-gradient(145deg, hsl(270 60% 60% / 0.08), hsl(var(--card)))",
          border: "1px solid hsl(270 60% 60% / 0.15)",
        }}>
          <p className="text-[10px] text-muted-foreground">
            Clique sur les sigils dans la scene 3D pour les placer dans l'ordre correct.
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

// ── Main Index Page ──
const Index = () => {
  const { signOut, authUnavailable } = useAuth();
  const { showFr, toggleFr } = useTranslationPreference();
  const [tab, setTab] = useState<Tab>("dash");
  const prevTabRef = useRef<Tab>("dash");
  const progress = useProgress();
  const [tutorialCompleted, setTutorialCompleted] = useState(() => safeLocalGet(TUTORIAL_STORAGE_KEY) === "true");
  const [mapSelectedZone, setMapSelectedZone] = useState<string | null>(null);
  const [showMoreTabs, setShowMoreTabs] = useState(false);

  const handleTutorialComplete = () => {
    safeLocalSet(TUTORIAL_STORAGE_KEY, "true");
    setTutorialCompleted(true);
  };

  const escapeState = progress.escapeState || { solvedRooms: [], inventory: [], discoveredRooms: [], currentMissionStep: "ch1", sigilsCollected: [], newEscapeEvents: [], solvedPuzzles: [], solvedGateIds: [], protocolActivated: false };
  const solvedRoomCount = escapeState.solvedRooms.length;
  const totalEscapeRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const sigilCount = escapeState.sigilsCollected.length;

  // Days until interview (March 30, 2026)
  const daysUntilInterview = Math.max(0, Math.ceil((new Date("2026-03-30").getTime() - Date.now()) / 864e5));

  // Interview readiness
  const lastSimScore = (() => {
    const simArtifacts = progress.artifacts.filter(a => a.type === "interview_answer" && a.metadata?.globalScore);
    if (simArtifacts.length === 0) return null;
    const last = simArtifacts.sort((a, b) => b.date.localeCompare(a.date))[0];
    return last.metadata?.globalScore as number;
  })();

  const readinessPercent = (() => {
    const interviewAnswers = progress.artifacts.filter(a => a.type === "interview_answer");
    const uniqueQuestions = new Set(interviewAnswers.map(a => a.metadata?.simQuestionId)).size;
    const questionCoverage = Math.min(1, uniqueQuestions / 36) * 40;
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

  const unlockedAchievementIds = ACHIEVEMENTS
    .filter(a => a.condition(achievementStats))
    .map(a => a.id);

  // Experience engine
  const { setZoneAtmosphere, fireEvent } = useExperience();

  const handleTabChange = (newTab: Tab) => {
    prevTabRef.current = tab;
    setTab(newTab);
    const atmosphere = TAB_ATMOSPHERE[newTab] || "neutral";
    setZoneAtmosphere(atmosphere);
    fireEvent("ZONE_ENTERED", { zone: atmosphere, tab: newTab });
  };

  return (
    <div className="min-h-screen bg-background ambient-bg grain-texture">
      <div className="ambient-orb ambient-orb-1" />
      <div className="ambient-orb ambient-orb-2" />
      <div className="ambient-orb ambient-orb-3" />

      <AIStatusBanner />

      {authUnavailable && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
          <p className="text-[11px] text-amber-400 font-medium">
            Mode hors-ligne — Progression sauvegardee localement. Connecte-toi pour synchroniser.
          </p>
        </div>
      )}

      <WebGLDiagnosticBadge />

      <OnboardingTutorial
        isFirstVisit={!tutorialCompleted}
        onComplete={handleTutorialComplete}
      />

      <RewardReveal3D
        newEscapeEvents={escapeState.newEscapeEvents || []}
        newUnlocks={progress.questState.newUnlocks}
        onDismiss={progress.clearNewUnlocks}
      />

      {/* Navigation */}
      <NavigationBar
        tab={tab}
        onTabChange={handleTabChange}
        xp={progress.xp}
        showFr={showFr}
        toggleFr={toggleFr}
        showMoreTabs={showMoreTabs}
        setShowMoreTabs={setShowMoreTabs}
        onSignOut={authUnavailable ? () => window.location.reload() : signOut}
        authUnavailable={authUnavailable}
      />

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-20">
        <TransitionDirector transitionKey={tab} style={getTransitionStyle(tab)}>
          <TabErrorBoundary tabName={tab} key={tab}>

            {tab === "dash" && (
              <DashboardView
                progress={progress}
                onNavigate={handleTabChange}
                daysUntilInterview={daysUntilInterview}
                readinessPercent={readinessPercent}
                lastSimScore={lastSimScore}
              />
            )}

            {tab === "questmap" && (
              <div className="space-y-4">
                <WebGLGate sceneName="Map" fallback={
                  <TabSuspense>
                    <EscapeMap
                      escapeZoneStatus={progress.escapeZoneStatus}
                      artifacts={progress.artifacts}
                      onNavigate={(t) => handleTabChange(t as Tab)}
                      sigilsCollected={escapeState.sigilsCollected}
                    />
                  </TabSuspense>
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
                        <p className="text-[9px] text-white/50">{Object.values(progress.escapeZoneStatus).reduce((a: number, z: any) => a + z.roomsSolved, 0)}/{totalEscapeRooms} salles · {sigilCount}/7 sigils</p>
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
                          const rs = zoneStatus.rooms.find((r: any) => r.id === room.id);
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
              <TabSuspense>
                <StudioWall
                  artifacts={progress.artifacts}
                  zoneStatus={progress.zoneStatus}
                  earnedBadges={progress.earnedBadges || []}
                  streak={progress.streak}
                  xp={progress.xp}
                />
              </TabSuspense>
            )}

            {tab === "atelier" && (
              <TabSuspense>
                <AtelierHub addXp={progress.addXp} xp={progress.xp} />
              </TabSuspense>
            )}

            {tab === "portfolio" && (
              <TabSuspense>
                <AtmosphericSceneWrapper atmosphere="archive" intensity="low">
                  <Portfolio artifacts={progress.artifacts} earnedBadges={progress.earnedBadges || []} />
                </AtmosphericSceneWrapper>
              </TabSuspense>
            )}

            {tab === "motiv" && <TabSuspense><VisionBoard /></TabSuspense>}
            {tab === "today" && <TabSuspense><DayView done={progress.done} toggleTask={progress.toggleTask} /></TabSuspense>}

            {tab === "vocab" && (
              <TabSuspense>
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
              </TabSuspense>
            )}

            {tab === "gram" && (
              <TabSuspense>
                <AtmosphericSceneWrapper atmosphere="grammar" intensity="low">
                  <Grammar
                    grammarDone={progress.grammarDone}
                    toggleGrammarExercise={progress.toggleGrammarExercise}
                    addArtifact={progress.addArtifact}
                    artifacts={progress.artifacts}
                    addXp={progress.addXp}
                  />
                </AtmosphericSceneWrapper>
              </TabSuspense>
            )}

            {tab === "simulator" && (
              <TabSuspense>
                <InterviewSimulator
                  addXp={progress.addXp}
                  onNavigate={(t) => handleTabChange(t as Tab)}
                  addArtifact={progress.addArtifact}
                  artifacts={progress.artifacts}
                />
              </TabSuspense>
            )}

            {tab === "iv" && (
              <TabSuspense>
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
              </TabSuspense>
            )}

            {tab === "sim" && (
              <TabSuspense>
                <AtmosphericSceneWrapper atmosphere="clinical" intensity="low">
                  <Clinical
                    addArtifact={progress.addArtifact}
                    artifacts={progress.artifacts}
                    addXp={progress.addXp}
                  />
                </AtmosphericSceneWrapper>
              </TabSuspense>
            )}

            {tab === "tools" && (
              <TabSuspense>
                <Tools addXp={progress.addXp} cl={progress.cl} toggleChecklist={progress.toggleChecklist} notes={progress.notes} setNotes={progress.setNotes} addPomodoro={progress.addPomodoro} pomodoroCount={progress.pomodoroCount} />
              </TabSuspense>
            )}

            {tab === "stats" && (
              <TabSuspense>
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
              </TabSuspense>
            )}

            {tab === "puzzles" && (
              <TabSuspense>
                <AtmosphericSceneWrapper atmosphere="aerzterat" intensity="low">
                  <PuzzleEngine
                    onPuzzleSolved={progress.solvePuzzle}
                    solvedPuzzleIds={escapeState.solvedPuzzles || []}
                  />
                </AtmosphericSceneWrapper>
              </TabSuspense>
            )}

            {tab === "lazarus" && (
              <AtmosphericSceneWrapper atmosphere="neutral" intensity="medium">
                <WebGLGate sceneName="Lazarus" fallback={
                  <TabSuspense><MetaPuzzle
                    sigilsCollected={escapeState.sigilsCollected}
                    onActivateProtocol={progress.activateProtocol}
                  /></TabSuspense>
                }>
                  <LazarusWithScene
                    sigilsCollected={escapeState.sigilsCollected}
                    onActivateProtocol={progress.activateProtocol}
                  />
                </WebGLGate>
              </AtmosphericSceneWrapper>
            )}

            {tab === "achievements" && (
              <TabSuspense>
                <AtmosphericSceneWrapper atmosphere="neutral" intensity="low">
                  <AchievementsPanel
                    stats={achievementStats}
                    unlockedIds={unlockedAchievementIds}
                  />
                </AtmosphericSceneWrapper>
              </TabSuspense>
            )}

            {tab === "leaderboard" && (
              <TabSuspense>
                <AtmosphericSceneWrapper atmosphere="neutral" intensity="low">
                  <Leaderboard
                    currentXp={progress.xp}
                    currentStreak={progress.streak}
                    currentSigils={sigilCount}
                    currentRooms={solvedRoomCount}
                    currentArtifacts={progress.artifacts.length}
                  />
                </AtmosphericSceneWrapper>
              </TabSuspense>
            )}

            {tab === "cal" && <TabSuspense><CalendarView done={progress.done} toggleTask={progress.toggleTask} /></TabSuspense>}

          </TabErrorBoundary>
        </TransitionDirector>
      </main>
    </div>
  );
};

export default Index;
