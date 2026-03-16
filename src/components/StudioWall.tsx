import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Artifact, ArtifactType, ZoneId } from "@/hooks/useProgress";
import { ZONES, CREATION_BADGES } from "@/hooks/useProgress";
import { getBuilderRank } from "@/data/content";
import { RankBadge } from "./XPBar";

interface StudioWallProps {
  artifacts: Artifact[];
  zoneStatus: Record<ZoneId, { unlocked: boolean; progress: number; rooms: { id: string; unlocked: boolean }[] }>;
  earnedBadges: string[];
  streak: number;
  xp: number;
}

const TYPE_ICON: Record<ArtifactType, string> = {
  phrase_forged: "🔨",
  definition_written: "📖",
  phrase_assembled: "🧩",
  grammar_phrase: "⚙️",
  grammar_rule: "🌳",
  grammar_transform: "🔄",
  interview_answer: "💬",
  script: "📋",
  diagnostic: "🏥",
  clinical_note: "📝",
  case_patient: "🗂️",
  document: "📄",
  recording: "🎙️",
};

const WALL_LEVELS = [
  { min: 0, name: "Fondations", icon: "🏗️", desc: "Tes premieres briques" },
  { min: 10, name: "Murs porteurs", icon: "🧱", desc: "La structure prend forme" },
  { min: 25, name: "Charpente", icon: "🏠", desc: "L'architecture se dessine" },
  { min: 50, name: "Facade", icon: "🏛️", desc: "Le batiment est reconnaissable" },
  { min: 75, name: "Interieur", icon: "🏰", desc: "Les finitions commencent" },
  { min: 100, name: "Palais acheve", icon: "👑", desc: "Tu as bati ton empire" },
];

export function StudioWall({ artifacts, zoneStatus, earnedBadges, streak, xp }: StudioWallProps) {
  const { rank, nextRank, progressToNext } = getBuilderRank(xp);

  const currentLevel = useMemo(() => {
    let lvl = WALL_LEVELS[0];
    for (const l of WALL_LEVELS) {
      if (artifacts.length >= l.min) lvl = l;
    }
    return lvl;
  }, [artifacts.length]);

  const nextLevel = useMemo(() => {
    return WALL_LEVELS.find(l => l.min > artifacts.length) || null;
  }, [artifacts.length]);

  const recentArtifacts = useMemo(() =>
    [...artifacts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12),
    [artifacts]
  );

  const unlockedZoneCount = Object.values(zoneStatus).filter(z => z.unlocked).length;
  const totalRooms = Object.values(zoneStatus).reduce((a, z) => a + z.rooms.length, 0);
  const unlockedRooms = Object.values(zoneStatus).reduce((a, z) => a + z.rooms.filter(r => r.unlocked).length, 0);

  return (
    <div className="space-y-5">
      {/* Header — Le Quartier General */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-5 room-3d"
        style={{
          background: "linear-gradient(145deg, hsl(38 92% 50% / 0.08), hsl(var(--card)), hsl(270 60% 60% / 0.04))",
          border: "1px solid hsl(38 92% 50% / 0.12)",
          boxShadow: "var(--shadow-3d-lg), 0 0 40px -12px hsl(38 92% 50% / 0.12)",
        }}
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-amber-400/10 to-transparent" />
        <div className="flex items-center gap-3">
          <RankBadge xp={xp} size="lg" />
          <div>
            <h2 className="text-xl font-black tracking-tight">Quartier General</h2>
            <p className={`text-[10px] ${rank.color} font-medium`}>{rank.name} — {rank.desc}</p>
          </div>
        </div>
      </motion.div>

      {/* Building visualization */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-3xl room-3d p-6 overflow-hidden min-h-[200px]"
        style={{
          background: "linear-gradient(145deg, hsl(38 92% 50% / 0.1), hsl(var(--card)), hsl(var(--background)))",
          border: "1px solid hsl(38 92% 50% / 0.15)",
          boxShadow: "var(--shadow-3d-xl), 0 0 60px -12px hsl(38 92% 50% / 0.1)",
        }}
      >
        {/* Background particles for high levels */}
        {artifacts.length >= 25 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: Math.min(artifacts.length / 5, 15) }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-amber-400/30"
                style={{ left: `${10 + Math.random() * 80}%`, top: `${5 + Math.random() * 40}%` }}
                animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10">
          {/* Brick wall — artifacts visualization */}
          {recentArtifacts.length > 0 ? (
            <div className="flex flex-wrap gap-1 justify-center mb-4">
              {recentArtifacts.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                  className="w-10 h-7 rounded-md bg-amber-500/20 border border-amber-500/15 flex items-center justify-center text-xs cursor-default"
                  title={`${a.content.slice(0, 30)}...`}
                >
                  {TYPE_ICON[a.type] || "📝"}
                </motion.div>
              ))}
              {artifacts.length > 12 && (
                <div className="w-10 h-7 rounded-md bg-amber-500/10 border border-amber-500/10 flex items-center justify-center text-[9px] text-amber-400/70 font-bold">
                  +{artifacts.length - 12}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-4xl mb-3 block">🏗️</span>
              <p className="text-sm text-muted-foreground">Ton QG est vide pour l'instant.</p>
              <p className="text-xs text-amber-400/70 mt-1">Chaque artefact cree apparaitra ici — lance ta premiere mission.</p>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[
              { v: artifacts.length, l: "artefacts", icon: "🔨" },
              { v: xp, l: "XP total", icon: "⚡" },
              { v: unlockedZoneCount, l: `/${ZONES.length} zones`, icon: "🗺️" },
              { v: streak, l: "serie", icon: "🔥" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="text-center"
              >
                <div className="text-sm">{s.icon}</div>
                <div className="text-sm font-black text-amber-400">{s.v}</div>
                <div className="text-[8px] text-muted-foreground">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Level progress */}
        {nextLevel && (
          <div className="mt-4 pt-4 border-t border-border/20">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>Prochain palier : {nextLevel.icon} {nextLevel.name}</span>
              <span className="font-bold text-amber-400">{artifacts.length}/{nextLevel.min}</span>
            </div>
            <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((artifacts.length / nextLevel.min) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/40"
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* Zone exploration progress */}
      <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-md)" }}>
        <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Exploration des zones</p>
        <div className="space-y-2">
          {ZONES.map(zone => {
            const status = zoneStatus[zone.id];
            return (
              <div key={zone.id} className="flex items-center gap-3">
                <span className="text-lg w-7 text-center">{status.unlocked ? zone.icon : "🔒"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${status.unlocked ? "" : "text-muted-foreground/50"}`}>
                      {zone.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {status.rooms.filter(r => r.unlocked).length}/{status.rooms.length}
                    </span>
                  </div>
                  <div className="h-1 bg-secondary/40 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500/40 transition-all duration-500"
                      style={{ width: `${status.progress * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 text-center">
          <span className="text-[10px] text-muted-foreground">
            {unlockedRooms}/{totalRooms} salles explorees
          </span>
        </div>
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 ? (
        <div className="room-3d rounded-2xl p-4" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Trophees</p>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((bid, i) => {
              const badge = CREATION_BADGES.find(b => b.id === bid);
              return (
                <motion.div
                  key={bid}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5"
                >
                  <span className="text-sm">{badge?.emoji || "🏆"}</span>
                  <span className="text-[10px] font-bold text-amber-400">{badge?.label || bid}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="room-3d rounded-2xl p-5 text-center" style={{ boxShadow: "var(--shadow-3d-sm)" }}>
          <span className="text-3xl mb-2 block">🏆</span>
          <p className="text-xs text-muted-foreground">Tes premiers trophees apparaitront ici</p>
          <p className="text-[10px] text-amber-400/60 mt-1">Cree des artefacts pour debloquer des badges</p>
        </div>
      )}
    </div>
  );
}
