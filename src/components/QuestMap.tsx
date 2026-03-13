import { motion, AnimatePresence } from "framer-motion";
import { Lock, ChevronRight, Sparkles } from "lucide-react";
import { ZONES, type ZoneId } from "@/hooks/useProgress";

interface QuestMapProps {
  zoneStatus: Record<ZoneId, { unlocked: boolean; progress: number; rooms: { id: string; unlocked: boolean }[] }>;
  currentZoneId: ZoneId;
  onSelectZone: (zoneId: ZoneId) => void;
  onNavigate: (tab: string) => void;
}

const ZONE_TAB_MAP: Record<ZoneId, string> = {
  forge: "vocab",
  grammar: "gram",
  studio: "iv",
  clinical: "sim",
  atelier: "atelier",
  archive: "portfolio",
};

const ZONE_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  amber: { bg: "from-amber-500/15 to-amber-500/5", border: "border-amber-500/25", text: "text-amber-400", glow: "shadow-amber-500/20" },
  grammar: { bg: "from-emerald-500/15 to-emerald-500/5", border: "border-emerald-500/25", text: "text-emerald-400", glow: "shadow-emerald-500/20" },
  accent: { bg: "from-violet-500/15 to-violet-500/5", border: "border-violet-500/25", text: "text-violet-400", glow: "shadow-violet-500/20" },
  clinical: { bg: "from-rose-500/15 to-rose-500/5", border: "border-rose-500/25", text: "text-rose-400", glow: "shadow-rose-500/20" },
  primary: { bg: "from-blue-500/15 to-blue-500/5", border: "border-blue-500/25", text: "text-blue-400", glow: "shadow-blue-500/20" },
  info: { bg: "from-cyan-500/15 to-cyan-500/5", border: "border-cyan-500/25", text: "text-cyan-400", glow: "shadow-cyan-500/20" },
};

export function QuestMap({ zoneStatus, currentZoneId, onSelectZone, onNavigate }: QuestMapProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🗺️</span>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Carte des Quetes</h2>
          <p className="text-xs text-muted-foreground">
            {Object.values(zoneStatus).filter(z => z.unlocked).length}/{ZONES.length} zones debloquees
          </p>
        </div>
      </div>

      {/* Zone path — vertical connected nodes */}
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border/40" />

        <div className="space-y-3">
          {ZONES.map((zone, i) => {
            const status = zoneStatus[zone.id];
            const colors = ZONE_COLORS[zone.color] || ZONE_COLORS.amber;
            const isCurrent = currentZoneId === zone.id;
            const isLocked = !status.unlocked;

            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <button
                  onClick={() => {
                    if (!isLocked) {
                      onSelectZone(zone.id);
                      onNavigate(ZONE_TAB_MAP[zone.id]);
                    }
                  }}
                  disabled={isLocked}
                  className={`w-full relative rounded-2xl p-4 text-left transition-all group ${
                    isLocked
                      ? "opacity-50 cursor-not-allowed bg-secondary/30 border border-border/20"
                      : isCurrent
                      ? `bg-gradient-to-r ${colors.bg} border ${colors.border} shadow-lg ${colors.glow}`
                      : `bg-gradient-to-r ${colors.bg} border border-border/30 hover:${colors.border} hover:shadow-md`
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Zone icon node */}
                    <div className={`relative z-10 w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-110 ${
                      isLocked ? "bg-secondary border border-border/40" :
                      isCurrent ? `bg-gradient-to-br ${colors.bg} border ${colors.border}` :
                      "bg-card border border-border/40"
                    }`}>
                      {isLocked ? <Lock className="w-5 h-5 text-muted-foreground/50" /> : zone.icon}
                      {isCurrent && !isLocked && (
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute -top-1 -right-1"
                        >
                          <Sparkles className={`w-4 h-4 ${colors.text}`} />
                        </motion.div>
                      )}
                    </div>

                    {/* Zone info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black tracking-tight ${isLocked ? "text-muted-foreground" : ""}`}>
                          {zone.name}
                        </span>
                        {!isLocked && status.progress === 1 && (
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-success/15 text-success">COMPLETE</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {isLocked ? zone.unlockHint : zone.description}
                      </p>

                      {/* Room progress */}
                      {!isLocked && (
                        <div className="flex gap-1.5 mt-2">
                          {status.rooms.map((room, ri) => {
                            const roomDef = zone.rooms[ri];
                            return (
                              <div
                                key={room.id}
                                className={`flex items-center gap-1 text-[9px] font-medium px-2 py-0.5 rounded-full ${
                                  room.unlocked
                                    ? `bg-background/50 ${colors.text}`
                                    : "bg-secondary/50 text-muted-foreground/50"
                                }`}
                                title={roomDef?.unlockHint || ""}
                              >
                                {room.unlocked ? roomDef?.icon : <Lock className="w-2.5 h-2.5" />}
                                <span>{roomDef?.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    {!isLocked && (
                      <ChevronRight className={`w-5 h-5 shrink-0 transition-transform group-hover:translate-x-1 ${colors.text} opacity-50 group-hover:opacity-100`} />
                    )}
                  </div>

                  {/* Progress bar */}
                  {!isLocked && (
                    <div className="mt-3 h-1 bg-secondary/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${status.progress * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${colors.bg.replace("/15", "/60").replace("/5", "/30")}`}
                      />
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
