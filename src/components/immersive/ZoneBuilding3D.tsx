import { motion } from "framer-motion";
import { Lock, Shield } from "lucide-react";
import { ZONE_COLORS } from "@/data/escapeGame";
import { RoomCard3D } from "./RoomCard3D";
import type { EscapeZone, EscapeRoom, RoomStatus } from "@/data/escapeGame";
import type { Artifact } from "@/hooks/useProgress";
import { computeRoomProgress, ZONE_TAB_MAP } from "@/data/escapeGame";

interface ZoneBuilding3DProps {
  zone: EscapeZone;
  status: {
    unlocked: boolean;
    roomsSolved: number;
    totalRooms: number;
    progress: number;
    rooms: Array<{ id: string; status: RoomStatus; progress: number }>;
  };
  artifacts: Artifact[];
  onNavigate: (tab: string) => void;
  zoneIndex: number;
}

export function ZoneBuilding3D({ zone, status, artifacts, onNavigate, zoneIndex }: ZoneBuilding3DProps) {
  const colors = ZONE_COLORS[zone.color] || ZONE_COLORS.amber;
  const isLocked = !status.unlocked;
  const isCleared = status.roomsSolved === status.totalRooms;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: -2 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: zoneIndex * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="perspective-card-3d"
    >
      <div className={`relative iso-building rounded-3xl p-5 sm:p-6 transition-all
        ${isLocked
          ? "opacity-40"
          : isCleared
          ? ""
          : ""
        }`}
        style={{
          background: isLocked
            ? "linear-gradient(145deg, hsl(225 14% 10%), hsl(225 14% 8%))"
            : isCleared
            ? `linear-gradient(145deg, hsl(var(--success) / 0.08), hsl(var(--card)))`
            : `linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))`,
          border: isLocked
            ? "1px solid hsl(225 14% 13%)"
            : isCleared
            ? "1px solid hsl(var(--success) / 0.2)"
            : `1px solid hsl(${zone.color === "amber" ? "32 95% 55%" :
                zone.color === "emerald" ? "152 60% 48%" :
                zone.color === "violet" ? "265 55% 62%" :
                zone.color === "rose" ? "350 65% 55%" :
                zone.color === "blue" ? "215 90% 58%" :
                zone.color === "cyan" ? "185 70% 48%" :
                "240 60% 55%"} / 0.2)`,
        }}
      >
        {/* Dynamic fog for locked zones */}
        {isLocked && (
          <div className="fog-3d absolute inset-0 rounded-3xl" />
        )}

        {/* Zone halo for accessible zones */}
        {!isLocked && !isCleared && (
          <div className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
            <div className="absolute -inset-4 opacity-30"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, hsl(${
                  zone.color === "amber" ? "32 95% 55%" :
                  zone.color === "emerald" ? "152 60% 48%" :
                  zone.color === "violet" ? "265 55% 62%" :
                  zone.color === "rose" ? "350 65% 55%" :
                  zone.color === "blue" ? "215 90% 58%" :
                  zone.color === "cyan" ? "185 70% 48%" :
                  "240 60% 55%"
                } / 0.12), transparent 70%)`,
              }}
            />
          </div>
        )}

        <div className={`relative ${isLocked ? "z-20" : "z-[3]"}`}>
          {/* Zone header */}
          <div className="flex items-center gap-3 mb-4">
            <motion.div
              animate={isLocked ? undefined : { rotateY: [0, 5, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className={`door-icon-3d w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                isLocked ? "bg-secondary/30 border border-border/20" :
                `bg-gradient-to-br ${colors.bg} border ${colors.border}`
              }`}
              style={{
                boxShadow: isLocked ? "var(--shadow-3d-sm)" :
                  isCleared ? "0 4px 12px -4px hsl(var(--success) / 0.3), var(--shadow-3d-md)" :
                  "var(--shadow-3d-md)",
              }}
            >
              {isLocked ? <Lock className="w-6 h-6 text-muted-foreground/40" /> : zone.icon}
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-black tracking-tight ${isLocked ? "text-muted-foreground/50" : ""}`}>
                  {zone.name}
                </span>
                {isCleared && (
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-success/15 text-success uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" /> Securisee
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                {isLocked ? `🔒 ${zone.unlockRequirement.details}` : zone.subtitle}
              </p>
            </div>

            {!isLocked && (
              <span className={`text-xs font-black ${colors.text}`}>
                {status.roomsSolved}/{status.totalRooms}
              </span>
            )}
          </div>

          {/* Room cards */}
          {!isLocked && (
            <div className="space-y-2.5">
              {zone.rooms.map((room, rIdx) => {
                const roomStatus = status.rooms.find(r => r.id === room.id);
                const rs = roomStatus?.status || "locked";
                const prog = computeRoomProgress(room, artifacts);
                const canNavigate = rs === "accessible" || rs === "in_progress" || rs === "solved";

                return (
                  <RoomCard3D
                    key={room.id}
                    name={room.name}
                    icon={room.icon}
                    status={rs}
                    challenge={room.challenge}
                    narrativeOnSolve={room.narrativeOnSolve}
                    unlockDetails={room.unlockRequirement.details}
                    progress={{ current: prog.current, threshold: prog.threshold, percentage: prog.percentage }}
                    rewardIcon={room.reward.icon}
                    colorText={colors.text}
                    colorGradient={colors.gradient}
                    onClick={() => { if (canNavigate) onNavigate(ZONE_TAB_MAP[zone.id] || "dash"); }}
                    delay={zoneIndex * 0.1 + rIdx * 0.05}
                  />
                );
              })}
            </div>
          )}

          {/* Zone progress bar with glow */}
          {!isLocked && (
            <div className="mt-4 relative">
              <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${status.progress * 100}%` }}
                  transition={{ duration: 1, delay: zoneIndex * 0.12, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r relative ${
                    isCleared ? "from-success/60 to-success/30" : colors.gradient
                  }`}
                >
                  {status.progress > 0 && status.progress < 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full blur-[3px]"
                      style={{ background: `hsl(${
                        zone.color === "amber" ? "32 95% 55%" :
                        zone.color === "emerald" ? "152 60% 48%" : "215 90% 58%"
                      } / 0.5)` }}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
