import { motion } from "framer-motion";
import { Lock, ChevronRight, Sparkles, Shield, Eye, CheckCircle2 } from "lucide-react";
import { ESCAPE_ZONES, ZONE_COLORS, computeRoomProgress, ZONE_TAB_MAP } from "@/data/escapeGame";
import type { RoomStatus } from "@/data/escapeGame";
import type { Artifact } from "@/hooks/useProgress";

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

const STATUS_ICONS: Record<RoomStatus, { icon: React.ReactNode; label: string; className: string }> = {
  undiscovered: { icon: <span className="text-xs">?</span>, label: "Non decouverte", className: "bg-secondary/20 border-border/10 opacity-30" },
  discovered: { icon: <Eye className="w-3 h-3" />, label: "Decouverte", className: "bg-secondary/30 border-border/20 opacity-60" },
  locked: { icon: <Lock className="w-3 h-3" />, label: "Verrouille", className: "bg-secondary/20 border-border/15 opacity-40" },
  accessible: { icon: <Sparkles className="w-3 h-3" />, label: "Accessible", className: "border-primary/30 bg-primary/10" },
  in_progress: { icon: <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Sparkles className="w-3 h-3" /></motion.div>, label: "En cours", className: "border-amber-500/30 bg-amber-500/10" },
  solved: { icon: <CheckCircle2 className="w-3 h-3" />, label: "Resolue", className: "border-success/30 bg-success/10" },
  secret: { icon: <span className="text-xs">?</span>, label: "Secrete", className: "bg-grammar/10 border-grammar/20" },
};

export function EscapeMap({ escapeZoneStatus, artifacts, onNavigate, sigilsCollected }: EscapeMapProps) {
  const totalRooms = ESCAPE_ZONES.reduce((a, z) => a + z.rooms.length, 0);
  const solvedRooms = Object.values(escapeZoneStatus).reduce((a, z) => a + z.roomsSolved, 0);
  const unlockedZones = Object.values(escapeZoneStatus).filter(z => z.unlocked).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/12 via-card to-primary/8 border border-amber-500/15 p-5 sm:p-6">
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="text-3xl"
              >🗺️</motion.div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">Carte du Complexe</h2>
                <p className="text-[10px] text-muted-foreground">Protocole Lazarus — Exploration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400">{sigilsCollected.length}/6</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-secondary/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(solvedRooms / totalRooms) * 100}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-amber-500/70 to-success/50"
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">
              {solvedRooms}/{totalRooms} salles
            </span>
          </div>
        </div>
      </div>

      {/* Zone grid — connected path */}
      <div className="relative">
        {/* Vertical connection line */}
        <div className="absolute left-7 top-12 bottom-12 w-0.5 bg-gradient-to-b from-amber-500/30 via-border/20 to-border/10" />

        <div className="space-y-4">
          {ESCAPE_ZONES.map((zone, zIdx) => {
            const status = escapeZoneStatus[zone.id];
            if (!status) return null;
            const colors = ZONE_COLORS[zone.color] || ZONE_COLORS.amber;
            const isLocked = !status.unlocked;
            const isCleared = status.roomsSolved === status.totalRooms;

            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: zIdx * 0.08 }}
              >
                <div
                  className={`relative rounded-2xl p-4 sm:p-5 transition-all ${
                    isLocked
                      ? "opacity-40 bg-secondary/15 border border-border/10"
                      : isCleared
                      ? `bg-gradient-to-r from-success/10 to-success/5 border border-success/20`
                      : `bg-gradient-to-r ${colors.bg} border ${colors.border}`
                  }`}
                >
                  {/* Fog overlay for locked zones */}
                  {isLocked && (
                    <div className="absolute inset-0 rounded-2xl backdrop-blur-[1px] bg-background/20 z-10" />
                  )}

                  <div className={`relative ${isLocked ? 'z-20' : 'z-0'}`}>
                    {/* Zone header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        isLocked ? "bg-secondary border border-border/30" :
                        `bg-gradient-to-br ${colors.bg} border ${colors.border}`
                      }`}>
                        {isLocked ? <Lock className="w-5 h-5 text-muted-foreground/40" /> : zone.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-black tracking-tight ${isLocked ? "text-muted-foreground/50" : ""}`}>
                            {zone.name}
                          </span>
                          {isCleared && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success uppercase tracking-wider">
                              Securisee
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

                    {/* Room chips */}
                    {!isLocked && (
                      <div className="space-y-2">
                        {zone.rooms.map((room, rIdx) => {
                          const roomStatus = status.rooms.find(r => r.id === room.id);
                          const rs = roomStatus?.status || "locked";
                          const statusInfo = STATUS_ICONS[rs];
                          const prog = computeRoomProgress(room, artifacts);
                          const canNavigate = rs === "accessible" || rs === "in_progress" || rs === "solved";

                          return (
                            <motion.button
                              key={room.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: zIdx * 0.08 + rIdx * 0.04 }}
                              whileHover={canNavigate ? { x: 4 } : undefined}
                              onClick={() => {
                                if (canNavigate) onNavigate(ZONE_TAB_MAP[zone.id] || "dash");
                              }}
                              disabled={!canNavigate}
                              className={`w-full rounded-xl border p-3 text-left transition-all flex items-center gap-3 group ${statusInfo.className} ${
                                canNavigate ? "cursor-pointer hover:border-opacity-60" : "cursor-default"
                              }`}
                            >
                              {/* Status indicator */}
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                rs === "solved" ? "text-success" :
                                rs === "in_progress" ? "text-amber-400" :
                                rs === "accessible" ? colors.text :
                                "text-muted-foreground/40"
                              }`}>
                                {rs === "solved" ? <CheckCircle2 className="w-4 h-4" /> :
                                 rs === "locked" ? <Lock className="w-3.5 h-3.5" /> :
                                 <span className="text-base">{room.icon}</span>}
                              </div>

                              {/* Room info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[11px] font-bold ${
                                    rs === "solved" ? "text-success" :
                                    rs === "locked" ? "text-muted-foreground/50" :
                                    ""
                                  }`}>
                                    {room.name}
                                  </span>
                                  {rs === "in_progress" && (
                                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 animate-pulse">
                                      EN COURS
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-muted-foreground mt-0.5">
                                  {rs === "locked" ? room.unlockRequirement.details :
                                   rs === "solved" ? room.narrativeOnSolve.slice(0, 60) + "..." :
                                   room.challenge}
                                </p>
                                {/* Progress bar for accessible/in_progress rooms */}
                                {(rs === "accessible" || rs === "in_progress") && (
                                  <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${prog.percentage}%` }}
                                        className={`h-full rounded-full bg-gradient-to-r ${colors.gradient}`}
                                      />
                                    </div>
                                    <span className="text-[9px] font-bold text-muted-foreground">
                                      {prog.current}/{prog.threshold}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Reward indicator */}
                              {rs === "solved" && (
                                <span className="text-base">{room.reward.icon}</span>
                              )}
                              {canNavigate && rs !== "solved" && (
                                <ChevronRight className={`w-4 h-4 ${colors.text} opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`} />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    )}

                    {/* Zone progress bar */}
                    {!isLocked && (
                      <div className="mt-3 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${status.progress * 100}%` }}
                          transition={{ duration: 0.8, delay: zIdx * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${
                            isCleared ? "from-success/60 to-success/30" : colors.gradient
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="card-elevated rounded-2xl p-4"
      >
        <p className="text-[10px] uppercase tracking-[3px] text-muted-foreground mb-3">Legende</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <Lock className="w-3 h-3" />, label: "Verrouillee", desc: "Resous les salles precedentes" },
            { icon: <Sparkles className="w-3 h-3 text-primary" />, label: "Accessible", desc: "Prete a etre resolue" },
            { icon: <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}><Sparkles className="w-3 h-3 text-amber-400" /></motion.div>, label: "En cours", desc: "Progression commencee" },
            { icon: <CheckCircle2 className="w-3 h-3 text-success" />, label: "Resolue", desc: "Fragment obtenu" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <div className="w-5 flex justify-center shrink-0">{item.icon}</div>
              <div>
                <span className="font-bold text-foreground/70">{item.label}</span>
                <span className="text-muted-foreground/60"> — {item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
