// ── DashboardView ──
// Extracted from Index.tsx — the main mission dashboard (tab="dash")

import { useState, lazy, Suspense } from "react";
import { Map, Package, KeyRound, Shield, Rocket, Zap } from "lucide-react";
import { ESCAPE_ZONES, CHAPTERS, ZONE_TAB_MAP, computeRoomProgress } from "@/data/escapeGame";
import { getBuilderRank } from "@/data/content";
import { WebGLGate } from "@/components/3d/WebGLDetect";
import { PremiumFallback, FallbackAction } from "@/components/3d/PremiumFallback";
import { AmbientRenderer } from "@/experience";
import { ProgressEnvironmentMapper } from "@/experience";
import { Countdown } from "@/components/Countdown";
import { XPBar } from "@/components/XPBar";
import { MotivBanner } from "@/components/MotivBanner";
import { DailyChain } from "@/components/DailyChain";
import { InventoryArtifact3D } from "@/components/immersive/InventoryArtifact3D";
import { PhraseGate } from "@/components/PhraseGate";
import { TodayPlan } from "@/components/TodayPlan";
import { MissionTimer } from "@/components/MissionTimer";
import { motion } from "framer-motion";
import type { Tab } from "@/components/NavigationBar";
import type { Artifact } from "@/hooks/useProgress";

const HubScene = lazy(() => import("@/components/3d/HubScene").then(m => ({ default: m.HubScene })));
const Inventory3DScene = lazy(() => import("@/components/3d/Inventory3DScene").then(m => ({ default: m.Inventory3DScene })));

interface DashboardViewProps {
  progress: {
    xp: number;
    streak: number;
    artifacts: Artifact[];
    escapeState: {
      solvedRooms: string[];
      inventory: string[];
      discoveredRooms: string[];
      sigilsCollected: string[];
      newEscapeEvents: string[];
      solvedPuzzles: string[];
      solvedGateIds: string[];
      protocolActivated: boolean;
    };
    escapeZoneStatus: Record<string, any>;
    zoneStatus: Record<string, any>;
    questState: { completedChains: number; newUnlocks: string[] };
    chainStatus: any;
    done: Record<string, boolean>;
    totalCreations: number;
    pomodoroCount: number;
    addXp: (n: number) => void;
    toggleTask: (id: string) => void;
    solveGate: (id: string, xp: number) => void;
  };
  onNavigate: (tab: Tab) => void;
  daysUntilInterview: number;
  readinessPercent: number;
  lastSimScore: number | null;
}

export function DashboardView({ progress, onNavigate, daysUntilInterview, readinessPercent, lastSimScore }: DashboardViewProps) {
  const [inventorySelectedItem, setInventorySelectedItem] = useState<string | null>(null);

  const escapeState = progress.escapeState;
  const solvedRoomCount = escapeState.solvedRooms.length;
  const totalEscapeRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const sigilCount = escapeState.sigilsCollected.length;
  const inventoryCount = escapeState.inventory.length;

  const currentChapter = CHAPTERS.find(ch => {
    return ch.zones.some(zId => {
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
        const roomStatus = zoneStatus.rooms.find((r: any) => r.id === room.id);
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
        const roomStatus = zoneStatus.rooms.find((r: any) => r.id === room.id);
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

  return (
    <AmbientRenderer>
      <ProgressEnvironmentMapper
        xp={progress.xp}
        streak={progress.streak}
        artifactCount={progress.artifacts.length}
        progressRatio={solvedRoomCount / Math.max(1, totalEscapeRooms)}
        daysRemaining={daysUntilInterview}
      >
        <div className="space-y-4 stagger-children">

          {/* CTA 1: SPRINT ENTRETIEN */}
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3, scale: 1.005 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate("simulator")}
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
                <p className="text-sm font-black text-violet-400 tracking-tight">Sprint Entretien — J-{daysUntilInterview}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Lancer une session d'entrainement maintenant</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-black text-violet-400">{readinessPercent}%</p>
                <p className="text-[8px] text-muted-foreground">pret</p>
              </div>
            </div>
            <div className="relative z-10 mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-violet-500/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${readinessPercent}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500/60 to-violet-400/40"
                />
              </div>
              {lastSimScore !== null && lastSimScore !== undefined && (
                <span className="text-[8px] text-muted-foreground/60 shrink-0">Dernier: {lastSimScore}/100</span>
              )}
            </div>
          </motion.button>

          {/* CTA 2: NEXT ROOM */}
          {nextRoom ? (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(ZONE_TAB_MAP[nextRoom.zone.id] as Tab || "dash")}
              className="w-full rounded-2xl p-4 sm:p-5 text-left relative overflow-hidden group transition-all room-3d room-in-progress"
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
                    <p className="text-[9px] uppercase tracking-[2px] text-primary font-bold">Prochaine salle</p>
                    <p className="text-sm font-black tracking-tight">{nextRoom.room.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{nextRoom.zone.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary">{nextRoom.progress.current}/{nextRoom.progress.threshold}</p>
                    <p className="text-[9px] text-muted-foreground">pour debloquer</p>
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
                    <Zap className="w-3 h-3" /> Entrer
                  </span>
                </div>
              </div>
            </motion.button>
          ) : solvedRoomCount < totalEscapeRooms ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
                border: "1px solid hsl(var(--border) / 0.4)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] uppercase tracking-[2px] text-amber-400/70 font-bold">Salles en attente</p>
                  <p className="text-xs font-bold text-foreground/80">Cree plus d'artefacts pour debloquer la prochaine salle</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {nextLockedRoom?.room ? nextLockedRoom.room.unlockRequirement.details : nextLockedRoom?.zone?.unlockRequirement.details || "Continue ta progression"}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(145deg, hsl(142 71% 45% / 0.08), hsl(var(--card)))",
                border: "1px solid hsl(142 71% 45% / 0.2)",
              }}
            >
              <p className="text-sm font-black text-emerald-400">Complexe entierement explore</p>
              <p className="text-[10px] text-muted-foreground mt-1">Toutes les salles sont resolues. Continue ton entrainement pour le jour J.</p>
            </motion.div>
          )}

          {/* CTA 3: Daily Phrase Gate */}
          <PhraseGate
            solvedGateIds={escapeState.solvedGateIds || []}
            onSolve={(challengeId, xpReward) => progress.solveGate(challengeId, xpReward)}
          />

          {/* Compact status bar */}
          <div className="rounded-2xl p-3 flex items-center gap-3"
            style={{
              background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
              border: "1px solid hsl(var(--border) / 0.3)",
            }}
          >
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-black text-primary">J-{daysUntilInterview}</span>
              <span className="text-[8px] text-muted-foreground/50">|</span>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full border flex items-center justify-center text-[6px] ${
                  i < sigilCount ? "bg-amber-500/20 border-amber-500/40" : "bg-secondary/20 border-border/15"
                }`}>
                  {i < sigilCount ? "🏅" : "·"}
                </div>
              ))}
            </div>
            <div className="flex-1 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/30" style={{ width: `${(solvedRoomCount / totalEscapeRooms) * 100}%` }} />
            </div>
            <span className="text-[9px] font-bold text-amber-400 shrink-0">{solvedRoomCount}/{totalEscapeRooms}</span>
            {progress.streak > 0 && (
              <>
                <span className="text-[8px] text-muted-foreground/30">|</span>
                <span className="text-[9px] font-bold text-accent shrink-0">🔥{progress.streak}j</span>
              </>
            )}
          </div>

          {/* Locked room teaser */}
          {nextLockedRoom && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-4 relative overflow-hidden room-3d room-locked"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="door-icon-3d w-10 h-10 rounded-xl bg-secondary/30 border border-border/20 flex items-center justify-center"
                  style={{ boxShadow: "var(--shadow-3d-sm)" }}>
                  <KeyRound className="w-4 h-4 text-muted-foreground/40" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] uppercase tracking-[2px] text-muted-foreground/50">Prochaine porte verrouillee</p>
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
              onNavigate={onNavigate}
              completedChains={progress.questState.completedChains}
            />
          </div>

          {/* Today's plan */}
          <TodayPlan done={progress.done} toggleTask={progress.toggleTask} />

          {/* Countdown */}
          <Countdown lastSimScore={lastSimScore} readinessPercent={readinessPercent} />

          {/* Mission Progress */}
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
                <span className="text-[9px] text-muted-foreground">{inventoryCount} fragments</span>
                <span className="text-[9px] text-muted-foreground/40">·</span>
                <span className="text-[9px] text-muted-foreground">{progress.totalCreations} artefacts</span>
              </div>
            </div>
          </motion.div>

          {/* Inventory preview */}
          {escapeState.inventory.length > 0 && (
            <WebGLGate sceneName="Inventory" fallback={
              <InventoryArtifact3D items={escapeState.inventory} sigilsCollected={escapeState.sigilsCollected} />
            }>
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
            </WebGLGate>
          )}

          {/* Builder Rank */}
          <XPBar xp={progress.xp} />

          {/* Zone cards */}
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
                  transition={{ delay: 0.1 + i * 0.03 }}
                  whileHover={!isLocked ? { y: -5, rotateX: 2, scale: 1.03 } : undefined}
                  whileTap={!isLocked ? { scale: 0.97 } : undefined}
                  onClick={() => { if (!isLocked) onNavigate(tabTarget); }}
                  disabled={isLocked}
                  className={`rounded-2xl border p-3 sm:p-4 text-center transition-all relative overflow-hidden iso-building ${
                    isLocked ? "opacity-30 cursor-not-allowed" : ""
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
                    {isLocked && (
                      <p className="text-[7px] text-muted-foreground/50 mt-1 leading-tight">
                        {zone.unlockRequirement.details.slice(0, 40)}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* 3D Hub Scene */}
          <WebGLGate sceneName="Hub" fallback={
            <PremiumFallback
              sceneName="Hub"
              icon="🏛️"
              title="Le Complexe Linguistique"
              subtitle={`${sigilCount}/7 sceaux collectés`}
              accentColor="#d4a017"
              actions={
                <FallbackAction onClick={() => onNavigate("questmap")}>
                  <Map className="w-3.5 h-3.5" />
                  Explorer la carte
                </FallbackAction>
              }
            />
          }>
            <Suspense fallback={
              <div className="rounded-2xl overflow-hidden h-[300px] flex items-center justify-center" style={{
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
                  onNavigate={(t) => onNavigate(t as Tab)}
                  sigilCount={sigilCount}
                />
              </div>
            </Suspense>
          </WebGLGate>

          {/* Mission Timer */}
          <MissionTimer
            missionId={currentChapter.id}
            durationMinutes={30}
            onBonusXp={progress.addXp}
          />

          <MotivBanner />
        </div>
      </ProgressEnvironmentMapper>
    </AmbientRenderer>
  );
}
