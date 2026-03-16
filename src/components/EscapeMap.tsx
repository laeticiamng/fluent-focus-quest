import { motion } from "framer-motion";
import { Lock, Sparkles, Shield, CheckCircle2 } from "lucide-react";
import { ESCAPE_ZONES, ZONE_COLORS } from "@/data/escapeGame";
import type { RoomStatus } from "@/data/escapeGame";
import type { Artifact } from "@/hooks/useProgress";
import { ZoneBuilding3D } from "./immersive/ZoneBuilding3D";
import { AtmosphericSceneWrapper } from "./immersive/AtmosphericSceneWrapper";
import { TotemPedagogique } from "./immersive/TotemPedagogique";

interface EscapeMapProps {
  escapeZoneStatus: Record<string, {
    unlocked: boolean;
    roomsSolved: number;
    totalRooms: number;
    progress: number;
    rooms: Array<{ id: string; status: RoomStatus; progress: number }>;
  }>;
  artifacts: Artifact[];
  onNavigate: (tab: string) => void;
  sigilsCollected: string[];
}

export function EscapeMap({ escapeZoneStatus, artifacts, onNavigate, sigilsCollected }: EscapeMapProps) {
  const totalRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const solvedRooms = Object.values(escapeZoneStatus).reduce((a, z) => a + z.roomsSolved, 0);

  return (
    <AtmosphericSceneWrapper atmosphere="neutral" intensity="medium">
      <div className="space-y-6">
        {/* Header — Immersive map banner */}
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-6 sm:p-8 room-3d"
          style={{
            background: "linear-gradient(145deg, hsl(32 95% 55% / 0.08), hsl(var(--card)), hsl(var(--primary) / 0.05))",
            border: "1px solid hsl(32 95% 55% / 0.15)",
            boxShadow: "var(--shadow-3d-lg), 0 0 60px -16px hsl(32 95% 55% / 0.15)",
          }}
        >
          {/* Background depth layers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-60 h-60 bg-amber-500/[0.04] blur-[60px] rounded-full -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/[0.04] blur-[40px] rounded-full translate-x-1/4 translate-y-1/4" />
          </div>
          {/* Top highlight */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotateY: [0, 10, -10, 0], y: [0, -3, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="door-icon-3d w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-3xl"
                  style={{ boxShadow: "var(--shadow-3d-md)" }}
                >🗺️</motion.div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">Carte du Complexe</h2>
                  <p className="text-[10px] text-muted-foreground">Protocole Lazarus — Exploration</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5"
                style={{ boxShadow: "0 0 12px -4px hsl(32 95% 55% / 0.2)" }}>
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">{sigilsCollected.length}/6</span>
              </div>
            </div>

            {/* Progress bar with glow tip */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 bg-secondary/40 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(solvedRooms / totalRooms) * 100}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500/70 to-success/50 relative"
                >
                  {solvedRooms > 0 && solvedRooms < totalRooms && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400/30 blur-[4px]" />
                  )}
                </motion.div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">
                {solvedRooms}/{totalRooms} salles
              </span>
            </div>
          </div>
        </motion.div>

        {/* Competence totems row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex justify-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide py-2"
        >
          <TotemPedagogique type="vocabulaire" size="sm" />
          <TotemPedagogique type="grammaire" size="sm" />
          <TotemPedagogique type="entretien" size="sm" />
          <TotemPedagogique type="clinique" size="sm" />
          <TotemPedagogique type="creation" size="sm" />
          <TotemPedagogique type="archive" size="sm" />
        </motion.div>

        {/* Zone buildings — connected path with depth */}
        <div className="relative path-connector">
          <div className="space-y-5">
            {ESCAPE_ZONES.map((zone, zIdx) => {
              const zoneStatus = escapeZoneStatus[zone.id];
              if (!zoneStatus) return null;
              return (
                <ZoneBuilding3D
                  key={zone.id}
                  zone={zone}
                  status={zoneStatus}
                  artifacts={artifacts}
                  onNavigate={onNavigate}
                  zoneIndex={zIdx}
                />
              );
            })}
          </div>
        </div>

        {/* Legend — 3D card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl p-4 room-3d"
          style={{
            background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
            border: "1px solid hsl(var(--border) / 0.4)",
          }}
        >
          <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Legende</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: <Lock className="w-3 h-3" />, label: "Verrouille", desc: "Resous les salles precedentes", cls: "room-locked" },
              { icon: <Sparkles className="w-3 h-3 text-primary" />, label: "Accessible", desc: "Prete a etre resolue", cls: "room-accessible" },
              { icon: <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Sparkles className="w-3 h-3 text-amber-400" /></motion.div>, label: "En cours", desc: "Progression commencee", cls: "room-in-progress" },
              { icon: <CheckCircle2 className="w-3 h-3 text-success" />, label: "Resolue", desc: "Fragment obtenu", cls: "room-solved" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className={`w-6 h-6 rounded-lg flex justify-center items-center shrink-0 ${item.cls}`}
                  style={{ boxShadow: "var(--shadow-3d-sm)" }}>
                  {item.icon}
                </div>
                <div>
                  <span className="font-bold text-foreground/70">{item.label}</span>
                  <span className="text-muted-foreground/60"> — {item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AtmosphericSceneWrapper>
  );
}
